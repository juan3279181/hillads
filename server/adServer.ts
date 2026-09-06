import { getDb, saveDatabase, creditPublisherEarnings } from './db';
import { inspectTraffic } from './antiFraud';

export function handleDirectLink(zoneId: string, ip: string, userAgent: string, referrer: string) {
  const db = getDb();
  const zone = db.zones.find((z) => z.id === zoneId);

  // Run anti-fraud check
  const fraudAssessment = inspectTraffic(ip, userAgent, zoneId, referrer);

  if (fraudAssessment.action === 'block') {
    return {
      status: 403,
      message: 'Traffic flagged by HilltopAds Anti-Fraud shield',
      fraudScore: fraudAssessment.score,
      destinationUrl: '/api/serve/security-check?zone=' + encodeURIComponent(zoneId),
      campaignName: 'Security Filter Active',
      campaign: null,
      platformEarningsRecorded: 0,
    };
  }

  // Find candidate campaign
  let campaign = db.campaigns.find(
    (c) => c.status === 'active' && (c.adFormat === 'direct_link' || c.adFormat === 'popunder')
  );

  if (!campaign) {
    campaign = db.campaigns[0];
  }

  // Calculate economics: e.g. $0.05 - $0.18 per direct link click or CPM equivalent
  const costPerClick = campaign ? (campaign.pricingModel === 'CPC' ? campaign.bid : campaign.bid / 1000) : 0.08;
  const platformRate = 0.25; // 25% take-rate for platform owner
  const platformCut = Number((costPerClick * platformRate).toFixed(4));
  const publisherCut = Number((costPerClick * (1 - platformRate)).toFixed(4));

  // Update zone stats
  if (zone) {
    zone.impressions += 1;
    zone.clicks += 1;
    zone.grossRevenue = Number((zone.grossRevenue + costPerClick).toFixed(4));
    zone.publisherEarnings = Number((zone.publisherEarnings + publisherCut).toFixed(4));
    zone.platformCommission = Number((zone.platformCommission + platformCut).toFixed(4));
    zone.eCPM = zone.impressions > 0 ? Number(((zone.grossRevenue / zone.impressions) * 1000).toFixed(2)) : zone.eCPM;
    const pubAccount = zone.publisherId || 'pub_user';
    creditPublisherEarnings(pubAccount, publisherCut);
  }

  if (campaign) {
    campaign.impressions += 1;
    campaign.clicks += 1;
    campaign.spent = Number((campaign.spent + costPerClick).toFixed(4));
  }
  db.platformTotalEarnings = Number((db.platformTotalEarnings + platformCut).toFixed(4));

  saveDatabase();

  return {
    status: 200,
    destinationUrl: campaign?.landingUrl || `/api/serve/offer-view/${campaign?.id || 'cmp_default'}?zone=${zoneId}`,
    campaignId: campaign?.id,
    campaignName: campaign?.name || 'Verified High-Yield Partner Campaign',
    campaign,
    fraudScore: fraudAssessment.score,
    platformEarningsRecorded: platformCut,
    publisherEarningsRecorded: publisherCut,
  };
}

