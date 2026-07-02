import type { Metadata } from "next";
import { Cta } from "@/components/marketing/cta";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { FeaturesAi } from "@/components/marketing/features-ai";
import { FeaturesBoard } from "@/components/marketing/features-board";
import { FeaturesIssues } from "@/components/marketing/features-issues";
import { FeaturesKeyboard } from "@/components/marketing/features-keyboard";
import { Footer } from "@/components/marketing/footer";
import { Hero } from "@/components/marketing/hero";

export const metadata: Metadata = {
  title: "PANEL STYT — El gestor de tareas diseñado para la velocidad",
  description:
    "Planificá, hacé seguimiento y entregá con tareas, tableros y ciclos en un espacio de trabajo diseñado para teclado — con un agente de IA que se encarga del trabajo rutinario.",
};

export default function LandingPage() {
  return (
    <>
      <main>
        <Hero />
        <FeaturesIssues />
        <FeaturesBoard />
        <FeaturesAi />
        <FeaturesKeyboard />
        <FeatureGrid />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
