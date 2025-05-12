import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './styles/theme';
import StockPage from './pages/StockPage';
import HeatmapPage from './pages/HeatmapPage';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Switch>
          <Route exact path="/" component={StockPage} />
          <Route path="/heatmap" component={HeatmapPage} />
        </Switch>
      </Router>
    </ThemeProvider>
  );
};

export default App;