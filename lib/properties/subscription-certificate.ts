export interface SubscriptionCertificatePayload {
	certificate_number: string
	reference_number?: string
	certificate_type?: "payment_completion" | "ownership" | string
	issue_date: string
	organization_name?: string | null
	organization_tagline?: string | null
	organization_address?: string | null
	organization_logo_url?: string | null
	subject_line?: string | null
	letter_paragraphs?: string[]
	head_of_housing_name?: string | null
	head_of_housing_title?: string | null
	head_of_housing_signature_url?: string | null
	property: {
		title: string
		address?: string | null
		unit_address?: string | null
		slot_label?: string | null
		city?: string | null
		state?: string | null
		price: number
		full_address?: string | null
	}
	member: {
		name: string
		member_id: string
		email?: string | null
		address?: string | null
	}
	amount_paid?: number
	allocation_date?: string | null
	sold_at?: string | null
	completion_date?: string
	owner_label?: string | null
	owner_sequence?: number | null
}

function formatCurrency(amount?: number) {
	const value = Number.isFinite(amount) ? Number(amount) : 0
	return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(value)
}

function formatDate(value?: string | null, style: "long" | "monthYear" = "long") {
	if (!value) return "—"
	try {
		if (style === "monthYear") {
			return new Date(value).toLocaleDateString("en-NG", { year: "numeric", month: "long" })
		}
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

function renderParagraphs(paragraphs: string[]) {
	return paragraphs
		.map(
			(paragraph, index) =>
				`<p class="paragraph"><span class="paragraph-number">${index + 1}.</span> ${escapeHtml(paragraph)}</p>`,
		)
		.join("")
}

export function buildSubscriptionCertificateHtml(payload: SubscriptionCertificatePayload): string {
	const org = payload.organization_name || "Housing Cooperative"
	const tagline = payload.organization_tagline || ""
	const isOwnership = payload.certificate_type === "ownership"
	const subject =
		payload.subject_line ||
		(isOwnership
			? "CONFIRMATION OF PROPERTY OWNERSHIP ON PAYMENT COMPLETION"
			: "CONFIRMATION OF HOUSE ALLOCATION ON PAYMENT COMPLETION")

	const referenceNumber = payload.reference_number || payload.certificate_number
	const issueDateLong = formatDate(payload.issue_date)
	const issueDateMonthYear = formatDate(payload.issue_date, "monthYear")

	const memberAddress = payload.member.address || "—"
	const propertyFullAddress =
		payload.property.full_address ||
		payload.property.unit_address ||
		payload.property.slot_label ||
		payload.property.address ||
		payload.property.title

	const defaultParagraphs = [
		`Reference: ${referenceNumber} dated ${issueDateLong}.`,
		"The quoted reference above is in respect of the underlined subject.",
		`We are glad to officially acknowledge the completion of your payment for the ${payload.property.title} allocated to you.`,
		`In line with this, we hereby confirm the allocation of ${propertyFullAddress} as your rightful property.`,
		"Please note that the terms of the allocation remain consistent with the original agreement that requires management of the property in accordance with our estate's guidelines.",
		`We use this medium to congratulate you on this milestone and pray that your home brings you comfort and satisfaction as we look forward to your continued partnership with ${org}.`,
	]

	const paragraphs =
		Array.isArray(payload.letter_paragraphs) && payload.letter_paragraphs.length > 0
			? payload.letter_paragraphs
			: defaultParagraphs

	const logoBlock = payload.organization_logo_url
		? `<img src="${escapeHtml(payload.organization_logo_url)}" alt="${escapeHtml(org)}" class="logo" />`
		: `<div class="logo-fallback">${escapeHtml(org.charAt(0))}</div>`

	const signatureBlock = payload.head_of_housing_signature_url
		? `<img src="${escapeHtml(payload.head_of_housing_signature_url)}" alt="Signature" class="signature-image" />`
		: `<div class="signature-line"></div>`

	const signatoryName = (payload.head_of_housing_name || "").trim()
	const signatoryTitle = (payload.head_of_housing_title || "Head of Housing").trim()

	const orgAddress = payload.organization_address
		? payload.organization_address
				.split("\n")
				.map((line) => escapeHtml(line.trim()))
				.filter(Boolean)
				.join("<br />")
		: ""

	const summaryStrip = `
    <div class="summary-strip">
      <div class="summary-item"><span>Property</span><strong>${escapeHtml(payload.property.title)}</strong></div>
      <div class="summary-item"><span>Unit</span><strong>${escapeHtml(payload.property.slot_label || payload.property.unit_address || "—")}</strong></div>
      <div class="summary-item"><span>Paid</span><strong>${formatCurrency(payload.amount_paid ?? payload.property.price)}</strong></div>
      <div class="summary-item"><span>${isOwnership ? "Ownership" : "Completed"}</span><strong>${formatDate(payload.sold_at || payload.completion_date || payload.issue_date)}</strong></div>
    </div>`

	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(subject)} — ${escapeHtml(payload.certificate_number)}</title>
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 210mm;
      height: 297mm;
      font-family: Arial, "Segoe UI", sans-serif;
      background: #ffffff;
      color: #111827;
      line-height: 1.35;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      width: 210mm;
      height: 297mm;
      max-height: 297mm;
      overflow: hidden;
      padding: 10mm 12mm 8mm;
      display: flex;
      flex-direction: column;
      page-break-after: avoid;
      page-break-inside: avoid;
    }
    .letterhead {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 10px;
      align-items: start;
      border-bottom: 1.5px solid #0f766e;
      padding-bottom: 8px;
      margin-bottom: 10px;
      flex-shrink: 0;
    }
    .brand {
      display: flex;
      gap: 10px;
      align-items: center;
      min-width: 0;
    }
    .logo, .logo-fallback {
      width: 46px;
      height: 46px;
      border-radius: 999px;
      object-fit: cover;
      flex-shrink: 0;
    }
    .logo-fallback {
      display: grid;
      place-items: center;
      background: #ecfeff;
      color: #0f766e;
      font-size: 20px;
      font-weight: 700;
      border: 1.5px solid #99f6e4;
    }
    .org-name {
      font-size: 13px;
      font-weight: 700;
      color: #0f766e;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      line-height: 1.2;
    }
    .org-tagline {
      font-size: 9px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-top: 1px;
    }
    .org-address {
      margin-top: 4px;
      font-size: 10px;
      color: #475569;
      line-height: 1.3;
    }
    .meta {
      text-align: right;
      font-size: 10px;
      color: #475569;
      flex-shrink: 0;
    }
    .meta strong {
      display: block;
      color: #111827;
      font-size: 10px;
      margin-bottom: 2px;
      word-break: break-word;
      max-width: 42mm;
      margin-left: auto;
    }
    .body {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }
    .recipient {
      margin: 0 0 10px;
      font-size: 11px;
      flex-shrink: 0;
    }
    .recipient-name {
      font-weight: 700;
      margin-bottom: 2px;
    }
    .recipient-meta {
      color: #64748b;
      font-size: 10px;
      margin-top: 3px;
    }
    .subject {
      text-align: center;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      text-decoration: underline;
      margin: 0 0 10px;
      letter-spacing: 0.02em;
      line-height: 1.3;
      flex-shrink: 0;
    }
    .paragraphs {
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }
    .paragraph {
      margin: 0 0 7px;
      font-size: 11px;
      text-align: justify;
    }
    .paragraph:last-child {
      margin-bottom: 0;
    }
    .paragraph-number {
      font-weight: 700;
      margin-right: 4px;
    }
    .summary-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      margin: 10px 0 8px;
      flex-shrink: 0;
    }
    .summary-item {
      border: 1px solid #dbeafe;
      background: #f8fafc;
      border-radius: 4px;
      padding: 5px 6px;
      min-width: 0;
    }
    .summary-item span {
      display: block;
      font-size: 8px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 2px;
    }
    .summary-item strong {
      display: block;
      font-size: 10px;
      font-weight: 600;
      color: #0f172a;
      line-height: 1.25;
      word-break: break-word;
    }
    .bottom {
      flex-shrink: 0;
      margin-top: auto;
    }
    .signatory {
      width: 220px;
    }
    .signature-image {
      display: block;
      max-height: 48px;
      max-width: 180px;
      object-fit: contain;
      margin-bottom: 2px;
    }
    .signature-line {
      width: 180px;
      border-top: 1px solid #94a3b8;
      margin: 22px 0 4px;
    }
    .signatory-name {
      font-weight: 700;
      font-size: 11px;
      line-height: 1.25;
    }
    .signatory-title {
      font-size: 10px;
      color: #475569;
      line-height: 1.25;
    }
    .footer {
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1px solid #e2e8f0;
      font-size: 9px;
      color: #64748b;
      text-align: center;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    @media print {
      html, body { width: 210mm; height: 297mm; }
      .page {
        width: 210mm;
        height: 297mm;
        overflow: hidden;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="letterhead">
      <div class="brand">
        ${logoBlock}
        <div>
          <div class="org-name">${escapeHtml(org)}</div>
          ${tagline ? `<div class="org-tagline">${escapeHtml(tagline)}</div>` : ""}
          ${orgAddress ? `<div class="org-address">${orgAddress}</div>` : ""}
        </div>
      </div>
      <div class="meta">
        <strong>${escapeHtml(referenceNumber)}</strong>
        ${issueDateMonthYear}
      </div>
    </div>

    <div class="body">
      <div class="recipient">
        <div class="recipient-name">${escapeHtml(payload.member.name)},</div>
        <div>${escapeHtml(memberAddress)}</div>
        <div class="recipient-meta">Member ID: ${escapeHtml(payload.member.member_id)}</div>
      </div>

      <h1 class="subject">${escapeHtml(subject)}</h1>

      <div class="paragraphs">
        ${renderParagraphs(paragraphs)}
      </div>

      <div class="bottom">
        ${summaryStrip}

        <div class="signatory">
          ${signatureBlock}
          ${signatoryName ? `<div class="signatory-name">${escapeHtml(signatoryName)}</div>` : ""}
          <div class="signatory-title">${escapeHtml(signatoryTitle)}</div>
        </div>

        <div class="footer">
          Certificate No: ${escapeHtml(payload.certificate_number)} · Issued ${issueDateLong}
        </div>
      </div>
    </div>
  </div>
  <script>
    window.addEventListener("load", function () {
      window.focus();
      setTimeout(function () { window.print(); }, 400);
    });
  </script>
</body>
</html>`
}
function downloadCertificateHtml(html: string, certificateNumber: string) {
	const blob = new Blob([html], { type: "text/html;charset=utf-8" })
	const url = URL.createObjectURL(blob)
	const anchor = document.createElement("a")
	anchor.href = url
	anchor.download = `${certificateNumber.replace(/[^a-zA-Z0-9-_]/g, "_")}.html`
	anchor.click()
	URL.revokeObjectURL(url)
}

/**
 * Opens the certificate in a new tab. Uses a blob URL so content renders even when
 * COOP / noopener would block document.write on a blank popup window.
 * @returns how the certificate was delivered to the user
 */
export function openSubscriptionCertificate(
	payload: SubscriptionCertificatePayload,
): "opened" | "downloaded" {
	const html = buildSubscriptionCertificateHtml(payload)
	const blob = new Blob([html], { type: "text/html;charset=utf-8" })
	const blobUrl = URL.createObjectURL(blob)

	const win = window.open(blobUrl, "_blank")

	if (!win) {
		URL.revokeObjectURL(blobUrl)
		downloadCertificateHtml(html, payload.certificate_number)
		return "downloaded"
	}

	win.addEventListener?.("load", () => {
		setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000)
	})
	setTimeout(() => URL.revokeObjectURL(blobUrl), 120_000)
	return "opened"
}
