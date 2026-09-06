// HilltopAds Ad-Tag Script for zone_5328 (Apex Sports Network - 728x90)
(function () {
  'use strict';
  var zoneId = 'zone_5328';
  var currentScript = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var host = window.location.origin;
  if (currentScript && currentScript.src) {
    try {
      var u = new URL(currentScript.src);
      host = u.origin;
    } catch (e) {}
  }

  // Find target container on publisher website (#hilltop-zone-zone_5328)
  var container = document.getElementById('hilltop-zone-' + zoneId);
  if (!container) {
    container = document.querySelector('[data-hilltop-zone="' + zoneId + '"]');
  }
  if (!container && currentScript && currentScript.parentNode) {
    container = document.createElement('div');
    container.id = 'hilltop-zone-' + zoneId;
    currentScript.parentNode.insertBefore(container, currentScript);
  }

  if (!container) return;

  var iframe = document.createElement('iframe');
  iframe.src = host + '/api/serve/banner-frame/' + zoneId;
  iframe.width = '728';
  iframe.height = '90';
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('scrolling', 'no');
  iframe.setAttribute('title', 'HilltopAds Sports News Banner');
  iframe.style.border = 'none';
  iframe.style.overflow = 'hidden';
  iframe.style.display = 'block';
  iframe.style.margin = '10px auto';
  iframe.style.maxWidth = '100%';
  iframe.style.borderRadius = '8px';

  container.innerHTML = '';
  container.appendChild(iframe);

  try {
    var trackUrl = host + '/api/serve/track?zoneId=' + zoneId + '&type=impression';
    if (navigator.sendBeacon) {
      navigator.sendBeacon(trackUrl);
    } else {
      new Image().src = trackUrl;
    }
  } catch (e) {}
})();
