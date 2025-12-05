import {ChekinInboxSDKConfig} from '../types';

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

const SUPPORTED_LANGUAGES = [
  'en',
  'es',
  'it',
  'de',
  'fr',
  'hu',
  'ru',
  'cs',
  'bg',
  'pt',
  'ro',
  'et',
  'pl',
  'ca',
] as const;

export class ChekinSDKValidator {
  public validateConfig(config: ChekinInboxSDKConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Required field validation
    if (!config.apiKey) {
      errors.push({
        field: 'apiKey',
        message: 'API key is required',
        value: config.apiKey,
      });
    } else if (typeof config.apiKey !== 'string') {
      errors.push({
        field: 'apiKey',
        message: 'API key must be a string',
        value: config.apiKey,
      });
    } else if (config.apiKey.length < 10) {
      warnings.push({
        field: 'apiKey',
        message: 'API key seems too short, please verify it is correct',
        value: config.apiKey.length,
      });
    }

    // BaseUrl validation
    if (config.baseUrl) {
      if (typeof config.baseUrl !== 'string') {
        errors.push({
          field: 'baseUrl',
          message: 'Base URL must be a string',
          value: config.baseUrl,
        });
      } else {
        try {
          new URL(config.baseUrl);
        } catch {
          errors.push({
            field: 'baseUrl',
            message: 'Base URL must be a valid URL',
            value: config.baseUrl,
          });
        }
      }
    }

    // Version validation
    if (config.version) {
      if (typeof config.version !== 'string') {
        errors.push({
          field: 'version',
          message: 'Version must be a string',
          value: config.version,
        });
      } else if (!/^(latest|v?\d+\.\d+\.\d+(-[a-z0-9]+)?)$/i.test(config.version)) {
        warnings.push({
          field: 'version',
          message:
            'Version format should be "latest" or semantic version (e.g., "1.0.0", "v2.1.3")',
          value: config.version,
        });
      }
    }

    // Language validation
    if (config.defaultLanguage) {
      if (typeof config.defaultLanguage !== 'string') {
        errors.push({
          field: 'defaultLanguage',
          message: 'Default language must be a string',
          value: config.defaultLanguage,
        });
      } else if (
        !SUPPORTED_LANGUAGES.includes(
          config.defaultLanguage as (typeof SUPPORTED_LANGUAGES)[number],
        )
      ) {
        warnings.push({
          field: 'defaultLanguage',
          message: `Unsupported language "${
            config.defaultLanguage
          }". Supported languages: ${SUPPORTED_LANGUAGES.join(', ')}`,
          value: config.defaultLanguage,
        });
      }
    }

    if (config.styles) {
      if (typeof config.styles !== 'string') {
        errors.push({
          field: 'styles',
          message: 'Styles must be a string',
          value: config.styles,
        });
      }
    }

    if (config.stylesLink) {
      if (typeof config.stylesLink !== 'string') {
        errors.push({
          field: 'stylesLink',
          message: 'Styles link must be a string',
          value: config.stylesLink,
        });
      } else {
        try {
          new URL(config.stylesLink);
        } catch {
          errors.push({
            field: 'stylesLink',
            message: 'Styles link must be a valid URL',
            value: config.stylesLink,
          });
        }
      }
    }

    this.validateBoolean(config.autoHeight, 'autoHeight', errors);
    this.validateBoolean(config.enableLogging, 'enableLogging', errors);

    // Callback validation
    this.validateCallback(config.onHeightChanged, 'onHeightChanged', errors);
    this.validateCallback(config.onError, 'onError', errors);
    this.validateCallback(config.onConnectionError, 'onConnectionError', errors);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private validateBoolean(
    value: unknown,
    fieldName: string,
    errors: ValidationError[],
  ): void {
    if (value !== undefined && typeof value !== 'boolean') {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be a boolean`,
        value,
      });
    }
  }

  private validateCallback(
    callback: unknown,
    fieldName: string,
    errors: ValidationError[],
  ): void {
    if (callback !== undefined && typeof callback !== 'function') {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be a function`,
        value: typeof callback,
      });
    }
  }

  // Quick validation methods for specific use cases
  public static validateApiKey(apiKey: unknown): boolean {
    return typeof apiKey === 'string' && apiKey.length >= 10;
  }

  public static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  public static validateLanguage(lang: string): boolean {
    return SUPPORTED_LANGUAGES.includes(lang as (typeof SUPPORTED_LANGUAGES)[number]);
  }
}
