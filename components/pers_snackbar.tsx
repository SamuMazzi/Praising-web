import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

interface PropsSnackbar {
    open: boolean
    handleClose: Function
    message: string
}

export default function PersSnackbar(props: PropsSnackbar) {
  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason !== 'clickaway') props.handleClose()
  };

  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <div>
      <Snackbar
        open={props.open}
        autoHideDuration={3000}
        onClose={handleClose}
        message={props.message}
        action={action}
      />
    </div>
  );
}