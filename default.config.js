{
  "settings": {
    "output": [
      "html"
    ],
    "maxWaitForFcp": 15000,
    "maxWaitForLoad": 45000,
    "throttlingMethod": "simulate",
    "throttling": {
      "rttMs": 150,
      "throughputKbps": 1638.4,
      "requestLatencyMs": 562.5,
      "downloadThroughputKbps": 1474.5600000000002,
      "uploadThroughputKbps": 675,
      "cpuSlowdownMultiplier": 4
    },
    "auditMode": false,
    "gatherMode": false,
    "disableStorageReset": false,
    "emulatedFormFactor": "mobile",
    "channel": "cli",
    "budgets": null,
    "locale": "en-US",
    "blockedUrlPatterns": null,
    "additionalTraceCategories": null,
    "extraHeaders": null,
    "precomputedLanternData": null,
    "onlyAudits": null,
    "onlyCategories": null,
    "skipAudits": null
  },
  "passes": [
    {
      "passName": "defaultPass",
      "recordTrace": true,
      "useThrottling": true,
      "pauseAfterLoadMs": 1000,
      "networkQuietThresholdMs": 1000,
      "cpuQuietThresholdMs": 1000,
      "blockedUrlPatterns": [],
      "blankPage": "about:blank",
      "gatherers": [
        {
          "path": "css-usage"
        },
        {
          "path": "viewport-dimensions"
        },
        {
          "path": "runtime-exceptions"
        },
        {
          "path": "console-messages"
        },
        {
          "path": "anchor-elements"
        },
        {
          "path": "image-elements"
        },
        {
          "path": "link-elements"
        },
        {
          "path": "meta-elements"
        },
        {
          "path": "script-elements"
        },
        {
          "path": "dobetterweb/appcache"
        },
        {
          "path": "dobetterweb/doctype"
        },
        {
          "path": "dobetterweb/domstats"
        },
        {
          "path": "dobetterweb/optimized-images"
        },
        {
          "path": "dobetterweb/password-inputs-with-prevented-paste"
        },
        {
          "path": "dobetterweb/response-compression"
        },
        {
          "path": "dobetterweb/tags-blocking-first-paint"
        },
        {
          "path": "seo/font-size"
        },
        {
          "path": "seo/embedded-content"
        },
        {
          "path": "seo/robots-txt"
        },
        {
          "path": "seo/tap-targets"
        },
        {
          "path": "accessibility"
        }
      ]
    },
    {
      "passName": "offlinePass",
      "recordTrace": false,
      "useThrottling": false,
      "pauseAfterLoadMs": 0,
      "networkQuietThresholdMs": 0,
      "cpuQuietThresholdMs": 0,
      "blockedUrlPatterns": [],
      "blankPage": "about:blank",
      "gatherers": [
        {
          "path": "service-worker"
        },
        {
          "path": "offline"
        },
        {
          "path": "start-url"
        }
      ]
    },
    {
      "passName": "redirectPass",
      "recordTrace": false,
      "useThrottling": false,
      "pauseAfterLoadMs": 0,
      "networkQuietThresholdMs": 0,
      "cpuQuietThresholdMs": 0,
      "blockedUrlPatterns": [
        "*.css",
        "*.jpg",
        "*.jpeg",
        "*.png",
        "*.gif",
        "*.svg",
        "*.ttf",
        "*.woff",
        "*.woff2"
      ],
      "blankPage": "about:blank",
      "gatherers": [
        {
          "path": "http-redirect"
        },
        {
          "path": "html-without-javascript"
        }
      ]
    }
  ],
  "audits": [
    {
      "path": "is-on-https"
    },
    {
      "path": "redirects-http"
    },
    {
      "path": "service-worker"
    },
    {
      "path": "works-offline"
    },
    {
      "path": "viewport"
    },
    {
      "path": "without-javascript"
    },
    {
      "path": "metrics/first-contentful-paint"
    },
    {
      "path": "metrics/first-meaningful-paint"
    },
    {
      "path": "load-fast-enough-for-pwa"
    },
    {
      "path": "metrics/speed-index"
    },
    {
      "path": "screenshot-thumbnails"
    },
    {
      "path": "final-screenshot"
    },
    {
      "path": "metrics/estimated-input-latency"
    },
    {
      "path": "metrics/total-blocking-time"
    },
    {
      "path": "metrics/max-potential-fid"
    },
    {
      "path": "errors-in-console"
    },
    {
      "path": "time-to-first-byte"
    },
    {
      "path": "metrics/first-cpu-idle"
    },
    {
      "path": "metrics/interactive"
    },
    {
      "path": "user-timings"
    },
    {
      "path": "critical-request-chains"
    },
    {
      "path": "redirects"
    },
    {
      "path": "installable-manifest"
    },
    {
      "path": "apple-touch-icon"
    },
    {
      "path": "splash-screen"
    },
    {
      "path": "themed-omnibox"
    },
    {
      "path": "content-width"
    },
    {
      "path": "image-aspect-ratio"
    },
    {
      "path": "deprecations"
    },
    {
      "path": "mainthread-work-breakdown"
    },
    {
      "path": "bootup-time"
    },
    {
      "path": "uses-rel-preload"
    },
    {
      "path": "uses-rel-preconnect"
    },
    {
      "path": "font-display"
    },
    {
      "path": "diagnostics"
    },
    {
      "path": "network-requests"
    },
    {
      "path": "network-rtt"
    },
    {
      "path": "network-server-latency"
    },
    {
      "path": "main-thread-tasks"
    },
    {
      "path": "metrics"
    },
    {
      "path": "offline-start-url"
    },
    {
      "path": "performance-budget"
    },
    {
      "path": "resource-summary"
    },
    {
      "path": "third-party-summary"
    },
    {
      "path": "manual/pwa-cross-browser"
    },
    {
      "path": "manual/pwa-page-transitions"
    },
    {
      "path": "manual/pwa-each-page-has-url"
    },
    {
      "path": "accessibility/accesskeys"
    },
    {
      "path": "accessibility/aria-allowed-attr"
    },
    {
      "path": "accessibility/aria-required-attr"
    },
    {
      "path": "accessibility/aria-required-children"
    },
    {
      "path": "accessibility/aria-required-parent"
    },
    {
      "path": "accessibility/aria-roles"
    },
    {
      "path": "accessibility/aria-valid-attr-value"
    },
    {
      "path": "accessibility/aria-valid-attr"
    },
    {
      "path": "accessibility/audio-caption"
    },
    {
      "path": "accessibility/button-name"
    },
    {
      "path": "accessibility/bypass"
    },
    {
      "path": "accessibility/color-contrast"
    },
    {
      "path": "accessibility/definition-list"
    },
    {
      "path": "accessibility/dlitem"
    },
    {
      "path": "accessibility/document-title"
    },
    {
      "path": "accessibility/duplicate-id"
    },
    {
      "path": "accessibility/frame-title"
    },
    {
      "path": "accessibility/html-has-lang"
    },
    {
      "path": "accessibility/html-lang-valid"
    },
    {
      "path": "accessibility/image-alt"
    },
    {
      "path": "accessibility/input-image-alt"
    },
    {
      "path": "accessibility/label"
    },
    {
      "path": "accessibility/layout-table"
    },
    {
      "path": "accessibility/link-name"
    },
    {
      "path": "accessibility/list"
    },
    {
      "path": "accessibility/listitem"
    },
    {
      "path": "accessibility/meta-refresh"
    },
    {
      "path": "accessibility/meta-viewport"
    },
    {
      "path": "accessibility/object-alt"
    },
    {
      "path": "accessibility/tabindex"
    },
    {
      "path": "accessibility/td-headers-attr"
    },
    {
      "path": "accessibility/th-has-data-cells"
    },
    {
      "path": "accessibility/valid-lang"
    },
    {
      "path": "accessibility/video-caption"
    },
    {
      "path": "accessibility/video-description"
    },
    {
      "path": "accessibility/manual/custom-controls-labels"
    },
    {
      "path": "accessibility/manual/custom-controls-roles"
    },
    {
      "path": "accessibility/manual/focus-traps"
    },
    {
      "path": "accessibility/manual/focusable-controls"
    },
    {
      "path": "accessibility/manual/heading-levels"
    },
    {
      "path": "accessibility/manual/interactive-element-affordance"
    },
    {
      "path": "accessibility/manual/logical-tab-order"
    },
    {
      "path": "accessibility/manual/managed-focus"
    },
    {
      "path": "accessibility/manual/offscreen-content-hidden"
    },
    {
      "path": "accessibility/manual/use-landmarks"
    },
    {
      "path": "accessibility/manual/visual-order-follows-dom"
    },
    {
      "path": "byte-efficiency/uses-long-cache-ttl"
    },
    {
      "path": "byte-efficiency/total-byte-weight"
    },
    {
      "path": "byte-efficiency/offscreen-images"
    },
    {
      "path": "byte-efficiency/render-blocking-resources"
    },
    {
      "path": "byte-efficiency/unminified-css"
    },
    {
      "path": "byte-efficiency/unminified-javascript"
    },
    {
      "path": "byte-efficiency/unused-css-rules"
    },
    {
      "path": "byte-efficiency/uses-webp-images"
    },
    {
      "path": "byte-efficiency/uses-optimized-images"
    },
    {
      "path": "byte-efficiency/uses-text-compression"
    },
    {
      "path": "byte-efficiency/uses-responsive-images"
    },
    {
      "path": "byte-efficiency/efficient-animated-content"
    },
    {
      "path": "dobetterweb/appcache-manifest"
    },
    {
      "path": "dobetterweb/doctype"
    },
    {
      "path": "dobetterweb/dom-size"
    },
    {
      "path": "dobetterweb/external-anchors-use-rel-noopener"
    },
    {
      "path": "dobetterweb/geolocation-on-start"
    },
    {
      "path": "dobetterweb/no-document-write"
    },
    {
      "path": "dobetterweb/no-vulnerable-libraries"
    },
    {
      "path": "dobetterweb/js-libraries"
    },
    {
      "path": "dobetterweb/notification-on-start"
    },
    {
      "path": "dobetterweb/password-inputs-can-be-pasted-into"
    },
    {
      "path": "dobetterweb/uses-http2"
    },
    {
      "path": "dobetterweb/uses-passive-event-listeners"
    },
    {
      "path": "seo/meta-description"
    },
    {
      "path": "seo/http-status-code"
    },
    {
      "path": "seo/font-size"
    },
    {
      "path": "seo/link-text"
    },
    {
      "path": "seo/is-crawlable"
    },
    {
      "path": "seo/robots-txt"
    },
    {
      "path": "seo/tap-targets"
    },
    {
      "path": "seo/hreflang"
    },
    {
      "path": "seo/plugins"
    },
    {
      "path": "seo/canonical"
    },
    {
      "path": "seo/manual/structured-data"
    }
  ],
  "categories": {
    "performance": {
      "title": "Performance",
      "auditRefs": [
        {
          "id": "first-contentful-paint",
          "weight": 3,
          "group": "metrics"
        },
        {
          "id": "first-meaningful-paint",
          "weight": 1,
          "group": "metrics"
        },
        {
          "id": "speed-index",
          "weight": 4,
          "group": "metrics"
        },
        {
          "id": "interactive",
          "weight": 5,
          "group": "metrics"
        },
        {
          "id": "first-cpu-idle",
          "weight": 2,
          "group": "metrics"
        },
        {
          "id": "max-potential-fid",
          "weight": 0,
          "group": "metrics"
        },
        {
          "id": "estimated-input-latency",
          "weight": 0
        },
        {
          "id": "total-blocking-time",
          "weight": 0
        },
        {
          "id": "render-blocking-resources",
          "weight": 0,
          "group": "load-opportunities"
        },
        {
          "id": "uses-responsive-images",
          "weight": 0,
          "group": "load-opportunities"
        },
        {
          "id": "offscreen-images",
          "weight": 0,
          "group": "load-opportunities"
        },
        {
          "id": "unminified-css",
          "weight": 0,
          "group": "load-opportunities"
        },
        {
          "id": "unminified-javascript",
          "weight": 0,
          "group": "load-opportunities"
        },
        {
          "id": "unused-css-rules",
          "weight": 0,
          "group": "load-opportunities"
        },
        {
          "id": "uses-optimized-images",
          "weight": 0,
          "group": "load-opportunities"
        },
        {
          "id": "uses-webp-images",
          "weight": 0,
          "group": "load-opportunities"
        },
        {
          "id": "uses-text-compression",
          "weight": 0,
          "group": "load-opportunities"
        },
        {
          "id": "uses-rel-preconnect",
          "weight": 0,
          "group": "load-opportunities"
        },
        {
          "id": "time-to-first-byte",
          "weight": 0,
          "group": "load-opportunities"
        },
        {
          "id": "redirects",
          "weight": 0,
          "group": "load-opportunities"
        },
        {
          "id": "uses-rel-preload",
          "weight": 0,
          "group": "load-opportunities"
        },
        {
          "id": "efficient-animated-content",
          "weight": 0,
          "group": "load-opportunities"
        },
        {
          "id": "total-byte-weight",
          "weight": 0,
          "group": "diagnostics"
        },
        {
          "id": "uses-long-cache-ttl",
          "weight": 0,
          "group": "diagnostics"
        },
        {
          "id": "dom-size",
          "weight": 0,
          "group": "diagnostics"
        },
        {
          "id": "critical-request-chains",
          "weight": 0,
          "group": "diagnostics"
        },
        {
          "id": "user-timings",
          "weight": 0,
          "group": "diagnostics"
        },
        {
          "id": "bootup-time",
          "weight": 0,
          "group": "diagnostics"
        },
        {
          "id": "mainthread-work-breakdown",
          "weight": 0,
          "group": "diagnostics"
        },
        {
          "id": "font-display",
          "weight": 0,
          "group": "diagnostics"
        },
        {
          "id": "performance-budget",
          "weight": 0,
          "group": "budgets"
        },
        {
          "id": "resource-summary",
          "weight": 0,
          "group": "diagnostics"
        },
        {
          "id": "third-party-summary",
          "weight": 0,
          "group": "diagnostics"
        },
        {
          "id": "network-requests",
          "weight": 0
        },
        {
          "id": "network-rtt",
          "weight": 0
        },
        {
          "id": "network-server-latency",
          "weight": 0
        },
        {
          "id": "main-thread-tasks",
          "weight": 0
        },
        {
          "id": "diagnostics",
          "weight": 0
        },
        {
          "id": "metrics",
          "weight": 0
        },
        {
          "id": "screenshot-thumbnails",
          "weight": 0
        },
        {
          "id": "final-screenshot",
          "weight": 0
        }
      ]
    },
    "accessibility": {
      "title": "Accessibility",
      "description": "These checks highlight opportunities to [improve the accessibility of your web app](https://developers.google.com/web/fundamentals/accessibility). Only a subset of accessibility issues can be automatically detected so manual testing is also encouraged.",
      "manualDescription": "These items address areas which an automated testing tool cannot cover. Learn more in our guide on [conducting an accessibility review](https://developers.google.com/web/fundamentals/accessibility/how-to-review).",
      "auditRefs": [
        {
          "id": "accesskeys",
          "weight": 3,
          "group": "a11y-navigation"
        },
        {
          "id": "aria-allowed-attr",
          "weight": 10,
          "group": "a11y-aria"
        },
        {
          "id": "aria-required-attr",
          "weight": 10,
          "group": "a11y-aria"
        },
        {
          "id": "aria-required-children",
          "weight": 10,
          "group": "a11y-aria"
        },
        {
          "id": "aria-required-parent",
          "weight": 10,
          "group": "a11y-aria"
        },
        {
          "id": "aria-roles",
          "weight": 10,
          "group": "a11y-aria"
        },
        {
          "id": "aria-valid-attr-value",
          "weight": 10,
          "group": "a11y-aria"
        },
        {
          "id": "aria-valid-attr",
          "weight": 10,
          "group": "a11y-aria"
        },
        {
          "id": "audio-caption",
          "weight": 10,
          "group": "a11y-audio-video"
        },
        {
          "id": "button-name",
          "weight": 10,
          "group": "a11y-names-labels"
        },
        {
          "id": "bypass",
          "weight": 3,
          "group": "a11y-navigation"
        },
        {
          "id": "color-contrast",
          "weight": 3,
          "group": "a11y-color-contrast"
        },
        {
          "id": "definition-list",
          "weight": 3,
          "group": "a11y-tables-lists"
        },
        {
          "id": "dlitem",
          "weight": 3,
          "group": "a11y-tables-lists"
        },
        {
          "id": "document-title",
          "weight": 3,
          "group": "a11y-names-labels"
        },
        {
          "id": "duplicate-id",
          "weight": 1,
          "group": "a11y-best-practices"
        },
        {
          "id": "frame-title",
          "weight": 3,
          "group": "a11y-names-labels"
        },
        {
          "id": "html-has-lang",
          "weight": 3,
          "group": "a11y-language"
        },
        {
          "id": "html-lang-valid",
          "weight": 3,
          "group": "a11y-language"
        },
        {
          "id": "image-alt",
          "weight": 10,
          "group": "a11y-names-labels"
        },
        {
          "id": "input-image-alt",
          "weight": 10,
          "group": "a11y-names-labels"
        },
        {
          "id": "label",
          "weight": 10,
          "group": "a11y-names-labels"
        },
        {
          "id": "layout-table",
          "weight": 3,
          "group": "a11y-tables-lists"
        },
        {
          "id": "link-name",
          "weight": 3,
          "group": "a11y-names-labels"
        },
        {
          "id": "list",
          "weight": 3,
          "group": "a11y-tables-lists"
        },
        {
          "id": "listitem",
          "weight": 3,
          "group": "a11y-tables-lists"
        },
        {
          "id": "meta-refresh",
          "weight": 10,
          "group": "a11y-best-practices"
        },
        {
          "id": "meta-viewport",
          "weight": 10,
          "group": "a11y-best-practices"
        },
        {
          "id": "object-alt",
          "weight": 3,
          "group": "a11y-names-labels"
        },
        {
          "id": "tabindex",
          "weight": 3,
          "group": "a11y-navigation"
        },
        {
          "id": "td-headers-attr",
          "weight": 3,
          "group": "a11y-tables-lists"
        },
        {
          "id": "th-has-data-cells",
          "weight": 3,
          "group": "a11y-tables-lists"
        },
        {
          "id": "valid-lang",
          "weight": 3,
          "group": "a11y-language"
        },
        {
          "id": "video-caption",
          "weight": 10,
          "group": "a11y-audio-video"
        },
        {
          "id": "video-description",
          "weight": 10,
          "group": "a11y-audio-video"
        },
        {
          "id": "logical-tab-order",
          "weight": 0
        },
        {
          "id": "focusable-controls",
          "weight": 0
        },
        {
          "id": "interactive-element-affordance",
          "weight": 0
        },
        {
          "id": "managed-focus",
          "weight": 0
        },
        {
          "id": "focus-traps",
          "weight": 0
        },
        {
          "id": "custom-controls-labels",
          "weight": 0
        },
        {
          "id": "custom-controls-roles",
          "weight": 0
        },
        {
          "id": "visual-order-follows-dom",
          "weight": 0
        },
        {
          "id": "offscreen-content-hidden",
          "weight": 0
        },
        {
          "id": "heading-levels",
          "weight": 0
        },
        {
          "id": "use-landmarks",
          "weight": 0
        }
      ]
    },
    "best-practices": {
      "title": "Best Practices",
      "auditRefs": [
        {
          "id": "appcache-manifest",
          "weight": 1
        },
        {
          "id": "is-on-https",
          "weight": 1
        },
        {
          "id": "uses-http2",
          "weight": 1
        },
        {
          "id": "uses-passive-event-listeners",
          "weight": 1
        },
        {
          "id": "no-document-write",
          "weight": 1
        },
        {
          "id": "external-anchors-use-rel-noopener",
          "weight": 1
        },
        {
          "id": "geolocation-on-start",
          "weight": 1
        },
        {
          "id": "doctype",
          "weight": 1
        },
        {
          "id": "no-vulnerable-libraries",
          "weight": 1
        },
        {
          "id": "js-libraries",
          "weight": 0
        },
        {
          "id": "notification-on-start",
          "weight": 1
        },
        {
          "id": "deprecations",
          "weight": 1
        },
        {
          "id": "password-inputs-can-be-pasted-into",
          "weight": 1
        },
        {
          "id": "errors-in-console",
          "weight": 1
        },
        {
          "id": "image-aspect-ratio",
          "weight": 1
        }
      ]
    },
    "seo": {
      "title": "SEO",
      "description": "These checks ensure that your page is optimized for search engine results ranking. There are additional factors Lighthouse does not check that may affect your search ranking. [Learn more](https://support.google.com/webmasters/answer/35769).",
      "manualDescription": "Run these additional validators on your site to check additional SEO best practices.",
      "auditRefs": [
        {
          "id": "viewport",
          "weight": 1,
          "group": "seo-mobile"
        },
        {
          "id": "document-title",
          "weight": 1,
          "group": "seo-content"
        },
        {
          "id": "meta-description",
          "weight": 1,
          "group": "seo-content"
        },
        {
          "id": "http-status-code",
          "weight": 1,
          "group": "seo-crawl"
        },
        {
          "id": "link-text",
          "weight": 1,
          "group": "seo-content"
        },
        {
          "id": "is-crawlable",
          "weight": 1,
          "group": "seo-crawl"
        },
        {
          "id": "robots-txt",
          "weight": 1,
          "group": "seo-crawl"
        },
        {
          "id": "image-alt",
          "weight": 1,
          "group": "seo-content"
        },
        {
          "id": "hreflang",
          "weight": 1,
          "group": "seo-content"
        },
        {
          "id": "canonical",
          "weight": 1,
          "group": "seo-content"
        },
        {
          "id": "font-size",
          "weight": 1,
          "group": "seo-mobile"
        },
        {
          "id": "plugins",
          "weight": 1,
          "group": "seo-content"
        },
        {
          "id": "tap-targets",
          "weight": 1,
          "group": "seo-mobile"
        },
        {
          "id": "structured-data",
          "weight": 0
        }
      ]
    },
    "pwa": {
      "title": "Progressive Web App",
      "description": "These checks validate the aspects of a Progressive Web App. [Learn more](https://developers.google.com/web/progressive-web-apps/checklist).",
      "manualDescription": "These checks are required by the baseline [PWA Checklist](https://developers.google.com/web/progressive-web-apps/checklist) but are not automatically checked by Lighthouse. They do not affect your score but it's important that you verify them manually.",
      "auditRefs": [
        {
          "id": "load-fast-enough-for-pwa",
          "weight": 7,
          "group": "pwa-fast-reliable"
        },
        {
          "id": "works-offline",
          "weight": 5,
          "group": "pwa-fast-reliable"
        },
        {
          "id": "offline-start-url",
          "weight": 1,
          "group": "pwa-fast-reliable"
        },
        {
          "id": "is-on-https",
          "weight": 2,
          "group": "pwa-installable"
        },
        {
          "id": "service-worker",
          "weight": 1,
          "group": "pwa-installable"
        },
        {
          "id": "installable-manifest",
          "weight": 2,
          "group": "pwa-installable"
        },
        {
          "id": "redirects-http",
          "weight": 2,
          "group": "pwa-optimized"
        },
        {
          "id": "splash-screen",
          "weight": 1,
          "group": "pwa-optimized"
        },
        {
          "id": "themed-omnibox",
          "weight": 1,
          "group": "pwa-optimized"
        },
        {
          "id": "content-width",
          "weight": 1,
          "group": "pwa-optimized"
        },
        {
          "id": "viewport",
          "weight": 2,
          "group": "pwa-optimized"
        },
        {
          "id": "without-javascript",
          "weight": 1,
          "group": "pwa-optimized"
        },
        {
          "id": "apple-touch-icon",
          "weight": 1,
          "group": "pwa-optimized"
        },
        {
          "id": "pwa-cross-browser",
          "weight": 0
        },
        {
          "id": "pwa-page-transitions",
          "weight": 0
        },
        {
          "id": "pwa-each-page-has-url",
          "weight": 0
        }
      ]
    }
  },
  "groups": {
    "metrics": {
      "title": "Metrics"
    },
    "load-opportunities": {
      "title": "Opportunities",
      "description": "These suggestions can help your page load faster. They don't [directly affect](https://github.com/GoogleChrome/lighthouse/blob/d2ec9ffbb21de9ad1a0f86ed24575eda32c796f0/docs/scoring.md#how-are-the-scores-weighted) the Performance score."
    },
    "budgets": {
      "title": "Budgets",
      "description": "Performance budgets set standards for the performance of your site."
    },
    "diagnostics": {
      "title": "Diagnostics",
      "description": "More information about the performance of your application. These numbers don't [directly affect](https://github.com/GoogleChrome/lighthouse/blob/d2ec9ffbb21de9ad1a0f86ed24575eda32c796f0/docs/scoring.md#how-are-the-scores-weighted) the Performance score."
    },
    "pwa-fast-reliable": {
      "title": "Fast and reliable"
    },
    "pwa-installable": {
      "title": "Installable"
    },
    "pwa-optimized": {
      "title": "PWA Optimized"
    },
    "a11y-best-practices": {
      "title": "Best practices",
      "description": "These items highlight common accessibility best practices."
    },
    "a11y-color-contrast": {
      "title": "Contrast",
      "description": "These are opportunities to improve the legibility of your content."
    },
    "a11y-names-labels": {
      "title": "Names and labels",
      "description": "These are opportunities to improve the semantics of the controls in your application. This may enhance the experience for users of assistive technology, like a screen reader."
    },
    "a11y-navigation": {
      "title": "Navigation",
      "description": "These are opportunities to improve keyboard navigation in your application."
    },
    "a11y-aria": {
      "title": "ARIA",
      "description": "These are opportunities to improve the usage of ARIA in your application which may enhance the experience for users of assistive technology, like a screen reader."
    },
    "a11y-language": {
      "title": "Internationalization and localization",
      "description": "These are opportunities to improve the interpretation of your content by users in different locales."
    },
    "a11y-audio-video": {
      "title": "Audio and video",
      "description": "These are opportunities to provide alternative content for audio and video. This may improve the experience for users with hearing or vision impairments."
    },
    "a11y-tables-lists": {
      "title": "Tables and lists",
      "description": "These are opportunities to to improve the experience of reading tabular or list data using assistive technology, like a screen reader."
    },
    "seo-mobile": {
      "title": "Mobile Friendly",
      "description": "Make sure your pages are mobile friendly so users don’t have to pinch or zoom in order to read the content pages. [Learn more](https://developers.google.com/search/mobile-sites/)."
    },
    "seo-content": {
      "title": "Content Best Practices",
      "description": "Format your HTML in a way that enables crawlers to better understand your app’s content."
    },
    "seo-crawl": {
      "title": "Crawling and Indexing",
      "description": "To appear in search results, crawlers need access to your app."
    }
  }
}