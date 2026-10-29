"use client";

import { useEffect, useRef, useState } from "react";

// The scenes are designed on a fixed 350 x 380 stage.
const STAGE_W = 350;
const STAGE_H = 380;

// A card that takes whatever space it is given (so it can shrink on short phones) and scales the
// scene down to fit, never up.
const SceneStage = ({ children, className = "" }) => {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setScale(Math.min(1, height / STAGE_H, width / (STAGE_W - 10)));
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`relative overflow-hidden rounded-[28px] bg-stage ${className}`}>
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: STAGE_W,
          height: STAGE_H,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default SceneStage;
