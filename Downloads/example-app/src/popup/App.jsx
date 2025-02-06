import React, { useEffect, useState } from 'react';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [videoId, setVideoId] = useState(null);
  const [likeCount, setLikeCount] = useState(null);
  const [dislikeCount, setDislikeCount] = useState(null);
  const [ratio, setRatio] = useState(null);
  const [error, setError] = useState(null);

  // Values used for the animation (they start at zero and animate to final)
  const [animLikes, setAnimLikes] = useState(0);
  const [animDislikes, setAnimDislikes] = useState(0);
  const [animRatio, setAnimRatio] = useState(0);

  // Format numbers to K (thousands) and M (millions)
  const formatNumber = (num) => {
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1) + 'M';
    } else if (num >= 1_000) {
      return (num / 1_000).toFixed(1) + 'K';
    }
    return num;
  };

  /**
 * 1) On mount, get active tab’s URL, extract video ID if on YouTube,
 *    then fetch official like count + estimated dislike count.
 */
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

   /**
   * 2) Fetch stats from YouTube Data API + Return YouTube Dislike API
   */
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

  /**
   * 3) Animate the likes, dislikes, and ratio once we know their final values
   *    (We’ll do a simple 1-second ramp from 0 to final using requestAnimationFrame)
   */
  useEffect(() => {
    if (likeCount !== null) {
      animateValue(0, likeCount, 1000, setAnimLikes);
    }
  }, [likeCount]);

  useEffect(() => {
    if (dislikeCount !== null) {
      animateValue(0, dislikeCount, 1000, setAnimDislikes);
    }
  }, [dislikeCount]);

  useEffect(() => {
    animateValue(0, ratio, 1000, setAnimRatio);
  }, [ratio]);


  /**
   * Helper function to animate a value from start -> end over `duration` ms.
   */
  const animateValue = (start, end, duration, onUpdate) => {
    let startTime;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const val = start + progress * (end - start);
      onUpdate(val);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  };

  /**
   * 4) Render
   */
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>YouTube Stats</h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <div style={styles.content}>
          {/* Left side: like/dislike counts */}
          <div style={styles.ldContainer}>
            <div style={styles.statRow}>
              <span style={styles.thumbIcon}>👍</span>
              <span style={styles.statNumber}>{formatNumber(animLikes)}</span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.thumbIcon}>👎</span>
              <span style={styles.statNumber}>{formatNumber(animDislikes)}</span>
            </div>
          </div>

          {/* Right side: circular ratio progress */}
          <div style={styles.circularContainer}>
            <CircularProgress
              percentage={animRatio}
              size={80}
              strokeWidth={8}
              text={`${animRatio.toFixed(0)}%`}
            />
            <p style={styles.ratioLabel}>L/D Ratio</p>
          </div>
        </div>
      )}
    </div>
  );
}


/**
 * A reusable Circular Progress Bar component in pure React + inline CSS.
 * If you want a pre-made fancy progress bar, consider a snippet from uiverse.io
 * or a library like react-circular-progressbar.
 */
function CircularProgress({ percentage, size, strokeWidth, text }) {
  // Calculate the circumference of the circle
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Convert percentage to an offset
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      style={{ transform: 'rotate(-90deg)' }} // rotate so 0% starts at top
    >
      <circle
        stroke="#d2d3d4" // background circle color
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke="#4caf50" // progress color
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        r={radius}
        cx={size / 2}
        cy={size / 2}
        style={{
          transition: 'stroke-dashoffset 0.2s linear',
        }}
      />
      {/* Text in the middle, rotate back so it's upright */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#666"
        fontSize="12"
        transform={`rotate(90, ${size / 2}, ${size / 2})`}
      >
        {text}
      </text>
    </svg>
  );
}

const styles = {
  container: {
    width: 300,
    padding: 16,
    fontFamily: 'sans-serif',
  },
  title: {
    margin: 0,
    marginBottom: 8,
    textAlign: 'center',
  },
  content: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ldContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  statRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  thumbIcon: {
    fontSize: '1.5rem',
  },
  statNumber: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  circularContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  ratioLabel: {
    marginTop: 4,
    fontSize: '0.9rem',
  },
};