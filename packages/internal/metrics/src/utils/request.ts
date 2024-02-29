import axios from 'axios';

const IMTBL_API = 'https://api.immutable.com';

export async function post<T = any>(path: string, data: any) {
  const client = axios.create({
    baseURL: IMTBL_API,
  });
  const payload = JSON.stringify(data);
  const body = {
    payload: btoa(payload),
  };

  const response = await client.post<T>(path, body);
  return response.data as T;
}
