import { describe, it, expect } from 'vitest';
import * as cheerio from 'cheerio';
import { EmbedDetector } from '../EmbedDetector';

describe('EmbedDetector', () => {
  const detector = new EmbedDetector();

  describe('Google Maps detection', () => {
    it('should detect Google Maps embed', () => {
      const html = `
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3"
          width="600"
          height="450"
          style="border:0;"
          allowfullscreen=""
          loading="lazy">
        </iframe>
      `;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('google-maps-embed');
      expect(result[0].confidence).toBe(100);
      expect(result[0].properties.provider).toBe('Google Maps');
      expect(result[0].properties.width).toBe('600');
      expect(result[0].properties.height).toBe('450');
    });

    it('should detect maps.google.com domain', () => {
      const html = `
        <iframe src="https://maps.google.com/maps?q=..." width="400" height="300"></iframe>
      `;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('google-maps-embed');
    });
  });

  describe('YouTube detection', () => {
    it('should detect YouTube embed with video ID', () => {
      const html = `
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
          frameborder="0"
          allowfullscreen>
        </iframe>
      `;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('youtube-embed');
      expect(result[0].properties.provider).toBe('YouTube');
      expect(result[0].properties.embedId).toBe('dQw4w9WgXcQ');
      expect(result[0].properties.aspectRatio).toBe('16:9');
    });

    it('should detect YouTube nocookie domain', () => {
      const html = `
        <iframe src="https://www.youtube-nocookie.com/embed/VIDEO_ID"></iframe>
      `;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('youtube-embed');
    });

    it('should detect youtu.be short URLs', () => {
      const html = `
        <iframe src="https://youtu.be/dQw4w9WgXcQ"></iframe>
      `;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('youtube-embed');
      expect(result[0].properties.embedId).toBe('dQw4w9WgXcQ');
    });
  });

  describe('Vimeo detection', () => {
    it('should detect Vimeo embed with video ID', () => {
      const html = `
        <iframe
          src="https://player.vimeo.com/video/123456789"
          width="640"
          height="360"
          frameborder="0"
          allowfullscreen>
        </iframe>
      `;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('vimeo-embed');
      expect(result[0].properties.provider).toBe('Vimeo');
      expect(result[0].properties.embedId).toBe('123456789');
    });

    it('should detect vimeo.com/video URLs', () => {
      const html = `
        <iframe src="https://vimeo.com/video/987654321"></iframe>
      `;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('vimeo-embed');
      expect(result[0].properties.embedId).toBe('987654321');
    });
  });

  describe('Twitter detection', () => {
    it('should detect Twitter iframe embed', () => {
      const html = `
        <iframe src="https://platform.twitter.com/embed/Tweet.html?id=123"></iframe>
      `;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('twitter-embed');
      expect(result[0].properties.provider).toBe('Twitter');
    });

    it('should detect Twitter blockquote widget', () => {
      const html = `
        <blockquote class="twitter-tweet">
          <p>Tweet content</p>
          <a href="https://twitter.com/user/status/123">View tweet</a>
        </blockquote>
      `;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('twitter-embed');
      expect(result[0].confidence).toBe(95);
      expect(result[0].detectionMethod).toBe('widget-class');
    });

    it('should detect Twitter timeline widget', () => {
      const html = `
        <a class="twitter-timeline" href="https://twitter.com/username">Tweets</a>
      `;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('twitter-embed');
    });
  });

  describe('Instagram detection', () => {
    it('should detect Instagram iframe embed', () => {
      const html = `
        <iframe src="https://www.instagram.com/embed/p/ABC123/"></iframe>
      `;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('instagram-embed');
      expect(result[0].properties.provider).toBe('Instagram');
    });

    it('should detect Instagram blockquote widget', () => {
      const html = `
        <blockquote
          class="instagram-media"
          data-instgrm-permalink="https://www.instagram.com/p/ABC123/">
        </blockquote>
      `;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('instagram-embed');
      expect(result[0].properties.provider).toBe('Instagram');
      expect(result[0].properties.src).toBe('https://www.instagram.com/p/ABC123/');
    });
  });

  describe('Facebook detection', () => {
    it('should detect Facebook iframe embed', () => {
      const html = `
        <iframe src="https://www.facebook.com/plugins/post.php?href=..."></iframe>
      `;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('facebook-embed');
      expect(result[0].properties.provider).toBe('Facebook');
    });

    it('should detect Facebook post widget', () => {
      const html = `
        <div class="fb-post" data-href="https://www.facebook.com/user/posts/123"></div>
      `;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('facebook-embed');
      expect(result[0].properties.provider).toBe('Facebook');
      expect(result[0].properties.src).toBe('https://www.facebook.com/user/posts/123');
    });

    it('should detect Facebook video widget', () => {
      const html = `
        <div class="fb-video" data-href="https://www.facebook.com/video/123"></div>
      `;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('facebook-embed');
    });

    it('should detect Facebook page widget', () => {
      const html = `
        <div class="fb-page" data-href="https://www.facebook.com/page"></div>
      `;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('facebook-embed');
    });
  });

  describe('Generic iframe detection', () => {
    it('should detect unknown iframes as generic embeds', () => {
      const html = `
        <iframe src="https://example.com/widget" width="500" height="400"></iframe>
      `;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('generic-embed');
      expect(result[0].properties.provider).toBe('Unknown');
      expect(result[0].confidence).toBe(70);
    });

    it('should skip empty iframes', () => {
      const html = `
        <iframe src=""></iframe>
        <iframe src="about:blank"></iframe>
      `;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result).toHaveLength(0);
    });

    it('should not duplicate already-detected embeds', () => {
      const html = `
        <iframe src="https://www.youtube.com/embed/VIDEO_ID"></iframe>
      `;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      // Should only be detected once (as YouTube, not generic)
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('youtube-embed');
    });
  });

  describe('Aspect ratio calculation', () => {
    it('should detect 16:9 aspect ratio', () => {
      const html = `<iframe src="https://example.com" width="1920" height="1080"></iframe>`;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result[0].properties.aspectRatio).toBe('16:9');
    });

    it('should detect 4:3 aspect ratio', () => {
      const html = `<iframe src="https://example.com" width="800" height="600"></iframe>`;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result[0].properties.aspectRatio).toBe('4:3');
    });

    it('should detect 1:1 aspect ratio', () => {
      const html = `<iframe src="https://example.com" width="500" height="500"></iframe>`;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result[0].properties.aspectRatio).toBe('1:1');
    });

    it('should return custom ratio for non-standard dimensions', () => {
      const html = `<iframe src="https://example.com" width="1000" height="300"></iframe>`;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result[0].properties.aspectRatio).toBe('1000:300');
    });

    it('should return undefined when dimensions are missing', () => {
      const html = `<iframe src="https://example.com"></iframe>`;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result[0].properties.aspectRatio).toBeUndefined();
    });
  });

  describe('Responsive detection', () => {
    it('should detect responsive embeds without fixed dimensions', () => {
      const html = `<iframe src="https://example.com" style="width: 100%;"></iframe>`;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result[0].properties.isResponsive).toBe(true);
    });

    it('should detect fixed-size embeds', () => {
      const html = `<iframe src="https://example.com" width="600" height="400"></iframe>`;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result[0].properties.isResponsive).toBe(false);
    });

    it('should detect percentage-based width as responsive', () => {
      const html = `<iframe src="https://example.com" width="100%" height="400"></iframe>`;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result[0].properties.isResponsive).toBe(true);
    });
  });

  describe('Multiple embeds', () => {
    it('should detect multiple embeds of different types', () => {
      const html = `
        <iframe src="https://www.google.com/maps/embed?pb=123"></iframe>
        <iframe src="https://www.youtube.com/embed/VIDEO1"></iframe>
        <iframe src="https://player.vimeo.com/video/123"></iframe>
        <blockquote class="twitter-tweet"><a href="https://twitter.com/user/status/123">Tweet</a></blockquote>
      `;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result).toHaveLength(4);
      expect(result[0].type).toBe('google-maps-embed');
      expect(result[1].type).toBe('youtube-embed');
      expect(result[2].type).toBe('vimeo-embed');
      expect(result[3].type).toBe('twitter-embed');
    });

    it('should detect multiple YouTube embeds', () => {
      const html = `
        <iframe src="https://www.youtube.com/embed/VIDEO1"></iframe>
        <iframe src="https://www.youtube.com/embed/VIDEO2"></iframe>
        <iframe src="https://www.youtube.com/embed/VIDEO3"></iframe>
      `;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result).toHaveLength(3);
      expect(result.every(r => r.type === 'youtube-embed')).toBe(true);
      expect(result[0].properties.embedId).toBe('VIDEO1');
      expect(result[1].properties.embedId).toBe('VIDEO2');
      expect(result[2].properties.embedId).toBe('VIDEO3');
    });
  });

  describe('Edge cases', () => {
    it('should handle iframe with title attribute', () => {
      const html = `
        <iframe
          src="https://www.youtube.com/embed/VIDEO"
          title="Video Title"
          width="560"
          height="315">
        </iframe>
      `;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result[0].properties.title).toBe('Video Title');
    });

    it('should handle iframe with allowfullscreen attribute', () => {
      const html = `
        <iframe
          src="https://www.youtube.com/embed/VIDEO"
          allowfullscreen>
        </iframe>
      `;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result[0].properties.allowFullscreen).toBe(true);
    });

    it('should handle iframe without allowfullscreen', () => {
      const html = `
        <iframe src="https://example.com/widget"></iframe>
      `;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result[0].properties.allowFullscreen).toBe(false);
    });

    it('should handle iframes with IDs', () => {
      const html = `
        <iframe id="map-embed" src="https://www.google.com/maps/embed?pb=123"></iframe>
      `;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result[0].selector).toBe('iframe#map-embed');
    });

    it('should handle iframes with classes', () => {
      const html = `
        <iframe class="video-embed responsive" src="https://www.youtube.com/embed/VIDEO"></iframe>
      `;
      const $ = cheerio.load(html);
      const result = detector.detect($);

      expect(result[0].classes).toContain('video-embed');
      expect(result[0].classes).toContain('responsive');
    });
  });
});
