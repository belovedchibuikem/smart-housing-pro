import * as XLSX from 'xlsx'

export interface ParseResult {
  data: any[]
  errors: string[]
}

/**
 * Properly parse CSV line handling quoted fields and escaped quotes
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  // Add last field
  result.push(current.trim())
  
  return result
}

/**
 * Parse CSV file content
 */
function parseCSVContent(text: string): ParseResult {
  const data: any[] = []
  const errors: string[] = []
  
  // Handle different line endings
  const lines = text.split(/\r?\n/).filter(line => line.trim())
  
  if (lines.length === 0) {
    errors.push('File is empty')
    return { data, errors }
  }
  
  // Parse header
  const headers = parseCSVLine(lines[0]).map(h => h.trim())
  
  if (headers.length === 0) {
    errors.push('No headers found in file')
    return { data, errors }
  }
  
  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    try {
      const values = parseCSVLine(line)
      
      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Expected ${headers.length} columns, found ${values.length}`)
        continue
      }
      
      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      
      data.push(row)
    } catch (error) {
      errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`)
    }
  }
  
  return { data, errors }
}

/**
 * Parse Excel file (XLSX or XLS)
 */
function parseExcelFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    const errors: string[] = []
    
    reader.onload = (e) => {
      try {
        const fileData = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(fileData, { type: 'array' })
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0]
        if (!firstSheetName) {
          errors.push('No sheets found in Excel file')
          resolve({ data: [], errors })
          return
        }
        
        const worksheet = workbook.Sheets[firstSheetName]
        
        // Convert to JSON with header row
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
          raw: false,
        }) as any[][]
        
        if (jsonData.length === 0) {
          errors.push('Excel file is empty')
          resolve({ data: [], errors })
          return
        }
        
        // First row is headers
        const headers = (jsonData[0] || []).map((h: any) => String(h).trim()).filter((h: string) => h)
        
        if (headers.length === 0) {
          errors.push('No headers found in Excel file')
          resolve({ data: [], errors })
          return
        }
        
        // Convert rows to objects
        const data: any[] = []
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i]
          if (!row || row.length === 0) continue
          
          // Check if row is empty (all empty cells)
          const isEmpty = row.every((cell: any) => !cell || String(cell).trim() === '')
          if (isEmpty) continue
          
          const rowObj: any = {}
          let hasData = false
          
          headers.forEach((header, index) => {
            const value = row[index]
            rowObj[header] = value !== undefined && value !== null ? String(value).trim() : ''
            if (rowObj[header]) hasData = true
          })
          
          if (hasData) {
            // Check column count
            const nonEmptyCells = row.filter((cell: any) => cell !== undefined && cell !== null && String(cell).trim() !== '')
            if (nonEmptyCells.length > headers.length) {
              errors.push(`Row ${i + 1}: More columns than headers (${nonEmptyCells.length} > ${headers.length})`)
            } else {
              data.push(rowObj)
            }
          }
        }
        
        resolve({ data, errors })
      } catch (error) {
        errors.push(`Error parsing Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`)
        resolve({ data: [], errors })
      }
    }
    
    reader.onerror = () => {
      errors.push('Error reading Excel file')
      resolve({ data: [], errors })
    }
    
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Parse CSV file content
 */
function parseCSVFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const result = parseCSVContent(text)
        resolve(result)
      } catch (error) {
        resolve({
          data: [],
          errors: [`Error parsing CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`],
        })
      }
    }
    
    reader.onerror = () => {
      resolve({
        data: [],
        errors: ['Error reading CSV file'],
      })
    }
    
    reader.readAsText(file, 'UTF-8')
  })
}

/**
 * Parse file (CSV or Excel) and return data with errors
 */
export async function parseFile(file: File): Promise<ParseResult> {
  const fileName = file.name.toLowerCase()
  const fileExtension = fileName.split('.').pop()?.toLowerCase()
  
  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return {
      data: [],
      errors: ['File size exceeds 10MB limit'],
    }
  }
  
  // Parse based on file type
  if (fileExtension === 'xlsx' || fileExtension === 'xls') {
    return await parseExcelFile(file)
  } else if (fileExtension === 'csv' || fileExtension === 'txt') {
    return await parseCSVFile(file)
  } else {
    return {
      data: [],
      errors: [`Unsupported file type: ${fileExtension}. Please use CSV, XLSX, or XLS files.`],
    }
  }
}

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV(data: any[], headers?: string[]): string {
  if (data.length === 0) return ''
  
  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0])
  
  // Escape values that contain commas or quotes
  const escapeCSVValue = (value: any): string => {
    const str = String(value ?? '')
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }
  
  // Build CSV
  const rows = [
    csvHeaders.map(escapeCSVValue).join(','),
    ...data.map(row => csvHeaders.map(header => escapeCSVValue(row[header] ?? '')).join(',')),
  ]
  
  return rows.join('\n')
}

/**
 * Convert array of objects to Excel buffer
 */
export function arrayToExcel(data: any[], headers?: string[], sheetName: string = 'Sheet1'): ArrayBuffer {
  const workbook = XLSX.utils.book_new()
  
  if (data.length === 0) {
    // Create empty sheet with headers
    const csvHeaders = headers || []
    const worksheet = XLSX.utils.aoa_to_sheet([csvHeaders])
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  } else {
    // Get headers from first object if not provided
    const csvHeaders = headers || Object.keys(data[0])
    
    // Convert data to array of arrays
    const rows = [
      csvHeaders,
      ...data.map(row => csvHeaders.map(header => row[header] ?? '')),
    ]
    
    const worksheet = XLSX.utils.aoa_to_sheet(rows)
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  }
  
  return XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
}

