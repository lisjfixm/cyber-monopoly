import { useState } from 'react';
import { Flag, UserX } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@client/src/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';
import { Textarea } from '@client/src/components/ui/textarea';
import {
  submitReport,
  blockPlayer,
  REPORT_REASONS,
} from '@client/src/utils/report-block';

interface ReportBlockDialogsProps {
  showReport: boolean;
  onReportOpenChange: (open: boolean) => void;
  showBlock: boolean;
  onBlockOpenChange: (open: boolean) => void;
  opponentNickname: string;
  onPlaySfx?: () => void;
}

const ReportBlockDialogs = ({
  showReport,
  onReportOpenChange,
  showBlock,
  onBlockOpenChange,
  opponentNickname,
  onPlaySfx,
}: ReportBlockDialogsProps) => {
  const [reportReason, setReportReason] = useState<string>(REPORT_REASONS[0]);
  const [reportDetail, setReportDetail] = useState<string>('');
  const [reportSubmitted, setReportSubmitted] = useState<boolean>(false);
  const [blockReason, setBlockReason] = useState<string>('');
  const [blockedDone, setBlockedDone] = useState<boolean>(false);

  const handleOpenReport = (open: boolean) => {
    if (open) {
      setReportReason(REPORT_REASONS[0]);
      setReportDetail('');
      setReportSubmitted(false);
    }
    onReportOpenChange(open);
  };

  const handleOpenBlock = (open: boolean) => {
    if (open) {
      setBlockReason('');
      setBlockedDone(false);
    }
    onBlockOpenChange(open);
  };

  return (
    <>
      {/* 舉報彈窗 */}
      <Dialog open={showReport} onOpenChange={handleOpenReport}>
        <DialogContent
          className="cyber-card max-w-md"
          style={{
            borderColor: 'var(--yellow)',
            boxShadow: '0 0 30px rgba(250, 204, 21, 0.3)',
            backgroundColor: 'hsl(240, 18%, 10%)',
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="font-cyber text-xl tracking-wider"
              style={{ color: 'var(--yellow)', textShadow: '0 0 10px rgba(250, 204, 21, 0.5)' }}
            >
              <Flag size={18} className="inline mr-2" />
              舉報玩家
            </DialogTitle>
            <DialogDescription className="text-[var(--text-secondary)] text-sm">
              被舉報玩家：<span className="text-[var(--text-primary)] font-cyber">{opponentNickname}</span>
            </DialogDescription>
          </DialogHeader>

          {reportSubmitted ? (
            <div className="py-6 text-center">
              <div
                className="inline-block p-4 rounded-full mb-4"
                style={{
                  backgroundColor: 'rgba(0, 255, 128, 0.1)',
                  border: '1px solid var(--green)',
                }}
              >
                <Flag size={32} style={{ color: 'var(--green)' }} />
              </div>
              <p className="text-neon-green font-cyber tracking-wider">
                舉報已提交
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-2">
                官方將在 24 小時內處理，感謝您的回饋
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] font-cyber tracking-wider mb-2">
                  舉報原因
                </label>
                <Select value={reportReason} onValueChange={setReportReason}>
                  <SelectTrigger
                    className="w-full"
                    style={{
                      borderColor: 'rgba(250, 204, 21, 0.3)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <SelectValue placeholder="請選擇原因" />
                  </SelectTrigger>
                  <SelectContent
                    style={{
                      backgroundColor: 'hsl(240, 18%, 10%)',
                      borderColor: 'var(--yellow)',
                    }}
                  >
                    {REPORT_REASONS.map((r: string) => (
                      <SelectItem
                        key={r}
                        value={r}
                        className="text-[var(--text-primary)]"
                      >
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] font-cyber tracking-wider mb-2">
                  補充說明（選填）
                </label>
                <Textarea
                  value={reportDetail}
                  onChange={(e) => setReportDetail(e.target.value)}
                  placeholder="請描述具體情況..."
                  className="w-full min-h-[100px] resize-none"
                  style={{
                    borderColor: 'rgba(250, 204, 21, 0.3)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'hsl(240, 20%, 8%)',
                  }}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {reportSubmitted ? (
              <button
                type="button"
                onClick={() => onReportOpenChange(false)}
                className="cyber-btn px-5 py-2 text-sm w-full sm:w-auto"
                style={{
                  borderColor: 'var(--green)',
                  color: 'var(--green)',
                }}
              >
                確定
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onReportOpenChange(false)}
                  className="cyber-btn px-5 py-2 text-sm w-full sm:w-auto"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onPlaySfx?.();
                    submitReport(opponentNickname, undefined, reportReason, reportDetail);
                    setReportSubmitted(true);
                  }}
                  className="cyber-btn px-5 py-2 text-sm w-full sm:w-auto font-cyber tracking-wider"
                  style={{
                    borderColor: 'var(--yellow)',
                    color: 'var(--yellow)',
                  }}
                >
                  提交舉報
                </button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 拉黑確認彈窗 */}
      <Dialog open={showBlock} onOpenChange={handleOpenBlock}>
        <DialogContent
          className="cyber-card max-w-md"
          style={{
            borderColor: 'var(--red)',
            boxShadow: '0 0 30px rgba(255, 77, 109, 0.3)',
            backgroundColor: 'hsl(240, 18%, 10%)',
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="font-cyber text-xl tracking-wider"
              style={{ color: 'var(--red)', textShadow: '0 0 10px rgba(255, 77, 109, 0.5)' }}
            >
              <UserX size={18} className="inline mr-2" />
              確認拉黑
            </DialogTitle>
            <DialogDescription className="text-[var(--text-secondary)] text-sm">
              拉黑後，你將不會再與該玩家匹配到同一局遊戲。
            </DialogDescription>
          </DialogHeader>

          {blockedDone ? (
            <div className="py-6 text-center">
              <div
                className="inline-block p-4 rounded-full mb-4"
                style={{
                  backgroundColor: 'rgba(255, 77, 109, 0.1)',
                  border: '1px solid var(--red)',
                }}
              >
                <UserX size={32} style={{ color: 'var(--red)' }} />
              </div>
              <p className="font-cyber tracking-wider" style={{ color: 'var(--red)' }}>
                已加入黑名單
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-2">
                {opponentNickname} 已被拉黑
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div
                className="p-3 rounded"
                style={{
                  border: '1px solid rgba(255, 77, 109, 0.3)',
                  backgroundColor: 'rgba(255, 77, 109, 0.05)',
                }}
              >
                <div className="text-xs text-[var(--text-muted)] mb-1">拉黑對象</div>
                <div className="font-cyber text-[var(--text-primary)]">
                  {opponentNickname}
                </div>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] font-cyber tracking-wider mb-2">
                  拉黑原因（選填）
                </label>
                <Textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="簡述拉黑原因..."
                  className="w-full min-h-[60px] resize-none"
                  style={{
                    borderColor: 'rgba(255, 77, 109, 0.3)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'hsl(240, 20%, 8%)',
                  }}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {blockedDone ? (
              <button
                type="button"
                onClick={() => onBlockOpenChange(false)}
                className="cyber-btn px-5 py-2 text-sm w-full sm:w-auto"
                style={{
                  borderColor: 'var(--red)',
                  color: 'var(--red)',
                }}
              >
                確定
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onBlockOpenChange(false)}
                  className="cyber-btn px-5 py-2 text-sm w-full sm:w-auto"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onPlaySfx?.();
                    blockPlayer(opponentNickname, undefined, blockReason);
                    setBlockedDone(true);
                  }}
                  className="cyber-btn px-5 py-2 text-sm w-full sm:w-auto font-cyber tracking-wider"
                  style={{
                    borderColor: 'var(--red)',
                    color: 'var(--red)',
                  }}
                >
                  確認拉黑
                </button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReportBlockDialogs;
