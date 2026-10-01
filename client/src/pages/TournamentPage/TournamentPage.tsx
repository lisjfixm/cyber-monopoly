import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Trophy,
  Swords,
  Users,
  Crown,
  Play,
  RefreshCw,
  ChevronRight,
  Star,
  Zap,
  Ticket,
  TrendingUp,
} from 'lucide-react';
import type {
  TournamentState,
  TournamentSize,
  TournamentPhase,
  BracketMatch,
  TournamentHistory,
  LiveTournament,
} from '@shared/api.interface';
import {
  createTournamentState,
  getGroupMatches,
  getKnockoutRounds,
  getSortedStandings,
  canSimulateNextRound,
  simulateNextRound,
} from './tournament-utils';
import GroupCard from './GroupCard';
import KnockoutBracket from './KnockoutBracket';
import StandingsTable from './StandingsTable';
import OfficialTournaments from './OfficialTournaments';
import TournamentBracket from './TournamentBracket';
import TournamentRewards from './TournamentRewards';
import TournamentHistoryComp from './TournamentHistory';
import LiveTournamentCard from './LiveTournamentCard';

const STORAGE_KEY = 'cyber_monopoly_tournament';

type TabKey = 'create' | 'schedule' | 'standings' | 'official';

const TABS: { key: TabKey; label: string; icon: typeof Trophy }[] = [
  { key: 'create', label: '創建錦標賽', icon: Users },
  { key: 'schedule', label: '賽程', icon: Swords },
  { key: 'standings', label: '積分榜', icon: Trophy },
  { key: 'official', label: '官方賽事', icon: Crown },
];

const PHASE_LABELS: Record<TournamentPhase, string> = {
  group: '分組循環賽',
  knockout: '淘汰賽',
  final: '決賽',
  finished: '已結束',
};

const FORMAT_OPTIONS: { size: TournamentSize; label: string; desc: string }[] = [
  { size: 8, label: '8 人賽', desc: '快速對決' },
  { size: 16, label: '16 人賽', desc: '標準賽制' },
  { size: 32, label: '32 人賽', desc: '頂級爭霸' },
];

// 模擬 bracket 數據：16人賽打到八強（第1輪已結束，進入第2輪）
function buildMockLiveBracket(): BracketMatch[][] {
  const playerNames = [
    '霓虹行者', '暗影獵手', '數據暴君', '量子先鋒',
    '地獄領主', '星塵騎士', '電馭叛客', '夜之精靈',
    '鋼鐵之心', '極速之影', '深藍薩滿', '紫晶巫師',
    '赤焰戰神', '銀河護衛', '網路忍者', '終端守望者',
  ];

  // 第1輪：8場（十六強賽），已全部結束，八強出爐
  const round1: BracketMatch[] = [
    {
      round: 0, matchNumber: 1,
      player1: { name: playerNames[0], avatar: '', won: true },
      player2: { name: playerNames[1], avatar: '', won: false },
      winner: playerNames[0], isLive: false,
    },
    {
      round: 0, matchNumber: 2,
      player1: { name: playerNames[2], avatar: '', won: false },
      player2: { name: playerNames[3], avatar: '', won: true },
      winner: playerNames[3], isLive: false,
    },
    {
      round: 0, matchNumber: 3,
      player1: { name: playerNames[4], avatar: '', won: true },
      player2: { name: playerNames[5], avatar: '', won: false },
      winner: playerNames[4], isLive: false,
    },
    {
      round: 0, matchNumber: 4,
      player1: { name: playerNames[6], avatar: '', won: false },
      player2: { name: playerNames[7], avatar: '', won: true },
      winner: playerNames[7], isLive: false,
    },
    {
      round: 0, matchNumber: 5,
      player1: { name: playerNames[8], avatar: '', won: true },
      player2: { name: playerNames[9], avatar: '', won: false },
      winner: playerNames[8], isLive: false,
    },
    {
      round: 0, matchNumber: 6,
      player1: { name: playerNames[10], avatar: '', won: false },
      player2: { name: playerNames[11], avatar: '', won: true },
      winner: playerNames[11], isLive: false,
    },
    {
      round: 0, matchNumber: 7,
      player1: { name: playerNames[12], avatar: '', won: true },
      player2: { name: playerNames[13], avatar: '', won: false },
      winner: playerNames[12], isLive: false,
    },
    {
      round: 0, matchNumber: 8,
      player1: { name: playerNames[14], avatar: '', won: false },
      player2: { name: playerNames[15], avatar: '', won: true },
      winner: playerNames[15], isLive: false,
    },
  ];

  // 第2輪：4場（八強賽），正在進行中
  const round2: BracketMatch[] = [
    {
      round: 1, matchNumber: 1,
      player1: { name: playerNames[0], avatar: '', won: false },
      player2: { name: playerNames[3], avatar: '', won: false },
      isLive: true,
    },
    {
      round: 1, matchNumber: 2,
      player1: { name: playerNames[4], avatar: '', won: false },
      player2: { name: playerNames[7], avatar: '', won: false },
      isLive: true,
    },
    {
      round: 1, matchNumber: 3,
      player1: { name: playerNames[8], avatar: '', won: false },
      player2: { name: playerNames[11], avatar: '', won: false },
      isLive: true,
    },
    {
      round: 1, matchNumber: 4,
      player1: { name: playerNames[12], avatar: '', won: false },
      player2: { name: playerNames[15], avatar: '', won: false },
      isLive: true,
    },
  ];

  // 第3輪：2場（四強賽），待定
  const round3: BracketMatch[] = [
    {
      round: 2, matchNumber: 1,
      player1: { name: '— 待定 —', avatar: '', won: false },
      player2: { name: '— 待定 —', avatar: '', won: false },
      isLive: false,
    },
    {
      round: 2, matchNumber: 2,
      player1: { name: '— 待定 —', avatar: '', won: false },
      player2: { name: '— 待定 —', avatar: '', won: false },
      isLive: false,
    },
  ];

  // 第4輪：1場（決賽），待定
  const round4: BracketMatch[] = [
    {
      round: 3, matchNumber: 1,
      player1: { name: '— 待定 —', avatar: '', won: false },
      player2: { name: '— 待定 —', avatar: '', won: false },
      isLive: false,
    },
  ];

  return [round1, round2, round3, round4];
}

