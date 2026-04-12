/** Shared Tailwind classes for native inputs used with `react-hook-form` until `Input` exists in `components/ui`. */
export const formFieldInputClass =
  "mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm outline-none ring-violet-500/40 transition focus:border-violet-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";

export function formFieldInputInvalidClass(invalid: boolean) {
  return invalid
    ? "border-red-500 focus:border-red-500 focus:ring-red-500/30 dark:border-red-600"
    : "";
}
