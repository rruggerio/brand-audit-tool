import { logger } from '../utils/logger';
import { BrandGuidelines } from '../../../shared/types';

export class GuidelinesService {
  private guidelines: Map<string, BrandGuidelines>;

  constructor() {
    this.guidelines = new Map();
    const ibm = this.buildIBMBrandGuidelines();
    this.guidelines.set(ibm.id, ibm);
    logger.info('GuidelinesService initialized');
  }

  async getAllGuidelines(): Promise<BrandGuidelines[]> {
    logger.info('Fetching all guidelines');
    return Array.from(this.guidelines.values());
  }

  async getGuidelineById(id: string): Promise<BrandGuidelines | null> {
    logger.info(`Fetching guideline: ${id}`);
    return this.guidelines.get(id) || null;
  }

  async createFromPDF(file: any): Promise<BrandGuidelines> {
    logger.info('Creating guideline from PDF');
    // TODO: Implement PDF parsing and guideline creation
    const guideline: BrandGuidelines = {
      id: `guideline-${Date.now()}`,
      name: file?.originalname || 'New Guideline',
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      colors: [],
      typography: [],
      spacing: [],
      components: [],
      imagery: {
        aspectRatios: [],
        minResolution: { width: 1920, height: 1080 },
        formats: ['jpg', 'png', 'webp'],
        style: 'Modern and clean',
        restrictions: []
      },
      messaging: {
        tone: [],
        voice: 'Professional',
        keywords: [],
        avoidWords: [],
        examples: { good: [], bad: [] }
      },
      accessibility: {
        wcagLevel: 'AA',
        contrastRatios: { normal: 4.5, large: 3 },
        requirements: []
      }
    };
    this.guidelines.set(guideline.id, guideline);
    return guideline;
  }

  async createFromJSON(data: Partial<BrandGuidelines>): Promise<BrandGuidelines> {
    logger.info('Creating guideline from JSON');
    const guideline: BrandGuidelines = {
      id: data.id || `guideline-${Date.now()}`,
      name: data.name || 'New Guideline',
      version: data.version || '1.0.0',
      createdAt: data.createdAt || new Date(),
      updatedAt: new Date(),
      colors: data.colors || [],
      typography: data.typography || [],
      spacing: data.spacing || [],
      components: data.components || [],
      imagery: data.imagery || {
        aspectRatios: [],
        minResolution: { width: 1920, height: 1080 },
        formats: ['jpg', 'png', 'webp'],
        style: 'Modern and clean',
        restrictions: []
      },
      messaging: data.messaging || {
        tone: [],
        voice: 'Professional',
        keywords: [],
        avoidWords: [],
        examples: { good: [], bad: [] }
      },
      accessibility: data.accessibility || {
        wcagLevel: 'AA',
        contrastRatios: { normal: 4.5, large: 3 },
        requirements: []
      }
    };
    this.guidelines.set(guideline.id, guideline);
    return guideline;
  }

  async updateGuideline(id: string, data: Partial<BrandGuidelines>): Promise<BrandGuidelines | null> {
    logger.info(`Updating guideline: ${id}`);
    const existing = this.guidelines.get(id);
    if (!existing) {
      return null;
    }
    const updated = {
      ...existing,
      ...data,
      id: existing.id, // Preserve ID
      updatedAt: new Date()
    };
    this.guidelines.set(id, updated);
    return updated;
  }

  async deleteGuideline(id: string): Promise<boolean> {
    logger.info(`Deleting guideline: ${id}`);
    return this.guidelines.delete(id);
  }

  private buildIBMBrandGuidelines(): BrandGuidelines {
    return {
      id: 'ibm-brand-guidelines',
      name: 'IBM Brand Guidelines',
      version: '2024.1',
      createdAt: new Date(),
      updatedAt: new Date(),
      colors: [
        {
          name: 'IBM Blue',
          hex: '#0f62fe',
          rgb: { r: 15, g: 98, b: 254 },
          usage: ['Primary brand color', 'Interactive elements'],
          restrictions: ['Do not use on dark backgrounds without sufficient contrast']
        }
      ],
      typography: [
        {
          family: 'IBM Plex Sans',
          weights: [400, 500, 600, 700],
          sizes: [],
          lineHeights: []
        }
      ],
      spacing: [],
      components: [],
      imagery: {
        aspectRatios: ['16:9', '4:3', '1:1'],
        minResolution: { width: 1920, height: 1080 },
        formats: ['jpg', 'png', 'webp'],
        style: 'Modern, clean, and professional',
        restrictions: ['No stock photos', 'Use authentic IBM imagery']
      },
      messaging: {
        tone: ['Professional', 'Innovative', 'Trustworthy'],
        voice: 'Clear, confident, and forward-thinking',
        keywords: ['innovation', 'technology', 'enterprise', 'AI'],
        avoidWords: ['cheap', 'easy', 'simple'],
        examples: {
          good: ['Transform your business with AI', 'Enterprise-grade solutions'],
          bad: ['Cheap software', 'Easy to use']
        }
      },
      accessibility: {
        wcagLevel: 'AA',
        contrastRatios: { normal: 4.5, large: 3 },
        requirements: ['All interactive elements must be keyboard accessible', 'Provide alt text for images']
      }
    };
  }

  async getIBMBrandGuidelines(): Promise<BrandGuidelines> {
    return this.buildIBMBrandGuidelines();
  }

  async getIBMCarbonDesignSystem(): Promise<any> {
    logger.info('Fetching IBM Carbon Design System');
    // TODO: Load from configuration or Carbon API
    return {
      id: 'ibm-carbon-design-system',
      name: 'IBM Carbon Design System',
      version: '11.x',
      components: [],
      tokens: {},
      guidelines: {}
    };
  }
}

// Shared singleton — ensures AuditService and the guidelines route
// operate on the same in-memory store.
export const guidelinesService = new GuidelinesService();

// Made with Bob