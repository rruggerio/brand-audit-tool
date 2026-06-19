import puppeteer, { Browser, Page } from 'puppeteer';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CrawlResult {
  url: string;
  html: string;
  screenshot: Buffer;
  metadata: {
    title: string;
    description: string;
    viewport: { width: number; height: number };
    loadTime: number;
  };
  pageDimensions: {
    width: number;
    height: number;
  };
  styles: {
    colors: string[];
    fonts: string[];
    spacing: number[];
  };
  elements: {
    selector: string;
    tagName: string;
    styles: Record<string, string>;
  }[];
  elementPositions: Record<string, BoundingBox>;
}

export class CrawlerService {
  private browser: Browser | null = null;

  private async launchBrowser(): Promise<Browser> {
    // Always launch a fresh browser so stale connections, service workers,
    // and cached GPU state from the previous crawl cannot affect the next run.
    if (this.browser) {
      try { await this.browser.close(); } catch { /* ignore */ }
      this.browser = null;
    }
    this.browser = await puppeteer.launch({
      headless: process.env.PUPPETEER_HEADLESS !== 'false',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
    logger.info('Puppeteer browser launched');
    return this.browser;
  }

  async crawlPage(rawUrl: string): Promise<CrawlResult> {
    const browser = await this.launchBrowser();

    // Normalize URL — prepend https:// if no protocol provided
    const url = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;

    const page = await browser.newPage();
    const startTime = Date.now();

    try {
      logger.info(`Crawling page: ${url}`);

      // Set viewport
      await page.setViewport({ width: 1920, height: 1080 });

      // domcontentloaded fires once HTML is parsed; avoids timeouts on heavy sites
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });

      const loadTime = Date.now() - startTime;

      // Scroll the full page to trigger lazy-loaded images and content,
      // then scroll back to the top before capturing
      logger.info('Triggering lazy-loaded content via scroll...');
      await page.evaluate(async () => {
        await new Promise<void>(resolve => {
          const step = window.innerHeight;
          const totalHeight = document.documentElement.scrollHeight;
          let y = 0;
          const tick = setInterval(() => {
            y += step;
            window.scrollTo(0, y);
            if (y >= totalHeight) {
              clearInterval(tick);
              window.scrollTo(0, 0);
              resolve();
            }
          }, 150);
        });
      });

      // Give images a moment to finish loading after scroll
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Capture HTML after lazy-load so AI gets the full DOM
      const html = await page.content();

      // Take full-page screenshot
      const screenshot = await page.screenshot({
        fullPage: true,
        type: 'png'
      }) as Buffer;

      // Extract metadata
      const metadata = await page.evaluate(() => {
        return {
          title: document.title,
          description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        };
      });

      // Extract colors from computed styles
      const colors = await this.extractColors(page);

      // Extract fonts
      const fonts = await this.extractFonts(page);

      // Extract spacing values
      const spacing = await this.extractSpacing(page);

      // Extract element information
      const elements = await this.extractElements(page);

      // Capture element bounding boxes and full page dimensions for screenshot annotation
      const { elementPositions, pageDimensions } = await page.evaluate(() => {
        const positions: Record<string, { x: number; y: number; width: number; height: number }> = {};

        const targetTags = [
          'header', 'nav', 'main', 'footer', 'section', 'article', 'aside',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p',
          'button', 'a', 'img', 'form', 'input', 'select', 'ul', 'ol', 'table', 'figure'
        ];

        targetTags.forEach(tag => {
          const els = Array.from(document.querySelectorAll(tag)).slice(0, 15);
          els.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            const tagName = el.tagName.toLowerCase();
            const elId = el.id ? `#${el.id}` : '';
            const classList = Array.from(el.classList).filter(Boolean);
            const classStr = classList.map(c => `.${c}`).join('');

            const box = {
              x: Math.round(rect.left),
              y: Math.round(rect.top),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            };

            // Register under every plausible selector key (first occurrence wins)
            const keys: string[] = [tagName];
            if (elId) keys.push(elId, `${tagName}${elId}`);
            if (classStr) keys.push(`${tagName}${classStr}`);
            classList.forEach(c => {
              keys.push(`.${c}`, `${tagName}.${c}`);
            });

            keys.forEach(k => { if (!positions[k]) positions[k] = box; });
          });
        });

        // Always guarantee 'body' and 'html' as full-page anchors so type
        // fallbacks in the audit service have a guaranteed last resort
        const pageW = Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth || 0);
        const pageH = Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0);
        positions['body'] = { x: 0, y: 0, width: pageW, height: pageH };
        positions['html'] = { x: 0, y: 0, width: pageW, height: pageH };

