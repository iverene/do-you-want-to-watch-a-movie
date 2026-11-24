import type { ImportService } from '../contracts';
import { importConfirmSchema, importRowEnvelope, importRowsEnvelope } from '../schemas';
import { request } from './client';

export const importHttp: ImportService = {
  /** POST /import (multipart `file`) */
  upload: (file) => {
    const form = new FormData();
    form.set('file', file);
    return request('POST', '/import', { form, schema: importRowsEnvelope });
  },
  /** PATCH /import/rows/:id */
  updateRow: (id, body) => request('PATCH', `/import/rows/${id}`, { body, schema: importRowEnvelope }),
  /** POST /import/confirm */
  confirm: () => request('POST', '/import/confirm', { schema: importConfirmSchema }),
};
