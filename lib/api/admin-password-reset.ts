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
