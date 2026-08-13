"use client";

import React from 'react';
import { toast } from 'sonner';

interface ShareButtonsProps {
    slug: string;
    title: string;
}

export default function ShareButtons({ slug, title }: ShareButtonsProps) {
    const url = `https://vitaleevo.ao/blog/${slug}`;
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const handleShare = (platform: 'facebook' | 'instagram' | 'whatsapp') => {
        switch (platform) {
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank', 'width=600,height=400');
                break;
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, '_blank');
                break;
            case 'instagram':
                navigator.clipboard.writeText(url).then(() => {
                    toast.success("Link copiado!", {
                        description: "Cole o link no seu story ou post do Instagram.",
                    });
                }).catch(() => {
                    toast.error("Erro ao copiar link");
                });
                break;
        }
    };

    return (
        <div className="flex gap-3">
            <button
                onClick={() => handleShare('facebook')}
                className="px-6 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-white font-bold hover:bg-[#1877F2] hover:text-white transition-all"
            >
                Facebook
            </button>
            <button
                onClick={() => handleShare('instagram')}
                className="px-6 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-white font-bold hover:bg-[#E1306C] hover:text-white transition-all"
            >
                Instagram
            </button>
            <button
                onClick={() => handleShare('whatsapp')}
                className="px-6 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-white font-bold hover:bg-[#25D366] hover:text-white transition-all"
            >
                WhatsApp
            </button>
        </div>
    );
}
