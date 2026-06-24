import { Router, Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { asyncHandler } from '../middleware/errorHandler';
import { AuditService } from '../services/AuditService';

const router = Router();
let auditService: AuditService | null = null;

function getAuditService(): AuditService {
  if (!auditService) {
    auditService = new AuditService();
  }
  return auditService;
}

// Create new audit
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const audit = await getAuditService().createAudit(req.body);
  res.status(201).json({
    id: audit.id,
    message: 'Audit completed successfully'
  });
}));

// Get all audits
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, guidelineId } = req.query;
  const result = await getAuditService().getAllAudits({
    page: Number(page),
    limit: Number(limit),
    guidelineId: guidelineId as string
  });
  res.json({
    audits: result.data.map(a => ({
      id: a.id,
      url: a.url,
      status: 'completed',
      score: a.overallScore,
      createdAt: a.timestamp
    })),
    pagination: {
      page: result.pagination.page,
      limit: result.pagination.limit,
      total: result.pagination.total,
      pages: result.pagination.totalPages
    }
  });
}));

// Get audit by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const audit = await getAuditService().getAuditById(req.params.id);
  if (!audit) {
    res.status(404).json({ error: 'Audit not found' });
    return;
  }

  const screenshot = audit.screenshots[0];
  const screenshotUrl = screenshot
    ? `http://localhost:3001/api/audits/${audit.id}/screenshot`
    : null;

  const pageDimensions = screenshot?.pageDimensions ?? null;

  const issues = audit.issues.map(i => ({
    id: i.id,
    severity: i.severity,
    category: i.category,
    title: i.title,
    description: i.description,
    location: i.location?.selector || i.location?.xpath || '',
    recommendation: i.recommendation,
    boundingBox: i.boundingBox ?? null,
  }));

  res.json({
    id: audit.id,
    url: audit.url,
    status: 'completed',
    score: audit.overallScore,
    createdAt: audit.timestamp,
    guidelines: [audit.guidelineId],
    scores: audit.scores,
    screenshotUrl,
    pageDimensions,
    summary: {
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'critical').length,
      highIssues: issues.filter(i => i.severity === 'high').length,
      mediumIssues: issues.filter(i => i.severity === 'medium').length,
      lowIssues: issues.filter(i => i.severity === 'low').length,
    },
    issues,
    metadata: audit.metadata,
  });
}));

// Serve screenshot for a given audit
router.get('/:id/screenshot', (req: Request, res: Response) => {
  const screenshotPath = path.join(process.cwd(), 'screenshots', `screenshot-${req.params.id}.png`);
  if (!fs.existsSync(screenshotPath)) {
    res.status(404).json({ error: 'Screenshot not found' });
    return;
  }
  res.sendFile(screenshotPath);
});

// Get audit status
router.get('/:id/status', asyncHandler(async (req: Request, res: Response) => {
  const status = await getAuditService().getAuditStatus(req.params.id);
  res.json({
    success: true,
    data: status
  });
}));

// Cancel audit
router.post('/:id/cancel', asyncHandler(async (req: Request, res: Response) => {
  await getAuditService().cancelAudit(req.params.id);
  res.json({
    success: true,
    message: 'Audit cancelled successfully'
  });
}));

// Delete audit
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  await getAuditService().deleteAudit(req.params.id);
  res.json({
    success: true,
    message: 'Audit deleted successfully'
  });
}));

export default router;

// Made with Bob
