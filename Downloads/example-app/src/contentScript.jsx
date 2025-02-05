// src/contentScript.jsx

console.log('Content script loaded on', window.location.href);

/**
 * Extracts the YouTube video ID from the URL.
 */
const getVideoIdFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('v');
};

/**
 * Removes any previously inserted UI.
 */
const removeExistingUI = () => {
  const existing = document.getElementById('like-dislike-container');
  if (existing) existing.remove();
};

/**
 * Calculates the like ratio as a percentage.
 */
const calculateRatio = (likes, dislikes) => {
  const total = likes + dislikes;
  return total === 0 ? 0 : (likes / total) * 100;
};

/**
 * Inserts the stats UI into the page.
 */
const insertStatsUI = (likeCount, dislikeCount, ratio) => {
  const container = document.createElement('div');
  container.id = 'like-dislike-container';
  container.style.position = 'fixed';
  container.style.bottom = '10px';
  container.style.right = '10px';
  container.style.zIndex = '9999';
  container.style.padding = '8px';
  container.style.background = 'rgba(0,0,0,0.7)';
  container.style.color = '#fff';
  container.style.borderRadius = '4px';
  container.style.fontSize = '14px';

  // Use a simple “traffic light” border color:
  const color = ratio > 80 ? 'green' : ratio > 50 ? 'yellow' : 'red';
  container.style.border = `2px solid ${color}`;

  container.innerHTML = `
    <div><strong>Likes:</strong> ${likeCount}</div>
    <div><strong>Dislikes:</strong> ${dislikeCount}</div>
    <div><strong>Like Ratio:</strong> ${ratio.toFixed(2)}%</div>
  `;

  document.body.appendChild(container);
};

/**
 * Fetches the official like count from the YouTube Data API.
 * Replace <YOUR_YOUTUBE_DATA_API_KEY> with your actual API key.
 */
const getLikeCountFromYouTubeDataAPI = async (videoId) => {
  const apiKey = 'AIzaSyASEaWEirGCssULOEVCr8SoUbA6_wojRYQ';
  if (!apiKey) return null;

  const endpoint = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${apiKey}`;
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      const stats = data.items[0].statistics;
      return Number(stats.likeCount);
    }
  } catch (e) {
    console.error("Error fetching YouTube Data API for likes:", e);
  }
  return null;
};

/**
 * Fetches the estimated dislike count from the Return YouTube Dislike API.
 */
const getDislikeCountFromReturnAPI = async (videoId, officialLikeCount) => {
  try {
    const url = `https://returnyoutubedislikeapi.com/Votes?videoId=${videoId}` +
      (officialLikeCount ? `&likeCount=${officialLikeCount}` : '');
    const response = await fetch(url);
    const data = await response.json();
    return {
      likes: data.likes,
      dislikes: data.dislikes
    };
  } catch (e) {
    console.error("Error fetching ReturnYouTubeDislike API:", e);
    return null;
  }
};

/**
 * Fetches both stats and displays them.
 */
const fetchAndDisplayStats = async (videoId) => {
  removeExistingUI();

  // 1. Get the official like count
  const officialLikeCount = await getLikeCountFromYouTubeDataAPI(videoId);

  // 2. Get the estimated dislike count
  const estimatedDislikeData = await getDislikeCountFromReturnAPI(videoId, officialLikeCount);

  if (officialLikeCount === null || estimatedDislikeData === null) {
    console.log("Could not fetch stats for video:", videoId);
    return;
  }

  const { dislikes } = estimatedDislikeData;
  const likeCount = officialLikeCount; // You might compare with estimated likes if needed.
  const ratio = calculateRatio(likeCount, dislikes);

  insertStatsUI(likeCount, dislikes, ratio);
};

/**
 * Observes URL changes on YouTube (helpful since it’s a Single Page App).
 */
let currentVideoId = null;
const observeUrlChanges = () => {
  let lastUrl = location.href;
  const observer = new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      onUrlChange();
    }
  });
  observer.observe(document, { subtree: true, childList: true });
};

const onUrlChange = () => {
  const videoId = getVideoIdFromUrl();
  if (videoId && videoId !== currentVideoId) {
    currentVideoId = videoId;
    fetchAndDisplayStats(videoId);
  }
};

observeUrlChanges();
onUrlChange();
