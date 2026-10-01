import { useState, useEffect } from 'react';
import {
  Trophy,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  Check,
  Crown,
  Sparkles,
  Award,
} from 'lucide-react';

const STORAGE_KEY = 'monopoly_official_registrations';

type TournamentStatus = 'registering' | 'closed' | 'ongoing';

interface OfficialTournament {
  id: string;
  name: string;
  time: string;
  maxPlayers: number;
  currentPlayers: number;
  status: TournamentStatus;
  skinName: string;
  skinColor: string;
  titleName: string;
  description: string;
}

const STATUS_LABELS: Record<TournamentStatus, string> = {
  registering: '報名中',
  closed: '已截止',
  ongoing: '進行了',
};

const STATUS_COLORS: Record<TournamentStatus, string> = {
  registering: 'var(--green)',
  closed: 'var(--text-secondary)',
  ongoing: 'var(--cyan)',
};

const MOCK_TOURNAMENTS: OfficialTournament[] = [
  {
    id: 'off_001',
    name: '霓虹杯·週年慶典賽',
    time: '2026-09-25 20:00',
    maxPlayers: 512,
    currentPlayers: 387,
    status: 'registering',
    skinName: '霓虹魅影',
    skinColor: 'hsl(320, 100%, 60%)',
    titleName: '霓虹霸主',
    description:
      '賽博大富翁一週年慶典官方賽事，百位頂尖玩家同場競技，爭奪限定傳說皮膚與永恆稱號。',
  },
  {
    id: 'off_002',
    name: '數據塔挑戰賽',
    time: '2026-09-22 19:30',
    maxPlayers: 256,
    currentPlayers: 256,
    status: 'closed',
    skinName: '數據行者',
    skinColor: 'hsl(180, 100%, 50%)',
    titleName: '數據先鋒',
    description:
      '數據塔主題賽事，考驗玩家的投資眼光與風險控制能力，前三名獲得限定皮膚。',
  },
  {
    id: 'off_003',
    name: '地獄瘋狂賽',
    time: '2026-09-30 21:00',
    maxPlayers: 128,
    currentPlayers: 96,
    status: 'registering',
    skinName: '地獄領主',
    skinColor: 'hsl(0, 100%, 60%)',
    titleName: '瘋狂之王',
    description:
      '瘋狂模式專屬賽事，20000 起始資金、50% 過路費、雙倍命運卡獎勵，只有最瘋狂的玩家才能勝出。',
  },
  {
    id: 'off_004',
    name: '新人爭霸戰',
    time: '2026-09-20 20:00',
    maxPlayers: 1024,
    currentPlayers: 1024,
    status: 'ongoing',
    skinName: '星銳先鋒',
    skinColor: 'hsl(140, 100%, 50%)',
    titleName: '明日之星',
    description:
      '專為註冊30天內玩家打造的新人賽事，零門檻參與，冠軍直接獲得晉級年度總決賽資格。',
  },
  {
    id: 'off_005',
    name: '雙人搭檔賽',
    time: '2026-10-05 20:00',
    maxPlayers: 64,
    currentPlayers: 42,
    status: 'registering',
    skinName: '雙影刺客',
    skinColor: 'hsl(270, 80%, 60%)',
    titleName: '黃金搭檔',
    description:
      '雙人組隊模式，與你的戰友並肩作戰，考驗默契與策略，共同爭奪限定雙人皮膚。',
  },
  {
    id: 'off_006',
    name: '年度總決賽·資格賽',
    time: '2026-11-11 18:00',
    maxPlayers: 2048,
    currentPlayers: 1580,
    status: 'registering',
    skinName: '永恆王者',
    skinColor: 'hsl(50, 100%, 60%)',
    titleName: '傳奇選手',
    description:
      '年度最高規格賽事的資格選拔，晉級者將進入年度總決賽，爭奪高額獎金與終身榮譽。',
  },
];

