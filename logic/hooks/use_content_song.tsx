import { useEffect, useState } from 'react';
import { getSingleSong } from '../local_logic';

export default function useContentSong(
  id_song: string
): [string, boolean, string] {
  //const { data, error, isLoading } = useSWR('/api/song/' + props.id, fetcher)
  const [data, setData] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const song = getSingleSong(id_song);

  async function fetchFile() {
    try {
      const response = await fetch('/accordi/' + song?.name + '.crd');
      const content = await response.text();
      setData(content);
    } catch (e: any) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [data, loading, error];
}
