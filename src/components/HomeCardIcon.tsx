import type { ReactNode } from "react";

type IconName =
  | "heart"
  | "monitor"
  | "sun"
  | "document"
  | "note"
  | "box"
  | "tree";

const paths: Record<IconName, ReactNode> = {
  heart: (
    <>
      <path d="M12 20s-7-4.4-7-9.2A3.8 3.8 0 0 1 12 7.5a3.8 3.8 0 0 1 7 3.3C19 15.6 12 20 12 20z" />
      <circle cx="9.2" cy="11" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="14.8" cy="11" r="0.7" fill="currentColor" stroke="none" />
    </>
  ),
  monitor: (
    <>
      <rect x="3.5" y="4.5" width="17" height="12" rx="1.8" />
      <path d="M8 20h8M12 16.5V20" />
      <path d="M8 9.5h8M8 12.5h5" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6.1 6.1l1.6 1.6M16.3 16.3l1.6 1.6M17.9 6.1l-1.6 1.6M7.7 16.3l-1.6 1.6" />
    </>
  ),
  document: (
    <>
      <path d="M7 3.5h7.2L18.5 8v12.5A1.5 1.5 0 0 1 17 22H7a1.5 1.5 0 0 1-1.5-1.5v-15A1.5 1.5 0 0 1 7 3.5z" />
      <path d="M14 3.5V8h4.5M8.5 12h7M8.5 15.5h7M8.5 19h4.5" />
    </>
  ),
  note: (
    <>
      <path d="M6 3.5h9.5A1.5 1.5 0 0 1 17 5v14.5L13.5 17H6a1.5 1.5 0 0 1-1.5-1.5v-12A1.5 1.5 0 0 1 6 3.5z" />
      <path d="M8 8.5h6.5M8 12h6.5M8 15.5h4" />
    </>
  ),
  box: (
    <>
      <path d="M4 8.2 12 4l8 4.2v8.6L12 21l-8-4.2V8.2z" />
      <path d="M12 12.2V21M4 8.2l8 4 8-4" />
    </>
  ),
  tree: (
    <>
      <path d="M12 20.5v-5" />
      <path d="M12 15.5c-3.4 0-5.8-2.2-5.8-5S10 4.5 12 4.5s5.8 3 5.8 6-2.4 5-5.8 5z" />
      <path d="M9.2 11.2c-.2-1.6.8-3.2 2.8-4M14.8 11.2c.2-1.6-.8-3.2-2.8-4" />
    </>
  ),
};

export default function HomeCardIcon({ name }: { name: IconName }) {
  return (
    <span className={`home-card-icon icon-${name}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {paths[name]}
      </svg>
    </span>
  );
}

export type { IconName };
