import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

interface PropsSnackbar {
  open: boolean;
  handleClose: () => void;
  message: string;
}

export default function PersSnackbar(props: PropsSnackbar): JSX.Element {
  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ): void => {
    if (reason !== 'clickaway') props.handleClose();
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

interface PropsMessageSnackbar {
  handleClose: () => void;
  message: string;
}

export function MessageSnackbar(props: PropsMessageSnackbar): JSX.Element {
  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ): void => {
    if (reason !== 'clickaway') props.handleClose();
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
        open={props.message !== ''}
        autoHideDuration={3000}
        onClose={handleClose}
        message={props.message}
        action={action}
      />
    </div>
  );
}
