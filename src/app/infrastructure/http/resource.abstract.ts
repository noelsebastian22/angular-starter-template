import { inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  body?: unknown;
  params?:
    | HttpParams
    | Record<string, string | number | boolean | null | undefined>;
  headers?: HttpHeaders | Record<string, string>;
}

export abstract class ResourceService<TModel = unknown> {
  protected readonly http = inject(HttpClient);
  protected readonly baseUrl = stripTrailingSlash(environment.apiUrl);

  /**
   * @param resourcePath path segment for this resource (e.g. 'users', 'auth/sessions')
   * @param commonHeaders default headers applied to every request from this service
   */
  protected constructor(
    protected readonly resourcePath: string,
    private readonly commonHeaders?: Record<string, string>,
  ) {}

  // ---------- CRUD helpers ----------

  list<T = TModel>(options: RequestOptions = {}): Observable<T[]> {
    return this.request<T[]>('GET', this.url(), {
      ...options,
      body: undefined,
    });
  }

  getById<T = TModel>(
    id: string | number,
    options: RequestOptions = {},
  ): Observable<T> {
    return this.request<T>('GET', this.url(id), {
      ...options,
      body: undefined,
    });
  }

  create<T = TModel>(
    body: unknown,
    options: RequestOptions = {},
  ): Observable<T> {
    return this.request<T>('POST', this.url(), { ...options, body });
  }

  update<T = TModel>(
    id: string | number,
    body: unknown,
    options: RequestOptions = {},
  ): Observable<T> {
    return this.request<T>('PUT', this.url(id), { ...options, body });
  }

  patch<T = TModel>(
    id: string | number,
    body: unknown,
    options: RequestOptions = {},
  ): Observable<T> {
    return this.request<T>('PATCH', this.url(id), { ...options, body });
  }

  delete(id: string | number, options: RequestOptions = {}): Observable<void> {
    return this.request<void>('DELETE', this.url(id), {
      ...options,
      body: undefined,
    });
  }

  // ---------- Flexible request escape hatch ----------
  protected request<T>(
    method: HttpMethod,
    url: string,
    { body, params, headers }: RequestOptions,
  ): Observable<T> {
    const normalizedParams =
      params instanceof HttpParams
        ? params
        : params
          ? new HttpParams({ fromObject: coerceRecord(params) })
          : undefined;

    const mergedHeaders = this.mergeHeaders(headers);

    // No catchError/finalize here: interceptors/global handler will manage
    return this.http.request<T>(method, url, {
      body,
      params: normalizedParams,
      headers: mergedHeaders,
    });
  }

  /** Build `${baseUrl}/${resourcePath}/...segments` safely */
  protected url(...segments: (string | number)[]): string {
    const parts = [this.baseUrl, this.resourcePath, ...segments]
      .filter(
        (segment) =>
          segment !== null && segment !== undefined && segment !== '',
      )
      .map((s) => String(s).replace(/^\/+|\/+$/g, ''));
    return parts.join('/');
  }

  /** Merge class-level common headers with per-request headers (request overrides common) */
  private mergeHeaders(
    requestHeaders?: HttpHeaders | Record<string, string>,
  ): HttpHeaders {
    const all = {
      ...(this.commonHeaders || {}),
      ...(requestHeaders instanceof HttpHeaders
        ? headersToObject(requestHeaders)
        : requestHeaders || {}),
    };
    return new HttpHeaders(all);
  }
}

// ---------- helpers ----------
function stripTrailingSlash(s: string): string {
  return s.replace(/\/+$/, '');
}

function coerceRecord(
  r: Record<string, string | number | boolean | null | undefined>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(r)) {
    if (v == null) continue;
    out[k] = String(v);
  }
  return out;
}

function headersToObject(headers: HttpHeaders): Record<string, string> {
  const out: Record<string, string> = {};
  headers.keys().forEach((k) => {
    const v = headers.get(k);
    if (v != null) out[k] = v;
  });
  return out;
}
