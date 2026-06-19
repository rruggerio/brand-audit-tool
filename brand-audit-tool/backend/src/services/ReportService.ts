import { logger } from '../utils/logger';
import { Report } from '../../../shared/types';
import * as path from 'path';
import * as fs from 'fs/promises';

export class ReportService {
  private reports: Map<string, Report>;
  private reportsDir: string;

  constructor() {
    this.reports = new Map();
    this.reportsDir = path.join(process.cwd(), 'reports');
    this.ensureReportsDirectory();
    logger.info('ReportService initialized');
  }

  private async ensureReportsDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.reportsDir, { recursive: true });
    } catch (error) {
      logger.error('Failed to create reports directory', error);
    }
  }

  async generatePDFReport(auditId: string): Promise<Report> {
    logger.info(`Generating PDF report for audit: ${auditId}`);
    
    const reportId = `report-${Date.now()}-pdf`;
    const filename = `${auditId}-${Date.now()}.pdf`;
    const reportPath = path.join(this.reportsDir, filename);

    // TODO: Implement actual PDF generation
    // For now, create a placeholder
    await fs.writeFile(reportPath, 'PDF Report Placeholder');

    const report: Report = {
      id: reportId,
      auditId,
      format: 'pdf',
      generatedAt: new Date(),
      path: reportPath
    };

    this.reports.set(reportId, report);
    logger.info(`PDF report generated: ${reportId}`);
    return report;
  }

  async generateCSVReport(auditId: string): Promise<Report> {
    logger.info(`Generating CSV report for audit: ${auditId}`);
    
    const reportId = `report-${Date.now()}-csv`;
    const filename = `${auditId}-${Date.now()}.csv`;
    const reportPath = path.join(this.reportsDir, filename);

    // TODO: Implement actual CSV generation
    // For now, create a placeholder
    const csvContent = 'Issue Type,Severity,Title,Description\n';
    await fs.writeFile(reportPath, csvContent);

    const report: Report = {
      id: reportId,
      auditId,
      format: 'csv',
      generatedAt: new Date(),
      path: reportPath
    };

    this.reports.set(reportId, report);
    logger.info(`CSV report generated: ${reportId}`);
    return report;
  }

  async getReportFile(reportId: string): Promise<{
    path: string;
    filename: string;
    mimetype: string;
  }> {
    logger.info(`Fetching report file: ${reportId}`);
    
    const report = this.reports.get(reportId);
    if (!report) {
      throw new Error(`Report not found: ${reportId}`);
    }

    const mimetypes: Record<string, string> = {
      pdf: 'application/pdf',
      csv: 'text/csv',
      json: 'application/json'
    };

    return {
      path: report.path,
      filename: path.basename(report.path),
      mimetype: mimetypes[report.format] || 'application/octet-stream'
    };
  }

  async getAllReports(): Promise<Report[]> {
    logger.info('Fetching all reports');
    return Array.from(this.reports.values());
  }

  async getReportsByAuditId(auditId: string): Promise<Report[]> {
    logger.info(`Fetching reports for audit: ${auditId}`);
    
    const reports = Array.from(this.reports.values()).filter(
      r => r.auditId === auditId
    );
    
    return reports;
  }

  async deleteReport(reportId: string): Promise<boolean> {
    logger.info(`Deleting report: ${reportId}`);
    
    const report = this.reports.get(reportId);
    if (!report) {
      return false;
    }

    try {
      // Delete the file
      await fs.unlink(report.path);
      // Remove from map
      this.reports.delete(reportId);
      logger.info(`Report deleted: ${reportId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete report file: ${reportId}`, error);
      return false;
    }
  }
}

// Made with Bob