'use client';

import { useEffect } from 'react';
import fbApp from '@/logic/server/firebase_config';
import { usePathname } from 'next/navigation';

export function useFirebaseRoutesAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    const page_path = pathname;

    /** gtag pesa ~150 kB e non serve a disegnare la pagina: lo carichiamo
     *  quando il main thread e' libero, non durante l'hydration. */
    const send = async (): Promise<void> => {
      const { getAnalytics, logEvent } = await import('@firebase/analytics');
      const analytics = getAnalytics(fbApp);
      logEvent(analytics, 'screen_view', {
        firebase_screen: page_path,
        firebase_screen_class: 'firebase-routes-analytics' // <- This name is up to you
      });
      if (page_path.includes('/song') && !page_path.includes('/api')) {
        logEvent(analytics, 'view_song', {
          firebase_screen: page_path,
          firebase_screen_class: 'firebase-routes-analytics',
          song_id: page_path.split('/').pop()
        });
      }
    };

    const idle =
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(() => void send(), { timeout: 5000 })
        : window.setTimeout(() => void send(), 2000);
    return () => {
      if (typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idle as number);
      } else {
        window.clearTimeout(idle as number);
      }
    };
  }, [pathname]);

  return null;
}
