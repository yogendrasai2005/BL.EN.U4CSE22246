import { useState, useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { getStocks, getStockPrice } from '../services/api';
import CorrelationHeatmap from '../components/CorrelationHeatmap';
import TimeIntervalSelector from '../components/TimeIntervalSelector';
import { Stock, StockPrice, CorrelationData, Stats } from '../types';

const calculateCorrelation = (prices1: StockPrice[], prices2: StockPrice[]): number => {
  if (prices1.length === 0 || prices2.length === 0 || prices1.length !== prices2.length) {
    return 0; // Return 0 if insufficient data or mismatched lengths
  }

  // Calculate means
  const mean1 = prices1.reduce((sum, p) => sum + p.price, 0) / prices1.length;
  const mean2 = prices2.reduce((sum, p) => sum + p.price, 0) / prices2.length;

  // Calculate covariance and standard deviations
  let cov = 0;
  let var1 =0;
  let var2 = 0;
  for (let i = 0; i < prices1.length; i++) {
    const diff1 = prices1[i].price - mean1;
    const diff2 = prices2[i].price - mean2;
    cov += diff1 * diff2;
    var1 += diff1 * diff1;
    var2 += diff2 * diff2;
  }

  cov = cov / (prices1.length - 1);
  const stdDev1 = Math.sqrt(var1 / (prices1.length - 1));
  const stdDev2 = Math.sqrt(var2 / (prices1.length - 1));

  // Calculate Pearson's Correlation Coefficient
  return stdDev1 === 0 || stdDev2 === 0 ? 0 : cov / (stdDev1 * stdDev2);
};

const HeatmapPage: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [correlations, setCorrelations] = useState<CorrelationData[]>([]);
  const [stats, setStats] = useState<{ [ticker: string]: Stats }>({});
  const [minutes, setMinutes] = useState<number>(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stock list
        const response = await getStocks();
        const stockList = Object.entries(response.stocks).map(([name, ticker]) => ({
          name,
          ticker,
        }));
        setStocks(stockList);

        const correlations: CorrelationData[] = [];
        const stats: { [ticker: string]: Stats } = {};

        // Fetch prices and calculate stats for each stock
        for (const stock1 of stockList) {
          const prices1 = await getStockPrice(stock1.ticker, minutes);
          // Ensure priceList1 is an array of StockPrice
          const priceList1: StockPrice[] = Array.isArray(prices1)
            ? prices1.filter((p): p is StockPrice => p !== undefined)
            : prices1.stock
            ? [prices1.stock]
            : [];

          if (priceList1.length === 0) continue; // Skip if no valid prices

          // Calculate average
          const average = priceList1.reduce((sum: number, p: StockPrice) => sum + p.price, 0) / priceList1.length;

          // Calculate standard deviation
          const variance = priceList1.reduce(
            (sum: number, p: StockPrice) => sum + Math.pow(p.price - average, 2),
            0
          ) / (priceList1.length - 1);
          const stdDev = Math.sqrt(variance);

          stats[stock1.ticker] = { average, stdDev };

          // Calculate correlations with other stocks
          for (const stock2 of stockList) {
            if (stock1.ticker < stock2.ticker) {
              const prices2 = await getStockPrice(stock2.ticker, minutes);
              // Ensure priceList2 is an array of StockPrice
              const priceList2: StockPrice[] = Array.isArray(prices2)
                ? prices2.filter((p): p is StockPrice => p !== undefined)
                : prices2.stock
                ? [prices2.stock]
                : [];

              if (priceList2.length === 0) continue; // Skip if no valid prices

              const correlation = calculateCorrelation(priceList1, priceList2);
              correlations.push({
                ticker1: stock1.ticker,
                ticker2: stock2.ticker,
                correlation,
              });
            }
          }
        }

        setCorrelations(correlations);
        setStats(stats);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [minutes]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Correlation Heatmap
      </Typography>
      <Box sx={{ mb: 2 }}>
        <TimeIntervalSelector onIntervalChange={setMinutes} />
      </Box>
      <Typography variant="body1" gutterBottom>
        Stocks Analyzed: {stocks.map((stock) => stock.name).join(', ')}
      </Typography>
      <CorrelationHeatmap correlations={correlations} stats={stats} />
    </Container>
  );
};

