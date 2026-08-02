# Meta In-App Browser App Store Fallback

## Goal

Help visitors who open the SetPR landing page inside Instagram or Facebook's in-app browser reach the App Store when the embedded browser suppresses the normal OS handoff.

## Scope

- Keep both existing `apps.apple.com` App Store anchors unchanged, so every tap still attempts the direct handoff.
- Detect Meta in-app browsers from `navigator.userAgent` with a case-insensitive match for `Instagram`, `FBAN`, or `FBAV`.
- Do not show any fallback UI in Safari, Chrome, or other regular browsers.
- When detected, show one shared, Instagram-oriented instruction: “For the best experience, tap ··· in the top right, then ‘Open in Browser’.”
- Include a compact three-dot visual cue pointing toward the top-right menu.
- Let visitors dismiss the notice. Store that dismissal in `sessionStorage` so it remains closed for the current in-app-browser session.

## UI and accessibility

- The notice is fixed below the existing navigation and above page content, with a high stacking order.
- Its dark surface, subtle border, and red accent use the landing page's existing design tokens.
- It stays compact, wraps cleanly on narrow screens, and does not reserve or obscure the page layout.
- The dismiss button has an accessible name and a keyboard focus state.
- The notification uses `role="status"` and a concise label to announce its purpose without interrupting navigation.

## Data flow

1. Page script reads the browser user agent when it initializes.
2. If no Meta marker is present, it does nothing.
3. If a marker is present and no session dismissal was stored, it makes the banner visible.
4. Closing the banner hides it and records the session dismissal.

## Regression coverage

Add a small Node-based test that evaluates the detector against representative user agents:

- Instagram iOS WebView containing `Instagram`.
- Facebook iOS WebView containing `FBAN/FBIOS;FBAV/...`.
- Facebook Android WebView containing `FBAN/FB4A;FBAV/...`.
- Mobile Safari and Chrome on iOS, both expected not to match.

The test must fail before the detector is implemented, then pass once the production logic is added.
