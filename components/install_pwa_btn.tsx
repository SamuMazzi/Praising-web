'use client';

import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import React, { MouseEvent, useEffect, useState } from 'react';
import InstallMobileRoundedIcon from '@mui/icons-material/InstallMobileRounded';
import InstallDesktopRoundedIcon from '@mui/icons-material/InstallDesktopRounded';

/**
 * The BeforeInstallPromptEvent is fired at the Window.onbeforeinstallprompt handler
 * before a user is prompted to "install" a web site to a home screen on mobile.
 *
 * @deprecated Only supported on Chrome and Android Webview.
 */
interface BeforeInstallPromptEvent extends Event {
  /**
   * Returns an array of DOMString items containing the platforms on which the event was dispatched.
   * This is provided for user agents that want to present a choice of versions to the user such as,
   * for example, "web" or "play" which would allow the user to chose between a web version or
   * an Android version.
   */
  readonly platforms: Array<string>;

  /**
   * Returns a Promise that resolves to a DOMString containing either "accepted" or "dismissed".
   */
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;

  /**
   * Allows a developer to show the install prompt at a time of their own choosing.
   * This method returns a Promise.
   */
  prompt(): Promise<void>;
}

const InstallPWA = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] =
    useState<BeforeInstallPromptEvent | null>(null);

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

    const handler = (e: Event): void => {
      e.preventDefault();
      setSupportsPWA(isPWASupported());
      setPromptInstall(e as BeforeInstallPromptEvent);
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

  const onClick = (evt: MouseEvent): void => {
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
