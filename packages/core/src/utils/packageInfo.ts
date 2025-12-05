declare const __PACKAGE_NAME__: string;
declare const __PACKAGE_VERSION__: string;

export const PACKAGE_INFO = {
  name: __PACKAGE_NAME__,
  version: __PACKAGE_VERSION__,
} as const;
