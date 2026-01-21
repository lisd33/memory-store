import { useEffect, useMemo, useRef, useState } from 'react';
import './LoveIntro.css';

function LoveIntro({ onClose, isMobile = false }) {
  const [scale, setScale] = useState(1);
  const overflowRef = useRef({ body: '', html: '' });

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

  const frameClass = useMemo(() => (isMobile ? 'love-frame mobile' : 'love-frame'), [isMobile]);
  const innerStyle = isMobile
    ? {
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        maxHeight: '100vh',
      }
    : {
        width: '1100px',
        height: '680px',
      };

  return (
    <div className="love-intro" onClick={onClose} role="presentation">
      <button
        type="button"
        className="intro-skip"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
      >
        跳过动画，进入主页
      </button>
      <div className={frameClass} onClick={(e) => e.stopPropagation()}>
        <div className="love-inner" style={innerStyle}>
          <iframe
            title="love-intro"
            src="/love/index.html"
            frameBorder="0"
            scrolling="no"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </div>
    </div>
  );
}

export default LoveIntro;
