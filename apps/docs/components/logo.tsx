import { cn } from "@raypx/ui/lib/utils";
import Image from "next/image";

interface LogoProps {
  size?: 16 | 24 | 32 | 48 | 64 | 128 | 256;
  className?: string;
  priority?: boolean;
}

export function Logo({ size = 24, className, priority = false }: LogoProps) {
  // Map size to optimized image
  const getLogoSrc = (size: number) => {
    if (size <= 32) return "/logo-32.png";
    if (size <= 64) return "/logo-64.png";
    if (size <= 128) return "/logo-128.png";
    if (size <= 256) return "/logo-256.png";
    return "/logo-512.png";
  };

  return (
    <Image
      src={getLogoSrc(size)}
      alt="Logo"
      width={size}
      height={size}
      className={cn("rounded-full", className)}
      priority={priority}
      sizes={`${size}px`}
    />
  );
}
