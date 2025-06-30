// src/filter-utils.ts

export interface Vec2 {
  x: number;
  y: number;
}

// Shader fragment function (from your shader-utils.ts)
function smoothStep(a: number, b: number, t: number): number {
  t = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function length(x: number, y: number): number {
  return Math.sqrt(x * x + y * y);
}

function roundedRectSDF(x: number, y: number, width: number, height: number, radius: number): number {
  const qx = Math.abs(x) - width + radius;
  const qy = Math.abs(y) - height + radius;
  return Math.min(Math.max(qx, qy), 0) + length(Math.max(qx, 0), Math.max(qy, 0)) - radius;
}

function texture(x: number, y: number): Vec2 {
  return { x, y };
}

const fragmentShader = (uv: Vec2): Vec2 => {
  const ix = uv.x - 0.5;
  const iy = uv.y - 0.5;
  const distanceToEdge = roundedRectSDF(ix, iy, 0.3, 0.2, 0.6);
  const displacement = smoothStep(0.8, 0, distanceToEdge - 0.15);
  const scaled = smoothStep(0, 1, displacement);
  return texture(ix * scaled + 0.5, iy * scaled + 0.5);
};

// --- Caching Mechanism (from reference) ---
const filterCache = new Map<string, string>();
const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/**
 * Generates a displacement map using a 2D canvas context and caches the result.
 */
export const generateAndCacheMap = (width: number, height: number): string => {
  const w = Math.round(width);
  const h = Math.round(height);
  if (w === 0 || h === 0) return TRANSPARENT_PIXEL;

  const cacheKey = `${w}_${h}`;
  if (filterCache.has(cacheKey)) {
    return filterCache.get(cacheKey)!;
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const context = canvas.getContext("2d");
  if (!context) return TRANSPARENT_PIXEL;

  const imageData = context.createImageData(w, h);
  const data = imageData.data;
  const rawValues: number[] = [];
  let maxScale = 0;

  // Calculate displacement values
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const uv: Vec2 = { x: x / w, y: y / h };
      const pos = fragmentShader(uv);
      const dx = pos.x * w - x;
      const dy = pos.y * h - y;

      maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy));
      rawValues.push(dx, dy);
    }
  }

  maxScale = maxScale > 0 ? Math.max(maxScale, 1) : 1;

  // Convert to image data
  let rawIndex = 0;
  for (let i = 0; i < data.length; i += 4) {
    const dx = rawValues[rawIndex++];
    const dy = rawValues[rawIndex++];
    
    // Normalize values to [0, 1] range, with 0.5 as the neutral point
    const r = dx / maxScale + 0.5;
    const g = dy / maxScale + 0.5;

    data[i] = r * 255;       // Red channel (X displacement)
    data[i + 1] = g * 255;   // Green channel (Y displacement)
    data[i + 2] = g * 255;   // Blue channel (Y displacement for SVG filter)
    data[i + 3] = 255;       // Alpha channel
  }

  context.putImageData(imageData, 0, 0);
  const dataUrl = canvas.toDataURL();
  filterCache.set(cacheKey, dataUrl);
  
  return dataUrl;
};