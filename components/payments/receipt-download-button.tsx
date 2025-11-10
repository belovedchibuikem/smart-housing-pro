"use client"

import { useCallback, useMemo } from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Download } from "lucide-react"
import { cn } from "@/lib/utils"

export type ReceiptLineItem = {
	label: string
	value: string
	accent?: boolean
}

export type ReceiptDownloadData = {
	title: string
	subtitle?: string
	amount?: number
	amountLabel?: string
	currency?: string
	status?: string
	paymentMethod?: string
	reference?: string
	date?: string
	customer?: {
		name?: string
		email?: string
		phone?: string
	}
	items?: ReceiptLineItem[]
	footerNote?: string
	brand?: {
		name?: string
		tagline?: string
		supportEmail?: string
		supportPhone?: string
		website?: string
		address?: string
	}
}

interface ReceiptDownloadButtonProps extends ButtonProps {
	data: ReceiptDownloadData
	fileName?: string
	buttonLabel?: string
	className?: string
}

function buildAmount(value: number | undefined, currencyCode: string) {
	const safeValue = Number.isFinite(value) ? Number(value) : 0
	try {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: currencyCode,
			minimumFractionDigits: 0,
		}).format(safeValue)
	} catch {
		return `${currencyCode} ${safeValue.toLocaleString()}`
	}
}

function buildReceiptHtml(data: ReceiptDownloadData, downloadTimestamp: string) {
	const currencyCode = data.currency ?? "NGN"
	const amountFormatted = buildAmount(data.amount, currencyCode)
	const brandName = data.brand?.name ?? "Smart Housing Cooperative"
	const status = data.status ?? "Successful"
	const dateIssued = data.date ?? downloadTimestamp

	const metaRows =
		data.items
			?.map((item) => {
				return `
          <div class="info-row ${item.accent ? "accent" : ""}">
            <span>${item.label}</span>
            <span>${item.value}</span>
          </div>
        `
			})
			.join("") ?? ""

	const contactLines = [
		data.brand?.supportEmail ? `<span>Email: ${data.brand.supportEmail}</span>` : "",
		data.brand?.supportPhone ? `<span>Phone: ${data.brand.supportPhone}</span>` : "",
		data.brand?.website ? `<span>Web: ${data.brand.website}</span>` : "",
		data.brand?.address ? `<span>${data.brand.address}</span>` : "",
	]
		.filter(Boolean)
		.join("<br />")

	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${data.title} - ${brandName}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: "Segoe UI", Roboto, sans-serif;
      background: #f5f6fa;
      color: #1f2933;
      margin: 0;
      padding: 32px;
    }
    .wrapper {
      max-width: 640px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 24px 50px rgba(15, 23, 42, 0.12);
      overflow: hidden;
      border: 1px solid #e5e7eb;
    }
    header {
      background: linear-gradient(135deg, #1d4ed8, #0ea5e9);
      padding: 32px;
      color: #f8fafc;
    }
    header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    }
    header p {
      margin: 8px 0 0;
      font-size: 14px;
      opacity: 0.85;
    }
    .content {
      padding: 32px;
    }
    .amount-card {
      background: linear-gradient(135deg, rgba(14,165,233,0.08), rgba(59,130,246,0.1));
      border: 1px solid rgba(37,99,235,0.15);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .amount-label {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #1d4ed8;
      margin-bottom: 8px;
      display: block;
    }
    .amount-value {
      font-size: 32px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }
    .status-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 16px;
      background: rgba(16, 185, 129, 0.12);
      color: #047857;
      border: 1px solid rgba(16, 185, 129, 0.25);
    }
    .info-grid {
      display: grid;
      gap: 14px;
      margin: 24px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      color: #334155;
      padding-bottom: 12px;
      border-bottom: 1px dashed #e2e8f0;
    }
    .info-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .info-row span:first-child {
      font-weight: 500;
    }
    .info-row span:last-child {
      font-weight: 600;
      color: #0f172a;
    }
    .info-row.accent span:last-child {
      color: #2563eb;
    }
    .footer-note {
      margin-top: 24px;
      font-size: 13px;
      padding: 16px;
      border-radius: 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
    }
    footer {
      padding: 24px 32px 32px;
      background: #0f172a;
      color: rgba(248, 250, 252, 0.8);
      font-size: 12px;
    }
    footer strong {
      color: #f8fafc;
    }
    @media (max-width: 640px) {
      body { padding: 16px; }
      header, .content, footer { padding: 24px; }
      .amount-value { font-size: 26px; }
      .info-row { flex-direction: column; gap: 6px; }
      .info-row span:last-child { text-align: left; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <header>
      <h1>${data.title}</h1>
      <p>${data.subtitle ?? brandName}</p>
    </header>
    <div class="content">
      <div class="amount-card">
        <span class="amount-label">${data.amountLabel ?? "Amount Paid"}</span>
        <p class="amount-value">${amountFormatted}</p>
        <div class="status-chip">
          <span>●</span>
          <span>${status}</span>
        </div>
      </div>
      <div class="info-grid">
        <div class="info-row">
          <span>Reference</span>
          <span>${data.reference ?? "—"}</span>
        </div>
        <div class="info-row">
          <span>Payment Method</span>
          <span>${data.paymentMethod ?? "—"}</span>
        </div>
        <div class="info-row">
          <span>Date Issued</span>
          <span>${new Date(dateIssued).toLocaleString()}</span>
        </div>
        ${
					data.customer?.name || data.customer?.email || data.customer?.phone
						? `<div class="info-row">
          <span>Issued To</span>
          <span>
            ${data.customer?.name ?? ""}${data.customer?.email ? `<br />${data.customer.email}` : ""}${
								data.customer?.phone ? `<br />${data.customer.phone}` : ""
							}
          </span>
        </div>`
						: ""
				}
        ${metaRows}
      </div>
      ${
				data.footerNote
					? `<div class="footer-note">${data.footerNote}</div>`
					: `<div class="footer-note">Keep this receipt for your records. If you have any questions, please reach out to our support team.</div>`
			}
    </div>
    <footer>
      <strong>${brandName}</strong><br />
      ${data.brand?.tagline ? `${data.brand.tagline}<br />` : ""}
      ${contactLines}
    </footer>
  </div>
</body>
</html>`
}

export function ReceiptDownloadButton({
	data,
	fileName,
	buttonLabel = "Download Receipt",
	className,
	...buttonProps
}: ReceiptDownloadButtonProps) {
	const downloadTimestamp = useMemo(() => new Date().toISOString(), [])

	const handleDownload = useCallback(() => {
		const safeFileName =
			fileName ??
			`receipt-${(data.reference || `${Date.now()}`).toString().replace(/[^a-z0-9\-]+/gi, "-")}.html`
		const html = buildReceiptHtml(data, downloadTimestamp)
		const blob = new Blob([html], { type: "text/html;charset=utf-8" })
		const url = URL.createObjectURL(blob)

		const anchor = document.createElement("a")
		anchor.href = url
		anchor.download = safeFileName
		document.body.appendChild(anchor)
		anchor.click()
		document.body.removeChild(anchor)

		setTimeout(() => URL.revokeObjectURL(url), 1500)
	}, [data, downloadTimestamp, fileName])

	return (
		<Button
			type="button"
			onClick={handleDownload}
			className={cn("inline-flex items-center gap-2", className)}
			{...buttonProps}
		>
			<Download className="h-4 w-4" />
			{buttonLabel}
		</Button>
	)
}


