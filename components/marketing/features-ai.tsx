import { Crosshair, FileText, MessagesSquare, Workflow } from "lucide-react";
import { FeatureBullet } from "@/components/marketing/feature-bullet";
import { MockAiChat } from "@/components/marketing/mock-ai-chat";
import { Section, SectionHeading } from "@/components/marketing/section";

export function FeaturesAi() {
  return (
    <Section id="ai" className="overflow-hidden">
      {/* A single restrained glow distinguishes the AI section. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(ellipse_50%_40%_at_70%_20%,color-mix(in_oklch,var(--foreground),transparent_95%),transparent)]"
      />
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <MockAiChat className="order-last lg:order-first" />
        <div>
          <SectionHeading
            eyebrow="03 · Agente IA"
            title="Un agente de IA en tu equipo"
            lede="El agente de PANEL STYT trabaja dentro de tu espacio con herramientas con permisos de la organización — crea tareas, resume ciclos y detecta duplicados al instante."
          />
          <div className="mt-10 grid gap-7 sm:grid-cols-2">
            <FeatureBullet
              icon={MessagesSquare}
              title="Chat con contexto"
              description="Conoce tus equipos, ciclos y backlog — las respuestas provienen de tus datos reales."
            />
            <FeatureBullet
              icon={Workflow}
              title="Acciones, no solo palabras"
              description="Crea, actualiza y busca tareas con los mismos permisos que cualquier miembro de la organización."
            />
            <FeatureBullet
              icon={FileText}
              title="Reportes bajo demanda"
              description="Genera resúmenes de ciclos y reportes de estado a partir de la actividad real del equipo."
            />
            <FeatureBullet
              icon={Crosshair}
              title="Detección de duplicados"
              description="Búsqueda semántica inteligente para alertar sobre tareas duplicadas al instante de crearse."
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
