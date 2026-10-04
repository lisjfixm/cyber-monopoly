import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flag, UserX, AlertTriangle, Send } from 'lucide-react';
import { toast } from 'sonner';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@client/src/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';
import {
  getReportList,
  getBlockList,
  unblockPlayer,
  getStatusLabel,
  formatTime,
  submitReport,
  REPORT_REASONS,
} from '@client/src/utils/report-block';
import type { ReportRecord, BlockRecord } from '@client/src/utils/report-block';
import { useAudio } from '@client/src/hooks/useAudio';

const ReportBlockPage = () => {
  const navigate = useNavigate();
  const { playSfx } = useAudio();

  const [reports, setReports] = useState<ReportRecord[]>(getReportList());
  const [blocks, setBlocks] = useState<BlockRecord[]>(getBlockList());

  // 頁面內直接舉報的表單狀態
  const [targetName, setTargetName] = useState<string>('');
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [detail, setDetail] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmitReport = () => {
    const name = targetName.trim();
    if (!name) {
      setFormError('請輸入被舉報玩家的暱稱');
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    setFormError('');
    // 本地提交（閉環）：寫入報告 → 重新整理列表 → 回饋
    submitReport(name, undefined, reason, detail.trim());
    setReports(getReportList());
    setTargetName('');
    setDetail('');
    setReason(REPORT_REASONS[0]);
    setSubmitting(false);
    toast.success(`已提交對「${name}」的舉報，官方將儘快處理`);
  };

  const handleUnblock = (id: string) => {
    playSfx('click');
    unblockPlayer(id);
    setBlocks(getBlockList());
  };

  const handleBack = () => {
    playSfx('click');
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center px-4 py-8 scanlines relative">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            onClick={handleBack}
            className="cyber-btn p-2"
            style={{
              borderColor: 'rgba(0, 255, 255, 0.3)',
              color: 'var(--text-secondary)',
            }}
            title="返回"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-cyber text-2xl md:text-3xl text-neon-cyan tracking-wider pulse-glow">
              舉報與黑名單
            </h1>
            <p className="text-sm text-[var(--text-secondary)] font-cyber tracking-wider mt-1">
              REPORT · BLACKLIST
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="reports" className="w-full">
          <TabsList
            className="w-full grid grid-cols-2 mb-6 bg-[var(--bg-dark)] p-1 rounded"
            style={{ border: '1px solid var(--border-neon)' }}
          >
            <TabsTrigger
              value="reports"
              className="font-cyber tracking-wider text-sm py-2 data-[state=active]:text-neon-cyan"
            >
              <Flag size={14} className="inline mr-1.5" />
              舉報記錄
            </TabsTrigger>
            <TabsTrigger
              value="blocks"
              className="font-cyber tracking-wider text-sm py-2 data-[state=active]:text-neon-pink"
            >
              <UserX size={14} className="inline mr-1.5" />
              黑名單管理
            </TabsTrigger>
          </TabsList>

          {/* 舉報記錄 */}
          <TabsContent value="reports" className="space-y-3 mt-4">
            {/* 頁面內直接舉報表單（閉環） */}
            <div
              className="cyber-card p-4 space-y-3"
              style={{ borderColor: 'rgba(250, 204, 21, 0.3)' }}
            >
              <div className="flex items-center gap-2">
                <Flag size={16} style={{ color: 'var(--yellow)' }} />
                <span className="font-cyber text-sm tracking-wider text-[var(--text-primary)]">
                  新增舉報
                </span>
              </div>
              <input
                type="text"
                value={targetName}
                onChange={(e) => { setTargetName(e.target.value.slice(0, 20)); setFormError(''); }}
                placeholder="被舉報玩家暱稱"
                maxLength={20}
                className="cyber-input w-full"
                style={{ borderColor: 'rgba(250, 204, 21, 0.3)' }}
              />
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger
                  className="w-full"
                  style={{ borderColor: 'rgba(250, 204, 21, 0.3)', color: 'var(--text-primary)' }}
                >
                  <SelectValue placeholder="選擇舉報原因" />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: 'hsl(240, 18%, 10%)', borderColor: 'var(--yellow)' }}>
                  {REPORT_REASONS.map((r: string) => (
                    <SelectItem key={r} value={r} className="text-[var(--text-primary)]">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value.slice(0, 200))}
                placeholder="補充說明（選填，最多 200 字）"
                rows={3}
                className="w-full bg-transparent rounded px-3 py-2 text-sm outline-none resize-none"
                style={{
                  border: '1px solid rgba(250, 204, 21, 0.25)',
                  color: 'var(--text-primary)',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                }}
              />
              {formError && (
                <div className="text-xs" style={{ color: 'var(--red)' }}>{formError}</div>
              )}
              <button
                type="button"
                onClick={handleSubmitReport}
                disabled={submitting}
                className="cyber-btn w-full py-2 text-sm font-cyber tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ borderColor: 'var(--yellow)', color: 'var(--yellow)' }}
              >
                <Send size={14} />
                {submitting ? '提交中...' : '提交舉報'}
              </button>
            </div>

            {reports.length === 0 ? (
              <div className="cyber-card p-10 text-center">
                <Flag
                  size={48}
                  className="mx-auto mb-4 opacity-30"
                  style={{ color: 'var(--cyan)' }}
                />
                <p className="text-[var(--text-secondary)] font-cyber tracking-wider text-sm">
                  暫無舉報記錄
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  如遇不當行為，可在對局或匹配頁面提交舉報
                </p>
              </div>
            ) : (
              reports.map((r: ReportRecord) => (
                <div
                  key={r.id}
                  className="cyber-card p-4 space-y-2"
                  style={{ borderColor: 'rgba(0, 255, 255, 0.15)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} style={{ color: 'var(--yellow)' }} />
                      <span className="font-cyber text-sm tracking-wider text-[var(--text-primary)]">
                        {r.targetNickname}
                      </span>
                    </div>
                    <span
                      className="text-xs font-cyber px-2 py-0.5 rounded"
                      style={{
                        color:
                          r.status === 'action_taken'
                            ? 'var(--green)'
                            : r.status === 'reviewed'
                              ? 'var(--cyan)'
                              : 'var(--yellow)',
                        border: `1px solid ${
                          r.status === 'action_taken'
                            ? 'var(--green)'
                            : r.status === 'reviewed'
                              ? 'var(--cyan)'
                              : 'var(--yellow)'
                        }`,
                        backgroundColor:
                          r.status === 'action_taken'
                            ? 'rgba(0, 255, 128, 0.1)'
                            : r.status === 'reviewed'
                              ? 'rgba(0, 255, 255, 0.1)'
                              : 'rgba(250, 204, 21, 0.1)',
                      }}
                    >
                      {getStatusLabel(r.status)}
                    </span>
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    <span className="text-[var(--text-muted)]">原因：</span>
                    {r.reason}
                  </div>
                  {r.detail && (
                    <div className="text-sm text-[var(--text-secondary)]">
                      <span className="text-[var(--text-muted)]">補充：</span>
                      {r.detail}
                    </div>
                  )}
                  <div className="text-xs text-[var(--text-muted)] font-cyber tracking-wider">
                    {formatTime(r.createdAt)}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* 黑名單 */}
          <TabsContent value="blocks" className="space-y-3 mt-4">
            {blocks.length === 0 ? (
              <div className="cyber-card p-10 text-center">
                <UserX
                  size={48}
                  className="mx-auto mb-4 opacity-30"
                  style={{ color: 'var(--pink)' }}
                />
                <p className="text-[var(--text-secondary)] font-cyber tracking-wider text-sm">
                  黑名單為空
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  拉黑的玩家將無法與你匹配
                </p>
              </div>
            ) : (
              blocks.map((b: BlockRecord) => (
                <div
                  key={b.id}
                  className="cyber-card p-4 flex items-center justify-between"
                  style={{ borderColor: 'rgba(255, 107, 157, 0.2)' }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <UserX size={16} style={{ color: 'var(--pink)' }} />
                      <span className="font-cyber text-sm tracking-wider text-[var(--text-primary)]">
                        {b.targetNickname}
                      </span>
                    </div>
                    {b.reason && (
                      <div className="text-xs text-[var(--text-secondary)]">
                        <span className="text-[var(--text-muted)]">原因：</span>
                        {b.reason}
                      </div>
                    )}
                    <div className="text-xs text-[var(--text-muted)] font-cyber tracking-wider">
                      {formatTime(b.createdAt)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUnblock(b.id)}
                    className="cyber-btn px-3 py-1.5 text-xs"
                    style={{
                      borderColor: 'var(--cyan)',
                      color: 'var(--cyan)',
                    }}
                  >
                    移除
                  </button>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* 版本 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[var(--text-muted)] text-xs font-cyber tracking-wider">
        v1.0 · CYBER MONOPOLY
      </div>
    </div>
  );
};

export default ReportBlockPage;
