export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface RequestOptions {
  headers?: Record<string, any>;
  method?: RequestMethod;
  raw?: boolean;
  noCache?: boolean;
  parse?: boolean;
}
