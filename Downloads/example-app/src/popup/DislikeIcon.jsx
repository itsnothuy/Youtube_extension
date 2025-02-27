// src/popup/DislikeIcon.jsx
import React from 'react';
import './Icons.css'; // Same CSS file

export default function DislikeIcon({ active = false, color = 'rgb(185, 51, 51)' }) {
  return (
    <label className="container" style={{ '--activeColor': color }}>
      <input type="checkbox" checked={active} readOnly />
      <svg
        id="Glyph"
        viewBox="0 0 32 32"
        xmlSpace="preserve"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          id="XMLID_259_"
          d="M2.156,14.901l2.489-8.725C5.012,4.895,6.197,4,7.528,4h13.473C21.554,4,22,4.448,22,5v14  
          c0,0.215-0.068,0.425-0.197,0.597l-5.392,7.24C15.813,27.586,14.951,28,14.027,28c-1.669,0-3.026-1.357-3.026-3.026V20H5.999  
          c-1.265,0-2.427-0.579-3.188-1.589C2.047,17.399,1.809,16.12,2.156,14.901z"
        />
        <path
          id="XMLID_260_"
          d="M25.001,20h4C29.554,20,30,19.552,30,19V5c0-0.552-0.446-1-0.999-1h-4c-0.553,0-1,0.448-1,1v14  
          C24.001,19.552,24.448,20,25.001,20z M27.001,6.5c0.828,0,1.5,0.672,1.5,1.5c0,0.828-0.672,1.5-1.5,1.5  
          c-0.828,0-1.5-0.672-1.5-1.5C25.501,7.172,26.173,6.5,27.001,6.5z"
        />
      </svg>
    </label>
  );
}
