"use client";

import * as React from "react";
import { Check, ChevronDown, Clipboard, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Sop, SopCategory, SopStep } from "@/lib/types/agency";
import { cn } from "@/lib/utils";

function CategoryBadge({ category }: { category: SopCategory | undefined }) {
  if (!category) return null;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-black/5 dark:ring-white/10"
      style={{ backgroundColor: category.initial, color: category.accent }}
    >
      <span aria-hidden>{category.emoji}</span>
      {category.name}
    </span>
  );
}

function TemplateBlock({ template }: { template: string }) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(template);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="mt-2 rounded-md border border-border bg-muted/40">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-1.5">
        <span className="text-xs font-medium text-muted-foreground">Message template</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={copy}
          aria-label="Copy message template"
        >
          {copied ? (
            <ClipboardCheck className="size-3.5 shrink-0 text-primary" aria-hidden />
          ) : (
            <Clipboard className="size-3.5 shrink-0" aria-hidden />
          )}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap px-3 py-2.5 font-sans text-xs leading-relaxed text-muted-foreground">
        {template}
      </pre>
    </div>
  );
}

function StepRow({ step, index }: { step: SopStep; index: number }) {
  const [checked, setChecked] = React.useState(step.checked);
  const [showTemplate, setShowTemplate] = React.useState(false);

  return (
    <li className="flex gap-3 py-3 first:pt-0 last:pb-0">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={`Mark step ${index + 1} done`}
        onClick={() => setChecked((v) => !v)}
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background hover:border-foreground/30",
        )}
      >
        {checked ? <Check className="size-3.5" aria-hidden /> : null}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm leading-relaxed",
            checked ? "text-muted-foreground line-through" : "text-foreground",
          )}
        >
          {step.body}
        </p>
        {step.template ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-1 -ml-2 gap-1 text-xs text-muted-foreground"
              aria-expanded={showTemplate}
              onClick={() => setShowTemplate((v) => !v)}
            >
              <ChevronDown
                className={cn(
                  "size-3.5 shrink-0 transition-transform",
                  showTemplate && "rotate-180",
                )}
                aria-hidden
              />
              {showTemplate ? "Hide template" : "View template"}
            </Button>
            {showTemplate ? <TemplateBlock template={step.template} /> : null}
          </>
        ) : null}
      </div>
    </li>
  );
}

function SopCard({
  sop,
  category,
  defaultOpen,
}: {
  sop: Sop;
  category: SopCategory | undefined;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const panelId = `sop-panel-${sop.id}`;
  const templateCount = sop.steps.filter((s) => s.template).length;

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-1 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground">{sop.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {sop.steps.length} steps
            {templateCount > 0 ? ` · ${templateCount} message templates` : ""}
          </p>
        </div>
        <CategoryBadge category={category} />
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {open ? (
        <div id={panelId} className="border-t border-border px-4 pt-3">
          <ol className="divide-y divide-border">
            {sop.steps.map((step, i) => (
              <StepRow key={step.id} step={step} index={i} />
            ))}
          </ol>
        </div>
      ) : null}
    </Card>
  );
}

export function SopsView({
  sops,
  categories,
}: {
  sops: Sop[];
  categories: SopCategory[];
}) {
  const [activeCategory, setActiveCategory] = React.useState<string>("all");
  const categoryById = React.useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  const visible = sops.filter(
    (s) => activeCategory === "all" || s.categoryId === activeCategory,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by category">
        <Button
          type="button"
          variant={activeCategory === "all" ? "default" : "outline"}
          size="sm"
          aria-pressed={activeCategory === "all"}
          onClick={() => setActiveCategory("all")}
          className="rounded-full"
        >
          All
        </Button>
        {categories.map((c) => {
          const active = activeCategory === c.id;
          return (
            <Button
              key={c.id}
              type="button"
              variant={active ? "default" : "outline"}
              size="sm"
              aria-pressed={active}
              onClick={() => setActiveCategory(c.id)}
              className="gap-1.5 rounded-full"
            >
              <span aria-hidden>{c.emoji}</span>
              {c.name}
            </Button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        {visible.map((sop, i) => (
          <SopCard
            key={sop.id}
            sop={sop}
            category={categoryById.get(sop.categoryId)}
            defaultOpen={i === 0 && activeCategory === "all"}
          />
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground" role="status">
          No playbooks in this category yet.
        </p>
      ) : null}
    </div>
  );
}
