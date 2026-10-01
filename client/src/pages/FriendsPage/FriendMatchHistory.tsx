import { useMemo, useState } from 'react';
import { Trophy, Clock, Swords } from 'lucide-react';
import {
  getFriendMatchHistory,
  getFriendStats,
  getModeLabel,
  formatDuration,
  formatPlayedAt,
  type FriendStat,
  type MatchRecord,
} from './match-history-utils';

const RELATION_INFO: Record<FriendStat['relation'], { label: string; color: string; bg: string }> = {
  proud: {
    label: '得意',
    color: 'var(--green)',
    bg: 'rgba(0, 255, 136, 0.15)',
  },
  grudge: {
    label: '恩怨',
    color: 'var(--red)',
    bg: 'rgba(255, 71, 87, 0.15)',
  },
  even: {
    label: '勢均力敵',
    color: 'var(--yellow, #ffd93d)',
    bg: 'rgba(255, 217, 61, 0.15)',
  },
};

const FriendMatchHistory = () => {
  const [selectedFriendId, setSelectedFriendId] = useState<string>('all');
  const stats = useMemo(() => getFriendStats(), []);
  const allRecords = useMemo(() => getFriendMatchHistory(), []);

  const filteredRecords = useMemo(() => {
    if (selectedFriendId === 'all') return allRecords;
    return allRecords.filter((r: MatchRecord) => r.friendUserId === selectedFriendId);
  }, [allRecords, selectedFriendId]);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* 標題列 */}
      <div
        className="px-4 md:px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border-neon)' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Swords size={20} style={{ color: 'var(--cyan)' }} />
          <h2 className="font-cyber text-lg tracking-wider text-neon-cyan">對戰記錄</h2>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          與好友的所有對戰成績與勝負關係
        </p>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-4 md:p-6 space-y-6">
        {/* A. 好友勝負總覽 */}
        <section>
          <h3 className="font-cyber text-sm tracking-wider mb-3" style={{ color: 'var(--pink)' }}>
            好友勝負總覽
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {stats.map((stat: FriendStat) => {
              const relationInfo = RELATION_INFO[stat.relation];
              const myPercent = Math.round(stat.myWinRate * 100);
              const friendPercent = 100 - myPercent;

              return (
                <div
                  key={stat.userId}
                  className="flex-shrink-0 w-48 p-3 rounded-lg transition-transform hover:scale-[1.02] cursor-pointer"
                  style={{
                    background: 'var(--bg-mid)',
                    border: `1px solid var(--border-neon)`,
                    boxShadow: '0 0 8px rgba(0, 255, 255, 0.1)',
                  }}
                  onClick={() => setSelectedFriendId(stat.userId)}
                >
                  {/* 頭像 + 暱稱 + 標記 */}
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-cyber text-sm flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, var(--cyan), var(--purple))',
                        color: 'var(--bg-deep)',
                        border: '2px solid var(--cyan)',
                        boxShadow: '0 0 6px var(--cyan)',
                      }}
                    >
                      {stat.nickname.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {stat.nickname}
                      </div>
                      <div
                        className="text-[10px] font-cyber tracking-wider px-1.5 py-0.5 rounded inline-block"
                        style={{
                          color: relationInfo.color,
                          background: relationInfo.bg,
                          textShadow: `0 0 6px ${relationInfo.color}`,
                        }}
                      >
                        {relationInfo.label}
                      </div>
                    </div>
                  </div>

                  {/* 對戰次數 */}
                  <div
                    className="text-xs mb-2 text-center"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    對戰 <span style={{ color: 'var(--cyan)' }}>{stat.totalMatches}</span> 場
                  </div>

                  {/* 勝率條 */}
                  <div className="mb-2">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span style={{ color: 'var(--cyan)' }}>我 {myPercent}%</span>
                      <span style={{ color: 'var(--pink)' }}>{friendPercent}% 對方</span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden flex"
                      style={{ background: 'var(--bg-dark)' }}
                    >
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${myPercent}%`,
                          background:
                            'linear-gradient(90deg, var(--cyan), var(--cyan-glow))',
                          boxShadow: '0 0 6px var(--cyan)',
                        }}
                      />
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${friendPercent}%`,
                          background:
                            'linear-gradient(90deg, var(--pink-glow), var(--pink))',
                          boxShadow: '0 0 6px var(--pink)',
                        }}
                      />
                    </div>
                  </div>

                  {/* 勝負數字 */}
                  <div className="flex justify-between text-xs font-cyber">
                    <span style={{ color: 'var(--green)' }}>
                      <Trophy size={10} className="inline mr-1" />
                      {stat.myWins} 勝
                    </span>
                    <span style={{ color: 'var(--red)' }}>
                      {stat.friendWins} 負
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* B. 歷史對局列表 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3
              className="font-cyber text-sm tracking-wider"
              style={{ color: 'var(--pink)' }}
            >
              歷史對局
            </h3>

            {/* 篩選下拉 */}
            <div className="relative">
              <select
                value={selectedFriendId}
                onChange={(e) => setSelectedFriendId(e.target.value)}
                className="cyber-input text-xs py-1.5 pr-7 appearance-none cursor-pointer"
                style={{
                  borderColor: 'var(--border-neon)',
                  color: 'var(--text-primary)',
                  background: 'var(--bg-mid)',
                }}
              >
                <option value="all">全部好友</option>
                {stats.map((s: FriendStat) => (
                  <option key={s.userId} value={s.userId}>
                    {s.nickname}
                  </option>
                ))}
              </select>
              <div
                className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--cyan)' }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M2 4l3 3 3-3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* 對局列表 */}
          <div className="space-y-2">
            {filteredRecords.length === 0 && (
              <div
                className="text-center py-8 text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                尚無對戰記錄
              </div>
            )}
            {filteredRecords.map((record: MatchRecord) => {
              const isWin = record.result === 'win';
              return (
                <div
                  key={record.id}
                  className="flex items-center gap-3 p-3 rounded-lg transition-colors"
                  style={{
                    background: 'var(--bg-mid)',
                    border: `1px solid ${isWin ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 71, 87, 0.3)'}`,
                    boxShadow: isWin
                      ? '0 0 8px rgba(0, 255, 136, 0.1)'
                      : '0 0 8px rgba(255, 71, 87, 0.08)',
                  }}
                >
                  {/* 勝負圖示 */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isWin
                        ? 'rgba(0, 255, 136, 0.15)'
                        : 'rgba(255, 71, 87, 0.15)',
                      border: `1px solid ${isWin ? 'var(--green)' : 'var(--red)'}`,
                    }}
                  >
                    <span
                      className="font-cyber text-sm font-bold"
                      style={{
                        color: isWin ? 'var(--green)' : 'var(--red)',
                        textShadow: `0 0 8px ${isWin ? 'var(--green)' : 'var(--red)'}`,
                      }}
                    >
                      {isWin ? '勝' : '負'}
                    </span>
                  </div>

                  {/* 對手與模式 */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-medium truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      vs. {record.friendNickname}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-[10px] font-cyber tracking-wider px-1.5 py-0.5 rounded"
                        style={{
                          color: 'var(--purple, #b388ff)',
                          background: 'rgba(179, 136, 255, 0.15)',
                        }}
                      >
                        {getModeLabel(record.mode)}
                      </span>
                      <span
                        className="text-xs flex items-center gap-1"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <Clock size={10} />
                        {formatDuration(record.duration)}
                      </span>
                    </div>
                  </div>

                  {/* 日期時間 */}
                  <div
                    className="text-right text-xs flex-shrink-0"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {formatPlayedAt(record.playedAt)}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default FriendMatchHistory;
