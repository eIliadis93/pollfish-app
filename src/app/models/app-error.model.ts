export type ErrorKind = 'network' | 'server' | 'client' | 'unknown';

export interface AppError {
  id: string;
  operation: string;
  kind: ErrorKind;
  message: string;
  technicalMessage?: string;
  statusCode?: number;
  retried?: number;
  timestamp: number;
}
