// ==UserScript==
// @name         Redirect Medium Anywhere to scribe.rip
// @version      0.7
// @author       abd3lraouf
// @license      MIT
// @match        *://*/*
// @run-at       document-start
// @grant        none
// @namespace    https://github.com/abd3lraouf
// @description  Auto-redirect Medium articles (not homepages) to scribe.rip
// @homepageURL  https://github.com/abd3lraouf/medium-to-scribe
// @supportURL   https://github.com/abd3lraouf/medium-to-scribe/issues
// @contributionURL https://greasyfork.org/en/scripts/556938-redirect-medium-anywhere-to-scribe-rip
// @downloadURL  https://github.com/abd3lraouf/medium-to-scribe/raw/refs/heads/main/redirect-medium-to-scribe.user.js
// @updateURL    https://github.com/abd3lraouf/medium-to-scribe/raw/refs/heads/main/redirect-medium-to-scribe.user.js
// ==/UserScript==

(function() {
    'use strict';

    const SCRIBE_HOST = 'scribe.rip';
    const OBSERVER_TIMEOUT_MS = 10000;

    // Already on scribe.rip, nothing to do
    if (location.hostname === SCRIBE_HOST) return;

    // Non-article path patterns to skip
    const NON_ARTICLE_PATTERNS = [
        /^\/tagged\/?/,
        /^\/search/,
        /^\/me\/?/,
        /^\/@[\w-]+\/?$/,  // Author profile pages (not their articles)
        /^\/archive\/?/,
        /^\/latest\/?/,
        /^\/popular\/?/,
        /^\/topics\/?/,
        /^\/membership\/?/,
        /^\/plans\/?/,
        /^\/about\/?/,
        /^\/collections\/?/,
        /^\/tag\/?/,
    ];

    /**
     * Check if current URL path looks like a Medium article
     */
    function isArticlePath() {
        const path = location.pathname;

        // Skip root/homepage
        if (path === '/' || path === '') return false;

        // Skip known non-article paths
        if (NON_ARTICLE_PATTERNS.some(pattern => pattern.test(path))) return false;

        const slug = path.split('/').pop();

        // Medium articles end with 10-12 char hex ID (e.g., -8d0b952e2853)
        const hasArticleId = /[a-f0-9]{10,12}$/i.test(slug);

        // Fallback: long slugs are likely articles
        const hasLongSlug = slug.length > 20;

        return hasArticleId || hasLongSlug;
    }

    /**
     * Check if page is a Medium page using multiple detection methods
     */
    function isMediumPage() {
        // Check meta tags
        const metaGenerator = document.querySelector('meta[name="generator"]');
        if (metaGenerator && metaGenerator.content.toLowerCase().includes('medium')) {
            return true;
        }

        // Check for Medium-specific meta property
        const metaMedium = document.querySelector('meta[property="al:android:package"][content="com.medium.reader"]');
        if (metaMedium) {
            return true;
        }

        // Check for Medium app links
        const metaAppId = document.querySelector('meta[name="apple-itunes-app"]');
        if (metaAppId && metaAppId.content.includes('medium')) {
            return true;
        }

        // Check for data-theme attribute Medium uses
        if (document.body && document.body.hasAttribute('data-theme')) {
            const scripts = document.querySelectorAll('script');
            for (const script of scripts) {
                if (script.src && script.src.includes('medium.com')) {
                    return true;
                }
            }
        }

        // Check HTML content for fingerprints
        const html = document.documentElement.innerHTML;
        const fingerprints = [
            '__GRAPHQL_URI__',
            '"publisher":{"@id":"https://medium.com/"',
            '"@id":"https://medium.com/#publisher"',
            'medium.com/_/fp',
            'cdn-client.medium.com',
            'glyph.medium.com',
            '"MediumPost"',
            'data-action="open-in-app"',
        ];

        return fingerprints.some(fp => html.includes(fp));
    }

    /**
     * Redirect to scribe.rip equivalent URL
     */
    function redirectToScribe() {
        const scribeUrl = `https://${SCRIBE_HOST}${location.pathname}${location.search}${location.hash}`;
        location.replace(scribeUrl);
    }

    // Early exit if path doesn't look like an article
    if (!isArticlePath()) return;

    let redirected = false;

    function checkAndRedirect() {
        if (redirected) return;

        if (isMediumPage()) {
            redirected = true;
            observer.disconnect();
            redirectToScribe();
        }
    }

    const observer = new MutationObserver(checkAndRedirect);

    // Start observing once DOM is available
    if (document.documentElement) {
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
        });
    }

    // Also check when DOM is ready
    document.addEventListener('DOMContentLoaded', checkAndRedirect);

    // And check on load as fallback
    window.addEventListener('load', checkAndRedirect);

    // Stop observing after timeout to avoid resource waste on non-Medium sites
    setTimeout(() => {
        if (!redirected) {
            observer.disconnect();
        }
    }, OBSERVER_TIMEOUT_MS);
})();
