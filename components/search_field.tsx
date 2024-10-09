import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';

interface PropsTypeSearch {
  query: string;
  setQuery: (arg0: string) => void;
}

export default function TypeSearch(props: PropsTypeSearch): JSX.Element {
  const [showClearIcon, setShowClearIcon] = useState('none');

  return (
    <TextField
      label="Cerca"
      value={props.query}
      onChange={(e) => {
        props.setQuery(e.currentTarget.value);
        setShowClearIcon(e.target.value === '' ? 'none' : 'flex');
      }}
      slotProps={{
        input: {
          startAdornment: <SearchIcon sx={{ mr: 1 }} />,
          endAdornment: (
            <IconButton
              style={{ display: showClearIcon }}
              onClick={() => {
                props.setQuery('');
              }}
            >
              <CancelRoundedIcon />
            </IconButton>
          )
        }
      }}
    />
  );
}
