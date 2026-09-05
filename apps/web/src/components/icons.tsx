import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

const defaultProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  fill: 'none',
  viewBox: '0 0 24 24',
  strokeWidth: 2,
  stroke: 'currentColor',
};

/** 社長室アイコン */
export function IconOffice({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16M9 7h1m-1 4h1m-1 4h1m4-8h1m-1 4h1m-1 4h1m-3 5v-4h2v4" />
    </svg>
  );
}

/** 定例役員会議室アイコン */
export function IconMeeting({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

/** 研究所アイコン */
export function IconLab({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 5H9L8 4zm1 5v8a3 3 0 006 0V9" />
    </svg>
  );
}

/** 工場アイコン */
export function IconFactory({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18V9l-6 4V9l-6 4V7L3 11v10zm6-7h2m-2 3h2m4-3h2m-2 3h2" />
    </svg>
  );
}

/** 販売本部アイコン */
export function IconSales({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

/** 経理部アイコン */
export function IconFinance({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

/** 人事部アイコン */
export function IconPersonnel({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

/** 歴代名機図鑑アイコン */
export function IconArchive({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

/** 冷蔵庫アイコン */
export function IconFridge({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} {...props}>
      <rect x="5" y="3" width="14" height="18" rx="2" strokeLinecap="round" />
      <line x1="5" y1="9" x2="19" y2="9" strokeLinecap="round" />
      <line x1="8" y1="6" x2="8" y2="7.5" strokeLinecap="round" />
      <line x1="8" y1="12" x2="8" y2="15" strokeLinecap="round" />
    </svg>
  );
}

/** 洗濯機アイコン */
export function IconWasher({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" strokeLinecap="round" />
      <circle cx="12" cy="13" r="5" strokeLinecap="round" />
      <line x1="7" y1="6" x2="9" y2="6" strokeLinecap="round" />
      <circle cx="15" cy="6" r="0.7" fill="currentColor" />
      <circle cx="17" cy="6" r="0.7" fill="currentColor" />
    </svg>
  );
}

/** テレビアイコン */
export function IconTV({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} {...props}>
      <rect x="3" y="6" width="18" height="13" rx="2" strokeLinecap="round" />
      <polyline points="17 2 12 6 7 2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="8" y1="21" x2="16" y2="21" strokeLinecap="round" />
      <line x1="12" y1="19" x2="12" y2="21" strokeLinecap="round" />
      <line x1="17" y1="10" x2="17" y2="11" strokeLinecap="round" />
      <line x1="17" y1="14" x2="17" y2="15" strokeLinecap="round" />
    </svg>
  );
}

/** 広告宣伝アイコン */
export function IconAd({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  );
}

/** 社員士気（モラル）アイコン */
export function IconMorale({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

/** 業界ニュース号外アイコン */
export function IconNews({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  );
}

/** ライバル・競合アイコン */
export function IconRival({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

/** ブランドアイコン */
export function IconBrand({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

/** トロフィー・殿堂アイコン */
export function IconTrophy({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8m-4-4v4m-5-8a5 5 0 0110 0v1a3 3 0 01-3 3H9a3 3 0 01-3-3v-1zm-3-3a3 3 0 003 3v-3H3zm18 0a3 3 0 01-3 3v-3h3z" />
    </svg>
  );
}

/** 警告アイコン */
export function IconWarning({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

/** チェック完了アイコン */
export function IconCheck({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...defaultProps} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
