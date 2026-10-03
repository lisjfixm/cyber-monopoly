import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Trophy,
  Coins,
  Sparkles,
  Check,
  Calendar,
  Target,
  Gift,
  Zap,
  Flame,
  Star,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { useDailyChallenge } from '@client/src/hooks/useDailyChallenge';
import { usePlayerIdentity } from '@client/src/hooks/usePlayerIdentity';
import type { DailyTask, WeeklyTask, TaskStatus } from '@shared/api.interface';

type TabType = 'daily' | 'weekly' | 'checkin' | 'event';

const TABS: Array<{ key: TabType; label: string }> = [
  { key: 'daily', label: '每日任務' },
  { key: 'weekly', label: '每週任務' },
  { key: 'checkin', label: '每日簽到' },
  { key: 'event', label: '活動日曆' },
];

function getStatusStyle(status: TaskStatus): { text: string; color: string; bg: string } {
  switch (status) {
    case 'claimed':
      return { text: '已領取', color: 'var(--green)', bg: 'rgba(0, 255, 128, 0.08)' };
    case 'completed':
      return { text: '可領取', color: 'var(--yellow)', bg: 'rgba(255, 200, 0, 0.1)' };
    default:
      return { text: '進行中', color: 'var(--text-secondary)', bg: 'rgba(255, 255, 255, 0.04)' };
  }
}

