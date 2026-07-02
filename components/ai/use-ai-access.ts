"use client";

/**
 * AI access is always granted — no plan gating.
 */
export function useAiAccess(): { isLoaded: boolean; hasAccess: boolean } {
  return { isLoaded: true, hasAccess: true };
}
