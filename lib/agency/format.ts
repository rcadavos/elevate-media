import type { AgencyClient } from "@/lib/types/agency";

export function clientInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
  }
  return (name.trim().slice(0, 2) || "?").toUpperCase();
}

/** Plain-language summary of the percentage billing model. */
export function billingModelSummary(client: AgencyClient): string {
  const parts: string[] = [];
  if (client.feeOnRevenue > 0) {
    parts.push(`${client.feeOnRevenue}% of revenue`);
  }
  if (client.feeOnProfit > 0) {
    parts.push(`${client.feeOnProfit}% of profit`);
  }
  if (parts.length === 0) {
    return "No fee configured";
  }
  return parts.join(" + ");
}

export function formatRoasTarget(client: AgencyClient): string {
  if (client.targetRoas > 0) {
    return `${client.targetRoas.toFixed(1)}×`;
  }
  return "—";
}

/**
 * Break-Even ROAS = 1 ÷ (profit margin % − agency fee on revenue %).
 * Mirrors `calcBreakEvenRoas` in the elev8temedia tracker.
 */
export function breakEvenRoas(client: AgencyClient): number {
  const denom = (client.profitMargin - client.feeOnRevenue) / 100;
  return denom > 0 ? 1 / denom : 0;
}

/** Formats a ROAS multiple as "1.82×", or "—" when zero/invalid. */
export function formatRoas(n: number): string {
  if (!n || Number.isNaN(n)) return "—";
  return `${n.toFixed(2)}×`;
}

export function serviceLabel(service: AgencyClient["service"]): string {
  return service === "META" ? "Meta Ads" : "SMS";
}
