"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "@/shared/providers/AuthProvider";
import { api } from "@/shared/utils/apiClient";

interface CartItem {
    id: string | number;
    productId: string | number;
    name: string;
    price?: number;
    sku?: string;
    slug?: string;
    quantity: number;
    image: string;
}

interface CartContextType {
    items: CartItem[];
    addItem: (product: { id: string | number; name: string; image: string; price?: number; sku?: string; slug?: string }, quantity?: number) => void;
    removeItem: (productId: string | number) => void;
    updateQuantity: (productId: string | number, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const { token, isAuthenticated } = useAuth();
    const [items, setItems] = useState<CartItem[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);

    // Helper: tenta backend quando autenticado, senão localStorage
    const syncFromBackend = useCallback(async () => {
        if (!token || !isAuthenticated) return;
        try {
            setIsSyncing(true);
            const backendItems = await api.cart.list(token);
            // backend retorna {id, product_slug, quantity, product:{...}}
            const mapped: CartItem[] = (backendItems as any[]).map((row: any) => ({
                id: row.id,
                productId: row.product?.slug || row.product_slug,
                name: row.product?.name || row.product_slug,
                price: Number(row.product?.price ?? 0),
                sku: row.product?.sku,
                slug: row.product?.slug || row.product_slug,
                quantity: row.quantity,
                image: row.product?.image || "",
            }));
            setItems(mapped);
        } catch {
            // fallback local
        } finally {
            setIsSyncing(false);
        }
    }, [token, isAuthenticated]);

    // Load: se autenticado busca backend, senão localStorage
    useEffect(() => {
        if (isAuthenticated && token) {
            syncFromBackend();
        } else {
            const savedCart = localStorage.getItem("vitaleevo_cart");
            if (savedCart) {
                try {
                    setItems(JSON.parse(savedCart));
                } catch (e) {
                    console.error("Error parsing cart:", e);
                }
            } else {
                setItems([]);
            }
        }
    }, [isAuthenticated, token, syncFromBackend]);

    // Save to localStorage apenas quando não autenticado (backend é fonte da verdade)
    useEffect(() => {
        if (!isAuthenticated) {
            localStorage.setItem("vitaleevo_cart", JSON.stringify(items));
        }
    }, [items, isAuthenticated]);

    // Migra carrinho local para backend ao fazer login
    useEffect(() => {
        if (!isAuthenticated || !token) return;
        const local = localStorage.getItem("vitaleevo_cart");
        if (!local) return;
        try {
            const parsed: CartItem[] = JSON.parse(local);
            if (!parsed.length) return;
            (async () => {
                for (const it of parsed) {
                    const slug = (it as any).slug || String(it.productId);
                    try { await api.cart.add(slug, it.quantity, token); } catch {}
                }
                localStorage.removeItem("vitaleevo_cart");
                syncFromBackend();
            })();
        } catch {}
    }, [isAuthenticated, token, syncFromBackend]);

    const addItem = async (product: { id: string | number; name: string; image: string; price?: number; sku?: string; slug?: string }, quantity = 1) => {
        const slug = product.slug || String(product.id);
        if (isAuthenticated && token) {
            try {
                await api.cart.add(slug, quantity, token);
                await syncFromBackend();
                return;
            } catch (e) {
                // fallback local se produto indisponível
            }
        }
        setItems((prev) => {
            const existingItem = prev.find((item) => item.productId === product.id);
            if (existingItem) {
                return prev.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item);
            }
            return [...prev, { id: typeof product.id === 'string' ? product.id : Date.now(), productId: product.id, name: product.name, price: product.price ?? 0, sku: product.sku, slug: product.slug, quantity, image: product.image }];
        });
    };

    const removeItem = async (productId: string | number) => {
        if (isAuthenticated && token) {
            const target = items.find(i => i.productId === productId);
            if (target && typeof target.id === 'number') {
                try { await api.cart.remove(String(target.id), token); await syncFromBackend(); return; } catch {}
            }
            // fallback busca id via list
            try {
                const backendItems: any[] = await api.cart.list(token) as any;
                const match = backendItems.find((r: any) => (r.product?.slug || r.product_slug) === String(productId) || r.product?.id === productId);
                if (match) { await api.cart.remove(String(match.id), token); await syncFromBackend(); return; }
            } catch {}
        }
        setItems((prev) => prev.filter((item) => item.productId !== productId));
    };

    const updateQuantity = async (productId: string | number, quantity: number) => {
        if (quantity <= 0) { removeItem(productId); return; }
        if (isAuthenticated && token) {
            const target = items.find(i => i.productId === productId);
            if (target && typeof target.id === 'number') {
                try { await api.cart.updateQuantity(String(target.id), quantity, token); await syncFromBackend(); return; } catch {}
            }
        }
        setItems((prev) => prev.map((item) => item.productId === productId ? { ...item, quantity } : item));
    };

    const clearCart = async () => {
        if (isAuthenticated && token) {
            try { await api.cart.clear(token); } catch {}
        }
        setItems([]);
        if (!isAuthenticated) localStorage.removeItem("vitaleevo_cart");
    };

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                totalItems,
                subtotal,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
