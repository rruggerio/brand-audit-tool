// Shared TypeScript types for brand audit tool

export interface BrandGuidelines {
  id: string;
  name: string;
  version: string;
  colors: ColorGuideline[];
  typography: TypographyGuideline[];
  spacing: SpacingGuideline[];
  components: ComponentGuideline[];
  imagery: ImageryGuideline;
  messaging: MessagingGuideline;
  accessibility: AccessibilityGuideline;
  createdAt: Date;
  updatedAt: Date;
}

export interface ColorGuideline {
  name: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  usage: string[];
  restrictions?: string[];
}

export interface TypographyGuideline {
  family: string;
  weights: number[];
  sizes: {
    name: string;
    value: string;
    usage: string;
  }[];
  lineHeights: {
    name: string;
    value: string;
  }[];
}

export interface SpacingGuideline {
  scale: number[];
  unit: 'px' | 'rem' | 'em';
  usage: {
    name: string;
    value: number;
    context: string;
  }[];
}

export interface ComponentGuideline {
  name: string;
  description: string;
  variants: string[];
  requiredProps?: string[];
  usage: string;
  examples: string[];
}

export interface ImageryGuideline {
  aspectRatios: string[];
  minResolution: { width: number; height: number };
  formats: string[];
  style: string;
  restrictions: string[];
}

export interface MessagingGuideline {
  tone: string[];
  voice: string;
  keywords: string[];
  avoidWords: string[];
  examples: {
    good: string[];
    bad: string[];
  };
}

export interface AccessibilityGuideline {
  wcagLevel: 'A' | 'AA' | 'AAA';
  contrastRatios: {
    normal: number;
    large: number;
  };
  requirements: string[];
}

export interface AuditRequest {
  url: string;
  guidelines: string[];
  analysisTypes: AnalysisType[];
  depth?: string;
  crawlOptions?: {
    followExternalLinks: boolean;
    respectRobotsTxt: boolean;
    maxPages: number;
  };
  aiProvider?: 'openai' | 'claude' | 'both';
  options?: AuditOptions;
}

export type AnalysisType = 'visual' | 'component' | 'content' | 'accessibility';

export interface AuditOptions {
  depth?: number;
  includeScreenshots?: boolean;
  aiProvider?: 'openai' | 'claude' | 'both';
  timeout?: number;
}

export interface AuditResult {
  id: string;
  url: string;
  guidelineId: string;
  timestamp: Date;
  overallScore: number;
  scores: {
    visual: number;
    component: number;
    content: number;
    accessibility: number;
  };
  issues: Issue[];
  screenshots: Screenshot[];
  metadata: AuditMetadata;
}

export interface Issue {
  id: string;
  type: AnalysisType;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  element?: string;
  location: {
    selector?: string;
    xpath?: string;
    coordinates?: { x: number; y: number };
  };
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  expected: string;
  actual: string;
  recommendation: string;
  screenshotId?: string;
  aiAnalysis?: {
    provider: 'openai' | 'claude';
    confidence: number;
    reasoning: string;
  };
}

export interface Screenshot {
  id: string;
  url: string;
  path: string;
  timestamp: Date;
  viewport: {
    width: number;
    height: number;
  };
  pageDimensions?: {
    width: number;
    height: number;
  };
}

export interface AuditMetadata {
  duration: number;
  pageLoadTime: number;
  elementsAnalyzed: number;
  aiCallsMade: number;
  browserInfo: {
    name: string;
    version: string;
  };
}

export interface Report {
  id: string;
  auditId: string;
  format: 'pdf' | 'csv' | 'json';
  generatedAt: Date;
  path: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: Date;
    requestId: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Made with Bob
