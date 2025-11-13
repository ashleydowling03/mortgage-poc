// Helper formatting functions for the Calculator

export function fmtMoney(n?: number): string {
  if (n == null || !isFinite(n)) return "—";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtPercent(n?: number): string {
  if (n == null) return "—";
  return `${n.toFixed(3)}%`;
}