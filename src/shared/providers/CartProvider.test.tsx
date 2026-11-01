import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { CartProvider, useCart } from "./CartProvider";

function CartProbe() {
    const { addItem, items, subtotal, totalItems } = useCart();

    return (
        <div>
            <span data-testid="count">{totalItems}</span>
            <span data-testid="subtotal">{subtotal}</span>
            <span data-testid="items">{items.length}</span>
            <button
                type="button"
                onClick={() => addItem({ id: "p-1", name: "Produto", image: "/hero-card.png", price: 2500, sku: "P-1" })}
            >
                Adicionar
            </button>
        </div>
    );
}

describe("CartProvider", () => {
    beforeEach(() => localStorage.clear());

    it("restores a persisted cart without overwriting it during hydration", async () => {
        localStorage.setItem(
            "vitaleevo_cart",
            JSON.stringify([
                {
                    id: "p-1",
                    productId: "p-1",
                    name: "Produto",
                    price: 500,
                    sku: "P-1",
                    quantity: 2,
                    image: "/hero-card.png",
                },
            ])
        );

        render(
            <CartProvider>
                <CartProbe />
            </CartProvider>
        );

        await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("2"));
        expect(screen.getByTestId("subtotal")).toHaveTextContent("1000");
        expect(JSON.parse(localStorage.getItem("vitaleevo_cart") || "[]")).toHaveLength(1);
    });

    it("persists product price when adding a real store item", async () => {
        render(
            <CartProvider>
                <CartProbe />
            </CartProvider>
        );

        fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));

        await waitFor(() => expect(screen.getByTestId("subtotal")).toHaveTextContent("2500"));
        const persisted = JSON.parse(localStorage.getItem("vitaleevo_cart") || "[]");
        expect(persisted[0]).toMatchObject({ productId: "p-1", price: 2500, quantity: 1 });
    });
});
