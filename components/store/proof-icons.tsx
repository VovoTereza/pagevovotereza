import type { SVGProps } from 'react';

type ProofIconProps = SVGProps<SVGSVGElement>;

const sharedProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
} as const;

export function IconsaxArchiveBook(props: ProofIconProps) {
  return (
    <svg {...sharedProps} {...props}>
      <path
        d="M21 7v10c0 3-1.5 5-5 5H8c-3.5 0-5-2-5-5V7c0-3 1.5-5 5-5h8c3.5 0 5 2 5 5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 2v7.86c0 .44-.52.66-.84.37l-2.32-2.14a.496.496 0 0 0-.68 0l-2.32 2.14c-.32.29-.84.07-.84-.37V2h7ZM13.25 14h4.25M9 18h8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconsaxMobile(props: ProofIconProps) {
  return (
    <svg {...sharedProps} {...props}>
      <path
        d="M17 6v10c0 4-1 5-5 5H6c-4 0-5-1-5-5V6c0-4 1-5 5-5h6c4 0 5 1 5 5ZM11 4.5H7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 18.1A1.55 1.55 0 1 0 9 15a1.55 1.55 0 0 0 0 3.1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconsaxCardTick(props: ProofIconProps) {
  return (
    <svg {...sharedProps} {...props}>
      <path
        d="M2 10h20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.548 20.5h-5.11c-3.55 0-4.45-.88-4.45-4.39V7.89c0-3.18.74-4.2 3.53-4.36.28-.01.59-.02.92-.02h11.11c3.55 0 4.45.88 4.45 4.39v4.41"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 16h4M22 18c0 .75-.21 1.46-.58 2.06A3.97 3.97 0 0 1 18 22a3.97 3.97 0 0 1-3.42-1.94A3.92 3.92 0 0 1 14 18c0-2.21 1.79-4 4-4s4 1.79 4 4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m16.441 18 .99.99 2.13-1.97"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