export default HeatmapPage;


// import { useState, useEffect } from 'react';
// import { Container, Typography } from '@mui/material';
// import { getStocks, getStockPrice } from '../services/api';
// import CorrelationHeatmap from '../components/CorrelationHeatmap';
// import { Stock, StockPrice, CorrelationData, Stats } from '../types';

// const calculateCorrelation = (prices1: StockPrice[], prices2: StockPrice[]): number => {
//   if (prices1.length === 0 || prices2.length === 0 || prices1.length !== prices2.length) {
//     return 0; // Return 0 if insufficient data or mismatched lengths
//   }

//   // Calculate means
//   const mean1 = prices1.reduce((sum, p) => sum + p.price, 0) / prices1.length;
//   const mean2 = prices2.reduce((sum, p) => sum + p.price, 0) / prices2.length;

//   // Calculate covariance and standard deviations
//   let cov = 0;
//   let var1 = 0;
//   let var2 = 0;
//   for (let i = 0; i < prices1.length; i++) {
//     const diff1 = prices1[i].price - mean1;
//     const diff2 = prices2[i].price - mean2;
//     cov += diff1 * diff2;
//     var1 += diff1 * diff1;
//     var2 += diff2 * diff2;
//   }

//   cov = cov / (prices1.length - 1);
//   const stdDev1 = Math.sqrt(var1 / (prices1.length - 1));
//   const stdDev2 = Math.sqrt(var2 / (prices1.length - 1));

//   // Calculate Pearson's Correlation Coefficient
//   return stdDev1 === 0 || stdDev2 === 0 ? 0 : cov / (stdDev1 * stdDev2);
// };

// const HeatmapPage: React.FC = () => {
//   const [stocks, setStocks] = useState<Stock[]>([]);
//   const [correlations, setCorrelations] = useState<CorrelationData[]>([]);
//   const [stats, setStats] = useState<{ [ticker: string]: Stats }>({});
//   const [minutes, setMinutes] = useState<number>(10);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch stock list
//         const response = await getStocks();
//         const stockList = Object.entries(response.stocks).map(([name, ticker]) => ({
//           name,
//           ticker,
//         }));
//         setStocks(stockList);

//         const correlations: CorrelationData[] = [];
//         const stats: { [ticker: string]: Stats } = {};

//         // Fetch prices and calculate stats for each stock
//         for (const stock1 of stockList) {
//           const prices1 = await getStockPrice(stock1.ticker, minutes);
//           // Ensure priceList1 is an array of StockPrice
//           const priceList1: StockPrice[] = Array.isArray(prices1)
//             ? prices1.filter((p): p is StockPrice => p !== undefined)
//             : prices1.stock
//             ? [prices1.stock]
//             : [];

//           if (priceList1.length === 0) continue; // Skip if no valid prices

//           // Calculate average
//           const average = priceList1.reduce((sum: number, p: StockPrice) => sum + p.price, 0) / priceList1.length;

//           // Calculate standard deviation
//           const variance = priceList1.reduce(
//             (sum: number, p: StockPrice) => sum + Math.pow(p.price - average, 2),
//             0
//           ) / (priceList1.length - 1);
//           const stdDev = Math.sqrt(variance);

//           stats[stock1.ticker] = { average, stdDev };

