import { Kbd } from "@/components/marketing/kbd";
import { MockCommandPalette } from "@/components/marketing/mock-command-palette";
import { Section, SectionHeading } from "@/components/marketing/section";

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["⌘", "K"], label: "Paleta de comandos" },
  { keys: ["C"], label: "Crear tarea" },
  { keys: ["A"], label: "Asignar responsable" },
  { keys: ["L"], label: "Agregar etiqueta" },
  { keys: ["B"], label: "Abrir tablero" },
  { keys: ["⌘", "J"], label: "Consultar al agente" },
];

export function FeaturesKeyboard() {
  return (
    <Section id="keyboard">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="04 · Optimizado para Teclado"
            title="Tus manos nunca dejan el teclado"
            lede="Todo en PANEL STYT es un comando. Una sola paleta, atajos rápidos de una tecla y cero fricción entre idear y ejecutar."
          />
          <div className="mt-10 space-y-2.5">
            {SHORTCUTS.map((shortcut) => (
              <div
                key={shortcut.label}
                className="flex h-9 items-center justify-between rounded-lg border bg-card/50 px-3 text-sm"
              >
                <span className="text-foreground/90">{shortcut.label}</span>
                <span className="flex items-center gap-1">
                  {shortcut.keys.map((key) => (
                    <Kbd key={key}>{key}</Kbd>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 scale-110 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,color-mix(in_oklch,var(--foreground),transparent_94%),transparent)]"
          />
          <MockCommandPalette className="mx-auto max-w-md" />
        </div>
      </div>
    </Section>
  );
}
