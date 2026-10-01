import type { FC } from 'react';
import { Copy, Check, AlertTriangle, X } from 'lucide-react';
import type { CustomMapData } from '@shared/api.interface';
import { MAX_CUSTOM_MAPS } from '@shared/game-config';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@client/src/components/ui/dialog';

interface EditorDialogsProps {
  showExport: boolean;
  onExportChange: (v: boolean) => void;
  exportText: string;
  copied: boolean;
  onCopy: () => void;

  showImport: boolean;
  onImportChange: (v: boolean) => void;
  importText: string;
  onImportTextChange: (v: string) => void;
  importError: string;
  onImport: () => void;

  showSaveList: boolean;
  onSaveListChange: (v: boolean) => void;
  saveMsg: string;
  savedMaps: CustomMapData[];
  onLoadMap: (m: CustomMapData) => void;
  onDeleteMap: (id: string) => void;

  showErrors: boolean;
  onErrorsChange: (v: boolean) => void;
  errors: string[];
}

const EditorDialogs: FC<EditorDialogsProps> = ({
  showExport,
  onExportChange,
  exportText,
  copied,
  onCopy,
  showImport,
  onImportChange,
  importText,
  onImportTextChange,
  importError,
  onImport,
  showSaveList,
  onSaveListChange,
  saveMsg,
  savedMaps,
  onLoadMap,
  onDeleteMap,
  showErrors,
  onErrorsChange,
  errors,
}) => {
  return (
    <>
      {/* Export dialog */}
      <Dialog open={showExport} onOpenChange={onExportChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-cyber tracking-wider text-neon-cyan">
              導出地圖
            </DialogTitle>
            <DialogDescription className="text-[var(--text-secondary)]">
              複製下方 base64 字串即可分享或備份你的地圖
            </DialogDescription>
          </DialogHeader>
          <textarea
            readOnly
            value={exportText}
            className="w-full h-32 p-2 text-xs font-mono resize-none rounded-sm cyber-input"
          />
          <DialogFooter>
            <button
              type="button"
              onClick={onCopy}
              className="cyber-btn cyber-btn-sm flex items-center gap-1"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? '已複製' : '複製'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import dialog */}
      <Dialog open={showImport} onOpenChange={onImportChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-cyber tracking-wider text-neon-pink">
              導入地圖
            </DialogTitle>
            <DialogDescription className="text-[var(--text-secondary)]">
              貼上 base64 格式的地圖資料
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={importText}
            onChange={(e) => onImportTextChange(e.target.value)}
            placeholder="貼上地圖 base64 字串..."
            className="w-full h-32 p-2 text-xs font-mono resize-none rounded-sm cyber-input"
          />
          {importError && (
            <div
              className="text-xs px-2 py-1.5 rounded-sm flex items-center gap-1"
              style={{
                color: 'var(--red)',
                background: 'rgba(255, 77, 109, 0.1)',
                border: '1px solid rgba(255, 77, 109, 0.3)',
              }}
            >
              <AlertTriangle size={12} />
              {importError}
            </div>
          )}
          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => onImportChange(false)}
              className="cyber-btn cyber-btn-sm"
            >
              取消
            </button>
            <button
              type="button"
              onClick={onImport}
              className="cyber-btn cyber-btn-sm cyber-btn-pink"
            >
              導入
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Saved maps dialog */}
      <Dialog open={showSaveList} onOpenChange={onSaveListChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-cyber tracking-wider text-neon-cyan">
              已保存地圖
            </DialogTitle>
            <DialogDescription className="text-[var(--text-secondary)]">
              最多 {MAX_CUSTOM_MAPS} 張
            </DialogDescription>
          </DialogHeader>
          {saveMsg && (
            <div
              className="text-xs px-2 py-1.5 rounded-sm mb-2"
              style={{
                color: 'var(--green)',
                background: 'rgba(0, 255, 128, 0.1)',
                border: '1px solid rgba(0, 255, 128, 0.3)',
              }}
            >
              {saveMsg}
            </div>
          )}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {savedMaps.length === 0 && (
              <div className="text-center text-[var(--text-secondary)] py-6 text-sm">
                尚無保存的地圖
              </div>
            )}
            {savedMaps.map((m) => (
              <div
                key={m.id}
                className="cyber-card p-3 flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-cyber text-sm tracking-wide truncate">{m.name}</div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    {new Date(m.createdAt).toLocaleString('zh-TW')}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => onLoadMap(m)}
                    className="cyber-btn cyber-btn-sm text-xs"
                  >
                    載入
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteMap(m.id)}
                    className="p-1.5 rounded-sm transition-all hover:bg-red-500/20"
                    style={{ color: 'var(--red)' }}
                    title="刪除"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Validation errors dialog */}
      <Dialog open={showErrors} onOpenChange={onErrorsChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle
              className="font-cyber tracking-wider flex items-center gap-2"
              style={{ color: 'var(--red)' }}
            >
              <AlertTriangle size={18} />
              地圖校驗失敗
            </DialogTitle>
            <DialogDescription className="text-[var(--text-secondary)]">
              請修正以下問題後重試
            </DialogDescription>
          </DialogHeader>
          <div
            className="p-3 rounded-sm space-y-1.5"
            style={{
              background: 'rgba(255, 77, 109, 0.08)',
              border: '1px solid rgba(255, 77, 109, 0.3)',
              boxShadow: '0 0 15px rgba(255, 77, 109, 0.2)',
            }}
          >
            {errors.map((err, i) => (
              <div key={i} className="text-sm" style={{ color: 'var(--red)' }}>
                注意 {err}
              </div>
            ))}
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => onErrorsChange(false)}
              className="cyber-btn cyber-btn-sm"
            >
              確定
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditorDialogs;
