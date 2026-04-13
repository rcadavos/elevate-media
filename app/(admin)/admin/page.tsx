import { redirect } from "next/navigation";
import { ADMIN_HOME_PATH } from "@/lib/auth/post-sign-in-redirect";

export default function AdminIndexPage() {
  redirect(ADMIN_HOME_PATH);
}
