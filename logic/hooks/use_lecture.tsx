import { useEffect, useState } from 'react';
import { LiturgyOfDay } from '../scraper_liturgy';

export const fetcher = async (url: string): Promise<any> => {
  try {
    const res = await fetch(url);
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
  error: string;
  loading: boolean;
} {
  const [content, setContent] = useState<LiturgyOfDay>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchLectures(): Promise<void> {
    // FIXME: Fix case in which version is not available anymore

    setLoading(true);
    setError('');
    try {
      const contentSong = await fetcher(url);
      setContent(contentSong);
    } catch (e: any) {
      setError(e as string);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchLectures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    content,
    error,
    loading
  };
}
