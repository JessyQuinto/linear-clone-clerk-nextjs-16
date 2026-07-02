import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/marketing/kbd";
import { MockApp } from "@/components/marketing/mock-app";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Faint blueprint grid, fading out from the top center. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_75%_60%_at_50%_0%,black_30%,transparent)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,color-mix(in_oklch,var(--foreground),transparent_94%),transparent)]"
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 pt-20 text-center md:pt-28">
        <h1 className="mt-8 max-w-3xl text-5xl font-semibold tracking-tighter text-balance md:text-7xl">
          El gestor de tareas diseñado para la velocidad
        </h1>
        <p className="mt-6 max-w-xl text-base text-balance text-muted-foreground md:text-lg">
          PANEL STYT es la plataforma interna para planificar, hacer seguimiento y entregar proyectos de manera ágil — con tareas, tableros y ciclos en un espacio optimizado para teclado y asistido por IA.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button size="lg" className="h-10 px-5" asChild>
            <Link href="/onboarding">
              Ingresar al panel
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <p className="mt-4 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
          Espacio de trabajo interno · Presioná
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
          en cualquier lado
        </p>
      </div>

      <div className="relative mx-auto mt-14 w-full max-w-6xl px-6 md:mt-20">
        <MockApp />
        {/* Fade the bottom of the screenshot into the next section. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -bottom-px h-28 bg-linear-to-t from-background to-transparent"
        />
      </div>
    </section>
  );
}
