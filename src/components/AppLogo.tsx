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
    <svg
      className={className}
      style={size ? { width: size, height: size } : undefined}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {showBackground && (
        <rect width="512" height="512" rx="100" fill="#09090b" />
      )}
      {/* Left Vertical Bar + Diagonal Transition */}
      <polygon
        points="0,0 204.8,0 396.8,192 396.8,435.2 115.2,153.6 115.2,512 0,512"
        fill={color}
      />
      {/* Right Vertical Bar + Central Diagonal Band */}
      <polygon
        points="512,512 307.2,512 115.2,320 115.2,76.8 396.8,358.4 396.8,0 512,0"
        fill={color}
      />
    </svg>
  );
};
