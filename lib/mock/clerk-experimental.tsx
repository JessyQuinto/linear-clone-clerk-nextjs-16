/* eslint-disable */
/**
 * Mock implementation of Clerk experimental billing components.
 * Renders fully styled buttons that trigger dummy success toasts to simulate billing transactions.
 */

import React from "react";
import { toast } from "sonner";
import { getTable, updateRow } from "./db";

export function CheckoutButton({ children, className, plan }: any) {
  const handleUpgrade = () => {
    const org = getTable("organizations")[0];
    if (org) {
      updateRow("organizations", org._id, { plan: "pro" });
      toast.success("Workspace upgraded to Pro! (Mock transaction completed)");
    } else {
      toast.success(`Checkout simulated for plan ID: ${plan}`);
    }
  };

  return (
    <button onClick={handleUpgrade} className={className}>
      {children}
    </button>
  );
}

export function PlanDetailsButton({ children, className }: any) {
  return <div className={className}>{children}</div>;
}

export function SubscriptionDetailsButton({ children, className }: any) {
  return <div className={className}>{children}</div>;
}
