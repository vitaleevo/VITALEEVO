"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface CartItem {
    id: string | number;
    productId: string | number;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

interface CartContextType {
    items: CartItem[];
    addItem: (product: { id: string | number; name: string; price: number; image: string }, quantity?: number) => void;
    removeItem: (productId: string | number) => void;
    updateQuantity: (productId: string | number, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem("vitaleevo_cart");
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Error parsing cart:", e);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("vitaleevo_cart", JSON.stringify(items));
    }, [items]);

    const addItem = (product: { id: string | number; name: string; price: number; image: string }, quantity = 1) => {
        setItems((prev) => {
            const existingItem = prev.find((item) => item.productId === product.id);

            if (existingItem) {
                return prev.map((item) =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            return [
                ...prev,
                {
                    id: typeof product.id === 'string' ? product.id : Date.now(),
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    quantity,
                    image: product.image,
                },
            ];
        });
    };

    const removeItem = (productId: string | number) => {
        setItems((prev) => prev.filter((item) => item.productId !== productId));
    };

    const updateQuantity = (productId: string | number, quantity: number) => {
        if (quantity <= 0) {
            removeItem(productId);
            return;
        }

        setItems((prev) =>
            prev.map((item) =>
                item.productId === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
