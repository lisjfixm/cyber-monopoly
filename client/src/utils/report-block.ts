const STORAGE_KEY = 'monopoly_report_block_state';

export type ReportStatus = 'pending' | 'reviewed' | 'action_taken';

export interface ReportRecord {
  id: string;
  targetNickname: string;
  targetVisitorId?: string;
  reason: string;
  detail: string;
  status: ReportStatus;
  createdAt: number;
}

export interface BlockRecord {
  id: string;
  targetNickname: string;
  targetVisitorId?: string;
  reason: string;
  createdAt: number;
}

export interface ReportBlockState {
  reports: ReportRecord[];
  blocks: BlockRecord[];
}

const REPORT_REASONS = [
  '惡意言語',
  '作弊/開掛',
  '消極對局',
  '騷擾行為',
  '違規暱稱',
  '其他',
];

function getDefaultState(): ReportBlockState {
  return { reports: [], blocks: [] };
}

function getReportBlockState(): ReportBlockState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw) as Partial<ReportBlockState>;
    return {
      reports: Array.isArray(parsed.reports) ? parsed.reports : [],
      blocks: Array.isArray(parsed.blocks) ? parsed.blocks : [],
    };
  } catch {
    return getDefaultState();
  }
}

function saveReportBlockState(state: ReportBlockState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function genId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function submitReport(
  nickname: string,
  visitorId: string | undefined,
  reason: string,
  detail: string,
): ReportRecord {
  const state = getReportBlockState();
  const record: ReportRecord = {
    id: genId(),
    targetNickname: nickname,
    targetVisitorId: visitorId,
    reason,
    detail,
    status: 'pending',
    createdAt: Date.now(),
  };
  state.reports.unshift(record);
  saveReportBlockState(state);
  return record;
}

function blockPlayer(
  nickname: string,
  visitorId: string | undefined,
  reason: string,
): BlockRecord {
  const state = getReportBlockState();
  // 避免重複拉黑
  const existing = state.blocks.find(
    (b: BlockRecord) =>
      b.targetNickname === nickname ||
      (visitorId && b.targetVisitorId === visitorId),
  );
  if (existing) return existing;
  const record: BlockRecord = {
    id: genId(),
    targetNickname: nickname,
    targetVisitorId: visitorId,
    reason,
    createdAt: Date.now(),
  };
  state.blocks.unshift(record);
  saveReportBlockState(state);
  return record;
}

function unblockPlayer(id: string): void {
  const state = getReportBlockState();
  state.blocks = state.blocks.filter((b: BlockRecord) => b.id !== id);
  saveReportBlockState(state);
}

function isBlocked(nickname: string, visitorId?: string): boolean {
  const state = getReportBlockState();
  return state.blocks.some(
    (b: BlockRecord) =>
      b.targetNickname === nickname ||
      (visitorId && b.targetVisitorId === visitorId),
  );
}

function getBlockList(): BlockRecord[] {
  return getReportBlockState().blocks;
}

function getReportList(): ReportRecord[] {
  return getReportBlockState().reports;
}

function getStatusLabel(status: ReportStatus): string {
  switch (status) {
    case 'pending':
      return '官方處理中';
    case 'reviewed':
      return '已處理';
    case 'action_taken':
      return '已採取行動';
    default:
      return '未知';
  }
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export {
  REPORT_REASONS,
  getReportBlockState,
  saveReportBlockState,
  submitReport,
  blockPlayer,
  unblockPlayer,
  isBlocked,
  getBlockList,
  getReportList,
  getStatusLabel,
  formatTime,
};
