export function isInstagramBrowser(userAgent) {
  if (!userAgent) return false;

  return /Instagram/i.test(userAgent);
}

export function isInAppBrowser(userAgent) {
  if (!userAgent) return false;

  // Common in-app browser signatures across social/messaging apps.
  return /(Instagram|FBAN|FBAV|FB_IAB|Line\/|Twitter|wv\))/i.test(userAgent);
}

export function detectEnvironment() {
  if (typeof window === "undefined") {
    return {
      isInstagram: false,
      isTestMode: false,
      isSuccess: false,
      isError: false,
      queryParams: {},
    };
  }

  const params = new URLSearchParams(window.location.search);
  const testMode = params.get("test");
  const status = params.get("status");
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isInstagram = testMode === "instagram" || isInstagramBrowser(ua);
  const isInApp = isInAppBrowser(ua);

  return {
    isInstagram,
    isInAppBrowser: isInApp,
    isAndroid,
    isIOS,
    isTestMode: testMode !== null,
    isSuccess: params.get("success") === "true" || status === "success",
    isError: params.has("error") || status === "error",
    queryParams: Object.fromEntries(params.entries()),
  };
}
