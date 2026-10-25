import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/commerce/security";
import { AdminAuth } from "@/components/admin-auth";
export const dynamic="force-dynamic";
export default async function Page(){try{await requireAdmin(true);}catch{redirect("/admin/login/");}return <AdminAuth change/>;}
