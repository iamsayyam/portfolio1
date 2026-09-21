import { memo } from 'react';

/** The little figure who walks the street. Legs only swing when the parent has the `walking` class. */
function WalkerBase({ facing }: { facing: 1 | -1 }) {
  return (
    <svg
      width="48"
      height="100"
      viewBox="0 0 48 100"
      aria-hidden="true"
      style={{ transform: `scaleX(${facing})`, overflow: 'visible' }}
    >
      <ellipse cx="24" cy="97" rx="18" ry="3.5" fill="#000" opacity="0.28" />
      <rect className="walker-leg walker-leg-b" x="26" y="62" width="9" height="34" rx="4.5" fill="#9AA0C8" />
      <rect className="walker-leg walker-leg-a" x="13" y="62" width="9" height="34" rx="4.5" fill="#EEEAF7" />
      <g className="walker-body">
        <rect x="9" y="27" width="30" height="42" rx="13" fill="#EEEAF7" />
        <rect x="9" y="30" width="30" height="8" rx="4" fill="#FFB547" />
        <circle cx="24" cy="16" r="12" fill="#EEEAF7" />
        <circle cx="29.5" cy="15" r="1.8" fill="#0E1230" />
      </g>
    </svg>
  );
}

export default memo(WalkerBase);
