import type { z } from 'zod';
import { serviceConfig } from '../config';
import { ApiError, toApiErrorCode } from '../errors';
import { apiErrorBodySchema } from '../schemas';

type QueryValue = string | number | boolean | undefined | null;

interface RequestOptions<S extends z.ZodTypeAny | undefined> {
  query?: Record<string, QueryValue>;
  body?: unknown;
  form?: FormData;
  schema?: S;
}

export function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
  }
  const qs = params.toString();
  return `${serviceConfig.apiBaseUrl}${path}${qs ? `?${qs}` : ''}`;
}

/**
 * fetch wrapper: base URL from serviceConfig, JSON in/out, the session cookie (credentials:
 * 'include'), and the API error body mapped to ApiError. In development every response is parsed
 * with its Zod schema so contract drift shows up immediately.
 */
export async function request<S extends z.ZodTypeAny | undefined = undefined>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  opts: RequestOptions<S> = {},
): Promise<S extends z.ZodTypeAny ? z.infer<S> : void> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  let body: BodyInit | undefined;
  if (opts.form) body = opts.form;
  else if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.body);
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, opts.query), { method, headers, body, credentials: 'include' });
  } catch {
    throw new ApiError('NETWORK', "Can't reach the server. Check your connection.");
  }

  if (!res.ok) {
    const json: unknown = await res.json().catch(() => null);
    const parsed = apiErrorBodySchema.safeParse(json);
    if (parsed.success) {
      const { code, message, fields } = parsed.data.error;
      throw new ApiError(toApiErrorCode(code, res.status), message, fields);
    }
    throw new ApiError(toApiErrorCode('', res.status), `Request failed (${res.status}).`);
  }

  if (res.status === 204 || !opts.schema) return undefined as never;
  const data: unknown = await res.json();
  if (import.meta.env.DEV) {
    const check = opts.schema.safeParse(data);
    if (!check.success) {
      console.error(`[api] ${method} ${path} does not match docs/API.md`, check.error.issues);
      throw new ApiError('UNKNOWN', 'The server sent an unexpected response.');
    }
    return check.data;
  }
  return data as never;
}
