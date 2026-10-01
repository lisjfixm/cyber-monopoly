import { useState, useCallback } from 'react';
import { ArrowLeft, Sparkles, ThumbsUp, Download, Star, Coins, Skull, Target, Clock } from 'lucide-react';
import type { CustomScenario, VictoryCondition } from '@client/src/utils/customScenarios';
import {
  getReviews,
  submitRating,
  addReview,
  likeReview,
  getAverageRating,
  getTotalReviews,
  type ReviewItem,
} from '@client/src/utils/reviewStorage';
import RatingReviewSection from '@client/src/components/RatingReviewSection';

const DIFFICULTY_LABELS: Record<CustomScenario['aiDifficulty'], string> = {
  easy: '簡單',
  normal: '普通',
  hard: '困難',
  extreme: '極限',
};

function victoryDescription(condition: VictoryCondition, param: number): string {
  switch (condition) {
    case 'reach_money': return `資產達到 $${param.toLocaleString()}`;
    case 'own_properties': return `擁有 ${param} 個地產`;
    case 'eliminate_all': return '淘汰所有對手';
    default: return '未知';
  }
}

interface ScenarioDetailViewProps {
  scenario: CustomScenario;
  onBack: () => void;
  onInstall: (id: string) => void;
  onLike: (id: string) => void;
  showToast: (msg: string) => void;
}

const ScenarioDetailView = ({ scenario, onBack, onInstall, onLike, showToast }: ScenarioDetailViewProps) => {
  const [reviews, setReviews] = useState<ReviewItem[]>(() => getReviews('scenario', scenario.id).reviews);
  const [avgRating, setAvgRating] = useState<number>(() => getAverageRating('scenario', scenario.id));
  const [totalReviews, setTotalReviews] = useState<number>(() => getTotalReviews('scenario', scenario.id));

  const loadReviews = useCallback(() => {
    const data = getReviews('scenario', scenario.id);
    setReviews(data.reviews);
    setAvgRating(getAverageRating('scenario', scenario.id));
    setTotalReviews(getTotalReviews('scenario', scenario.id));
  }, [scenario.id]);

  const handleRate = useCallback((score: number) => {
    submitRating('scenario', scenario.id, 'local_user', score);
    loadReviews();
    showToast('評分成功！');
  }, [scenario.id, loadReviews, showToast]);

  const handleAddReview = useCallback((text: string) => {
    const newReview: ReviewItem = {
      id: `review_${Date.now()}`,
      author: '我',
      authorScore: 200,
      content: text,
      score: 5,
      likes: 0,
      createdAt: new Date().toISOString(),
    };
    addReview('scenario', scenario.id, newReview);
    loadReviews();
  }, [scenario.id, loadReviews]);

  const handleLikeReview = useCallback((reviewId: string) => {
    likeReview('scenario', scenario.id, reviewId);
    loadReviews();
  }, [scenario.id, loadReviews]);

  return (
    <div className="min-h-screen w-full px-4 py-6 scanlines relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full opacity-10 blur-[100px]" style={{ background: 'var(--cyan)' }} />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full opacity-10 blur-[100px]" style={{ background: 'var(--pink)' }} />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto">
        <button type="button" onClick={onBack} className="cyber-btn px-3 py-2 text-sm flex items-center gap-1 mb-6">
          <ArrowLeft size={16} />
          <span className="font-cyber tracking-wider">返回列表</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
          <div className="space-y-4">
            <div className="cyber-card p-5" style={{
              borderColor: scenario.isFeatured ? 'var(--yellow, #facc15)' : 'rgba(0, 255, 255, 0.25)',
              boxShadow: scenario.isFeatured ? '0 0 20px rgba(250, 204, 21, 0.2)' : 'none',
            }}>
              {scenario.isFeatured && (
                <div className="flex items-center gap-1 mb-3 text-sm font-cyber tracking-wider" style={{ color: 'var(--yellow)' }}>
                  <Sparkles size={16} /> 精選劇本
                </div>
              )}
              <h2 className="font-cyber text-2xl text-neon-cyan tracking-wider mb-2">
                {scenario.name}
              </h2>
              <div className="text-sm text-[var(--text-secondary)] mb-4">
                by {scenario.author}
              </div>
              <p className="text-sm text-[var(--text-primary)] mb-4">
                {scenario.description}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Coins size={14} /> 初始資金
                  </span>
                  <span className="font-cyber text-neon-cyan">${scenario.startingMoney.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Skull size={14} /> AI 對手
                  </span>
                  <span className="font-cyber">{scenario.aiCount} 個 · {DIFFICULTY_LABELS[scenario.aiDifficulty] ?? '未知'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Target size={14} /> 勝利條件
                  </span>
                  <span className="font-cyber" style={{ color: 'var(--green)' }}>
                    {victoryDescription(scenario.victoryCondition, scenario.victoryParam)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Clock size={14} /> 回合上限
                  </span>
                  <span className="font-cyber">
                    {scenario.maxTurns > 0 ? `${scenario.maxTurns} 回合` : '無限制'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-around mt-4 pt-4 border-t border-[rgba(255_255_255_0.1)] text-sm">
                <div className="flex items-center gap-1" style={{ color: 'var(--pink)' }}>
                  <ThumbsUp size={14} /> {scenario.likes}
                </div>
                <div className="flex items-center gap-1" style={{ color: 'var(--cyan)' }}>
                  <Download size={14} /> {scenario.downloads}
                </div>
                <div className="flex items-center gap-1" style={{ color: 'var(--yellow)' }}>
                  <Star size={14} fill="currentColor" /> {(scenario.rating ?? 0).toFixed(1)}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => onInstall(scenario.id)}
                className="cyber-btn flex-1 py-3 font-cyber tracking-wider"
                style={{ borderColor: 'var(--green)', color: 'var(--green)', backgroundColor: 'rgba(0, 255, 128, 0.08)' }}>
                一鍵安裝
              </button>
              <button type="button" onClick={() => onLike(scenario.id)}
                className="cyber-btn flex-1 py-3 font-cyber tracking-wider"
                style={{ borderColor: 'var(--pink)', color: 'var(--pink)', backgroundColor: 'rgba(255, 107, 157, 0.08)' }}>
                點讚
              </button>
            </div>
          </div>
          <div>
            <RatingReviewSection
              contentType="scenario"
              contentId={scenario.id}
              averageRating={avgRating || scenario.rating}
              ratingCount={totalReviews || scenario.ratings}
              reviews={reviews}
              onRate={handleRate}
              onAddReview={handleAddReview}
              onLikeReview={handleLikeReview}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioDetailView;
