import { useState } from 'react';
import { Star, ThumbsUp, Send } from 'lucide-react';
import type { ReviewItem } from '@client/src/utils/reviewStorage';

interface RatingReviewSectionProps {
  contentType: 'map' | 'card' | 'mod' | 'scenario';
  contentId: string;
  averageRating: number;
  ratingCount: number;
  reviews: ReviewItem[];
  onRate: (score: number) => void;
  onAddReview: (text: string) => void;
  onLikeReview: (reviewId: string) => void;
}

function StarRating({
  score,
  onRate,
  size = 16,
  interactive = false,
}: {
  score: number;
  onRate?: (score: number) => void;
  size?: number;
  interactive?: boolean;
}) {
  const [hover, setHover] = useState<number>(0);
  const displayScore = hover || score;

  return (
    <div
      className="flex items-center gap-0.5"
      style={{
        cursor: interactive ? 'pointer' : 'default',
      }}
    >
      {[1, 2, 3, 4, 5].map((star: number) => {
        const filled = star <= displayScore;
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate && onRate(star)}
            onMouseEnter={() => interactive && setHover(star)}
            onMouseLeave={() => interactive && setHover(0)}
            className="p-0 bg-transparent border-0"
            style={{
              color: filled ? 'var(--yellow, #facc15)' : 'rgba(255, 255, 255, 0.2)',
              filter: filled ? 'drop-shadow(0 0 4px currentColor)' : 'none',
              cursor: interactive ? 'pointer' : 'default',
              lineHeight: 0,
            }}
          >
            <Star size={size} fill={filled ? 'currentColor' : 'none'} />
          </button>
        );
      })}
    </div>
  );
}

const RatingReviewSection = ({
  averageRating,
  ratingCount,
  reviews,
  onRate,
  onAddReview,
  onLikeReview,
}: RatingReviewSectionProps) => {
  const [newReview, setNewReview] = useState<string>('');
  const [selectedScore, setSelectedScore] = useState<number>(0);

  const handleSubmit = () => {
    if (!newReview.trim()) return;
    onAddReview(newReview.trim());
    setNewReview('');
  };

  const handleRate = (score: number) => {
    setSelectedScore(score);
    onRate(score);
  };

  return (
    <div className="space-y-4">
      {/* 評分總覽 */}
      <div
        className="cyber-card p-4"
        style={{ borderColor: 'rgba(250, 204, 21, 0.3)' }}
      >
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div
              className="font-cyber text-4xl md:text-5xl font-bold tracking-wider"
              style={{
                color: 'var(--yellow, #facc15)',
                textShadow: '0 0 15px currentColor',
              }}
            >
              {averageRating > 0 ? averageRating.toFixed(1) : '--'}
            </div>
            <div className="text-xs text-[var(--text-secondary)] font-cyber tracking-wider mt-1">
              {ratingCount} 人評分
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-secondary)] font-cyber tracking-wider">
                我的評分：
              </span>
              <StarRating
                score={selectedScore}
                onRate={handleRate}
                size={20}
                interactive
              />
              {selectedScore > 0 && (
                <span className="text-xs font-cyber" style={{ color: 'var(--yellow)' }}>
                  {selectedScore} 星
                </span>
              )}
            </div>
            <div className="text-xs text-[var(--text-secondary)]">
              點擊星星為此內容評分
            </div>
          </div>
        </div>
      </div>

      {/* 發表評論 */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
          placeholder="分享你的想法..."
          className="cyber-input flex-1 text-sm"
          style={{ borderColor: 'rgba(0, 255, 255, 0.2)' }}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!newReview.trim()}
          className="cyber-btn cyber-btn-sm flex items-center gap-1"
          style={{
            borderColor: newReview.trim() ? 'var(--cyan)' : 'var(--text-secondary)',
            color: newReview.trim() ? 'var(--cyan)' : 'var(--text-secondary)',
            cursor: newReview.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          <Send size={14} />
          發表
        </button>
      </div>

      {/* 評論列表 */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {reviews.length === 0 ? (
          <div
            className="text-center py-6 text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            暫無評論，成為第一個評論者吧
          </div>
        ) : (
          reviews.map((review: ReviewItem) => (
            <div
              key={review.id}
              className="cyber-card p-3"
              style={{
                borderColor: 'rgba(0, 255, 255, 0.15)',
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-cyber"
                    style={{
                      background: 'linear-gradient(135deg, var(--cyan), var(--pink))',
                      color: '#000',
                    }}
                  >
                    {review.author.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-cyber tracking-wider truncate text-[var(--text-primary)]">
                      {review.author}
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)]">
                      積分 {review.authorScore ?? '--'} · {new Date(review.createdAt).toLocaleDateString('zh-TW')}
                    </div>
                  </div>
                </div>
                <StarRating score={review.score} size={12} />
              </div>
              <p className="text-sm text-[var(--text-primary)] mb-2 break-words">
                {review.content}
              </p>
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => onLikeReview(review.id)}
                  className="flex items-center gap-1 text-xs"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <ThumbsUp size={12} />
                  <span>{review.likes}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RatingReviewSection;
