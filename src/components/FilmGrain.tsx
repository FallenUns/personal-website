import React from 'react';
import './FilmGrain.css';

/**
 * Subtle animated SVG noise overlay across the entire viewport. Adds a
 * cinematic/analog feel without any JS cost. Turned off automatically
 * when prefers-reduced-motion is set (the CSS handles that).
 */
const FilmGrain: React.FC = () => (
  <div className="film-grain" aria-hidden="true">
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <filter id="film-grain-noise">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves="2"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
    </svg>
  </div>
);

export default React.memo(FilmGrain);
