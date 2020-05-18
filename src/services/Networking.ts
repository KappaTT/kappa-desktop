import { log } from '@services/logService';
import { TRequestResponse } from '@backend/backend';
import { castToString } from '@services/utils';

export const buildUrl = (baseUrl: string, port: string, endpoint: string, secure: boolean = true) => {
  let url = baseUrl;

  if (url === '' || url === 'localhost') {
    url = 'http://localhost';
    port = '3000';
  }

  if (!url.startsWith('http')) {
    url = secure ? `https://${url}` : `http://${url}`;
  }

  if (port) {
    url += `:${port}`;
  }

  if (!url.endsWith('/') && (!endpoint || !endpoint.startsWith('/'))) {
    url += '/';
  }

  if (endpoint) {
    url += endpoint;
  }

  return url;
};

export const attachQueryParams = (url: string, queryParams: any) => {
  if (!queryParams) {
    return url;
  }

  const keys = Object.keys(queryParams);

  if (keys.length > 0) {
    url +=
      (url.indexOf('?') === -1 ? '?' : '&') +
      keys
        .map(
          (key) =>
            encodeURIComponent(key) +
            '=' +
            (typeof queryParams[key] === 'object'
              ? castToString(queryParams[key])
              : encodeURIComponent(queryParams[key]))
        )
        .join('&');
  }

  return url;
};

export const jsonRequest = async <T>(
  baseUrl: string,
  port: string,
  endpoint: string,
  secure: boolean,
  method: string,
  headers: any,
  queryParams: any,
  body: any
): Promise<
  TRequestResponse & {
    data?: T;
    error?: {
      message: string;
    };
  }
> => {
  const url = attachQueryParams(buildUrl(baseUrl, port, endpoint, secure), queryParams);

  log(`Requesting via ${method}`, url);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        ...headers,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: body && JSON.stringify(body)
    });

    const data = await response.json();

    if (response.status === 200) {
      return {
        success: true,
        code: response.status,
        data
      };
    } else {
      return {
        success: true,
        code: response.status,
        data,
        error: data.error
      };
    }
  } catch (error) {
    return {
      success: false,
      error
    };
  }
};

export const jsonAuthorizedRequest = async <T>(
  baseUrl: string,
  port: string,
  endpoint: string,
  secure: boolean,
  token: string,
  method: string,
  headers: any,
  queryParams: any,
  body: any
) => {
  const authorization = `Bearer ${token}`;

  log('Attaching authorization', authorization);

  return jsonRequest<T>(
    baseUrl,
    port,
    endpoint,
    secure,
    method,
    {
      ...headers,
      Authorization: authorization
    },
    queryParams,
    body
  );
};
