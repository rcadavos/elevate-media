"use client";

import * as React from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ClientProfilePhotoKind = "business_logo" | "avatar";

type ClientProfilePhotoSlotProps = {
  kind: ClientProfilePhotoKind;
  url: string | null | undefined;
  disabled?: boolean;
  onPickFile: (file: File) => Promise<void>;
  variant: "square" | "round";
  /** 24×24 control (icon-only empty state); for small avatar beside label rows. */
  compact?: boolean;
  /** Overrides default upload control label for assistive tech. */
  uploadAriaLabel?: string;
};

export function ClientProfilePhotoSlot({
  kind,
  url,
  disabled,
  onPickFile,
  variant,
  compact = false,
  uploadAriaLabel,
}: ClientProfilePhotoSlotProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const hasPhoto = Boolean(url?.trim());

  const openPicker = () => {
    if (disabled || busy) return;
    setError(null);
    inputRef.current?.click();
  };

  const onInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      await onPickFile(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const frameClass = compact
    ? variant === "round"
      ? "size-6 rounded-full"
      : "size-6 rounded-lg"
    : variant === "round"
      ? "size-24 rounded-full"
      : "size-24 rounded-lg";

  return (
    <div className={cn("space-y-1.5", compact && "space-y-1")}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={onInputChange}
        aria-label={
          uploadAriaLabel ??
          (kind === "business_logo"
            ? "Upload business logo"
            : "Upload client avatar")
        }
      />
      <button
        type="button"
        disabled={disabled || busy}
        onClick={openPicker}
        className={cn(
          "relative flex overflow-hidden border border-dashed border-border bg-muted/30 text-muted-foreground outline-none transition-colors",
          "hover:border-primary/40 hover:bg-muted/50 hover:text-foreground",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:opacity-50",
          compact ? "shrink-0" : "w-full max-w-[10rem]",
          frameClass,
        )}
      >
        {busy ? (
          <span className="flex size-full items-center justify-center bg-background/80">
            <Loader2
              className={cn(
                "animate-spin text-primary",
                compact ? "size-3" : "size-6",
              )}
              aria-hidden
            />
            <span className="sr-only">Uploading…</span>
          </span>
        ) : hasPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote Supabase public URL
          <img
            src={url!}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <span
            className={cn(
              "flex size-full items-center justify-center text-center",
              !compact && "flex-col gap-1 px-2",
            )}
          >
            <ImagePlus
              className={cn("shrink-0 opacity-80", compact ? "size-3" : "size-6")}
              aria-hidden
            />
            {!compact ? (
              <span className="text-[10px] font-medium leading-tight">
                Add photo
              </span>
            ) : null}
          </span>
        )}
      </button>
      {error ? (
        <p
          className={cn(
            "text-xs text-destructive",
            compact ? "max-w-[12rem]" : "max-w-[10rem]",
          )}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
