type Props = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

/** Well-Dying 스크립트 로고 (소프트 골드) */
export default function WellDyingLogo({ className = "", size = "md" }: Props) {
  return (
    <span className={`wd-logo wd-logo-${size} ${className}`.trim()} aria-label="Well-Dying">
      Well-Dying
    </span>
  );
}
