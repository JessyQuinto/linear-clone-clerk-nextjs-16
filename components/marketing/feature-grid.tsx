import {
  AtSign,
  Boxes,
  ListFilter,
  Paperclip,
  Search,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Section, SectionHeading } from "@/components/marketing/section";

const FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Search,
    title: "Búsqueda completa",
    description:
      "Encontrá cualquier tarea por título o descripción en milisegundos, dentro de tu espacio.",
  },
  {
    icon: ListFilter,
    title: "Vistas guardadas",
    description:
      "Filtrá el backlog por estado, responsable o etiqueta, y guardá la vista para tu equipo.",
  },
  {
    icon: Paperclip,
    title: "Archivos adjuntos",
    description:
      "Arrastrá logs, capturas de pantalla y especificaciones directamente en la tarea.",
  },
  {
    icon: AtSign,
    title: "Menciones e hilos",
    description:
      "Sumá a la persona correcta al debate con menciones que notifican de inmediato.",
  },
  {
    icon: Users,
    title: "Presencia en vivo",
    description:
      "Mirá quién está viendo una tarea en tiempo real para no solapar ediciones ni decisiones.",
  },
  {
    icon: Boxes,
    title: "Espacios multi-equipo",
    description:
      "Cada equipo tiene su propia clave, tablero y ciclos de trabajo independiente.",
  },
];

export function FeatureGrid() {
  return (
    <Section>
      <SectionHeading
        eyebrow="05 · Todo lo demás"
        title="Toda la potencia, nada de relleno"
        lede="Las herramientas que esperás de un gestor profesional — integradas, veloces y listas para usar."
        align="center"
      />
      <div className="mt-14 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="group bg-background p-6 transition-colors hover:bg-muted/40"
          >
            <span className="flex size-8 items-center justify-center rounded-md border bg-muted/50 transition-colors group-hover:border-ring/50">
              <Icon className="size-4 text-foreground/80" />
            </span>
            <h3 className="mt-4 text-sm font-medium">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
