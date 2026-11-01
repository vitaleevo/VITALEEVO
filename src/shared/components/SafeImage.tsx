"use client";

import { useState, type ImgHTMLAttributes } from "react";

const FALLBACK_IMAGE = "/images/blog/placeholder.svg";

type SafeImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> & {
    src: string;
    alt: string;
    fallbackSrc?: string;
};

export default function SafeImage({ src, alt, fallbackSrc = FALLBACK_IMAGE, onError, ...props }: SafeImageProps) {
    const [failed, setFailed] = useState(false);

    return (
        // Raw <img> is intentional here: this boundary accepts arbitrary CMS/media URLs
        // and provides a resilient fallback when a remote host cannot be optimized by Next.
        // eslint-disable-next-line @next/next/no-img-element
        <img
            {...props}
            src={failed ? fallbackSrc : src}
            alt={alt}
            loading={props.loading ?? "lazy"}
            decoding={props.decoding ?? "async"}
            onError={(event) => {
                setFailed(true);
                onError?.(event);
            }}
        />
    );
}
