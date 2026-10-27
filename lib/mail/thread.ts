import type { MailPerson } from "@/components/mail/recipient-picker"

type ThreadPerson = {
  id?: string
  name?: string
  email?: string | null
  type?: string
}

type ThreadMail = {
  sender_id?: string
  recipient_id?: string
  from?: string
  from_email?: string | null
  to?: string
  subject?: string
  content?: string
  body?: string
  preview?: string
  category?: string
  recipients?: ThreadPerson[]
  sender?: { id?: string; name?: string; email?: string | null }
}

export function threadSubject(subject: string | undefined, mode: "reply" | "forward") {
  const value = (subject || "").trim()
  const base = value || "(No subject)"
  const prefix = mode === "reply" ? "re:" : "fwd:"
  return base.toLowerCase().startsWith(prefix) ? base : `${mode === "reply" ? "Re" : "Fwd"}: ${base}`
}

export function threadQuote(from: string | undefined, body: string | undefined) {
  const text = (body || "").trim()
  const who = (from || "someone").trim()
  return `\n\n--- Original message from ${who} ---\n${text}`
}

export function replyAudience(mail: ThreadMail, currentUserId?: string | null): MailPerson[] {
  const me = currentUserId ? String(currentUserId) : ""
  const people: MailPerson[] = []
  const seen = new Set<string>()

  const add = (id?: string, name?: string, email?: string | null) => {
    if (!id || seen.has(id) || (me && id === me)) return
    seen.add(id)
    people.push({
      id,
      name: (name || email || "Recipient").trim(),
      email: email || undefined,
    })
  }

  add(mail.sender?.id || mail.sender_id, mail.sender?.name || mail.from, mail.sender?.email || mail.from_email)

  for (const person of mail.recipients || []) {
    if (person.type && person.type !== "to" && person.type !== "cc") continue
    add(person.id, person.name, person.email)
  }

  if (people.length === 0) {
    add(mail.recipient_id, mail.to)
  }

  return people
}
