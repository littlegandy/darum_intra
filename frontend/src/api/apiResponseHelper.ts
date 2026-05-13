import type { AxiosResponse } from 'axios';
import type { ApiResponse } from '../types';

export const unwrapResponseData = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  const data = response.data.data;
  if (data === undefined) {
    throw new Error('API response missing data');
  }
  return data;
};
