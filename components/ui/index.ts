/**
 * shadcn/ui primitives (registry: base-nova, Tailwind v4). Prefer `@/components/ui`.
 * Add components with: `npx shadcn@latest add <name> -y`
 *
 * Re-exports use `@/components/ui/...` (not `./...`) so resolution stays stable with
 * `paths` + `moduleResolution: "bundler"` across editors and OSes.
 */
export { Alert, AlertTitle, AlertDescription, AlertAction } from "@/components/ui/alert";
export { Button, buttonVariants } from "@/components/ui/button";
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
export { Input } from "@/components/ui/input";
export { Label } from "@/components/ui/label";
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
export {
  Sidebar,
  SidebarBody,
  SidebarBrand,
  SidebarNav,
  SidebarSection,
  SidebarMenu,
  SidebarFooter,
  SidebarAccountMenu,
} from "@/components/ui/sidebar";
export type { SidebarAccountMenuProps } from "@/components/ui/sidebar";