function TaskCard({
  task,
  onClaim,
  isDaily,
}: { task: DailyTask | WeeklyTask; onClaim: () => void; isDaily: boolean }) {
  const statusStyle = getStatusStyle(task.status);
  const percent = task.target > 0 ? Math.min(100, (task.progress / task.target) * 100) : 0;

  return (
    <div
      className="cyber-card p-4"
      style={{
        borderColor: task.status === 'completed' ? 'var(--yellow)' : 'rgba(0, 255, 255, 0.15)',
        boxShadow: task.status === 'completed' ? '0 0 12px rgba(255, 200, 0, 0.2)' : 'none',
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-cyber text-base tracking-wider text-[var(--text-primary)]">
            {task.name}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">{task.description}</p>
        </div>
        <span
          className="text-xs px-2 py-1 font-cyber tracking-wider rounded-sm flex-shrink-0"
          style={{
            color: statusStyle.color,
            border: `1px solid ${statusStyle.color}`,
            backgroundColor: statusStyle.bg,
          }}
        >
          {statusStyle.text}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-[var(--text-muted)]">進度</span>
          <span className="text-[var(--cyan)] font-cyber">
            {task.progress}/{task.target}
          </span>
        </div>
        <div
          className="w-full h-2 rounded-sm overflow-hidden"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
        >
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${percent}%`,
              background: 'linear-gradient(90deg, var(--cyan), var(--pink))',
              boxShadow: '0 0 8px var(--cyan)',
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {task.reward?.coins ? (
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--yellow)' }}>
              <Coins size={12} />
              +{task.reward.coins}
            </div>
          ) : null}
          {task.reward?.exp ? (
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--green)' }}>
              <Sparkles size={12} />
              +{task.reward.exp} EXP
            </div>
          ) : null}
          {task.reward?.item ? (
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--purple)' }}>
              <Star size={12} />
              {task.reward.item}
            </div>
          ) : null}
        </div>
        {task.status === 'completed' && (
          <button
            type="button"
            onClick={onClaim}
            className="cyber-btn cyber-btn-pink px-4 py-1.5 text-xs font-cyber tracking-wider pulse-glow"
            style={{ boxShadow: '0 0 10px rgba(255, 107, 157, 0.4)' }}
          >
            領取獎勵
          </button>
        )}
        {task.status === 'claimed' && (
          <div className="flex items-center gap-1 text-xs text-[var(--green)]">
            <Check size={14} />
            已領取
          </div>
        )}
      </div>
    </div>
  );
}

const DailyChallengePage = () => {
  const navigate = useNavigate();
  const { nickname } = usePlayerIdentity();
  const [activeTab, setActiveTab] = useState<TabType>('daily');
  const {
    dailyTasks,
    weeklyTasks,
    checkInDays,
    checkInStreak,
    streakMilestones,
    activities,
    limitedModes,
    today,
    claimTask,
    performCheckIn,
    incrementTask,
  } = useDailyChallenge();

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleStartChallenge = useCallback(() => {
    const params = new URLSearchParams();
    params.set('p1', encodeURIComponent(nickname || '玩家'));
    navigate(`/ai-setup?${params.toString()}`);
  }, [navigate, nickname]);

  const todayChecked = useMemo(() => {
    const d = new Date();
    const weekday = d.getDay() || 7;
    return checkInDays.some((day) => day.isToday && day.checked);
  }, [checkInDays]);

  const dailyDoneCount = dailyTasks.filter((t: DailyTask) => t.status !== 'incomplete').length;
  const weeklyDoneCount = weeklyTasks.filter((t: WeeklyTask) => t.status !== 'incomplete').length;

  return (
    <div className="min-h-screen w-full flex flex-col px-4 py-6 scanlines relative">
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={handleBack}
          className="cyber-btn px-3 py-2 text-sm flex items-center gap-1"
          style={{
            borderColor: 'var(--cyan)',
            color: 'var(--cyan)',
          }}
        >
          <ArrowLeft size={16} />
          <span className="font-cyber tracking-wider">返回</span>
        </button>
        <div className="flex-1">
          <h1 className="font-cyber text-2xl md:text-3xl text-neon-pink tracking-wider">
            每日挑戰
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-cyber tracking-wider mt-1 flex items-center gap-1">
            <Calendar size={12} />
            {today}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Flame size={16} style={{ color: 'var(--yellow)' }} />
          <span className="font-cyber text-[var(--yellow)]">{checkInStreak}天</span>
        </div>
      </div>

      <div className="flex gap-2 mb-4 max-w-2xl w-full mx-auto">
        {TABS.map((tab) => {
          const selected = activeTab === tab.key;
          const badge = tab.key === 'daily'
            ? dailyDoneCount
            : tab.key === 'weekly'
              ? weeklyDoneCount
              : 0;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className="cyber-btn flex-1 py-2 text-xs md:text-sm font-cyber tracking-wider transition-all"
              style={{
                borderColor: selected ? 'var(--pink)' : 'rgba(0, 255, 255, 0.2)',
                color: selected ? 'var(--pink)' : 'var(--text-secondary)',
                background: selected ? 'rgba(255, 107, 157, 0.08)' : 'transparent',
                boxShadow: selected ? '0 0 12px rgba(255, 107, 157, 0.3)' : 'none',
              }}
            >
              {tab.label}
              {badge > 0 && (
                <span
                  className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--yellow)', color: '#000' }}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="max-w-2xl w-full mx-auto space-y-4 pb-8">
        {activeTab === 'daily' && (
          <>
            <div
              className="cyber-card p-4 relative overflow-hidden"
              style={{
                borderColor: 'var(--pink)',
                boxShadow: '0 0 20px rgba(255, 107, 157, 0.2)',
              }}
            >
              <div
                className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
                style={{ background: 'var(--pink)' }}
              />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-cyber tracking-widest text-[var(--pink)] mb-1">
                    [ 今日挑戰 ]
                  </div>
                  <h2 className="font-cyber text-xl md:text-2xl text-neon-pink tracking-wider">
                    霓虹狂歡節
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    挑戰專屬規則，通關獲得雙倍獎勵
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleStartChallenge}
                  className="cyber-btn cyber-btn-pink px-4 py-2 text-sm font-cyber tracking-wider flex items-center gap-1"
                >
                  <Target size={16} />
                  開始
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap size={16} style={{ color: 'var(--yellow)' }} />
                <h2 className="font-cyber text-sm tracking-wider text-[var(--yellow)]">
                  每日任務
                </h2>
                <span className="text-xs text-[var(--text-muted)]">
                  {dailyDoneCount}/{dailyTasks.length}
                </span>
              </div>
              {dailyTasks.length === 0 && (
                <div className="text-center text-sm text-[var(--text-muted)] py-8">
                  今日尚無任務，稍後再來看看
                </div>
              )}
              {dailyTasks.map((task: DailyTask) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isDaily
                  onClaim={() => claimTask(task.id, true)}
                />
              ))}
            </div>

            {process.env.NODE_ENV !== 'production' && (
              <button
                type="button"
                onClick={() => {
                  incrementTask('daily_play');
                  incrementTask('daily_win');
                  incrementTask('daily_buy_property', 3);
                }}
                className="cyber-btn w-full py-2 text-xs font-cyber tracking-wider opacity-50"
                style={{ borderColor: 'var(--text-muted)', color: 'var(--text-secondary)' }}
              >
                [測試] 模擬完成所有任務
              </button>
            )}
          </>
        )}

        {activeTab === 'weekly' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Trophy size={16} style={{ color: 'var(--yellow)' }} />
              <h2 className="font-cyber text-sm tracking-wider text-[var(--yellow)]">
                每週任務
              </h2>
              <span className="text-xs text-[var(--text-muted)]">
                {weeklyDoneCount}/{weeklyTasks.length}
              </span>
            </div>
            {weeklyTasks.length === 0 && (
              <div className="text-center text-sm text-[var(--text-muted)] py-8">
                本週尚無任務，稍後再來看看
              </div>
            )}
            {weeklyTasks.map((task: WeeklyTask) => (
              <TaskCard
                key={task.id}
                task={task}
                isDaily={false}
                onClaim={() => claimTask(task.id, false)}
              />
            ))}
          </div>
        )}

        {activeTab === 'checkin' && (
          <>
            <div
              className="cyber-card p-4"
              style={{ borderColor: 'rgba(255, 200, 0, 0.3)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-cyber text-base tracking-wider text-[var(--yellow)]">
                    連續簽到 {checkInStreak} 天
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    堅持每日簽到，累計里程碑獎勵
                  </p>
                </div>
                {todayChecked ? (
                  <div className="flex items-center gap-1 text-[var(--green)] text-sm font-cyber">
                    <Check size={16} />
                    今日已簽
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={performCheckIn}
                    className="cyber-btn px-4 py-2 text-sm font-cyber tracking-wider pulse-glow"
                    style={{
                      borderColor: 'var(--yellow)',
                      color: 'var(--yellow)',
                      boxShadow: '0 0 15px rgba(255, 200, 0, 0.4)',
                      background: 'rgba(255, 200, 0, 0.08)',
                    }}
                  >
                    立即簽到
                  </button>
                )}
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {checkInDays.map((day) => {
                  const isRare = day.day === 7;
                  return (
                    <div
                      key={day.day}
                      className="flex flex-col items-center p-2 rounded-sm"
                      style={{
                        border: `1px solid ${
                          day.checked
                            ? isRare
                              ? 'var(--purple)'
                              : 'var(--green)'
                            : day.isToday
                              ? 'var(--yellow)'
                              : 'rgba(255, 255, 255, 0.1)'
                        }`,
                        backgroundColor: day.checked
                          ? isRare
                            ? 'rgba(168, 85, 247, 0.1)'
                            : 'rgba(0, 255, 128, 0.08)'
                          : day.isToday
                            ? 'rgba(255, 200, 0, 0.08)'
                            : 'rgba(0, 0, 0, 0.2)',
                        boxShadow: day.checked
                          ? `0 0 8px ${isRare ? 'rgba(168, 85, 247, 0.3)' : 'rgba(0, 255, 128, 0.25)'}`
                          : day.isToday
                            ? '0 0 8px rgba(255, 200, 0, 0.25)'
                            : 'none',
                      }}
                    >
                      <div
                        className="text-xs font-cyber mb-1"
                        style={{
                          color: day.checked
                            ? isRare ? 'var(--purple)' : 'var(--green)'
                            : day.isToday
                              ? 'var(--yellow)'
                              : 'var(--text-muted)',
                        }}
                      >
                        第{day.day}天
                      </div>
                      <div className="w-8 h-8 flex items-center justify-center">
                        {day.checked ? (
                          <Gift
                            size={20}
                            style={{
                              color: isRare ? 'var(--purple)' : 'var(--green)',
                              filter: `drop-shadow(0 0 4px ${isRare ? 'var(--purple)' : 'var(--green)'})`,
                            }}
                          />
                        ) : day.isToday ? (
                          <Gift size={20} style={{ color: 'var(--yellow)' }} />
                        ) : (
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ border: '1px dashed var(--text-muted)' }}
                          />
                        )}
                      </div>
                      <div
                        className="text-[10px] mt-1 text-center truncate max-w-full px-0.5"
                        style={{
                          color: isRare ? 'var(--purple)' : 'var(--text-secondary)',
                        }}
                        title={day.reward}
                      >
                        {(day.reward || '').split(' ')[0] || '—'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              className="cyber-card p-4"
              style={{ borderColor: 'rgba(168, 85, 247, 0.25)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Star size={16} style={{ color: 'var(--purple)' }} />
                <h2 className="font-cyber text-sm tracking-wider text-[var(--purple)]">
                  連續簽到里程碑
                </h2>
              </div>
              <div className="space-y-2">
                {streakMilestones.map((ms) => (
                  <div
                    key={ms.days}
                    className="flex items-center justify-between p-2 rounded-sm"
                    style={{
                      border: `1px solid ${ms.reached ? 'var(--green)' : 'rgba(255,255,255,0.1)'}`,
                      backgroundColor: ms.reached ? 'rgba(0, 255, 128, 0.06)' : 'rgba(0,0,0,0.2)',
                    }}
                  >
                    <span className="text-sm" style={{ color: ms.reached ? 'var(--green)' : 'var(--text-secondary)' }}>
                      {ms.reward}
                    </span>
                    {ms.reached ? (
                      <Check size={16} style={{ color: 'var(--green)' }} />
                    ) : (
                      <span className="text-xs text-[var(--text-muted)]">
                        {checkInStreak}/{ms.days}天
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'event' && (
          <>
            {limitedModes.length > 0 && (
              <div
                className="cyber-card p-5 relative overflow-hidden"
                style={{
                  borderColor: limitedModes[0].color,
                  boxShadow: `0 0 20px ${limitedModes[0].color}30`,
                }}
              >
                <div
                  className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-20 blur-3xl pointer-events-none"
                  style={{ background: limitedModes[0].color }}
                />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={18} style={{ color: limitedModes[0].color }} />
                    <span className="text-xs font-cyber tracking-widest" style={{ color: limitedModes[0].color }}>
                      {limitedModes[0].weekLabel}
                    </span>
                  </div>
                  <h2
                    className="font-cyber text-2xl md:text-3xl font-bold tracking-wider mb-2"
                    style={{
                      color: limitedModes[0].color,
                      textShadow: `0 0 10px ${limitedModes[0].color}`,
                    }}
                  >
                    {limitedModes[0].name}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    {limitedModes[0].description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                      <Clock size={12} />
                      {limitedModes[0].startDate} ~ {limitedModes[0].endDate}
                    </span>
                    <button
                      type="button"
                      onClick={handleStartChallenge}
                      className="cyber-btn px-4 py-2 text-sm font-cyber tracking-wider flex items-center gap-1"
                      style={{
                        borderColor: limitedModes[0].color,
                        color: limitedModes[0].color,
                        boxShadow: `0 0 10px ${limitedModes[0].color}40`,
                      }}
                    >
                      立即體驗
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar size={16} style={{ color: 'var(--cyan)' }} />
                <h2 className="font-cyber text-sm tracking-wider text-[var(--cyan)]">
                  活動日曆
                </h2>
              </div>
              {activities.length === 0 && (
                <div className="text-center text-sm text-[var(--text-muted)] py-8">
                  近期沒有安排活動，敬請期待
                </div>
              )}
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="cyber-card p-4 flex items-center gap-4"
                  style={{
                    borderColor: `${act.color}40`,
                    borderLeftWidth: '4px',
                    borderLeftColor: act.color,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-cyber text-base tracking-wider" style={{ color: act.color }}>
                        {act.name}
                      </h3>
                      <span
                        className="text-[10px] px-2 py-0.5 font-cyber tracking-wider rounded-sm"
                        style={{
                          color: act.status === 'ongoing' ? 'var(--green)' : act.status === 'upcoming' ? 'var(--yellow)' : 'var(--text-muted)',
                          border: `1px solid ${act.status === 'ongoing' ? 'var(--green)' : act.status === 'upcoming' ? 'var(--yellow)' : 'var(--text-muted)'}`,
                          backgroundColor: act.status === 'ongoing'
                            ? 'rgba(0, 255, 128, 0.08)'
                            : act.status === 'upcoming'
                              ? 'rgba(255, 200, 0, 0.06)'
                              : 'rgba(255,255,255,0.04)',
                        }}
                      >
                        {act.status === 'ongoing' ? '進行中' : act.status === 'upcoming' ? '即將開始' : '已結束'}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mb-1">{act.description}</p>
                    <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                      <Clock size={10} />
                      {act.startDate} ~ {act.endDate}
                    </div>
                  </div>
                  <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DailyChallengePage;
