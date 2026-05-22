import type { ReactNode } from "react"
import { SaasFavicon } from "@/components/saas/saas-favicon"
import { SaaSFooter } from "@/components/saas/saas-footer"

export default function SaasLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SaasFavicon />
      {children}
      <SaaSFooter />
    </>
  )
}
