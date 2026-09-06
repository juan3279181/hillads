(function () {
  'use strict';

  // Determine current script and zone ID
  var currentScript = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var zoneId = (currentScript && currentScript.getAttribute('data-zone')) || '';
  if (!zoneId && currentScript && currentScript.src) {
    var match = currentScript.src.match(/ad-tag\/(zone_[a-zA-Z0-9_-]+)\.js/);
    if (match) zoneId = match[1];
  }
  if (!zoneId) zoneId = 'zone_5328';

  // Base host
  var host = window.location.origin;
  if (currentScript && currentScript.src) {
    try {
      var u = new URL(currentScript.src);
      host = u.origin;
    } catch (e) {}
  }

  // Find target container on publisher website (e.g. #hilltop-zone-zone_5328)
  var container = document.getElementById('hilltop-zone-' + zoneId);
  if (!container) {
    container = document.querySelector('[data-hilltop-zone="' + zoneId + '"]');
  }
  if (!container && currentScript && currentScript.parentNode) {
    container = document.createElement('div');
    container.id = 'hilltop-zone-' + zoneId;
    container.className = 'hilltop-injected-zone';
    currentScript.parentNode.insertBefore(container, currentScript);
  }

  if (!container) return;

  // Build responsive iFrame
  var iframe = document.createElement('iframe');
  iframe.src = host + '/api/serve/banner-frame/' + zoneId;
  iframe.width = '728';
  iframe.height = '90';
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('scrolling', 'no');
  iframe.setAttribute('allowtransparency', 'true');
  iframe.setAttribute('title', 'HilltopAds Sponsored Network');
  iframe.style.border = 'none';
  iframe.style.overflow = 'hidden';
  iframe.style.display = 'block';
  iframe.style.margin = '10px auto';
  iframe.style.maxWidth = '100%';
  iframe.style.borderRadius = '8px';

  // Anti-AdBlock fallback in case iframe fails or is blocked
  iframe.onerror = function () {
    renderInlineBanner(container, zoneId, host);
  };

  container.innerHTML = '';
  container.appendChild(iframe);

  // Send impression beacon
  try {
    var trackUrl = host + '/api/serve/track?zoneId=' + encodeURIComponent(zoneId) + '&type=impression';
    if (navigator.sendBeacon) {
      navigator.sendBeacon(trackUrl);
    } else {
      new Image().src = trackUrl;
    }
  } catch (e) {}

  // Fallback inline banner renderer
  function renderInlineBanner(parent, zId, origin) {
    var box = document.createElement('div');
    box.style.cssText = 'background:linear-gradient(135deg,#1e293b,#0f172a);border:1.5px solid #f59e0b;border-radius:8px;padding:12px 18px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;max-width:728px;margin:10px auto;font-family:sans-serif;color:#fff;';
    box.innerHTML = '<div style="flex:1;"><span style="background:#f59e0b;color:#0f172a;font-size:9px;padding:2px 6px;font-weight:800;border-radius:3px;text-transform:uppercase;">Sponsored</span><div style="font-size:13px;font-weight:700;margin-top:4px;">Apex Sports Betting & Real-time Live Odds</div><div style="font-size:11px;color:#94a3b8;">Verified anti-adblock partner banner. 100% deposit match bonus.</div></div><button style="background:#f59e0b;color:#0f172a;border:none;padding:7px 14px;border-radius:6px;font-weight:800;font-size:11px;cursor:pointer;">Claim Bonus &rarr;</button>';
    box.onclick = function () {
      try {
        new Image().src = origin + '/api/serve/track?zoneId=' + encodeURIComponent(zId) + '&type=click';
      } catch (err) {}
      window.open(origin + '/offer.html?zone=' + zId, '_blank');
    };
    parent.innerHTML = '';
    parent.appendChild(box);
  }
})();
