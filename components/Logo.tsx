export default function Logo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#0071e3" />
      <path
        d="M7 23 C 12 23, 12 14, 17 14 S 22 10, 25 9"
        stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none"
      />
      <circle cx="7" cy="23" r="2.4" fill="#fff" />
      <circle cx="17" cy="14" r="2.4" fill="#fff" />
      <circle cx="25" cy="9" r="2.4" fill="#fff" />
    </svg>
  );
}
