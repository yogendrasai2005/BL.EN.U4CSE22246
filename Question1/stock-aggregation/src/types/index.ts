export interface Stock {
  name: string;
  ticker: string;
}

export interface StockPrice {
  price: number;
  lastUpdatedAt: string;
}

export interface StockPriceResponse {
  stock?: { price: number; lastUpdatedAt: string };
  prices?: StockPrice[];
}

export interface StocksResponse {
  stocks: { [key: string]: string };
}

export interface CorrelationData {
  ticker1: string;
  ticker2: string;
  correlation: number;
}

export interface Stats {
  average: number;
  stdDev: number;
}