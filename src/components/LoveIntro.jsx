import { useEffect, useMemo, useRef, useState } from 'react';
import './LoveIntro.css';

function LoveIntro({ onClose, isMobile = false }) {
  const [scale, setScale] = useState(1);
  const overflowRef = useRef({ body: '', html: '' });
  const messageRef = useRef(null);

  useEffect(() => {
    if (!isMobile) return undefined;
    setScale(1); // 移动端不再缩放，保证点击坐标一致
    return undefined;
  }, [isMobile]);

  useEffect(() => {
    overflowRef.current = {
      body: document.body.style.overflow,
      html: document.documentElement.style.overflow,
    };
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflowRef.current.body || '';
      document.documentElement.style.overflow = overflowRef.current.html || '';
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event?.data?.type === 'LOVE_INTRO_EXIT') {
        onClose();
      }
    };
    window.addEventListener('message', handleMessage);
    messageRef.current = handleMessage;
    return () => {
      if (messageRef.current) window.removeEventListener('message', messageRef.current);
    };
  }, [onClose]);

  const frameClass = useMemo(() => (isMobile ? 'love-frame mobile' : 'love-frame'), [isMobile]);
  const innerStyle = isMobile
    ? {
        width: '100vw',
        maxWidth: '100vw',
        height: '100dvh',
        maxHeight: '100dvh',
        minHeight: 'calc(100vh - env(safe-area-inset-bottom, 0px))',
      }
    : {
        width: '1100px',
        height: '680px',
      };

  return (
    <div className="love-intro" onClick={onClose} role="presentation">
      <div className={frameClass} onClick={(e) => e.stopPropagation()}>
        <div className="love-inner" style={innerStyle}>
          <iframe
            title="love-intro"
            src="/love/index.html"
            frameBorder="0"
            scrolling="no"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

export default LoveIntro;
