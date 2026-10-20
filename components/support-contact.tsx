import { siteConfig } from "@/lib/config";

export function SupportContact({ className }: { className?: string }) {
  return (
    <a className={className} href={siteConfig.supportWhatsappUrl}>
      WhatsApp: {siteConfig.supportWhatsappNumber}
    </a>
  );
}
