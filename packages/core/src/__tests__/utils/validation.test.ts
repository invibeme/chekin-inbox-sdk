import {describe, it, expect, beforeEach} from 'vitest';
import {ChekinSDKValidator} from '../../utils/validation';
import {ChekinInboxSDKConfig} from '../../types';

describe('ChekinSDKValidator', () => {
  let validator: ChekinSDKValidator;

  beforeEach(() => {
    validator = new ChekinSDKValidator();
  });

  const createValidConfig = (): ChekinInboxSDKConfig => ({
    apiKey: 'valid-api-key-12345',
    baseUrl: 'https://api.example.com',
    version: '1.0.0',
    defaultLanguage: 'en',
    styles: 'body { color: red; }',
    stylesLink: 'https://example.com/styles.css',
    autoHeight: true,
    enableLogging: false,
    onHeightChanged: () => {},
    onError: () => {},
    onConnectionError: () => {},
  });

  describe('validateConfig', () => {
    describe('valid configurations', () => {
      it('should validate a complete valid configuration', () => {
        const config = createValidConfig();
        const result = validator.validateConfig(config);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
      });

      it('should validate minimal valid configuration', () => {
        const config: ChekinInboxSDKConfig = {
          apiKey: 'valid-api-key-12345',
        };
        const result = validator.validateConfig(config);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
      });
    });

    describe('apiKey validation', () => {
      it('should require apiKey', () => {
        const config = {...createValidConfig(), apiKey: undefined as unknown as string};
        const result = validator.validateConfig(config);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual({
          field: 'apiKey',
          message: 'API key is required',
          value: undefined,
        });
      });

      it('should reject non-string apiKey', () => {
        const config = {...createValidConfig(), apiKey: 12345 as unknown as string};
        const result = validator.validateConfig(config);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual({
          field: 'apiKey',
          message: 'API key must be a string',
          value: 12345,
        });
      });

      it('should warn about short apiKey', () => {
        const config = {...createValidConfig(), apiKey: 'short'};
        const result = validator.validateConfig(config);

        expect(result.isValid).toBe(true);
        expect(result.warnings).toContainEqual({
          field: 'apiKey',
          message: 'API key seems too short, please verify it is correct',
          value: 5,
        });
      });
    });

    describe('baseUrl validation', () => {
      it('should accept valid baseUrl', () => {
        const config = {...createValidConfig(), baseUrl: 'https://valid.com'};
        const result = validator.validateConfig(config);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject non-string baseUrl', () => {
        const config = {...createValidConfig(), baseUrl: 12345 as unknown as string};
        const result = validator.validateConfig(config);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual({
          field: 'baseUrl',
          message: 'Base URL must be a string',
          value: 12345,
        });
      });

      it('should reject invalid URL format', () => {
        const config = {...createValidConfig(), baseUrl: 'not-a-url'};
        const result = validator.validateConfig(config);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual({
          field: 'baseUrl',
          message: 'Base URL must be a valid URL',
          value: 'not-a-url',
        });
      });
    });

    describe('version validation', () => {
      it('should accept "latest" version', () => {
        const config = {...createValidConfig(), version: 'latest'};
        const result = validator.validateConfig(config);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should accept semantic version formats', () => {
        const versions = ['1.0.0', 'v2.1.3', '10.20.30-alpha'];
        versions.forEach(version => {
          const config = {...createValidConfig(), version};
          const result = validator.validateConfig(config);

          expect(result.isValid).toBe(true);
          expect(result.errors).toHaveLength(0);
        });
      });

      it('should reject non-string version', () => {
        const config = {...createValidConfig(), version: 123 as unknown as string};
        const result = validator.validateConfig(config);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual({
          field: 'version',
          message: 'Version must be a string',
          value: 123,
        });
      });

      it('should warn about invalid version format', () => {
        const config = {...createValidConfig(), version: 'invalid-version'};
        const result = validator.validateConfig(config);

        expect(result.isValid).toBe(true);
        expect(result.warnings).toContainEqual({
          field: 'version',
          message:
            'Version format should be "latest" or semantic version (e.g., "1.0.0", "v2.1.3")',
          value: 'invalid-version',
        });
      });
    });

    describe('features validation', () => {
      it('should accept valid features array', () => {
        const config = {...createValidConfig(), features: ['IV']};
        const result = validator.validateConfig(config);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject non-array features', () => {
        const config = {...createValidConfig(), features: 'IV' as unknown as string[]};
        const result = validator.validateConfig(config);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual({
          field: 'features',
          message: 'Features must be an array',
          value: 'IV',
        });
      });

      it('should reject non-string feature items', () => {
        const config = {
          ...createValidConfig(),
          features: [123, 'IV'] as unknown as string[],
        };
        const result = validator.validateConfig(config);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual({
          field: 'features[0]',
          message: 'Each feature must be a string',
          value: 123,
        });
      });

      it('should warn about unknown features', () => {
        const config = {...createValidConfig(), features: ['UNKNOWN_FEATURE']};
        const result = validator.validateConfig(config);

        expect(result.isValid).toBe(true);
        expect(result.warnings).toContainEqual({
          field: 'features[0]',
          message: 'Unknown feature "UNKNOWN_FEATURE". Supported features: IV',
          value: 'UNKNOWN_FEATURE',
        });
      });
    });

    describe('ID validation', () => {
      const idFields = ['housingId', 'externalHousingId', 'reservationId'];

      idFields.forEach(fieldName => {
        describe(`${fieldName}`, () => {
          it('should accept valid string ID', () => {
            const config = {...createValidConfig(), [fieldName]: 'valid-id-123'};
            const result = validator.validateConfig(config);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
          });

          it('should reject non-string ID', () => {
            const config = {
              ...createValidConfig(),
              [fieldName]: 12345 as unknown as string,
            };
            const result = validator.validateConfig(config);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
              field: fieldName,
              message: `${fieldName} must be a string`,
              value: 12345,
            });
          });

          it('should reject empty string ID', () => {
            const config = {...createValidConfig(), [fieldName]: ''};
            const result = validator.validateConfig(config);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
              field: fieldName,
              message: `${fieldName} cannot be empty`,
              value: '',
            });
          });

          it('should warn about very long ID', () => {
            const longId = 'x'.repeat(101);
            const config = {...createValidConfig(), [fieldName]: longId};
            const result = validator.validateConfig(config);

            expect(result.isValid).toBe(true);
            expect(result.warnings).toContainEqual({
              field: fieldName,
              message: `${fieldName} is unusually long (101 characters)`,
              value: 101,
            });
          });
        });
      });
    });

    describe('defaultLanguage validation', () => {
      it('should accept supported language', () => {
        const config = {...createValidConfig(), defaultLanguage: 'es'};
        const result = validator.validateConfig(config);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject non-string language', () => {
        const config = {
          ...createValidConfig(),
          defaultLanguage: 123 as unknown as string,
        };
        const result = validator.validateConfig(config);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual({
          field: 'defaultLanguage',
          message: 'Default language must be a string',
          value: 123,
        });
      });

      it('should warn about unsupported language', () => {
        const config = {...createValidConfig(), defaultLanguage: 'xx'};
        const result = validator.validateConfig(config);

        expect(result.isValid).toBe(true);
        expect(result.warnings).toContainEqual(
          expect.objectContaining({
            field: 'defaultLanguage',
            message: expect.stringContaining('Unsupported language "xx"'),
            value: 'xx',
          }),
        );
      });
    });

    describe('styles validation', () => {
      it('should accept valid styles string', () => {
        const config = {...createValidConfig(), styles: 'body { color: red; }'};
        const result = validator.validateConfig(config);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject non-string styles', () => {
        const config = {...createValidConfig(), styles: 123 as unknown as string};
        const result = validator.validateConfig(config);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual({
          field: 'styles',
          message: 'Styles must be a string',
          value: 123,
        });
      });
    });

    describe('stylesLink validation', () => {
      it('should accept valid stylesLink URL', () => {
        const config = {
          ...createValidConfig(),
          stylesLink: 'https://example.com/styles.css',
        };
        const result = validator.validateConfig(config);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject non-string stylesLink', () => {
        const config = {...createValidConfig(), stylesLink: 123 as unknown as string};
        const result = validator.validateConfig(config);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual({
          field: 'stylesLink',
          message: 'Styles link must be a string',
          value: 123,
        });
      });

      it('should reject invalid URL format', () => {
        const config = {...createValidConfig(), stylesLink: 'not-a-url'};
        const result = validator.validateConfig(config);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual({
          field: 'stylesLink',
          message: 'Styles link must be a valid URL',
          value: 'not-a-url',
        });
      });
    });

    describe('boolean fields validation', () => {
      const booleanFields = ['autoHeight', 'enableLogging'];

      booleanFields.forEach(fieldName => {
        describe(`${fieldName}`, () => {
          it('should accept boolean true', () => {
            const config = {...createValidConfig(), [fieldName]: true};
            const result = validator.validateConfig(config);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
          });

          it('should accept boolean false', () => {
            const config = {...createValidConfig(), [fieldName]: false};
            const result = validator.validateConfig(config);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
          });

          it('should reject non-boolean value', () => {
            const config = {
              ...createValidConfig(),
              [fieldName]: 'true' as unknown as boolean,
            };
            const result = validator.validateConfig(config);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
              field: fieldName,
              message: `${fieldName} must be a boolean`,
              value: 'true',
            });
          });
        });
      });
    });

    describe('callback validation', () => {
      const callbackFields = ['onHeightChanged', 'onError', 'onConnectionError'];

      callbackFields.forEach(fieldName => {
        describe(`${fieldName}`, () => {
          it('should accept valid function callback', () => {
            const config = {...createValidConfig(), [fieldName]: () => {}};
            const result = validator.validateConfig(config);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
          });

          it('should reject non-function callback', () => {
            const config = {
              ...createValidConfig(),
              [fieldName]: 'not-function' as unknown as () => void,
            };
            const result = validator.validateConfig(config);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
              field: fieldName,
              message: `${fieldName} must be a function`,
              value: 'string',
            });
          });
        });
      });
    });
  });

  describe('static validation methods', () => {
    describe('validateApiKey', () => {
      it('should return true for valid API key', () => {
        expect(ChekinSDKValidator.validateApiKey('valid-api-key-12345')).toBe(true);
      });

      it('should return false for short API key', () => {
        expect(ChekinSDKValidator.validateApiKey('short')).toBe(false);
      });

      it('should return false for non-string API key', () => {
        expect(ChekinSDKValidator.validateApiKey(12345)).toBe(false);
      });

      it('should return false for undefined API key', () => {
        expect(ChekinSDKValidator.validateApiKey(undefined)).toBe(false);
      });
    });

    describe('validateUrl', () => {
      it('should return true for valid URLs', () => {
        expect(ChekinSDKValidator.validateUrl('https://example.com')).toBe(true);
        expect(ChekinSDKValidator.validateUrl('http://localhost:3000')).toBe(true);
        expect(
          ChekinSDKValidator.validateUrl(
            'https://subdomain.example.com/path?query=value',
          ),
        ).toBe(true);
      });

      it('should return false for invalid URLs', () => {
        expect(ChekinSDKValidator.validateUrl('not-a-url')).toBe(false);
        expect(ChekinSDKValidator.validateUrl('just-text')).toBe(false);
        expect(ChekinSDKValidator.validateUrl('')).toBe(false);
      });
    });

    describe('validateLanguage', () => {
      it('should return true for supported languages', () => {
        expect(ChekinSDKValidator.validateLanguage('en')).toBe(true);
        expect(ChekinSDKValidator.validateLanguage('es')).toBe(true);
        expect(ChekinSDKValidator.validateLanguage('fr')).toBe(true);
      });

      it('should return false for unsupported languages', () => {
        expect(ChekinSDKValidator.validateLanguage('xx')).toBe(false);
        expect(ChekinSDKValidator.validateLanguage('invalid')).toBe(false);
      });
    });

    describe('validateFeature', () => {
      it('should return true for supported features', () => {
        expect(ChekinSDKValidator.validateFeature('IV')).toBe(true);
      });

      it('should return false for unsupported features', () => {
        expect(ChekinSDKValidator.validateFeature('UNKNOWN')).toBe(false);
        expect(ChekinSDKValidator.validateFeature('invalid')).toBe(false);
      });
    });

    describe('validateCurrency', () => {
      it('should return true for supported currencies', () => {
        expect(ChekinSDKValidator.validateCurrency('USD')).toBe(true);
        expect(ChekinSDKValidator.validateCurrency('EUR')).toBe(true);
        expect(ChekinSDKValidator.validateCurrency('GBP')).toBe(true);
      });

      it('should return false for unsupported currencies', () => {
        expect(ChekinSDKValidator.validateCurrency('XYZ')).toBe(false);
        expect(ChekinSDKValidator.validateCurrency('invalid')).toBe(false);
      });
    });
  });

  describe('validation result structure', () => {
    it('should return proper ValidationResult structure', () => {
      const result = validator.validateConfig({apiKey: 'test-key'});

      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    it('should set isValid to false when there are errors', () => {
      const result = validator.validateConfig({apiKey: 123 as unknown as string});

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should set isValid to true when there are only warnings', () => {
      const result = validator.validateConfig({apiKey: 'short'});

      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.errors.length).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle undefined optional fields gracefully', () => {
      const config: ChekinInboxSDKConfig = {
        apiKey: 'valid-api-key-12345',
        baseUrl: undefined,
        version: undefined,
        defaultLanguage: undefined,
        styles: undefined,
        stylesLink: undefined,
        autoHeight: undefined,
        enableLogging: undefined,
        onHeightChanged: undefined,
        onError: undefined,
        onConnectionError: undefined,
      };
      const result = validator.validateConfig(config);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accumulate multiple errors and warnings', () => {
      const config: ChekinInboxSDKConfig = {
        apiKey: 123 as unknown as string, // error
        baseUrl: 'invalid-url', // error
        version: 'invalid', // warning
        defaultLanguage: 'xx', // warning
      };
      const result = validator.validateConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(2);
      expect(result.warnings.length).toBeGreaterThan(1);
    });
  });
});
