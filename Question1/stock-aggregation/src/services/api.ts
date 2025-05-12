import axios, { AxiosInstance } from 'axios';
import { StocksResponse, StockPriceResponse } from '../types';

const API_BASE_URL = 'http://20.244.56.144/evaluation-service';
const CLIENT_ID = 'your-client-id'; // Replace with actual client ID
const CLIENT_SECRET = 'your-client-secret'; // Replace with actual client secret
const ACCESS_CODE = 'your-access-code'; // Replace with actual access code
const EMAIL = 'your-email@abc.edu';
const NAME = 'Your Name';
const ROLL_NO = 'your-roll-no';

let accessToken: string | null = null;

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

const getAuthToken = async () => {
  if (accessToken) return accessToken;
  const response = await api.post('/auth', {
    email: EMAIL,
    name: NAME,
    rollNo: ROLL_NO,
    accessCode: ACCESS_CODE,
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
  });
  accessToken = response.data.access_token;
  return accessToken;
};

api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Cache to minimize API calls
const cache: { [key: string]: { data: any; timestamp: number } } = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getStocks = async (): Promise<StocksResponse> => {
  const cacheKey = 'stocks';
  if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_DURATION) {
    return cache[cacheKey].data;
  }
  const response = await api.get('/stocks');
  cache[cacheKey] = { data: response.data, timestamp: Date.now() };
  return response.data;
};

export const getStockPrice = async (ticker: string, minutes?: number): Promise<StockPriceResponse> => {
  const cacheKey = `stock-${ticker}-${minutes || 'latest'}`;
  if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_DURATION) {
    return cache[cacheKey].data;
  }
  const url = minutes ? `/stocks/${ticker}?minutes=${minutes}` : `/stocks/${ticker}`;
  const response = await api.get(url);
  cache[cacheKey] = { data: response.data, timestamp: Date.now() };
  return response.data;
};