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
  <title>Mobile Preview Simulator</title>
  <style>
    :root {
      --bg: #0a0a0a;
      --text: #f5f7fb;
      --muted: rgba(255,255,255,0.64);
      --screen-width: 393px;
      --screen-height: 852px;
      --outer-width: 447px;
      --outer-height: 918px;
      --screen-radius: 42px;
      --frame-radius: 52px;
      --status-pad-top: 19px;
      --camera-width: 126px;
      --camera-height: 34px;
      --device-scale: 1;
      --phone-finish: #1c1c1e;
      --phone-border: #3a3a3a;
    }

    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100vh;
      overflow: hidden;
      background: #0a0a0a;
    }

    body {
      display: grid;
      grid-template-rows: auto 1fr;
      color: var(--text);
      font: 13px/1.4 "Segoe UI", sans-serif;
    }

    button, select, input { font: inherit; }

    .toolbar {
      width: 100%;
      min-height: 48px;
      display: flex;
      align-items: center;
      gap: 2px;
      background: rgba(14,14,16,0.92);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }

    .select-shell {
      position: relative;
      flex: 1;
      min-width: 0;
      height: 48px;
    }

    .select-shell::after {
      content: "";
      position: absolute;
      right: 18px;
      top: 50%;
      width: 10px;
      height: 10px;
      margin-top: -7px;
      border-right: 2px solid rgba(255,255,255,0.66);
      border-bottom: 2px solid rgba(255,255,255,0.66);
      transform: rotate(45deg);
      pointer-events: none;
    }

    .device-picker {
      width: 100%;
      height: 48px;
      padding: 0 46px 0 18px;
      border: 0;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      color: var(--text);
      outline: none;
      appearance: none;
      background:
        linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)),
        #111214;
      box-shadow: inset 0 -1px 0 rgba(255,255,255,0.03);
      font-size: 13px;
      cursor: pointer;
    }
    .device-picker option,
    .device-picker optgroup {
      background: #111214;
      color: var(--text);
    }

    .tb-group {
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 0 6px;
      height: 48px;
      border-left: 1px solid rgba(255,255,255,0.08);
    }

    .tb-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: rgba(255,255,255,0.55);
      cursor: pointer;
      transition: all 0.12s ease;
      font-size: 16px;
    }
    .tb-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .tb-btn:active { transform: scale(0.92); }
    .tb-btn.active { color: #6ea8fe; background: rgba(110,168,254,0.12); }
    .tb-btn svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; display: block; }

    .zoom-label {
      min-width: 36px;
      text-align: center;
      font-size: 11px;
      font-weight: 600;
      color: rgba(255,255,255,0.45);
      font-variant-numeric: tabular-nums;
      cursor: pointer;
      transition: color 0.15s;
    }
    .zoom-label:hover { color: rgba(255,255,255,0.8); }

    .frame-colors {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .color-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.15s ease;
      flex-shrink: 0;
    }
    .color-dot:hover { transform: scale(1.18); }
    .color-dot.active { border-color: rgba(255,255,255,0.6); box-shadow: 0 0 0 1px rgba(255,255,255,0.15); }

    .qr-wrap { position: relative; }

    .qr-popover {
      position: absolute;
      bottom: 44px;
      right: 0;
      background: rgba(22,22,26,0.96);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 10px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.6);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease, transform 0.2s ease;
      transform: translateY(4px);
      z-index: 999999;
    }
    .qr-popover.open {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }
    .qr-popover img {
      display: block;
      width: 110px;
      height: 110px;
      border-radius: 6px;
    }
    .qr-popover-label {
      text-align: center;
      font-size: 10px;
      color: rgba(255,255,255,0.4);
      margin-top: 5px;
      max-width: 110px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .preview-container,
    .preview-area {
      width: 100%;
      height: calc(100vh - 48px);
      min-height: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      margin: 0;
      overflow: hidden;
    }

    .phone-viewport {
      position: relative;
      width: var(--outer-width);
      height: var(--outer-height);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: width 0.3s ease, height 0.3s ease;
    }

    .phone-scale,
    .phone-frame-wrapper {
      width: var(--outer-width);
      height: var(--outer-height);
      display: grid;
      place-items: center;
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
      box-shadow:
        0 0 0 1px rgba(255,255,255,0.04),
        0 30px 80px rgba(0,0,0,0.8);
      transition: all 0.3s ease;
    }

    .phone::before {
      content: "";
      position: absolute;
      inset: 8px;
      border-radius: 46px;
      background: #000;
      border: 1px solid rgba(255,255,255,0.03);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.02),
        inset 0 -10px 20px rgba(0,0,0,0.24);
      pointer-events: none;
    }

    .phone.tablet {
      width: calc(var(--screen-width) + 34px);
      height: calc(var(--screen-height) + 34px);
      padding: 14px;
      border-radius: 40px;
    }

    .phone.tablet::before {
      inset: 7px;
      border-radius: 32px;
    }

    .hardware-button {
      position: absolute;
      background: #2a2a2a;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.08),
        0 2px 6px rgba(0,0,0,0.32);
      opacity: 0.95;
      transition: all 0.3s ease;
    }

    .hardware-button.left {
      left: -6px;
      width: 4px;
      border-radius: 2px 0 0 2px;
    }

    .hardware-button.right {
      right: -6px;
      width: 4px;
      border-radius: 0 2px 2px 0;
    }

    .hardware-button.volume-up {
      top: 120px;
      height: 35px;
    }

    .hardware-button.volume-down {
      top: 165px;
      height: 35px;
    }

    .hardware-button.power {
      top: 160px;
      height: 70px;
    }

    .hardware-button.hidden {
      display: none;
    }

    .screen-shell {
      position: relative;
      width: var(--screen-width);
      height: var(--screen-height);
      border-radius: 44px;
      overflow: hidden;
      background: #000;
      isolation: isolate;
      display: flex;
      flex-direction: column;
      box-shadow:
        inset 0 0 0 1px rgba(255,255,255,0.02);
      transition: all 0.3s ease;
    }

    .camera {
      position: absolute;
      top: 10px;
      left: 50%;
      z-index: 99999;
      transform: translateX(-50%);
      pointer-events: none;
      transition: all 0.3s ease;
    }

    .camera.island {
      width: 126px;
      height: 37px;
      border-radius: 20px;
      background: #000;
    }

    .camera.notch {
      width: 176px;
      height: 34px;
      border-radius: 0 0 22px 22px;
      background: #000;
    }

    .camera.notch::before,
    .camera.notch::after,
    .camera.island::before,
    .camera.island::after {
      content: "";
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      border-radius: 999px;
    }

    .camera.notch::before,
    .camera.island::before {
      left: 18px;
      width: 42px;
      height: 8px;
      background: rgba(30,30,30,0.95);
    }

    .camera.notch::after,
    .camera.island::after {
      right: 22px;
      width: 10px;
      height: 10px;
      background: rgba(26,26,28,0.96);
      box-shadow: 0 0 0 3px rgba(12,12,14,0.55);
    }

    .camera.punch {
      top: 15px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background:
        radial-gradient(circle at 35% 35%, rgba(66,66,74,0.95), rgba(8,8,10,0.98) 60%);
      box-shadow: 0 0 0 4px rgba(0,0,0,0.45);
    }

    .camera.tablet {
      top: 14px;
      width: 58px;
      height: 8px;
      border-radius: 999px;
      background: rgba(0,0,0,0.72);
    }

    .statusbar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 50px;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      padding: 0 20px 8px;
      color: white;
      font-size: 12px;
      font-weight: 700;
      z-index: 9999;
      pointer-events: none;
      background: linear-gradient(
        to bottom,
        rgba(0,0,0,0.7) 0%,
        transparent 100%
      );
    }

    .status-time {
      font-size: 15px;
      font-weight: 700;
      letter-spacing: -0.3px;
    }

    .statusbar.right-offset {
      padding-right: 20px;
    }

    .status-icons {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
    }

    .signal {
      width: 0;
      height: 0;
      border-top: 5px solid transparent;
      border-bottom: 5px solid transparent;
      border-left: 8px solid white;
      opacity: 0.95;
    }

    .wifi {
      position: relative;
      width: 16px;
      height: 11px;
      border-top: 2px solid white;
      border-left: 2px solid transparent;
      border-right: 2px solid transparent;
      border-radius: 14px 14px 0 0;
      opacity: 0.92;
    }

    .wifi::before,
    .wifi::after {
      content: "";
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      border-top: 2px solid white;
      border-left: 2px solid transparent;
      border-right: 2px solid transparent;
      border-radius: 14px 14px 0 0;
    }

    .wifi::before {
      top: 3px;
      width: 10px;
      height: 5px;
    }

    .wifi::after {
      top: 6px;
      width: 4px;
      height: 2px;
    }

    .battery {
      position: relative;
      width: 24px;
      height: 12px;
      border: 1.8px solid white;
      border-radius: 4px;
    }

    .battery::before {
      content: "";
      position: absolute;
      top: 3px;
      right: -4px;
      width: 2px;
      height: 6px;
      border-radius: 1px;
      background: white;
    }

    .battery::after {
      content: "";
      position: absolute;
      inset: 2px;
      width: 68%;
      border-radius: 2px;
      background: white;
    }

    .webview-frame {
      position: absolute;
      top: 50px;
      left: 0;
      width: 100%;
      height: calc(100% - 50px - 34px);
      border: none;
      display: block;
      background: white;
      z-index: 1;
    }

    .address-bar-wrap {
      position: absolute;
      bottom: 28px;
      left: 50%;
      width: 82%;
      transform: translateX(-50%);
      z-index: 999999;
      pointer-events: auto;
    }

    .address-bar {
      width: 100%;
      height: 38px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.25);
      padding: 0 16px;
      font-size: 12px;
      text-align: center;
      color: white;
      outline: none;
      background: rgba(30,30,30,0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.15);
      transition: border-color 0.2s;
    }

    .address-bar:focus {
      border-color: rgba(110,168,254,0.5);
    }

    .address-bar::placeholder {
      color: rgba(255,255,255,0.62);
    }

    .home-indicator {
      position: absolute;
      bottom: 8px;
      left: 50%;
      width: 134px;
      height: 5px;
      transform: translateX(-50%);
      border-radius: 999px;
      background: rgba(255,255,255,0.9);
      z-index: 999999;
      pointer-events: none;
    }

    .home-indicator.hidden {
      display: none;
    }

    .frame-overlay {
      position: absolute;
      top: 50px;
      left: 0;
      right: 0;
      bottom: 34px;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #1c1c1e;
      transition: opacity 0.25s ease;
    }

    .frame-overlay.hidden {
      opacity: 0;
      pointer-events: none;
    }

    .frame-overlay-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      text-align: center;
      padding: 24px;
      max-width: 280px;
    }

    .frame-overlay-content .spinner {
      width: 28px;
      height: 28px;
      border: 3px solid rgba(255,255,255,0.08);
      border-top-color: #aaa;
      border-radius: 50%;
      animation: fspin 0.7s linear infinite;
    }

    @keyframes fspin {
      to { transform: rotate(360deg); }
    }

    .frame-overlay-content .icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255,255,255,0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      font: 16px/1 sans-serif;
      color: rgba(255,255,255,0.4);
    }

    .frame-overlay-content .msg {
      font-size: 13px;
      color: rgba(255,255,255,0.8);
      line-height: 1.4;
    }

    .frame-overlay-content .sub {
      font-size: 11px;
      color: rgba(255,255,255,0.4);
      word-break: break-all;
    }

    .frame-overlay-content .rbtn {
      margin-top: 4px;
      padding: 6px 20px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.2);
      background: transparent;
      color: rgba(255,255,255,0.6);
      font-size: 12px;
      cursor: pointer;
    }

    .frame-overlay-content .rbtn:hover {
      background: rgba(255,255,255,0.08);
    }

    .frame-overlay.hidden .spinner {
      animation-play-state: paused;
    }

    @media (max-width: 640px) {
      .toolbar {
        padding: 0 4px;
      }
    }
  </style>
