import MinecraftVersionTrackerError from '../Error.js';
import RequestData from './RequestData.js';
import type Application from '../../Application.js';
import type { RequestOptions } from '../../Types/Requests.js';

class RequestHandler {
  readonly Application: Application;
  constructor(app: Application) {
    this.Application = app;
  }

  async request(url: string, options?: RequestOptions): Promise<RequestData> {
    options = {
      headers: options?.headers ?? {},
      method: options?.method ?? 'GET',
      raw: options?.raw ?? false,
      noCache: options?.noCache ?? false,
      parse: options?.parse ?? true
    };
    if (options.method === 'GET' && this.Application.cacheHandler.has(url)) {
      const data = this.Application.cacheHandler.get(url);
      return new RequestData(data.data, data.headers, {
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
    const requestData = new RequestData({}, res.headers, { status: res.status, options, url, cached: false });
    if (options.parse) {
      const parsedRes = (await res.json()) as Record<string, any>;
      requestData.setData(parsedRes);
      if (options.noCache) return requestData;
      if (options.raw !== false) this.Application.cacheHandler.set(url, requestData);
    }
    return requestData;
  }
}

export default RequestHandler;
