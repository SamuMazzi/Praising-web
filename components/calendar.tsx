import { useState } from 'react';
import { Dayjs } from 'dayjs';
import IconButton from '@mui/material/IconButton';
import EventIcon from '@mui/icons-material/Event';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import 'dayjs/locale/it';

interface PropsCalendarSelectSingleDay {
  daySelected: Dayjs
  onChangeDate: (arg0: Dayjs) => void
}

export function CalendarSelectSingleDay(props: PropsCalendarSelectSingleDay) {
  const [isOpen, setIsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event: any) => {
    setIsOpen((isOpen) => !isOpen);
    setAnchorEl(event.currentTarget);
  }

  const handleDaySelected = (newDate: Dayjs) => {
    props.onChangeDate(newDate)
  }

  return (
    <LocalizationProvider adapterLocale='it' dateAdapter={AdapterDayjs}>
      <DatePicker
        value={props.daySelected}        
        onChange={(newValue) => {
          if(newValue !== null) {
            handleDaySelected(newValue);
          }
        }}
        PopperProps={{
          placement: "bottom-end",
          anchorEl: anchorEl
        }}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        renderInput={({
          ref,
          inputProps,
          disabled,
          onChange,
          value,
          ...other
        }) => (
          <div ref={ref} style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            <IconButton onClick={handleClick}>
              <EventIcon fontSize="large"/>
            </IconButton>
          </div>)}
      />
    </LocalizationProvider>
  );
}