</head>
<body>
  <header class="toolbar">
    <div class="select-shell">
      <select id="deviceSelect" class="device-picker">${selectMarkup}</select>
    </div>

    <div class="tb-group">
      <button id="rotateBtn" class="tb-btn" title="Rotate device">
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
        <span class="color-dot active" style="background:#1c1c1e;border-color:rgba(255,255,255,0.15)" data-finish="#1c1c1e" data-border="#3a3a3a" title="Dark"></span>
        <span class="color-dot" style="background:#e5e5e7" data-finish="#e5e5e7" data-border="#c7c7cc" title="Silver"></span>
        <span class="color-dot" style="background:#5b4a6e" data-finish="#5b4a6e" data-border="#7b6a8e" title="Purple"></span>
        <span class="color-dot" style="background:#c9a96e" data-finish="#c9a96e" data-border="#e0c080" title="Gold"></span>
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

  <main class="preview-container preview-area">
    <div id="phoneViewport" class="phone-viewport">
      <div id="phoneScale" class="phone-scale phone-frame-wrapper">
        <div id="phone" class="phone">
          <span id="volumeUp" class="hardware-button left volume-up"></span>
          <span id="volumeDown" class="hardware-button left volume-down"></span>
          <span id="powerButton" class="hardware-button right power"></span>

          <div id="screenShell" class="screen-shell">
            <div id="camera" class="camera island"></div>
            <div id="statusbar" class="statusbar">
              <span class="status-time">9:41</span>
              <span class="status-icons">
                <span class="signal"></span>
                <span class="wifi"></span>
                <span class="battery"></span>
              </span>
            </div>

