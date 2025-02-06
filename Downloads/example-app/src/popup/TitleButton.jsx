// TitleButton.jsx

import React from 'react';
import './titleButton.css'; // same file as your original button CSS (with adjustments)

export default function TitleButton({ channelName = '' }) {
  // Decide which extra class to apply based on length
  const text2Class = getText2Class(channelName);

  return (
    <button>
      <span className="icon">
        <svg
          fill="none"
          height="33"
          viewBox="0 0 120 120"
          width="33"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="m120 60c0 33.1371-26.8629 60-60 60s-60-26.8629-60-60 26.8629-60 60-60 60 26.8629 60 60z"
            fill="#cd201f"
          ></path>
          <path
            d="m25 49c0-7.732 6.268-14 14-14h42c7.732 0 14 6.268 14 14v22c0 7.732-6.268 14-14 14h-42c-7.732 0-14-6.268-14-14z"
            fill="#fff"
          ></path>
          <path d="m74 59.5-21 10.8253v-21.6506z" fill="#cd201f"></path>
        </svg>
      </span>

      <span className="text1">Stats</span>

      {/* Add dynamic class for text2 based on length */}
      <span className={text2Class}>{channelName}</span>
    </button>
  );
}

/** 
 * Helper that returns something like:
 *  "text2 text2--5-8"  if length is 5..8
 *  "text2 text2--9-15" if length is 9..15
 *  "text2 text2--over15" if length > 15
 * Otherwise just "text2".
 */
function getText2Class(channelName) {
    let base = 'text2';
    const len = channelName.length;
  
    if (len >= 5 && len <= 8) {
      return base + ' text2--5-8';
    } else if (len > 8 && len <= 12) {
      return base + ' text2--9-12';
    } else if (len > 12 && len <= 15) {
      return base + ' text2--12-15';
    } else if (len > 15) {
      return base + ' text2--over15';
    }
    return base; // Default case for less than 5 chars
  }
  
