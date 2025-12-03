/**
 * CSV Export Utility
 * Exports data to CSV format and triggers download
 * Mobile-friendly implementation
 */

import toast from 'react-hot-toast'

export function exportToCSV(
  data: Record<string, string | number>[],
  filename: string
): void {
  if (!data || data.length === 0) {
    toast.error('No data to export', {
      duration: 3000,
      position: 'top-center',
      icon: '⚠️',
    })
    return
  }

  const toastId = toast.loading('Preparing export...', {
    position: 'top-center',
    style: {
      background: 'linear-gradient(135deg, hsl(46 72% 68% / 0.1), hsl(288 50% 35% / 0.1))',
      border: '1px solid hsl(46 72% 68% / 0.2)',
    },
  })

  try {

  // Get headers from first object
  const headers = Object.keys(data[0])

  // Create CSV content
  const csvRows: string[] = []

  // Add headers
  csvRows.push(headers.join(','))

  // Add data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header]
      // Handle values that might contain commas or quotes
      if (value === null || value === undefined) {
        return ''
      }
      const stringValue = String(value)
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    })
    csvRows.push(values.join(','))
  }

  // Create CSV string
  const csvContent = csvRows.join('\n')

  // Create Blob
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })

  // Create download link
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'

  // Append to body, click, and remove
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

    // Clean up URL
    URL.revokeObjectURL(url)

    // Show success toast
    toast.success(`Exported: ${filename}.csv`, {
      id: toastId,
      duration: 3000,
      position: 'top-center',
      icon: '📥',
      style: {
        background: 'linear-gradient(135deg, hsl(46 72% 68% / 0.1), hsl(288 50% 35% / 0.1))',
        border: '1px solid hsl(46 72% 68% / 0.2)',
      },
    })
  } catch (error) {
    console.error('CSV export failed:', error)
    toast.error('Export failed. Please try again.', {
      id: toastId,
      duration: 4000,
      position: 'top-center',
      icon: '❌',
      style: {
        background: 'linear-gradient(135deg, hsl(0 65% 55% / 0.1), hsl(0 60% 50% / 0.1))',
        border: '1px solid hsl(0 65% 55% / 0.3)',
      },
    })
  }
}

/**
 * Format date for filename
 */
export function formatDateForFilename(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

