import React, { useEffect, useState } from 'react';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [videoId, setVideoId] = useState(null);
  const [likeCount, setLikeCount] = useState(null);
  const [dislikeCount, setDislikeCount] = useState(null);
  const [ratio, setRatio] = useState(null);
  const [error, setError] = useState(null);

  // Format numbers to K (thousands) and M (millions)
  const formatNumber = (num) => {
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1) + 'M';
    } else if (num >= 1_000) {
      return (num / 1_000).toFixed(1) + 'K';
    }
    return num;
  };

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab && activeTab.url) {
        try {
          const url = new URL(activeTab.url);
          if (url.hostname.includes("youtube.com") && url.searchParams.has("v")) {
            const vid = url.searchParams.get("v");
            setVideoId(vid);
            fetchStats(vid);
          } else {
            setError("Current tab is not a YouTube video page.");
            setLoading(false);
          }
        } catch (err) {
          setError("Invalid URL in active tab.");
          setLoading(false);
        }
      } else {
        setError("No active tab found.");
        setLoading(false);
      }
    });
  }, []);

  const fetchStats = async (vid) => {
    const apiKey = 'AIzaSyASEaWEirGCssULOEVCr8SoUbA6_wojRYQ';

    try {
      const ytEndpoint = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${vid}&key=${apiKey}`;
      const ytResponse = await fetch(ytEndpoint);
      const ytData = await ytResponse.json();
      if (ytData.items && ytData.items.length > 0) {
        const stats = ytData.items[0].statistics;
        const likes = Number(stats.likeCount);
        setLikeCount(likes);

        const rEndpoint = `https://returnyoutubedislikeapi.com/Votes?videoId=${vid}&likeCount=${likes}`;
        const rResponse = await fetch(rEndpoint);
        const rData = await rResponse.json();
        if (rData) {
          const dislikes = rData.dislikes;
          setDislikeCount(dislikes);
          const total = likes + dislikes;
          const ratioPercent = total === 0 ? 0 : (likes / total) * 100;
          setRatio(ratioPercent);
        } else {
          setError("Could not fetch dislike data.");
        }
      } else {
        setError("No video data found.");
      }
    } catch (err) {
      setError("Error fetching video data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: 300, padding: 16 }}>
      <h2>YouTube Like/Dislike Stats</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <div>
          <p><strong>Video ID:</strong> {videoId}</p>
          <p><strong>Likes:</strong> {formatNumber(likeCount)}</p>
          <p><strong>Dislikes:</strong> {formatNumber(dislikeCount)}</p>
          <p><strong>Like Ratio:</strong> {ratio !== null ? ratio.toFixed(2) + '%' : 'N/A'}</p>
        </div>
      )}
    </div>
  );
}
