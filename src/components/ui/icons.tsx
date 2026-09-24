import type { ReactNode } from "react";

export function Icon({
  children,
  size = 24,
  className,
  strokeWidth = 2,
}: {
  children: ReactNode;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconCart = ({ size = 24 }: { size?: number }) => (
  <Icon size={size}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </Icon>
);

export const IconSearch = ({ size = 24 }: { size?: number }) => (
  <Icon size={size}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </Icon>
);

export const IconHeart = ({ size = 24, filled = false }: { size?: number; filled?: boolean }) => (
  <Icon size={size}>
    <path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      fill={filled ? "currentColor" : "none"}
    />
  </Icon>
);

export const IconMenu = ({ size = 24 }: { size?: number }) => (
  <Icon size={size}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </Icon>
);

export const IconClose = ({ size = 24 }: { size?: number }) => (
  <Icon size={size}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Icon>
);

export const IconArrow = ({ size = 24 }: { size?: number }) => (
  <Icon size={size}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </Icon>
);

export const IconChevron = ({ size = 24 }: { size?: number }) => (
  <Icon size={size}>
    <path d="m9 18 6-6-6-6" />
  </Icon>
);

export const IconHome = ({ size = 24 }: { size?: number }) => (
  <Icon size={size}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </Icon>
);

export const IconStar = ({ size = 16, filled = true }: { size?: number; filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const IconLock = ({ size = 24 }: { size?: number }) => (
  <Icon size={size}>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Icon>
);

export const IconTruck = ({ size = 24 }: { size?: number }) => (
  <Icon size={size}>
    <path d="M5 18H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h10v11m0-11h3l3 4v7a1 1 0 0 1-1 1h-2" />
    <circle cx="7" cy="18" r="2" />
    <circle cx="17" cy="18" r="2" />
  </Icon>
);

export const IconReturn = ({ size = 24 }: { size?: number }) => (
  <Icon size={size}>
    <path d="M9 14l-4-4m0 0l4-4m-4 4h11a4 4 0 0 1 0 8h-1" />
  </Icon>
);

export const IconShield = ({ size = 24 }: { size?: number }) => (
  <Icon size={size}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Icon>
);
