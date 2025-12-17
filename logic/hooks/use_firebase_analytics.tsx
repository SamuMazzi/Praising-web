'use client';

import { useEffect } from 'react';
import { getAnalytics, logEvent } from '@firebase/analytics';
import fbApp from '@/logic/server/firebase_config';
import { usePathname } from 'next/navigation';

export function useFirebaseRoutesAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    const analytics = getAnalytics(fbApp);
    const page_path = pathname;
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
  }, [pathname]);

  return null;
}
