// server/certificate.js

/**
 * Generate a simple PDF certificate for a given user.
 * This is a lightweight stub suitable for demonstration and early
 * development. In production you would enrich it with branding, logos,
 * course details, dates, signatures, etc.
 */
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs'; // only for optional logo loading

export async function generateCertificate(userId) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Background gradient / decorative header
      const width = doc.page.width;
      const height = doc.page.height;
      const gradient = doc.linearGradient(0, 0, width, 0)
        .stop(0, '#4e54c8')
        .stop(1, '#8f94fb');
      doc.rect(0, 0, width, 120).fill(gradient);

      // Title
      doc
        .fontSize(36)
        .fillColor('#ffffff')
        .font('Helvetica-Bold')
        .text('Certificate of Completion', { align: 'center', valign: 'center' });

      // Main content area
      doc.moveDown(4);
      doc
        .fontSize(20)
        .fillColor('#333333')
        .font('Helvetica')
        .text(`This certifies that`, { align: 'center' })
        .moveDown(0.5)
        .font('Helvetica-Bold')
        .text(userId, { align: 'center' })
        .moveDown(0.5)
        .font('Helvetica')
        .text('has successfully completed the course', { align: 'center' })
        .moveDown(0.5)
        .font('Helvetica-Bold')
        .text('Shamutha AI EdTech', { align: 'center' })
        .moveDown(2);

      const issueDate = new Date().toLocaleDateString();
      doc
        .fontSize(14)
        .font('Helvetica')
        .text(`Date: ${issueDate}`, 70, doc.y)
        .text('Signature:', width - 170, doc.y);

      // Optional: draw a simple line for signature
      doc.moveTo(width - 150, doc.y + 15).lineTo(width - 70, doc.y + 15).stroke();

      // Finalize PDF
      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

export default { generateCertificate };
