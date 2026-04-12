"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DIRECTORY_ROLES,
  DIRECTORY_ROLE_LABELS,
} from "@/lib/constants/directory-roles";

function linkClass(active: boolean) {
  return [
    "rounded-lg px-3 py-2 text-sm font-medium transition",
    active
      ? "bg-violet-600 text-white shadow-sm"
      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
  ].join(" ");
}

export function AdminSidebar() {
  const pathname = usePathname();
  const dashboardActive =
    pathname === "/admin" || pathname.startsWith("/admin?");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          elev8temedia
        </p>
        <p className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Admin
        </p>
      </div>

      <nav className="flex flex-col gap-1" aria-label="Admin">
        <Link href="/admin" className={linkClass(dashboardActive)}>
          Dashboard
        </Link>
      </nav>

      <div>
        <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          Directory
        </p>
        <ul className="flex flex-col gap-0.5">
          {DIRECTORY_ROLES.map((role) => {
            const href = `/admin/directory/${role}`;
            const active = pathname === href;
            return (
              <li key={role}>
                <Link href={href} className={linkClass(active)}>
                  {DIRECTORY_ROLE_LABELS[role]}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-auto border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <Link
          href="/dashboard"
          className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          Team workspace
        </Link>
        <form action="/auth/signout" method="post" className="mt-1">
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
