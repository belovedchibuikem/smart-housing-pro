import { NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { getApiBaseUrl } from "@/lib/api/config"

const SAMPLE_BY_HEADER: Record<string, string> = {
	"First Name": "John",
	"Last Name": "Doe",
	Email: "",
	Phone: "",
	"IPPIS Number": "12345678901",
	"FRSC PIN": "FRSC-PIN-001",
	"Date of Birth (YYYY-MM-DD or DD-MM-YYYY)": "15-01-1990",
	"Gender (Male/Female)": "Male",
	"Marital Status (Single/Married/Divorced/Widowed)": "Single",
	Nationality: "Nigerian",
	"State of Origin": "Lagos",
	LGA: "Ikeja",
	"Residential Address": "123 Main Street",
	City: "Lagos",
	State: "Lagos",
	Rank: "Inspector",
	Department: "Operations",
	"Command State": "Lagos",
	"Employment Date (YYYY-MM-DD or DD-MM-YYYY)": "15-01-2020",
	"Years of Service": "4",
	"Membership Type (Regular/Premium/VIP)": "Regular",
	"Legacy Reference ID": "",
}

function sampleRow(headers: string[]): Record<string, string> {
	const row: Record<string, string> = {}
	for (const h of headers) {
		row[h] = SAMPLE_BY_HEADER[h] ?? ""
	}
	return row
}

const FALLBACK_MANDATORY = [
	"First Name",
	"Last Name",
	"Email",
	"Phone",
	"IPPIS Number",
	"FRSC PIN",
]
const FALLBACK_OPTIONAL = [
	"Email",
	"Phone",
	"IPPIS Number",
	"FRSC PIN",
	"Date of Birth (YYYY-MM-DD or DD-MM-YYYY)",
	"Gender (Male/Female)",
	"Marital Status (Single/Married/Divorced/Widowed)",
	"Nationality",
	"State of Origin",
	"LGA",
	"Residential Address",
	"City",
	"State",
	"Rank",
	"Department",
	"Command State",
	"Employment Date (YYYY-MM-DD or DD-MM-YYYY)",
	"Years of Service",
	"Membership Type (Regular/Premium/VIP)",
	"Legacy Reference ID",
]

export async function GET(request: NextRequest) {
	try {
		const kind = request.nextUrl.searchParams.get("type") === "optional_details" ? "optional" : "mandatory"
		const filename =
			kind === "optional" ? "members_additional_details_template.xlsx" : "members_mandatory_template.xlsx"

		const laravelApiUrl = getApiBaseUrl()
		const authHeader = request.headers.get("Authorization") || ""
		const host = request.headers.get("host") || ""
		const tenantSlug = request.headers.get("X-Tenant-Slug") || ""

		let headers: string[] =
			kind === "optional" ? [...FALLBACK_OPTIONAL] : [...FALLBACK_MANDATORY]

		if (authHeader) {
			try {
				const res = await fetch(`${laravelApiUrl}/admin/bulk/members/field-config`, {
					method: "GET",
					headers: {
						Accept: "application/json",
						"Content-Type": "application/json",
						Authorization: authHeader,
						"X-Forwarded-Host": host,
						...(tenantSlug && { "X-Tenant-Slug": tenantSlug }),
					},
				})
				const data = await res.json()
				if (
					data?.success &&
					Array.isArray(data.mandatory_file_headers) &&
					Array.isArray(data.additional_details_headers)
				) {
					headers =
						kind === "optional" ? data.additional_details_headers : data.mandatory_file_headers
				}
			} catch {
				// use fallback headers
			}
		}

		const sampleData = [sampleRow(headers)]

		const workbook = XLSX.utils.book_new()
		const worksheet = XLSX.utils.json_to_sheet(sampleData)
		worksheet["!cols"] = Array(headers.length).fill({ wch: 16 })

		XLSX.utils.book_append_sheet(
			workbook,
			worksheet,
			kind === "optional" ? "Additional details" : "New members",
		)

		const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

		return new NextResponse(excelBuffer, {
			status: 200,
			headers: {
				"Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				"Content-Disposition": `attachment; filename="${filename}"`,
			},
		})
	} catch (error) {
		console.error("Excel template generation error:", error)
		return NextResponse.json({ error: "Failed to generate Excel template" }, { status: 500 })
	}
}
