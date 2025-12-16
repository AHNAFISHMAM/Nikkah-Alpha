import { logError, logDebug } from './logger'

/**
 * Generate PDF from module content with Arabic support and full metadata.
 * Includes: estimated time, learning objectives, key takeaways, reflection questions.
 */
export async function generateModulePDF(
  moduleTitle: string,
  moduleDescription: string,
  moduleContent: string,
  userNotes: string,
  isCompleted: boolean,
  completedAt?: string | null,
  estimatedTime?: string,
  learningObjectives?: string[],
  keyTakeaways?: string[],
  reflectionQuestions?: string[]
): Promise<void> {
  try {
    // Runtime debug information to verify the new generator is being used
    logDebug('[PDF] generateModulePDF called', {
      moduleTitle,
      hasDescription: !!moduleDescription,
      hasContent: !!moduleContent,
      hasNotes: !!userNotes,
      isCompleted,
      completedAt,
      estimatedTime,
      learningObjectivesCount: learningObjectives?.length ?? 0,
      keyTakeawaysCount: keyTakeaways?.length ?? 0,
      reflectionQuestionsCount: reflectionQuestions?.length ?? 0,
    })

    // Lazy load jsPDF only when PDF generation is requested
    const jsPDFModule = await import('jspdf')
    const jsPDF = jsPDFModule.default || jsPDFModule

    if (!jsPDF) {
      throw new Error('jsPDF library failed to load. Please refresh the page and try again.')
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const maxWidth = pageWidth - 2 * margin
    let yPosition = margin

    // Detect Arabic characters
    const containsArabic = (text: string): boolean => {
      if (!text) return false
      const arabicRegex =
        /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/
      return arabicRegex.test(text)
    }

    // Helper: new page if needed
    const checkNewPage = (requiredHeight: number) => {
      if (yPosition + requiredHeight > pageHeight - margin) {
        doc.addPage()
        yPosition = margin
        return true
      }
      return false
    }

    // Add text with Arabic support and basic RTL alignment
    const addText = (
      text: string,
      fontSize: number,
      isBold = false,
      color?: [number, number, number],
      xOffset = 0
    ) => {
      if (!text || text.trim() === '') return

      const hasArabic = containsArabic(text)

      doc.setFontSize(fontSize)
      doc.setFont('helvetica', isBold ? 'bold' : 'normal')

      if (color) {
        doc.setTextColor(color[0], color[1], color[2])
      } else {
        doc.setTextColor(0, 0, 0)
      }

      let processedText = text
      if (hasArabic && typeof (doc as any).processArabic === 'function') {
        try {
          processedText = (doc as any).processArabic(text)
        } catch {
          processedText = text
        }
      }

      const textX = hasArabic ? pageWidth - margin - xOffset : margin + xOffset
      const alignment = hasArabic ? 'right' : 'left'

      const lines = doc.splitTextToSize(processedText, maxWidth - xOffset)
      lines.forEach((line: string) => {
        checkNewPage(7)
        if (alignment === 'right') {
          doc.text(line, textX, yPosition, {
            align: 'right',
            maxWidth: maxWidth - xOffset,
          })
        } else {
          doc.text(line, textX, yPosition)
        }
        yPosition += 7
      })
    }

    // Strip HTML safely, preserving Arabic text content
    const stripHTML = (html: string): string => {
      if (!html) return ''

      if (typeof document === 'undefined') {
        return html
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\s+/g, ' ')
          .trim()
      }

      try {
        const tmp = document.createElement('DIV')
        tmp.innerHTML = html
        return tmp.textContent || tmp.innerText || ''
      } catch {
        return html
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\s+/g, ' ')
          .trim()
      }
    }

    // Extract Arabic verses separately from HTML
    const extractArabicVerses = (html: string): string[] => {
      if (typeof document === 'undefined') return []
      try {
        const tmp = document.createElement('DIV')
        tmp.innerHTML = html
        const arabicElements = tmp.querySelectorAll(
          '.arabic[dir="rtl"], p.arabic[dir="rtl"]'
        )
        return Array.from(arabicElements)
          .map((el) => el.textContent || '')
          .filter((text) => text.trim() !== '')
      } catch {
        return []
      }
    }

    // Header with brand color
    doc.setFillColor(0, 255, 135) // Brand green
    doc.rect(0, 0, pageWidth, 30, 'F')

    // Header text
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Module Summary', margin, 15)

    yPosition = 40

    // Module Title
    if (moduleTitle) {
      doc.setTextColor(0, 0, 0)
      addText(moduleTitle, 18, true)
      yPosition += 5
    }

    // Description
    if (moduleDescription) {
      addText(moduleDescription, 12)
      yPosition += 5
    }

    // Estimated Time
    if (estimatedTime) {
      addText(`Estimated Time: ${estimatedTime}`, 10, false, [100, 100, 100])
      yPosition += 3
    }

    // Completion Status
    const statusCircleX = margin + 5
    const statusCircleY = yPosition
    const statusTextOffset = 12

    if (isCompleted) {
      doc.setFillColor(0, 200, 0)
      doc.circle(statusCircleX, statusCircleY, 3, 'F')
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 150, 0)
      const statusText = 'Status: Completed'
      const statusLines = doc.splitTextToSize(statusText, maxWidth - statusTextOffset)
      statusLines.forEach((line: string) => {
        doc.text(line, margin + statusTextOffset, yPosition)
        yPosition += 7
      })
      if (completedAt) {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(0, 0, 0)
        const dateText = `Completed on: ${new Date(completedAt).toLocaleDateString()}`
        const dateLines = doc.splitTextToSize(dateText, maxWidth)
        dateLines.forEach((line: string) => {
          yPosition += 2
          doc.text(line, margin, yPosition)
          yPosition += 7
        })
      }
    } else {
      doc.setFillColor(200, 200, 200)
      doc.circle(statusCircleX, statusCircleY, 3, 'F')
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(100, 100, 100)
      const statusText = 'Status: In Progress'
      const statusLines = doc.splitTextToSize(statusText, maxWidth - statusTextOffset)
      statusLines.forEach((line: string) => {
        doc.text(line, margin + statusTextOffset, yPosition)
        yPosition += 7
      })
    }
    yPosition += 10

    // Generated date
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
    const generatedDate = `Generated on: ${new Date().toLocaleDateString()}`
    const dateLines = doc.splitTextToSize(generatedDate, maxWidth)
    dateLines.forEach((line: string) => {
      doc.text(line, margin, yPosition)
      yPosition += 7
    })
    yPosition += 3

    // Divider
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 10

    // Learning Objectives
    if (learningObjectives && learningObjectives.length > 0) {
      addText('Learning Objectives', 14, true)
      yPosition += 5
      learningObjectives.forEach((item) => {
        checkNewPage(10)
        addText(`• ${item}`, 11, false, undefined, 5)
        yPosition += 2
      })
      yPosition += 5
    }

    // Module Content with Arabic
    if (moduleContent) {
      addText('Module Content', 14, true)
      yPosition += 5

      const arabicVerses = extractArabicVerses(moduleContent)
      const plainContent = stripHTML(moduleContent).replace(/\s+/g, ' ').trim()

      // Arabic verses first
      arabicVerses.forEach((verse) => {
        if (verse.trim()) {
          checkNewPage(15)
          addText(verse.trim(), 12, false, undefined, 0)
          yPosition += 5
        }
      })

      // English content (with verses removed to avoid duplication)
      if (plainContent) {
        let englishContent = plainContent
        arabicVerses.forEach((verse) => {
          englishContent = englishContent.replace(verse.trim(), '')
        })
        const chunks = englishContent.match(/.{1,2000}/g) || [englishContent]
        chunks.forEach((chunk, index) => {
          if (chunk.trim()) {
            if (index > 0) {
              checkNewPage(15)
              yPosition += 5
            }
            addText(chunk.trim(), 11)
          }
        })
      }

      yPosition += 10
    }

    // Key Takeaways
    if (keyTakeaways && keyTakeaways.length > 0) {
      checkNewPage(20)
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10
      addText('Key Takeaways', 14, true)
      yPosition += 5
      keyTakeaways.forEach((item) => {
        checkNewPage(10)
        addText(`• ${item}`, 11, false, undefined, 5)
        yPosition += 2
      })
      yPosition += 5
    }

    // User Notes
    if (userNotes && userNotes.trim()) {
      checkNewPage(20)
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10
      addText('Your Notes', 14, true)
      yPosition += 5
      const noteChunks = userNotes.match(/.{1,2000}/g) || [userNotes]
      noteChunks.forEach((chunk, index) => {
        if (index > 0) {
          checkNewPage(15)
          yPosition += 5
        }
        addText(chunk, 11)
      })
      yPosition += 5
    }

    // Reflection Questions
    if (reflectionQuestions && reflectionQuestions.length > 0) {
      checkNewPage(20)
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10
      addText('Reflection Questions', 14, true)
      yPosition += 5
      reflectionQuestions.forEach((item, index) => {
        checkNewPage(10)
        addText(`${index + 1}. ${item}`, 11, false, undefined, 5)
        yPosition += 2
      })
      yPosition += 5
    }

    // Footer on all pages
    const totalPages = doc.internal.pages.length - 1
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(150, 150, 150)
      doc.text(
        `Page ${i} of ${totalPages} - NikahPrep Module Summary`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )
    }

    // Save PDF
    const sanitizedTitle = moduleTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const dateStr = new Date().toISOString().split('T')[0]
    const fileName = `${sanitizedTitle}_summary_${dateStr}.pdf`

    doc.save(fileName)
  } catch (error) {
    logError('PDF Generation Error', error, 'modulePdf')

    if (error instanceof Error) {
      if (error.message.includes('jsPDF')) {
        throw new Error('PDF library failed to load. Please refresh the page and try again.')
      }
      if (error.message.includes('text')) {
        throw new Error('Error adding text to PDF. Please check the module content.')
      }
      throw new Error(`PDF generation failed: ${error.message}`)
    }

    throw new Error('An unknown error occurred while generating the PDF. Please try again.')
  }
}