const OfficialTournaments = () => {
  const [registered, setRegistered] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        if (Array.isArray(parsed)) {
          setRegistered(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleRegister = (id: string) => {
    setRegistered((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4">
      <div
        className="cyber-card px-4 py-3 flex items-center justify-between"
        style={{
          borderColor: 'var(--purple)',
          boxShadow: '0 0 12px rgba(167, 139, 250, 0.25)',
        }}
      >
        <div className="flex items-center gap-3">
          <Sparkles size={20} style={{ color: 'var(--purple)' }} />
          <span
            className="font-cyber text-lg tracking-wider"
            style={{ color: 'var(--purple)' }}
          >
            官方線上錦標賽
          </span>
        </div>
        <span className="text-xs text-[var(--text-secondary)] font-cyber tracking-wider">
          共 {MOCK_TOURNAMENTS.length} 場賽事
        </span>
      </div>

      {MOCK_TOURNAMENTS.map((t) => {
        const isRegistered = registered.includes(t.id);
        const isExpanded = expandedId === t.id;
        const isDisabled = t.status === 'closed' || t.status === 'ongoing';
        const progress = Math.round(
          (t.currentPlayers / t.maxPlayers) * 100,
        );

        return (
          <div
            key={t.id}
            className="cyber-card overflow-hidden"
            style={{
              borderColor:
                t.status === 'registering'
                  ? 'rgba(0, 255, 128, 0.25)'
                  : t.status === 'ongoing'
                    ? 'rgba(0, 255, 255, 0.25)'
                    : 'rgba(255, 255, 255, 0.1)',
              boxShadow:
                t.status === 'registering'
                  ? '0 0 12px rgba(0, 255, 128, 0.15)'
                  : 'none',
            }}
          >
            <div className="p-4 md:p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3
                      className="font-cyber text-base md:text-lg tracking-wider truncate"
                      style={{
                        color:
                          t.status === 'registering'
                            ? 'var(--green)'
                            : t.status === 'ongoing'
                              ? 'var(--cyan)'
                              : 'var(--text-primary)',
                        textShadow:
                          t.status === 'registering'
                            ? '0 0 8px rgba(0, 255, 128, 0.5)'
                            : 'none',
                      }}
                    >
                      {t.name}
                    </h3>
                    <span
                      className="text-xs font-cyber tracking-wider px-2 py-0.5 border rounded"
                      style={{
                        borderColor: STATUS_COLORS[t.status],
                        color: STATUS_COLORS[t.status],
                        background: `${STATUS_COLORS[t.status]}15`,
                      }}
                    >
                      {STATUS_LABELS[t.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)] font-cyber tracking-wider flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {t.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {t.currentPlayers} / {t.maxPlayers} 人
                    </span>
                  </div>
                </div>
                <Trophy
                  size={28}
                  className="flex-shrink-0"
                  style={{
                    color:
                      t.status === 'registering'
                        ? 'var(--green)'
                        : t.status === 'ongoing'
                          ? 'var(--cyan)'
                          : 'var(--text-secondary)',
                    opacity: t.status === 'closed' ? 0.4 : 0.8,
                  }}
                />
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div
                  className="h-1 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${progress}%`,
                      background:
                        t.status === 'registering'
                          ? 'linear-gradient(90deg, var(--green), var(--cyan))'
                          : t.status === 'ongoing'
                            ? 'linear-gradient(90deg, var(--cyan), var(--purple))'
                            : 'var(--text-secondary)',
                      boxShadow:
                        t.status !== 'closed'
                          ? `0 0 8px ${t.status === 'registering' ? 'var(--green)' : 'var(--cyan)'}`
                          : 'none',
                    }}
                  />
                </div>
              </div>

              {/* Reward preview summary */}
              <div className="flex items-center gap-4 mb-3 text-xs">
                <div
                  className="flex items-center gap-2 px-2 py-1 rounded border"
                  style={{
                    borderColor: `${t.skinColor}55`,
                    background: `${t.skinColor}10`,
                  }}
                >
                  <div
                    className="w-4 h-4 rounded"
                    style={{
                      background: t.skinColor,
                      boxShadow: `0 0 6px ${t.skinColor}`,
                    }}
                  />
                  <span
                    className="font-cyber tracking-wider"
                    style={{ color: t.skinColor }}
                  >
                    {t.skinName}
                  </span>
                </div>
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded border"
                  style={{
                    borderColor: 'rgba(250, 204, 21, 0.4)',
                    background: 'rgba(250, 204, 21, 0.08)',
                  }}
                >
                  <Crown size={12} style={{ color: '#facc15' }} />
                  <span
                    className="font-cyber tracking-wider"
                    style={{ color: '#facc15' }}
                  >
                    {t.titleName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleRegister(t.id)}
                  className="cyber-btn flex-1 py-2.5 text-sm font-cyber tracking-wider flex items-center justify-center gap-2 transition-all"
                  style={{
                    borderColor: isDisabled
                      ? 'rgba(255, 255, 255, 0.1)'
                      : isRegistered
                        ? 'var(--cyan)'
                        : 'var(--pink)',
                    color: isDisabled
                      ? 'var(--text-secondary)'
                      : isRegistered
                        ? 'var(--cyan)'
                        : 'var(--pink)',
                    background: isDisabled
                      ? 'rgba(255, 255, 255, 0.03)'
                      : isRegistered
                        ? 'rgba(0, 255, 255, 0.08)'
                        : 'rgba(255, 107, 157, 0.08)',
                    boxShadow: isDisabled
                      ? 'none'
                      : isRegistered
                        ? '0 0 10px rgba(0, 255, 255, 0.3)'
                        : '0 0 10px rgba(255, 107, 157, 0.3)',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.5 : 1,
                  }}
                >
                  {isDisabled ? (
                    t.status === 'closed' ? (
                      '報名已截止'
                    ) : (
                      '賽事進行中'
                    )
                  ) : isRegistered ? (
                    <>
                      <Check size={14} />
                      已報名
                    </>
                  ) : (
                    '立即報名'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => toggleExpand(t.id)}
                  className="cyber-btn px-3 py-2.5 flex items-center justify-center"
                  style={{
                    borderColor: 'rgba(167, 139, 250, 0.4)',
                    color: 'var(--purple)',
                  }}
                  aria-label={isExpanded ? '收起' : '展開獎勵詳情'}
                >
                  {isExpanded ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* Expanded reward details */}
            {isExpanded && (
              <div
                className="px-4 pb-5 md:px-5 md:pb-5 pt-0 border-t"
                style={{
                  borderColor: 'rgba(167, 139, 250, 0.15)',
                  background:
                    'linear-gradient(180deg, transparent, rgba(167, 139, 250, 0.04))',
                }}
              >
                <p className="text-sm text-[var(--text-secondary)] mb-4 mt-4 leading-relaxed">
                  {t.description}
                </p>

                <h4 className="font-cyber text-sm tracking-wider mb-3" style={{ color: 'var(--purple)' }}>
                  <Award size={14} className="inline mr-1" />
                  獎勵預覽
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Skin preview */}
                  <div
                    className="rounded-lg border p-3 flex flex-col items-center text-center"
                    style={{
                      borderColor: `${t.skinColor}40`,
                      background: `${t.skinColor}08`,
                    }}
                  >
                    <div
                      className="w-20 h-20 rounded-lg mb-2 flex items-center justify-center relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${t.skinColor}33, ${t.skinColor}11)`,
                        border: `1px solid ${t.skinColor}66`,
                        boxShadow: `0 0 15px ${t.skinColor}40, inset 0 0 15px ${t.skinColor}22`,
                      }}
                    >
                      <div
                        className="w-10 h-12 rounded-t-full"
                        style={{
                          background: `linear-gradient(180deg, ${t.skinColor}, ${t.skinColor}88)`,
                          boxShadow: `0 0 10px ${t.skinColor}`,
                        }}
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%)',
                        }}
                      />
                    </div>
                    <div
                      className="font-cyber text-sm tracking-wider"
                      style={{ color: t.skinColor, textShadow: `0 0 6px ${t.skinColor}88` }}
                    >
                      {t.skinName}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] mt-1">
                      限定皮膚
                    </div>
                  </div>

                  {/* Title preview */}
                  <div
                    className="rounded-lg border p-3 flex flex-col items-center text-center justify-center"
                    style={{
                      borderColor: 'rgba(250, 204, 21, 0.3)',
                      background: 'rgba(250, 204, 21, 0.05)',
                    }}
                  >
                    <div
                      className="font-cyber text-lg tracking-widest mb-2 px-4 py-2 border rounded"
                      style={{
                        color: '#facc15',
                        borderColor: '#facc15',
                        background:
                          'linear-gradient(180deg, rgba(250, 204, 21, 0.15), rgba(250, 204, 21, 0.03))',
                        textShadow: '0 0 10px #facc15, 0 0 20px rgba(250, 204, 21, 0.5)',
                        boxShadow:
                          '0 0 15px rgba(250, 204, 21, 0.3), inset 0 0 10px rgba(250, 204, 21, 0.1)',
                      }}
                    >
                      {t.titleName}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      專屬稱號
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OfficialTournaments;
