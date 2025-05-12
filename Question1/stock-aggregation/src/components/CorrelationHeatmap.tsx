import { useTheme, Box, Typography, Tooltip } from '@mui/material';
import { CorrelationData, Stats } from '../types';

interface CorrelationHeatmapProps {
  correlations: CorrelationData[];
  stats: { [ticker: string]: Stats };
}

const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({ correlations, stats }) => {
  const theme = useTheme();

  // Create a unique list of tickers from correlations
  const tickers = Array.from(
    new Set(correlations.flatMap((corr) => [corr.ticker1, corr.ticker2]))
  );

  // Create a matrix for rendering (for a square heatmap)
  const correlationMatrix = tickers.map((ticker1) =>
    tickers.map((ticker2) => {
      if (ticker1 === ticker2) return 1; // Self-correlation is 1
      const corr = correlations.find(
        (c) =>
          (c.ticker1 === ticker1 && c.ticker2 === ticker2) ||
          (c.ticker1 === ticker2 && c.ticker2 === ticker1)
      );
      return corr ? corr.correlation : 0;
    })
  );

  return (
    <Box sx={{ padding: theme.spacing(2), backgroundColor: theme.palette.background.paper }}>
      <Typography variant="h6" gutterBottom>
        Stock Correlation Heatmap
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${tickers.length}, 60px)`,
          gap: theme.spacing(0.5),
          position: 'relative',
        }}
      >
        {/* Header Row */}
        <Box sx={{ gridColumn: 1, gridRow: 1 }} />
        {tickers.map((ticker, index) => (
          <Typography
            key={ticker}
            variant="caption"
            sx={{
              gridColumn: index + 2,
              gridRow: 1,
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            {ticker}
          </Typography>
        ))}
        {/* Header Column */}
        {tickers.map((ticker, index) => (
          <Typography
            key={ticker}
            variant="caption"
            sx={{
              gridColumn: 1,
              gridRow: index + 2,
              textAlign: 'right',
              fontWeight: 'bold',
              paddingRight: theme.spacing(1),
            }}
          >
            {ticker}
          </Typography>
        ))}
        {/* Heatmap Cells */}
        {correlationMatrix.map((row, rowIndex) =>
          row.map((correlation, colIndex) => (
            <Tooltip
              key={`${tickers[rowIndex]}-${tickers[colIndex]}`}
              title={
                <Box>
                  <Typography variant="body2">{`${tickers[rowIndex]} vs ${tickers[colIndex]}`}</Typography>
                  <Typography variant="body2">{`Correlation: ${correlation.toFixed(2)}`}</Typography>
                  <Typography variant="body2">{`Avg ${tickers[rowIndex]}: ${stats[tickers[rowIndex]]?.average.toFixed(2)}`}</Typography>
                  <Typography variant="body2">{`StdDev ${tickers[rowIndex]}: ${stats[tickers[rowIndex]]?.stdDev.toFixed(2)}`}</Typography>
                </Box>
              }
            >
              <Box
                sx={{
                  gridColumn: colIndex + 2,
                  gridRow: rowIndex + 2,
                  backgroundColor: `hsl(${correlation * 120 + 120}, 70%, 50%)`, // Blue (+1) to Red (-1)
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.palette.getContrastText(theme.palette.background.paper),
                  borderRadius: theme.shape.borderRadius,
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              >
                {correlation.toFixed(2)}
              </Box>
            </Tooltip>
          ))
        )}
      </Box>
      <Typography variant="caption" sx={{ mt: theme.spacing(2), display: 'block' }}>
        Color Legend: Blue (Strong Positive, +1) to Red (Strong Negative, -1)
      </Typography>
    </Box>
  );
};

export default CorrelationHeatmap;
// import { useTheme } from '@mui/material';
// import { CorrelationData, Stats } from '../types';

// interface CorrelationHeatmapProps {
//   correlations: CorrelationData[];
//   stats: { [ticker: string]: Stats };
// }

// const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({ correlations, stats }) => {
//   const theme = useTheme();

//   // Mock implementation (replace with actual heatmap rendering logic)
//   // Use a library like Plotly.js or custom canvas rendering for production
//   return (
//     <div>
//       <h3>Correlation Heatmap</h3>
//       {/* Implement heatmap rendering here */}
//       {/* Display stats on hover using MUI Tooltip */}
//     </div>
//   );
// };

// export default CorrelationHeatmap;