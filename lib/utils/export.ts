import { getApiBaseUrl, getAuthToken, getTenantSlug } from "@/lib/api/client"

/**
 * Helper function to export reports as PDF or Excel
 */
export async function exportReport(
  reportType: string,
  format: "PDF" | "Excel",
  params: Record<string, any> = {}
): Promise<void> {
  const token = getAuthToken()
  const tenantSlug = getTenantSlug()
  const apiBaseUrl = getApiBaseUrl()

  if (!token) {
    throw new Error("Authentication required")
  }

  // Map report types to export endpoints
  const endpointMap: Record<string, string> = {
    contributions: "contributions",
    "equity-contributions": "equity-contributions",
    investments: "investments",
    loans: "loans",
    properties: "properties",
    "financial-summary": "financial-summary",
    mortgages: "mortgages",
  }

  const endpoint = endpointMap[reportType] || reportType
  const formatParam = format.toLowerCase() === "pdf" ? "pdf" : "excel"

  const queryParams = new URLSearchParams({
    format: formatParam,
    ...Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== "")
    ),
  })

  // Member reports are under /user/reports/ prefix
  const url = `${apiBaseUrl}/user/reports/${endpoint}/export?${queryParams.toString()}`

  try {
    const headers: HeadersInit = {
      Authorization: `Bearer ${token}`,
    }

    if (tenantSlug) {
      headers["X-Tenant-Slug"] = tenantSlug
    }

    const response = await fetch(url, {
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = "Export failed"
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.message || errorMessage
      } catch {
        errorMessage = errorText || errorMessage
      }
      throw new Error(errorMessage)
    }

    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = downloadUrl
    const extension = format.toLowerCase() === "pdf" ? "pdf" : "xlsx"
    link.download = `${reportType}-report-${new Date().toISOString().split("T")[0]}.${extension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error: any) {
    throw new Error(error.message || "Failed to export report")
  }
}

