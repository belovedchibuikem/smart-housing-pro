export interface SubscriptionCertificatePayload {
	certificate_number: string
	certificate_type?: "payment_completion" | "ownership" | string
	issue_date: string
	organization_name?: string | null
	organization_tagline?: string | null
	property: {
		title: string
		address?: string | null
		unit_address?: string | null
		slot_label?: string | null
		city?: string | null
		state?: string | null
		price: number
	}
	member: {
		name: string
		member_id: string
		email?: string | null
	}
	amount_paid?: number
	allocation_date?: string | null
	sold_at?: string | null
	completion_date?: string
	owner_label?: string | null
}

function formatCurrency(amount?: number) {
	const value = Number.isFinite(amount) ? Number(amount) : 0
	return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(value)
}

function formatDate(value?: string | null) {
	if (!value) return "—"
	try {
		return new Date(value).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })
	} catch {
		return value
	}
}

function escapeHtml(value: string) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
}

export function buildSubscriptionCertificateHtml(payload: SubscriptionCertificatePayload): string {
	const org = payload.organization_name || "FRSC Staff Housing Cooperative"
	const tagline = payload.organization_tagline || "Excellence in Staff Welfare & Housing"
	const isOwnership = payload.certificate_type === "ownership"
	const title = isOwnership ? "Certificate of Property Ownership" : "Certificate of Payment Completion"
	const subtitle = isOwnership
		? "This certifies full ownership transfer upon completed subscription and deed requirements."
		: "This certifies that the subscriber named below has fully completed payment for the allocated property block."

	const propertyLine =
		payload.property.unit_address ||
		payload.property.slot_label ||
		payload.property.address ||
		payload.property.title
	const locationLine = [payload.property.city, payload.property.state].filter(Boolean).join(", ")

	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)} — ${escapeHtml(payload.certificate_number)}</title>
  <style>
    @page { size: A4 landscape; margin: 0; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Georgia, "Times New Roman", serif;
      background: #f3f4f6;
      color: #111827;
    }
    .page {
      width: 297mm;
      min-height: 210mm;
      margin: 0 auto;
      padding: 14mm;
      background:
        radial-gradient(circle at top left, rgba(180, 138, 43, 0.12), transparent 28%),
        radial-gradient(circle at bottom right, rgba(17, 94, 89, 0.10), transparent 30%),
        linear-gradient(135deg, #fffdf8 0%, #ffffff 45%, #f8fafc 100%);
    }
    .frame {
      min-height: calc(210mm - 28mm);
      border: 3px double #b8860b;
      outline: 1px solid rgba(184, 134, 11, 0.35);
      outline-offset: 6px;
      padding: 18mm 16mm;
      position: relative;
      overflow: hidden;
    }
    .frame:before,
    .frame:after {
      content: "";
      position: absolute;
      width: 120px;
      height: 120px;
      border: 2px solid rgba(184, 134, 11, 0.18);
      border-radius: 999px;
    }
    .frame:before { top: -40px; left: -40px; }
    .frame:after { bottom: -40px; right: -40px; }
    .header {
      text-align: center;
      margin-bottom: 10mm;
    }
    .crest {
      width: 72px;
      height: 72px;
      margin: 0 auto 8px;
      border-radius: 999px;
      border: 2px solid #b8860b;
      display: grid;
      place-items: center;
      font-size: 28px;
      color: #b8860b;
      background: rgba(255,255,255,0.85);
    }
    .org {
      font-size: 13px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: #115e59;
      font-weight: 700;
    }
    .tagline {
      margin-top: 4px;
      font-size: 11px;
      color: #6b7280;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .title {
      margin-top: 14px;
      font-size: 30px;
      line-height: 1.15;
      color: #111827;
      font-weight: 700;
    }
    .subtitle {
      margin-top: 8px;
      font-size: 13px;
      color: #4b5563;
      max-width: 720px;
      margin-left: auto;
      margin-right: auto;
    }
    .divider {
      width: 120px;
      height: 3px;
      margin: 14px auto 0;
      background: linear-gradient(90deg, transparent, #b8860b, transparent);
    }
    .body {
      margin-top: 10mm;
      text-align: center;
    }
    .presented {
      font-size: 14px;
      color: #374151;
      margin-bottom: 6px;
    }
    .member-name {
      font-size: 34px;
      font-weight: 700;
      color: #0f766e;
      margin: 4px 0 8px;
      letter-spacing: 0.02em;
    }
    .member-meta {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 10mm;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 18px;
      max-width: 760px;
      margin: 0 auto;
      text-align: left;
    }
    .card {
      border: 1px solid rgba(17, 94, 89, 0.15);
      background: rgba(255,255,255,0.72);
      border-radius: 10px;
      padding: 12px 14px;
    }
    .card.full { grid-column: 1 / -1; }
    .label {
      font-size: 10px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #6b7280;
      margin-bottom: 4px;
    }
    .value {
      font-size: 15px;
      font-weight: 600;
      color: #111827;
      line-height: 1.35;
    }
    .footer {
      margin-top: 12mm;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      align-items: end;
    }
    .sign {
      text-align: center;
      font-size: 12px;
      color: #374151;
    }
    .sign-line {
      margin: 28px auto 8px;
      width: 180px;
      border-top: 1px solid #9ca3af;
    }
    .cert-no {
      text-align: center;
      font-size: 11px;
      color: #6b7280;
      margin-top: 8mm;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .seal {
      width: 92px;
      height: 92px;
      margin: 0 auto;
      border: 3px double #b8860b;
      border-radius: 999px;
      display: grid;
      place-items: center;
      color: #b8860b;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      background: rgba(255,255,255,0.8);
      transform: rotate(-8deg);
    }
    @media print {
      body { background: white; }
      .page { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="frame">
      <div class="header">
        <div class="crest">🏠</div>
        <div class="org">${escapeHtml(org)}</div>
        <div class="tagline">${escapeHtml(tagline)}</div>
        <div class="title">${escapeHtml(title)}</div>
        <div class="subtitle">${escapeHtml(subtitle)}</div>
        <div class="divider"></div>
      </div>

      <div class="body">
        <div class="presented">This certificate is proudly presented to</div>
        <div class="member-name">${escapeHtml(payload.member.name)}</div>
        <div class="member-meta">
          Member ID: ${escapeHtml(payload.member.member_id)}${payload.member.email ? ` · ${escapeHtml(payload.member.email)}` : ""}
        </div>

        <div class="grid">
          <div class="card full">
            <div class="label">Property / House Block</div>
            <div class="value">${escapeHtml(payload.property.title)}</div>
          </div>
          <div class="card">
            <div class="label">Unit / Slot</div>
            <div class="value">${escapeHtml(propertyLine)}</div>
          </div>
          <div class="card">
            <div class="label">Location</div>
            <div class="value">${escapeHtml(locationLine || "—")}</div>
          </div>
          <div class="card">
            <div class="label">Subscription Value</div>
            <div class="value">${formatCurrency(payload.property.price)}</div>
          </div>
          <div class="card">
            <div class="label">Amount Paid</div>
            <div class="value">${formatCurrency(payload.amount_paid ?? payload.property.price)}</div>
          </div>
          <div class="card">
            <div class="label">Allocation Date</div>
            <div class="value">${formatDate(payload.allocation_date)}</div>
          </div>
          <div class="card">
            <div class="label">${isOwnership ? "Ownership Date" : "Completion Date"}</div>
            <div class="value">${formatDate(payload.sold_at || payload.completion_date || payload.issue_date)}</div>
          </div>
          ${
						payload.owner_label
							? `<div class="card"><div class="label">Ownership Hand</div><div class="value">${escapeHtml(payload.owner_label)}</div></div>`
							: ""
					}
        </div>
      </div>

      <div class="footer">
        <div class="sign">
          <div class="sign-line"></div>
          Authorized Signatory
        </div>
        <div>
          <div class="seal">Official<br/>Seal</div>
        </div>
        <div class="sign">
          <div class="sign-line"></div>
          Housing Secretary
        </div>
      </div>

      <div class="cert-no">Certificate No: ${escapeHtml(payload.certificate_number)} · Issued ${formatDate(payload.issue_date)}</div>
    </div>
  </div>
  <script>window.onload = () => { window.focus(); window.print(); };</script>
</body>
</html>`
}

export function openSubscriptionCertificate(payload: SubscriptionCertificatePayload) {
	const html = buildSubscriptionCertificateHtml(payload)
	const win = window.open("", "_blank", "noopener,noreferrer,width=1200,height=850")
	if (!win) {
		throw new Error("Pop-up blocked. Please allow pop-ups to view and print the certificate.")
	}
	win.document.open()
	win.document.write(html)
	win.document.close()
}
