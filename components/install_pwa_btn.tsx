import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import React, { useEffect, useState } from 'react';
import InstallMobileRoundedIcon from '@mui/icons-material/InstallMobileRounded';
import InstallDesktopRoundedIcon from '@mui/icons-material/InstallDesktopRounded';

const InstallPWA = (): JSX.Element => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);

  useEffect(() => {
    // Check for multiple PWA support indicators
    const isPWASupported = () => {
      const isStandalone = window.matchMedia(
        '(display-mode: standalone)'
      ).matches;
      const hasBeforeInstallPrompt = 'onbeforeinstallprompt' in window;
      const hasServiceWorker = 'serviceWorker' in navigator;

      return hasBeforeInstallPrompt && hasServiceWorker && !isStandalone;
    };

    const handler = (e: any): void => {
      e.preventDefault();
      setSupportsPWA(isPWASupported());
      setPromptInstall(e);
    };

    // https://stackoverflow.com/a/68525181/15212468
    // Initial check
    setSupportsPWA(isPWASupported());

    // Add event listener
    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
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
    return <></>;
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
