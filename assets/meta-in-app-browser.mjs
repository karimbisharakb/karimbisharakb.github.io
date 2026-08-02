export function isMetaInAppBrowser(userAgent = '') {
  return /Instagram|FBAN|FBAV/i.test(userAgent);
}
