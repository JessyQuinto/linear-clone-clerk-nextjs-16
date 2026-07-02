import { LayoutGrid, RefreshCcw, Target, TrendingUp } from "lucide-react";
import { FeatureBullet } from "@/components/marketing/feature-bullet";
import { MockBoard } from "@/components/marketing/mock-board";
import { MockCycle } from "@/components/marketing/mock-cycle";
import { Section, SectionHeading } from "@/components/marketing/section";

export function FeaturesBoard() {
  return (
    <Section id="cycles">
      <SectionHeading
        eyebrow="02 · Tableros y Ciclos"
        title="Progreso real que podés medir"
        lede="Arrastrá tareas en un tablero fluido, planificá tu trabajo en ciclos numerados automáticamente y observá el progreso actualizarse en vivo."
        align="center"
      />
      <div className="mt-14 grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
        <MockBoard />
        <div className="space-y-6">
          <MockCycle />
          <div className="grid gap-6 rounded-xl border bg-card/50 p-5">
            <FeatureBullet
              icon={LayoutGrid}
              title="Un tablero que acompaña tu ritmo"
              description="El ordenamiento fraccional asegura que las tareas caigan exactamente donde las soltás, sin conflictos."
            />
            <FeatureBullet
              icon={RefreshCcw}
              title="Ciclos automatizados"
              description="Sprints de duración definida con numeración automática. El trabajo pendiente se traslada al siguiente período por su cuenta."
            />
            <FeatureBullet
              icon={TrendingUp}
              title="Métricas autocomputadas"
              description="El alcance y los porcentajes de completado se derivan directamente del estado de las tareas, sin ajustes manuales."
            />
            <FeatureBullet
              icon={Target}
              title="Proyectos unificados"
              description="Agrupá tareas en torno a objetivos específicos y medí el avance de tus proyectos desde una sola pantalla corporativa."
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
