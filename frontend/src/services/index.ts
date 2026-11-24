import { serviceConfig } from './config';
import type { Services } from './contracts';
import { httpServices } from './http';
import { mockServices, resetDb } from './mock';

/** The active services. Pages and hooks import only this; they never know which set is live. */
export const services: Services = serviceConfig.mode === 'mock' ? mockServices : httpServices;

/** "Reset demo data" (Settings, mock mode only). */
export const resetDemoData = (): void => {
  if (serviceConfig.mode === 'mock') resetDb();
};

export { serviceConfig } from './config';
export { ApiError, isApiError, errorMessage } from './errors';
export type * from './types';
