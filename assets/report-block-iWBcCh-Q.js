const STORAGE_KEY = "monopoly_report_block_state";
const REPORT_REASONS = ["惡意言語", "作弊/開掛", "消極對局", "騷擾行為", "違規暱稱", "其他"];
function getDefaultState() {
  return {
    reports: [],
    blocks: []
  };
}
function getReportBlockState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw);
    return {
      reports: Array.isArray(parsed.reports) ? parsed.reports : [],
      blocks: Array.isArray(parsed.blocks) ? parsed.blocks : []
    };
  } catch {
    return getDefaultState();
  }
}
function saveReportBlockState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
  }
}
function genId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
function submitReport(nickname, visitorId, reason, detail) {
  const state = getReportBlockState();
  const record = {
    id: genId(),
    targetNickname: nickname,
    targetVisitorId: visitorId,
    reason,
    detail,
    status: "pending",
    createdAt: Date.now()
  };
  state.reports.unshift(record);
  saveReportBlockState(state);
  return record;
}
function blockPlayer(nickname, visitorId, reason) {
  const state = getReportBlockState();
  const existing = state.blocks.find((b) => b.targetNickname === nickname || visitorId);
  if (existing) return existing;
  const record = {
    id: genId(),
    targetNickname: nickname,
    targetVisitorId: visitorId,
    reason,
    createdAt: Date.now()
  };
  state.blocks.unshift(record);
  saveReportBlockState(state);
  return record;
}
function unblockPlayer(id) {
  const state = getReportBlockState();
  state.blocks = state.blocks.filter((b) => b.id !== id);
  saveReportBlockState(state);
}
function isBlocked(nickname, visitorId) {
  const state = getReportBlockState();
  return state.blocks.some((b) => b.targetNickname === nickname || visitorId);
}
function getBlockList() {
  return getReportBlockState().blocks;
}
function getReportList() {
  return getReportBlockState().reports;
}
function getStatusLabel(status) {
  switch (status) {
    case "pending":
      return "官方處理中";
    case "reviewed":
      return "已處理";
    case "action_taken":
      return "已採取行動";
    default:
      return "未知";
  }
}
function formatTime(timestamp) {
  const d = new Date(timestamp);
  const pad = (n) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
export {
  REPORT_REASONS as R,
  getBlockList as a,
  blockPlayer as b,
  getStatusLabel as c,
  formatTime as f,
  getReportList as g,
  isBlocked as i,
  submitReport as s,
  unblockPlayer as u
};
