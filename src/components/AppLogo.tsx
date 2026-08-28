import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number | string;
  showBackground?: boolean;
  color?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = "w-6 h-6",
  size,
  showBackground = false,
  color = "currentColor"
}) => {
  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 ${
        showBackground ? 'bg-black rounded-xl p-2 border border-white/10' : ''
      }`}
      style={size ? { width: size, height: size } : undefined}
    >
      <svg
        className={className}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Notepad Outer Frame with Rounded Corners & Open Top-Right */}
        <path
          d="M 276,104 L 142,104 C 90,104 56,138 56,190 L 56,380 C 56,432 90,466 142,466 L 370,466 C 422,466 456,432 456,380 L 456,238"
          fill="none"
          stroke={color}
          strokeWidth="46"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 45-degree Angled Stylus / Pencil */}
        <path
          d="M 238,284 L 242,206 L 376,72 C 392,56 418,56 434,72 C 450,88 450,114 434,130 L 300,264 Z"
          fill={color}
        />

        {/* Stylized Aggressive NXR Typography */}
        {/* 'N' */}
        <path
          d="M 140,404 L 158,298 L 185,298 L 208,358 L 218,298 L 244,298 L 225,404 L 210,404 L 230,378 L 204,404 L 194,404 L 173,338 L 158,404 Z"
          fill={color}
        />

        {/* 'X' */}
        <path
          d="M 234,404 L 246,380 L 260,348 L 242,298 L 272,298 L 282,328 L 302,298 L 330,298 L 294,348 L 315,404 L 286,404 L 298,380 L 273,361 L 258,380 L 252,404 Z"
          fill={color}
        />

        {/* 'R' */}
        <path
          d="M 324,404 L 340,298 L 380,298 C 400,298 411,308 407,326 C 403,342 391,350 375,352 L 402,404 L 370,404 L 380,380 L 353,356 L 345,356 L 337,404 Z M 348,339 L 369,339 C 377,339 382,335 384,328 C 385,321 381,316 373,316 L 351,316 Z"
          fill={color}
        />
      </svg>
    </div>
  );
};
