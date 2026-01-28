import jsPDF from 'jspdf';

export interface ReportMetadata {
  title: string;
  projectName?: string;
  preparedBy?: string;
  reviewedBy?: string;
  date: Date;
  calculationType: string;
}

export interface ReportSection {
  title: string;
  items: { label: string; value: string; unit?: string }[];
}

export interface MethodologyReference {
  name: string;
  equation?: string;
  source: string;
  notes?: string;
}

export interface ReportData {
  metadata: ReportMetadata;
  inputs: ReportSection;
  results: ReportSection[];
  methodology: MethodologyReference[];
  notes?: string;
  warnings?: string[];
}

const COLORS = {
  primary: [59, 130, 246] as [number, number, number],      // Blue
  secondary: [100, 116, 139] as [number, number, number],   // Slate
  accent: [34, 197, 94] as [number, number, number],        // Green
  warning: [245, 158, 11] as [number, number, number],      // Amber
  error: [239, 68, 68] as [number, number, number],         // Red
  dark: [30, 41, 59] as [number, number, number],           // Slate 800
  light: [248, 250, 252] as [number, number, number],       // Slate 50
  border: [226, 232, 240] as [number, number, number],      // Slate 200
};

const FONTS = {
  title: 18,
  heading: 14,
  subheading: 12,
  body: 10,
  small: 8,
};

const MARGINS = {
  left: 20,
  right: 20,
  top: 20,
  bottom: 25,
};

class PDFReportGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private contentWidth: number;
  private currentY: number;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.contentWidth = this.pageWidth - MARGINS.left - MARGINS.right;
    this.currentY = MARGINS.top;
  }

  private checkPageBreak(neededHeight: number): void {
    if (this.currentY + neededHeight > this.pageHeight - MARGINS.bottom) {
      this.doc.addPage();
      this.currentY = MARGINS.top;
      this.addPageNumber();
    }
  }

  private addPageNumber(): void {
    const pageNum = this.doc.getNumberOfPages();
    this.doc.setFontSize(FONTS.small);
    this.doc.setTextColor(...COLORS.secondary);
    this.doc.text(
      `Page ${pageNum}`,
      this.pageWidth / 2,
      this.pageHeight - 10,
      { align: 'center' }
    );
  }

  private drawHeader(metadata: ReportMetadata): void {
    // Header background
    this.doc.setFillColor(...COLORS.primary);
    this.doc.rect(0, 0, this.pageWidth, 45, 'F');

    // Logo/Title area
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(FONTS.title);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('HYDRAULIC CALCULATION REPORT', MARGINS.left, 18);

    this.doc.setFontSize(FONTS.heading);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(metadata.title, MARGINS.left, 28);

    this.doc.setFontSize(FONTS.body);
    this.doc.text(`Calculator: ${metadata.calculationType}`, MARGINS.left, 38);

    // Document ID
    const docId = `DOC-${Date.now().toString(36).toUpperCase()}`;
    this.doc.setFontSize(FONTS.small);
    this.doc.text(docId, this.pageWidth - MARGINS.right, 38, { align: 'right' });

    this.currentY = 55;

    // Report metadata box
    this.doc.setFillColor(...COLORS.light);
    this.doc.setDrawColor(...COLORS.border);
    this.doc.roundedRect(MARGINS.left, this.currentY, this.contentWidth, 28, 2, 2, 'FD');

    const col1 = MARGINS.left + 5;
    const col2 = MARGINS.left + this.contentWidth / 3;
    const col3 = MARGINS.left + (2 * this.contentWidth) / 3;

    this.doc.setTextColor(...COLORS.secondary);
    this.doc.setFontSize(FONTS.small);
    this.doc.text('Prepared By:', col1, this.currentY + 8);
    this.doc.text('Project:', col2, this.currentY + 8);
    this.doc.text('Date:', col3, this.currentY + 8);

    this.doc.setTextColor(...COLORS.dark);
    this.doc.setFontSize(FONTS.body);
    this.doc.text(metadata.preparedBy || 'N/A', col1, this.currentY + 16);
    this.doc.text(metadata.projectName || 'N/A', col2, this.currentY + 16);
    this.doc.text(this.formatDate(metadata.date), col3, this.currentY + 16);

    this.doc.setTextColor(...COLORS.secondary);
    this.doc.setFontSize(FONTS.small);
    this.doc.text('Reviewed By:', col1, this.currentY + 23);
    this.doc.text(metadata.reviewedBy || '________________', col1 + 25, this.currentY + 23);

    this.currentY += 38;
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private drawSectionHeader(title: string, icon?: string): void {
    this.checkPageBreak(15);
    
    this.doc.setFillColor(...COLORS.primary);
    this.doc.rect(MARGINS.left, this.currentY, 3, 8, 'F');
    
    this.doc.setTextColor(...COLORS.dark);
    this.doc.setFontSize(FONTS.heading);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title.toUpperCase(), MARGINS.left + 6, this.currentY + 6);
    
    this.currentY += 12;
  }

  private drawInputsTable(inputs: ReportSection): void {
    this.drawSectionHeader(inputs.title);
    
    const tableWidth = this.contentWidth;
    const colWidths = [tableWidth * 0.5, tableWidth * 0.35, tableWidth * 0.15];
    const rowHeight = 8;

    // Table header
    this.doc.setFillColor(...COLORS.dark);
    this.doc.rect(MARGINS.left, this.currentY, tableWidth, rowHeight, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(FONTS.small);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Parameter', MARGINS.left + 3, this.currentY + 5.5);
    this.doc.text('Value', MARGINS.left + colWidths[0] + 3, this.currentY + 5.5);
    this.doc.text('Unit', MARGINS.left + colWidths[0] + colWidths[1] + 3, this.currentY + 5.5);
    
    this.currentY += rowHeight;

    // Table rows
    inputs.items.forEach((item, index) => {
      this.checkPageBreak(rowHeight);
      
      const bgColor = index % 2 === 0 ? COLORS.light : [255, 255, 255] as [number, number, number];
      this.doc.setFillColor(...bgColor);
      this.doc.rect(MARGINS.left, this.currentY, tableWidth, rowHeight, 'F');
      
      this.doc.setTextColor(...COLORS.dark);
      this.doc.setFontSize(FONTS.body);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(item.label, MARGINS.left + 3, this.currentY + 5.5);
      
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(item.value, MARGINS.left + colWidths[0] + 3, this.currentY + 5.5);
      
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(...COLORS.secondary);
      this.doc.text(item.unit || '', MARGINS.left + colWidths[0] + colWidths[1] + 3, this.currentY + 5.5);
      
      this.currentY += rowHeight;
    });

    // Table border
    this.doc.setDrawColor(...COLORS.border);
    this.doc.rect(MARGINS.left, this.currentY - rowHeight * inputs.items.length - rowHeight, tableWidth, rowHeight * (inputs.items.length + 1));

    this.currentY += 8;
  }

  private drawResultsSection(results: ReportSection): void {
    this.drawSectionHeader(results.title);
    
    const cardWidth = (this.contentWidth - 10) / 2;
    const cardHeight = 20;
    let xPos = MARGINS.left;
    let startY = this.currentY;
    
    results.items.forEach((item, index) => {
      if (index % 2 === 0 && index > 0) {
        xPos = MARGINS.left;
        startY += cardHeight + 5;
        this.checkPageBreak(cardHeight + 5);
      }

      // Result card
      this.doc.setFillColor(...COLORS.light);
      this.doc.setDrawColor(...COLORS.border);
      this.doc.roundedRect(xPos, startY, cardWidth, cardHeight, 2, 2, 'FD');
      
      this.doc.setTextColor(...COLORS.secondary);
      this.doc.setFontSize(FONTS.small);
      this.doc.text(item.label, xPos + 4, startY + 7);
      
      this.doc.setTextColor(...COLORS.primary);
      this.doc.setFontSize(FONTS.heading);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(item.value, xPos + 4, startY + 15);
      
      if (item.unit) {
        this.doc.setTextColor(...COLORS.secondary);
        this.doc.setFontSize(FONTS.small);
        this.doc.setFont('helvetica', 'normal');
        const valueWidth = this.doc.getTextWidth(item.value);
        this.doc.text(` ${item.unit}`, xPos + 4 + valueWidth + 2, startY + 15);
      }
      
      xPos += cardWidth + 10;
    });

    this.currentY = startY + cardHeight + 10;
  }

  private drawMethodology(methodology: MethodologyReference[]): void {
    this.drawSectionHeader('Methodology & References');
    
    methodology.forEach((method, index) => {
      this.checkPageBreak(30);
      
      // Method box
      this.doc.setFillColor(...COLORS.light);
      this.doc.setDrawColor(...COLORS.border);
      
      let boxHeight = 22;
      if (method.equation) boxHeight += 10;
      if (method.notes) boxHeight += 8;
      
      this.doc.roundedRect(MARGINS.left, this.currentY, this.contentWidth, boxHeight, 2, 2, 'FD');
      
      // Method name
      this.doc.setTextColor(...COLORS.dark);
      this.doc.setFontSize(FONTS.subheading);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${index + 1}. ${method.name}`, MARGINS.left + 4, this.currentY + 8);
      
      let innerY = this.currentY + 14;
      
      // Equation
      if (method.equation) {
        this.doc.setFillColor(255, 255, 255);
        this.doc.roundedRect(MARGINS.left + 4, innerY - 3, this.contentWidth - 8, 10, 1, 1, 'F');
        
        this.doc.setTextColor(...COLORS.primary);
        this.doc.setFontSize(FONTS.body);
        this.doc.setFont('courier', 'normal');
        this.doc.text(method.equation, MARGINS.left + 8, innerY + 3);
        innerY += 12;
      }
      
      // Source
      this.doc.setTextColor(...COLORS.secondary);
      this.doc.setFontSize(FONTS.small);
      this.doc.setFont('helvetica', 'italic');
      this.doc.text(`Source: ${method.source}`, MARGINS.left + 4, innerY);
      innerY += 6;
      
      // Notes
      if (method.notes) {
        this.doc.setTextColor(...COLORS.dark);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(method.notes, MARGINS.left + 4, innerY);
      }
      
      this.currentY += boxHeight + 5;
    });

    this.currentY += 5;
  }

  private drawWarnings(warnings: string[]): void {
    if (!warnings.length) return;
    
    this.checkPageBreak(20);
    
    this.doc.setFillColor(254, 243, 199); // Amber 100
    this.doc.setDrawColor(...COLORS.warning);
    this.doc.roundedRect(MARGINS.left, this.currentY, this.contentWidth, 8 + warnings.length * 6, 2, 2, 'FD');
    
    this.doc.setTextColor(...COLORS.warning);
    this.doc.setFontSize(FONTS.body);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('⚠ WARNINGS', MARGINS.left + 4, this.currentY + 6);
    
    this.doc.setTextColor(...COLORS.dark);
    this.doc.setFont('helvetica', 'normal');
    warnings.forEach((warning, index) => {
      this.doc.text(`• ${warning}`, MARGINS.left + 4, this.currentY + 12 + index * 6);
    });
    
    this.currentY += 14 + warnings.length * 6;
  }

  private drawNotes(notes: string): void {
    if (!notes) return;
    
    this.checkPageBreak(25);
    this.drawSectionHeader('Notes & Assumptions');
    
    this.doc.setTextColor(...COLORS.dark);
    this.doc.setFontSize(FONTS.body);
    this.doc.setFont('helvetica', 'normal');
    
    const lines = this.doc.splitTextToSize(notes, this.contentWidth - 10);
    lines.forEach((line: string) => {
      this.checkPageBreak(6);
      this.doc.text(line, MARGINS.left + 5, this.currentY);
      this.currentY += 5;
    });
    
    this.currentY += 5;
  }

  private drawFooter(): void {
    const totalPages = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      
      // Footer line
      this.doc.setDrawColor(...COLORS.border);
      this.doc.line(MARGINS.left, this.pageHeight - 18, this.pageWidth - MARGINS.right, this.pageHeight - 18);
      
      // Footer text
      this.doc.setTextColor(...COLORS.secondary);
      this.doc.setFontSize(FONTS.small);
      this.doc.text(
        'Generated by ICM River Reach Academy • For engineering review purposes',
        MARGINS.left,
        this.pageHeight - 12
      );
      this.doc.text(
        `Page ${i} of ${totalPages}`,
        this.pageWidth - MARGINS.right,
        this.pageHeight - 12,
        { align: 'right' }
      );
    }
  }

  private drawQASignature(): void {
    this.checkPageBreak(45);
    this.drawSectionHeader('QA/QC Review');
    
    const boxWidth = (this.contentWidth - 10) / 2;
    const boxHeight = 30;
    
    // Prepared by box
    this.doc.setDrawColor(...COLORS.border);
    this.doc.rect(MARGINS.left, this.currentY, boxWidth, boxHeight);
    this.doc.setTextColor(...COLORS.secondary);
    this.doc.setFontSize(FONTS.small);
    this.doc.text('Prepared By:', MARGINS.left + 4, this.currentY + 8);
    this.doc.line(MARGINS.left + 4, this.currentY + 18, MARGINS.left + boxWidth - 8, this.currentY + 18);
    this.doc.text('Signature / Date', MARGINS.left + 4, this.currentY + 26);
    
    // Reviewed by box
    this.doc.rect(MARGINS.left + boxWidth + 10, this.currentY, boxWidth, boxHeight);
    this.doc.text('Reviewed By:', MARGINS.left + boxWidth + 14, this.currentY + 8);
    this.doc.line(MARGINS.left + boxWidth + 14, this.currentY + 18, MARGINS.left + 2 * boxWidth + 2, this.currentY + 18);
    this.doc.text('Signature / Date', MARGINS.left + boxWidth + 14, this.currentY + 26);
    
    this.currentY += boxHeight + 10;
  }

  public generate(data: ReportData): void {
    this.drawHeader(data.metadata);
    
    if (data.warnings?.length) {
      this.drawWarnings(data.warnings);
    }
    
    this.drawInputsTable(data.inputs);
    
    data.results.forEach(section => {
      this.drawResultsSection(section);
    });
    
    this.drawMethodology(data.methodology);
    
    if (data.notes) {
      this.drawNotes(data.notes);
    }
    
    this.drawQASignature();
    this.drawFooter();
  }

  public save(filename: string): void {
    this.doc.save(filename);
  }

  public getBlob(): Blob {
    return this.doc.output('blob');
  }
}

export function generateHydraulicReport(data: ReportData): void {
  const generator = new PDFReportGenerator();
  generator.generate(data);
  
  const filename = `${data.metadata.calculationType.replace(/\s+/g, '_')}_Report_${
    new Date().toISOString().split('T')[0]
  }.pdf`;
  
  generator.save(filename);
}

// Pre-built report configurations for each calculator type
export const METHODOLOGY_REFERENCES = {
  manning: {
    name: "Manning's Equation",
    equation: "V = (1/n) × R^(2/3) × S^(1/2)",
    source: "Robert Manning, 1889; Ven Te Chow, Open-Channel Hydraulics, 1959",
    notes: "Valid for uniform, steady flow in open channels."
  },
  froude: {
    name: "Froude Number",
    equation: "Fr = V / √(g × D)",
    source: "William Froude; Henderson, Open Channel Flow, 1966",
    notes: "Fr < 1: Subcritical, Fr = 1: Critical, Fr > 1: Supercritical"
  },
  belanger: {
    name: "Bélanger Equation (Hydraulic Jump)",
    equation: "y₂/y₁ = 0.5 × (√(1 + 8Fr₁²) - 1)",
    source: "Jean-Baptiste Bélanger, 1828",
    notes: "Relates sequent depths across a hydraulic jump."
  },
  criticalDepth: {
    name: "Critical Depth",
    equation: "yc = (Q²/(g × b²))^(1/3) for rectangular",
    source: "Ven Te Chow, Open-Channel Hydraulics, 1959",
    notes: "Depth at which specific energy is minimum for given discharge."
  },
  gvf: {
    name: "Gradually Varied Flow (Standard Step Method)",
    equation: "Δx = (E₂ - E₁) / (S₀ - Sf)",
    source: "U.S. Army Corps of Engineers HEC-RAS Manual",
    notes: "Iterative solution for water surface profiles."
  },
  culvertInlet: {
    name: "Inlet Control (FHWA HY-8)",
    equation: "HW/D = Hc/D + K(Q/(A×D^0.5))^M + ks×S",
    source: "FHWA Hydraulic Design of Highway Culverts (HDS-5), 2012",
    notes: "Coefficients K, M depend on inlet edge condition."
  },
  culvertOutlet: {
    name: "Outlet Control",
    equation: "HW = TW + H + hL",
    source: "FHWA HDS-5, 2012",
    notes: "Includes entrance, friction, and exit losses."
  },
  dcm: {
    name: "Divided Channel Method",
    equation: "Q = Σ Kᵢ × √S₀ where Kᵢ = (1/nᵢ) × Aᵢ × Rᵢ^(2/3)",
    source: "Chow, 1959; USACE HEC-RAS Reference Manual",
    notes: "Computes total conveyance as sum of subsection conveyances."
  },
  lotter: {
    name: "Lotter's Method (Composite Roughness)",
    equation: "n = (Σ Pᵢnᵢ^1.5)^(2/3) / P^(2/3)",
    source: "Lotter, 1933; Yen, 2002",
    notes: "Weighted average roughness for compound channels."
  },
  coriolis: {
    name: "Coriolis Coefficient (α)",
    equation: "α = (Σ Vᵢ³Aᵢ) / (V³A)",
    source: "Chow, 1959",
    notes: "Energy correction factor; α > 1 for non-uniform velocity."
  },
  ratingCurve: {
    name: "Stage-Discharge Relationship",
    equation: "Q = f(h) via Manning's Equation",
    source: "USGS Water Supply Papers; ISO 1100-2",
    notes: "Theoretical curve validated against field measurements."
  }
};
