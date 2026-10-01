import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  X,
  Upload,
  Tag,
  Map,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { publishMap, MAP_TAGS } from '@client/src/utils/communityMaps';
import type { MapTag } from '@client/src/utils/communityMaps';
import type { CustomMapData } from '@shared/api.interface';

interface UploadMapDialogProps {
  open: boolean;
  onClose: () => void;
  localMaps: CustomMapData[];
  authorName: string;
  onPublished?: (mapId: string) => void;
}

export const UploadMapDialog: React.FC<UploadMapDialogProps> = ({
  open,
  onClose,
  localMaps,
  authorName,
  onPublished,
}) => {
  const [selectedMapId, setSelectedMapId] = useState<string>('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<MapTag[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedMapId(localMaps[0]?.id ?? '');
      setName(localMaps[0]?.name ?? '');
      setDescription('');
      setSelectedTags([]);
      setSubmitting(false);
    }
  }, [open, localMaps]);

  const selectedMap = useMemo(
    () => localMaps.find((m) => m.id === selectedMapId),
    [localMaps, selectedMapId],
  );

  const handleMapSelect = useCallback((id: string) => {
    setSelectedMapId(id);
    const m = localMaps.find((map) => map.id === id);
    if (m) setName(m.name);
  }, [localMaps]);

  const toggleTag = useCallback((tag: MapTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag].slice(0, 3),
    );
  }, []);

  const handleSubmit = useCallback(() => {
    if (!selectedMap) {
      toast.error('請選擇要上傳的地圖');
      return;
    }
    if (!name.trim()) {
      toast.error('請輸入地圖名稱');
      return;
    }
    if (selectedTags.length === 0) {
      toast.error('請至少選擇一個標籤');
      return;
    }
    setSubmitting(true);
    try {
      const mapToPublish: CustomMapData = {
        ...selectedMap,
        name: name.trim(),
      };
      const newId = publishMap(mapToPublish, authorName, description.trim(), selectedTags);
      toast.success('地圖已發布到社區！');
      onPublished?.(newId);
      onClose();
    } catch {
      toast.error('發布失敗，請重試');
    } finally {
      setSubmitting(false);
    }
  }, [selectedMap, name, description, selectedTags, authorName, onPublished, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-lg overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(10,10,30,0.98) 0%, rgba(20,10,40,0.98) 100%)',
          border: '1px solid var(--pink)',
          boxShadow: '0 0 30px rgba(255, 0, 170, 0.3), inset 0 0 30px rgba(255, 0, 170, 0.05)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor: 'rgba(255, 0, 170, 0.2)', background: 'rgba(255, 0, 170, 0.05)' }}
        >
          <Upload size={20} style={{ color: 'var(--pink)' }} />
          <h2
            className="text-lg font-bold tracking-wider flex-1"
            style={{ color: 'var(--pink)', textShadow: '0 0 10px var(--pink)' }}
          >
            上傳地圖
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="cyber-btn p-1.5"
            style={{ borderColor: 'var(--red)', color: 'var(--red)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {localMaps.length === 0 ? (
            <div className="text-center py-10">
              <Map size={40} className="mx-auto mb-3" style={{ color: 'var(--text-secondary)' }} />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                暫無本地地圖
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                請先前往地圖編輯器創建並保存地圖
              </p>
            </div>
          ) : (
            <>
              {/* 选择本地地图 */}
              <div>
                <label className="text-xs font-bold block mb-2" style={{ color: 'var(--text-primary)' }}>
                  選擇本地地圖
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {localMaps.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleMapSelect(m.id)}
                      className="w-full px-3 py-2 text-left text-sm rounded flex items-center gap-2 transition-all"
                      style={{
                        background: selectedMapId === m.id ? 'rgba(255, 0, 170, 0.1)' : 'rgba(0,0,0,0.3)',
                        border: `1px solid ${selectedMapId === m.id ? 'var(--pink)' : 'rgba(255,255,255,0.1)'}`,
                        color: selectedMapId === m.id ? 'var(--pink)' : 'var(--text-primary)',
                      }}
                    >
                      <Map size={16} />
                      <span className="truncate">{m.name}</span>
                      {selectedMapId === m.id && (
                        <Sparkles size={14} className="ml-auto flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 地图名称 */}
              <div>
                <label className="text-xs font-bold block mb-2" style={{ color: 'var(--text-primary)' }}>
                  地圖名稱
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="輸入地圖名稱"
                  maxLength={30}
                  className="w-full px-3 py-2 text-sm rounded-md outline-none"
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* 描述 */}
              <div>
                <label className="text-xs font-bold block mb-2" style={{ color: 'var(--text-primary)' }}>
                  地圖描述
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="簡單介紹你的地圖特色..."
                  maxLength={200}
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-md outline-none resize-none"
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'var(--text-primary)',
                  }}
                />
                <div className="text-right text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {description.length}/200
                </div>
              </div>

              {/* 标签 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                    <Tag size={12} />
                    選擇標籤（最多 3 個）
                  </label>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {selectedTags.length}/3
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {MAP_TAGS.map((tag) => {
                    const active = selectedTags.includes(tag);
                    const disabled = !active && selectedTags.length >= 3;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => !disabled && toggleTag(tag)}
                        className="px-2.5 py-1 text-xs rounded-full transition-all"
                        style={{
                          background: active ? 'rgba(255, 0, 170, 0.15)' : 'rgba(0,0,0,0.3)',
                          border: `1px solid ${active ? 'var(--pink)' : 'rgba(255,255,255,0.1)'}`,
                          color: active ? 'var(--pink)' : disabled ? 'var(--text-secondary)' : 'var(--text-primary)',
                          opacity: disabled ? 0.4 : 1,
                          cursor: disabled ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                className="p-3 rounded flex gap-2 text-xs"
                style={{
                  background: 'rgba(255, 215, 0, 0.05)',
                  border: '1px solid rgba(255, 215, 0, 0.2)',
                  color: 'var(--text-secondary)',
                }}
              >
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#ffd700' }} />
                <span>上傳即表示您同意社區公約，禁止發布含有違規內容的地圖。</span>
              </div>
            </>
          )}
        </div>

        {/* 底部 */}
        {localMaps.length > 0 && (
          <div
            className="flex gap-3 px-4 py-3 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <button
              type="button"
              onClick={onClose}
              className="cyber-btn cyber-btn-sm flex-1 py-2 text-sm"
              style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'var(--text-secondary)' }}
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="cyber-btn cyber-btn-sm flex-1 py-2 text-sm font-bold"
              style={{
                borderColor: 'var(--pink)',
                color: 'var(--pink)',
                background: 'rgba(255, 0, 170, 0.1)',
              }}
            >
              {submitting ? '發布中...' : '確認發布'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadMapDialog;
