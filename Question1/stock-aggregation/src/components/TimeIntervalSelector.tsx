import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useState } from 'react';

interface TimeIntervalSelectorProps {
  onIntervalChange: (minutes: number) => void;
}

const TimeIntervalSelector: React.FC<TimeIntervalSelectorProps> = ({ onIntervalChange }) => {
  const [interval, setInterval] = useState<number>(10);

  const handleChange = (event: any) => {
    const value = Number(event.target.value);
    setInterval(value);
    onIntervalChange(value);
  };

  return (
    <FormControl sx={{ minWidth: 120, mb: 2 }}>
      <InputLabel>Time Interval</InputLabel>
      <Select value={interval} onChange={handleChange} label="Time Interval">
        <MenuItem value={10}>Last 10 mins</MenuItem>
        <MenuItem value={30}>Last 30 mins</MenuItem>
        <MenuItem value={60}>Last 60 mins</MenuItem>
        <MenuItem value={120}>Last 120 mins</MenuItem>
      </Select>
    </FormControl>
  );
};

export default TimeIntervalSelector;