import { api_request } from '@/api/request_provider';

export const request = (url, payload = {}) => api_request(url, payload);
