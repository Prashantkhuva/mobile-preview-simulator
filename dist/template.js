"use strict";

const { escapeHtml, escapeJs } = require("./utils");
const { getDeviceMarkup } = require("./devices");

function getHtml(targetUrl, deviceCatalog) {
  const safeTarget = escapeHtml(targetUrl);
  const safeJsUrl = escapeJs(targetUrl);
  const catalog = deviceCatalog || [];
  const catalogJson = JSON.stringify(catalog);
  const selectMarkup = getDeviceMarkup(catalog);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; frame-src http: https:; img-src https: data:;" />
  <title>Mobile Preview</title>
  <style>
    :root {
      --bg: #0a0a0a;
      --text: #f5f7fb;
      --screen-width: 393px;
      --screen-height: 852px;
      --outer-width: 447px;
      --outer-height: 918px;
      --screen-radius: 42px;
      --frame-radius: 52px;
      --status-pad-top: 19px;
      --camera-width: 126px;
      --camera-height: 34px;
      --user-zoom: 1;
      --phone-finish: #1c1c1e;
      --phone-border: #3a3a3a;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100vh; overflow: hidden; background: var(--bg); }
    body {
      display: flex; flex-direction: column;
      color: var(--text);
      font: 13px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    button, select, input { font: inherit; }

    /* ── Toolbar ── */
    .toolbar {
      display: flex; align-items: center; gap: 4px;
      padding: 0 8px; height: 48px; min-height: 48px;
      background: rgba(14,14,16,0.92);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      z-index: 100;
    }
    .select-shell {
      position: relative; flex: 1; min-width: 0; height: 32px;
    }
    .select-shell::after {
      content: ""; position: absolute; right: 10px; top: 50%;
      width: 7px; height: 7px; margin-top: -5px;
      border-right: 1.5px solid rgba(255,255,255,0.5);
      border-bottom: 1.5px solid rgba(255,255,255,0.5);
      transform: rotate(45deg); pointer-events: none;
    }
    .device-picker {
      width: 100%; height: 32px;
      padding: 0 28px 0 10px;
      border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);
      color: #fff; background: rgba(255,255,255,0.06);
      font-size: 12px; font-weight: 500;
      outline: none; appearance: none; cursor: pointer;
      transition: border-color 0.15s, background 0.15s;
    }
    .device-picker:hover { border-color: rgba(255,255,255,0.18); }
    .device-picker:focus { border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); }
    .device-picker option, .device-picker optgroup { background: #1a1a1e; color: #fff; }

    .tb-group {
      display: flex; align-items: center; gap: 2px;
      padding: 0 4px; height: 32px;
      border-left: 1px solid rgba(255,255,255,0.08);
    }
    .tb-btn {
      display: flex; align-items: center; justify-content: center;
      width: 30px; height: 30px; border: none; border-radius: 6px;
      background: transparent; color: rgba(255,255,255,0.55);
      cursor: pointer; transition: all 0.12s ease;
      font-size: 15px; line-height: 1;
    }
    .tb-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .tb-btn:active { transform: scale(0.9); }
    .tb-btn.active { color: #6ea8fe; background: rgba(110,168,254,0.12); }
    .tb-btn svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; display: block; }

    .zoom-label {
      min-width: 34px; text-align: center;
      font-size: 11px; font-weight: 600;
      color: rgba(255,255,255,0.4);
      font-variant-numeric: tabular-nums;
      cursor: pointer; transition: color 0.15s;
    }
    .zoom-label:hover { color: rgba(255,255,255,0.8); }

    .frame-colors { display: flex; align-items: center; gap: 5px; }
    .color-dot {
      width: 15px; height: 15px; border-radius: 50%;
      border: 2px solid transparent; cursor: pointer;
      transition: all 0.15s ease; flex-shrink: 0;
    }
    .color-dot:hover { transform: scale(1.18); }
    .color-dot.active { border-color: rgba(255,255,255,0.6); box-shadow: 0 0 0 1px rgba(255,255,255,0.15); }

    /* ── Preview ── */
    .preview-area {
      flex: 1; display: flex; align-items: center; justify-content: center;
      overflow: hidden; padding: 16px; min-height: 0;
    }
    .phone-viewport {
      position: relative;
      width: var(--outer-width); height: var(--outer-height);
      display: flex; align-items: center; justify-content: center;
      transition: width 0.35s cubic-bezier(0.25,0.1,0.25,1), height 0.35s cubic-bezier(0.25,0.1,0.25,1);
    }
    .phone-scale {
      width: var(--outer-width); height: var(--outer-height);
      display: grid; place-items: center;
      transform-origin: center center;
    }
    .phone {
      position: relative;
      width: calc(var(--screen-width) + 36px);
      height: calc(var(--screen-height) + 36px);
      padding: 15px;
      border-radius: 54px;
      border: 1px solid var(--phone-border);
      background: var(--phone-finish);
      box-shadow: 0 0 0 1px rgba(255,255,255,0.03), 0 4px 24px rgba(0,0,0,0.6), 0 20px 80px rgba(0,0,0,0.5);
      transition: all 0.35s cubic-bezier(0.25,0.1,0.25,1);
    }
    .phone::before {
      content: ""; position: absolute; inset: 8px;
      border-radius: 46px; background: #000;
      border: 1px solid rgba(255,255,255,0.02);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.02);
      pointer-events: none;
    }
    .phone.tablet { width: calc(var(--screen-width) + 34px); height: calc(var(--screen-height) + 34px); padding: 14px; border-radius: 40px; }
    .phone.tablet::before { inset: 7px; border-radius: 32px; }

    .hardware-button {
      position: absolute;
      background: rgba(42,42,44,0.85);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
      opacity: 0.75; transition: all 0.3s ease;
    }
    .hardware-button.left { left: -5px; width: 3px; border-radius: 2px 0 0 2px; }
    .hardware-button.right { right: -5px; width: 3px; border-radius: 0 2px 2px 0; }
    .hardware-button.volume-up { top: 120px; height: 35px; }
    .hardware-button.volume-down { top: 165px; height: 35px; }
    .hardware-button.power { top: 160px; height: 70px; }
    .hardware-button.hidden { display: none; }

    .screen-shell {
      position: relative;
      width: var(--screen-width); height: var(--screen-height);
      border-radius: 44px; overflow: hidden; background: #000;
      isolation: isolate; display: flex; flex-direction: column;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.02);
      transition: all 0.35s cubic-bezier(0.25,0.1,0.25,1);
    }
    .camera {
      position: absolute; top: 10px; left: 50%;
      z-index: 99999; transform: translateX(-50%);
      pointer-events: none; transition: all 0.35s ease;
    }
    .camera.island { width: 126px; height: 37px; border-radius: 20px; background: #000; }
    .camera.notch { width: 176px; height: 34px; border-radius: 0 0 22px 22px; background: #000; }
    .camera.notch::before, .camera.notch::after, .camera.island::before, .camera.island::after {
      content: ""; position: absolute; top: 50%; transform: translateY(-50%); border-radius: 999px;
    }
    .camera.notch::before, .camera.island::before { left: 18px; width: 42px; height: 8px; background: rgba(30,30,30,0.95); }
    .camera.notch::after, .camera.island::after { right: 22px; width: 10px; height: 10px; background: rgba(26,26,28,0.96); box-shadow: 0 0 0 3px rgba(12,12,14,0.55); }
    .camera.punch { top: 15px; width: 18px; height: 18px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, rgba(66,66,74,0.95), rgba(8,8,10,0.98) 60%); box-shadow: 0 0 0 4px rgba(0,0,0,0.45); }
    .camera.tablet { top: 14px; width: 58px; height: 8px; border-radius: 999px; background: rgba(0,0,0,0.72); }

    .statusbar {
      position: absolute; top: 0; left: 0; right: 0; height: 50px;
      display: flex; align-items: flex-end; justify-content: space-between;
      padding: 0 20px 8px; color: white; font-size: 12px; font-weight: 700;
      z-index: 9999; pointer-events: none;
      background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%);
    }
    .status-time { font-size: 15px; font-weight: 700; letter-spacing: -0.3px; }
    .status-icons { display: flex; align-items: center; gap: 6px; font-size: 13px; }
    .statusbar.right-offset { padding-right: 20px; }

    .signal { width: 0; height: 0; border-top: 5px solid transparent; border-bottom: 5px solid transparent; border-left: 8px solid white; opacity: 0.95; }
    .wifi { position: relative; width: 16px; height: 11px; border-top: 2px solid white; border-left: 2px solid transparent; border-right: 2px solid transparent; border-radius: 14px 14px 0 0; opacity: 0.92; }
    .wifi::before, .wifi::after { content: ""; position: absolute; left: 50%; transform: translateX(-50%); border-top: 2px solid white; border-left: 2px solid transparent; border-right: 2px solid transparent; border-radius: 14px 14px 0 0; }
    .wifi::before { top: 3px; width: 10px; height: 5px; }
    .wifi::after { top: 6px; width: 4px; height: 2px; }
    .battery { position: relative; width: 24px; height: 12px; border: 1.8px solid white; border-radius: 4px; }
    .battery::before { content: ""; position: absolute; top: 3px; right: -4px; width: 2px; height: 6px; border-radius: 1px; background: white; }
    .battery::after { content: ""; position: absolute; inset: 2px; width: 68%; border-radius: 2px; background: white; }

    .webview-frame {
      position: absolute; top: 50px; left: 0;
      width: 100%; height: calc(100% - 50px - 34px);
      border: none; display: block; background: white; z-index: 1;
    }

    .address-bar-wrap {
      position: absolute; bottom: 28px; left: 50%; width: 82%;
      transform: translateX(-50%); z-index: 999999; pointer-events: auto;
    }
    .address-bar {
      width: 100%; height: 36px; border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.2);
      padding: 0 14px; font-size: 11.5px; text-align: center;
      color: white; outline: none;
      background: rgba(30,30,34,0.85);
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .address-bar:focus { border-color: rgba(110,168,254,0.5); box-shadow: 0 0 0 3px rgba(110,168,254,0.08); }
    .address-bar::placeholder { color: rgba(255,255,255,0.5); }

    .home-indicator {
      position: absolute; bottom: 8px; left: 50%;
      width: 134px; height: 5px; transform: translateX(-50%);
      border-radius: 999px; background: rgba(255,255,255,0.85);
      z-index: 999999; pointer-events: none;
    }
    .home-indicator.hidden { display: none; }

    .frame-overlay {
      position: absolute; top: 50px; left: 0; right: 0; bottom: 34px;
      z-index: 50; display: flex; align-items: center; justify-content: center;
      background: #f5f5f7; transition: opacity 0.25s ease;
    }
    .frame-overlay.hidden { opacity: 0; pointer-events: none; }
    .frame-overlay-content { display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; padding: 24px; max-width: 280px; }
    .frame-overlay-content .spinner { width: 28px; height: 28px; border: 3px solid rgba(0,0,0,0.08); border-top-color: #555; border-radius: 50%; animation: fspin 0.7s linear infinite; }
    @keyframes fspin { to { transform: rotate(360deg); } }
    .frame-overlay-content .icon { width: 32px; height: 32px; border-radius: 50%; background: rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; font: 16px/1 sans-serif; color: rgba(0,0,0,0.4); }
    .frame-overlay-content .msg { font-size: 13px; color: rgba(0,0,0,0.7); line-height: 1.4; }
    .frame-overlay-content .sub { font-size: 11px; color: rgba(0,0,0,0.35); word-break: break-all; }
    .frame-overlay-content .rbtn { margin-top: 4px; padding: 6px 20px; border-radius: 999px; border: 1px solid rgba(0,0,0,0.12); background: transparent; color: rgba(0,0,0,0.55); font-size: 12px; cursor: pointer; }
    .frame-overlay-content .rbtn:hover { background: rgba(0,0,0,0.06); }
    .frame-overlay.hidden .spinner { animation-play-state: paused; }

    /* ── QR popover ── */
    .qr-wrap { position: relative; }
    .qr-popover {
      position: absolute; bottom: 40px; right: 0;
      background: rgba(22,22,26,0.96); backdrop-filter: blur(24px);
      border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
      padding: 10px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.6);
      opacity: 0; pointer-events: none;
      transition: opacity 0.2s ease, transform 0.2s ease;
      transform: translateY(4px); z-index: 999999;
    }
    .qr-popover.open { opacity: 1; pointer-events: auto; transform: translateY(0); }
    .qr-popover img { display: block; width: 110px; height: 110px; border-radius: 6px; }
    .qr-popover-label { text-align: center; font-size: 10px; color: rgba(255,255,255,0.4); margin-top: 5px; max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  </style>
</head>
<body>
  <header class="toolbar">
    <div class="select-shell">
      <select id="deviceSelect" class="device-picker">${selectMarkup}</select>
    </div>

    <div class="tb-group">
      <button id="rotateBtn" class="tb-btn" title="Rotate">
        <svg viewBox="0 0 24 24"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
      </button>
    </div>

    <div class="tb-group">
      <button id="zoomOutBtn" class="tb-btn" title="Zoom out">\u2212</button>
      <span id="zoomLabel" class="zoom-label" title="Reset zoom">100%</span>
      <button id="zoomInBtn" class="tb-btn" title="Zoom in">+</button>
    </div>

    <div class="tb-group">
      <div class="frame-colors" id="frameColors">
        <span class="color-dot active" style="background:#1c1c1e;border-color:rgba(255,255,255,0.12)" data-color="#1c1c1e" data-border="#3a3a3a" title="Dark"></span>
        <span class="color-dot" style="background:#e5e5e7" data-color="#e5e5e7" data-border="#c7c7cc" title="Silver"></span>
        <span class="color-dot" style="background:#5b4a6e" data-color="#5b4a6e" data-border="#7b6a8e" title="Purple"></span>
        <span class="color-dot" style="background:#c9a96e" data-color="#c9a96e" data-border="#e0c080" title="Gold"></span>
      </div>
    </div>

    <div class="tb-group qr-wrap">
      <button id="qrBtn" class="tb-btn" title="QR code">
        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><line x1="3" y1="14" x2="10" y2="14" stroke-width="1.5"/><line x1="3" y1="18" x2="3" y2="21" stroke-width="1.5"/></svg>
      </button>
      <div id="qrPopover" class="qr-popover">
        <img id="qrImg" alt="QR code" />
        <div id="qrLabel" class="qr-popover-label">Scan</div>
      </div>
    </div>
  </header>

  <main class="preview-area" id="previewArea">
    <div id="phoneViewport" class="phone-viewport">
      <div id="phoneScale" class="phone-scale">
        <div id="phone" class="phone">
          <span id="volumeUp" class="hardware-button left volume-up"></span>
          <span id="volumeDown" class="hardware-button left volume-down"></span>
          <span id="powerButton" class="hardware-button right power"></span>

          <div id="screenShell" class="screen-shell">
            <div id="camera" class="camera island"></div>
            <div id="statusbar" class="statusbar">
              <span class="status-time">9:41</span>
              <span class="status-icons">
                <span class="signal"></span><span class="wifi"></span><span class="battery"></span>
              </span>
            </div>

            <iframe id="previewFrame" class="webview-frame" src="${safeTarget}" title="Mobile Preview" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"></iframe>

            <div id="frameOverlay" class="frame-overlay hidden">
              <div class="frame-overlay-content">
                <div id="overlaySpinner" class="spinner"></div>
                <div id="overlayIcon" class="icon hidden">!</div>
                <div id="overlayMsg" class="msg">Connecting...</div>
                <div id="overlaySub" class="sub"></div>
                <button id="retryBtn" class="rbtn hidden">Retry</button>
              </div>
            </div>

            <div class="address-bar-wrap">
              <input id="urlInput" class="address-bar" value="${safeTarget}" spellcheck="false" placeholder="Enter URL and press Enter" list="urlHistoryList" />
              <datalist id="urlHistoryList"></datalist>
            </div>

            <div id="homeIndicator" class="home-indicator"></div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <script>
    var vscode = acquireVsCodeApi();
    var catalog = ${catalogJson};
    var root = document.documentElement;
    var urlInput = document.getElementById("urlInput");
    var deviceSelect = document.getElementById("deviceSelect");
    var previewArea = document.getElementById("previewArea");
    var phoneViewport = document.getElementById("phoneViewport");
    var phoneScale = document.getElementById("phoneScale");
    var phone = document.getElementById("phone");
    var camera = document.getElementById("camera");
    var statusbar = document.getElementById("statusbar");
    var homeIndicator = document.getElementById("homeIndicator");
    var volumeUp = document.getElementById("volumeUp");
    var volumeDown = document.getElementById("volumeDown");
    var powerButton = document.getElementById("powerButton");
    var previewFrame = document.getElementById("previewFrame");
    var frameOverlay = document.getElementById("frameOverlay");
    var overlaySpinner = document.getElementById("overlaySpinner");
    var overlayIcon = document.getElementById("overlayIcon");
    var overlayMsg = document.getElementById("overlayMsg");
    var overlaySub = document.getElementById("overlaySub");
    var retryBtn = document.getElementById("retryBtn");
    var rotateBtn = document.getElementById("rotateBtn");
    var zoomOutBtn = document.getElementById("zoomOutBtn");
    var zoomInBtn = document.getElementById("zoomInBtn");
    var zoomLabel = document.getElementById("zoomLabel");
    var qrBtn = document.getElementById("qrBtn");
    var qrPopover = document.getElementById("qrPopover");
    var qrImg = document.getElementById("qrImg");
    var qrLabel = document.getElementById("qrLabel");
    var frameColors = document.getElementById("frameColors");
    var urlHistoryList = document.getElementById("urlHistoryList");

    urlInput.dataset.fullUrl = "${safeJsUrl}";

    var connectTimer;
    var isLandscape = false;
    var userZoom = 1;
    var urlHistory = [];

    function saveState() { vscode.setState({ urlHistory: urlHistory.slice(0, 10) }); }
    function loadState() {
      var state = vscode.getState();
      if (state && Array.isArray(state.urlHistory)) urlHistory = state.urlHistory.slice(0, 10);
    }
    loadState();

    function escHtml(s) { return String(s).replace(/[&<>"]/g, function(c) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }

    function updateHistoryList() {
      urlHistoryList.innerHTML = urlHistory.map(function(u) { return '<option value="' + escHtml(u) + '">'; }).join('');
    }

    function addToHistory(url) {
      var idx = urlHistory.indexOf(url);
      if (idx > -1) urlHistory.splice(idx, 1);
      urlHistory.unshift(url);
      if (urlHistory.length > 10) urlHistory.length = 10;
      saveState();
      updateHistoryList();
    }

    function setOverlay(state, url) {
      clearTimeout(connectTimer);
      if (state === "hidden") { frameOverlay.classList.add("hidden"); return; }
      frameOverlay.classList.remove("hidden");
      if (state === "loading") {
        overlaySpinner.classList.remove("hidden");
        overlayIcon.classList.add("hidden");
        overlayMsg.textContent = "Connecting\u2026";
        overlaySub.textContent = url || "";
        retryBtn.classList.add("hidden");
        connectTimer = setTimeout(function() { setOverlay("error", url); }, 12000);
      } else if (state === "error") {
        overlaySpinner.classList.add("hidden");
        overlayIcon.classList.remove("hidden");
        overlayMsg.textContent = "Unable to connect";
        overlaySub.textContent = url || "";
        retryBtn.classList.remove("hidden");
      }
    }

    previewFrame.addEventListener("load", function() { clearTimeout(connectTimer); setOverlay("hidden"); });
    retryBtn.addEventListener("click", function() { submit(); });

    function isDynamicIslandDevice(definition) {
      return definition.os === "ios" && /^iphone-(14|15|16|17)/.test(definition.id);
    }
    function getChromeType(definition) {
      if (definition.chrome === "tablet" || definition.chrome === "punch") return definition.chrome;
      return isDynamicIslandDevice(definition) ? "island" : "notch";
    }
    function getUrlDisplayValue(value) {
      var n = normalizeUrl(value);
      try { var p = new URL(n); return p.host || n.replace(/^https?:\/\//i, ""); }
      catch(e) { return n.replace(/^https?:\/\//i, ""); }
    }

    var devices = new Map();
    catalog.forEach(function(g) { g.devices.forEach(function(d) { devices.set(d.id, d); }); });

    var currentDeviceId = "iphone-15";
    deviceSelect.value = currentDeviceId;

    function normalizeUrl(value) {
      var input = String(value || "").trim();
      if (!input) return "${safeJsUrl}";
      if (/^\d+$/.test(input)) return "http://localhost:" + input;
      if (/^:\d+$/.test(input)) return "http://localhost" + input;
      if (!/^https?:\/\//i.test(input)) return "http://" + input;
      return input;
    }

    function getDeviceMetrics(definition) {
      var isTablet = definition.family === "tablet";
      var chromeType = getChromeType(definition);
      var bezel = isTablet ? 24 : 27;
      var topInset = isTablet ? 24 : 11;
      var bottomInset = isTablet ? 24 : 21;
      var sideAllowance = isTablet ? 24 : 30;
      var w = definition.width, h = definition.height;
      if (isLandscape) { var t = w; w = h; h = t; }
      return {
        width: w, height: h,
        outerWidth: w + bezel * 2 + sideAllowance,
        outerHeight: h + topInset + bottomInset,
        screenRadius: isTablet ? 28 : (definition.os === "ios" ? 42 : 32),
        frameRadius: isTablet ? 38 : (definition.os === "ios" ? 52 : 40),
        statusPadTop: isTablet ? 16 : (chromeType === "notch" ? 18 : 19),
        cameraWidth: chromeType === "island" ? 126 : 176,
        cameraHeight: chromeType === "island" ? 37 : 32
      };
    }

    function scaleFrame() {
      if (!previewArea || !phoneScale) return;
      var availW = Math.max(0, previewArea.clientWidth - 32);
      var availH = Math.max(0, previewArea.clientHeight - 32);
      var frameW = phoneScale.offsetWidth;
      var frameH = phoneScale.offsetHeight;
      var scaleX = frameW ? availW / frameW : 1;
      var scaleY = frameH ? availH / frameH : 1;
      var s = Math.min(scaleX, scaleY, 1) * userZoom;
      if (s < 0.01) s = 0.01;
      phoneScale.style.transform = "scale(" + s.toFixed(4) + ")";
    }

    function renderDevice() {
      var definition = devices.get(currentDeviceId) || devices.get("iphone-15");
      var metrics = getDeviceMetrics(definition);
      var chromeType = getChromeType(definition);

      root.style.setProperty("--screen-width", metrics.width + "px");
      root.style.setProperty("--screen-height", metrics.height + "px");
      root.style.setProperty("--outer-width", metrics.outerWidth + "px");
      root.style.setProperty("--outer-height", metrics.outerHeight + "px");
      root.style.setProperty("--screen-radius", metrics.screenRadius + "px");
      root.style.setProperty("--frame-radius", metrics.frameRadius + "px");
      root.style.setProperty("--status-pad-top", metrics.statusPadTop + "px");
      root.style.setProperty("--camera-width", metrics.cameraWidth + "px");
      root.style.setProperty("--camera-height", metrics.cameraHeight + "px");

      phoneViewport.style.width = metrics.outerWidth + "px";
      phoneViewport.style.height = metrics.outerHeight + "px";

      phone.classList.toggle("tablet", definition.family === "tablet");
      camera.className = "camera " + chromeType;
      statusbar.classList.toggle("right-offset", chromeType === "island");
      homeIndicator.classList.toggle("hidden", definition.family === "tablet");
      volumeUp.classList.toggle("hidden", definition.family === "tablet");
      volumeDown.classList.toggle("hidden", definition.family === "tablet");
      powerButton.classList.toggle("hidden", definition.family === "tablet");
      rotateBtn.classList.toggle("active", isLandscape);

      requestAnimationFrame(scaleFrame);
    }

    function submit() {
      var url = normalizeUrl(urlInput.value);
      urlInput.dataset.fullUrl = url;
      urlInput.value = getUrlDisplayValue(url);
      previewFrame.src = url;
      setOverlay("loading", url);
      addToHistory(url);
      updateQR(url);
      vscode.postMessage({ command: "loadUrl", url: url });
    }

    function updateQR(url) {
      var encoded = encodeURIComponent(url);
      qrImg.src = "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=" + encoded;
      qrLabel.textContent = url.replace(/^https?:\/\//i, "");
    }

    /* ── Orientation ── */
    rotateBtn.addEventListener("click", function() { isLandscape = !isLandscape; renderDevice(); });

    /* ── Zoom ── */
    function setZoom(v) { userZoom = Math.max(0.25, Math.min(3, v)); zoomLabel.textContent = Math.round(userZoom * 100) + "%"; scaleFrame(); }
    zoomOutBtn.addEventListener("click", function() { setZoom(userZoom - 0.1); });
    zoomInBtn.addEventListener("click", function() { setZoom(userZoom + 0.1); });
    zoomLabel.addEventListener("click", function() { setZoom(1); });

    /* ── Frame color ── */
    frameColors.addEventListener("click", function(e) {
      var dot = e.target.closest(".color-dot");
      if (!dot) return;
      frameColors.querySelectorAll(".color-dot").forEach(function(d) { d.classList.remove("active"); });
      dot.classList.add("active");
      root.style.setProperty("--phone-finish", dot.dataset.color);
      root.style.setProperty("--phone-border", dot.dataset.border);
    });

    /* ── QR ── */
    qrBtn.addEventListener("click", function(e) { e.stopPropagation(); qrPopover.classList.toggle("open"); });
    document.addEventListener("click", function() { qrPopover.classList.remove("open"); });
    qrPopover.addEventListener("click", function(e) { e.stopPropagation(); });

    /* ── Device select ── */
    deviceSelect.addEventListener("change", function() { currentDeviceId = deviceSelect.value; renderDevice(); });

    /* ── URL Input ── */
    urlInput.addEventListener("keydown", function(e) { if (e.key === "Enter") submit(); });
    urlInput.addEventListener("focus", function() {
      urlInput.value = urlInput.dataset.fullUrl || normalizeUrl(urlInput.value);
      requestAnimationFrame(function() { urlInput.select(); });
    });
    urlInput.addEventListener("blur", function() {
      var fullUrl = normalizeUrl(urlInput.dataset.fullUrl || urlInput.value);
      urlInput.dataset.fullUrl = fullUrl;
      urlInput.value = getUrlDisplayValue(fullUrl);
    });

    /* ── Resize ── */
    window.addEventListener("resize", scaleFrame);

    /* ── Init ── */
    urlInput.value = getUrlDisplayValue(urlInput.dataset.fullUrl);
    setOverlay("loading", urlInput.dataset.fullUrl);
    updateHistoryList();
    updateQR(urlInput.dataset.fullUrl);
    renderDevice();
  </script>
</body>
</html>`;
}

module.exports = { getHtml };
