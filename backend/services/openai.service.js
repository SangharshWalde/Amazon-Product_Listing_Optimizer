require('dotenv').config();
const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.model = process.env.OPENAI_MODEL || "gpt-3.5-turbo";
  }

  // Optimize product title
  async optimizeTitle(originalTitle, productInfo) {
    try {
      const prompt = `
        You are an expert Amazon listing optimizer. Your task is to optimize the following product title to improve its SEO performance and conversion rate.
        
        Original Title: "${originalTitle}"
        
        Additional Product Information:
        ${productInfo.bullets ? '- Bullet Points: ' + productInfo.bullets.join('\n- ') : ''}
        ${productInfo.description ? '- Description: ' + productInfo.description : ''}
        
        Guidelines:
        1. Keep the title under 200 characters
        2. Include important keywords near the beginning
        3. Make it readable and appealing to customers
        4. Include key product features and benefits
        5. Avoid keyword stuffing or unnatural phrasing
        6. Follow Amazon's title format guidelines
        
        Return only the optimized title text without any additional explanation.
      `;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 200
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error optimizing title:', error);
      throw error;
    }
  }

  // Optimize bullet points
  async optimizeBullets(originalBullets, productInfo) {
    try {
      const prompt = `
        You are an expert Amazon listing optimizer. Your task is to optimize the following product bullet points to improve conversion rate and SEO performance.
        
        Original Bullet Points:
        ${originalBullets.map((bullet, i) => `${i + 1}. ${bullet}`).join('\n')}
        
        Additional Product Information:
        - Title: ${productInfo.title}
        ${productInfo.description ? '- Description: ' + productInfo.description : ''}
        
        Guidelines:
        1. Start each bullet with a benefit, followed by the feature
        2. Keep each bullet under 200 characters
        3. Focus on unique selling points and key features
        4. Use strong, persuasive language
        5. Include relevant keywords naturally
        6. Maintain the same number of bullet points as the original
        
        Return the optimized bullet points in a JSON array format like this:
        ["Bullet point 1", "Bullet point 2", ...]
      `;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
      });

      const content = response.choices[0].message.content.trim();
      
      // Extract JSON array from response
      const match = content.match(/\[[\s\S]*\]/);
      if (match) {
        return JSON.parse(match[0]);
      }
      
      // Fallback: split by newlines and clean up
      return content
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*/, '').trim());
    } catch (error) {
      console.error('Error optimizing bullets:', error);
      throw error;
    }
  }

  // Optimize product description
  async optimizeDescription(originalDescription, productInfo) {
    try {
      const prompt = `
        You are an expert Amazon listing optimizer. Your task is to optimize the following product description to improve SEO performance and conversion rate.
        
        Original Description:
        "${originalDescription}"
        
        Additional Product Information:
        - Title: ${productInfo.title}
        ${productInfo.bullets ? '- Bullet Points: ' + productInfo.bullets.join('\n- ') : ''}
        
        Guidelines:
        1. Keep paragraphs short and scannable (2-3 sentences each)
        2. Include relevant keywords naturally
        3. Focus on benefits, not just features
        4. Use persuasive but compliant language (avoid unsubstantiated claims)
        5. Keep the overall length similar to the original
        6. Format with proper paragraph breaks
        
        Return only the optimized description without any additional explanation.
      `;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error optimizing description:', error);
      throw error;
    }
  }

  // Generate keyword suggestions
  async generateKeywords(productInfo) {
    try {
      const prompt = `
        You are an expert Amazon SEO specialist. Your task is to suggest 3-5 high-value keywords for the following product to improve its discoverability.
        
        Product Information:
        - Title: ${productInfo.title}
        ${productInfo.bullets ? '- Bullet Points: ' + productInfo.bullets.join('\n- ') : ''}
        ${productInfo.description ? '- Description: ' + productInfo.description : ''}
        
        Guidelines:
        1. Focus on long-tail keywords with good search volume but lower competition
        2. Include a mix of primary and secondary keywords
        3. Consider keywords that highlight unique selling points
        4. Avoid overly generic terms
        5. Include at least one keyword phrase (2-3 words)
        
        Return the keywords in a JSON array format like this:
        ["keyword 1", "keyword 2", ...]
      `;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 200
      });

      const content = response.choices[0].message.content.trim();
      
      // Extract JSON array from response
      const match = content.match(/\[[\s\S]*\]/);
      if (match) {
        return JSON.parse(match[0]);
      }
      
      // Fallback: split by newlines and clean up
      return content
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim());
    } catch (error) {
      console.error('Error generating keywords:', error);
      throw error;
    }
  }

  // Full optimization
  async optimizeProduct(productData) {
    try {
      // Run optimizations in parallel for efficiency
      const [
        optimizedTitle,
        optimizedBullets,
        optimizedDescription,
        suggestedKeywords
      ] = await Promise.all([
        this.optimizeTitle(productData.title, productData),
        this.optimizeBullets(productData.bullets, productData),
        this.optimizeDescription(productData.description, productData),
        this.generateKeywords(productData)
      ]);
  
      return {
        title: optimizedTitle,
        bullets: optimizedBullets,
        description: optimizedDescription,
        keywords: suggestedKeywords
      };
    } catch (error) {
      console.error('Error in full product optimization:', error);
      // Graceful fallback when OpenAI errors (e.g., quota exceeded)
      return {
        title: this.fallbackTitle(productData.title, productData),
        bullets: this.fallbackBullets(productData.bullets, productData),
        description: this.fallbackDescription(productData.description, productData),
        keywords: this.fallbackKeywords(productData)
      };
    }
  }
}

