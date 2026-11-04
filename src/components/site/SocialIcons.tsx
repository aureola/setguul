export function FacebookIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M13.4 16.2v-4.5h1.5l.23-1.75h-1.73v-1.1c0-.5.14-.85.86-.85h.93V6.44a12 12 0 0 0-1.36-.07c-1.34 0-2.26.82-2.26 2.32v1.3H9.9v1.75h1.27v4.5h1.73Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function XIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 4h4.2l4.1 5.6L16.8 4H20l-6.1 7.6L20.3 20H16.1l-4.4-6-5 6H3.5l6.5-8L4 4Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** The plain Facebook "f" glyph (no circle), for use on a solid-color square. */
export function FacebookFIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 512" fill="currentColor" className={className} aria-hidden="true">
      <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
    </svg>
  );
}

/** The plain X "x" glyph, for use on a solid-color square. */
export function XLogoIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" fill="currentColor" className={className} aria-hidden="true">
      <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
    </svg>
  );
}

export function YoutubeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.5 9.3v5.4l4.8-2.7-4.8-2.7Z" fill="currentColor" />
    </svg>
  );
}
