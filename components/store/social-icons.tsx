import type { SVGProps } from 'react';

type SocialIconProps = SVGProps<SVGSVGElement>;

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function IconsaxFacebook(props: SocialIconProps) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M13.6 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.8-.1-1.6-.2-2.4-.2-2.4 0-4.1 1.5-4.1 4.2v2.3H7.7V13h2.7v8" />
    </svg>
  );
}

export function IconsaxInstagram(props: SocialIconProps) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M9 22h6c5 0 7-2 7-7V9c0-5-2-7-7-7H9C4 2 2 4 2 9v6c0 5 2 7 7 7Z" />
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M17.64 7h.01" strokeWidth="2.4" />
    </svg>
  );
}

export function IconsaxTiktok(props: SocialIconProps) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M14.1 3v11.2a4.4 4.4 0 1 1-3.6-4.33" />
      <path d="M14.1 3c.48 2.7 2.08 4.32 4.9 4.8" />
      <path d="M14.1 7.15a8.7 8.7 0 0 0 4.9 1.5" opacity=".55" />
    </svg>
  );
}

export function IconsaxYoutube(props: SocialIconProps) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M21.58 7.19a2.55 2.55 0 0 0-1.8-1.81C18.2 4.95 12 4.95 12 4.95s-6.2 0-7.78.43a2.55 2.55 0 0 0-1.8 1.81A26.6 26.6 0 0 0 2 12a26.6 26.6 0 0 0 .42 4.81 2.55 2.55 0 0 0 1.8 1.81c1.58.43 7.78.43 7.78.43s6.2 0 7.78-.43a2.55 2.55 0 0 0 1.8-1.81A26.6 26.6 0 0 0 22 12a26.6 26.6 0 0 0-.42-4.81Z" />
      <path d="m10 15 5-3-5-3v6Z" />
    </svg>
  );
}