        return {
          elementPositions: positions,
          pageDimensions: { width: pageW, height: pageH },
        };
      });

      logger.info(`Successfully crawled ${url} in ${loadTime}ms — ${Object.keys(elementPositions).length} element positions captured`);

      return {
        url,
        html,
        screenshot,
        metadata: {
          ...metadata,
          loadTime
        },
        pageDimensions,
        styles: {
          colors,
          fonts,
          spacing
        },
        elements,
        elementPositions,
      };
    } catch (error) {
      logger.error(`Error crawling ${url}:`, error);
      throw new AppError(`Failed to crawl page: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    } finally {
      try { await page.close(); } catch { /* ignore */ }
      try { await browser.close(); } catch { /* ignore */ }
      this.browser = null;
    }
  }

  private async extractColors(page: Page): Promise<string[]> {
    return page.evaluate(() => {
      const colors = new Set<string>();
      const elements = document.querySelectorAll('*');
      
      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const bgColor = styles.backgroundColor;
        const borderColor = styles.borderColor;
        
        if (color && color !== 'rgba(0, 0, 0, 0)') colors.add(color);
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') colors.add(bgColor);
        if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)') colors.add(borderColor);
      });
      
      return Array.from(colors);
    });
  }

  private async extractFonts(page: Page): Promise<string[]> {
    return page.evaluate(() => {
      const fonts = new Set<string>();
      const elements = document.querySelectorAll('*');
      
      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const fontFamily = styles.fontFamily;
        if (fontFamily) fonts.add(fontFamily);
      });
      
      return Array.from(fonts);
    });
  }

  private async extractSpacing(page: Page): Promise<number[]> {
    return page.evaluate(() => {
      const spacing = new Set<number>();
      const elements = document.querySelectorAll('*');
      
      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const margin = [styles.marginTop, styles.marginRight, styles.marginBottom, styles.marginLeft];
        const padding = [styles.paddingTop, styles.paddingRight, styles.paddingBottom, styles.paddingLeft];
        
        [...margin, ...padding].forEach(value => {
          const num = parseFloat(value);
          if (!isNaN(num) && num > 0) spacing.add(num);
        });
      });
      
      return Array.from(spacing).sort((a, b) => a - b);
    });
  }

  private async extractElements(page: Page): Promise<CrawlResult['elements']> {
    return page.evaluate(() => {
      const elements: any[] = [];
      const selectors = ['button', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'input', 'img'];
      
      selectors.forEach(selector => {
        const els = document.querySelectorAll(selector);
        els.forEach((el, index) => {
          const styles = window.getComputedStyle(el);
          elements.push({
            selector: `${selector}:nth-of-type(${index + 1})`,
            tagName: el.tagName.toLowerCase(),
            styles: {
              color: styles.color,
              backgroundColor: styles.backgroundColor,
              fontSize: styles.fontSize,
              fontFamily: styles.fontFamily,
              fontWeight: styles.fontWeight,
              padding: styles.padding,
              margin: styles.margin
            }
          });
        });
      });
      
      return elements;
    });
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info('Puppeteer browser closed');
    }
  }
}

// Made with Bob
