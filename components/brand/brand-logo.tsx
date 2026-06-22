import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  /** Rendered square size in px. */
  size?: number;
  className?: string;
};

/**
 * elev8temedia cloud mark (white on black). The wordmark text usually sits
 * beside it, so the image is decorative (empty alt).
 */
export function BrandLogo({ size = 32, className }: BrandLogoProps) {
  return (
    <Image
      src="/elev8temedia-logo.jpg"
      alt=""
      width={size}
      height={size}
      priority
      className={cn(
        "shrink-0 rounded-md object-cover ring-1 ring-black/10 dark:ring-white/10",
        className,
      )}
    />
  );
}
