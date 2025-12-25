# Medium to Scribe Redirect

A Tampermonkey/Greasemonkey userscript that automatically redirects Medium articles to [scribe.rip](https://scribe.rip) for a cleaner reading experience.

## Features

- Detects Medium articles on **any domain** (including custom domains like `proandroiddev.com`)
- Only redirects actual articles, not homepages or navigation pages
- Works with Medium's fingerprint detection (not just URL patterns)
- Lightweight and runs at document-start for fast redirects

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) (Chrome/Edge/Firefox/Safari)
2. Click the link below to install the script:

   **[Install Script](https://raw.githubusercontent.com/abd3lraouf/medium-to-scribe/main/redirect-medium-to-scribe.user.js)**

3. Click "Install" in the Tampermonkey dialog

## What it does

| URL | Action |
|-----|--------|
| `proandroiddev.com/some-article-8d0b952e2853` | ✅ Redirects to scribe.rip |
| `medium.com/@author/article-title-abc123` | ✅ Redirects to scribe.rip |
| `proandroiddev.com/` | ❌ Ignored (homepage) |
| `medium.com/tagged/android` | ❌ Ignored (tag page) |
| `medium.com/@author` | ❌ Ignored (profile page) |

## How it works

1. Checks if the URL path looks like an article (has a slug with hex ID or long title)
2. Monitors the page for Medium's fingerprint (`__GRAPHQL_URI__` or publisher metadata)
3. Redirects to the equivalent scribe.rip URL

## License

MIT
