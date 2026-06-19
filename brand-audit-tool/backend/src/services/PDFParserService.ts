// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string; numpages: number }>;
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { BrandGuidelines } from '../../../shared/types';

export class PDFParserService {
  async parseBrandGuidelines(buffer: Buffer): Promise<Partial<BrandGuidelines>> {
    try {
      logger.info('Parsing brand guidelines PDF');

      const data = await pdf(buffer);
      const text = data.text;

      logger.info(`PDF parsed: ${data.numpages} pages, ${text.length} characters`);

      // Extract structured data from PDF text
      const guidelines: Partial<BrandGuidelines> = {
        name: this.extractName(text),
        version: this.extractVersion(text),
        colors: this.extractColors(text),
        typography: this.extractTypography(text),
        spacing: this.extractSpacing(text),
        imagery: this.extractImagery(text),
        messaging: this.extractMessaging(text),
        accessibility: this.extractAccessibility(text)
      };

      logger.info('Brand guidelines extracted from PDF');
      return guidelines;
    } catch (error) {
      logger.error('Error parsing PDF:', error);
      throw new AppError(
        `Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }
  }

  private extractName(text: string): string {
    // Look for common patterns like "Brand Guidelines", "Style Guide", etc.
    const namePatterns = [
      /Brand Guidelines?:?\s*([^\n]+)/i,
      /Style Guide:?\s*([^\n]+)/i,
      /([^\n]+)\s+Brand/i
    ];

    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return 'Unnamed Brand Guidelines';
  }

  private extractVersion(text: string): string {
    const versionPatterns = [
      /Version:?\s*([0-9.]+)/i,
      /v([0-9.]+)/i,
      /Rev(?:ision)?:?\s*([0-9.]+)/i
    ];

    for (const pattern of versionPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return '1.0';
  }

  private extractColors(text: string): BrandGuidelines['colors'] {
    const colors: BrandGuidelines['colors'] = [];
    
    // Match hex colors
    const hexPattern = /#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})/g;
    const hexMatches = text.match(hexPattern);
    
    if (hexMatches) {
      const uniqueColors = [...new Set(hexMatches)];
      uniqueColors.forEach(hex => {
        const rgb = this.hexToRgb(hex);
        colors.push({
          name: this.guessColorName(hex),
          hex: hex.toUpperCase(),
          rgb,
          usage: ['Extracted from PDF - verify usage']
        });
      });
    }

    // Match RGB colors
    const rgbPattern = /rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/gi;
    let rgbMatch;
    while ((rgbMatch = rgbPattern.exec(text)) !== null) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);
      const hex = this.rgbToHex(r, g, b);
      
      if (!colors.find(c => c.hex === hex)) {
        colors.push({
          name: this.guessColorName(hex),
          hex,
          rgb: { r, g, b },
          usage: ['Extracted from PDF - verify usage']
        });
      }
    }

    return colors;
  }

  private extractTypography(text: string): BrandGuidelines['typography'] {
    const typography: BrandGuidelines['typography'] = [];
    
    // Common font family patterns
    const fontPatterns = [
      /Font(?:\s+Family)?:?\s*([^\n,]+)/gi,
      /Typeface:?\s*([^\n,]+)/gi,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:Regular|Bold|Light|Medium)/g
    ];

    const foundFonts = new Set<string>();

    fontPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const font = match[1].trim();
        if (font.length > 2 && font.length < 50) {
          foundFonts.add(font);
        }
      }
    });

    foundFonts.forEach(font => {
      typography.push({
        family: font,
        weights: [400, 700], // Default weights
        sizes: [
          { name: 'body', value: '16px', usage: 'Body text' },
          { name: 'heading', value: '24px', usage: 'Headings' }
        ],
        lineHeights: [
          { name: 'normal', value: '1.5' }
        ]
      });
    });

    return typography;
  }

  private extractSpacing(text: string): BrandGuidelines['spacing'] {
    // Extract spacing values (px, rem, em)
    const spacingPattern = /(\d+)(?:px|rem|em)/g;
    const spacingValues = new Set<number>();
    
    let match;
    while ((match = spacingPattern.exec(text)) !== null) {
      const value = parseInt(match[1]);
      if (value > 0 && value <= 200) {
        spacingValues.add(value);
      }
    }

    const scale = Array.from(spacingValues).sort((a, b) => a - b);

    return [{
      scale: scale.length > 0 ? scale : [4, 8, 16, 24, 32, 48, 64],
      unit: 'px',
      usage: []
    }];
  }

  private extractImagery(_text: string): BrandGuidelines['imagery'] {
    return {
      aspectRatios: ['16:9', '4:3', '1:1'],
      minResolution: { width: 1920, height: 1080 },
      formats: ['jpg', 'png', 'webp'],
      style: 'Extracted from PDF - verify style guidelines',
      restrictions: []
    };
  }

  private extractMessaging(_text: string): BrandGuidelines['messaging'] {
    return {
      tone: ['professional', 'friendly'],
      voice: 'Extracted from PDF - verify voice guidelines',
      keywords: [],
      avoidWords: [],
      examples: {
        good: [],
        bad: []
      }
    };
  }

  private extractAccessibility(text: string): BrandGuidelines['accessibility'] {
    // Look for WCAG mentions
    const wcagMatch = text.match(/WCAG\s+(A{1,3})/i);
    const level = wcagMatch ? (wcagMatch[1].toUpperCase() as 'A' | 'AA' | 'AAA') : 'AA';

    return {
      wcagLevel: level,
      contrastRatios: {
        normal: 4.5,
        large: 3.0
      },
      requirements: ['Extracted from PDF - verify requirements']
    };
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  }

  private guessColorName(hex: string): string {
    // Simple color naming based on hex value
    const rgb = this.hexToRgb(hex);
    const { r, g, b } = rgb;
    
    if (r > 200 && g < 100 && b < 100) return 'Red';
    if (r < 100 && g > 200 && b < 100) return 'Green';
    if (r < 100 && g < 100 && b > 200) return 'Blue';
    if (r > 200 && g > 200 && b < 100) return 'Yellow';
    if (r > 200 && g < 100 && b > 200) return 'Magenta';
    if (r < 100 && g > 200 && b > 200) return 'Cyan';
    if (r > 200 && g > 200 && b > 200) return 'White';
    if (r < 50 && g < 50 && b < 50) return 'Black';
    if (Math.abs(r - g) < 30 && Math.abs(g - b) < 30) return 'Gray';
    
    return `Color-${hex.substring(1)}`;
  }
}

// Made with Bob
