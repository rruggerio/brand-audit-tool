import OpenAI from 'openai';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

export interface VisualAnalysisResult {
  colors: {
    detected: string[];
    compliance: {
      color: string;
      matches: boolean;
      confidence: number;
      reasoning: string;
    }[];
  };
  typography: {
    detected: string[];
    compliance: {
      font: string;
      matches: boolean;
      confidence: number;
      reasoning: string;
    }[];
  };
  layout: {
    spacing: string;
    alignment: string;
    issues: string[];
  };
  overallScore: number;
  recommendations: string[];
}

export class OpenAIService {
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new AppError('OpenAI API key not configured', 500);
    }
    this.client = new OpenAI({ apiKey });
  }

  async analyzeScreenshot(
    screenshot: Buffer,
    guidelines: any
  ): Promise<VisualAnalysisResult> {
    try {
      logger.info('Analyzing screenshot with GPT-4 Vision');

      const base64Image = screenshot.toString('base64');
      
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a brand compliance expert analyzing website screenshots against brand guidelines. Provide detailed, structured analysis.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this website screenshot against the following brand guidelines:\n\n${JSON.stringify(guidelines, null, 2)}\n\nReturn ONLY valid JSON matching this exact structure:\n{\n  "colors": {\n    "detected": ["list of hex/rgb colors observed"],\n    "compliance": [\n      {"color": "#hex", "matches": true, "confidence": 0.9, "reasoning": "explanation"}\n    ]\n  },\n  "typography": {\n    "detected": ["font family names observed"],\n    "compliance": [\n      {"font": "font name", "matches": true, "confidence": 0.9, "reasoning": "explanation"}\n    ]\n  },\n  "layout": {\n    "spacing": "description of spacing patterns",\n    "alignment": "description of alignment",\n    "issues": ["issue 1", "issue 2"]\n  },\n  "overallScore": 75,\n  "recommendations": ["recommendation 1", "recommendation 2"]\n}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0,
        seed: 42,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AppError('No response from OpenAI', 500);
      }

      // Parse JSON response
      const analysis = this.parseAnalysisResponse(content);
      
      logger.info('Screenshot analysis completed');
      return analysis;
    } catch (error) {
      logger.error('Error analyzing screenshot:', error);
      throw new AppError(
        `OpenAI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }
  }

  async analyzeContent(
    content: string,
    messagingGuidelines: any
  ): Promise<{
    tone: { matches: boolean; confidence: number; reasoning: string };
    voice: { matches: boolean; confidence: number; reasoning: string };
    keywords: { found: string[]; missing: string[] };
    issues: string[];
    score: number;
  }> {
    try {
      logger.info('Analyzing content with GPT-4');

      const response = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a brand messaging expert analyzing website content against brand messaging guidelines.'
          },
          {
            role: 'user',
            content: `Analyze this website content against the brand messaging guidelines.

Content:
${content}

Guidelines:
${JSON.stringify(messagingGuidelines, null, 2)}

Return ONLY valid JSON matching this exact structure — use these exact field names:
{
  "tone": { "matches": true, "confidence": 0.85, "reasoning": "explanation" },
  "voice": { "matches": true, "confidence": 0.85, "reasoning": "explanation" },
  "keywords": { "found": ["keyword1"], "missing": ["keyword2"] },
  "issues": ["issue description 1", "issue description 2"],
  "score": 75
}`
          }
        ],
        max_tokens: 1500,
        temperature: 0,
        seed: 42,
        response_format: { type: 'json_object' }
      });

      const result = response.choices[0]?.message?.content;
      if (!result) {
        throw new AppError('No response from OpenAI', 500);
      }

      logger.info('Content analysis completed');
      return JSON.parse(result);
    } catch (error) {
      logger.error('Error analyzing content:', error);
      throw new AppError(
        `OpenAI content analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }
  }

  private parseAnalysisResponse(content: string): VisualAnalysisResult {
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      
      return JSON.parse(jsonString);
    } catch (error) {
      logger.warn('Failed to parse OpenAI response as JSON, using fallback');
      // Fallback structure
      return {
        colors: {
          detected: [],
          compliance: []
        },
        typography: {
          detected: [],
          compliance: []
        },
        layout: {
          spacing: 'Unable to analyze',
          alignment: 'Unable to analyze',
          issues: ['Failed to parse AI response']
        },
        overallScore: 0,
        recommendations: ['Manual review required - AI analysis parsing failed']
      };
    }
  }
}

// Made with Bob
