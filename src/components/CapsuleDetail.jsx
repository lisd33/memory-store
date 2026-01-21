function CapsuleDetail({ capsule, onFieldChange, onSave, onClose, disabled, onUploadCover }) {
  if (!capsule) return null;

  return (
    <div className="capsule-overlay" role="dialog" aria-modal="true" aria-label="时间胶囊详情">
      <div className="capsule-dialog">
        <header className="dialog-head">
          <div>
            <p className="eyebrow">时间胶囊</p>
            <h2>{capsule.title}</h2>
          </div>
          <button type="button" className="ghost" onClick={onClose}>
            关闭
          </button>
        </header>

        <div className="field split">
          <div>
            <label htmlFor="detail-date">时间</label>
            <input
              id="detail-date"
              value={capsule.date}
              onChange={(event) => onFieldChange('date', event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="detail-place">地点</label>
            <input
              id="detail-place"
              value={capsule.place}
              onChange={(event) => onFieldChange('place', event.target.value)}
            />
          </div>
        </div>

        <div className="field split">
          <div>
            <label htmlFor="detail-title">标题</label>
            <input
              id="detail-title"
              value={capsule.title}
              onChange={(event) => onFieldChange('title', event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="detail-mood">心情</label>
            <input
              id="detail-mood"
              value={capsule.mood ?? ''}
              onChange={(event) => onFieldChange('mood', event.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="detail-note">详细内容</label>
          <textarea
            id="detail-note"
            rows={6}
            value={capsule.note}
            onChange={(event) => onFieldChange('note', event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="detail-cover">封面</label>
          <div className="cover-upload">
            <div className="cover-thumb" style={capsule.cover ? { backgroundImage: `url(${capsule.cover})` } : undefined}>
              {!capsule.cover && <span className="subtle">暂无封面</span>}
            </div>
            <input
              id="detail-cover"
              type="file"
              accept="image/*"
              onChange={onUploadCover}
              aria-label="上传封面"
            />
          </div>
          <p className="subtle">支持本地图片，自动按卡片比例裁剪铺满。</p>
        </div>

        <div className="action-row">
          <button type="button" className="primary" onClick={onSave} disabled={disabled}>
            保存
          </button>
          <button type="button" className="ghost" onClick={onClose} disabled={disabled}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

export default CapsuleDetail;
