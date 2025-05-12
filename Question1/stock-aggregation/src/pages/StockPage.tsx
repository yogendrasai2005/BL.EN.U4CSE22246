import { useState, useEffect } from 'react';
import { Container, Typography, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { getStocks, getStockPrice } from '../services/api';
import StockChart from '../components/StockChart';
import TimeIntervalSelector from '../components/TimeIntervalSelector';
import { Stock, StockPrice } from '../types';

const StockPage: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [prices, setPrices] = useState<StockPrice[]>([]);
  const [average, setAverage] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(10);

  useEffect(() => {
    const fetchStocks = async () => {
      const response = await getStocks();
      const stockList = Object.entries(response.stocks).map(([name, ticker]) => ({
        name,
        ticker,
      }));
      setStocks(stockList);
      if (stockList.length > 0) setSelectedStock(stockList[0].ticker);
    };
    fetchStocks();
  }, []);

  useEffect(() => {
    if (!selectedStock) return;
    const fetchPrices = async () => {
      const response = await getStockPrice(selectedStock, minutes);
      const priceList = Array.isArray(response) ? response : [response.stock];
      const filteredPrices = priceList.filter((p): p is StockPrice => p !== undefined);
      setPrices(filteredPrices);
      const avg = filteredPrices.reduce((sum, p) => sum + p.price, 0) / (filteredPrices.length || 1);
      setAverage(avg);
    };
    fetchPrices();
  }, [selectedStock, minutes]);

  const handleIntervalChange = (minutes: number) => {
    setMinutes(minutes);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Stock Price Analytics
      </Typography>
      <Box sx={{ mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Stock</InputLabel>
          <Select
            value={selectedStock}
            onChange={(e) => setSelectedStock(e.target.value)}
            label="Stock"
          >
            {stocks.map((stock) => (
              <MenuItem key={stock.ticker} value={stock.ticker}>
                {stock.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TimeIntervalSelector onIntervalChange={handleIntervalChange} />
      </Box>
      {prices.length > 0 && <StockChart prices={prices} average={average} />}
    </Container>
  );
};

export default StockPage;