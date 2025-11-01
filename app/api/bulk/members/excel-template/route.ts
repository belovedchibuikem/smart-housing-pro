import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
  try {
    // Create sample data
    const sampleData = [
      {
        'First Name': 'John',
        'Last Name': 'Doe',
        'Email': 'john.doe@frsc.gov.ng',
        'Phone': '08012345678',
        'Staff ID': 'FRSC/2024/001',
        'IPPIS Number': 'IPPIS001',
        'Date of Birth (YYYY-MM-DD)': '1990-01-15',
        'Gender (Male/Female)': 'Male',
        'Marital Status (Single/Married/Divorced/Widowed)': 'Single',
        'Nationality': 'Nigerian',
        'State of Origin': 'Lagos',
        'LGA': 'Ikeja',
        'Residential Address': '123 Main Street, Victoria Island',
        'City': 'Lagos',
        'State': 'Lagos',
        'Rank': 'Inspector',
        'Department': 'Operations',
        'Command State': 'Lagos',
        'Employment Date (YYYY-MM-DD)': '2020-01-15',
        'Years of Service': '4',
        'Membership Type (Regular/Associate)': 'Regular'
      },
      {
        'First Name': 'Jane',
        'Last Name': 'Smith',
        'Email': 'jane.smith@frsc.gov.ng',
        'Phone': '08087654321',
        'Staff ID': 'FRSC/2024/002',
        'IPPIS Number': 'IPPIS002',
        'Date of Birth (YYYY-MM-DD)': '1988-05-20',
        'Gender (Male/Female)': 'Female',
        'Marital Status (Single/Married/Divorced/Widowed)': 'Married',
        'Nationality': 'Nigerian',
        'State of Origin': 'Abuja',
        'LGA': 'Garki',
        'Residential Address': '456 Independence Avenue',
        'City': 'Abuja',
        'State': 'FCT',
        'Rank': 'Assistant Inspector',
        'Department': 'Admin',
        'Command State': 'FCT',
        'Employment Date (YYYY-MM-DD)': '2019-03-10',
        'Years of Service': '5',
        'Membership Type (Regular/Associate)': 'Regular'
      }
    ]

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(sampleData)

    // Set column widths
    const columnWidths = [
      { wch: 15 }, // First Name
      { wch: 15 }, // Last Name
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 15 }, // Staff ID
      { wch: 15 }, // IPPIS Number
      { wch: 20 }, // Date of Birth
      { wch: 10 }, // Gender
      { wch: 15 }, // Marital Status
      { wch: 15 }, // Nationality
      { wch: 15 }, // State of Origin
      { wch: 15 }, // LGA
      { wch: 30 }, // Residential Address
      { wch: 15 }, // City
      { wch: 15 }, // State
      { wch: 15 }, // Rank
      { wch: 15 }, // Department
      { wch: 15 }, // Command State
      { wch: 20 }, // Employment Date
      { wch: 15 }, // Years of Service
      { wch: 20 }  // Membership Type
    ]
    worksheet['!cols'] = columnWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Members Template')

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Return Excel file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="members_upload_template.xlsx"',
      },
    })
  } catch (error) {
    console.error('Excel template generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate Excel template' },
      { status: 500 }
    )
  }
}




