// Iconsax Free icons, linear style (24 px grid).
// Source: https://app.iconsax.io/ and the Iconsax React SVG catalog.
function IconFrame({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconsaxBag() {
  return (
    <IconFrame>
      <path d="M8.81 2 5.19 5.63" />
      <path d="m15.19 2 3.62 3.63" />
      <path d="M2 7.85c0-1.85.99-2 2.22-2h15.56c1.23 0 2.22.15 2.22 2 0 2.15-.99 2-2.22 2H4.22C2.99 9.85 2 10 2 7.85Z" />
      <path d="m3.5 9.5 1.41 8.64c.32 1.94 1.08 3.36 3.94 3.36h6.9c3.11 0 3.57-1.36 3.93-3.24l1.82-8.76" />
      <path d="M9.76 14v3.55M14.36 14v3.55" />
    </IconFrame>
  );
}

export function IconsaxMenu() {
  return (
    <IconFrame>
      <path d="M3 7h18M3 12h18M3 17h18" />
    </IconFrame>
  );
}
