const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');

class ScraperService {
  constructor() {
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
    ];
  }

  // Get random user agent
  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  // Scrape Amazon product details
  async scrapeProductByAsin(asin) {
    if (!asin || asin.length !== 10) {
      throw new Error('Invalid ASIN format. ASIN must be 10 characters.');
    }

    const url = `https://www.amazon.com/dp/${asin}`;
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--lang=en-US,en'
      ]
    });

     try {
       const page = await browser.newPage();
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
      });
      await page.setExtraHTTPHeaders({ 'accept-language': 'en-US,en;q=0.9' });
       
       // Set random user agent
       await page.setUserAgent(this.getRandomUserAgent());
       
       // Set viewport
       await page.setViewport({ width: 1280, height: 800 });
       
       // Navigate to product page
       await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      
      // Wait for product title to load
      await page.waitForSelector('#productTitle', { timeout: 5000 }).catch(() => {});

      // Encourage lazy content (A+ modules) to load
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1200);
      // Try to wait for A+ section briefly
      await page.waitForSelector('#aplus_feature_div', { timeout: 2000 }).catch(() => {});
      
      // Get page content
      const content = await page.content();
      
      // Parse with Cheerio
      const $ = cheerio.load(content);
      
      // Extract product details
      const title = $('#productTitle').text().trim();
      
      if (!title) {
        throw new Error('Product not found or access denied by Amazon');
      }
      
      // Extract bullet points
      const bulletPoints = [];
      $('#feature-bullets ul li span.a-list-item').each((i, el) => {
        const bullet = $(el).text().trim();
        if (bullet) bulletPoints.push(bullet);
      });
      
      // Extract product description
      let description = '';
      
      // Try different selectors for description (including common A+ layouts)
      const descriptionSelectors = [
        '#productDescription',
        '#productDescription p',
        '#productDescription .a-expander-content',
        '#productDescription li',
        '#aplus',
        '#aplus p',
        '#aplus li',
        '#aplus_feature_div',
        '#aplus_feature_div p',
        '#aplus_feature_div li',
        '#aplus3p_feature_div',
        '#aplus3p_feature_div p',
        '#aplus3p_feature_div li',
        '#dpx-aplus-product-description_feature_div',
        '#dpx-aplus-product-description_feature_div p',
        '#dpx-aplus-product-description_feature_div li',
        'div[id*="aplus"] p',
        'div[id*="aplus"] li'
      ];
      
      for (const selector of descriptionSelectors) {
        $(selector).each((i, el) => {
          const text = $(el).text().trim();
          if (text) description += text + '\n\n';
        });
        
        if (description) break;
      }
      
      description = description.trim();

      // Fallback: attempt to extract from product description iframe if present
      if (!description) {
        try {
          const frames = page.frames();
          let iframeText = '';
          for (const frame of frames) {
            const url = (frame.url() || '').toLowerCase();
            const name = (frame.name() || '').toLowerCase();
            if ((url.includes('product') && url.includes('description')) || (name.includes('product') && name.includes('description'))) {
              iframeText = await frame.evaluate(() => {
                const candidates = [
                  '#productDescription',
                  '#productDescription p',
                  'p',
                  'div',
                  '.aplus',
                  '.aplus p',
                  '.aplus div',
                ];
                let buf = '';
                for (const sel of candidates) {
                  document.querySelectorAll(sel).forEach(el => {
                    const t = (el.innerText || '').trim();
                    if (t) buf += t + '\n\n';
                  });
                }
                return buf.trim();
              });
              if (iframeText) break;
            }
          }
          if (iframeText) {
            description = iframeText.trim();
          }
        } catch (e) {
          console.warn('Iframe description extraction failed:', e.message);
        }
      }

      // Last resort: parse noscript blocks which sometimes contain description HTML
      if (!description) {
        $('noscript').each((i, el) => {
          const text = $(el).text().trim();
          if (text) description += text + '\n\n';
        });
        description = description.trim();
      }

      // Final cleanup: collapse excessive whitespace
      description = description.replace(/\s{3,}/g, ' ').trim();

      // Mobile page fallback: attempt to pull description from lightweight view
      if (!description) {
        const mobileUrl = `https://www.amazon.com/gp/aw/d/${asin}`;
        try {
          const respMobile = await axios.get(mobileUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
              'Accept-Language': 'en-US,en;q=0.9',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            },
            timeout: 60000
          });
          const $m = cheerio.load(respMobile.data);
          const mobileSelectors = [
            '#description',
            '#description p',
            'div[id*="description"]',
            'div[id*="description"] p',
            'div[id*="aplus"]',
            'div[id*="aplus"] p',
            '.a-expander-content',
            '.a-expander-content p'
          ];
          let descBuf = '';
          for (const sel of mobileSelectors) {
            $m(sel).each((i, el) => {
              const t = $m(el).text().trim();
              if (t) descBuf += t + '\n\n';
            });
            if (descBuf) break;
          }
          description = (descBuf || '').replace(/\s{3,}/g, ' ').trim();
        } catch (e) {
          // ignore mobile fetch failures
        }
      }
      
      return {
        asin,
        title,
        bullets: bulletPoints,
        description
      };
    } catch (error) {
      console.error(`Error scraping product ${asin}:`, error);
      
      // Fallback: try axios + cheerio (and iframe src fetch) when Puppeteer fails
      try {
        const resp = await axios.get(url, {
          headers: {
            'User-Agent': this.getRandomUserAgent(),
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
          },
          timeout: 60000
        });
        const $ = cheerio.load(resp.data);
        const title = $('#productTitle').text().trim() || $('span#productTitle').text().trim();
        
        const bulletPoints = [];
        $('#feature-bullets ul li span.a-list-item').each((i, el) => {
          const bullet = $(el).text().trim();
          if (bullet) bulletPoints.push(bullet);
        });
        
        let description = '';
        const descriptionSelectors = [
          '#productDescription',
          '#productDescription p',
          '#productDescription .a-expander-content',
          '#productDescription li',
          '#aplus',
          '#aplus p',
          '#aplus li',
          '#aplus_feature_div',
          '#aplus_feature_div p',
          '#aplus_feature_div li',
          'div[id*="aplus"] p',
          'div[id*="aplus"] li'
        ];
        for (const selector of descriptionSelectors) {
          $(selector).each((i, el) => {
            const text = $(el).text().trim();
            if (text) description += text + '\n\n';
          });
          if (description) break;
        }
        
        // Try fetching product description iframe
        if (!description) {
          const iframeSrcs = [];
          $('iframe').each((i, el) => {
            const src = $(el).attr('src') || '';
            const id = ($(el).attr('id') || '').toLowerCase();
            if ((/product.*description/i.test(src)) || (id.includes('product') && id.includes('description'))) {
              iframeSrcs.push(src);
            }
          });
          for (const src of iframeSrcs) {
            try {
              const iframeResp = await axios.get(src, {
                headers: {
                  'User-Agent': this.getRandomUserAgent(),
                  'Accept-Language': 'en-US,en;q=0.9',
                  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
                },
                timeout: 30000
              });
              const $i = cheerio.load(iframeResp.data);
              ['#productDescription','p','div','.aplus','.aplus p'].forEach(sel => {
                $i(sel).each((j, el) => {
                  const t = $i(el).text().trim();
                  if (t) description += t + '\n\n';
                });
              });
              if (description) break;
            } catch (e) {
              // ignore iframe failures
            }
          }
        }
        
        description = (description || '').replace(/\s{3,}/g, ' ').trim();
        
        return { asin, title, bullets: bulletPoints, description };
      } catch (fallbackErr) {
        throw error;
      }
    } finally {
      await browser.close();
    }
  }
}

module.exports = new ScraperService();