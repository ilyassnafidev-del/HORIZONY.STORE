import { OrderExperience } from "@/components/order-experience";
export const metadata={title:"Order status",robots:{index:false,follow:false}};
export const dynamic="force-dynamic";
export default async function Page({params}:{params:Promise<{id:string}>}){return <OrderExperience id={(await params).id}/>;}
