"use client";

import { api } from "@/shared/utils/apiClient";
import { useAuth } from "@/shared/providers/AuthProvider";
import { Heart } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface WishlistButtonProps {
    productId: string;
    className?: string;
}

export default function WishlistButton({ productId, className }: WishlistButtonProps) {
    const { token, isAuthenticated } = useAuth();
    const [isFavorited, setIsFavorited] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated || !token) {
            setIsFavorited(false);
            return;
        }
        let active = true;
        api.wishlist.isFavorited(productId, token)
            .then((res) => { if (active) setIsFavorited(Boolean(res?.favorited)); })
            .catch(() => { if (active) setIsFavorited(false); });
        return () => { active = false; };
    }, [productId, token, isAuthenticated]);

    const handleToggle = useCallback(async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated || !token) {
            alert("Por favor, faça login para adicionar aos favoritos.");
            return;
        }

        if (loading) return;

        setLoading(true);
        try {
            const res = await api.wishlist.toggle(productId, token);
            setIsFavorited(Boolean(res?.favorited));
        } catch (error) {
            console.error("Error toggling wishlist:", error);
        } finally {
            setLoading(false);
        }
    }, [productId, token, isAuthenticated, loading]);

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`transition-all duration-300 ${className} ${isFavorited
                ? "bg-red-500 text-white border-red-500"
                : "bg-white/20 hover:bg-white backdrop-blur-md text-white hover:text-red-500 border-white/30"
                } p-2 rounded-full border shadow-sm group`}
            title={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
            <Heart
                className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${isFavorited ? "fill-current" : ""
                    }`}
            />
        </button>
    );
}