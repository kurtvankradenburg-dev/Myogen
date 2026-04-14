export default function MyogenLogo({ size = 24, animated = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={animated ? 'logo-animated' : ''}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top arrow */}
      <path d="M12 2L13.8 8.2H10.2L12 2Z" fill="var(--accent)" />
      {/* Bottom arrow */}
      <path d="M12 22L10.2 15.8H13.8L12 22Z" fill="var(--accent)" />
      {/* Left arrow */}
      <path d="M2 12L8.2 10.2V13.8L2 12Z" fill="var(--accent)" />
      {/* Right arrow */}
      <path d="M22 12L15.8 13.8V10.2L22 12Z" fill="var(--accent)" />
      {/* Center circle */}
      <circle cx="12" cy="12" r="2.8" fill="var(--accent)" />
      {/* Inner ring */}
      <circle cx="12" cy="12" r="4.5" stroke="var(--accent)" strokeWidth="0.6" strokeOpacity="0.4" fill="none" />
    </svg>
  );
}
