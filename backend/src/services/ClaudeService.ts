import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

export interface DetailedAnalysisResult {
  componentAnalysis: {
    detected: string[];
    compliance: {
      component: string;
      matches: boolean;
      issues: string[];
      recommendations: string[];
    }[];
  };
  accessibilityAnalysis: {
    wcagLevel: string;
    issues: {
      severity: 'critical' | 'high' | 'medium' | 'low';
      criterion: string;
      description: string;
      location: string;
      recommendation: string;
    }[];
    score: number;
  };
  designSystemCompliance: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  overallAssessment: string;
}

export class ClaudeService {
  private client: Anthropic;
  private model: string;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new AppError('Anthropic API key not configured', 500);
    }
    this.client = new Anthropic({ apiKey });
    // Use environment variable or default to Haiku (fastest, cheapest)
    this.model = process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001';
    logger.info(`ClaudeService initialized with model: ${this.model}`);
  }

  async analyzeComponents(
    html: string,
    elements: any[],
    componentGuidelines: any
  ): Promise<DetailedAnalysisResult['componentAnalysis']> {
    try {
      logger.info('Analyzing components with Claude');

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: `You are a design system expert. Analyze the following HTML and component usage against the design system guidelines.

HTML Structure:
${html.substring(0, 10000)} // Truncate for token limits

Detected Elements:
${JSON.stringify(elements, null, 2)}

Component Guidelines:
${JSON.stringify(componentGuidelines, null, 2)}

Provide a detailed analysis of:
1. Which design system components are being used
2. Whether they're used correctly according to guidelines
3. Missing or incorrect component usage
4. Specific recommendations for improvement

Format your response as JSON with this structure:
{
  "detected": ["component names"],
  "compliance": [
    {
      "component": "name",
      "matches": boolean,
      "issues": ["issue descriptions"],
      "recommendations": ["recommendations"]
    }
  ]
}`
          }
        ]
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new AppError('Unexpected response type from Claude', 500);
      }

      const result = this.parseJSONResponse(content.text);
      logger.info('Component analysis completed');
      return result;
    } catch (error) {
      logger.error('Error analyzing components:', error);
      throw new AppError(
        `Claude component analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }
  }

  async analyzeAccessibility(
    html: string,
    wcagLevel: 'A' | 'AA' | 'AAA'
  ): Promise<DetailedAnalysisResult['accessibilityAnalysis']> {
    try {
      logger.info(`Analyzing accessibility (WCAG ${wcagLevel}) with Claude`);

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: `You are a WCAG accessibility expert. Analyze this HTML for WCAG ${wcagLevel} compliance.

HTML:
${html.substring(0, 10000)}

Provide a comprehensive accessibility audit including:
1. WCAG violations by severity (critical, high, medium, low)
2. Specific criterion numbers (e.g., 1.4.3 Contrast)
3. The DOM location of each issue as a valid CSS selector
4. Actionable recommendations

IMPORTANT: The "location" field MUST be a valid CSS selector pointing to the affected element
(e.g. "img", "nav a", "header", "input[type=text]", "button", "h1", "body").
Do NOT use prose descriptions — use only CSS selectors.

Format as JSON:
{
  "wcagLevel": "${wcagLevel}",
  "issues": [
    {
      "severity": "critical|high|medium|low",
      "criterion": "WCAG criterion number and name",
      "description": "detailed description",
      "location": "css-selector",
      "recommendation": "how to fix"
    }
  ],
  "score": 0-100
}`
          }
        ]
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new AppError('Unexpected response type from Claude', 500);
      }

      const result = this.parseJSONResponse(content.text);
      logger.info('Accessibility analysis completed');
      return result;
    } catch (error) {
      logger.error('Error analyzing accessibility:', error);
      throw new AppError(
        `Claude accessibility analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }
  }

  async analyzeDesignSystem(
    crawlData: any,
    designSystemGuidelines: any
  ): Promise<DetailedAnalysisResult['designSystemCompliance']> {
    try {
      logger.info('Analyzing design system compliance with Claude');

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: `You are a design system expert specializing in IBM Carbon Design System. Analyze this website's adherence to the design system.

Website Data:
${JSON.stringify(crawlData, null, 2)}

Design System Guidelines:
${JSON.stringify(designSystemGuidelines, null, 2)}

Evaluate:
1. Proper use of Carbon components
2. Adherence to spacing, typography, and color tokens
3. Consistency with Carbon patterns
4. Overall design system maturity

Format as JSON:
{
  "score": 0-100,
  "issues": ["list of issues"],
  "recommendations": ["list of recommendations"]
}`
          }
        ]
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new AppError('Unexpected response type from Claude', 500);
      }

      const result = this.parseJSONResponse(content.text);
      logger.info('Design system analysis completed');
      return result;
    } catch (error) {
      logger.error('Error analyzing design system:', error);
      throw new AppError(
        `Claude design system analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }
  }

  async generateOverallAssessment(
    allAnalyses: any
  ): Promise<string> {
    try {
      logger.info('Generating overall assessment with Claude');

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 2048,
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: `Based on all the analyses performed, provide a comprehensive executive summary of the brand compliance audit.

Analysis Results:
${JSON.stringify(allAnalyses, null, 2)}

Provide:
1. Overall compliance status
2. Key strengths
3. Critical issues requiring immediate attention
4. Strategic recommendations
5. Priority action items

Write in a professional, executive-friendly tone.`
          }
        ]
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new AppError('Unexpected response type from Claude', 500);
      }

      logger.info('Overall assessment generated');
      return content.text;
    } catch (error) {
      logger.error('Error generating assessment:', error);
      throw new AppError(
        `Claude assessment generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }
  }

  private parseJSONResponse(text: string): any {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : text;
      
      return JSON.parse(jsonString);
    } catch (error) {
      logger.warn('Failed to parse Claude response as JSON');
      throw new AppError('Failed to parse AI response', 500);
    }
  }
}

// Made with Bob
