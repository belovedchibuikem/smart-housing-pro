import { apiFetch } from "@/lib/api/client"

export async function adminSetTemporaryPassword(
  userId: string,
  password: string,
  passwordConfirmation: string,
) {
  return apiFetch<{ success: boolean; message: string }>(`/admin/users/${userId}/password/temporary`, {
    method: "POST",
    body: JSON.stringify({
      password,
      password_confirmation: passwordConfirmation,
    }),
  })
}

export async function adminSendPasswordResetOtp(userId: string) {
  return apiFetch<{ success: boolean; message: string }>(
    `/admin/users/${userId}/password/send-reset-otp`,
    { method: "POST", body: JSON.stringify({}) },
  )
}

export async function adminSetMemberTemporaryPassword(
  memberId: string,
  password: string,
  passwordConfirmation: string,
) {
  return apiFetch<{ success: boolean; message: string }>(
    `/admin/members/${memberId}/password/temporary`,
    {
      method: "POST",
      body: JSON.stringify({
        password,
        password_confirmation: passwordConfirmation,
      }),
    },
  )
}

export async function adminSendMemberPasswordResetOtp(memberId: string) {
  return apiFetch<{ success: boolean; message: string }>(
    `/admin/members/${memberId}/password/send-reset-otp`,
    { method: "POST", body: JSON.stringify({}) },
  )
}

export type AdminCredentialRow = {
  user_id: string
  name: string
  email: string
  phone?: string | null
  roles: string
  temporary_password: string
}

export async function exportAdminCredentialsDispatch(body: {
  confirm: boolean
  user_ids?: string[]
  search?: string
  role?: string
  status?: string
  format?: "json" | "csv"
}) {
  return apiFetch<{
    success: boolean
    message: string
    data: {
      tenant: string
      login_url: string
      generated_at: string
      count: number
      credentials: AdminCredentialRow[]
    }
  }>("/admin/users/credentials-dispatch", {
    method: "POST",
    body: {
      confirm: body.confirm,
      user_ids: body.user_ids,
      search: body.search,
      role: body.role,
      status: body.status,
      format: body.format || "json",
    },
  })
}