export function generateAdTagScript(zoneId: string, host: string): string {
  const db = getDb();
  const zone = db.zones.find((z) => z.id === zoneId);
  const format = zone?.format || 'popunder';
  const size = zone?.bannerSize || '300x250';
  const width = size.split('x')[0] || '300';
  const height = size.split('x')[1] || '250';

  const campaign =
    db.campaigns.find((c) => c.adFormat === format && c.status === 'active') ||
    db.campaigns[0];

  const titleText = campaign?.adTitle || campaign?.name || 'Exclusive Partner Offer';
  const bodyText = campaign?.adBody || 'Claim your exclusive reward or view verified trending content now.';

  // Return real JavaScript code with HilltopAds anti-adblock wrappers
  return `
/**
 * HilltopAds Dynamic Multi-Format Ad Delivery Core
 * Zone: ${zoneId} | Format: ${format} | Anti-Adblock: Enabled
 */
(function(window, document) {
  'use strict';
  var ZONE_ID = "${zoneId}";
  var FORMAT = "${format}";

  // Automatically discover Ad Server origin from the script tag's own URL
  var scriptOrigin = "";
  var currentScript = document.currentScript;
  try {
    if (!currentScript) {
      var allScripts = document.getElementsByTagName("script");
      for (var sIdx = allScripts.length - 1; sIdx >= 0; sIdx--) {
        if (allScripts[sIdx].src && allScripts[sIdx].src.indexOf("/api/serve/ad-tag/") !== -1) {
          currentScript = allScripts[sIdx];
          break;
        }
      }
    }
    if (currentScript && currentScript.src) {
      var u = new URL(currentScript.src);
      scriptOrigin = u.origin;
    }
  } catch(e) {}

  var defaultHost = "${host.startsWith('http') ? host : (host.includes('localhost') ? 'http://' : 'https://') + host}";
  var API_BASE = scriptOrigin || defaultHost;

  function logImpression() {
    try {
      var img = new Image(1, 1);
      img.src = API_BASE + "/api/serve/track?zone=" + encodeURIComponent(ZONE_ID) + "&event=imp&t=" + Date.now();
    } catch(e) {}
  }

  // 1. Popunder OnClick Delivery
  if (FORMAT === "popunder") {
    var triggered = false;
    function openPopunder(e) {
      if (triggered) return;
      triggered = true;
      logImpression();
      var popUrl = API_BASE + "/api/serve/direct-link/" + encodeURIComponent(ZONE_ID);
      var w = window.open(popUrl, "_blank", "toolbar=yes,location=yes,status=yes,menubar=yes,scrollbars=yes,resizable=yes");
      if (w) {
        try { w.blur(); window.focus(); } catch(err) {}
      }
    }
    window.addEventListener("click", openPopunder, { capture: true, once: true });
  }

  // 2. In-Page Push Floating Toast
  else if (FORMAT === "in_page_push") {
    function mountPushToast() {
      if (document.getElementById("hta-ipp-" + ZONE_ID)) return;
      logImpression();

      var style = document.createElement("style");
      style.innerHTML = "@keyframes htaSlideIn { from { transform: translateY(80px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }";
      document.head.appendChild(style);

      var container = document.createElement("div");
      container.id = "hta-ipp-" + ZONE_ID;
      container.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:2147483647;max-width:360px;background:#0f172a;color:#f8fafc;padding:14px 16px;border-radius:12px;box-shadow:0 20px 35px rgba(0,0,0,0.45);border:1px solid #334155;font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif;display:flex;align-items:flex-start;gap:12px;cursor:pointer;animation:htaSlideIn 0.3s ease-out;";

      container.innerHTML = 
        '<div style="width:42px;height:42px;border-radius:10px;background:linear-gradient(135deg,#f59e0b,#d97706);display:flex;align-items:center;justify-content:center;font-weight:900;color:#0f172a;flex-shrink:0;font-size:20px;box-shadow:0 2px 6px rgba(0,0,0,0.3);">★</div>' +
        '<div style="flex:1;min-width:0;">' +
          '<div style="font-weight:700;font-size:13px;color:#f59e0b;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + ${JSON.stringify(titleText)} + '</div>' +
          '<div style="font-size:12px;line-height:1.4;color:#cbd5e1;">' + ${JSON.stringify(bodyText)} + '</div>' +
        '</div>' +
        '<button id="hta-close-' + ZONE_ID + '" style="background:transparent;border:none;color:#94a3b8;font-size:18px;cursor:pointer;padding:0 4px;line-height:1;margin-left:4px;" title="Dismiss">&times;</button>';
      
      container.onclick = function(e) {
        if (e.target && e.target.id === "hta-close-" + ZONE_ID) {
          e.stopPropagation();
          container.remove();
          return;
        }
        window.open(API_BASE + "/api/serve/direct-link/" + encodeURIComponent(ZONE_ID), "_blank");
        container.remove();
      };

      if (document.body) {
        document.body.appendChild(container);
      }
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mountPushToast);
    } else {
      mountPushToast();
    }
  }

  // 3. Banner Responsive Frame
  else if (FORMAT === "banner") {
    function mountBanner() {
      var bannerHolder = document.getElementById("hilltop-zone-" + ZONE_ID);
      if (!bannerHolder) {
        if (currentScript && currentScript.parentNode && currentScript.parentNode.nodeName !== "HEAD") {
          bannerHolder = currentScript.parentNode;
        } else {
          bannerHolder = document.body;
        }
      }
      if (!bannerHolder) return;

      var iframe = document.createElement("iframe");
      iframe.src = API_BASE + "/api/serve/banner-frame/" + encodeURIComponent(ZONE_ID);
      iframe.style.width = "${width}px";
      iframe.style.height = "${height}px";
      iframe.style.border = "none";
      iframe.style.overflow = "hidden";
      iframe.style.display = "block";
      iframe.setAttribute("scrolling", "no");
      iframe.setAttribute("frameborder", "0");
      bannerHolder.appendChild(iframe);
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mountBanner);
    } else {
      mountBanner();
    }
  }
})(window, document);
  `.trim();
}
