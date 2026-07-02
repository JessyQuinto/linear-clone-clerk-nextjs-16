import { redirect } from "next/navigation";

/** All features are free — pricing page redirects to the home page. */
export default function PricingPage() {
  redirect("/");
}
