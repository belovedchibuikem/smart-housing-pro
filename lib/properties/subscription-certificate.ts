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

function renderDetailCell(label: string, value: string, fullWidth = false) {
	return `<div class="detail-cell${fullWidth ? " detail-cell--full" : ""}">
    <div class="detail-label">${escapeHtml(label)}</div>
    <div class="detail-value">${escapeHtml(value)}</div>
  </div>`
}

function renderConfirmationParagraphs(paragraphs: string[]) {
	return paragraphs
		.map((paragraph) => `<p class="confirmation-line">${escapeHtml(paragraph)}</p>`)
		.join("")
}

export function buildSubscriptionCertificateHtml(payload: SubscriptionCertificatePayload): string {
	const org = payload.organization_name || "Housing Cooperative"
	const tagline = payload.organization_tagline || "Excellence in Staff Welfare & Housing"
	const isOwnership = payload.certificate_type === "ownership"
	const certificateTitle = isOwnership ? "Proof of Ownership" : "Certificate of House Allocation"
	const certifyingLine = isOwnership
		? "This certifies full ownership transfer upon completed subscription and deed requirements."
		: "This certifies the confirmation of house allocation upon full payment completion."

	const subject =
		payload.subject_line ||
		(isOwnership
			? "Confirmation of Property Ownership on Payment Completion"
			: "Confirmation of House Allocation on Payment Completion")

	const referenceNumber = payload.reference_number || payload.certificate_number
	const issueDateLong = formatDate(payload.issue_date)

	const propertyLine =
		payload.property.unit_address ||
		payload.property.slot_label ||
		payload.property.address ||
		payload.property.title
	const locationLine = [payload.property.city, payload.property.state].filter(Boolean).join(", ") || "—"

	const propertyFullAddress =
		payload.property.full_address ||
		[propertyLine, locationLine !== "—" ? locationLine : null].filter(Boolean).join(", ") ||
		payload.property.title

	const defaultParagraphs = [
		`Reference: ${referenceNumber} dated ${issueDateLong}.`,
		`We hereby acknowledge the completion of payment for ${payload.property.title}${propertyLine ? ` (${propertyLine})` : ""}.`,
		`The allocation of ${propertyFullAddress} is confirmed as the rightful property of the subscriber named above.`,
		`Terms of allocation remain consistent with the original agreement and estate management guidelines of ${org}.`,
	]

	const paragraphs =
		Array.isArray(payload.letter_paragraphs) && payload.letter_paragraphs.length > 0
			? payload.letter_paragraphs.slice(0, 5)
			: defaultParagraphs

	const logoBlock = payload.organization_logo_url
		? `<img src="${escapeHtml(payload.organization_logo_url)}" alt="${escapeHtml(org)}" class="brand-logo" />`
		: `<div class="brand-logo brand-logo--fallback" aria-hidden="true">${escapeHtml(org.charAt(0))}</div>`

	const signatureBlock = payload.head_of_housing_signature_url
		? `<img src="${escapeHtml(payload.head_of_housing_signature_url)}" alt="Signature" class="signature-image" />`
		: `<div class="signature-line" aria-hidden="true"></div>`

	const signatoryName = (payload.head_of_housing_name || "").trim()
	const signatoryTitle = (payload.head_of_housing_title || "Head of Housing").trim()

	const detailsGrid = [
		renderDetailCell("Property / House Block", payload.property.title, true),
		renderDetailCell("Unit / Slot", propertyLine || "—"),
		renderDetailCell("Location", locationLine),
		renderDetailCell("Total House Cost", formatCurrency(payload.property.price)),
		renderDetailCell("Total Amount Paid", formatCurrency(payload.amount_paid ?? payload.property.price)),
		renderDetailCell("Allocation Date", formatDate(payload.allocation_date)),
		renderDetailCell(
			isOwnership ? "Ownership Date" : "Completion Date",
			formatDate(payload.sold_at || payload.completion_date || payload.issue_date),
		),
		...(payload.owner_label ? [renderDetailCell("Ownership Hand", payload.owner_label)] : []),
	].join("")

	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=794, initial-scale=1" />
  <title>${escapeHtml(certificateTitle)} — ${escapeHtml(payload.certificate_number)}</title>
  <style>
    @page {
      size: 210mm 297mm;
      margin: 0;
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #e5e7eb;
      color: #1f2937;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: Georgia, "Times New Roman", serif;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 12px;
    }
    .sheet {
      width: 210mm;
      height: 297mm;
      max-width: 100%;
      aspect-ratio: 210 / 297;
      overflow: hidden;
      padding: 6mm;
      page-break-after: avoid;
      page-break-inside: avoid;
      background: #ffffff;
      box-shadow: 0 8px 32px rgba(15, 23, 42, 0.12);
    }
    .frame {
      position: relative;
      width: 100%;
      height: 100%;
      padding: 4mm;
      border: 2px solid #b8860b;
      box-shadow: inset 0 0 0 1px rgba(184, 134, 11, 0.45);
      background:
        radial-gradient(circle at 0% 0%, rgba(184, 134, 11, 0.08), transparent 24%),
        radial-gradient(circle at 100% 100%, rgba(15, 118, 110, 0.08), transparent 26%),
        linear-gradient(180deg, #fffdf8 0%, #ffffff 42%, #f8fafc 100%);
      overflow: hidden;
    }
    .frame-inner {
      height: 100%;
      border: 1px solid rgba(15, 118, 110, 0.18);
      padding: 7mm 8mm 6mm;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .ornament {
      position: absolute;
      width: 44px;
      height: 44px;
      border: 1px solid rgba(184, 134, 11, 0.28);
      border-radius: 999px;
      pointer-events: none;
    }
    .ornament--tl { top: 3mm; left: 3mm; }
    .ornament--tr { top: 3mm; right: 3mm; }
    .ornament--bl { bottom: 3mm; left: 3mm; }
    .ornament--br { bottom: 3mm; right: 3mm; }

    .header {
      text-align: center;
      flex-shrink: 0;
    }
    .brand-logo,
    .brand-logo--fallback {
      width: 58px;
      height: 58px;
      margin: 0 auto 8px;
      border-radius: 999px;
      object-fit: cover;
      display: block;
    }
    .brand-logo--fallback {
      display: grid;
      place-items: center;
      background: rgba(255, 255, 255, 0.92);
      border: 2px solid #b8860b;
      color: #b8860b;
      font-size: 26px;
      font-weight: 700;
      font-family: Georgia, serif;
    }
    .org-name {
      font-size: 13px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #0f766e;
      font-weight: 700;
      font-family: "Segoe UI", Arial, sans-serif;
      line-height: 1.25;
    }
    .org-tagline {
      margin-top: 4px;
      font-size: 9px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #64748b;
      font-family: "Segoe UI", Arial, sans-serif;
    }
    .header-meta {
      margin-top: 8px;
      display: flex;
      justify-content: center;
      gap: 18px;
      flex-wrap: wrap;
      font-family: "Segoe UI", Arial, sans-serif;
      font-size: 9px;
      color: #64748b;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .header-meta strong {
      color: #334155;
      font-weight: 600;
    }
    .divider {
      width: 120px;
      height: 2px;
      margin: 10px auto 0;
      background: linear-gradient(90deg, transparent, #b8860b, transparent);
    }

    .title-block {
      text-align: center;
      margin: 10px 0 8px;
      flex-shrink: 0;
    }
    .cert-title {
      margin: 0;
      font-size: 24px;
      line-height: 1.15;
      color: #111827;
      font-weight: 700;
    }
    .cert-subtitle {
      margin: 6px auto 0;
      max-width: 520px;
      font-size: 11px;
      line-height: 1.45;
      color: #4b5563;
      font-style: italic;
    }
    .subject-line {
      margin-top: 6px;
      font-family: "Segoe UI", Arial, sans-serif;
      font-size: 9px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #0f766e;
      font-weight: 600;
    }

    .recipient-block {
      text-align: center;
      margin: 8px 0 10px;
      flex-shrink: 0;
    }
    .presented-to {
      font-size: 12px;
      color: #374151;
    }
    .member-name {
      margin: 4px 0 6px;
      font-size: 28px;
      line-height: 1.1;
      color: #0f766e;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    .member-meta {
      font-family: "Segoe UI", Arial, sans-serif;
      font-size: 10px;
      color: #64748b;
      letter-spacing: 0.03em;
    }

    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 7px;
      margin-bottom: 10px;
      flex-shrink: 0;
    }
    .detail-cell {
      border: 1px solid rgba(15, 118, 110, 0.16);
      background: rgba(255, 255, 255, 0.78);
      border-radius: 8px;
      padding: 7px 9px;
      min-width: 0;
    }
    .detail-cell--full {
      grid-column: 1 / -1;
    }
    .detail-label {
      font-family: "Segoe UI", Arial, sans-serif;
      font-size: 8px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 3px;
    }
    .detail-value {
      font-size: 12px;
      font-weight: 600;
      color: #111827;
      line-height: 1.3;
      word-break: break-word;
    }

    .confirmation-panel {
      flex: 1;
      min-height: 0;
      overflow: hidden;
      border-top: 1px solid rgba(15, 118, 110, 0.12);
      border-bottom: 1px solid rgba(15, 118, 110, 0.12);
      padding: 8px 2px;
      margin-bottom: 8px;
    }
    .confirmation-heading {
      font-family: "Segoe UI", Arial, sans-serif;
      font-size: 8px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #0f766e;
      margin-bottom: 6px;
      font-weight: 700;
    }
    .confirmation-line {
      margin: 0 0 6px;
      font-size: 10.5px;
      line-height: 1.45;
      color: #374151;
      text-align: justify;
    }
    .confirmation-line:last-child {
      margin-bottom: 0;
    }

    .footer-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 12px;
      align-items: end;
      flex-shrink: 0;
    }
    .signatory {
      min-width: 0;
    }
    .signature-image {
      display: block;
      max-height: 52px;
      max-width: 190px;
      object-fit: contain;
      margin-bottom: 4px;
    }
    .signature-line {
      width: 190px;
      border-top: 1px solid #94a3b8;
      margin: 26px 0 6px;
    }
    .signatory-name {
      font-size: 12px;
      font-weight: 700;
      color: #111827;
      line-height: 1.25;
    }
    .signatory-title {
      font-family: "Segoe UI", Arial, sans-serif;
      font-size: 10px;
      color: #475569;
      margin-top: 2px;
    }
    .seal {
      width: 72px;
      height: 72px;
      border: 2px double #b8860b;
      border-radius: 999px;
      display: grid;
      place-items: center;
      text-align: center;
      color: #b8860b;
      font-family: "Segoe UI", Arial, sans-serif;
      font-size: 8px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      line-height: 1.2;
      background: rgba(255, 255, 255, 0.82);
      transform: rotate(-8deg);
      flex-shrink: 0;
    }
    .cert-footer {
      margin-top: 8px;
      text-align: center;
      font-family: "Segoe UI", Arial, sans-serif;
      font-size: 9px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #64748b;
      flex-shrink: 0;
    }

    @media print {
      @page {
        size: 210mm 297mm portrait;
        margin: 0;
      }
      html, body {
        width: 210mm;
        height: 297mm;
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
        display: block !important;
        overflow: hidden !important;
      }
      body * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .sheet {
        width: 210mm !important;
        height: 297mm !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 6mm !important;
        box-shadow: none !important;
        overflow: hidden !important;
      }
      .frame,
      .frame-inner {
        overflow: hidden !important;
      }
    }

    @media screen and (max-width: 820px) {
      body { padding: 8px; }
      .sheet {
        width: 100%;
        height: auto;
        aspect-ratio: 210 / 297;
      }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="frame">
      <div class="ornament ornament--tl" aria-hidden="true"></div>
      <div class="ornament ornament--tr" aria-hidden="true"></div>
      <div class="ornament ornament--bl" aria-hidden="true"></div>
      <div class="ornament ornament--br" aria-hidden="true"></div>

      <div class="frame-inner">
        <header class="header">
          ${logoBlock}
          <div class="org-name">${escapeHtml(org)}</div>
          <div class="org-tagline">${escapeHtml(tagline)}</div>
          <div class="header-meta">
            <span>Ref: <strong>${escapeHtml(referenceNumber)}</strong></span>
            <span>Issued: <strong>${escapeHtml(issueDateLong)}</strong></span>
          </div>
          <div class="divider" aria-hidden="true"></div>
        </header>

        <section class="title-block">
          <h1 class="cert-title">${escapeHtml(certificateTitle)}</h1>
          <p class="cert-subtitle">${escapeHtml(certifyingLine)}</p>
          <div class="subject-line">${escapeHtml(subject)}</div>
        </section>

        <section class="recipient-block">
          <div class="presented-to">This certificate is proudly presented to</div>
          <div class="member-name">${escapeHtml(payload.member.name)}</div>
          <div class="member-meta">
            Member ID: ${escapeHtml(payload.member.member_id)}${payload.member.email ? ` · ${escapeHtml(payload.member.email)}` : ""}
          </div>
        </section>

        <section class="details-grid" aria-label="Allocation details">
          ${detailsGrid}
        </section>

        <section class="confirmation-panel" aria-label="Confirmation statement">
          <div class="confirmation-heading">Official Confirmation</div>
          ${renderConfirmationParagraphs(paragraphs)}
        </section>

        <div class="footer-row">
          <div class="signatory">
            ${signatureBlock}
            ${signatoryName ? `<div class="signatory-name">${escapeHtml(signatoryName)}</div>` : ""}
            <div class="signatory-title">${escapeHtml(signatoryTitle)}</div>
          </div>
          <div class="seal" aria-hidden="true">Official<br />Seal</div>
        </div>

        <footer class="cert-footer">
          Certificate No: ${escapeHtml(payload.certificate_number)} · Issued ${escapeHtml(issueDateLong)}
        </footer>
      </div>
    </div>
  </div>
  <script>
    window.addEventListener("load", function () {
      var style = document.createElement("style");
      style.textContent = "@page { size: 210mm 297mm portrait; margin: 0; }";
      document.head.appendChild(style);
      window.focus();
      setTimeout(function () { window.print(); }, 500);
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
