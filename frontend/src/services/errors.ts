export const API_ERROR_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION: 422,
  RATE_LIMITED: 429,
  UPSTREAM: 502,
  NETWORK: 0,
  UNKNOWN: 500,
} as const;

export type ApiErrorCode = keyof typeof API_ERROR_STATUS;

/** The one error type thrown by both the HTTP and the mock services. */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly fields?: Record<string, string>;

  constructor(code: ApiErrorCode, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = API_ERROR_STATUS[code];
    this.fields = fields;
  }
}

export function isApiError(e: unknown, code?: ApiErrorCode): e is ApiError {
  return e instanceof ApiError && (code === undefined || e.code === code);
}

export function toApiErrorCode(code: string, status: number): ApiErrorCode {
  if (code in API_ERROR_STATUS) return code as ApiErrorCode;
  const byStatus = Object.entries(API_ERROR_STATUS).find(([, s]) => s === status);
  return (byStatus?.[0] as ApiErrorCode | undefined) ?? 'UNKNOWN';
}

export function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return 'Something went wrong.';
}
