import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import PrintIcon from '@mui/icons-material/PrintRounded';
import { useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';

interface PropsPrintButton {
  onClick: () => Promise<void>;
}

export const PrintButton = (props: PropsPrintButton): JSX.Element => {
  const [loading, setLoading] = useState(false);

  return (
    <MenuItem
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await props.onClick();
        } finally {
          setLoading(false);
        }
      }}
    >
      <ListItemIcon>
        {loading ? <CircularProgress /> : <PrintIcon />}
      </ListItemIcon>
      <ListItemText primary="Stampa (beta)" />
    </MenuItem>
  );
};
