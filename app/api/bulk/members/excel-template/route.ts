import { NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"

const MANDATORY_SAMPLE = [
	{
		"First Name": "John",
		"Last Name": "Doe",
		Email: "john.doe@example.com",
		Phone: "08012345678",
	},
]

const OPTIONAL_SAMPLE = [
	{
		Email: "member@example.com",
		"IPPIS Number": "12345678901",
		"FRSC PIN": "FRSC-PIN-001",
		Phone: "08012345678",
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
	},
]

export async function GET(request: NextRequest) {
	try {
		const kind = request.nextUrl.searchParams.get("type") === "optional_details" ? "optional" : "mandatory"
		const sampleData = kind === "optional" ? OPTIONAL_SAMPLE : MANDATORY_SAMPLE
		const filename =
			kind === "optional" ? "members_additional_details_template.xlsx" : "members_mandatory_template.xlsx"

		const workbook = XLSX.utils.book_new()
		const worksheet = XLSX.utils.json_to_sheet(sampleData)

		if (kind === "mandatory") {
			worksheet["!cols"] = [{ wch: 14 }, { wch: 14 }, { wch: 28 }, { wch: 14 }]
		} else {
			worksheet["!cols"] = Array(18).fill({ wch: 16 })
		}

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
