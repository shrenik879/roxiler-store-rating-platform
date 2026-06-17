import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export function useDownload(fetcher, filename) {
  const [downloading, setDownloading] = useState(false);

  const download = useCallback(
    async (...args) => {
      setDownloading(true);
      try {
        const blob = await fetcher(...args);
        const url = window.URL.createObjectURL(new Blob([blob]));
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.success('Export ready');
      } catch {
        toast.error('Export failed');
      } finally {
        setDownloading(false);
      }
    },
    [fetcher, filename]
  );

  return { download, downloading };
}
