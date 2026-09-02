'use client';

import React from 'react';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';

interface PropsTypeSearch {
  query: string;
  setQuery: (arg0: string) => void;
}

export default function TypeSearch(props: PropsTypeSearch) {
  return (
    <TextField
      label="Cerca"
      type="search"
      name="cerca"
      value={props.query}
      sx={{ mt: 1 }}
      onChange={(e) => {
        props.setQuery(e.currentTarget.value);
      }}
      slotProps={{
        htmlInput: {
          autoComplete: 'off',
          autoCorrect: 'off',
          autoCapitalize: 'off',
          spellCheck: false,
          enterKeyHint: 'search'
        },
        input: {
          startAdornment: <SearchIcon sx={{ mr: 1 }} />,
          // Il pulsante esce dal DOM quando non serve: prima restava sempre
          // montato con `display: none`, quindi annunciato dagli screen reader
          // e fuori sincrono se la query veniva svuotata dall'esterno.
          endAdornment:
            props.query === '' ? null : (
              <IconButton
                aria-label="Cancella la ricerca"
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
