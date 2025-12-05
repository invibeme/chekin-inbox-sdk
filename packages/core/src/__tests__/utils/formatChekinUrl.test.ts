import {describe, it, expect} from 'vitest';
import {formatChekinUrl} from '../../utils/formatChekinUrl';
import {ChekinInboxSDKConfig} from '../../types';

describe('formatChekinUrl', () => {
  const baseConfig: ChekinInboxSDKConfig = {
    apiKey: 'test-api-key',
  };

  describe('URL generation', () => {
    it('should generate URL with default version when no version specified', () => {
      const result = formatChekinUrl(baseConfig);

      expect(result.url).toContain('https://cdn.chekin.com/inbox-sdk/latest/');
      expect(result.url).toContain('apiKey=test-api-key');
      expect(result.isLengthLimited).toBe(false);
    });

    it('should use custom baseUrl when provided', () => {
      const config = {
        ...baseConfig,
        baseUrl: 'https://custom.example.com/',
      };

      const result = formatChekinUrl(config);

      expect(result.url).toContain('https://custom.example.com/');
      expect(result.url).toContain('apiKey=test-api-key');
    });

    it('should handle version prefixing correctly', () => {
      const configWithV = {
        ...baseConfig,
        version: 'v1.2.3',
      };

      const configWithoutV = {
        ...baseConfig,
        version: '1.2.3',
      };

      const resultWithV = formatChekinUrl(configWithV);
      const resultWithoutV = formatChekinUrl(configWithoutV);

      expect(resultWithV.url).toContain('inbox-sdk/v1.2.3/');
      expect(resultWithoutV.url).toContain('inbox-sdk/v1.2.3/');
    });

    it('should handle "latest" version correctly', () => {
      const config = {
        ...baseConfig,
        version: 'latest',
      };

      const result = formatChekinUrl(config);

      expect(result.url).toContain('inbox-sdk/latest/');
    });

    it('should handle "development" version correctly', () => {
      const config = {
        ...baseConfig,
        version: 'development',
      };

      const result = formatChekinUrl(config);

      expect(result.url).toContain('inbox-sdk/development/');
    });
  });

  describe('Essential parameters', () => {
    it('should add all essential parameters to URL', () => {
      const config: ChekinInboxSDKConfig = {
        apiKey: 'test-key',
        defaultLanguage: 'en',
        autoHeight: true,
      };

      const result = formatChekinUrl(config);

      expect(result.url).toContain('apiKey=test-key');
      expect(result.url).toContain('lang=en');
      expect(result.url).toContain('autoHeight=true');
    });
  });

  describe('Styles handling', () => {
    it('should add short stylesLink to URL', () => {
      const config = {
        ...baseConfig,
        stylesLink: 'https://example.com/styles.css',
      };

      const result = formatChekinUrl(config);

      expect(result.url).toContain(
        'stylesLink=https%253A%252F%252Fexample.com%252Fstyles.css',
      );
      expect(result.postMessageConfig).toBeUndefined();
      expect(result.isLengthLimited).toBe(false);
    });

    it('should move long stylesLink to postMessage config', () => {
      const longStylesLink =
        'https://example.com/very-long-styles-link-' + 'x'.repeat(500);
      const config = {
        ...baseConfig,
        stylesLink: longStylesLink,
      };

      const result = formatChekinUrl(config);

      expect(result.url).not.toContain('stylesLink=');
      expect(result.postMessageConfig?.stylesLink).toBe(longStylesLink);
      expect(result.isLengthLimited).toBe(true);
    });

    it('should add short styles to URL', () => {
      const config = {
        ...baseConfig,
        styles: 'body { color: red; }',
      };

      const result = formatChekinUrl(config);

      expect(result.url).toContain(
        'styles=body%2520%257B%2520color%253A%2520red%253B%2520%257D',
      );
      expect(result.postMessageConfig).toBeUndefined();
      expect(result.isLengthLimited).toBe(false);
    });

    it('should move long styles to postMessage config', () => {
      const longStyles =
        'body { color: red; } ' + '.class { background: blue; } '.repeat(50);
      const config = {
        ...baseConfig,
        styles: longStyles,
      };

      const result = formatChekinUrl(config);

      expect(result.url).not.toContain('styles=');
      expect(result.postMessageConfig?.styles).toBe(longStyles);
      expect(result.isLengthLimited).toBe(true);
    });
  });

  describe('URL length limits', () => {
    it('should create minimal URL when exceeding safe limit', () => {
      const config: ChekinInboxSDKConfig = {
        apiKey: 'test-key',
        defaultLanguage: 'en',
      };

      const result = formatChekinUrl(config);

      expect(result.url).toContain('apiKey=test-key');
      expect(result.url).not.toContain('lang=');

      expect(result.postMessageConfig?.defaultLanguage).toBe('en');
      expect(result.isLengthLimited).toBe(true);
    });
  });

  describe('PostMessage config handling', () => {
    it('should return undefined postMessageConfig when empty', () => {
      const result = formatChekinUrl(baseConfig);

      expect(result.postMessageConfig).toBeUndefined();
    });

    it('should combine multiple config items in postMessage', () => {
      const longStyles = 'x'.repeat(600);
      const config = {
        ...baseConfig,
        styles: longStyles,
      };

      const result = formatChekinUrl(config);

      expect(result.postMessageConfig?.styles).toBe(longStyles);
      expect(result.isLengthLimited).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle config with only apiKey', () => {
      const result = formatChekinUrl({apiKey: 'test-key'});

      expect(result.url).toContain('apiKey=test-key');
      expect(result.postMessageConfig).toBeUndefined();
      expect(result.isLengthLimited).toBe(false);
    });

    it('should handle boolean values correctly', () => {
      const config = {
        ...baseConfig,
        autoHeight: false,
      };

      const result = formatChekinUrl(config);

      expect(result.url).toContain('autoHeight=false');
    });

    it('should properly encode special characters in URL parameters', () => {
      const config = {
        ...baseConfig,
        defaultLanguage: 'zh-CN',
        styles: 'body { content: "Hello & World"; }',
      };

      const result = formatChekinUrl(config);

      expect(result.url).toContain('lang=zh-CN');
      expect(result.url).toContain(
        'styles=body%2520%257B%2520content%253A%2520%2522Hello%2520%2526%2520World%2522%253B%2520%257D',
      );
    });
  });

  describe('Return type validation', () => {
    it('should return UrlConfigResult with correct structure', () => {
      const result = formatChekinUrl(baseConfig);

      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('isLengthLimited');
      expect(typeof result.url).toBe('string');
      expect(typeof result.isLengthLimited).toBe('boolean');

      if (result.postMessageConfig) {
        expect(typeof result.postMessageConfig).toBe('object');
      }
    });

    it('should return valid URL format', () => {
      const result = formatChekinUrl(baseConfig);

      expect(() => new URL(result.url)).not.toThrow();
    });
  });
});
