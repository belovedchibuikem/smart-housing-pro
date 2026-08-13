/** Helpers for module pages when approve/reject returns a Digital Office workflow redirect. */

export type WorkflowRedirectPayload = {
  href?: string
  workflow_instance_id?: string
  office_case_id?: string
  message?: string
}

export function digitalOfficeHrefFromResponse(data: any): string | null {
  if (!data) return null
  if (typeof data.href === "string" && data.href) return data.href
  if (data.data?.href) return String(data.data.href)
  if (data.office_case_id) return `/admin/office/cases/${data.office_case_id}`
  if (data.data?.office_case_id) return `/admin/office/cases/${data.data.office_case_id}`
  if (data.workflow_instance_id || data.data?.workflow_instance_id) {
    return "/admin/office/workflow/queue"
  }
  return null
}

export function isWorkflowRedirectResponse(payload: any): boolean {
  return Boolean(digitalOfficeHrefFromResponse(payload))
}

/** Prefer sonner-style toast APIs that support `action`. */
export function toastWorkflowOrSuccess(
  toastApi: {
    success: (title: string, opts?: any) => void
    message?: (title: string, opts?: any) => void
    error: (title: string, opts?: any) => void
  },
  response: any,
  successTitle: string,
  successFallbackDescription: string,
): boolean {
  const href = digitalOfficeHrefFromResponse(response)
  if (href || response?.data?.workflow_instance_id) {
    const opts = {
      description: response?.message || "Complete review/approval in Digital Office",
      action: {
        label: "Open",
        onClick: () => {
          window.location.href = href || "/admin/office/workflow/queue"
        },
      },
    }
    toastApi.success("Sent to Digital Office", opts)
    return true
  }

  toastApi.success(successTitle, {
    description: response?.message || successFallbackDescription,
  })
  return false
}

export function toastWorkflowError(
  toastApi: {
    message?: (title: string, opts?: any) => void
    error: (title: string, opts?: any) => void
  },
  error: any,
  fallbackTitle: string,
): void {
  const href =
    digitalOfficeHrefFromResponse(error?.data) ||
    digitalOfficeHrefFromResponse(error?.response?.data) ||
    error?.data?.href
  if (error?.status === 409 || href) {
    const opts = {
      action: {
        label: "Open",
        onClick: () => {
          window.location.href = href || "/admin/office/workflow/queue"
        },
      },
    }
    if (toastApi.message) {
      toastApi.message(error?.message || "Use Digital Office", opts)
    } else {
      toastApi.error(error?.message || "Use Digital Office", opts)
    }
    return
  }

  toastApi.error(fallbackTitle, {
    description: error?.message || "Please try again later",
  })
}
