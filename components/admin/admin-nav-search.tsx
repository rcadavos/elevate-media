"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  filterAdminNavSearchItems,
  type AdminNavSearchItem,
} from "@/lib/admin/nav-search-registry";

export type AdminNavSearchProps = {
  className?: string;
  /** When Escape is pressed with an empty query, collapse parent mobile chrome instead of only closing the panel. */
  onDismissChrome?: () => void;
  autoFocus?: boolean;
};

export function AdminNavSearch({
  className,
  onDismissChrome,
  autoFocus,
}: AdminNavSearchProps) {
  const router = useRouter();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const listId = React.useId();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);

  const trimmed = query.trim();
  const results =
    trimmed.length > 0 ? filterAdminNavSearchItems(trimmed) : ([] as AdminNavSearchItem[]);

  const showPanel = open && trimmed.length > 0;
  const resultCount = results.length;

  React.useEffect(() => {
    if (!showPanel || resultCount === 0) {
      setActiveIndex(-1);
      return;
    }
    setActiveIndex((i) => {
      if (i < 0) return -1;
      return Math.min(i, resultCount - 1);
    });
  }, [showPanel, resultCount]);

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = containerRef.current;
      if (!el || el.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const resetSearchUi = React.useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
  }, []);

  const goToHref = React.useCallback(
    (href: string) => {
      resetSearchUi();
      router.push(href);
    },
    [resetSearchUi, router],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      if (showPanel) {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (trimmed.length === 0 && onDismissChrome) {
        e.preventDefault();
        onDismissChrome();
        return;
      }
    }

    if (!showPanel) return;

    if (results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0 && activeIndex < results.length) {
      e.preventDefault();
      goToHref(results[activeIndex]!.href);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full min-w-0", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 z-[1] size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        name="q"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={showPanel ? listId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={
          showPanel && activeIndex >= 0
            ? `${listId}-option-${results[activeIndex]?.id}`
            : undefined
        }
        placeholder="Search clients, directory, pages…"
        className="w-full pl-10"
        aria-label="Search workspace"
        autoComplete="off"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        autoFocus={autoFocus}
      />

      {showPanel ? (
        <div
          id={listId}
          className="absolute left-0 right-0 top-[calc(100%+0.25rem)] z-50 max-h-[min(22rem,70dvh)] overflow-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-lg"
        >
          {results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted-foreground" role="status">
              No data available
            </p>
          ) : (
            <ul className="py-1" role="listbox" aria-label="Search suggestions">
              {results.map((item, index) => {
                const active = index === activeIndex;
                return (
                  <li key={item.id} role="presentation">
                    <Link
                      id={`${listId}-option-${item.id}`}
                      role="option"
                      aria-selected={active}
                      href={item.href}
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={resetSearchUi}
                      className={cn(
                        "flex flex-col gap-0.5 px-3 py-2.5 text-left text-sm outline-none transition-colors",
                        active
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-muted/80",
                      )}
                    >
                      <span className="font-medium text-foreground">{item.title}</span>
                      {item.subtitle ? (
                        <span className="text-xs text-muted-foreground">
                          {item.subtitle}
                        </span>
                      ) : null}
                      <span className="truncate font-mono text-[11px] text-muted-foreground/90">
                        {item.href}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
