"use client";

import { useState } from "react";

const FALLBACK_IMAGE = "/images/blog/placeholder.svg";

interface SafeImageProps {
    src: string;
    alt: string;
    className?: string;
    sizes?: string;
}

export default function SafeImage({ src, alt, className, sizes }: SafeImageProps) {
    const [failed, setFailed] = useState(false);

    return (
        <img
            src={failed ? FALLBACK_IMAGE : src}
            alt={alt}
            loading="lazy"
            decoding="async"
            sizes={sizes}
            onError={() => setFailed(true)}
            className={className}
        />
    );
}