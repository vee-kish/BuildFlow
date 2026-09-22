/* BuildFlow Kenya — service worker PLACEHOLDER.
 *
 * Phase 1 ships no offline logic on purpose. This file exists so the URL
 * /sw.js is reserved and future work has a single integration point.
 *
 * Later (PWA phase), implement here:
 *  - precache the app shell (index.html, built assets) on install
 *  - stale-while-revalidate for static assets
 *  - network-first with cache fallback for API responses, so site staff
 *    with poor connectivity can still view cached projects/issues
 *  - background sync queue for site reports created offline
 *
 * Registration lives in src/main.jsx (currently commented out).
 * Do not add fetch/install handlers until the caching strategy is decided.
 */

// Example of what the future implementation will look like:
//
// const CACHE_NAME = "buildflow-shell-v1";
//
// self.addEventListener("install", (event) => {
//   event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(["/"])));
// });
//
// self.addEventListener("fetch", (event) => {
//   // caching strategy goes here
// });
