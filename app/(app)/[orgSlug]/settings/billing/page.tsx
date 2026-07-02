"use client";

/**
 * Billing page — all features are free. This page exists only as a
 * fallback for any deep links. Redirect to members.
 */
export default function BillingSettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-sm text-muted-foreground">
        Todas las funciones son gratuitas. No hay planes ni facturación.
      </p>
    </div>
  );
}
