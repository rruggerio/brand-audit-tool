import { logger } from '../utils/logger';
import { AuditRequest, AuditResult, Issue, Screenshot } from '../../../shared/types';
import { CrawlerService } from './CrawlerService';
import { OpenAIService } from './OpenAIService';
import { ClaudeService } from './ClaudeService';
import { guidelinesService, GuidelinesService } from './GuidelinesService';
import * as path from 'path';
import * as fs from 'fs/promises';

export class AuditService {
  private audits: Map<string, AuditResult>;
  private crawlerService: CrawlerService;
  private openAIService: OpenAIService | null = null;
  private claudeService: ClaudeService | null = null;
  private guidelinesService: GuidelinesService;
  private screenshotsDir: string;

  constructor() {
    try {
      logger.info('AuditService: Starting initialization...');
      this.audits = new Map();
      this.crawlerService = new CrawlerService();
      this.guidelinesService = guidelinesService;
      this.screenshotsDir = path.join(process.cwd(), 'screenshots');
      logger.info('AuditService initialized successfully');
    } catch (error) {
      logger.error('AuditService initialization failed:', error);
      throw error;
    }
  }

  private getOpenAIService(): OpenAIService {
    if (!this.openAIService) {
      this.openAIService = new OpenAIService();
    }
    return this.openAIService;
  }

  private getClaudeService(): ClaudeService {
    if (!this.claudeService) {
      this.claudeService = new ClaudeService();
    }
    return this.claudeService;
  }