<iframe
  id="previewFrame"
  class="webview-frame"
  src="about:blank"
  title="Mobile Preview"
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
></iframe>

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
              <input
                id="urlInput"
                class="address-bar"
                value="${safeTarget}"
                spellcheck="false"
                placeholder="Enter URL and press Enter"
                list="urlHistoryList"
              />
              <datalist id="urlHistoryList"></datalist>
            </div>

            <div id="homeIndicator" class="home-indicator"></div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <script>
    const vscode = acquireVsCodeApi();
    const catalog = ${catalogJson};
    const root = document.documentElement;
    const urlInput = document.getElementById("urlInput");
    const deviceSelect = document.getElementById("deviceSelect");
    const previewArea = document.querySelector(".preview-area");
    const phoneViewport = document.getElementById("phoneViewport");
    const phoneScale = document.getElementById("phoneScale");
    const phone = document.getElementById("phone");
    const camera = document.getElementById("camera");
    const statusbar = document.getElementById("statusbar");
    const homeIndicator = document.getElementById("homeIndicator");
    const volumeUp = document.getElementById("volumeUp");
    const volumeDown = document.getElementById("volumeDown");
    const powerButton = document.getElementById("powerButton");
    const previewFrame = document.getElementById("previewFrame");
    const frameOverlay = document.getElementById("frameOverlay");
    const overlaySpinner = document.getElementById("overlaySpinner");
    const overlayIcon = document.getElementById("overlayIcon");
    const overlayMsg = document.getElementById("overlayMsg");
    const overlaySub = document.getElementById("overlaySub");
    const retryBtn = document.getElementById("retryBtn");
    const rotateBtn = document.getElementById("rotateBtn");
    const zoomOutBtn = document.getElementById("zoomOutBtn");
    const zoomInBtn = document.getElementById("zoomInBtn");
    const zoomLabel = document.getElementById("zoomLabel");
    const qrBtn = document.getElementById("qrBtn");
    const qrPopover = document.getElementById("qrPopover");
    const qrImg = document.getElementById("qrImg");
    const qrLabel = document.getElementById("qrLabel");
    const frameColors = document.getElementById("frameColors");
    const urlHistoryList = document.getElementById("urlHistoryList");

    urlInput.dataset.fullUrl = "${safeJsUrl}";

    let connectTimer;
    let isLandscape = false;
    let userZoom = 1;
    let urlHistory = [];
    let overlayHidden = false;
    let overlayState = "start";

    function saveState() {
      vscode.setState({ urlHistory: urlHistory.slice(0, 10) });
    }

    function loadState() {
      const state = vscode.getState();
      if (state && Array.isArray(state.urlHistory)) {
        urlHistory = state.urlHistory.slice(0, 10);
      }
    }
    loadState();

    function escHtml(s) {
      return String(s).replace(/[&<>"]/g, function(c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
      });
    }

    function updateHistoryList() {
      urlHistoryList.innerHTML = urlHistory
        .map(function(u) { return '<option value="' + escHtml(u) + '">'; })
        .join("");
    }

    function addToHistory(url) {
      const idx = urlHistory.indexOf(url);
      if (idx > -1) urlHistory.splice(idx, 1);
      urlHistory.unshift(url);
      if (urlHistory.length > 10) urlHistory.length = 10;
      saveState();
      updateHistoryList();
    }

    function setOverlay(state, url) {
      clearTimeout(connectTimer);
      overlayState = state;
      if (state === "hidden") {
        if (!overlayHidden) {
          overlayHidden = true;
          setTimeout(function () { frameOverlay.classList.add("hidden"); }, 300);
        }
        return;
      }
      overlayHidden = false;
      frameOverlay.classList.remove("hidden");
      if (state === "loading") {
        overlaySpinner.classList.remove("hidden");
        overlayIcon.classList.add("hidden");
        overlayMsg.textContent = "Connecting\u2026";
        overlaySub.textContent = url || "";
        retryBtn.classList.add("hidden");
        connectTimer = setTimeout(function () {
          setOverlay("error", url);
        }, 12000);
      } else if (state === "error") {
        overlaySpinner.classList.add("hidden");
        overlayIcon.classList.remove("hidden");
        overlayMsg.textContent = "Unable to connect";
        overlaySub.textContent = url || "";
        retryBtn.classList.remove("hidden");
      } else if (state === "start") {
        overlaySpinner.classList.add("hidden");
        overlayIcon.classList.remove("hidden");
        overlayMsg.textContent = "Enter a URL and press Enter";
        overlaySub.textContent = "";
        retryBtn.classList.add("hidden");
      }
    }

    previewFrame.addEventListener("load", function () {
      if (overlayState === "loading") {
        clearTimeout(connectTimer);
        setOverlay("hidden");
      }
    });

    retryBtn.addEventListener("click", function () {
      submit();
    });

    function isDynamicIslandDevice(definition) {
      return definition.os === "ios" && /^iphone-(14|15|16|17)/.test(definition.id);
    }

    function getChromeType(definition) {
      if (definition.chrome === "tablet" || definition.chrome === "punch") return definition.chrome;
      return isDynamicIslandDevice(definition) ? "island" : "notch";
    }

    function getUrlDisplayValue(value) {
      const normalized = normalizeUrl(value);
      try {
        const parsed = new URL(normalized);
        return parsed.host || normalized.replace(/^https?:\/\//i, "");
      } catch {
        return normalized.replace(/^https?:\/\//i, "");
      }
    }

    const devices = new Map();
    catalog.forEach((group) => group.devices.forEach((item) => devices.set(item.id, item)));

    let currentDeviceId = "iphone-15";
    deviceSelect.value = currentDeviceId;

    function normalizeUrl(value) {
      const input = String(value || "").trim();
      if (!input) return "${safeJsUrl}";
      if (/^\d+$/.test(input)) return "http://localhost:" + input;
      if (/^:\d+$/.test(input)) return "http://localhost" + input;
      if (!/^https?:\/\//i.test(input)) return "http://" + input;
      return input;
    }

    function getDeviceMetrics(definition) {
      const isTablet = definition.family === "tablet";
      const isIOS = definition.os === "ios";
      const chromeType = getChromeType(definition);
      const bezel = isTablet ? 24 : 27;
      const topInset = isTablet ? 24 : 11;
      const bottomInset = isTablet ? 24 : 21;
      const sideAllowance = isTablet ? 24 : 30;
      let w = definition.width;
      let h = definition.height;
      if (isLandscape) { let t = w; w = h; h = t; }

      return {
        width: w, height: h,
        outerWidth: w + bezel * 2 + sideAllowance,
        outerHeight: h + topInset + bottomInset,
        screenRadius: isTablet ? 28 : (isIOS ? 42 : 32),
        frameRadius: isTablet ? 38 : (isIOS ? 52 : 40),
        statusPadTop: isTablet ? 16 : (chromeType === "notch" ? 18 : 19),
        cameraWidth: chromeType === "island" ? 126 : 176,
        cameraHeight: chromeType === "island" ? 37 : 32
      };
    }

    function scaleFrame() {
      if (!previewArea || !phoneScale) return;

      const availW = Math.max(0, previewArea.clientWidth - 32);
      const availH = Math.max(0, previewArea.clientHeight - 32);
      const frameW = phoneScale.offsetWidth;
      const frameH = phoneScale.offsetHeight;
      const scaleX = frameW ? availW / frameW : 1;
      const scaleY = frameH ? availH / frameH : 1;
      let scale = Math.min(scaleX, scaleY, 1) * userZoom;
      if (scale < 0.01) scale = 0.01;

      phoneScale.style.transform = "scale(" + scale.toFixed(4) + ")";
    }

    function renderDevice() {
      const definition = devices.get(currentDeviceId) || devices.get("iphone-15");
      const metrics = getDeviceMetrics(definition);
      const chromeType = getChromeType(definition);

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
      const url = normalizeUrl(urlInput.value);
      urlInput.dataset.fullUrl = url;
      urlInput.value = getUrlDisplayValue(url);
      previewFrame.src = url;
      setOverlay("loading", url);
      addToHistory(url);
      updateQR(url);
      vscode.postMessage({ command: "loadUrl", url });
    }

    function updateQR(url) {
      const encoded = encodeURIComponent(url);
      qrImg.src = "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=" + encoded;
      qrLabel.textContent = url.replace(/^https?:\/\//i, "");
    }

    rotateBtn.addEventListener("click", function () {
      isLandscape = !isLandscape;
      renderDevice();
    });

    function setZoom(v) {
      userZoom = Math.max(0.25, Math.min(3, v));
      zoomLabel.textContent = Math.round(userZoom * 100) + "%";
      scaleFrame();
    }
    zoomOutBtn.addEventListener("click", function () { setZoom(userZoom - 0.1); });
    zoomInBtn.addEventListener("click", function () { setZoom(userZoom + 0.1); });
    zoomLabel.addEventListener("click", function () { setZoom(1); });

    frameColors.addEventListener("click", function (e) {
      const dot = e.target.closest(".color-dot");
      if (!dot) return;
      frameColors.querySelectorAll(".color-dot").forEach(function (d) { d.classList.remove("active"); });
      dot.classList.add("active");
      root.style.setProperty("--phone-finish", dot.dataset.finish);
      root.style.setProperty("--phone-border", dot.dataset.border);
    });

    qrBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      qrPopover.classList.toggle("open");
    });
    document.addEventListener("click", function () {
      qrPopover.classList.remove("open");
    });
    qrPopover.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    deviceSelect.addEventListener("change", () => {
      currentDeviceId = deviceSelect.value;
      try { renderDevice(); } catch (e) { console.error("renderDevice error:", e); }
    });

    urlInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        submit();
      }
    });

    urlInput.addEventListener("focus", () => {
      urlInput.value = urlInput.dataset.fullUrl || normalizeUrl(urlInput.value);
      requestAnimationFrame(() => urlInput.select());
    });

    urlInput.addEventListener("blur", () => {
      const fullUrl = normalizeUrl(urlInput.dataset.fullUrl || urlInput.value);
      urlInput.dataset.fullUrl = fullUrl;
      urlInput.value = getUrlDisplayValue(fullUrl);
    });

    window.addEventListener("resize", scaleFrame);

    try {
      urlInput.value = getUrlDisplayValue(urlInput.dataset.fullUrl);
      setOverlay("start");
      updateHistoryList();
      updateQR(urlInput.dataset.fullUrl);
      renderDevice();
    } catch (e) {
      console.error("Mobile Preview init error:", e);
      setOverlay("start");
    }
  </script>
</body>
</html>`;
}

module.exports = { getHtml };
