(function(){
  const local = location.hostname === '127.0.0.1' || location.hostname === 'localhost';
  const localApiRequested = local && new URLSearchParams(location.search).get('api') === 'local';
  window.SHINIKATA_API_CONFIG = Object.freeze({
    baseUrl: localApiRequested ? 'http://127.0.0.1:8787' : '',
    enableSubmission: localApiRequested,
    enableReviewSubmission: localApiRequested,
    enablePublicStats: localApiRequested,
    consentVersion: localApiRequested ? 'local-dev-only-2026-08-16' : 'not-enabled',
    requiredConsentScope: 'research_aggregate_use'
  });
})();
