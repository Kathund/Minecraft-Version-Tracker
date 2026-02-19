import MinecraftVersionTrackerError from '../Error.js';
import RequestData from './RequestData.js';
import type Application from '../../Application.js';
import type { RequestOptions } from '../../Types/Requests.js';

class RequestHandler {
  readonly Application: Application;
  constructor(app: Application) {
    this.Application = app;
  }

  async request<T = any>(url: string, options?: RequestOptions & { parse?: true }): Promise<RequestData<T>>;
  async request(url: string, options: RequestOptions & { parse: false }): Promise<RequestData<Uint8Array>>;

  async request<T = any>(url: string, options?: RequestOptions): Promise<RequestData<T>> {
    options = {
      headers: options?.headers ?? {},
      method: options?.method ?? 'GET',
      raw: options?.raw ?? false,
      noCache: options?.noCache ?? false,
      parse: options?.parse ?? true
    };
    if (options.method === 'GET' && this.Application.cacheHandler.has(url)) {
      const data = this.Application.cacheHandler.get(url);
      return new RequestData<T>(data.data, data.headers, {
        status: 200,
        options,
        url,
        cached: true,
        timestamp: data.timestamp
      });
    }
    const res = await fetch(url, { method: options.method, headers: options.headers });
    if (res.status === 401) throw new MinecraftVersionTrackerError('Something is Unauthorized');
    if (res.status === 403) throw new MinecraftVersionTrackerError('Something is rate-limited please try again later');
    let responseData: any;
    if (options.parse) responseData = await res.json();
    else responseData = new Uint8Array(await res.arrayBuffer());
    const requestData = new RequestData<T>(responseData as T, res.headers, {
      status: res.status,
      options,
      url,
      cached: false
    });
    if (!options.noCache && options.raw !== false) this.Application.cacheHandler.set(url, requestData);
    return requestData;
  }
}

export default RequestHandler;
