import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Shield,
  Trash2,
  Crown,
  Star,
  Users,
  MessageSquare,
  ListTodo,
  UserCheck,
  Settings,
  Send,
  Sticker,
  AlertTriangle,
  Coins,
  Gift,
  LogOut,
  X,
  Check,
  ChevronRight,
  Trophy,
  Edit3,
  Megaphone,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { usePlayerIdentity } from '@client/src/hooks/usePlayerIdentity';
import {
  getGuildState,
  saveGuildState,
  createGuild,
  requestJoinGuild,
  approveJoinRequest,
  rejectJoinRequest,
  kickMember,
  transferLeadership,
  leaveGuild,
  disbandGuild,
  claimTaskReward,
  updateGuildAnnouncement,
  getGuildRankings,
} from '@client/src/utils/guild';
import type {
  Guild,
  GuildState,
  GuildMember,
  GuildTask,
  BadgeIcon,
  GuildJoinRequest,
  GuildRankingItem,
  ChatMessage,
} from '@client/src/utils/social.types';
import { getGuildMessages, sendGuildMessage, addReport } from '@client/src/utils/chat-store';
import { GuildBadge, BADGE_ICONS } from '@client/src/components/social/GuildBadge';
import { CyberSticker, STICKER_LIST } from '@client/src/components/social/CyberSticker';

const COLOR_OPTIONS = [
  { value: '#00ffff', label: '霓虹青' },
  { value: '#ff00ff', label: '霓虹粉' },
  { value: '#a855f7', label: '紫羅蘭' },
  { value: '#00ff80', label: '電子綠' },
  { value: '#ffd700', label: '黃金' },
  { value: '#ff4444', label: '赤焰紅' },
];

const REPORT_REASONS = [
  '騷擾或辱罵',
  '不當言論',
  '廣告或垃圾訊息',
  '詐騙或釣魚',
  '其他',
];

function hashStringToColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 55%)`;
}

function getStatusInfo(status?: string): { label: string; color: string } {
  switch (status) {
    case 'online':
      return { label: '線上', color: 'var(--green)' };
    case 'in_game':
      return { label: '遊戲中', color: '#ffd700' };
    case 'away':
      return { label: '離開', color: '#ff9f43' };
    case 'offline':
    default:
      return { label: '離線', color: 'var(--text-secondary)' };
  }
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  } catch {
    return '';
  }
}

function formatDate(iso: string): string {
  try {
    return iso.split('T')[0];
  } catch {
    return iso;
  }
}

type ExploreTab = 'join' | 'ranking';
type GuildTab = 'members' | 'chat' | 'tasks' | 'approval' | 'manage';

const GuildPage = () => {
  const navigate = useNavigate();
  const { visitorId, nickname } = usePlayerIdentity();

  const [guildState, setGuildState] = useState<GuildState>({
    currentGuild: null,
    availableGuilds: [],
    rankings: [],
  });
  const [exploreTab, setExploreTab] = useState<ExploreTab>('join');
  const [guildTab, setGuildTab] = useState<GuildTab>('members');

  // Create modal
  const [showCreate, setShowCreate] = useState<boolean>(false);
  const [formName, setFormName] = useState<string>('');
  const [formTag, setFormTag] = useState<string>('');
  const [formDesc, setFormDesc] = useState<string>('');
  const [formColor, setFormColor] = useState<string>('#00ffff');
  const [formBadge, setFormBadge] = useState<BadgeIcon>('shield');

  // Join request modal
  const [joinRequestGuild, setJoinRequestGuild] = useState<Guild | null>(null);
  const [joinMessage, setJoinMessage] = useState<string>('');

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [showStickerPicker, setShowStickerPicker] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Report dialog
  const [reportMsg, setReportMsg] = useState<ChatMessage | null>(null);
  const [reportReason, setReportReason] = useState<string>('');

  // Kick / transfer dialog
  const [memberToKick, setMemberToKick] = useState<GuildMember | null>(null);
  const [memberToTransfer, setMemberToTransfer] = useState<GuildMember | null>(null);

  // Disband / leave dialog
  const [showDisbandDialog, setShowDisbandDialog] = useState<boolean>(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState<boolean>(false);

  // Announcement edit
  const [editingAnnouncement, setEditingAnnouncement] = useState<boolean>(false);
  const [announcementText, setAnnouncementText] = useState<string>('');

  // Load initial state
  useEffect(() => {
    const state = getGuildState();
    if (state.rankings.length === 0) {
      state.rankings = getGuildRankings();
      saveGuildState(state);
    }
    setGuildState(state);
  }, []);

  // Load chat messages when entering a guild or switching to chat tab
  useEffect(() => {
    if (guildState.currentGuild && guildTab === 'chat') {
      setChatMessages(getGuildMessages(guildState.currentGuild.id));
    }
  }, [guildState.currentGuild?.id, guildTab]);

  // Sync announcement text with current guild
  useEffect(() => {
    if (guildState.currentGuild) {
      setAnnouncementText(guildState.currentGuild.announcement || '');
    }
  }, [guildState.currentGuild?.id, guildState.currentGuild?.announcement]);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const refreshState = useCallback(() => {
    const s = getGuildState();
    setGuildState(s);
    saveGuildState(s);
  }, []);

  const currentMember = guildState.currentGuild?.members.find(
    (m) => m.id === visitorId,
  );
  const isLeader = currentMember?.role === '隊長';
  const isOfficer = currentMember?.role === '隊長' || currentMember?.role === '副隊長';

  // ========== Create Guild ==========
  const handleCreate = useCallback(() => {
    const name = formName.trim();
    const tag = formTag.trim().toUpperCase();
    if (!name) {
      toast.error('請輸入戰隊名稱');
      return;
    }
    if (name.length > 12) {
      toast.error('戰隊名稱不得超過 12 個字');
      return;
    }
    if (!tag) {
      toast.error('請輸入戰隊標籤');
      return;
    }
    if (tag.length > 5) {
      toast.error('標籤不得超過 5 個字元');
      return;
    }
    const newGuild = createGuild(
      name,
      tag,
      formDesc.trim(),
      formColor,
      formBadge,
      visitorId || 'local_user',
      nickname || '匿名玩家',
    );
    refreshState();
    setShowCreate(false);
    setFormName('');
    setFormTag('');
    setFormDesc('');
    setFormColor('#00ffff');
    setFormBadge('shield');
    toast.success(`戰隊「${newGuild.name}」已創建！`);
  }, [formName, formTag, formDesc, formColor, formBadge, visitorId, nickname, refreshState]);

  // ========== Request Join ==========
  const handleRequestJoin = useCallback(() => {
    if (!joinRequestGuild) return;
    const ok = requestJoinGuild(
      joinRequestGuild.id,
      visitorId || 'local_user',
      nickname || '匿名玩家',
      joinMessage.trim() || undefined,
    );
    if (ok) {
      toast.success('申請已發送，等待隊長審批');
      setJoinRequestGuild(null);
      setJoinMessage('');
    } else {
      toast.error('申請失敗，可能已在審批中');
    }
  }, [joinRequestGuild, visitorId, nickname, joinMessage]);

  // ========== Approve / Reject ==========
  const handleApprove = useCallback((req: GuildJoinRequest) => {
    if (!guildState.currentGuild) return;
    const ok = approveJoinRequest(guildState.currentGuild.id, req.id);
    if (ok) {
      refreshState();
      toast.success(`已通過 ${req.nickname} 的申請`);
    }
  }, [guildState.currentGuild, refreshState]);

  const handleReject = useCallback((req: GuildJoinRequest) => {
    if (!guildState.currentGuild) return;
    const ok = rejectJoinRequest(guildState.currentGuild.id, req.id);
    if (ok) {
      refreshState();
      toast.info(`已拒絕 ${req.nickname} 的申請`);
    }
  }, [guildState.currentGuild, refreshState]);

  // ========== Kick / Transfer ==========
  const handleKick = useCallback(() => {
    if (!guildState.currentGuild || !memberToKick) return;
    const ok = kickMember(guildState.currentGuild.id, memberToKick.id);
    if (ok) {
      refreshState();
      toast.info(`已將 ${memberToKick.nickname} 移出戰隊`);
      setMemberToKick(null);
    }
  }, [guildState.currentGuild, memberToKick, refreshState]);

  const handleTransfer = useCallback(() => {
    if (!guildState.currentGuild || !memberToTransfer || !currentMember) return;
    const ok = transferLeadership(
      guildState.currentGuild.id,
      currentMember.id,
      memberToTransfer.id,
    );
    if (ok) {
      refreshState();
      toast.success(`已轉讓隊長給 ${memberToTransfer.nickname}`);
      setMemberToTransfer(null);
    }
  }, [guildState.currentGuild, memberToTransfer, currentMember, refreshState]);

  // ========== Leave / Disband ==========
  const handleLeave = useCallback(() => {
    if (!guildState.currentGuild) return;
    const name = guildState.currentGuild.name;
    leaveGuild();
    refreshState();
    setShowLeaveDialog(false);
    toast.info(`已退出戰隊「${name}」`);
  }, [guildState.currentGuild, refreshState]);

  const handleDisband = useCallback(() => {
    if (!guildState.currentGuild) return;
    const name = guildState.currentGuild.name;
    disbandGuild();
    refreshState();
    setShowDisbandDialog(false);
    toast.info(`戰隊「${name}」已解散`);
  }, [guildState.currentGuild, refreshState]);

  // ========== Claim Task ==========
  const handleClaim = useCallback((task: GuildTask) => {
    if (!guildState.currentGuild) return;
    const reward = claimTaskReward(guildState.currentGuild.id, task.id);
    if (reward) {
      refreshState();
      const rewardText = reward.item
        ? `${reward.coins} 金幣 + ${reward.item}`
        : `${reward.coins} 金幣`;
      toast.success(`獎勵已領取：${rewardText}`);
    } else {
      toast.error('領取失敗');
    }
  }, [guildState.currentGuild, refreshState]);

  // ========== Announcement ==========
  const startEditAnnouncement = useCallback(() => {
    if (!guildState.currentGuild) return;
    setAnnouncementText(guildState.currentGuild.announcement || '');
    setEditingAnnouncement(true);
  }, [guildState.currentGuild]);

  const saveAnnouncement = useCallback(() => {
    if (!guildState.currentGuild) return;
    const ok = updateGuildAnnouncement(guildState.currentGuild.id, announcementText.trim());
    if (ok) {
      refreshState();
      setEditingAnnouncement(false);
      toast.success('公告已更新');
    }
  }, [guildState.currentGuild, announcementText, refreshState]);

  // ========== Chat ==========
  const handleSendMessage = useCallback(() => {
    if (!guildState.currentGuild) return;
    const text = chatInput.trim();
    if (!text) return;
    const newMsg = sendGuildMessage(guildState.currentGuild.id, {
      senderId: visitorId || 'local_user',
      senderName: nickname || '匿名玩家',
      senderGuildTag: guildState.currentGuild.tag,
      content: text,
      type: 'text',
    });
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');
  }, [guildState.currentGuild, visitorId, nickname, chatInput]);

  const handleSendSticker = useCallback((stickerId: string) => {
    if (!guildState.currentGuild) return;
    const stickerInfo = STICKER_LIST.find((s) => s.id === stickerId);
    const newMsg = sendGuildMessage(guildState.currentGuild.id, {
      senderId: visitorId || 'local_user',
      senderName: nickname || '匿名玩家',
      senderGuildTag: guildState.currentGuild.tag,
      content: stickerInfo?.name || '',
      type: 'sticker',
      stickerId,
    });
    setChatMessages((prev) => [...prev, newMsg]);
    setShowStickerPicker(false);
  }, [guildState.currentGuild, visitorId, nickname]);

  const handleReport = useCallback(() => {
    if (!reportMsg || !reportReason) return;
    addReport({
      targetUserId: reportMsg.senderId,
      targetUserName: reportMsg.senderName,
      reason: reportReason,
      messageContent: reportMsg.content,
    });
    toast.success('檢舉已提交，管理員將儘快處理');
    setReportMsg(null);
    setReportReason('');
  }, [reportMsg, reportReason]);

  const guild = guildState.currentGuild;

  // ============================================================
  // Not in guild — explore view
  // ============================================================
  if (!guild) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center px-4 py-6 scanlines">
        <div className="w-full max-w-2xl flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="cyber-btn p-2"
            style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1
            className="font-cyber text-2xl md:text-3xl font-bold tracking-wider flex-1 flex items-center gap-2"
            style={{ color: 'var(--cyan)', textShadow: '0 0 10px var(--cyan), 0 0 20px var(--cyan)' }}
          >
            <Shield size={28} />
            戰隊中心
          </h1>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="cyber-btn px-3 py-2 text-sm flex items-center gap-1"
            style={{
              borderColor: 'var(--green)',
              color: 'var(--green)',
              background: 'rgba(0,255,128,0.1)',
              boxShadow: '0 0 10px rgba(0,255,128,0.25)',
            }}
          >
            <Plus size={16} />
            創建戰隊
          </button>
        </div>

        {/* Tab switcher */}
        <div className="w-full max-w-2xl flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setExploreTab('join')}
            className={`flex-1 py-2 text-sm font-cyber tracking-wider rounded-t border-b-2 transition-all ${
              exploreTab === 'join' ? '' : 'opacity-60'
            }`}
            style={{
              borderColor: exploreTab === 'join' ? 'var(--cyan)' : 'transparent',
              color: exploreTab === 'join' ? 'var(--cyan)' : 'var(--text-secondary)',
              textShadow: exploreTab === 'join' ? '0 0 8px var(--cyan)' : 'none',
            }}
          >
            可加入戰隊
          </button>
          <button
            type="button"
            onClick={() => setExploreTab('ranking')}
            className={`flex-1 py-2 text-sm font-cyber tracking-wider rounded-t border-b-2 transition-all ${
              exploreTab === 'ranking' ? '' : 'opacity-60'
            }`}
            style={{
              borderColor: exploreTab === 'ranking' ? '#ffd700' : 'transparent',
              color: exploreTab === 'ranking' ? '#ffd700' : 'var(--text-secondary)',
              textShadow: exploreTab === 'ranking' ? '0 0 8px #ffd700' : 'none',
            }}
          >
            戰隊排行榜
          </button>
        </div>

        <div className="w-full max-w-2xl space-y-3">
          {exploreTab === 'join' && (
            <>
              {guildState.availableGuilds.map((g) => (
                <div
                  key={g.id}
                  className="cyber-card p-4 flex items-center gap-4"
                  style={{ borderColor: `${g.color}60` }}
                >
                  <GuildBadge icon={g.badgeIcon} color={g.color} size={56} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="font-cyber font-bold text-base truncate"
                        style={{ color: g.color, textShadow: `0 0 6px ${g.color}80` }}
                      >
                        {g.name}
                      </span>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded font-mono"
                        style={{ backgroundColor: `${g.color}22`, color: g.color }}
                      >
                        [{g.tag}]
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 truncate">
                      {g.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-secondary)]">
                      <span className="flex items-center gap-1">
                        <Star size={10} style={{ color: g.color }} />
                        Lv.{g.level}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={10} />
                        {g.members.length} 人
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap size={10} style={{ color: '#ffd700' }} />
                        {g.score.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setJoinRequestGuild(g)}
                    className="cyber-btn px-3 py-2 text-sm shrink-0"
                    style={{
                      borderColor: g.color,
                      color: g.color,
                      background: `${g.color}15`,
                    }}
                  >
                    申請加入
                  </button>
                </div>
              ))}
              {guildState.availableGuilds.length === 0 && (
                <div className="cyber-card p-8 text-center text-[var(--text-secondary)]">
                  暫無可加入的戰隊
                </div>
              )}
            </>
          )}

          {exploreTab === 'ranking' && (
            <div className="cyber-card p-4" style={{ borderColor: '#ffd70060' }}>
              <div className="flex items-center gap-2 mb-4">
                <Trophy size={20} style={{ color: '#ffd700' }} />
                <span
                  className="font-cyber tracking-wider"
                  style={{ color: '#ffd700', textShadow: '0 0 8px #ffd70080' }}
                >
                  戰隊積分榜
                </span>
              </div>
              <div className="space-y-2">
                {guildState.rankings.map((r: GuildRankingItem, idx: number) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 p-2 rounded bg-[var(--bg-mid)]/50 border border-[var(--border-neon)]/30"
                  >
                    <span
                      className="w-8 text-center font-cyber font-bold text-lg"
                      style={{
                        color: idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : 'var(--text-secondary)',
                        textShadow: idx < 3 ? `0 0 6px ${idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : '#cd7f32'}` : 'none',
                      }}
                    >
                      {idx + 1}
                    </span>
                    <GuildBadge icon={r.badgeIcon} color={r.color} size={36} />
                    <div className="flex-1 min-w-0">
                      <span
                        className="font-cyber text-sm truncate block"
                        style={{ color: r.color }}
                      >
                        {r.name}
                      </span>
                      <span className="text-xs text-[var(--text-secondary)]">
                        Lv.{r.level} · {r.members} 人
                      </span>
                    </div>
                    <span
                      className="text-sm font-cyber"
                      style={{ color: '#ffd700' }}
                    >
                      {r.score.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Create Guild Dialog */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div
              className="cyber-card w-full max-w-md p-6 relative"
              style={{ borderColor: 'var(--green)', boxShadow: '0 0 30px rgba(0,255,128,0.3)' }}
            >
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="absolute top-3 right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X size={20} />
              </button>
              <h2
                className="font-cyber text-xl tracking-wider mb-5 flex items-center gap-2"
                style={{ color: 'var(--green)', textShadow: '0 0 8px var(--green)' }}
              >
                <Plus size={22} />
                創建戰隊
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">戰隊名稱</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    maxLength={12}
                    placeholder="最多 12 字"
                    className="w-full px-3 py-2 bg-[var(--bg-mid)] border border-[var(--border-neon)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--green)]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">戰隊標籤 (TAG)</label>
                  <input
                    type="text"
                    value={formTag}
                    onChange={(e) => setFormTag(e.target.value.toUpperCase())}
                    maxLength={5}
                    placeholder="最多 5 字元，如 NEON"
                    className="w-full px-3 py-2 bg-[var(--bg-mid)] border border-[var(--border-neon)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--green)] font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">戰隊簡介</label>
                  <textarea
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    maxLength={50}
                    rows={2}
                    placeholder="一句話描述你的戰隊（最多 50 字）"
                    className="w-full px-3 py-2 bg-[var(--bg-mid)] border border-[var(--border-neon)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--green)] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-2">標誌顏色</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setFormColor(c.value)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          formColor === c.value ? 'scale-110' : ''
                        }`}
                        style={{
                          backgroundColor: c.value,
                          borderColor: formColor === c.value ? '#fff' : 'transparent',
                          boxShadow: formColor === c.value ? `0 0 15px ${c.value}` : 'none',
                        }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-2">徽章圖標</label>
                  <div className="flex gap-2 flex-wrap">
                    {BADGE_ICONS.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setFormBadge(b.id)}
                        className={`p-2 rounded-lg border-2 transition-all ${
                          formBadge === b.id ? 'scale-105' : ''
                        }`}
                        style={{
                          backgroundColor: `${formColor}15`,
                          borderColor: formBadge === b.id ? formColor : 'transparent',
                          boxShadow: formBadge === b.id ? `0 0 10px ${formColor}80` : 'none',
                        }}
                        title={b.name}
                      >
                        <GuildBadge icon={b.id} color={formColor} size={32} />
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCreate}
                  className="cyber-btn w-full py-3 font-cyber tracking-wider mt-2"
                  style={{
                    borderColor: 'var(--green)',
                    color: 'var(--green)',
                    background: 'rgba(0,255,128,0.12)',
                    boxShadow: '0 0 15px rgba(0,255,128,0.3)',
                  }}
                >
                  確認創建
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Join Request Dialog */}
        {joinRequestGuild && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div
              className="cyber-card w-full max-w-md p-6 relative"
              style={{ borderColor: joinRequestGuild.color, boxShadow: `0 0 30px ${joinRequestGuild.color}40` }}
            >
              <button
                type="button"
                onClick={() => setJoinRequestGuild(null)}
                className="absolute top-3 right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <GuildBadge icon={joinRequestGuild.badgeIcon} color={joinRequestGuild.color} size={48} />
                <div>
                  <h2
                    className="font-cyber text-lg tracking-wider"
                    style={{ color: joinRequestGuild.color, textShadow: `0 0 8px ${joinRequestGuild.color}` }}
                  >
                    申請加入 {joinRequestGuild.name}
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    [{joinRequestGuild.tag}] Lv.{joinRequestGuild.level}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">申請留言（選填）</label>
                  <textarea
                    value={joinMessage}
                    onChange={(e) => setJoinMessage(e.target.value)}
                    maxLength={50}
                    rows={3}
                    placeholder="介紹一下自己吧..."
                    className="w-full px-3 py-2 bg-[var(--bg-mid)] border border-[var(--border-neon)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--cyan)] resize-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRequestJoin}
                  className="cyber-btn w-full py-3 font-cyber tracking-wider"
                  style={{
                    borderColor: joinRequestGuild.color,
                    color: joinRequestGuild.color,
                    background: `${joinRequestGuild.color}15`,
                    boxShadow: `0 0 15px ${joinRequestGuild.color}40`,
                  }}
                >
                  發送申請
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // In guild — detail view
  // ============================================================
  return (
    <div className="min-h-screen w-full flex flex-col items-center px-4 py-6 scanlines">
      <div className="w-full max-w-2xl flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="cyber-btn p-2"
          style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1
          className="font-cyber text-2xl md:text-3xl font-bold tracking-wider flex-1 flex items-center gap-2"
          style={{ color: 'var(--cyan)', textShadow: '0 0 10px var(--cyan), 0 0 20px var(--cyan)' }}
        >
          <Shield size={28} />
          戰隊中心
        </h1>
      </div>

      {/* Guild banner */}
      <div className="w-full max-w-2xl mb-4">
        <div
          className="cyber-card p-5 relative overflow-hidden"
          style={{ borderColor: guild.color, boxShadow: `0 0 20px ${guild.color}40` }}
        >
          <div
            className="absolute top-0 right-0 w-48 h-48 opacity-10 blur-3xl rounded-full"
            style={{ backgroundColor: guild.color }}
          />
          <div className="relative flex items-start gap-4">
            <GuildBadge icon={guild.badgeIcon} color={guild.color} size={64} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  className="font-cyber text-xl md:text-2xl font-bold tracking-wider"
                  style={{ color: guild.color, textShadow: `0 0 10px ${guild.color}` }}
                >
                  {guild.name}
                </h2>
                <span
                  className="text-xs px-2 py-0.5 rounded font-mono tracking-wider"
                  style={{
                    backgroundColor: `${guild.color}22`,
                    color: guild.color,
                    border: `1px solid ${guild.color}60`,
                  }}
                >
                  [{guild.tag}]
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded font-cyber tracking-wider"
                  style={{
                    backgroundColor: `${guild.color}22`,
                    color: guild.color,
                    border: `1px solid ${guild.color}60`,
                  }}
                >
                  Lv.{guild.level}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-secondary)]">
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {guild.members.length} 位成員
                </span>
                <span className="flex items-center gap-1">
                  <Zap size={12} style={{ color: '#ffd700' }} />
                  {guild.score.toLocaleString()} 積分
                </span>
              </div>
            </div>
          </div>

          {/* Announcement */}
          <div className="relative mt-4 pt-4 border-t border-[var(--border-neon)]/30">
            <div className="flex items-start gap-2">
              <Megaphone size={14} style={{ color: guild.color }} className="shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                {editingAnnouncement && isLeader ? (
                  <div className="space-y-2">
                    <textarea
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                      maxLength={100}
                      rows={2}
                      placeholder="輸入公告內容..."
                      className="w-full px-3 py-2 bg-[var(--bg-mid)] border border-[var(--border-neon)] rounded text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--cyan)] resize-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingAnnouncement(false)}
                        className="px-3 py-1 text-xs text-[var(--text-secondary)] border border-[var(--border-neon)] rounded hover:text-[var(--text-primary)]"
                      >
                        取消
                      </button>
                      <button
                        type="button"
                        onClick={saveAnnouncement}
                        className="px-3 py-1 text-xs rounded"
                        style={{
                          border: `1px solid ${guild.color}`,
                          color: guild.color,
                          backgroundColor: `${guild.color}15`,
                        }}
                      >
                        保存
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-[var(--text-primary)]">
                      {guild.announcement || '暫無公告'}
                    </p>
                    {isLeader && (
                      <button
                        type="button"
                        onClick={startEditAnnouncement}
                        className="text-[var(--text-secondary)] hover:text-[var(--cyan)] shrink-0"
                        title="編輯公告"
                      >
                        <Edit3 size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="w-full max-w-2xl flex gap-1 mb-4 overflow-x-auto pb-1">
        {([
          { key: 'members' as const, label: '成員', icon: Users, color: 'var(--cyan)' },
          { key: 'chat' as const, label: '聊天', icon: MessageSquare, color: 'var(--pink)' },
          { key: 'tasks' as const, label: '任務', icon: ListTodo, color: 'var(--green)' },
          ...(isOfficer
            ? [{ key: 'approval' as const, label: '審批', icon: UserCheck, color: '#ffd700' }]
            : []),
          ...(isLeader
            ? [{ key: 'manage' as const, label: '管理', icon: Settings, color: 'var(--red)' }]
            : []),
        ]).map((tab) => {
          const Icon = tab.icon;
          const active = guildTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setGuildTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-cyber tracking-wider rounded-t border-b-2 transition-all whitespace-nowrap ${
                active ? '' : 'opacity-60'
              }`}
              style={{
                borderColor: active ? tab.color : 'transparent',
                color: active ? tab.color : 'var(--text-secondary)',
                textShadow: active ? `0 0 6px ${tab.color}` : 'none',
              }}
            >
              <Icon size={14} />
              {tab.label}
              {tab.key === 'approval' && guild.joinRequests.length > 0 && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: '#ffd700', color: '#000' }}
                >
                  {guild.joinRequests.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="w-full max-w-2xl">
        {/* ===== Members Tab ===== */}
        {guildTab === 'members' && (
          <div className="space-y-2">
            {guild.members.map((member) => {
              const status = getStatusInfo(member.onlineStatus);
              const avatarColor = hashStringToColor(member.avatarSeed || member.id);
              const initial = member.nickname.charAt(0);
              return (
                <div
                  key={member.id}
                  className="cyber-card p-3 flex items-center gap-3"
                  style={{ borderColor: 'var(--border-neon)' }}
                >
                  <div className="relative shrink-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{
                        background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}88)`,
                        boxShadow: `0 0 8px ${avatarColor}60`,
                        color: '#fff',
                      }}
                    >
                      {initial}
                    </div>
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[var(--bg-dark)]"
                      style={{ backgroundColor: status.color }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-[var(--text-primary)] font-medium truncate">
                        {member.nickname}
                      </span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-cyber tracking-wider"
                        style={{
                          backgroundColor:
                            member.role === '隊長'
                              ? 'rgba(255,215,0,0.15)'
                              : member.role === '副隊長'
                              ? 'rgba(0,255,255,0.15)'
                              : 'rgba(255,255,255,0.05)',
                          color:
                            member.role === '隊長'
                              ? '#ffd700'
                              : member.role === '副隊長'
                              ? 'var(--cyan)'
                              : 'var(--text-secondary)',
                          border: `1px solid ${
                            member.role === '隊長'
                              ? '#ffd70060'
                              : member.role === '副隊長'
                              ? 'var(--cyan)60'
                              : 'transparent'
                          }`,
                        }}
                      >
                        {member.role === '隊長' && <Crown size={10} className="inline mr-0.5" />}
                        {member.role === '副隊長' && <Star size={10} className="inline mr-0.5" />}
                        {member.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-secondary)]">
                      <span style={{ color: status.color }}>
                        ● {status.label}
                      </span>
                      <span>段位：{member.rank || '—'}</span>
                      <span>貢獻：{member.contribution ?? 0}</span>
                    </div>
                  </div>
                  {isLeader && member.id !== visitorId && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setMemberToTransfer(member)}
                        className="p-1.5 rounded hover:bg-[var(--bg-mid)]"
                        style={{ color: '#ffd700' }}
                        title="轉讓隊長"
                      >
                        <Crown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setMemberToKick(member)}
                        className="p-1.5 rounded hover:bg-[var(--bg-mid)]"
                        style={{ color: 'var(--red)' }}
                        title="踢出戰隊"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ===== Chat Tab ===== */}
        {guildTab === 'chat' && (
          <div className="cyber-card flex flex-col" style={{ borderColor: 'var(--pink)80', height: '60vh', minHeight: 400 }}>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.length === 0 && (
                <div className="text-center text-[var(--text-secondary)] text-sm py-8">
                  還沒有訊息，快說點什麼吧！
                </div>
              )}
              {chatMessages.map((msg) => {
                const isSelf = msg.senderId === visitorId;
                return (
                  <div key={msg.id} className={`flex gap-2 ${isSelf ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex-1 min-w-0 ${isSelf ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        {!isSelf && <span className="font-medium">{msg.senderName}</span>}
                        {msg.senderGuildTag && (
                          <span className="font-mono opacity-70">[{msg.senderGuildTag}]</span>
                        )}
                        {isSelf && <span className="font-medium">{msg.senderName}</span>}
                        <span className="opacity-50">{formatTime(msg.timestamp)}</span>
                        {!isSelf && (
                          <button
                            type="button"
                            onClick={() => {
                              setReportMsg(msg);
                              setReportReason('');
                            }}
                            className="opacity-50 hover:opacity-100 hover:text-[var(--red)]"
                            title="舉報"
                          >
                            <AlertTriangle size={12} />
                          </button>
                        )}
                      </div>
                      <div
                        className={`inline-block mt-1 px-3 py-2 rounded-lg text-sm max-w-[80%] text-left ${
                          isSelf ? '' : ''
                        }`}
                        style={{
                          backgroundColor: isSelf
                            ? 'rgba(255,0,255,0.12)'
                            : 'rgba(0,255,255,0.08)',
                          border: `1px solid ${
                            isSelf ? 'rgba(255,0,255,0.4)' : 'rgba(0,255,255,0.3)'
                          }`,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {msg.type === 'sticker' && msg.stickerId ? (
                          <CyberSticker id={msg.stickerId} size={72} />
                        ) : (
                          <span className="whitespace-pre-wrap break-words">{msg.content}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Sticker picker */}
            {showStickerPicker && (
              <div className="border-t border-[var(--border-neon)]/30 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[var(--text-secondary)]">選擇貼圖</span>
                  <button
                    type="button"
                    onClick={() => setShowStickerPicker(false)}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {STICKER_LIST.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSendSticker(s.id)}
                      className="p-2 rounded hover:bg-[var(--bg-mid)] flex items-center justify-center transition-colors"
                      title={s.name}
                    >
                      <CyberSticker id={s.id} size={36} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input bar */}
            <div className="border-t border-[var(--border-neon)]/30 p-2 flex items-end gap-2">
              <button
                type="button"
                onClick={() => setShowStickerPicker((p) => !p)}
                className="p-2 rounded cyber-btn shrink-0"
                style={{
                  borderColor: 'var(--pink)',
                  color: 'var(--pink)',
                  background: 'rgba(255,0,255,0.08)',
                }}
                title="貼圖"
              >
                <Sticker size={18} />
              </button>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="輸入訊息..."
                className="flex-1 px-3 py-2 bg-[var(--bg-mid)] border border-[var(--border-neon)] rounded text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--pink)]"
              />
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!chatInput.trim()}
                className="cyber-btn p-2 shrink-0"
                style={{
                  borderColor: 'var(--pink)',
                  color: 'var(--pink)',
                  background: 'rgba(255,0,255,0.1)',
                  opacity: chatInput.trim() ? 1 : 0.4,
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ===== Tasks Tab ===== */}
        {guildTab === 'tasks' && (
          <div className="space-y-3">
            {guild.tasks.map((task) => {
              const progress = task.target > 0 ? Math.min(100, (task.progress / task.target) * 100) : 0;
              const completed = task.progress >= task.target;
              return (
                <div
                  key={task.id}
                  className="cyber-card p-4"
                  style={{
                    borderColor: completed && !task.claimed ? 'var(--green)' : 'var(--border-neon)',
                    boxShadow: completed && !task.claimed ? '0 0 15px rgba(0,255,128,0.3)' : undefined,
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-cyber text-sm tracking-wider text-[var(--text-primary)]">
                          {task.name}
                        </h3>
                        {task.daily && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: 'rgba(0,255,255,0.12)',
                              color: 'var(--cyan)',
                              border: '1px solid var(--border-neon)',
                            }}
                          >
                            每日
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        {task.description}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-sm text-[var(--text-primary)]">
                        <Coins size={14} style={{ color: '#ffd700' }} />
                        {task.reward.coins}
                      </div>
                      {task.reward.item && (
                        <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1 justify-end">
                          <Gift size={12} />
                          {task.reward.item}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-1">
                      <span>進度</span>
                      <span>
                        {task.progress} / {task.target}
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: 'var(--bg-mid)', border: '1px solid var(--border-neon)' }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${progress}%`,
                          background: completed
                            ? 'linear-gradient(90deg, var(--green), #00ff80)'
                            : `linear-gradient(90deg, var(--cyan), var(--pink))`,
                          boxShadow: completed
                            ? '0 0 8px var(--green)'
                            : '0 0 8px var(--cyan)',
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleClaim(task)}
                      disabled={!completed || task.claimed}
                      className="cyber-btn px-4 py-1.5 text-sm font-cyber tracking-wider"
                      style={{
                        borderColor: task.claimed
                          ? 'var(--text-secondary)'
                          : completed
                          ? 'var(--green)'
                          : 'var(--text-secondary)',
                        color: task.claimed
                          ? 'var(--text-secondary)'
                          : completed
                          ? 'var(--green)'
                          : 'var(--text-secondary)',
                        background: completed && !task.claimed
                          ? 'rgba(0,255,128,0.12)'
                          : 'transparent',
                        boxShadow: completed && !task.claimed ? '0 0 10px rgba(0,255,128,0.3)' : 'none',
                        opacity: !completed || task.claimed ? 0.6 : 1,
                      }}
                    >
                      {task.claimed ? '已領取' : completed ? '領取獎勵' : '未達成'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===== Approval Tab ===== */}
        {guildTab === 'approval' && isOfficer && (
          <div className="space-y-3">
            {guild.joinRequests.length === 0 && (
              <div className="cyber-card p-8 text-center text-[var(--text-secondary)]">
                暫無待審批的申請
              </div>
            )}
            {guild.joinRequests.map((req) => (
              <div
                key={req.id}
                className="cyber-card p-4"
                style={{ borderColor: '#ffd70060' }}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{
                        background: `linear-gradient(135deg, ${hashStringToColor(req.userId)}, ${hashStringToColor(req.userId)}88)`,
                        color: '#fff',
                      }}
                    >
                      {req.nickname.charAt(0)}
                    </div>
                    <div>
                      <span className="text-sm text-[var(--text-primary)] font-medium">
                        {req.nickname}
                      </span>
                      <p className="text-xs text-[var(--text-secondary)]">
                        申請時間：{formatDate(req.requestedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleReject(req)}
                      className="cyber-btn p-2"
                      style={{
                        borderColor: 'var(--red)',
                        color: 'var(--red)',
                        background: 'rgba(255,68,68,0.1)',
                      }}
                      title="拒絕"
                    >
                      <X size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(req)}
                      className="cyber-btn p-2"
                      style={{
                        borderColor: 'var(--green)',
                        color: 'var(--green)',
                        background: 'rgba(0,255,128,0.1)',
                      }}
                      title="通過"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                </div>
                {req.message && (
                  <div className="text-xs text-[var(--text-secondary)] pl-11">
                    留言：{req.message}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ===== Manage Tab ===== */}
        {guildTab === 'manage' && isLeader && (
          <div className="space-y-4">
            {/* Announcement */}
            <div className="cyber-card p-4" style={{ borderColor: 'var(--cyan)60' }}>
              <h3 className="font-cyber text-sm tracking-wider text-[var(--cyan)] mb-3 flex items-center gap-2">
                <Megaphone size={16} />
                編輯公告
              </h3>
              <textarea
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                maxLength={100}
                rows={3}
                placeholder="輸入公告內容（最多 100 字）"
                className="w-full px-3 py-2 bg-[var(--bg-mid)] border border-[var(--border-neon)] rounded text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--cyan)] resize-none mb-3"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={saveAnnouncement}
                  className="cyber-btn px-4 py-1.5 text-sm font-cyber tracking-wider"
                  style={{
                    borderColor: 'var(--cyan)',
                    color: 'var(--cyan)',
                    background: 'rgba(0,255,255,0.1)',
                  }}
                >
                  保存公告
                </button>
              </div>
            </div>

            {/* Disband */}
            <div className="cyber-card p-4" style={{ borderColor: 'var(--red)60' }}>
              <h3 className="font-cyber text-sm tracking-wider text-[var(--red)] mb-2 flex items-center gap-2">
                <Trash2 size={16} />
                解散戰隊
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mb-3">
                解散後所有成員將被移除，資料無法恢復。
              </p>
              <button
                type="button"
                onClick={() => setShowDisbandDialog(true)}
                className="cyber-btn w-full py-2 text-sm font-cyber tracking-wider"
                style={{
                  borderColor: 'var(--red)',
                  color: 'var(--red)',
                  background: 'rgba(255,68,68,0.08)',
                  boxShadow: '0 0 10px rgba(255,68,68,0.2)',
                }}
              >
                解散戰隊
              </button>
            </div>

            {/* Leave (for leader? No — leader has disband; but for other members, show leave) */}
          </div>
        )}

        {/* Leave button — for non-leader members or at bottom */}
        {!isLeader && (
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowLeaveDialog(true)}
              className="cyber-btn w-full py-3 text-sm font-cyber tracking-wider flex items-center justify-center gap-2"
              style={{
                borderColor: 'var(--text-secondary)',
                color: 'var(--text-secondary)',
                background: 'rgba(255,255,255,0.04)',
              }}
            >
              <LogOut size={16} />
              退出戰隊
            </button>
          </div>
        )}
      </div>

      {/* ============ Dialogs ============ */}

      {/* Report Dialog */}
      {reportMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className="cyber-card w-full max-w-sm p-5 relative"
            style={{ borderColor: 'var(--red)', boxShadow: '0 0 20px rgba(255,68,68,0.3)' }}
          >
            <button
              type="button"
              onClick={() => setReportMsg(null)}
              className="absolute top-3 right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <X size={18} />
            </button>
            <h3 className="font-cyber text-base tracking-wider text-[var(--red)] mb-4 flex items-center gap-2">
              <AlertTriangle size={18} />
              舉報訊息
            </h3>
            <div className="bg-[var(--bg-mid)] p-3 rounded border border-[var(--border-neon)] mb-4 text-sm text-[var(--text-primary)]">
              <div className="text-xs text-[var(--text-secondary)] mb-1">
                {reportMsg.senderName} 的訊息：
              </div>
              {reportMsg.type === 'sticker' ? (
                <div className="text-xs">【貼圖】{reportMsg.content}</div>
              ) : (
                <div className="break-words">{reportMsg.content}</div>
              )}
            </div>
            <div className="space-y-2 mb-4">
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                請選擇原因
              </label>
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setReportReason(reason)}
                  className={`w-full text-left px-3 py-2 rounded text-sm border transition-all ${
                    reportReason === reason
                      ? ''
                      : 'border-[var(--border-neon)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                  style={
                    reportReason === reason
                      ? {
                          borderColor: 'var(--red)',
                          color: 'var(--red)',
                          backgroundColor: 'rgba(255,68,68,0.1)',
                        }
                      : {}
                  }
                >
                  {reason}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleReport}
              disabled={!reportReason}
              className="cyber-btn w-full py-2 text-sm font-cyber tracking-wider"
              style={{
                borderColor: 'var(--red)',
                color: 'var(--red)',
                background: 'rgba(255,68,68,0.1)',
                opacity: reportReason ? 1 : 0.5,
              }}
            >
              提交舉報
            </button>
          </div>
        </div>
      )}

      {/* Kick Dialog */}
      {memberToKick && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className="cyber-card w-full max-w-sm p-5 relative"
            style={{ borderColor: 'var(--red)', boxShadow: '0 0 20px rgba(255,68,68,0.3)' }}
          >
            <button
              type="button"
              onClick={() => setMemberToKick(null)}
              className="absolute top-3 right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <X size={18} />
            </button>
            <h3 className="font-cyber text-base tracking-wider text-[var(--red)] mb-3 flex items-center gap-2">
              <Trash2 size={18} />
              確認踢出
            </h3>
            <p className="text-sm text-[var(--text-primary)] mb-4">
                確定要將 <span className="font-bold">{memberToKick.nickname}</span> 移出戰隊嗎？
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMemberToKick(null)}
                className="flex-1 py-2 text-sm border border-[var(--border-neon)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleKick}
                className="cyber-btn flex-1 py-2 text-sm font-cyber tracking-wider"
                style={{
                  borderColor: 'var(--red)',
                  color: 'var(--red)',
                  background: 'rgba(255,68,68,0.1)',
                }}
              >
                確認踢出
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Dialog */}
      {memberToTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className="cyber-card w-full max-w-sm p-5 relative"
            style={{ borderColor: '#ffd700', boxShadow: '0 0 20px rgba(255,215,0,0.3)' }}
          >
            <button
              type="button"
              onClick={() => setMemberToTransfer(null)}
              className="absolute top-3 right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <X size={18} />
            </button>
            <h3 className="font-cyber text-base tracking-wider mb-3 flex items-center gap-2" style={{ color: '#ffd700' }}>
              <Crown size={18} />
              轉讓隊長
            </h3>
            <p className="text-sm text-[var(--text-primary)] mb-4">
              確定要將隊長職位轉讓給 <span className="font-bold">{memberToTransfer.nickname}</span> 嗎？
              <br />
              <span className="text-xs text-[var(--text-secondary)]">
                轉讓後你將變為普通成員，此操作無法撤銷。
              </span>
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMemberToTransfer(null)}
                className="flex-1 py-2 text-sm border border-[var(--border-neon)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleTransfer}
                className="cyber-btn flex-1 py-2 text-sm font-cyber tracking-wider"
                style={{
                  borderColor: '#ffd700',
                  color: '#ffd700',
                  background: 'rgba(255,215,0,0.1)',
                }}
              >
                確認轉讓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disband Dialog */}
      {showDisbandDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className="cyber-card w-full max-w-sm p-5 relative"
            style={{ borderColor: 'var(--red)', boxShadow: '0 0 25px rgba(255,68,68,0.4)' }}
          >
            <button
              type="button"
              onClick={() => setShowDisbandDialog(false)}
              className="absolute top-3 right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <X size={18} />
            </button>
            <h3 className="font-cyber text-base tracking-wider text-[var(--red)] mb-3 flex items-center gap-2">
              <AlertTriangle size={18} />
              解散戰隊
            </h3>
            <p className="text-sm text-[var(--text-primary)] mb-4">
              確定要解散 <span className="font-bold">{guild.name}</span> 嗎？
              <br />
              <span className="text-xs text-[var(--text-secondary)]">
                所有成員將被移除，資料將被清除，此操作無法撤銷。
              </span>
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDisbandDialog(false)}
                className="flex-1 py-2 text-sm border border-[var(--border-neon)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleDisband}
                className="cyber-btn flex-1 py-2 text-sm font-cyber tracking-wider"
                style={{
                  borderColor: 'var(--red)',
                  color: 'var(--red)',
                  background: 'rgba(255,68,68,0.15)',
                  boxShadow: '0 0 10px rgba(255,68,68,0.3)',
                }}
              >
                確認解散
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Dialog */}
      {showLeaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className="cyber-card w-full max-w-sm p-5 relative"
            style={{ borderColor: 'var(--text-secondary)', boxShadow: '0 0 20px rgba(255,255,255,0.1)' }}
          >
            <button
              type="button"
              onClick={() => setShowLeaveDialog(false)}
              className="absolute top-3 right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <X size={18} />
            </button>
            <h3 className="font-cyber text-base tracking-wider text-[var(--text-secondary)] mb-3 flex items-center gap-2">
              <LogOut size={18} />
              退出戰隊
            </h3>
            <p className="text-sm text-[var(--text-primary)] mb-4">
              確定要退出 <span className="font-bold">{guild.name}</span> 嗎？
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowLeaveDialog(false)}
                className="flex-1 py-2 text-sm border border-[var(--border-neon)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleLeave}
                className="cyber-btn flex-1 py-2 text-sm font-cyber tracking-wider"
                style={{
                  borderColor: 'var(--text-secondary)',
                  color: 'var(--text-secondary)',
                  background: 'rgba(255,255,255,0.05)',
                }}
              >
                確認退出
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuildPage;
