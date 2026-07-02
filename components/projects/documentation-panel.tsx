"use client";

import { useState } from "react";
import {
  FileText,
  Link2,
  ExternalLink,
  Plus,
  X,
  FileCode,
  Palette,
  LayoutGrid,
} from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function getDocIcon(url?: string, type?: string) {
  if (type === "note") return <FileText className="size-3.5 text-muted-foreground" />;
  if (!url) return <FileText className="size-3.5 text-muted-foreground" />;
  if (url.includes("notion.so"))
    return <LayoutGrid className="size-3.5 text-muted-foreground" />;
  if (url.includes("figma.com"))
    return <Palette className="size-3.5 text-muted-foreground" />;
  if (url.includes("github.com"))
    return <FileCode className="size-3.5 text-muted-foreground" />;
  return <Link2 className="size-3.5 text-muted-foreground" />;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export function DocumentationPanel({ entityId }: { entityId: string }) {
  const documents = useQuery(api.documents.listForEntity, { entityId });
  const removeDocument = useMutation(api.documents.remove);
  const [addOpen, setAddOpen] = useState(false);
  const [addType, setAddType] = useState<"link" | "note">("link");

  if (documents === undefined) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground">
          Documentación
        </h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 text-xs text-muted-foreground"
            >
              <Plus className="size-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-44 p-1">
            <button
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => {
                setAddType("link");
                setAddOpen(true);
              }}
            >
              <Link2 className="size-3.5" />
              Añadir enlace
            </button>
            <button
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => {
                setAddType("note");
                setAddOpen(true);
              }}
            >
              <FileText className="size-3.5" />
              Añadir nota
            </button>
          </PopoverContent>
        </Popover>
      </div>

      {documents.length === 0 ? (
        <p className="text-xs text-muted-foreground py-1">
          Sin documentación adjunta.
        </p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {documents.map((doc) => (
            <DocRow
              key={doc._id}
              doc={doc}
              onRemove={() => {
                removeDocument({ documentId: doc._id }).catch(() =>
                  toast.error("Error al eliminar")
                );
              }}
            />
          ))}
        </div>
      )}

      <AddDocDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        type={addType}
        entityId={entityId}
      />
    </div>
  );
}

function DocRow({
  doc,
  onRemove,
}: {
  doc: Doc<"projectDocuments">;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isNote = doc.type === "note";

  return (
    <div
      className={`group flex items-center gap-2 rounded px-1.5 py-1 text-xs transition-colors hover:bg-accent/40 ${
        isNote ? "cursor-pointer" : ""
      }`}
      onClick={() => isNote && setExpanded(!expanded)}
    >
      {getDocIcon(doc.url, doc.type)}
      <div className="min-w-0 flex-1">
        {doc.url && !isNote ? (
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 truncate text-foreground hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="truncate">{doc.title}</span>
            <ExternalLink className="size-2.5 shrink-0 text-muted-foreground" />
          </a>
        ) : (
          <span className="truncate text-foreground">{doc.title}</span>
        )}
        {doc.url && !isNote && (
          <span className="block truncate text-[10px] text-muted-foreground">
            {getDomain(doc.url)}
          </span>
        )}
      </div>
      <button
        className="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <X className="size-3" />
      </button>
      {isNote && expanded && doc.content && (
        <div className="col-span-full mt-1 rounded border bg-muted/30 p-2 text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {doc.content}
        </div>
      )}
    </div>
  );
}

function AddDocDialog({
  open,
  onOpenChange,
  type,
  entityId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "link" | "note";
  entityId: string;
}) {
  const createDocument = useMutation(api.documents.create);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await createDocument({
        entityId,
        title: title.trim(),
        url: type === "link" ? url.trim() || undefined : undefined,
        content: type === "note" ? content.trim() || undefined : undefined,
        type,
      });
      toast.success(type === "link" ? "Enlace añadido" : "Nota creada");
      onOpenChange(false);
      setTitle("");
      setUrl("");
      setContent("");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium text-muted-foreground">
            {type === "link" ? "Añadir enlace" : "Añadir nota"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Input
            autoFocus
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-none px-0 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
          {type === "link" ? (
            <Input
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="border-none px-0 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
            />
          ) : (
            <Textarea
              placeholder="Escribir nota…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-24 resize-none border-none px-0 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
            />
          )}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            size="sm"
            disabled={!title.trim() || submitting}
            onClick={() => void handleSubmit()}
          >
            {type === "link" ? "Añadir" : "Crear nota"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
