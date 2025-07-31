export const SplitIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 3h5v5" />
    <path d="M8 3H3v5" />
    <path d="M21 16v5h-5" />
    <path d="M3 16v5h5" />
    <line x1="12" x2="12" y1="3" y2="21" />
    <line x1="3" x2="21" y1="12" y2="12" />
  </svg>
);
