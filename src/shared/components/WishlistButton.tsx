"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useAuth } from "@/shared/providers/AuthProvider";
import { Heart } from "lucide-react";
import { useState } from "react";

interface WishlistButtonProps {
    productId: Id<"products">;
    className?: string;
}

export default function WishlistButton({ productId, className }: WishlistButtonProps) {
    const { user, isAuthenticated } = useAuth();
    const isFavorited = useQuery(api.wishlist.isFavorited, {
        userId: user?._id,
        productId
    });
    const toggleWishlist = useMutation(api.wishlist.toggle);
    const [loading, setLoading] = useState(false);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            // Option: Redirect to login or show message
            alert("Por favor, faça login para adicionar aos favoritos.");
            return;
        }

        if (loading) return;

        setLoading(true);
        try {
            await toggleWishlist({
                userId: user!._id,
                productId
            });
        } catch (error) {
            console.error("Error toggling wishlist:", error);
        } finally {
            setLoading(false);
        }
    };

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
