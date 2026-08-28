import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AnalyticsConsent from "./AnalyticsConsent";

vi.mock("next/script", () => ({ default: () => <div data-testid="ga-script" /> }));
vi.mock("./AnalyticsTracker", () => ({ default: () => <div data-testid="analytics-tracker" /> }));

describe("AnalyticsConsent", () => {
    beforeEach(() => localStorage.clear());

    it("keeps internal analytics disabled before explicit consent while loading the consent-aware GA tag", async () => {
        render(<AnalyticsConsent googleAnalyticsId="G-TEST" />);
        expect(await screen.findByRole("region", { name: /preferências de privacidade/i })).toBeInTheDocument();
        expect(screen.queryByTestId("analytics-tracker")).not.toBeInTheDocument();
        expect(screen.getAllByTestId("ga-script")).toHaveLength(2);
    });

    it("persists acceptance and starts internal and GA analytics", async () => {
        render(<AnalyticsConsent googleAnalyticsId="G-TEST" />);
        fireEvent.click(await screen.findByRole("button", { name: /aceitar métricas/i }));
        expect(localStorage.getItem("vitaleevo_analytics_consent")).toBe("accepted");
        expect(screen.getByTestId("analytics-tracker")).toBeInTheDocument();
        expect(screen.getAllByTestId("ga-script")).toHaveLength(2);
    });

    it("persists refusal and keeps analytics disabled", async () => {
        render(<AnalyticsConsent />);
        fireEvent.click(await screen.findByRole("button", { name: /recusar/i }));
        expect(localStorage.getItem("vitaleevo_analytics_consent")).toBe("declined");
        expect(screen.queryByTestId("analytics-tracker")).not.toBeInTheDocument();
    });
});
