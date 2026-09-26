/* Page views only. Never pass form values, editor contents or URL parameters. */
(() => {
  'use strict';
  const tag = document.currentScript;
  const page = tag && tag.dataset.page;
  if (location.origin !== 'https://ndebeproject.github.io' ||
      !location.pathname.startsWith('/ndebe/') || !page ||
      navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true) return;
  const canonical = location.origin + '/ndebe/' + page;
  const sdk = document.createElement('script');
  sdk.src = 'https://us-assets.i.posthog.com/static/array.js';
  sdk.async = true;
  sdk.referrerPolicy = 'no-referrer';
  sdk.onload = () => {
    if (!window.posthog) return;
    window.posthog.init('phc_uEiAHDkARWuR4ifdKytAsSLrzyg5Po26kHKp7kpDXYth', {
      api_host: 'https://us.i.posthog.com',
      ui_host: 'https://us.posthog.com',
      cookieless_mode: 'always',
      person_profiles: 'never',
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      capture_dead_clicks: false,
      capture_exceptions: false,
      capture_heatmaps: false,
      capture_performance: false,
      disable_session_recording: true,
      enable_recording_console_log: false,
      disable_surveys: true,
      disable_conversations: true,
      disable_product_tours: true,
      disable_external_dependency_loading: true,
      advanced_disable_flags: true,
      ip: false,
      before_send(event) {
        if (event.event !== '$pageview') return null;
        // Retain only the SDK's required transport fields and safe page metadata.
        const properties = {};
        for (const key of ['token', 'distinct_id', '$cookieless_mode', '$lib', '$lib_version', '$raw_user_agent']) {
          if (Object.hasOwn(event.properties, key)) properties[key] = event.properties[key];
        }
        properties.$process_person_profile = false;
        properties.$current_url = canonical;
        properties.$pathname = '/ndebe/' + page;
        properties.$host = location.hostname;
        event.properties = properties;
        return event;
      },
      loaded(client) { client.capture('$pageview'); }
    });
  };
  document.head.appendChild(sdk);
})();
