import Image from "next/image";

type Props = {
  className?: string;
  size?: "sm" | "md" | "lg";
  priority?: boolean;
};

const SIZES = {
  sm: { width: 120, height: 45 },
  md: { width: 180, height: 67 },
  lg: { width: 280, height: 104 },
};

/** Well-Dying 이미지 로고 (투명 배경 PNG) */
export default function WellDyingLogo({
  className = "",
  size = "md",
  priority = false,
}: Props) {
  const dim = SIZES[size];
  return (
    <span className={`wd-logo wd-logo-${size} ${className}`.trim()}>
      <Image
        src="/brand/well-dying-logo.png"
        alt="Well-Dying"
        width={dim.width}
        height={dim.height}
        priority={priority}
        className="wd-logo-img"
      />
    </span>
  );
}