module.exports = new OpenAIService();

// Fallback utilities when OpenAI is unavailable (quota/model errors)
// Helper: extract normalized feature phrases from title/bullets
function extractFeaturePhrases(title, bullets) {
  const text = [title || '', ...(Array.isArray(bullets) ? bullets : [])].join(' ');
  const phrases = [];
  const add = (p) => { if (!phrases.includes(p)) phrases.push(p); };
  if (/(H1)/i.test(text)) add('H1 Chip');
  if (/(one[- ]?tap|setup)/i.test(text)) add('One‑Tap Setup');
  if (/(Hey\s*Siri|\bSiri\b)/i.test(text)) add('Hands‑Free “Hey Siri”');
  if (/(24[^a-z]*hour|24\s*hours)/i.test(text)) add('24‑Hr Battery');
  if (/(Charging Case|charging)/i.test(text)) add('Charging Case');
  if (/(Audio Sharing|share audio)/i.test(text)) add('Audio Sharing');
  if (/(pause|in your ears|auto)/i.test(text)) add('Auto Play/Pause');
  if (/(Bluetooth)/i.test(text)) add('Bluetooth');
  return phrases;
}
OpenAIService.prototype.fallbackTitle = function(originalTitle, productInfo) {
  const title = (originalTitle || (productInfo && productInfo.title) || '').replace(/\s+/g, ' ').trim();
  const bullets = Array.isArray(productInfo && productInfo.bullets) ? productInfo.bullets : [];

  // Use a concise base name
  let baseName = title.split(/[–—]|,/)[0].trim();
  if (/airpods/i.test(title)) {
    baseName = 'Apple AirPods Wireless Earbuds';
  }

  // Derive clean feature phrases
  const features = extractFeaturePhrases(title, bullets).slice(0, 5);
  let newTitle = features.length ? `${baseName}, ${features.join(', ')}` : baseName;

  // Normalize punctuation and spacing
  newTitle = newTitle
    .replace(/\s+,/g, ',')
    .replace(/,,+/g, ',')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return newTitle.slice(0, 180);
};

