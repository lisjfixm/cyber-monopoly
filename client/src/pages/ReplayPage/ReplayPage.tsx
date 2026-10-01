import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

import ReplayList, {
  loadReplays,
  saveReplays,
  MAX_REPLAYS,
} from './ReplayList';
import type { StoredReplay } from './ReplayList';
import ReplayPlayer from './ReplayPlayer';
import { getReplayByShareId, getReplayFromUrl } from '@client/src/utils/replay-share';

const ReplayPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const replayIdParam = searchParams.get('id');

  const [replays, setReplays] = useState<StoredReplay[]>([]);
  const [selectedReplay, setSelectedReplay] = useState<StoredReplay | null>(null);

  // 載入回放列表
  useEffect(() => {
    const list = loadReplays();
    setReplays(list);

    // 如果 URL 有 share 參數，從分享存儲中加載回放
    const shareId = getReplayFromUrl();
    if (shareId) {
      const sharedReplay = getReplayByShareId(shareId);
      if (sharedReplay) {
        setSelectedReplay(sharedReplay as StoredReplay);
        return;
      }
    }

    // 如果 URL 有 id，自動選擇
    if (replayIdParam) {
      const found = list.find((r) => r.id === replayIdParam);
      if (found) {
        setSelectedReplay(found);
      }
    }
  }, [replayIdParam]);

  const handleSelectReplay = useCallback((replay: StoredReplay) => {
    setSelectedReplay(replay);
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedReplay(null);
  }, []);

  const handleBack = useCallback(() => {
    navigate('/profile');
  }, [navigate]);

  const handleDeleteReplay = useCallback((id: string) => {
    const updated = replays.filter((r) => r.id !== id);
    setReplays(updated);
    saveReplays(updated);
    if (selectedReplay?.id === id) {
      setSelectedReplay(null);
    }
  }, [replays, selectedReplay]);

  const handleImportReplay = useCallback((replay: StoredReplay) => {
    const existing = loadReplays();
    const updated = [replay, ...existing].slice(0, MAX_REPLAYS);
    saveReplays(updated);
    setReplays(updated);
    setSelectedReplay(replay);
  }, []);

  // 播放器視圖
  if (selectedReplay) {
    return <ReplayPlayer replay={selectedReplay} onBack={handleBackToList} />;
  }

  // 列表視圖
  return (
    <div className="min-h-screen w-full flex flex-col px-4 py-6 scanlines">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={handleBack}
          className="cyber-btn px-3 py-2 text-sm flex items-center gap-1"
          style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
        >
          <ChevronLeft size={16} />
          <span className="font-cyber tracking-wider">返回</span>
        </button>
        <h1 className="font-cyber text-2xl md:text-3xl text-neon-cyan tracking-wider">
          回放紀錄
        </h1>
      </div>

      <ReplayList
        replays={replays}
        onSelect={handleSelectReplay}
        onDelete={handleDeleteReplay}
        onImport={handleImportReplay}
      />
    </div>
  );
};

export default ReplayPage;
