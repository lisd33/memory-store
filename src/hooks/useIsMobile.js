import { useEffect, useState } from 'react';

export default function useIsMobile(threshold = 768) {
  const [isMobile, setIsMobile] = useState(
    () => (typeof window !== 'undefined' ? window.innerWidth < threshold : false),
  );

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < threshold);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [threshold]);

  return isMobile;
}
