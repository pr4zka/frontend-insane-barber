import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "./constants";

interface PdfOptions {
  title: string;
  subtitle?: string;
  columns: string[];
  rows: (string | number)[][];
  filename: string;
  totals?: { label: string; value: string }[];
  orientation?: "portrait" | "landscape";
}

export function generatePdf(options: PdfOptions) {
  const {
    title,
    subtitle,
    columns,
    rows,
    filename,
    totals,
    orientation = "portrait",
  } = options;

  const doc = new jsPDF({ orientation });

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Insane Barber", 14, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Sistema de Gestion", 14, 26);

  // Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text(title, 14, 38);

  if (subtitle) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(subtitle, 14, 44);
  }

  // Date
  const now = new Date().toLocaleString("es-PY");
  doc.setFontSize(8);
  doc.setTextColor(120);
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.text(`Generado: ${now}`, pageWidth - 14, 20, { align: "right" });

  // Table
  const startY = subtitle ? 50 : 44;

  autoTable(doc, {
    startY,
    head: [columns],
    body: rows.map((row) => row.map(String)),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: [30, 30, 30],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 },
  });

  // Totals
  if (totals && totals.length > 0) {
    const finalY = (doc as any).lastAutoTable?.finalY ?? startY + 20;
    let y = finalY + 10;
    doc.setFontSize(10);
    doc.setTextColor(0);

    for (const t of totals) {
      doc.setFont("helvetica", "bold");
      doc.text(t.label + ":", 14, y);
      doc.setFont("helvetica", "normal");
      doc.text(t.value, 80, y);
      y += 7;
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Pagina ${i} de ${pageCount}`,
      pageWidth - 14,
      pageHeight - 10,
      { align: "right" }
    );
    doc.text("Insane Barber - Informe Web", 14, pageHeight - 10);
  }

  doc.save(`${filename}.pdf`);
}

export function formatPdfCurrency(amount: number): string {
  return formatCurrency(amount);
}
