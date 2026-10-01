import { useState, useCallback } from 'react';
import { ArrowLeft, ThumbsUp, Download, Star } from 'lucide-react';
import type { CustomCard } from '@client/src/utils/customCards';
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

function describeEffect(effect: CustomCard['effect']): string {
  switch (effect.type) {
    case 'money': return effect.amount >= 0 ? `獲得 $${effect.amount}` : `損失 $${Math.abs(effect.amount)}`;
    case 'forward': return `前進 ${effect.steps} 步`;
    case 'backward': return `後退 ${effect.steps} 步`;
    case 'teleport_start': return '傳送到起點';
    case 'go_to_detention': return '進入禁閉區';
    case 'get_out_of_jail': return '免費越獄';
    case 'random_teleport': return '隨機傳送';
    case 'collect_from_all': return `向所有玩家收取 $${effect.amount}`;
    case 'pay_to_all': return `向所有玩家支付 $${effect.amount}`;
    case 'steal_money': return `偷取 $${effect.amount}`;
    case 'chain_draw': return `連鎖抽卡 ${effect.count} 次`;
    default: return '未知效果';
  }
}

interface CardDetailViewProps {
  card: CustomCard;
  onBack: () => void;
  onInstall: (id: string) => void;
  onLike: (id: string) => void;
  showToast: (msg: string) => void;
}

const CardDetailView = ({ card, onBack, onInstall, onLike, showToast }: CardDetailViewProps) => {
  const [reviews, setReviews] = useState<ReviewItem[]>(() => getReviews('card', card.id).reviews);
  const [avgRating, setAvgRating] = useState<number>(() => getAverageRating('card', card.id));
  const [totalReviews, setTotalReviews] = useState<number>(() => getTotalReviews('card', card.id));

  const loadReviews = useCallback(() => {
    const data = getReviews('card', card.id);
    setReviews(data.reviews);
    setAvgRating(getAverageRating('card', card.id));
    setTotalReviews(getTotalReviews('card', card.id));
  }, [card.id]);

  const handleRate = useCallback((score: number) => {
    submitRating('card', card.id, 'local_user', score);
    loadReviews();
    showToast('評分成功！');
  }, [card.id, loadReviews, showToast]);

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
    addReview('card', card.id, newReview);
    loadReviews();
  }, [card.id, loadReviews]);

  const handleLikeReview = useCallback((reviewId: string) => {
    likeReview('card', card.id, reviewId);
    loadReviews();
  }, [card.id, loadReviews]);

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
            <div className="cyber-card p-6 text-center" style={{
              borderColor: card.cardType === 'fate' ? 'var(--purple)' : 'var(--cyan)',
              background: `linear-gradient(135deg, ${card.cardType === 'fate' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(0, 255, 255, 0.08)'}, transparent)`,
            }}>
              <div className="text-xs font-cyber tracking-wider mb-2" style={{ color: card.cardType === 'fate' ? 'var(--purple)' : 'var(--cyan)' }}>
                {card.cardType === 'fate' ? '命運卡' : '機會卡'}
              </div>
              <h2 className="font-cyber text-2xl tracking-wider mb-3" style={{ color: 'var(--text-primary)' }}>
                {card.name}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                {card.description}
              </p>
              <div className="py-3 px-4 rounded-sm font-cyber text-lg" style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: card.cardType === 'fate' ? 'var(--purple)' : 'var(--cyan)',
              }}>
                {describeEffect(card.effect)}
              </div>
              <div className="mt-4 text-xs text-[var(--text-secondary)]">
                by {card.author}
              </div>
              <div className="flex items-center justify-around mt-4 text-sm">
                <div className="flex items-center gap-1" style={{ color: 'var(--pink)' }}>
                  <ThumbsUp size={14} /> {card.likes}
                </div>
                <div className="flex items-center gap-1" style={{ color: 'var(--cyan)' }}>
                  <Download size={14} /> {card.downloads}
                </div>
                <div className="flex items-center gap-1" style={{ color: 'var(--yellow)' }}>
                  <Star size={14} fill="currentColor" /> {(card.rating ?? 0).toFixed(1)}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => onInstall(card.id)}
                className="cyber-btn flex-1 py-3 font-cyber tracking-wider"
                style={{ borderColor: 'var(--green)', color: 'var(--green)', backgroundColor: 'rgba(0, 255, 128, 0.08)' }}>
                一鍵安裝
              </button>
              <button type="button" onClick={() => onLike(card.id)}
                className="cyber-btn flex-1 py-3 font-cyber tracking-wider"
                style={{ borderColor: 'var(--pink)', color: 'var(--pink)', backgroundColor: 'rgba(255, 107, 157, 0.08)' }}>
                點讚
              </button>
            </div>
          </div>
          <div>
            <RatingReviewSection
              contentType="card"
              contentId={card.id}
              averageRating={avgRating || card.rating}
              ratingCount={totalReviews || card.ratings}
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

export default CardDetailView;
