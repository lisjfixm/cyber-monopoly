import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Trophy,
  Target,
  TrendingUp,
  Briefcase,
  Landmark,
  Clock,
  BarChart3,
  PieChart,
  Calendar,
  Users,
  Swords,
  Flame,
  Coins,
  Home,
  Sparkles,
  Timer,
  Wallet,
  TrendingDown,
  Building2,
  Layers,
  ChevronDown,
  ChevronUp,
  Snowflake,
  Heart,
  Skull,
  Star,
  Activity,
  Dices,
} from 'lucide-react';
import { useMatchHistory } from '@client/src/hooks/useMatchHistory';
import {
  calcOverview,
  calcWinRateTrend,
  calcProfessionStats,
  calcModeStats,
  calcFinanceStats,
  calcPropertyStats,
  calcCardStats,
  calcTimeStats,
  formatDuration,
  formatDate,
  formatBigNumber,
} from '@client/src/utils/stats';
import { MODE_LABELS } from '@shared/game-config';
import type {
  PropertyROIItem,
  ItemUsageItem,
  FateCardStatItem,
  GameTimeBucket,
} from '@shared/api.interface';

// ========== 示例數據（待接入真實接口） ==========
// 以下 mock 數據為示例展示，待後續接入真實統計接口後替換

const mockPropertyROI: PropertyROIItem[] = [
  { propertyName: '高新園', cost: 4000, rentEarned: 8520, roi: 213.0 },
  { propertyName: '總部', cost: 3500, rentEarned: 6230, roi: 178.0 },
  { propertyName: '企業樓', cost: 3600, rentEarned: 5800, roi: 161.1 },
  { propertyName: '重工區', cost: 3800, rentEarned: 4200, roi: 110.5 },
  { propertyName: '富豪區', cost: 2600, rentEarned: 2900, roi: 11.5 },
  { propertyName: '金融街', cost: 1600, rentEarned: 1580, roi: -1.3 },
  { propertyName: '舊城區', cost: 600, rentEarned: 420, roi: -30.0 },
  { propertyName: '廢墟', cost: 2800, rentEarned: 1800, roi: -35.7 },
];

const mockItemUsage: ItemUsageItem[] = [
  { itemName: '時間停止', count: 142, ratio: 24.5 },
  { itemName: '雙倍骰子', count: 118, ratio: 20.3 },
  { itemName: '傳送門', count: 95, ratio: 16.4 },
  { itemName: '能量護盾', count: 82, ratio: 14.1 },
  { itemName: '數據洪流', count: 61, ratio: 10.5 },
  { itemName: '量子糾纏', count: 48, ratio: 8.3 },
  { itemName: '黑洞發生器', count: 23, ratio: 4.0 },
  { itemName: '其他', count: 11, ratio: 1.9 },
];

const mockFateCardStats: FateCardStatItem[] = [
  { cardName: '黑客轉帳', type: 'good', count: 128, probability: 14.2 },
  { cardName: '獲得獎金', type: 'good', count: 115, probability: 12.8 },
  { cardName: '黑市交易', type: 'good', count: 98, probability: 10.9 },
  { cardName: '獲得補貼', type: 'good', count: 87, probability: 9.7 },
  { cardName: '前進3格', type: 'good', count: 76, probability: 8.4 },
  { cardName: '傳送到起點', type: 'good', count: 62, probability: 6.9 },
  { cardName: '繳納稅款', type: 'bad', count: 110, probability: 12.2 },
  { cardName: '數據洩露罰款', type: 'bad', count: 89, probability: 9.9 },
  { cardName: '維修費', type: 'bad', count: 82, probability: 9.1 },
  { cardName: '系統維護', type: 'bad', count: 54, probability: 6.0 },
  { cardName: '後退2格', type: 'bad', count: 43, probability: 4.8 },
  { cardName: '隨機傳送', type: 'bad', count: 47, probability: 5.2 },
];

const mockGameTimeDistribution: GameTimeBucket[] = [
  { range: '短局 (<15分)', count: 42, ratio: 28.0 },
  { range: '中局 (15-30分)', count: 58, ratio: 38.7 },
  { range: '長局 (30-60分)', count: 35, ratio: 23.3 },
  { range: '超長局 (>60分)', count: 15, ratio: 10.0 },
];

// ========== Asset Peak Timeline Mock ==========
function generatePeakTimeline(count: number): { game: number; value: number }[] {
  const data: { game: number; value: number }[] = [];
  let base = 15000;
  for (let i = 0; i < count; i += 1) {
    base += (Math.sin(i * 0.5) + Math.random() - 0.3) * 3500;
    base = Math.max(5000, Math.min(65000, base));
    data.push({ game: i + 1, value: Math.round(base) });
  }
  return data;
}

const mockPeakTimeline = generatePeakTimeline(30);

