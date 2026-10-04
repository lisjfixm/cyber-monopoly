import { useState } from 'react';
import {
  Upload,
  X,
  AlertTriangle,
  Trash2,
  Users,
  Clock,
  Trophy,
  Share2,
} from 'lucide-react';
import { logger } from '@lark-apaas/client-toolkit/logger';

import { MODE_LABELS } from '@shared/game-config';
import { safeGetJSON, safeSetJSON } from '@client/src/utils/safeStorage';
import type { ReplayData, GameState } from '@shared/api.interface';
import ReplayShareModal from '@client/src/components/game/ReplayShareModal';
import { uploadReplay } from '@client/src/utils/replay-share';

const REPLAY_STORAGE_KEY = 'cyber_monopoly_replays';
export const MAX_REPLAYS = 10;

export interface StoredReplay extends Omit<ReplayData, 'id'> {
  id: string;
}

// 清洗單筆回放：欄位缺失/型別錯誤時給安全預設，避免渲染期拋錯白屏
function sanitizeReplay(raw: unknown): StoredReplay | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (!Array.isArray(r.log)) return null;
  const players = Array.isArray(r.players) ? r.players : [];
  const duration = Number.isFinite(Number(r.duration)) ? Number(r.duration) : 0;
  const totalTurns = Number.isFinite(Number(r.totalTurns)) ? Number(r.totalTurns) : 0;
  return {
    id: typeof r.id === 'string' ? r.id : `replay_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    gameMode: typeof r.gameMode === 'string' ? r.gameMode : 'free_for_all',
    winner: typeof r.winner === 'string' ? r.winner : '',
    players: players as StoredReplay['players'],
    duration,
    totalTurns,
    createdAt: typeof r.createdAt === 'string' ? r.createdAt : new Date().toISOString(),
    log: r.log as StoredReplay['log'],
    finalState: (r.finalState ?? {}) as GameState,
  };
}

export function loadReplays(): StoredReplay[] {
  const parsed = safeGetJSON<unknown>(REPLAY_STORAGE_KEY, []);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((item) => sanitizeReplay(item))
    .filter((item): item is StoredReplay => item !== null);
}

export function saveReplays(replays: StoredReplay[]): void {
  const ok = safeSetJSON(REPLAY_STORAGE_KEY, replays);
  if (!ok) {
    logger.error('Failed to save replays: storage unavailable');
  }
}

export function formatDuration(seconds: number): string {
  const safeSeconds = Number.isFinite(seconds) && seconds >= 0 ? Math.floor(seconds) : 0;
  const mins = Math.floor(safeSeconds / 60);
  const secs = Math.floor(safeSeconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('zh-TW', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

interface ReplayListProps {
  replays: StoredReplay[];
  onSelect: (replay: StoredReplay) => void;
  onDelete: (id: string) => void;
  onImport: (replay: StoredReplay) => void;
}

const ReplayList = ({ replays, onSelect, onDelete, onImport }: ReplayListProps) => {
  const [showImport, setShowImport] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [importError, setImportError] = useState('');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [currentShareId, setCurrentShareId] = useState('');

  const handleImport = () => {
    setImportError('');
    if (!importCode.trim()) {
      setImportError('請輸入回放碼');
      return;
    }
    try {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(importCode.trim()))));
      const sanitized = sanitizeReplay(decoded);
      if (!sanitized) {
        throw new Error('無效的回放格式');
      }
      onImport(sanitized);
      setShowImport(false);
      setImportCode('');
    } catch (err) {
      setImportError('回放碼無效，請檢查後重試');
      logger.error('Import failed:', err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="max-w-2xl w-full mx-auto space-y-3 pb-8">
      {/* Import Button */}
      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={() => setShowImport(true)}
          className="cyber-btn px-4 py-2 text-sm flex items-center gap-2"
          style={{ borderColor: 'var(--pink)', color: 'var(--pink)' }}
        >
          <Upload size={16} />
          <span className="font-cyber tracking-wider">導入回放碼</span>
        </button>
      </div>

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div
            className="cyber-card p-6 w-full max-w-md"
            style={{ borderColor: 'var(--pink)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-cyber text-xl tracking-wider text-neon-pink">
                導入回放碼
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowImport(false);
                  setImportError('');
                  setImportCode('');
                }}
                className="p-1 hover:bg-white/10 rounded"
                style={{ color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>
            <textarea
              value={importCode}
              onChange={(e) => setImportCode(e.target.value)}
              placeholder="貼上回放碼..."
              className="cyber-input w-full h-32 resize-none text-xs font-mono"
              style={{ borderColor: 'var(--pink)' }}
            />
            {importError && (
              <div className="mt-2 text-xs flex items-center gap-1" style={{ color: 'var(--red)' }}>
                <AlertTriangle size={14} />
                {importError}
              </div>
            )}
            <button
              type="button"
              onClick={handleImport}
              className="cyber-btn w-full mt-4 py-2"
              style={{ borderColor: 'var(--pink)', color: 'var(--pink)' }}
            >
              <span className="font-cyber tracking-wider">導入</span>
            </button>
          </div>
        </div>
      )}

       {/* 分享彈窗 */}
      <ReplayShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareId={currentShareId}
      />

      {/* Replay Cards */}
      {replays.length === 0 ? (
        <div
          className="cyber-card p-12 text-center"
          style={{ borderColor: 'var(--border-neon)' }}
        >
          <div className="text-2xl mb-4 font-cyber tracking-wider" style={{ color: 'var(--cyan)' }}>回放</div>
          <div
            className="font-cyber text-lg tracking-wider mb-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            尚無回放紀錄
          </div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            完成一局遊戲後，回放將自動保存
          </div>
        </div>
      ) : (
        replays.map((replay) => (
          <div
            key={replay.id}
            onClick={() => onSelect(replay)}
            className="cyber-card p-4 cursor-pointer hover:scale-[1.01] transition-transform group"
            style={{ borderColor: 'var(--border-neon)' }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="font-cyber text-lg tracking-wider"
                    style={{ color: 'var(--cyan)', textShadow: '0 0 8px var(--cyan)' }}
                  >
                    {MODE_LABELS[replay.gameMode] || replay.gameMode}
                  </span>
                  {replay.winner && (
                    <span
                      className="text-xs flex items-center gap-1"
                      style={{ color: 'var(--yellow)' }}
                    >
                      <Trophy size={12} />
                      {replay.winner}
                    </span>
                  )}
                </div>
                <div
                  className="flex items-center gap-4 text-xs"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {replay.players.map((p) => p.name).join(' vs ')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatDuration(replay.duration)}
                  </span>
                  <span>{replay.totalTurns} 回合</span>
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {formatDate(replay.createdAt)} · {replay.log.length} 步
                </div>
              </div>
               <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button
                   type="button"
                   onClick={(e) => {
                     e.stopPropagation();
                     const id = uploadReplay(replay);
                     setCurrentShareId(id);
                     setShareModalOpen(true);
                   }}
                   className="p-2 hover:bg-pink-500/20 rounded transition-colors"
                   style={{ color: 'var(--pink)' }}
                   aria-label="分享"
                 >
                   <Share2 size={16} />
                 </button>
                 <button
                   type="button"
                   onClick={(e) => {
                     e.stopPropagation();
                     onDelete(replay.id);
                   }}
                   className="p-2 hover:bg-red-500/20 rounded transition-colors"
                   style={{ color: 'var(--red)' }}
                   aria-label="刪除"
                 >
                   <Trash2 size={16} />
                 </button>
               </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ReplayList;
