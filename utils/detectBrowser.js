export function isInstagramBrowser(userAgent) {
  if (!userAgent) return false;

  return userAgent.includes("Instagram");
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
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  return {
    isInstagram: testMode === "instagram" || isInstagramBrowser(ua),
    isAndroid,
    isIOS,
    isTestMode: testMode !== null,
    isSuccess: params.get("success") === "true",
    isError: params.get("error") === "true",
    queryParams: Object.fromEntries(params.entries()),
  };
}