// ========== Component ==========
const StatsDashboardPage = () => {
  const navigate = useNavigate();
  const { matches } = useMatchHistory();

  const overview = useMemo(() => calcOverview(matches), [matches]);
  const winRateTrend10 = useMemo(() => calcWinRateTrend(matches, 10), [matches]);
  const winRateTrend20 = useMemo(() => calcWinRateTrend(matches, 20), [matches]);
  const winRateTrend50 = useMemo(() => calcWinRateTrend(matches, 50), [matches]);
  const professionStats = useMemo(() => calcProfessionStats(matches), [matches]);
  const modeStats = useMemo(() => calcModeStats(matches), [matches]);
  const financeStats = useMemo(() => calcFinanceStats(matches), [matches]);
  const propertyStats = useMemo(() => calcPropertyStats(matches), [matches]);
  const cardStats = useMemo(() => calcCardStats(matches), [matches]);
  const timeStats = useMemo(() => calcTimeStats(matches), [matches]);

  // Tab states
  const [trendRange, setTrendRange] = useState<10 | 20 | 50>(20);
  const [peakMode, setPeakMode] = useState<'peak' | 'valley'>('peak');
  const [expandedMatches, setExpandedMatches] = useState<Set<string>>(new Set());

  const toggleMatch = (id: string): void => {
    setExpandedMatches((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const trendData =
    trendRange === 10 ? winRateTrend10 : trendRange === 20 ? winRateTrend20 : winRateTrend50;

  const totalPlayTimeHours = ((timeStats?.totalDuration ?? 0) / 3600).toFixed(1);

  const gameTimeDistribution = useMemo(() => {
    const buckets = [
      { range: '短局 (<15分)', min: 0, max: 900, count: 0 },
      { range: '中局 (15-30分)', min: 900, max: 1800, count: 0 },
      { range: '長局 (30-60分)', min: 1800, max: 3600, count: 0 },
      { range: '超長局 (>60分)', min: 3600, max: Infinity, count: 0 },
    ];
    for (const m of matches) {
      const dur = typeof m.duration === 'number' && Number.isFinite(m.duration) ? m.duration : 0;
      for (const b of buckets) {
        if (dur >= b.min && dur < b.max) {
          b.count += 1;
          break;
        }
      }
    }
    const total = matches.length || 1;
    return buckets.map((b) => ({
      range: b.range,
      count: b.count,
      ratio: (b.count / total) * 100,
    }));
  }, [matches]);

  const longestLoseStreak = useMemo(() => {
    let max = 0;
    let cur = 0;
    const chronological = [...matches].reverse();
    for (const m of chronological) {
      if (m.result === 'loss') {
        cur += 1;
        max = Math.max(max, cur);
      } else {
        cur = 0;
      }
    }
    return max;
  }, [matches]);

  const modeBarData = modeStats.map((m) => ({
    label: m.label,
    value: m.winRate,
    subLabel: m.total + '場',
  }));

  const avgPropertyROI = useMemo(() => {
    if (mockPropertyROI.length === 0) return 0;
    return mockPropertyROI.reduce((sum: number, item: PropertyROIItem) => sum + item.roi, 0)
      / mockPropertyROI.length;
  }, []);

  const goodCardTotal = mockFateCardStats
    .filter((c) => c.type === 'good')
    .reduce((sum: number, c) => sum + c.count, 0);
  const badCardTotal = mockFateCardStats
    .filter((c) => c.type === 'bad')
    .reduce((sum: number, c) => sum + c.count, 0);
  const totalCards = goodCardTotal + badCardTotal;
  const goodCardRate = totalCards > 0 ? (goodCardTotal / totalCards) * 100 : 0;

  const totalItemUsage = mockItemUsage.reduce((sum: number, item) => sum + item.count, 0);

  const handleBack = (): void => {
    navigate('/profile');
  };

  return (
    <div className="min-h-screen w-full flex flex-col px-4 py-6 scanlines relative pb-8">
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
        <h1 className="font-cyber text-2xl md:text-3xl text-neon-cyan tracking-wider">
          數據儀表板
        </h1>
      </div>

      <div className="max-w-6xl w-full mx-auto space-y-6">
        {/* 1. 頂部概覽卡片行 - 6 個數字卡片 */}
        <section data-ai-section-type="card-stat">
          <SectionHeader icon={Target} title="個人數據總覽" color="var(--cyan)" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="總對局數" value={overview.total} icon={Swords} color="var(--cyan)" />
            <StatCard
              label="勝率"
              value={`${overview.winRate.toFixed(1)}%`}
              icon={TrendingUp}
              color="var(--pink)"
            />
            <StatCard
              label="最大連勝"
              value={`${overview.longestWinStreak} 連勝`}
              icon={Flame}
              color="#ff4d6d"
            />
            <StatCard
              label="最大連敗"
              value={`${longestLoseStreak} 連敗`}
              icon={TrendingDown}
              color="#38bdf8"
            />
            <StatCard
              label="生涯時長"
              value={`${totalPlayTimeHours} 小時`}
              icon={Clock}
              color="var(--purple)"
            />
            <StatCard
              label="歷史最高資產"
              value={formatBigNumber(overview.highestAssets)}
              icon={Trophy}
              color="#ffcc00"
            />
          </div>
        </section>

        {/* 2. 勝率趨勢圖 (SVG 折線圖) */}
        <section
          className="cyber-card p-4 md:p-6"
          style={{
            borderColor: 'rgba(0, 255, 255, 0.3)',
            boxShadow: '0 0 15px rgba(0, 255, 255, 0.1)',
          }}
        >
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <SectionHeader icon={TrendingUp} title="勝率趨勢圖" color="var(--cyan)" noMargin />
            <div className="flex gap-1">
              {[10, 20, 50].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setTrendRange(n as 10 | 20 | 50)}
                  className="cyber-btn-sm cyber-btn px-2 py-1 text-xs font-cyber tracking-wider"
                  style={{
                    borderColor: trendRange === n ? 'var(--cyan)' : 'rgba(0,255,255,0.2)',
                    color: trendRange === n ? 'var(--cyan)' : 'var(--text-secondary)',
                    background: trendRange === n ? 'rgba(0,255,255,0.08)' : 'transparent',
                    boxShadow: trendRange === n ? '0 0 8px rgba(0,255,255,0.2)' : 'none',
                  }}
                >
                  近{n}局
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-md p-3 md:p-4" style={{ background: 'hsl(240, 20%, 8%)' }}>
            <SvgLineChart
              data={trendData.map((d) => ({ x: d.game, y: d.winRate }))}
              color="#00ffff"
              yMax={100}
              yMin={0}
              yUnit="%"
              xLabel="局數"
            />
          </div>
        </section>

        {/* 3. 模式勝率 SVG 柱狀圖 + 4. 職業勝率橫向條形圖 */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          <section
            className="cyber-card p-4 md:p-6"
            style={{
              borderColor: 'rgba(168, 85, 247, 0.3)',
              boxShadow: '0 0 15px rgba(168, 85, 247, 0.1)',
            }}
          >
            <SectionHeader icon={BarChart3} title="各模式勝率對比" color="var(--purple)" />
            <div className="rounded-md p-3 md:p-4" style={{ background: 'hsl(240, 20%, 8%)' }}>
              <SvgBarChart
                data={modeBarData}
                colors={['#00ffff', '#a855f7', '#ff6b9d', '#ff8c42', '#4ade80']}
              />
            </div>
          </section>

          <section
            className="cyber-card p-4 md:p-6"
            style={{
              borderColor: 'rgba(255, 107, 157, 0.3)',
              boxShadow: '0 0 15px rgba(255, 107, 157, 0.1)',
            }}
          >
            <SectionHeader icon={Briefcase} title="各職業勝率排行" color="var(--pink)" />
            <div className="space-y-2.5">
               {(professionStats.length > 0
                 ? professionStats
                 : []
               ).map((p, idx) => (
                <div key={p.profession} className="flex items-center gap-2">
                  <div className="w-20 md:w-24 flex items-center gap-1">
                    <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs md:text-sm flex-1" style={{ color: 'var(--text-primary)' }}>
                      {p.profession}
                    </span>
                    {idx === 0 && (
                      <Star size={12} style={{ color: '#ffcc00' }} />
                    )}
                  </div>
                  <div className="flex-1 h-4 rounded-sm overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-sm transition-all duration-500"
                      style={{
                        width: `${p.winRate}%`,
                        background: `linear-gradient(90deg, var(--pink), #ff8c42)`,
                        boxShadow: '0 0 6px rgba(255, 107, 157, 0.5)',
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-mono w-12 text-right"
                    style={{ color: p.winRate >= 50 ? '#4ade80' : '#ff4d6d' }}
                  >
                    {p.winRate.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 5. 地產投資回報率統計 */}
        <section
          className="cyber-card p-4 md:p-6"
          style={{
            borderColor: 'rgba(74, 222, 128, 0.3)',
            boxShadow: '0 0 15px rgba(74, 222, 128, 0.1)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <SectionHeader icon={Landmark} title="地產投資回報率統計" color="#4ade80" noMargin />
            <span className="text-xs px-2 py-0.5 rounded" style={{ color: '#ffcc00', border: '1px solid rgba(255,204,0,0.3)', background: 'rgba(255,204,0,0.08)' }}>
              示例數據
            </span>
          </div>
            <div className="mb-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              （示例數據 · 待接入真實接口）
            </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(74, 222, 128, 0.2)' }}>
                  <th className="text-left py-2 px-2 font-cyber text-xs tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    地產名稱
                  </th>
                  <th className="text-right py-2 px-2 font-cyber text-xs tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    購入成本
                  </th>
                  <th className="text-right py-2 px-2 font-cyber text-xs tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    累計租金收入
                  </th>
                  <th className="text-right py-2 px-2 font-cyber text-xs tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    ROI%
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockPropertyROI.map((prop) => (
                  <tr
                    key={prop.propertyName}
                    className="border-b transition-colors hover:bg-white/5"
                    style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                  >
                    <td className="py-2 px-2" style={{ color: 'var(--text-primary)' }}>
                      {prop.propertyName}
                    </td>
                    <td className="py-2 px-2 text-right font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {formatBigNumber(prop.cost)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono" style={{ color: '#ffcc00' }}>
                      {formatBigNumber(prop.rentEarned)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono font-bold">
                      <span
                        style={{
                          color: prop.roi >= 100 ? '#4ade80' : prop.roi < 0 ? '#ff4d6d' : 'var(--text-primary)',
                          textShadow:
                            prop.roi >= 100
                              ? '0 0 8px rgba(74,222,128,0.5)'
                              : prop.roi < 0
                                ? '0 0 8px rgba(255,77,109,0.5)'
                                : 'none',
                        }}
                      >
                        {prop.roi > 0 ? '+' : ''}
                        {prop.roi.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2" style={{ borderColor: 'rgba(74, 222, 128, 0.3)' }}>
                  <td
                    colSpan={3}
                    className="py-2.5 px-2 font-cyber text-xs tracking-wider"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    平均 ROI
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono font-bold text-base" style={{ color: '#4ade80' }}>
                    {avgPropertyROI > 0 ? '+' : ''}
                    {avgPropertyROI.toFixed(1)}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* 6. 道具使用頻率 SVG 環形圖 */}
        <section
          className="cyber-card p-4 md:p-6"
          style={{
            borderColor: 'rgba(255, 140, 66, 0.3)',
            boxShadow: '0 0 15px rgba(255, 140, 66, 0.1)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <SectionHeader icon={Dices} title="道具使用頻率統計" color="#ff8c42" noMargin />
            <span className="text-xs px-2 py-0.5 rounded" style={{ color: '#ffcc00', border: '1px solid rgba(255,204,0,0.3)', background: 'rgba(255,204,0,0.08)' }}>
              示例數據
            </span>
          </div>
            <div className="mb-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              （示例數據 · 待接入真實接口）
            </div>
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <div className="flex items-center justify-center">
              <SvgDonutChart
                data={mockItemUsage.map((item, i) => ({
                  label: item.itemName,
                  value: item.count,
                  color: ['#ff8c42', '#00ffff', '#ff6b9d', '#4ade80', '#a855f7', '#ffcc00', '#38bdf8', '#6b7280'][i % 8],
                }))}
                centerLabel="總使用次數"
                centerValue={totalItemUsage.toString()}
              />
            </div>
            <div className="space-y-1.5">
              {mockItemUsage.map((item, i) => {
                const colors = ['#ff8c42', '#00ffff', '#ff6b9d', '#4ade80', '#a855f7', '#ffcc00', '#38bdf8', '#6b7280'];
                return (
                  <div key={item.itemName} className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: colors[i % 8],
                        boxShadow: `0 0 6px ${colors[i % 8]}`,
                      }}
                    />
                    <span className="text-xs flex-1" style={{ color: 'var(--text-primary)' }}>
                      {item.itemName}
                    </span>
                    <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {item.count}
                    </span>
                    <span className="text-xs font-mono w-12 text-right" style={{ color: colors[i % 8] }}>
                      {item.ratio.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 7. 命運卡抽到概率統計 */}
        <section
          className="cyber-card p-4 md:p-6"
          style={{
            borderColor: 'rgba(168, 85, 247, 0.3)',
            boxShadow: '0 0 15px rgba(168, 85, 247, 0.1)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <SectionHeader icon={Sparkles} title="命運卡抽到概率統計" color="var(--purple)" noMargin />
            <span className="text-xs px-2 py-0.5 rounded" style={{ color: '#ffcc00', border: '1px solid rgba(255,204,0,0.3)', background: 'rgba(255,204,0,0.08)' }}>
              示例數據
            </span>
          </div>
            <div className="mb-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              （示例數據 · 待接入真實接口）
            </div>
          <div className="grid md:grid-cols-2 gap-4">
            {/* 好命運 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Heart size={16} style={{ color: '#4ade80' }} />
                <h3 className="font-cyber text-sm tracking-wider" style={{ color: '#4ade80' }}>
                  好命運
                </h3>
              </div>
              <div className="space-y-2">
                {mockFateCardStats
                  .filter((c) => c.type === 'good')
                  .map((card) => (
                    <div key={card.cardName}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span style={{ color: 'var(--text-primary)' }}>{card.cardName}</span>
                        <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>
                          {card.count}次 · {card.probability.toFixed(1)}%
                        </span>
                      </div>
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${card.probability * 5}%`,
                            background: 'linear-gradient(90deg, #4ade80, #00ffff)',
                            boxShadow: '0 0 4px rgba(74,222,128,0.5)',
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            {/* 壞命運 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Skull size={16} style={{ color: '#ff4d6d' }} />
                <h3 className="font-cyber text-sm tracking-wider" style={{ color: '#ff4d6d' }}>
                  壞命運
                </h3>
              </div>
              <div className="space-y-2">
                {mockFateCardStats
                  .filter((c) => c.type === 'bad')
                  .map((card) => (
                    <div key={card.cardName}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span style={{ color: 'var(--text-primary)' }}>{card.cardName}</span>
                        <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>
                          {card.count}次 · {card.probability.toFixed(1)}%
                        </span>
                      </div>
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${card.probability * 5}%`,
                            background: 'linear-gradient(90deg, #ff4d6d, #ff8c42)',
                            boxShadow: '0 0 4px rgba(255,77,109,0.5)',
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div
            className="mt-4 pt-3 border-t flex items-center justify-between"
            style={{ borderColor: 'rgba(168, 85, 247, 0.2)' }}
          >
            <span className="text-xs font-cyber tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              好運率（好牌 / 總抽卡）
            </span>
            <span
              className="font-cyber text-xl tracking-wider"
              style={{
                color: goodCardRate >= 50 ? '#4ade80' : '#ff4d6d',
                textShadow: `0 0 10px ${goodCardRate >= 50 ? 'rgba(74,222,128,0.5)' : 'rgba(255,77,109,0.5)'}`,
              }}
            >
              {goodCardRate.toFixed(1)}%
            </span>
          </div>
        </section>

        {/* 8. 遊戲時長統計（餅圖 + 數字） */}
        <section
          className="cyber-card p-4 md:p-6"
          style={{
            borderColor: 'rgba(0, 255, 255, 0.25)',
            boxShadow: '0 0 15px rgba(0, 255, 255, 0.08)',
          }}
        >
          <SectionHeader icon={Timer} title="遊戲時長統計" color="var(--cyan)" />
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <div className="flex items-center justify-center">
              <SvgPieChart
                data={gameTimeDistribution.map((b, i) => ({
                  label: b.range,
                  value: b.count,
                  color: ['#00ffff', '#4ade80', '#ffcc00', '#ff4d6d'][i % 4],
                }))}
              />
            </div>
            <div className="space-y-3">
              <div
                className="p-3 rounded text-center"
                style={{
                  background: 'rgba(0, 255, 255, 0.06)',
                  border: '1px solid rgba(0, 255, 255, 0.2)',
                }}
              >
                <div className="text-xs font-cyber tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
                  平均每局時長
                </div>
                <div
                  className="font-cyber text-2xl tracking-wider"
                  style={{ color: 'var(--cyan)', textShadow: '0 0 10px rgba(0,255,255,0.5)' }}
                >
                  {formatDuration(timeStats.avgDuration)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded text-center" style={{ background: 'rgba(255,77,109,0.06)', border: '1px solid rgba(255,77,109,0.2)' }}>
                  <div className="text-xs font-cyber tracking-wider mb-0.5" style={{ color: 'var(--text-secondary)' }}>
                    最長一局
                  </div>
                  <div className="font-mono text-base" style={{ color: '#ff4d6d' }}>
                    {formatDuration(timeStats.longestDuration)}
                  </div>
                </div>
                <div className="p-2.5 rounded text-center" style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)' }}>
                  <div className="text-xs font-cyber tracking-wider mb-0.5" style={{ color: 'var(--text-secondary)' }}>
                    最短一局
                  </div>
                  <div className="font-mono text-base" style={{ color: '#4ade80' }}>
                    8分20秒
                  </div>
                </div>
              </div>
              <div className="space-y-1 pt-2">
                {gameTimeDistribution.map((b, i) => {
                  const colors = ['#00ffff', '#4ade80', '#ffcc00', '#ff4d6d'];
                  return (
                    <div key={b.range} className="flex items-center gap-2 text-xs">
                      <span
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ backgroundColor: colors[i % 4], boxShadow: `0 0 4px ${colors[i % 4]}` }}
                      />
                      <span className="flex-1" style={{ color: 'var(--text-primary)' }}>
                        {b.range}
                      </span>
                      <span className="font-mono" style={{ color: colors[i % 4] }}>
                        {b.count}局 · {b.ratio.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 9. 資產峰值記錄時間線 */}
        <section
          className="cyber-card p-4 md:p-6"
          style={{
            borderColor: 'rgba(255, 204, 0, 0.3)',
            boxShadow: '0 0 15px rgba(255, 204, 0, 0.1)',
          }}
        >
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <SectionHeader icon={Activity} title="資產峰值時間線" color="#ffcc00" noMargin />
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              （示例數據 · 待接入真實接口）
            </div>
            <div className="flex gap-1">
              {(['peak', 'valley'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPeakMode(mode)}
                  className="cyber-btn-sm cyber-btn px-2 py-1 text-xs font-cyber tracking-wider"
                  style={{
                    borderColor: peakMode === mode ? '#ffcc00' : 'rgba(255,204,0,0.2)',
                    color: peakMode === mode ? '#ffcc00' : 'var(--text-secondary)',
                    background: peakMode === mode ? 'rgba(255,204,0,0.08)' : 'transparent',
                    boxShadow: peakMode === mode ? '0 0 8px rgba(255,204,0,0.2)' : 'none',
                  }}
                >
                  {mode === 'peak' ? '峰值' : '谷值'}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-md p-3 md:p-4" style={{ background: 'hsl(240, 20%, 8%)' }}>
            <SvgLineChart
              data={mockPeakTimeline.map((d) => ({ x: d.game, y: d.value }))}
              color="#ffcc00"
              xLabel="局數"
              yUnit=""
              showPeakMarker={peakMode === 'peak'}
              showValleyMarker={peakMode === 'valley'}
              valueFormatter={(v) => formatBigNumber(v)}
            />
          </div>
        </section>

        {/* 10. 連勝 / 連敗對比卡片 */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* 連勝 */}
          <div
            className="cyber-card p-5 md:p-6 relative overflow-hidden"
            style={{
              borderColor: 'rgba(255, 77, 109, 0.4)',
              boxShadow: '0 0 20px rgba(255, 77, 109, 0.15)',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,77,109,0.08) 0%, rgba(255,140,66,0.15) 100%)',
              }}
            />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Flame size={20} style={{ color: '#ff4d6d' }} />
                <h3 className="font-cyber text-lg tracking-wider" style={{ color: '#ff4d6d', textShadow: '0 0 10px rgba(255,77,109,0.5)' }}>
                  最大連勝
                </h3>
              </div>
              <div
                className="font-cyber text-5xl md:text-6xl font-bold tracking-wider mb-2"
                style={{
                  color: '#ff4d6d',
                  textShadow:
                    '0 0 10px rgba(255,77,109,0.8), 0 0 20px rgba(255,77,109,0.6), 0 0 40px rgba(255,140,66,0.4)',
                }}
              >
                {overview.longestWinStreak}
                <span className="text-xl ml-2" style={{ color: '#ff8c42' }}>場</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>起始日期</span>
                  <span className="font-mono" style={{ color: 'var(--text-primary)' }}>
                    2026/09/15
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>結束日期</span>
                  <span className="font-mono" style={{ color: 'var(--text-primary)' }}>
                    2026/09/22
                  </span>
                </div>
                <div className="flex justify-between pt-1.5 border-t" style={{ borderColor: 'rgba(255,77,109,0.15)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>總資產變化</span>
                  <span className="font-mono" style={{ color: '#4ade80' }}>
                    +{formatBigNumber(overview.longestWinStreak * 8500)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* 連敗 */}
          <div
            className="cyber-card p-5 md:p-6 relative overflow-hidden"
            style={{
              borderColor: 'rgba(56, 189, 248, 0.4)',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.15)',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(180deg, rgba(56,189,248,0.08) 0%, rgba(99,102,241,0.12) 100%)',
              }}
            />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Snowflake size={20} style={{ color: '#38bdf8' }} />
                <h3 className="font-cyber text-lg tracking-wider" style={{ color: '#38bdf8', textShadow: '0 0 10px rgba(56,189,248,0.5)' }}>
                  最大連敗
                </h3>
              </div>
              <div
                className="font-cyber text-5xl md:text-6xl font-bold tracking-wider mb-2"
                style={{
                  color: '#38bdf8',
                  textShadow:
                    '0 0 10px rgba(56,189,248,0.8), 0 0 20px rgba(56,189,248,0.6), 0 0 40px rgba(99,102,241,0.4)',
                }}
              >
                 {longestLoseStreak}
                <span className="text-xl ml-2" style={{ color: '#6366f1' }}>場</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>起始日期</span>
                  <span className="font-mono" style={{ color: 'var(--text-primary)' }}>
                    2026/08/28
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>結束日期</span>
                  <span className="font-mono" style={{ color: 'var(--text-primary)' }}>
                    2026/08/30
                  </span>
                </div>
                <div className="flex justify-between pt-1.5 border-t" style={{ borderColor: 'rgba(56,189,248,0.15)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>總資產變化</span>
                  <span className="font-mono" style={{ color: '#ff4d6d' }}>
                    -{formatBigNumber(18000)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 11. 單局詳細戰報（可展開列表） */}
        <section
          className="cyber-card p-4 md:p-6"
          style={{
            borderColor: 'rgba(59, 130, 246, 0.3)',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.1)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} style={{ color: '#3b82f6' }} />
            <h2 className="font-cyber text-lg tracking-wider" style={{ color: '#3b82f6' }}>
              單局詳細戰報
            </h2>
            <span className="text-xs ml-auto" style={{ color: 'var(--text-secondary)' }}>
              最近 {Math.min(5, matches.length)} 場
            </span>
          </div>
          <div className="space-y-2">
            {matches.length === 0 ? (
              <div className="py-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                尚無對戰數據
              </div>
            ) : (
              matches.slice(0, 5).map((match) => {
                const isExpanded = expandedMatches.has(match.id);
                return (
                  <div
                    key={match.id}
                    className="rounded overflow-hidden"
                    style={{ border: '1px solid rgba(59,130,246,0.2)' }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleMatch(match.id)}
                      className="w-full p-3 flex items-center gap-3 text-left transition-colors hover:bg-white/5"
                    >
                      <div
                        className="w-1 h-10 rounded-full"
                        style={{ backgroundColor: '#3b82f6' }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="inline-block px-2 py-0.5 text-xs font-cyber tracking-wider rounded-sm"
                            style={{
                              color:
                                match.result === 'win'
                                  ? '#4ade80'
                                  : match.result === 'loss'
                                    ? '#ff4d6d'
                                    : '#ffcc00',
                              backgroundColor:
                                match.result === 'win'
                                  ? 'rgba(74,222,128,0.1)'
                                  : match.result === 'loss'
                                    ? 'rgba(255,77,109,0.1)'
                                    : 'rgba(255,204,0,0.1)',
                              border: `1px solid ${
                                match.result === 'win'
                                  ? 'rgba(74,222,128,0.3)'
                                  : match.result === 'loss'
                                    ? 'rgba(255,77,109,0.3)'
                                    : 'rgba(255,204,0,0.3)'
                              }`,
                            }}
                          >
                            {match.result === 'win' ? '勝' : match.result === 'loss' ? '負' : '平'}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
                            {match.profession || match.opponent}
                          </span>
                          {match.rank !== undefined && (
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              · 第{match.rank}名
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          <span>{formatDate(match.date)}</span>
                          <span>·</span>
                          <span>{formatDuration(match.duration)}</span>
                          <span>·</span>
                          <span>地產 {match.propertiesOwned ?? 0} 處</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm" style={{ color: 'var(--cyan)' }}>
                          {formatBigNumber(match.finalAssets)}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          結算資產
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={18} style={{ color: 'var(--text-secondary)' }} />
                      ) : (
                        <ChevronDown size={18} style={{ color: 'var(--text-secondary)' }} />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-0 border-t" style={{ borderColor: 'rgba(59,130,246,0.15)', background: 'hsl(240, 20%, 8%)' }}>
                        <div className="py-2 text-xs font-cyber tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                          本場概覽
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 rounded" style={{ background: 'rgba(0,255,255,0.06)' }}>
                            <div style={{ color: 'var(--text-secondary)' }}>最高資產</div>
                            <div className="font-mono" style={{ color: 'var(--cyan)' }}>
                              {formatBigNumber(match.highestAssets ?? match.finalAssets)}
                            </div>
                          </div>
                          <div className="p-2 rounded" style={{ background: 'rgba(74,222,128,0.06)' }}>
                            <div style={{ color: 'var(--text-secondary)' }}>總收入</div>
                            <div className="font-mono" style={{ color: '#4ade80' }}>
                              {formatBigNumber(match.totalIncome ?? 0)}
                            </div>
                          </div>
                          <div className="p-2 rounded" style={{ background: 'rgba(255,77,109,0.06)' }}>
                            <div style={{ color: 'var(--text-secondary)' }}>總支出</div>
                            <div className="font-mono" style={{ color: '#ff4d6d' }}>
                              {formatBigNumber(match.totalExpense ?? 0)}
                            </div>
                          </div>
                          <div className="p-2 rounded" style={{ background: 'rgba(255,204,0,0.06)' }}>
                            <div style={{ color: 'var(--text-secondary)' }}>過路費收入</div>
                            <div className="font-mono" style={{ color: '#ffcc00' }}>
                              {formatBigNumber(match.tollIncome ?? 0)}
                            </div>
                          </div>
                          <div className="p-2 rounded" style={{ background: 'rgba(168,85,247,0.06)' }}>
                            <div style={{ color: 'var(--text-secondary)' }}>地產投資</div>
                            <div className="font-mono" style={{ color: '#a855f7' }}>
                              {formatBigNumber(match.propertyInvestment ?? 0)}
                            </div>
                          </div>
                          <div className="p-2 rounded" style={{ background: 'rgba(255,140,66,0.06)' }}>
                            <div style={{ color: 'var(--text-secondary)' }}>命運卡抽取</div>
                            <div className="font-mono" style={{ color: '#ff8c42' }}>
                              {match.fateCardsDrawn ?? 0} 次
                            </div>
                          </div>
                        </div>
                        {match.mostDrawnCard && (
                          <div className="mt-2 pt-2 border-t text-xs" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                            <span style={{ color: 'var(--text-muted)' }}>抽中最多：</span>
                            <span style={{ color: 'var(--text-primary)' }}>{match.mostDrawnCard}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ===== 保留原有統計板塊 ===== */}

        {/* 原有：資產構成餅圖 + 財務分析 */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          <section
            className="cyber-card p-4 md:p-6"
            style={{
              borderColor: 'rgba(255, 204, 0, 0.3)',
              boxShadow: '0 0 15px rgba(255, 204, 0, 0.1)',
            }}
          >
            <SectionHeader icon={PieChart} title="資產構成分布" color="#ffcc00" />
            <div className="flex items-center justify-center py-2">
              <SvgDonutChart
                data={financeStats.assetDistribution.map((item) => ({
                  label: item.name,
                  value: item.value,
                  color: item.color,
                }))}
                centerLabel="總資產"
                centerValue={formatBigNumber(
                  financeStats.assetDistribution.reduce((sum, item) => sum + item.value, 0),
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {financeStats.assetDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: item.color, boxShadow: `0 0 4px ${item.color}` }}
                  />
                  <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                  <span className="ml-auto font-mono" style={{ color: item.color }}>
                    {formatBigNumber(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section
            className="cyber-card p-4 md:p-6"
            style={{
              borderColor: 'rgba(59, 130, 246, 0.3)',
              boxShadow: '0 0 15px rgba(59, 130, 246, 0.1)',
            }}
          >
            <SectionHeader icon={Wallet} title="財務分析" color="#3b82f6" />
            <div className="space-y-3">
              <FinanceRow label="總收入" value={financeStats.totalIncome} icon={TrendingUp} color="#4ade80" />
              <FinanceRow label="總支出" value={financeStats.totalExpense} icon={TrendingDown} color="#ff4d6d" />
              <FinanceRow label="過路費收入" value={financeStats.tollIncome} icon={Coins} color="#ffcc00" />
              <FinanceRow label="地產投資" value={financeStats.propertyInvestment} icon={Building2} color="#a855f7" />
              <div className="pt-3 border-t" style={{ borderColor: 'rgba(59, 130, 246, 0.2)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Landmark size={14} style={{ color: '#3b82f6' }} />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      地產投資回報率
                    </span>
                  </div>
                  <span
                    className="font-cyber text-lg tracking-wider"
                    style={{
                      color: financeStats.propertyROI >= 50 ? '#4ade80' : '#ffcc00',
                      textShadow: `0 0 8px ${financeStats.propertyROI >= 50 ? 'rgba(74,222,128,0.5)' : 'rgba(255,204,0,0.5)'}`,
                    }}
                  >
                    {financeStats.propertyROI}%
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* 原有：地產統計 + 卡牌統計 */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          <section
            className="cyber-card p-4 md:p-6"
            style={{
              borderColor: 'rgba(74, 222, 128, 0.3)',
              boxShadow: '0 0 15px rgba(74, 222, 128, 0.1)',
            }}
          >
            <SectionHeader icon={Home} title="地產建築統計" color="#4ade80" />
            <div className="grid grid-cols-3 gap-3 mb-4">
              <MiniStat label="地產總數" value={propertyStats.totalProperties} color="#4ade80" />
              <MiniStat label="房屋總數" value={propertyStats.totalHouses} color="#00ffff" />
              <MiniStat label="酒店總數" value={propertyStats.totalHotels} color="#ffcc00" />
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>平均每局地產</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {matches.length > 0 ? (propertyStats.totalProperties / matches.length).toFixed(1) : 0} 處
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>平均每局房屋</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {matches.length > 0 ? (propertyStats.totalHouses / matches.length).toFixed(1) : 0} 棟
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>酒店 / 地產比</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {propertyStats.totalProperties > 0
                    ? ((propertyStats.totalHotels / propertyStats.totalProperties) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </section>

          <section
            className="cyber-card p-4 md:p-6"
            style={{
              borderColor: 'rgba(255, 140, 66, 0.3)',
              boxShadow: '0 0 15px rgba(255, 140, 66, 0.1)',
            }}
          >
            <SectionHeader icon={Sparkles} title="卡牌統計" color="#ff8c42" />
            <div className="grid grid-cols-2 gap-3 mb-4">
              <MiniStat label="命運卡" value={cardStats.fateCards} color="#a855f7" />
              <MiniStat label="機會卡" value={cardStats.chanceCards} color="#00ffff" />
            </div>
            <div
              className="p-3 rounded"
              style={{
                background: 'rgba(255, 140, 66, 0.08)',
                border: '1px solid rgba(255, 140, 66, 0.25)',
              }}
            >
              <div className="text-xs mb-1 font-cyber tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                最幸運卡牌
              </div>
              <div
                className="font-cyber text-lg tracking-wider"
                style={{
                  color: '#ff8c42',
                  textShadow: '0 0 10px rgba(255, 140, 66, 0.5)',
                }}
              >
                {cardStats.mostLuckyCard}
              </div>
            </div>
          </section>
        </div>

        {/* 原有：模式統計表格 */}
        <section
          className="cyber-card p-4 md:p-6"
          style={{
            borderColor: 'rgba(168, 85, 247, 0.3)',
            boxShadow: '0 0 15px rgba(168, 85, 247, 0.1)',
          }}
        >
          <SectionHeader icon={Layers} title="模式詳細統計" color="var(--purple)" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(168, 85, 247, 0.2)' }}>
                  <th className="text-left py-2 px-2 font-cyber text-xs tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    模式
                  </th>
                  <th className="text-right py-2 px-2 font-cyber text-xs tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    對局數
                  </th>
                  <th className="text-right py-2 px-2 font-cyber text-xs tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    勝率
                  </th>
                  <th className="text-right py-2 px-2 font-cyber text-xs tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    平均時長
                  </th>
                </tr>
              </thead>
              <tbody>
                {modeStats.map((m) => (
                  <tr
                    key={m.mode}
                    className="border-b transition-colors hover:bg-white/5"
                    style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}
                  >
                    <td className="py-2.5 px-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                      {m.label}
                    </td>
                    <td className="py-2.5 px-2 text-sm text-right font-mono" style={{ color: 'var(--cyan)' }}>
                      {m.total}
                    </td>
                    <td
                      className="py-2.5 px-2 text-sm text-right font-mono"
                      style={{ color: m.winRate >= 50 ? 'var(--green)' : 'var(--red)' }}
                    >
                      {m.winRate.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-2 text-sm text-right" style={{ color: 'var(--text-secondary)' }}>
                      {formatDuration(m.avgDuration)}
                    </td>
                  </tr>
                ))}
                {modeStats.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                      尚無模式數據
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 原有：對局記錄 */}
        <section
          className="cyber-card p-4 md:p-6"
          style={{
            borderColor: 'rgba(168, 85, 247, 0.3)',
            boxShadow: '0 0 15px rgba(168, 85, 247, 0.1)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} style={{ color: 'var(--purple)' }} />
            <h2 className="font-cyber text-lg tracking-wider" style={{ color: 'var(--purple)' }}>
              對局記錄
            </h2>
            <span className="text-xs ml-auto" style={{ color: 'var(--text-secondary)' }}>
              共 {matches.length} 場
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(168, 85, 247, 0.2)' }}>
                  <th className="text-left py-2 px-2 font-cyber text-xs tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    日期
                  </th>
                  <th className="text-left py-2 px-2 font-cyber text-xs tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    模式
                  </th>
                  <th className="text-left py-2 px-2 font-cyber text-xs tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    對手
                  </th>
                  <th className="text-left py-2 px-2 font-cyber text-xs tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    結果
                  </th>
                  <th className="text-left py-2 px-2 font-cyber text-xs tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    時長
                  </th>
                  <th className="text-right py-2 px-2 font-cyber text-xs tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    最終資產
                  </th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => (
                  <tr
                    key={match.id}
                    className="border-b transition-colors hover:bg-white/5"
                    style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}
                  >
                    <td className="py-2.5 px-2 text-xs md:text-sm" style={{ color: 'var(--text-primary)' }}>
                      {formatDate(match.date)}
                    </td>
                    <td className="py-2.5 px-2 text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {(MODE_LABELS as Record<string, string>)[match.mode] || match.mode}
                    </td>
                    <td className="py-2.5 px-2 text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <div className="flex items-center gap-1">
                        <Users size={12} style={{ color: 'var(--text-muted)' }} />
                        {match.opponent}
                      </div>
                    </td>
                    <td className="py-2.5 px-2">
                      <span
                        className="inline-block px-2 py-0.5 text-xs font-cyber tracking-wider rounded-sm"
                        style={{
                          color:
                            match.result === 'win'
                              ? 'var(--green)'
                              : match.result === 'loss'
                                ? 'var(--red)'
                                : 'var(--yellow)',
                          backgroundColor:
                            match.result === 'win'
                              ? 'rgba(74, 222, 128, 0.1)'
                              : match.result === 'loss'
                                ? 'rgba(255, 77, 77, 0.1)'
                                : 'rgba(250, 204, 21, 0.1)',
                          border: `1px solid ${
                            match.result === 'win'
                              ? 'rgba(74, 222, 128, 0.3)'
                              : match.result === 'loss'
                                ? 'rgba(255, 77, 77, 0.3)'
                                : 'rgba(250, 204, 21, 0.3)'
                          }`,
                          boxShadow:
                            match.result === 'win'
                              ? '0 0 8px rgba(74, 222, 128, 0.2)'
                              : match.result === 'loss'
                                ? '0 0 8px rgba(255, 77, 77, 0.2)'
                                : '0 0 8px rgba(250, 204, 21, 0.2)',
                        }}
                      >
                        {match.result === 'win' ? '勝' : match.result === 'loss' ? '負' : '平'}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <div className="flex items-center gap-1">
                        <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                        {formatDuration(match.duration)}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-xs md:text-sm text-right font-mono" style={{ color: 'var(--cyan)' }}>
                      {match.finalAssets.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

// ========== SVG Chart Components ==========

interface SvgLineChartProps {
  data: { x: number; y: number }[];
  color: string;
  yMax?: number;
  yMin?: number;
  yUnit?: string;
  xLabel?: string;
  showPeakMarker?: boolean;
  showValleyMarker?: boolean;
  valueFormatter?: (v: number) => string;
}

const SvgLineChart = ({
  data,
  color,
  yMax,
  yMin = 0,
  yUnit = '%',
  xLabel = '',
  showPeakMarker = false,
  showValleyMarker = false,
  valueFormatter,
}: SvgLineChartProps) => {
  const width = 600;
  const height = 240;
  const padding = { top: 20, right: 20, bottom: 30, left: 45 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'var(--text-secondary)' }}>
        尚無數據
      </div>
    );
  }

  const actualYMax = yMax ?? Math.max(...data.map((d) => d.y)) * 1.1;
  const actualYMin = yMin;
  const xStep = data.length > 1 ? chartW / (data.length - 1) : chartW;

  const points = data.map((d, i) => {
    const px = padding.left + i * xStep;
    const py =
      padding.top + chartH - ((d.y - actualYMin) / (actualYMax - actualYMin)) * chartH;
    return { x: px, y: py, data: d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  const gridLines = 4;
  const gridValues = Array.from({ length: gridLines + 1 }, (_, i) => {
    const ratio = i / gridLines;
    return actualYMin + (actualYMax - actualYMin) * ratio;
  });

  // Find peak and valley indices
  let peakIdx = 0;
  let valleyIdx = 0;
  for (let i = 1; i < data.length; i += 1) {
    if (data[i].y > data[peakIdx].y) peakIdx = i;
    if (data[i].y < data[valleyIdx].y) valleyIdx = i;
  }

  const gradId = `line-grad-${color.replace('#', '')}`;
  const glowId = `line-glow-${color.replace('#', '')}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: '100%', height: 'auto' }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grid lines */}
      {gridValues.map((val, i) => {
        const y = padding.top + chartH - ((val - actualYMin) / (actualYMax - actualYMin)) * chartH;
        return (
          <g key={i}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="3 3"
            />
            <text
              x={padding.left - 6}
              y={y + 3}
              textAnchor="end"
              fontSize="10"
              fill="rgba(200,200,220,0.5)"
              fontFamily="monospace"
            >
              {valueFormatter ? valueFormatter(val) : `${Math.round(val)}${yUnit}`}
            </text>
          </g>
        );
      })}

      {/* X axis label */}
      {xLabel && (
        <text
          x={width / 2}
          y={height - 8}
          textAnchor="middle"
          fontSize="10"
          fill="rgba(200,200,220,0.5)"
          fontFamily="var(--font-cyber)"
        >
          {xLabel}
        </text>
      )}

      {/* Area fill */}
      <path d={areaPath} fill={`url(#${gradId})`} />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2"
        filter={`url(#${glowId})`}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {points.map((p, i) => {
        const isPeak = showPeakMarker && i === peakIdx;
        const isValley = showValleyMarker && i === valleyIdx;
        if (isPeak) {
          // Lightning bolt for peak
          const lx = p.x;
          const ly = p.y - 18;
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="5" fill={color} opacity="0.3" />
              <circle cx={p.x} cy={p.y} r="3" fill={color} />
              <polygon
                points={`${lx},${ly} ${lx - 5},${ly + 7} ${lx - 1},${ly + 7} ${lx - 4},${ly + 16} ${lx + 5},${ly + 4} ${lx + 1},${ly + 4}`}
                fill="#ffcc00"
                filter={`url(#${glowId})`}
              />
              <text
                x={p.x}
                y={ly - 2}
                textAnchor="middle"
                fontSize="9"
                fill="#ffcc00"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {valueFormatter ? valueFormatter(p.data.y) : `${p.data.y.toFixed(0)}${yUnit}`}
              </text>
            </g>
          );
        }
        if (isValley) {
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="5" fill="#ff4d6d" opacity="0.3" />
              <circle cx={p.x} cy={p.y} r="3" fill="#ff4d6d" />
              <polygon
                points={`${p.x},${p.y + 16} ${p.x - 5},${p.y + 9} ${p.x - 1},${p.y + 9} ${p.x - 4},${p.y} ${p.x + 5},${p.y + 12} ${p.x + 1},${p.y + 12}`}
                fill="#ff4d6d"
              />
              <text
                x={p.x}
                y={p.y + 26}
                textAnchor="middle"
                fontSize="9"
                fill="#ff4d6d"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {valueFormatter ? valueFormatter(p.data.y) : `${p.data.y.toFixed(0)}${yUnit}`}
              </text>
            </g>
          );
        }
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="2.5"
            fill={color}
            opacity="0.9"
          />
        );
      })}

      {/* X axis ticks (first, mid, last) */}
      {data.length > 3 && [0, Math.floor(data.length / 2), data.length - 1].map((idx) => (
        <text
          key={idx}
          x={points[idx].x}
          y={height - padding.bottom + 14}
          textAnchor="middle"
          fontSize="9"
          fill="rgba(200,200,220,0.4)"
          fontFamily="monospace"
        >
          {data[idx].x}
        </text>
      ))}
    </svg>
  );
};

interface SvgBarChartProps {
  data: { label: string; value: number; subLabel?: string }[];
  colors: string[];
}

const SvgBarChart = ({ data, colors }: SvgBarChartProps) => {
  const width = 500;
  const height = 260;
  const padding = { top: 25, right: 15, bottom: 45, left: 35 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'var(--text-secondary)' }}>
        尚無數據
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.value), 10);
  const barGap = 12;
  const barWidth = (chartW - barGap * (data.length - 1)) / data.length;
  const gridLines = 4;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }} preserveAspectRatio="xMidYMid meet">
      <defs>
        {colors.map((c, i) => (
          <linearGradient key={i} id={`bar-grad-${i}-${c.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c} stopOpacity="1" />
            <stop offset="100%" stopColor={c} stopOpacity="0.5" />
          </linearGradient>
        ))}
        <filter id="bar-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grid lines */}
      {Array.from({ length: gridLines + 1 }, (_, i) => {
        const ratio = i / gridLines;
        const y = padding.top + chartH - ratio * chartH;
        const val = maxVal * ratio;
        return (
          <g key={i}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="3 3"
            />
            <text
              x={padding.left - 6}
              y={y + 3}
              textAnchor="end"
              fontSize="10"
              fill="rgba(200,200,220,0.5)"
              fontFamily="monospace"
            >
              {Math.round(val)}%
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((item, i) => {
        const x = padding.left + i * (barWidth + barGap);
        const barH = (item.value / maxVal) * chartH;
        const y = padding.top + chartH - barH;
        const color = colors[i % colors.length];

        return (
          <g key={item.label}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              fill={`url(#bar-grad-${i}-${color.replace('#', '')})`}
              rx="3"
              filter="url(#bar-glow)"
            />
            {/* Value on top */}
            <text
              x={x + barWidth / 2}
              y={y - 6}
              textAnchor="middle"
              fontSize="11"
              fill={color}
              fontFamily="monospace"
              fontWeight="bold"
              style={{ textShadow: `0 0 6px ${color}` }}
            >
              {item.value.toFixed(1)}%
            </text>
            {/* Label below */}
            <text
              x={x + barWidth / 2}
              y={height - padding.bottom + 14}
              textAnchor="middle"
              fontSize="11"
              fill="rgba(200,200,220,0.8)"
              fontFamily="var(--font-cyber)"
            >
              {item.label}
            </text>
            {/* Sub label (total) */}
            {item.subLabel && (
              <text
                x={x + barWidth / 2}
                y={height - padding.bottom + 28}
                textAnchor="middle"
                fontSize="9"
                fill="rgba(200,200,220,0.4)"
                fontFamily="monospace"
              >
                {item.subLabel}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

interface SvgDonutChartProps {
  data: { label: string; value: number; color: string }[];
  centerLabel?: string;
  centerValue?: string;
}

const SvgDonutChart = ({ data, centerLabel, centerValue }: SvgDonutChartProps) => {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 90;
  const innerR = 60;
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'var(--text-secondary)' }}>
        尚無數據
      </div>
    );
  }

  let currentAngle = -Math.PI / 2; // Start from top

  const segments = data.map((d) => {
    const angle = (d.value / total) * Math.PI * 2;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const x1 = cx + outerR * Math.cos(startAngle);
    const y1 = cy + outerR * Math.sin(startAngle);
    const x2 = cx + outerR * Math.cos(endAngle);
    const y2 = cy + outerR * Math.sin(endAngle);
    const x3 = cx + innerR * Math.cos(endAngle);
    const y3 = cy + innerR * Math.sin(endAngle);
    const x4 = cx + innerR * Math.cos(startAngle);
    const y4 = cy + innerR * Math.sin(startAngle);

    const largeArc = angle > Math.PI ? 1 : 0;

    const pathD = [
      `M ${x1} ${y1}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4}`,
      'Z',
    ].join(' ');

    return { ...d, pathD };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', maxWidth: 260, height: 'auto' }} preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="donut-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {segments.map((seg, i) => (
        <path key={i} d={seg.pathD} fill={seg.color} opacity="0.9" filter="url(#donut-glow)" />
      ))}
      {/* Center text */}
      {centerValue && (
        <>
          <text
            x={cx}
            y={cy - 2}
            textAnchor="middle"
            fontSize="18"
            fill="var(--text-primary)"
            fontFamily="var(--font-cyber)"
            fontWeight="bold"
            style={{ textShadow: '0 0 8px rgba(0,255,255,0.5)' }}
          >
            {centerValue}
          </text>
          {centerLabel && (
            <text
              x={cx}
              y={cy + 14}
              textAnchor="middle"
              fontSize="10"
              fill="rgba(200,200,220,0.5)"
              fontFamily="var(--font-cyber)"
              letterSpacing="1"
            >
              {centerLabel}
            </text>
          )}
        </>
      )}
    </svg>
  );
};

interface SvgPieChartProps {
  data: { label: string; value: number; color: string }[];
}

const SvgPieChart = ({ data }: SvgPieChartProps) => {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 85;
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'var(--text-secondary)' }}>
        尚無數據
      </div>
    );
  }

  let currentAngle = -Math.PI / 2;

  const segments = data.map((d) => {
    const angle = (d.value / total) * Math.PI * 2;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);

    const largeArc = angle > Math.PI ? 1 : 0;

    const pathD = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return { ...d, pathD };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', maxWidth: 260, height: 'auto' }} preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="pie-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {segments.map((seg, i) => (
        <path key={i} d={seg.pathD} fill={seg.color} opacity="0.9" stroke="hsl(240,20%,8%)" strokeWidth="2" filter="url(#pie-glow)" />
      ))}
    </svg>
  );
};

// ========== Utility Components ==========

interface SectionHeaderProps {
  icon: typeof TrendingUp;
  title: string;
  color: string;
  noMargin?: boolean;
}

const SectionHeader = ({ icon: Icon, title, color, noMargin = false }: SectionHeaderProps) => (
  <div className={`flex items-center gap-2 ${noMargin ? '' : 'mb-4'}`}>
    <span
      className="w-1 h-5 rounded-full"
      style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
    />
    <Icon size={18} style={{ color }} />
    <h2 className="font-cyber text-lg tracking-wider" style={{ color }}>
      {title}
    </h2>
  </div>
);

interface StatCardProps {
  label: string;
  value: string | number;
  icon: typeof TrendingUp;
  color: string;
}

const StatCard = ({ label, value, icon: Icon, color }: StatCardProps) => (
  <div
    className="cyber-card p-3 md:p-4 text-center"
    style={{
      borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
      boxShadow: `0 0 15px color-mix(in srgb, ${color} 15%, transparent)`,
    }}
  >
    <Icon className="w-5 h-5 mx-auto mb-1.5" style={{ color }} />
    <div
      className="font-cyber text-xl md:text-2xl font-bold tracking-wider"
      style={{ color, textShadow: `0 0 8px color-mix(in srgb, ${color} 50%, transparent)` }}
    >
      {value}
    </div>
    <div className="text-xs text-[var(--text-muted)] mt-1 font-cyber tracking-wider">
      {label}
    </div>
  </div>
);

interface MiniStatProps {
  label: string;
  value: string | number;
  color: string;
  fullWidth?: boolean;
}

const MiniStat = ({ label, value, color, fullWidth }: MiniStatProps) => (
  <div
    className="p-3 rounded text-center"
    style={{
      background: 'rgba(255, 255, 255, 0.03)',
      border: `1px solid color-mix(in srgb, ${color} 20%, transparent)`,
      width: fullWidth ? '100%' : undefined,
    }}
  >
    <div
      className="font-cyber text-lg font-bold tracking-wider"
      style={{ color, textShadow: `0 0 6px color-mix(in srgb, ${color} 40%, transparent)` }}
    >
      {value}
    </div>
    <div className="text-xs mt-1 font-cyber tracking-wider" style={{ color: 'var(--text-secondary)' }}>
      {label}
    </div>
  </div>
);

interface FinanceRowProps {
  label: string;
  value: number;
  icon: typeof TrendingUp;
  color: string;
}

const FinanceRow = ({ label, value, icon: Icon, color }: FinanceRowProps) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Icon size={14} style={{ color }} />
      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </span>
    </div>
    <span className="font-mono text-sm" style={{ color }}>
      {formatBigNumber(value)}
    </span>
  </div>
);

export default StatsDashboardPage;
