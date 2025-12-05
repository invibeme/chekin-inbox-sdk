import {ChekinHostSDKConfig} from '../types';

const VersionMapper = {
  latest: 'latest',
  development: 'dev',
  dev: 'dev',
};

const getBaseUrl = (version = 'latest') => {
  const normalizedVersion = VersionMapper[version as keyof typeof VersionMapper]
    ? version
    : version.startsWith('v')
      ? version
      : `v${version}`;
  return `https://cdn.chekin.com/inbox-sdk/${normalizedVersion}/index.html`;
};

const URL_LENGTH_LIMITS = {
  IE: 2083,
  SAFE_LIMIT: 2000,
  EXTENDED_LIMIT: 8192,
} as const;

export interface UrlConfigResult {
  url: string;
  postMessageConfig?: Partial<ChekinHostSDKConfig>;
  isLengthLimited: boolean;
}

export function formatChekinUrl(config: ChekinHostSDKConfig): UrlConfigResult {
  const version = config.version || 'latest';
  const baseUrl = config.baseUrl || getBaseUrl(version);

  const url = new URL(baseUrl);

  const essentialParams = {
    apiKey: config.apiKey,
    lang: config.defaultLanguage,
    autoHeight: config.autoHeight,
  };

  // Add essential parameters to URL
  Object.entries(essentialParams).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          url.searchParams.set(key, value.join(','));
        }
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  });

  let postMessageConfig: Partial<ChekinHostSDKConfig> = {};
  let isLengthLimited = false;

  if (config.stylesLink) {
    const encodedStylesLink = encodeURIComponent(config.stylesLink);
    if (encodedStylesLink.length < 500) {
      url.searchParams.set('stylesLink', encodedStylesLink);
    } else {
      postMessageConfig = {
        ...postMessageConfig,
        stylesLink: config.stylesLink,
      };
      isLengthLimited = true;
    }
  }

  if (config.styles) {
    const encodedStyles = encodeURIComponent(config.styles);

    if (encodedStyles.length < 500) {
      url.searchParams.set('styles', encodedStyles);
    } else {
      postMessageConfig = {...postMessageConfig, styles: config.styles};
      isLengthLimited = true;
    }
  }

  const finalUrl = url.toString();

  if (finalUrl.length > URL_LENGTH_LIMITS.SAFE_LIMIT) {
    const minimalUrl = new URL(baseUrl);
    minimalUrl.searchParams.set('apiKey', config.apiKey);

    postMessageConfig = {
      ...postMessageConfig,
      defaultLanguage: config.defaultLanguage,
    };

    return {
      url: minimalUrl.toString(),
      postMessageConfig,
      isLengthLimited: true,
    };
  }

  return {
    url: finalUrl,
    postMessageConfig:
      Object.keys(postMessageConfig).length > 0 ? postMessageConfig : undefined,
    isLengthLimited,
  };
}
