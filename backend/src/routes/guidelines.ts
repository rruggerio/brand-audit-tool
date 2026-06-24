import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { guidelinesService } from '../services/GuidelinesService';

const router = Router();

// Get all guidelines
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const guidelines = await guidelinesService.getAllGuidelines();
  res.json({ guidelines });
}));

// Get guideline by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const guideline = await guidelinesService.getGuidelineById(req.params.id);
  res.json(guideline);
}));

// Create new guideline from PDF
router.post('/upload', asyncHandler(async (req: Request, res: Response) => {
  // Multer middleware will handle file upload
  const guideline = await guidelinesService.createFromPDF(req.file);
  res.status(201).json({
    success: true,
    data: guideline
  });
}));

// Create guideline from JSON
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const guideline = await guidelinesService.createFromJSON(req.body);
  res.status(201).json({
    id: guideline.id,
    message: 'Guideline created successfully'
  });
}));

// Update guideline
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  await guidelinesService.updateGuideline(req.params.id, req.body);
  res.json({
    message: 'Guideline updated successfully'
  });
}));

// Delete guideline
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  await guidelinesService.deleteGuideline(req.params.id);
  res.json({
    message: 'Guideline deleted successfully'
  });
}));

// Get IBM brand guidelines
router.get('/ibm/brand', asyncHandler(async (_req: Request, res: Response) => {
  const guidelines = await guidelinesService.getIBMBrandGuidelines();
  res.json({
    success: true,
    data: guidelines
  });
}));

// Get IBM Carbon design system
router.get('/ibm/carbon', asyncHandler(async (_req: Request, res: Response) => {
  const designSystem = await guidelinesService.getIBMCarbonDesignSystem();
  res.json({
    success: true,
    data: designSystem
  });
}));

export default router;

// Made with Bob