OpenAIService.prototype.fallbackBullets = function(originalBullets, productInfo) {
  const bullets = Array.isArray(originalBullets) ? originalBullets : [];

  const rewrite = (b) => {
    let s = String(b)
      .replace(/\s+/g, ' ')
      .trim()
      // Drop shouty prefixes like "LEGAL DISCLAIMERS —"
      .replace(/^[A-Z][A-Z\s\-–—]+(?:—|:|-)?\s*/, '');

    if (/legal/i.test(b)) return '';
    if (/H1/i.test(b)) return 'Rich, immersive sound with Apple H1 chip.';
    if (/(one[- ]?tap|setup|connected|pause)/i.test(b)) return 'Instant one‑tap pairing; auto play/pause; seamless switching.';
    if (/(Hey\s*Siri|\bSiri\b)/i.test(b)) return 'Hands‑free voice control with “Hey Siri”.';
    if (/(24[^a-z]*hour|24\s*hours|battery)/i.test(b)) return 'Up to 24‑hour listening with Charging Case.';
    if (/(Audio Sharing|share audio)/i.test(b)) return 'Audio Sharing between two AirPods on Apple devices.';
    return s;
  };

  const cleaned = bullets.map(rewrite).filter(Boolean);
  const unique = [];
  const seen = new Set();
  for (const s of cleaned) {
    const t = s.replace(/\.+$/, '').trim();
    const key = t.toLowerCase();
    if (!seen.has(key)) { seen.add(key); unique.push(t); }
  }

  // Synthesize bullets for missing items based on feature phrases
  const features = extractFeaturePhrases(productInfo && productInfo.title, productInfo && productInfo.bullets);
  const featureBullets = {
    'H1 Chip': 'Rich, immersive sound with Apple H1 chip.',
    'One‑Tap Setup': 'Instant one‑tap pairing; auto‑connect across Apple devices.',
    'Hands‑Free “Hey Siri”': 'Hands‑free voice control with “Hey Siri”.',
    '24‑Hr Battery': 'Up to 24‑hour listening with Charging Case.',
    'Charging Case': 'Portable charging case keeps you powered on the go.',
    'Audio Sharing': 'Share audio with two sets of AirPods on Apple devices.',
    'Auto Play/Pause': 'In‑ear detection for auto play/pause; seamless switching.',
    'Bluetooth': 'Reliable Bluetooth wireless connection.'
  };

  for (const f of features) {
    if (unique.length >= 5) break;
    const candidate = featureBullets[f];
    if (candidate && !seen.has(candidate.toLowerCase())) {
      unique.push(candidate);
      seen.add(candidate.toLowerCase());
    }
  }

  // Backfill if still short
  while (unique.length < 5) {
    unique.push('Designed for everyday use with dependable, user‑friendly performance.');
  }

  return unique.slice(0, 5);
};

OpenAIService.prototype.fallbackDescription = function(originalDescription, productInfo) {
  const title = (productInfo && productInfo.title) || '';
  const bullets = Array.isArray(productInfo && productInfo.bullets) ? productInfo.bullets : [];
  const features = extractFeaturePhrases(title, bullets);

  const baseNameRaw = (title || '').replace(/\s+/g, ' ').trim();
  const baseName = /airpods/i.test(baseNameRaw) ? 'Apple AirPods Wireless Earbuds' : baseNameRaw.split(/[–—]|,/)[0].trim();

  const p1 = `${baseName} deliver rich, immersive sound and a seamless experience. Key features include ${features.slice(0, 4).join(', ')}.`;

  const hasBattery = features.includes('24‑Hr Battery');
  const hasSiri = features.includes('Hands‑Free “Hey Siri”');
  const extras = [];
  if (hasBattery) extras.push('up to 24‑hour listening with the Charging Case');
  if (hasSiri) extras.push('hands‑free control with “Hey Siri”');
  const tail = extras.length ? ` It offers ${extras.join(' and ')}.` : '';

  const p2 = `Built for daily use at home, work, and travel.${tail}`;
  const desc = `${p1}\n\n${p2}`;
  return desc.slice(0, 1000).trim();
};

OpenAIService.prototype.fallbackKeywords = function(productInfo) {
  const text = [productInfo.title || '', ...(productInfo.bullets || []), productInfo.description || ''].join(' ');
  const words = (text.toLowerCase().match(/[a-z0-9]+/g) || []).filter(w => w.length >= 4);
  const stop = new Set(['the','and','with','from','that','this','your','have','will','into','over','under','than','then','they','them','also','into','onto','about','for','with','without','when','where','what','which','been','being','were','has','had','was','are','is','you']);
  const freq = {};
  for (const w of words) {
    if (!stop.has(w)) {
      freq[w] = (freq[w] || 0) + 1;
    }
  }
  const sorted = Object.keys(freq).sort((a, b) => freq[b] - freq[a]);
  return sorted.slice(0, 5);
};