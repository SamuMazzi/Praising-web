import { useEffect, useState } from 'react';
import { LiturgyOfDay } from '../scraper_liturgy';

export const fetcher = async (
  url: string,
  forceReload: boolean
): Promise<any> => {
  try {
    // TODO: Test this
    console.log('fetcher', url, forceReload);
    const res = await fetch(url, {
      cache: forceReload ? 'reload' : 'force-cache',
      next: { revalidate: 3600 * 24 }
    });
    if (res.status >= 400) {
      const msg = JSON.parse(await res.text()).error;
      throw Error(msg as string);
    }
    const json = await res.json();
    return new LiturgyOfDay(json);
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
    } catch (e: any) {
      setError(e as string);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchLiturgy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    content,
    error,
    loading
  };
}
