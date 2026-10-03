function getKey(contentType, contentId) {
  return `cyber_monopoly_reviews_${contentType}_${contentId}`;
}
function getReviews(contentType, contentId) {
  try {
    const raw = localStorage.getItem(getKey(contentType, contentId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return {
          ratings: parsed.ratings ?? {},
          reviews: Array.isArray(parsed.reviews) ? parsed.reviews : []
        };
      }
    }
  } catch {
  }
  return {
    ratings: {},
    reviews: []
  };
}
function submitRating(contentType, contentId, userId, score) {
  const data = getReviews(contentType, contentId);
  data.ratings[userId] = Math.max(1, Math.min(5, score));
  try {
    localStorage.setItem(getKey(contentType, contentId), JSON.stringify(data));
  } catch {
  }
}
function addReview(contentType, contentId, review) {
  const data = getReviews(contentType, contentId);
  data.reviews.unshift(review);
  try {
    localStorage.setItem(getKey(contentType, contentId), JSON.stringify(data));
  } catch {
  }
}
function likeReview(contentType, contentId, reviewId) {
  const data = getReviews(contentType, contentId);
  const review = data.reviews.find((r) => r.id === reviewId);
  if (review) {
    review.likes += 1;
    try {
      localStorage.setItem(getKey(contentType, contentId), JSON.stringify(data));
    } catch {
    }
  }
}
function getAverageRating(contentType, contentId) {
  const data = getReviews(contentType, contentId);
  const scores = Object.values(data.ratings);
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, s) => acc + s, 0);
  return Math.round(sum / scores.length * 10) / 10;
}
function getTotalReviews(contentType, contentId) {
  const data = getReviews(contentType, contentId);
  return data.reviews.length;
}
function isFeatured(avgRating, reviewCount) {
  return avgRating >= 4.5 && reviewCount >= 3;
}
function sortByFeatured(items, contentType) {
  const withFeatured = items.map((item) => {
    const avg = getAverageRating(contentType, item.id);
    const count = getTotalReviews(contentType, item.id);
    return {
      ...item,
      isFeatured: isFeatured(avg, count)
    };
  });
  const featured = withFeatured.filter((item) => item.isFeatured);
  const rest = withFeatured.filter((item) => !item.isFeatured);
  return [...featured, ...rest];
}
const authorScoreCache = {};
function getAuthorScore(author, baseItems) {
  if (authorScoreCache[author] !== void 0) return authorScoreCache[author];
  let score = 0;
  if (baseItems) {
    for (const item of baseItems) {
      if (item.author === author) {
        score += item.likes + item.downloads * 2;
      }
    }
  }
  if (score === 0) {
    let hash = 0;
    for (let i = 0; i < author.length; i++) {
      hash = hash * 31 + author.charCodeAt(i) >>> 0;
    }
    score = 100 + hash % 401;
  }
  authorScoreCache[author] = score;
  return score;
}
export {
  getAverageRating as a,
  getTotalReviews as b,
  submitRating as c,
  addReview as d,
  getAuthorScore as e,
  getReviews as g,
  likeReview as l,
  sortByFeatured as s
};
