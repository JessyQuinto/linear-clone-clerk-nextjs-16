import { Activity, AtSign, GitBranch, Zap } from "lucide-react";
import { FeatureBullet } from "@/components/marketing/feature-bullet";
import { MockIssueDetail } from "@/components/marketing/mock-issue-detail";
import { Section, SectionHeading } from "@/components/marketing/section";

export function FeaturesIssues() {
  return (
    <Section id="issues">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="01 · Tareas"
            title="Tareas que fluyen a la velocidad del pensamiento"
            lede="Creá en segundos, priorizá con atajos rápidos y olvidate de recargar — cada cambio se sincroniza con tu equipo en tiempo real."
          />
          <div className="mt-10 grid gap-7 sm:grid-cols-2">
            <FeatureBullet
              icon={Zap}
              title="Rápido por defecto"
              description="Actualizaciones optimistas inmediatas. Sin esperas entre vos y tu trabajo."
            />
            <FeatureBullet
              icon={GitBranch}
              title="Sub-tareas y relaciones"
              description="Dividí el trabajo, marcá bloqueadores o duplicados, y mantené visible cada dependencia."
            />
            <FeatureBullet
              icon={AtSign}
              title="Comentarios y menciones"
              description="El debate vive en la tarea — mencioná a un compañero para sumarlo al hilo al instante."
            />
            <FeatureBullet
              icon={Activity}
              title="Historial de auditoría"
              description="Cada cambio de estado, asignación y edición se registra de forma automática."
            />
          </div>
        </div>
        <MockIssueDetail />
      </div>
    </Section>
  );
}