const MOCK_HISTORY: TournamentHistory[] = [
  { id: 'h1', date: '2026-09-28', format: 16, myRank: 1, rewards: '20000 幣 + 數據核心' },
  { id: 'h2', date: '2026-09-25', format: 32, myRank: 3, rewards: '30000 幣 + 時空裂隙' },
  { id: 'h3', date: '2026-09-20', format: 8, myRank: 2, rewards: '3000 幣 + 強化模組' },
  { id: 'h4', date: '2026-09-15', format: 16, myRank: 5, rewards: '5000 幣' },
  { id: 'h5', date: '2026-09-10', format: 8, myRank: 1, rewards: '5000 幣 + 霓虹晶片' },
];

const REGISTRATION_REQS: Record<TournamentSize, { free: boolean; tickets?: number; elo?: number; desc: string }> = {
  8: { free: true, desc: '免費參加，隨機匹配' },
  16: { free: false, tickets: 1, elo: 1000, desc: '入場券 x1 或 ELO > 1000' },
  32: { free: false, tickets: 3, elo: 1500, desc: '入場券 x3 或 ELO > 1500' },
};

const TournamentPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('create');
  const [tournament, setTournament] = useState<TournamentState | null>(null);
  const [size, setSize] = useState<TournamentSize>(16);
  const [playerName, setPlayerName] = useState<string>('玩家');
  const [showMyTournament, setShowMyTournament] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as TournamentState;
        if (parsed && parsed.id) {
          setTournament(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const saveTournament = useCallback((state: TournamentState) => {
    setTournament(state);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, []);

  const handleCreate = () => {
    const name = playerName.trim() || '玩家';
    const state = createTournamentState(size, name);
    saveTournament(state);
    setShowMyTournament(true);
    setActiveTab('schedule');
  };

  const handleSimulate = useCallback(() => {
    if (!tournament) return;
    const next = simulateNextRound(tournament);
    saveTournament(next);
  }, [tournament, saveTournament]);

  const canSimulate = useMemo(
    () => canSimulateNextRound(tournament),
    [tournament],
  );

  const handleReset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setTournament(null);
    setActiveTab('create');
  };

  const handleBack = () => navigate('/');

  const groupMatches = useMemo(
    () => (tournament ? getGroupMatches(tournament) : {}),
    [tournament],
  );

  const knockoutRounds = useMemo(
    () => (tournament ? getKnockoutRounds(tournament) : []),
    [tournament],
  );

  const sortedStandings = useMemo(
    () => (tournament ? getSortedStandings(tournament) : []),
    [tournament],
  );

  // 模擬數據
  const liveBracket = useMemo<BracketMatch[][]>(() => buildMockLiveBracket(), []);

  const liveTournament = useMemo<LiveTournament>(
    () => ({
      id: 'live_001',
      format: 16,
      status: 'in-progress',
      currentRound: 2,
      remainingPlayers: 8,
      nextRoundAt: '20:30',
      myPosition: 5,
      bracket: liveBracket,
    }),
    [liveBracket],
  );

  const historyData = useMemo<TournamentHistory[]>(() => MOCK_HISTORY, []);

  const regReq = REGISTRATION_REQS[size];

  const handleJoinLive = () => {
    handleCreate();
  };

  return (
    <div className="min-h-screen w-full flex flex-col px-4 py-6 scanlines relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full opacity-10 blur-[100px]"
          style={{ background: 'var(--cyan)' }}
        />
        <div
          className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full opacity-10 blur-[100px]"
          style={{ background: 'var(--pink)' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            onClick={handleBack}
            className="cyber-btn px-3 py-2 text-sm flex items-center gap-1"
            style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
          >
            <ArrowLeft size={16} />
            <span className="font-cyber tracking-wider">返回</span>
          </button>
          <h1 className="font-cyber text-2xl md:text-3xl text-neon-pink tracking-wider">
            錦標賽
          </h1>
          {tournament && (
            <button
              type="button"
              onClick={handleReset}
              className="ml-auto cyber-btn px-3 py-2 text-sm flex items-center gap-1"
              style={{ borderColor: 'var(--red)', color: 'var(--red)' }}
            >
              <RefreshCw size={14} />
              <span className="font-cyber tracking-wider text-xs">重置</span>
            </button>
          )}
        </div>

        <div className="pb-8 space-y-8">
          {/* 區段 1：賽制選擇 */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} style={{ color: 'var(--cyan)' }} />
              <h2 className="font-cyber text-xl tracking-wider text-neon-cyan">
                選擇賽制
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              {FORMAT_OPTIONS.map((opt) => {
                const selected = size === opt.size;
                return (
                  <button
                    key={opt.size}
                    type="button"
                    onClick={() => setSize(opt.size)}
                    className="cyber-btn p-4 md:p-6 flex flex-col items-center gap-2 transition-all group"
                    style={{
                      borderColor: selected
                        ? 'var(--cyan)'
                        : 'rgba(0, 255, 255, 0.2)',
                      color: selected ? 'var(--cyan)' : 'var(--text-secondary)',
                      background: selected
                        ? 'rgba(0, 255, 255, 0.08)'
                        : 'transparent',
                      boxShadow: selected
                        ? '0 0 20px rgba(0, 255, 255, 0.3), inset 0 0 12px rgba(0, 255, 255, 0.08)'
                        : 'none',
                    }}
                  >
                    <div
                      className="font-cyber text-3xl md:text-4xl tracking-wider"
                      style={{
                        color: selected ? 'var(--cyan)' : 'var(--text-primary)',
                        textShadow: selected
                          ? '0 0 10px rgba(0, 255, 255, 0.6)'
                          : 'none',
                      }}
                    >
                      {opt.size}
                    </div>
                    <div className="font-cyber tracking-widest text-sm">
                      {opt.label}
                    </div>
                    <div className="text-xs opacity-60 font-cyber tracking-wider">
                      {opt.desc}
                    </div>
                    <ChevronRight
                      size={16}
                      className="transition-all"
                      style={{
                        opacity: selected ? 1 : 0,
                        transform: selected ? 'translateX(0)' : 'translateX(-8px)',
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </section>

          {/* 區段 2：獎勵預覽 + 報名 */}
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
            <div className="lg:col-span-3">
              <TournamentRewards format={size} />
            </div>

            <div className="lg:col-span-2">
              <div
                className="cyber-card p-5 h-full flex flex-col"
                style={{
                  borderColor: 'rgba(255, 107, 157, 0.3)',
                  boxShadow: '0 0 16px rgba(255, 107, 157, 0.15)',
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Ticket size={20} style={{ color: 'var(--pink)' }} />
                  <h3 className="font-cyber text-lg tracking-wider text-neon-pink">
                    報名資訊
                  </h3>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  <div
                    className="flex items-center gap-3 p-3 rounded-sm"
                    style={{
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <TrendingUp
                      size={18}
                      style={{ color: 'var(--cyan)' }}
                    />
                    <div className="flex-1">
                      <div className="text-xs text-[var(--text-secondary)] font-cyber tracking-wider mb-0.5">
                        賽制
                      </div>
                      <div
                        className="font-cyber text-base tracking-wider"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {size} 人單敗淘汰制
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-3 p-3 rounded-sm"
                    style={{
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <Zap size={18} style={{ color: 'var(--pink)' }} />
                    <div className="flex-1">
                      <div className="text-xs text-[var(--text-secondary)] font-cyber tracking-wider mb-0.5">
                        報名條件
                      </div>
                      <div
                        className="font-cyber text-sm tracking-wider"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {regReq.desc}
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-3 p-3 rounded-sm"
                    style={{
                      border: '1px solid rgba(167,139,250,0.2)',
                      background: 'rgba(167,139,250,0.04)',
                    }}
                  >
                    <Star size={18} style={{ color: 'var(--purple)' }} />
                    <div className="flex-1">
                      <div className="text-xs text-[var(--text-secondary)] font-cyber tracking-wider mb-0.5">
                        玩家暱稱
                      </div>
                      <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        maxLength={12}
                        className="w-full bg-transparent border-none outline-none font-cyber tracking-wider text-sm p-0"
                        style={{ color: 'var(--text-primary)' }}
                        placeholder="輸入你的暱稱"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreate}
                  className="cyber-btn cyber-btn-pink w-full py-4 text-lg font-cyber tracking-widest flex items-center justify-center gap-2"
                >
                  <Play size={18} />
                  立即報名
                </button>

                <div className="mt-3 text-xs text-[var(--text-secondary)] space-y-1 font-cyber tracking-wider">
                  <p>• 對手不足時由 AI 填補</p>
                  <p>• 勝一場 3 分、敗一場 1 分</p>
                  <p>• 淘汰賽單場淘汰，直至產生冠軍</p>
                </div>
              </div>
            </div>
          </section>

          {/* 區段 3：當前進行中的賽事 */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Swords size={18} style={{ color: 'var(--pink)' }} />
              <h2 className="font-cyber text-xl tracking-wider text-neon-pink">
                當前進行中的賽事
              </h2>
            </div>
            <LiveTournamentCard tournament={liveTournament} onJoin={handleJoinLive} />
          </section>

          {/* 區段 4：賽程樹狀圖 */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={18} style={{ color: 'var(--cyan)' }} />
              <h2 className="font-cyber text-xl tracking-wider text-neon-cyan">
                賽程樹狀圖
              </h2>
            </div>
            <TournamentBracket rounds={liveBracket} format={16} />
          </section>

          {/* 區段 5：歷史記錄 */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Crown size={18} style={{ color: 'var(--purple)' }} />
              <h2
                className="font-cyber text-xl tracking-wider"
                style={{ color: 'var(--purple)' }}
              >
                歷史記錄
              </h2>
            </div>
            <TournamentHistoryComp history={historyData} />
          </section>

          {/* 區段 6：我的錦標賽（原有功能保留） */}
          <section>
            <div
              className="flex items-center justify-between mb-4 cursor-pointer select-none"
              onClick={() => setShowMyTournament((v) => !v)}
            >
              <div className="flex items-center gap-2">
                <Users size={18} style={{ color: 'var(--cyan)' }} />
                <h2 className="font-cyber text-xl tracking-wider text-neon-cyan">
                  我的錦標賽
                </h2>
              </div>
              <span className="text-xs text-[var(--text-secondary)] font-cyber tracking-wider flex items-center gap-1">
                {showMyTournament ? '收起' : '展開'}
                <ChevronRight
                  size={14}
                  style={{
                    transform: showMyTournament ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.2s',
                  }}
                />
              </span>
            </div>

            {showMyTournament && (
              <div className="space-y-4">
                {/* Tabs */}
                <div className="flex gap-2 flex-wrap">
                  {TABS.map((tab) => {
                    const selected = activeTab === tab.key;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className="cyber-btn flex-1 min-w-[100px] py-2 text-sm md:text-base font-cyber tracking-wider transition-all flex items-center justify-center gap-2"
                        style={{
                          borderColor: selected
                            ? 'var(--pink)'
                            : 'rgba(0, 255, 255, 0.2)',
                          color: selected
                            ? 'var(--pink)'
                            : 'var(--text-secondary)',
                          background: selected
                            ? 'rgba(255, 107, 157, 0.08)'
                            : 'transparent',
                          boxShadow: selected
                            ? '0 0 12px rgba(255, 107, 157, 0.3)'
                            : 'none',
                        }}
                      >
                        <Icon size={16} />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab 1: Create */}
                {activeTab === 'create' && (
                  <div
                    className="cyber-card p-6 max-w-md mx-auto"
                    style={{ borderColor: 'rgba(255, 107, 157, 0.3)' }}
                  >
                    <h2 className="font-cyber text-xl text-neon-pink tracking-wider mb-6 text-center">
                      創建錦標賽
                    </h2>

                    <div className="mb-6">
                      <label className="block text-sm text-[var(--text-secondary)] font-cyber tracking-wider mb-2">
                        參賽人數
                      </label>
                      <div className="flex gap-3">
                        {[8, 16, 32].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSize(s as TournamentSize)}
                            className="cyber-btn flex-1 py-3 font-cyber text-lg tracking-wider transition-all"
                            style={{
                              borderColor:
                                size === s
                                  ? 'var(--cyan)'
                                  : 'rgba(0, 255, 255, 0.2)',
                              color:
                                size === s ? 'var(--cyan)' : 'var(--text-secondary)',
                              background:
                                size === s
                                  ? 'rgba(0, 255, 255, 0.08)'
                                  : 'transparent',
                              boxShadow:
                                size === s
                                  ? '0 0 12px rgba(0, 255, 255, 0.3)'
                                  : 'none',
                            }}
                          >
                            {s} 人
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm text-[var(--text-secondary)] font-cyber tracking-wider mb-2">
                        玩家暱稱
                      </label>
                      <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        maxLength={12}
                        className="w-full cyber-input px-4 py-3 font-cyber tracking-wider"
                        style={{ borderColor: 'rgba(0, 255, 255, 0.3)' }}
                        placeholder="輸入你的暱稱"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleCreate}
                      className="cyber-btn cyber-btn-pink w-full py-4 text-lg font-cyber tracking-widest flex items-center justify-center gap-2"
                    >
                      <Play size={18} />
                      開始錦標賽
                    </button>

                    <div className="mt-6 text-xs text-[var(--text-secondary)] space-y-1 font-cyber tracking-wider">
                      <p>• 對手不足時由 AI 填補</p>
                      <p>• 勝一場 3 分、敗一場 1 分</p>
                      <p>• 小組前 2 名晉級淘汰賽</p>
                      <p>• 淘汰賽單場淘汰，直至產生冠軍</p>
                    </div>
                  </div>
                )}

                {/* Tab 2: Schedule */}
                {activeTab === 'schedule' && (
                  <div>
                    {!tournament ? (
                      <div className="cyber-card p-8 text-center text-[var(--text-secondary)] max-w-md mx-auto">
                        <Trophy
                          className="w-12 h-12 mx-auto mb-4"
                          style={{ color: 'var(--purple)' }}
                        />
                        <p className="font-cyber tracking-wider text-base mb-2">
                          尚無進行中的錦標賽
                        </p>
                        <p className="text-xs">前往「創建錦標賽」頁面開始</p>
                        <button
                          type="button"
                          onClick={() => setActiveTab('create')}
                          className="cyber-btn mt-4 px-6 py-2 text-sm"
                          style={{ borderColor: 'var(--pink)', color: 'var(--pink)' }}
                        >
                          立即創建
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Phase Banner */}
                        <div
                          className="cyber-card px-4 py-3 flex items-center justify-between"
                          style={{
                            borderColor:
                              tournament.phase === 'finished'
                                ? 'var(--green)'
                                : 'var(--cyan)',
                            boxShadow:
                              tournament.phase === 'finished'
                                ? '0 0 12px rgba(0, 255, 128, 0.25)'
                                : '0 0 12px rgba(0, 255, 255, 0.25)',
                          }}
                        >
                          <div className="flex items-center gap-3">
                            {tournament.phase === 'finished' ? (
                              <Crown size={20} style={{ color: 'var(--green)' }} />
                            ) : (
                              <Swords size={20} style={{ color: 'var(--cyan)' }} />
                            )}
                            <span
                              className="font-cyber text-lg tracking-wider"
                              style={{
                                color:
                                  tournament.phase === 'finished'
                                    ? 'var(--green)'
                                    : 'var(--cyan)',
                              }}
                            >
                              {PHASE_LABELS[tournament.phase]}
                            </span>
                          </div>
                          <span className="text-xs text-[var(--text-secondary)] font-cyber tracking-wider">
                            {tournament.size} 人參賽
                          </span>
                        </div>

                        {/* Champion */}
                        {tournament.champion && (
                          <div
                            className="cyber-card p-6 text-center"
                            style={{
                              borderColor: '#facc15',
                              background:
                                'linear-gradient(135deg, rgba(250, 204, 21, 0.1), var(--bg-card))',
                              boxShadow: '0 0 20px rgba(250, 204, 21, 0.3)',
                              animation: 'pulse-glow 2s ease-in-out infinite',
                            }}
                          >
                            <Crown
                              size={48}
                              className="mx-auto mb-3"
                              style={{
                                color: '#facc15',
                                filter: 'drop-shadow(0 0 8px #facc15)',
                              }}
                            />
                            <div
                              className="font-cyber text-2xl tracking-wider mb-1"
                              style={{
                                color: '#facc15',
                                textShadow: '0 0 10px #facc15',
                              }}
                            >
                              {tournament.champion}
                            </div>
                            <div className="text-xs text-[var(--text-secondary)] font-cyber tracking-wider">
                              獎盃 錦標賽冠軍
                            </div>
                          </div>
                        )}

                        {canSimulate && (
                          <button
                            type="button"
                            onClick={handleSimulate}
                            className="cyber-btn cyber-btn-pink w-full py-4 text-lg font-cyber tracking-widest flex items-center justify-center gap-2"
                          >
                            <Play size={18} />
                            模擬下一輪
                          </button>
                        )}

                        {/* Group Phase */}
                        {tournament.groups && (
                          <div>
                            <h3 className="font-cyber text-lg text-neon-cyan tracking-wider mb-3">
                              分組循環賽
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {Object.entries(tournament.groups).map(
                                ([groupName, players]) => (
                                  <GroupCard
                                    key={groupName}
                                    groupName={groupName}
                                    players={players}
                                    matches={groupMatches[groupName] ?? []}
                                    sortedStandings={sortedStandings}
                                  />
                                ),
                              )}
                            </div>
                          </div>
                        )}

                        {/* Knockout Bracket */}
                        {knockoutRounds.length > 0 && (
                          <div>
                            <h3 className="font-cyber text-lg text-neon-pink tracking-wider mb-3">
                              淘汰賽
                            </h3>
                            <KnockoutBracket rounds={knockoutRounds} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: Standings */}
                {activeTab === 'standings' && (
                  <div>
                    {!tournament ? (
                      <div className="cyber-card p-8 text-center text-[var(--text-secondary)] max-w-md mx-auto">
                        <Trophy
                          className="w-12 h-12 mx-auto mb-4"
                          style={{ color: 'var(--purple)' }}
                        />
                        <p className="font-cyber tracking-wider text-base mb-2">
                          尚無積分數據
                        </p>
                        <p className="text-xs">創建錦標賽後查看積分榜</p>
                      </div>
                    ) : (
                      <StandingsTable
                        standings={sortedStandings}
                        champion={tournament.champion}
                        phase={tournament.phase}
                      />
                    )}
                  </div>
                )}

                {/* Tab 4: Official Tournaments */}
                {activeTab === 'official' && <OfficialTournaments />}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default TournamentPage;
