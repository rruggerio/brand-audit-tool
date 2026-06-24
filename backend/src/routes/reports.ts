import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { ReportService } from '../services/ReportService';

const router = Router();
const reportService = new ReportService();

// Get all reports
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const reports = await reportService.getAllReports();
  res.json({
    reports
  });
}));

// Generate PDF report
router.post('/:auditId/pdf', asyncHandler(async (req: Request, res: Response) => {
  const report = await reportService.generatePDFReport(req.params.auditId);
  res.json({
    success: true,
    data: report
  });
}));

// Generate CSV report
router.post('/:auditId/csv', asyncHandler(async (req: Request, res: Response) => {
  const report = await reportService.generateCSVReport(req.params.auditId);
  res.json({
    success: true,
    data: report
  });
}));

// Download report
router.get('/:reportId/download', asyncHandler(async (req: Request, res: Response) => {
  const { path, filename, mimetype } = await reportService.getReportFile(req.params.reportId);
  res.download(path, filename, {
    headers: {
      'Content-Type': mimetype
    }
  });
}));

// Get all reports for an audit
router.get('/audit/:auditId', asyncHandler(async (req: Request, res: Response) => {
  const reports = await reportService.getReportsByAuditId(req.params.auditId);
  res.json({
    success: true,
    data: reports
  });
}));

// Delete report
router.delete('/:reportId', asyncHandler(async (req: Request, res: Response) => {
  await reportService.deleteReport(req.params.reportId);
  res.json({
    success: true,
    message: 'Report deleted successfully'
  });
}));

export default router;

// Made with Bob
