import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/commerce/security";
import { AdminDashboard } from "@/components/admin-dashboard";
export const dynamic="force-dynamic";
export default async function Page({params}:{params:Promise<{id:string}>}){let admin;try{admin=await requireAdmin(true);}catch{redirect("/admin/login/");}if(admin.must_change_password)redirect("/admin/change-password/");return <AdminDashboard orderId={(await params).id}/>;}
