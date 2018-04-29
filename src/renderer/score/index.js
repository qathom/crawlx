export function getScoreForTitle(item = {}) {
  const itemTitle = item.title;
  const strLength = itemTitle.length;
  const wordsLength = itemTitle.split(' ').length;

  if (strLength < 120 && wordsLength < 10) {
    return 'warning';
  }

  return 'success';
}

export function getScoreForBulletPoint(text = '') {
  const strLength = text.length;
  const wordsLength = text.split(' ').length;

  if (strLength < 120 && wordsLength < 10) {
    return 'warning';
  }

  return 'success';
}

export function getScoreForRating(item = {}) {
  const round = Math.round(item.rating);
  if (round === 1 || round === 2) {
    return 'danger';
  }

  if (round === 3) {
    return 'warning';
  }

  return 'success';
}

export function getScoreForImages(item = {}) {
  if (item.images === 0) {
    return 'danger';
  }

  if (item.images > 0 && item.images < 6) {
    return 'warning';
  }

  return 'success';
}

export function getScoreForVideos(item = {}) {
  if (item.videos === 0) {
    return 'danger';
  }

  return 'success';
}

export function getScoreForRankings(item = {}) {
  return item.rankings.length > 0 ? 'success' : 'warning';
}

export function getScoreForAPlusPage(item = {}) {
  return item.detailPage ? 'success' : 'danger';
}

export function getScoreForBestSeller(item = {}) {
  return item.bestSeller ? 'success' : 'warning';
}

export function getScoreForReviews(item = {}) {
  return item.reviews > 0 ? 'success' : 'warning';
}

export function getScoreForReplies(item = {}) {
  return item.replies > 0 ? 'success' : 'warning';
}

export function getScoreForBuyBox(item = {}) {
  return !item.lostBuyBox ? 'success' : 'danger';
}

export function getScores(item = {}) {
  const scores = {};

  scores.title = getScoreForTitle(item);
  // overall score for bullet points
  scores.bulletPoints = item.bulletPoints.map(b => getScoreForBulletPoint(b))
    .filter(s => s === 'success')
    .length === item.bulletPoints.length ? 'success' : 'warning';
  scores.rating = getScoreForRating(item);
  scores.images = getScoreForImages(item);
  scores.videos = getScoreForVideos(item);
  scores.rankings = getScoreForRankings(item);
  scores.aPlusPage = getScoreForAPlusPage(item);
  scores.bestSeller = getScoreForBestSeller(item);
  scores.reviews = getScoreForReviews(item);
  scores.lostBuyBox = getScoreForBuyBox(item);
  scores.replies = getScoreForReplies(item);

  let points = 0;

  Object.keys(scores).forEach((key) => {
    if (scores[key] === 'success') {
      points += 2;
    } else if (scores[key] === 'warning') {
      points += 1;
    }
  });

  scores.overall = {
    score: points,
    total: Object.keys(scores).length * 2,
  };

  return scores;
}
