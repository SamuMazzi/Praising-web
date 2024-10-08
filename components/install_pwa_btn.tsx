import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import React, { useEffect, useState } from 'react';
import InstallMobileRoundedIcon from '@mui/icons-material/InstallMobileRounded';
import InstallDesktopRoundedIcon from '@mui/icons-material/InstallDesktopRounded';

const InstallPWA = (): JSX.Element | null => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any): void => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('transitionend', handler);
    };
  }, []);

  const onClick = (evt: any): void => {
    evt.preventDefault();
    if (promptInstall === null) {
      return;
    }
    promptInstall.prompt();
  };
  if (!supportsPWA) {
    return null;
  }
  return (
    <ListItemButton onClick={onClick}>
      <ListItemIcon>
        {typeof window !== 'undefined' && window.innerWidth < 768 ? (
          <InstallMobileRoundedIcon />
        ) : (
          <InstallDesktopRoundedIcon />
        )}
      </ListItemIcon>
      <ListItemText
        primary="Installa app"
        secondary="Accedi più velocemente a questo sito"
      />
    </ListItemButton>
  );
};

export default InstallPWA;
