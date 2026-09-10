'use client';

import { useEffect, useState } from 'react';
import { LiturgyOfDay } from '../liturgy';
import * as Sentry from '@sentry/nextjs';

export const fetcher = async (
  url: string,
  forceReload: boolean,
  retryOnServerError: boolean = true
): Promise<LiturgyOfDay> => {
  try {
    const res = await fetch(url, {
      cache: forceReload ? 'reload' : 'force-cache',
      next: { revalidate: 3600 * 24 }
    });
    const data = await res.json();
    if (res.status >= 500 && retryOnServerError) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return fetcher(url, forceReload, false);
    }
    if (res.status >= 400) {
      throw Error(data.error as string);
    }
    return new LiturgyOfDay(data);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export default function useLecture(url: string): {
  content: LiturgyOfDay | undefined;
  error: string | undefined;
  loading: boolean;
} {
  const [content, setContent] = useState<LiturgyOfDay>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  async function fetchLiturgy(): Promise<void> {
    // FIXME: Fix case in which version is not available anymore

    setLoading(true);
    setError(undefined);
    try {
      const liturgy = await fetcher(
        url,
        (window.performance.getEntries()[0] as PerformanceNavigationTiming)
          .type === 'reload'
      );
      setContent(liturgy);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(JSON.stringify(e));
      }
      Sentry.captureException(e, {
        data: `Url fetched: ${url}`
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchLiturgy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return {
    content,
    error,
    loading
  };
}
