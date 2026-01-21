import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import './App.css';
import './styles/heartCapsules.css';
import { bucketList as initialBucket, timeline as initialTimeline } from './data/memories.js';
import CapsuleCard from './components/CapsuleCard.jsx';
import CapsuleDetail from './components/CapsuleDetail.jsx';
import ShatteredHeart from './components/ShatteredHeart.tsx';
import LoveIntro from './components/LoveIntro.jsx';
import useIsMobile from './hooks/useIsMobile.js';
import { createCapsule, fetchState, updateBucket, updateCapsule, updateNote } from './api/client.js';

function App() {
  const [note, setNote] = useState(
    '给未来的我们：记得在忙碌的每一天留一点空隙，看日落、喝热巧克力、分享梦。',
  );
  const [showIntro, setShowIntro] = useState(true);
  const isMobile = useIsMobile();
  const [bucket, setBucket] = useState(initialBucket);
  const [capsules, setCapsules] = useState(initialTimeline);
  const [editingCapsule, setEditingCapsule] = useState(null);
  const [newCapsule, setNewCapsule] = useState({
    title: '',
    date: '',
    place: '',
    mood: '',
    note: '',
    cover: '',
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showIndex, setShowIndex] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [syncingNote, setSyncingNote] = useState(false);
  const noteTimerRef = useRef(null);
  const noteHydratedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetchState()
      .then((data) => {
        if (cancelled) return;
        setBucket(data.bucket || initialBucket);
        setCapsules(data.capsules || initialTimeline);
        if (data.note) setNote(data.note);
        noteHydratedRef.current = true;
      })
      .catch(() => {
        noteHydratedRef.current = true;
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!noteHydratedRef.current) return;
    if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
    noteTimerRef.current = setTimeout(() => {
      setSyncingNote(true);
      updateNote(note).catch(() => {}).finally(() => setSyncingNote(false));
    }, 500);
    return () => {
      if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
    };
  }, [note]);

  const memoriesCount = useMemo(() => capsules.length, [capsules.length]);
  const readyCount = useMemo(
    () => bucket.filter((item) => item.status === 'ready').length,
    [bucket],
  );
  const moodCount = useMemo(() => {
    const moods = new Set(capsules.map((item) => item.mood).filter(Boolean));
    return moods.size || 1;
  }, [capsules]);

  const toggleBucket = (id) => {
    startTransition(() => {
      setBucket((items) =>
        items.map((item) =>
          item.id === id
            ? {
                ...item,
                status: item.status === 'ready' ? 'draft' : 'ready',
              }
            : item,
        ),
      );
    });
    updateBucket(id, {
      status:
        bucket.find((item) => item.id === id)?.status === 'ready' ? 'draft' : 'ready',
    }).catch(() => {});
  };

  const openCapsule = (capsule) => {
    setEditingCapsule({ ...capsule });
  };

  const closeCapsule = () => setEditingCapsule(null);

  const saveCapsule = () => {
    if (!editingCapsule) return;
    startTransition(() => {
      setCapsules((items) =>
        items.map((item) => (item.id === editingCapsule.id ? { ...item, ...editingCapsule } : item)),
      );
    });
    updateCapsule(editingCapsule.id, editingCapsule).catch(() => {});
    closeCapsule();
  };

  const handleCapsuleField = (field, value) => {
    setEditingCapsule((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleCoverUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        handleCapsuleField('cover', result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNewCapsuleField = (field, value) => {
    setNewCapsule((prev) => ({ ...prev, [field]: value }));
  };

  const handleNewCoverUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setNewCapsule((prev) => ({ ...prev, cover: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const addCapsule = () => {
    if (!newCapsule.title) return;
    const capsule = {
      id: `capsule-${Date.now()}`,
      title: newCapsule.title,
      date: newCapsule.date || '未标注',
      place: newCapsule.place || '未标注',
      mood: newCapsule.mood || '心动',
      note: newCapsule.note || '',
      cover: newCapsule.cover,
    };
    startTransition(() => {
      setCapsules((prev) => [...prev, capsule]);
    });
    createCapsule(capsule).catch(() => {});
    setNewCapsule({
      title: '',
      date: '',
      place: '',
      mood: '',
      note: '',
      cover: '',
    });
  };

  const noteLength = useMemo(() => note.length, [note]);

  return (
    <main className="shell">
      {showIntro ? <LoveIntro onClose={() => setShowIntro(false)} isMobile={isMobile} /> : null}
      <section className="hero">
        <div>
          <p className="eyebrow">Couple Memory Studio</p>
          <h1>把回忆放进一个温柔又高级的空间</h1>
          <p className="lede">
            记录故事、藏好照片、给未来写信。这是你们的私密宇宙，界面柔和但不失力量。
          </p>
          <div className="hero-actions">
            <button className="primary" type="button">
              上传一张新照片
            </button>
            <button className="ghost" type="button">
              预约下一次小旅行
            </button>
            <span className="hint">{memoriesCount}+ 条回忆已归档 · 实时保存</span>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-stat">
            <span>完成计划</span>
            <strong>
              {readyCount} / {bucket.length}
            </strong>
          </div>
          <div className="hero-stat">
            <span>共同行程</span>
            <strong>{capsules.length}</strong>
          </div>
          <div className="hero-stat">
            <span>心情标签</span>
            <strong>{moodCount}</strong>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">时间胶囊</p>
            <h2>留住那些浓缩的瞬间</h2>
            <p className="subtle">每个胶囊像心形碎片，封面可自定义，点击展开单独空间。</p>
          </div>
          <div className="pill">心形编排 · content-visibility</div>
        </div>
        {isMobile ? (
          <div className="panel">
            <div className="section-head slim">
              <div>
                <p className="eyebrow">移动端碎片视图</p>
                <h2>轻量列表 · 点击可编辑</h2>
              </div>
              <div className="pill">{capsules.length} 条碎片</div>
            </div>
            <div className="heart-mobile-preview">
              <ShatteredHeart
                items={capsules}
                onClick={openCapsule}
                seed={66}
                maxPieces={120}
                showFallingShards={false}
                bevelStrength={0.8}
                showIndices
                className="shattered-slot show-mobile-heart"
                forceShowHeart
              />
            </div>
            <div className="capsule-fallback-grid">
              {capsules.map((item, index) => (
                <button
                  key={item.id}
                  className="capsule-fallback"
                  type="button"
                  onClick={() => openCapsule(item)}
                  aria-label={item.title}
                >
                  <div className="fallback-meta">
                    <span>#{index + 1}</span>
                    <span>{item.date}</span>
                  </div>
                  <strong>{item.title}</strong>
                  <p className="subtle clamp-2">{item.note}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ShatteredHeart
            items={capsules}
            onClick={openCapsule}
            seed={66}
            maxPieces={120}
            showFallingShards
            fallingCount={12}
            bevelStrength={0.8}
            showIndices
            className="shattered-slot"
          />
        )}
        <div className="heart-actions">
          <button type="button" className="chip chip-active" onClick={() => setShowAddForm((v) => !v)}>
            {showAddForm ? '收起新增碎片' : '新增碎片'}
          </button>
          <button type="button" className="chip" onClick={() => setShowIndex((v) => !v)}>
            {showIndex ? '收起碎片索引' : `碎片索引（${capsules.length}）`}
          </button>
        </div>
        {showAddForm && (
          <div className="panel">
          <div className="section-head slim">
            <div>
              <p className="eyebrow">新增碎片</p>
              <h2>快速创建时间胶囊</h2>
            </div>
            <div className="pill">实时加入心形 · 支持封面</div>
          </div>
          <div className="field split">
            <div>
              <label htmlFor="new-title">标题</label>
              <input
                id="new-title"
                value={newCapsule.title}
                onChange={(e) => handleNewCapsuleField('title', e.target.value)}
                placeholder="例如：深夜散步"
              />
            </div>
            <div>
              <label htmlFor="new-date">时间</label>
              <input
                id="new-date"
                value={newCapsule.date}
                onChange={(e) => handleNewCapsuleField('date', e.target.value)}
                placeholder="2024 · 夏"
              />
            </div>
          </div>
          <div className="field split">
            <div>
              <label htmlFor="new-place">地点</label>
              <input
                id="new-place"
                value={newCapsule.place}
                onChange={(e) => handleNewCapsuleField('place', e.target.value)}
                placeholder="城市 / 场景"
              />
            </div>
            <div>
              <label htmlFor="new-mood">心情</label>
              <input
                id="new-mood"
                value={newCapsule.mood}
                onChange={(e) => handleNewCapsuleField('mood', e.target.value)}
                placeholder="温柔 / 自由 / 惊喜..."
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="new-note">小记</label>
            <textarea
              id="new-note"
              rows={3}
              value={newCapsule.note}
              onChange={(e) => handleNewCapsuleField('note', e.target.value)}
              placeholder="写下当时的感觉..."
            />
          </div>
          <div className="field">
            <label htmlFor="new-cover">封面</label>
            <input id="new-cover" type="file" accept="image/*" onChange={handleNewCoverUpload} />
            <p className="subtle">支持本地图片；不选则用渐变占位。</p>
          </div>
          <div className="action-row">
            <button type="button" className="primary" onClick={addCapsule} disabled={!newCapsule.title}>
              加入心形
            </button>
          </div>
        </div>
        )}
      </section>
      <CapsuleDetail
        capsule={editingCapsule}
        onFieldChange={handleCapsuleField}
        onSave={saveCapsule}
        onClose={closeCapsule}
        onUploadCover={handleCoverUpload}
        disabled={isPending}
      />

      {showIndex && (
        <section className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">碎片索引</p>
              <h2>位置一览</h2>
              <p className="subtle">编号对应心形碎片上的数字，便于定位后点击编辑。</p>
            </div>
          </div>
          <div className="capsule-fallback-grid">
            {capsules.map((item, index) => (
              <div key={item.id} className="capsule-fallback" style={{ cursor: 'default' }}>
                <div className="fallback-meta">
                  <span>#{index + 1}</span>
                  <span>{item.date}</span>
                </div>
                <strong>{item.title}</strong>
                <p className="subtle clamp-2">{item.note}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section dual">
        <div className="panel">
          <div className="section-head slim">
            <div>
              <p className="eyebrow">一起去做的事</p>
              <h2>愿望清单</h2>
            </div>
            <div className="pill">
              {readyCount} 已就绪 · {bucket.length - readyCount} 待计划
            </div>
          </div>
          <div className="list">
            {bucket.map((item) => (
              <div key={item.id} className="list-row">
                <div>
                  <strong>{item.label}</strong>
                  <p className="subtle">
                    {item.status === 'ready' ? '随时出发' : '需要再准备一点点'}
                  </p>
                </div>
                <button
                  type="button"
                  className={`toggle ${item.status === 'ready' ? 'on' : ''}`}
                  onClick={() => toggleBucket(item.id)}
                  disabled={isPending}
                >
                  {item.status === 'ready' ? '标记为待定' : '标记完成'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="section-head slim">
            <div>
              <p className="eyebrow">留给未来的信</p>
              <h2>柔软的备忘</h2>
            </div>
            <div className="pill pill-soft">会自动保存</div>
          </div>
          <div className="note">
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="写下此刻想对对方说的话…"
              aria-label="写给未来的信"
            />
            <div className="note-footer">
              <span className="subtle">字数 {noteLength} · 私密仅自己可见</span>
              {isPending && <span className="pending">更新中…</span>}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
