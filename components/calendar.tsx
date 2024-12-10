import { type Dayjs } from 'dayjs';
import EventIcon from '@mui/icons-material/Event';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import 'dayjs/locale/it';
import React from 'react';

interface PropsCalendarSelectSingleDay {
  daySelected: Dayjs;
  onChangeDate: (arg0: Dayjs) => void;
}

export function CalendarSelectSingleDay(props: PropsCalendarSelectSingleDay) {
  const handleDaySelected = (newDate: Dayjs): void => {
    props.onChangeDate(newDate);
  };

  return (
    <LocalizationProvider adapterLocale="it" dateAdapter={AdapterDayjs}>
      <DatePicker
        sx={{ ml: 3 }}
        value={props.daySelected}
        onChange={(newValue) => {
          if (newValue !== null) {
            handleDaySelected(newValue);
          }
        }}
        slots={{
          openPickerIcon: EventIcon
        }}
        format="dddd D MMMM YYYY"
      />
    </LocalizationProvider>
  );
}