//           // Calculate correlations with other stocks
//           for (const stock2 of stockList) {
//             if (stock1.ticker < stock2.ticker) {
//               const prices2 = await getStockPrice(stock2.ticker, minutes);
//               // Ensure priceList2 is an array of StockPrice
//               const priceList2: StockPrice[] = Array.isArray(prices2)
//                 ? prices2.filter((p): p is StockPrice => p !== undefined)
//                 : prices2.stock
//                 ? [prices2.stock]
//                 : [];

//               if (priceList2.length === 0) continue; // Skip if no valid prices

//               const correlation = calculateCorrelation(priceList1, priceList2);
//               correlations.push({
//                 ticker1: stock1.ticker,
//                 ticker2: stock2.ticker,
//                 correlation,
//               });
//             }
//           }
//         }

//         setCorrelations(correlations);
//         setStats(stats);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       }
//     };
//     fetchData();
//   }, [minutes]);

//   return (
//     <Container>
//       <Typography variant="h4" gutterBottom>
//         Correlation Heatmap
//       </Typography>
//       <CorrelationHeatmap correlations={correlations} stats={stats} />
//     </Container>
//   );
// };

// export default HeatmapPage;

// // import { useState, useEffect } from 'react';
// // import { Container, Typography } from '@mui/material';
// // import { getStocks, getStockPrice } from '../services/api';
// // import CorrelationHeatmap from '../components/CorrelationHeatmap';
// // import { Stock, StockPrice, CorrelationData, Stats } from '../types';

// // const calculateCorrelation = (prices1: StockPrice[], prices2: StockPrice[]): number => {
// //   // Implement Pearson's Correlation Coefficient formula
// //   // cov(X,Y) / (σ_X * σ_Y)
// //   return 0; // Placeholder
// // };

// // const HeatmapPage: React.FC = () => {
// //   const [stocks, setStocks] = useState<Stock[]>([]);
// //   const [correlations, setCorrelations] = useState<CorrelationData[]>([]);
// //   const [stats, setStats] = useState<{ [ticker: string]: Stats }>({});
// //   const [minutes, setMinutes] = useState<number>(10);

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       const response = await getStocks();
// //       const stockList = Object.entries(response.stocks).map(([name, ticker]) => ({
// //         name,
// //         ticker,
// //       }));
// //       setStocks(stockList);

// //       const correlations: CorrelationData[] = [];
// //       const stats: { [ticker: string]: Stats } = {};

// //       for (const stock1 of stockList) {
// //         const prices1 = await getStockPrice(stock1.ticker, minutes);
// //         const priceList1 = Array.isArray(prices1) ? prices1 : [prices1.stock];
// //         stats[stock1.ticker] = {
// //           average: priceList1.reduce((sum, p) => sum + p.price, 0) / priceList1.length,
// //           stdDev: Math.sqrt(
// //             priceList1.reduce((sum, p) => sum + Math.pow(p.price - stats[stock1.ticker].average, 2), 0) /
// //               (priceList1.length - 1)
// //           ),
// //         };

// //         for (const stock2 of stockList) {
// //           if (stock1.ticker < stock2.ticker) {
// //             const prices2 = await getStockPrice(stock2.ticker, minutes);
// //             const priceList2 = Array.isArray(prices2) ? prices2 : [prices2.stock];
// //             const correlation = calculateCorrelation(
// //               priceList1.filter((p): p is StockPrice => p !== undefined),
// //               priceList2.filter((p): p is StockPrice => p !== undefined)
// //             );
// //             correlations.push({
// //               ticker1: stock1.ticker,
// //               ticker2: stock2.ticker,
// //               correlation,
// //             });
// //           }
// //         }
// //       }

// //       setCorrelations(correlations);
// //       setStats(stats);
// //     };
// //     fetchData();
// //   }, [minutes]);

// //   return (
// //     <Container>
// //       <Typography variant="h4" gutterBottom>
// //         Correlation Heatmap
// //       </Typography>
// //       <CorrelationHeatmap correlations={correlations} stats={stats} />
// //     </Container>
// //   );
// // };

// // export default HeatmapPage;