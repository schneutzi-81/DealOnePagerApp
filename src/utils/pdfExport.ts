import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Captures the element with id="pdf-preview" and exports it as a PDF download.
 */
export async function exportToPDF(filename = 'deal-one-pager.pdf'): Promise<void> {
  const element = document.getElementById('pdf-preview');
  if (!element) {
    throw new Error('PDF preview element not found');
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  // A4 dimensions in mm
  const pdfWidth = 210;
  const pdfHeight = 297;

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  // Calculate how many A4 pages are needed
  const imgWidthMm = pdfWidth;
  const imgHeightMm = (canvasHeight * pdfWidth) / canvasWidth;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let yOffset = 0;
  let remainingHeight = imgHeightMm;

  while (remainingHeight > 0) {
    const pageHeight = Math.min(remainingHeight, pdfHeight);
    const srcY = (yOffset / imgHeightMm) * canvasHeight;
    const srcHeight = (pageHeight / imgHeightMm) * canvasHeight;

    // Create a temporary canvas for this page slice
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvasWidth;
    pageCanvas.height = srcHeight;
    const ctx = pageCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(canvas, 0, srcY, canvasWidth, srcHeight, 0, 0, canvasWidth, srcHeight);
    }

    const pageImgData = pageCanvas.toDataURL('image/png');

    if (yOffset > 0) {
      pdf.addPage();
    }

    pdf.addImage(pageImgData, 'PNG', 0, 0, imgWidthMm, pageHeight);

    yOffset += pdfHeight;
    remainingHeight -= pdfHeight;
  }

  pdf.save(filename);
}
