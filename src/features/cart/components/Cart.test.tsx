import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { CartProvider } from "@/shared/providers/CartProvider";
import Cart from "./Cart";

describe("Cart", () => {
    beforeEach(() => localStorage.clear());

    it("renders persisted real items and routes the commercial flow to quotation", async () => {
        localStorage.setItem(
            "vitaleevo_cart",
            JSON.stringify([
                {
                    id: "prod-1",
                    productId: "prod-1",
                    name: "Produto Real Vitaleevo",
                    price: 125000,
                    sku: "VITA-001",
                    quantity: 2,
                    image: "/hero-card.png",
                },
            ])
        );

        render(
            <CartProvider>
                <Cart />
            </CartProvider>
        );

        expect(await screen.findByText("Produto Real Vitaleevo")).toBeInTheDocument();
        expect(screen.queryByText(/Canon EOS R5/i)).not.toBeInTheDocument();
        expect(screen.getByRole("link", { name: /solicitar cotação/i })).toHaveAttribute("href", "/cotacao");
        expect(screen.getByText(/não é efetuado nenhum pagamento/i)).toBeInTheDocument();
    });
});