  private async ensureScreenshotsDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.screenshotsDir, { recursive: true });
    } catch (error) {
      logger.error('Failed to create screenshots directory', error);
    }
  }

  async createAudit(request: AuditRequest): Promise<AuditResult> {
    logger.info(`Creating audit for URL: ${request.url}`);
    
    const auditId = `audit-${Date.now()}`;
    const startTime = Date.now();

    const guidelineId = request.guidelines[0];

    // Create initial audit result
    const audit: AuditResult = {
      id: auditId,
      url: request.url,
      guidelineId,
      timestamp: new Date(),
      overallScore: 0,
      scores: {
        visual: 0,
        component: 0,
        content: 0,
        accessibility: 0
      },
      issues: [],
      screenshots: [],
      metadata: {
        duration: 0,
        pageLoadTime: 0,
        elementsAnalyzed: 0,
        aiCallsMade: 0,
        browserInfo: {
          name: 'Chrome',
          version: '120.0'
        }
      }
    };

    this.audits.set(auditId, audit);

    try {
      // Ensure screenshots directory exists
      await this.ensureScreenshotsDirectory();
      
      // Step 1: Fetch brand guidelines
      logger.info(`Fetching guidelines: ${guidelineId}`);
      const guidelines = await this.guidelinesService.getGuidelineById(guidelineId);
      if (!guidelines) {
        throw new Error(`Guidelines not found: ${guidelineId}`);
      }

      // Step 2: Crawl the page
      logger.info(`Crawling page: ${request.url}`);
      const crawlResult = await this.crawlerService.crawlPage(request.url);
      audit.metadata.pageLoadTime = crawlResult.metadata.loadTime;
      audit.metadata.elementsAnalyzed = crawlResult.elements.length;

      // Step 3: Save screenshot
      const screenshotId = `screenshot-${auditId}`;
      const screenshotPath = path.join(this.screenshotsDir, `${screenshotId}.png`);
      await fs.writeFile(screenshotPath, crawlResult.screenshot);

      const screenshot: Screenshot = {
        id: screenshotId,
        url: request.url,
        path: screenshotPath,
        timestamp: new Date(),
        viewport: crawlResult.metadata.viewport,
        pageDimensions: crawlResult.pageDimensions,
      };
      audit.screenshots.push(screenshot);

      // Step 4: Perform analyses based on requested types
      const issues: Issue[] = [];
      let aiCallCount = 0;

      // Visual Analysis
      if (request.analysisTypes.includes('visual')) {
        logger.info('Performing visual analysis');
        try {
          const openAI = this.getOpenAIService();
          const visualAnalysis = await openAI.analyzeScreenshot(
            crawlResult.screenshot,
            guidelines
          );
          aiCallCount++;
          
          // Convert visual analysis to issues
          const visualIssues = this.convertVisualAnalysisToIssues(
            visualAnalysis,
            auditId,
            screenshotId
          );
          issues.push(...visualIssues);
          audit.scores.visual = this.computeScore(visualIssues);
        } catch (error) {
          logger.error('Visual analysis failed:', error);
          audit.scores.visual = 0;
        }
      }

      // Content Analysis
      if (request.analysisTypes.includes('content')) {
        logger.info('Performing content analysis');
        try {
          // Extract text content from HTML
          const textContent = this.extractTextContent(crawlResult.html);
          const openAI = this.getOpenAIService();
          const contentAnalysis = await openAI.analyzeContent(
            textContent,
            guidelines.messaging
          );
          aiCallCount++;
          
          // Convert content analysis to issues
          const contentIssues = this.convertContentAnalysisToIssues(
            contentAnalysis,
            auditId
          );
          issues.push(...contentIssues);
          audit.scores.content = this.computeScore(contentIssues);
        } catch (error) {
          logger.error('Content analysis failed:', error);
          audit.scores.content = 0;
        }
      }

      // Component Analysis via Claude
      if (request.analysisTypes.includes('component')) {
        logger.info('Performing component analysis');
        try {
          const claude = this.getClaudeService();
          const componentAnalysis = await claude.analyzeComponents(
            crawlResult.html,
            crawlResult.elements,
            guidelines.components
          );
          aiCallCount++;
          componentAnalysis.compliance.forEach((item, index) => {
            if (!item.matches) {
              issues.push({
                id: `issue-${auditId}-component-${index}`,
                type: 'component',
                severity: 'high',
                category: 'Design System Components',
                title: `Non-compliant component: ${item.component}`,
                description: item.issues.join('; '),
                location: {},
                expected: 'Carbon Design System component usage',
                actual: item.component,
                recommendation: item.recommendations.join('; '),
                aiAnalysis: { provider: 'claude', confidence: 0.85, reasoning: item.issues.join('; ') }
              });
            }
          });
          // Score = percentage of compliant components
          const total = componentAnalysis.compliance.length;
          const passing = componentAnalysis.compliance.filter(c => c.matches).length;
          audit.scores.component = total > 0 ? Math.round((passing / total) * 100) : 75;
        } catch (error) {
          logger.error('Component analysis failed:', error);
          audit.scores.component = 0;
        }
      }

      // Accessibility Analysis via Claude
      if (request.analysisTypes.includes('accessibility')) {
        logger.info('Performing accessibility analysis');
        try {
          const claude = this.getClaudeService();
          const a11yAnalysis = await claude.analyzeAccessibility(
            crawlResult.html,
            guidelines.accessibility.wcagLevel
          );
          aiCallCount++;
          const a11yIssues: Issue[] = a11yAnalysis.issues.map((item, index) => ({
            id: `issue-${auditId}-a11y-${index}`,
            type: 'accessibility' as const,
            severity: item.severity,
            category: 'Accessibility',
            title: item.criterion,
            description: item.description,
            location: { selector: item.location },
            expected: `WCAG ${a11yAnalysis.wcagLevel} compliance`,
            actual: item.description,
            recommendation: item.recommendation,
            aiAnalysis: { provider: 'claude' as const, confidence: 0.9, reasoning: item.description }
          }));
          issues.push(...a11yIssues);
          audit.scores.accessibility = this.computeScore(a11yIssues);
        } catch (error) {
          logger.error('Accessibility analysis failed:', error);
          audit.scores.accessibility = 0;
        }
      }

      // Step 5: Resolve issue selectors to bounding boxes from crawl data
      const positions = crawlResult.elementPositions;

      // Multi-strategy selector resolution
      const resolveBox = (selector: string | undefined): typeof positions[string] | null => {
        if (!selector) return null;
        const s = selector.trim();
        if (!s) return null;

        // Handle comma-separated selector lists — try each part left to right
        if (s.includes(',')) {
          for (const part of s.split(',')) {
            const r = resolveBox(part.trim());
            if (r) return r;
          }
          return null;
        }

        // Strip pseudo-classes/pseudo-elements before matching
        const desugar = s.replace(/:{1,2}[a-z-]+(\([^)]*\))?/gi, '').trim();

        // 1. Exact match (original then desugared)
        if (positions[s]) return positions[s];
        if (desugar && desugar !== s && positions[desugar]) return positions[desugar];

        // Strip attribute selectors for tag extraction: input[type='text'] → input
        const withoutAttrs = desugar.replace(/\[[^\]]*\]/g, '').trim();

        // 2. Tag only
        const tagOnly = (withoutAttrs || desugar).match(/^([a-z][a-z0-9-]*)/i)?.[1];
        if (tagOnly && positions[tagOnly]) return positions[tagOnly];

        // 3. First class only
        const firstClass = (withoutAttrs || desugar).match(/\.([a-z][a-z0-9_-]*)/i)?.[1];
        if (firstClass && positions[`.${firstClass}`]) return positions[`.${firstClass}`];
        if (firstClass && tagOnly && positions[`${tagOnly}.${firstClass}`]) return positions[`${tagOnly}.${firstClass}`];

        // 4. Substring fuzzy — any captured key contained by or containing the selector
        const sLower = s.toLowerCase();
        for (const key of Object.keys(positions)) {
          if (key.length > 1 && (sLower.includes(key) || key.includes(sLower))) {
            return positions[key];
          }
        }

        return null;
      };

      // Semantic fallback positions per issue type — tried in order until one resolves
      const typeFallbackChain: Record<string, string[]> = {
        visual:        ['header', 'main', 'body'],
        component:     ['header', 'section', 'main', 'body'],
        content:       ['main', 'section', 'article', 'body'],
        accessibility: ['body', 'main', 'header'],
      };

      issues.forEach(issue => {
        // Try the AI-supplied selector first
        let box = resolveBox(issue.location?.selector) ?? resolveBox(issue.location?.xpath) ?? null;

        // Walk the type fallback chain until something resolves
        if (!box) {
          for (const sel of (typeFallbackChain[issue.type] ?? ['body'])) {
            box = resolveBox(sel);
            if (box) break;
          }
        }

        // Ultimate fallback: guaranteed 'body' entry added by CrawlerService
        if (!box) box = positions['body'] ?? null;

        if (box) issue.boundingBox = box;
      });

      logger.info(`Bounding boxes: ${issues.filter(i => i.boundingBox).length}/${issues.length} issues mapped`);

      // Store issues and calculate overall score
      audit.issues = issues;
      audit.metadata.aiCallsMade = aiCallCount;
      audit.overallScore = this.calculateOverallScore(audit.scores, request.analysisTypes);
      
      // Step 6: Update metadata
      audit.metadata.duration = Date.now() - startTime;
      
      logger.info(`Audit completed: ${auditId} (Score: ${audit.overallScore})`);
      return audit;

    } catch (error) {
      logger.error(`Audit failed for ${request.url}:`, error);
      audit.metadata.duration = Date.now() - startTime;
      audit.issues.push({
        id: `issue-error-${Date.now()}`,
        type: 'visual',
        severity: 'critical',
        category: 'System Error',
        title: 'Audit Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        location: {},
        expected: 'Successful audit completion',
        actual: 'Audit process failed',
        recommendation: 'Check logs and try again'
      });
      return audit;
    }
  }

  private extractTextContent(html: string): string {
    // Simple text extraction (remove HTML tags)
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 5000); // Limit to first 5000 chars
  }

  private convertVisualAnalysisToIssues(
    analysis: any,
    auditId: string,
    screenshotId: string
  ): Issue[] {
    const issues: Issue[] = [];

    const colorCompliance: any[] = Array.isArray(analysis.colors?.compliance)
      ? analysis.colors.compliance : [];
    colorCompliance.forEach((item: any, index: number) => {
      if (!item.matches) {
        issues.push({
          id: `issue-${auditId}-color-${index}`,
          type: 'visual',
          severity: item.confidence > 0.7 ? 'high' : 'medium',
          category: 'Color Compliance',
          title: `Non-compliant color detected: ${item.color}`,
          description: item.reasoning,
          location: {},
          expected: 'Brand guideline colors',
          actual: item.color,
          recommendation: 'Use approved brand colors from guidelines',
          screenshotId,
          aiAnalysis: { provider: 'openai', confidence: item.confidence, reasoning: item.reasoning }
        });
      }
    });

    const typographyCompliance: any[] = Array.isArray(analysis.typography?.compliance)
      ? analysis.typography.compliance : [];
    typographyCompliance.forEach((item: any, index: number) => {
      if (!item.matches) {
        issues.push({
          id: `issue-${auditId}-font-${index}`,
          type: 'visual',
          severity: item.confidence > 0.7 ? 'high' : 'medium',
          category: 'Typography Compliance',
          title: `Non-compliant font detected: ${item.font}`,
          description: item.reasoning,
          location: {},
          expected: 'Brand guideline fonts',
          actual: item.font,
          recommendation: 'Use approved brand fonts from guidelines',
          screenshotId,
          aiAnalysis: { provider: 'openai', confidence: item.confidence, reasoning: item.reasoning }
        });
      }
    });

    const layoutIssues: string[] = Array.isArray(analysis.layout?.issues)
      ? analysis.layout.issues : [];
    layoutIssues.forEach((issueText: string, index: number) => {
      issues.push({
        id: `issue-${auditId}-layout-${index}`,
        type: 'visual',
        severity: 'medium',
        category: 'Layout & Spacing',
        title: 'Layout issue detected',
        description: issueText,
        location: {},
        expected: 'Consistent spacing and alignment per guidelines',
        actual: 'Inconsistent layout detected',
        recommendation: 'Review spacing and alignment guidelines',
        screenshotId,
        aiAnalysis: { provider: 'openai', confidence: 0.8, reasoning: issueText }
      });
    });

    return issues;
  }

  private convertContentAnalysisToIssues(
    analysis: any,
    auditId: string
  ): Issue[] {
    const issues: Issue[] = [];

    // Tone issues
    if (analysis.tone && !analysis.tone.matches) {
      issues.push({
        id: `issue-${auditId}-tone`,
        type: 'content',
        severity: analysis.tone.confidence > 0.7 ? 'high' : 'medium',
        category: 'Messaging Tone',
        title: 'Content tone does not match brand guidelines',
        description: analysis.tone.reasoning,
        location: {},
        expected: 'Brand-appropriate tone',
        actual: 'Inconsistent tone detected',
        recommendation: 'Adjust content tone to match brand voice',
        aiAnalysis: {
          provider: 'openai',
          confidence: analysis.tone.confidence,
          reasoning: analysis.tone.reasoning
        }
      });
    }

    // Voice issues
    if (analysis.voice && !analysis.voice.matches) {
      issues.push({
        id: `issue-${auditId}-voice`,
        type: 'content',
        severity: analysis.voice.confidence > 0.7 ? 'high' : 'medium',
        category: 'Brand Voice',
        title: 'Content voice does not match brand guidelines',
        description: analysis.voice.reasoning,
        location: {},
        expected: 'Consistent brand voice',
        actual: 'Inconsistent voice detected',
        recommendation: 'Align content with brand voice guidelines',
        aiAnalysis: {
          provider: 'openai',
          confidence: analysis.voice.confidence,
          reasoning: analysis.voice.reasoning
        }
      });
    }

    // Missing keywords
    if (analysis.keywords?.missing?.length > 0) {
      issues.push({
        id: `issue-${auditId}-keywords`,
        type: 'content',
        severity: 'low',
        category: 'Keywords',
        title: 'Missing recommended brand keywords',
        description: `The following brand keywords are missing: ${analysis.keywords.missing.join(', ')}`,
        location: {},
        expected: 'Use of brand keywords',
        actual: 'Keywords not found in content',
        recommendation: 'Incorporate brand keywords naturally into content',
        aiAnalysis: {
          provider: 'openai',
          confidence: 0.9,
          reasoning: 'Keyword analysis'
        }
      });
    }

    // General content issues
    analysis.issues?.forEach((issueText: string, index: number) => {
      issues.push({
        id: `issue-${auditId}-content-${index}`,
        type: 'content',
        severity: 'medium',
        category: 'Content Quality',
        title: 'Content issue detected',
        description: issueText,
        location: {},
        expected: 'Brand-compliant content',
        actual: 'Content issue identified',
        recommendation: 'Review and update content per guidelines',
        aiAnalysis: {
          provider: 'openai',
          confidence: 0.8,
          reasoning: issueText
        }
      });
    });

    return issues;
  }

  // Compute a score deterministically from the issues found, rather than
  // relying on an AI-returned number which varies even at temperature=0.
  // Deductions: critical=-15, high=-8, medium=-3, low=-1. Floor 0, ceil 100.
  private computeScore(issues: Issue[]): number {
    const deductions: Record<string, number> = {
      critical: 15,
      high: 8,
      medium: 3,
      low: 1,
    };
    const total = issues.reduce((sum, i) => sum + (deductions[i.severity] ?? 0), 0);
    return Math.max(0, Math.min(100, 100 - total));
  }

  private calculateOverallScore(
    scores: AuditResult['scores'],
    analysisTypes: string[]
  ): number {
    let total = 0;
    let count = 0;

    analysisTypes.forEach(type => {
      const val = scores[type as keyof typeof scores];
      if (typeof val === 'number' && !isNaN(val)) {
        total += val;
        count++;
      }
    });

    return count > 0 ? Math.round(total / count) : 0;
  }

  async getAllAudits(options: {
    page: number;
    limit: number;
    guidelineId?: string;
  }): Promise<{
    data: AuditResult[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    logger.info('Fetching all audits');
    
    let audits = Array.from(this.audits.values());
    
    // Filter by guidelineId if provided
    if (options.guidelineId) {
      audits = audits.filter(a => a.guidelineId === options.guidelineId);
    }

    const total = audits.length;
    const totalPages = Math.ceil(total / options.limit);
    const start = (options.page - 1) * options.limit;
    const end = start + options.limit;
    const paginatedAudits = audits.slice(start, end);

    return {
      data: paginatedAudits,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages
      }
    };
  }

  async getAuditById(id: string): Promise<AuditResult | null> {
    logger.info(`Fetching audit: ${id}`);
    return this.audits.get(id) || null;
  }

  async getAuditStatus(id: string): Promise<{
    id: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    message?: string;
  }> {
    logger.info(`Fetching audit status: ${id}`);
    const audit = this.audits.get(id);
    
    if (!audit) {
      return {
        id,
        status: 'failed',
        progress: 0,
        message: 'Audit not found'
      };
    }

    return {
      id,
      status: 'completed',
      progress: 100,
      message: 'Audit completed successfully'
    };
  }

  async cancelAudit(id: string): Promise<void> {
    logger.info(`Cancelling audit: ${id}`);
    // TODO: Implement audit cancellation logic
  }

  async deleteAudit(id: string): Promise<boolean> {
    logger.info(`Deleting audit: ${id}`);
    return this.audits.delete(id);
  }
}

// Made with Bob