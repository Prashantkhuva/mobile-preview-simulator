"use strict";

const { escapeHtml, escapeJs } = require("./utils");
const { DEVICE_GROUPS, getDeviceMarkup } = require("./devices");

function getHtml(targetUrl, iframeUrl, localIp) {
  const safeTarget = escapeHtml(targetUrl);
  const safeFrame = escapeHtml(iframeUrl || targetUrl);
  const safeJsUrl = escapeJs(targetUrl);
  const safeIp = escapeJs(localIp || "localhost");
  const catalog = DEVICE_GROUPS;
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
      --glow-color: rgba(0, 122, 255, 0.15);
    }

    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100vh;
      overflow: hidden;
      background: #070708;
    }

    body {
      display: grid;
      grid-template-rows: auto 1fr;
      color: var(--text);
      font: 13px/1.4 -apple-system, "Segoe UI", system-ui, sans-serif;
      background:
        radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0, 122, 255, 0.06) 0%, transparent 70%),
        radial-gradient(ellipse 60% 50% at 80% 90%, rgba(0, 122, 255, 0.03) 0%, transparent 60%),
        #070708;
    }

    button, select, input { font: inherit; }

    .toolbar {
      width: 100%;
      min-height: 48px;
      box-sizing: border-box;
      padding: 0;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0;
      position: relative;
      z-index: 10;
      background: rgba(10, 10, 12, 0.72);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }

    .toolbar-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 12px 0 16px;
      flex-shrink: 0;
      opacity: 0.6;
    }

    .toolbar-brand svg {
      width: 18px;
      height: 18px;
    }

    .toolbar-brand span {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.3px;
      text-transform: uppercase;
      color: rgba(255,255,255,0.5);
    }

    .select-shell {
      position: relative;
      flex: 1;
      width: 100%;
      min-width: 0;
      margin: 0;
    }

    .select-shell::after {
      content: "";
      position: absolute;
      right: 16px;
      top: 50%;
      width: 8px;
      height: 8px;
      margin-top: -6px;
      border-right: 1.5px solid rgba(255,255,255,0.5);
      border-bottom: 1.5px solid rgba(255,255,255,0.5);
      transform: rotate(45deg);
      pointer-events: none;
    }

    .device-picker,
    .device-select {
      flex: 1;
      width: 100%;
      height: 48px;
      box-sizing: border-box;
      padding: 0 40px 0 4px;
      margin: 0;
      border-radius: 0;
      border: 0;
      color: var(--text);
      outline: none;
      appearance: none;
      background: transparent;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }

    .device-select optgroup {
      background: #141416;
      color: rgba(255,255,255,0.4);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      padding: 4px 0;
    }

    .device-select option {
      background: #1a1a1e;
      color: var(--text);
      font-size: 13px;
      font-weight: 400;
      text-transform: none;
      letter-spacing: 0;
      padding: 6px 10px;
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
      display: flex;
      align-items: center;
      justify-content: center;
      transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1), height 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      will-change: transform;
    }

    .phone-scale,
    .phone-frame-wrapper {
      display: grid;
      place-items: center;
      transform-origin: center center;
      transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      contain: layout style;
    }

    .phone {
      position: relative;
      padding: 15px;
      border-radius: 54px;
      background: linear-gradient(135deg, #2a2a2e 0%, #1c1c1e 40%, #1a1a1c 100%);
      box-shadow:
        0 0 0 0.5px rgba(255,255,255,0.06),
        0 0 0 1px rgba(0, 0, 0, 0.5),
        0 2px 0 0 rgba(255,255,255,0.03) inset,
        0 30px 80px rgba(0,0,0,0.7),
        0 8px 32px rgba(0,0,0,0.4);
      transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      contain: layout style;
    }

    .phone::before {
      content: "";
      position: absolute;
      inset: 8px;
      border-radius: 46px;
      background: #000;
      border: 1px solid rgba(255,255,255,0.03);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.03),
        inset 0 -10px 20px rgba(0,0,0,0.3);
      pointer-events: none;
    }

    .phone.tablet {
      padding: 14px;
      border-radius: 40px;
      box-shadow:
        0 0 0 0.5px rgba(255,255,255,0.06),
        0 0 0 1px rgba(0, 0, 0, 0.5),
        0 2px 0 0 rgba(255,255,255,0.03) inset,
        0 25px 60px rgba(0,0,0,0.6),
        0 6px 24px rgba(0,0,0,0.3);
    }

    .phone.tablet::before {
      inset: 7px;
      border-radius: 32px;
    }

    .hardware-button {
      position: absolute;
      z-index: -1;
      background: linear-gradient(180deg, #343438, #222226);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.08),
        0 2px 6px rgba(0,0,0,0.5);
      opacity: 0.95;
      transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      border: 0.5px solid rgba(0,0,0,0.3);
    }

    .hardware-button.left {
      left: -6px;
      width: 4px;
      border-radius: 3px 0 0 3px;
      border-right: none;
    }

    .hardware-button.right {
      right: -6px;
      width: 4px;
      border-radius: 0 3px 3px 0;
      border-left: none;
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
      border-radius: var(--screen-radius);
      overflow: hidden;
      background: #000;
      isolation: isolate;
      display: flex;
      flex-direction: column;
      transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      contain: layout style;
    }

    .camera {
      position: absolute;
      top: 10px;
      left: 50%;
      z-index: 99999;
      transform: translateX(-50%);
      pointer-events: none;
      transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .camera.island {
      width: 126px;
      height: 37px;
      border-radius: 20px;
      background: linear-gradient(180deg, #0d0d0f 0%, #050507 100%);
      box-shadow: inset 0 0.5px 0 rgba(255,255,255,0.06);
    }

    .camera.island::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 20px;
      transform: translateY(-50%);
      width: 38px;
      height: 7px;
      border-radius: 999px;
      background: rgba(30,30,32,0.95);
    }

    .camera.island::after {
      content: "";
      position: absolute;
      top: 50%;
      right: 24px;
      transform: translateY(-50%);
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 30%, rgba(40,40,50,0.9), rgba(12,12,14,0.96));
      box-shadow: 0 0 0 2.5px rgba(10,10,12,0.5), 0 0 0 4px rgba(6,6,8,0.3);
    }

    .camera.notch {
      width: 176px;
      height: 34px;
      border-radius: 0 0 22px 22px;
      background: #0d0d0f;
    }

    .camera.notch::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 20px;
      transform: translateY(-50%);
      width: 42px;
      height: 8px;
      border-radius: 999px;
      background: rgba(30,30,32,0.95);
    }

    .camera.notch::after {
      content: "";
      position: absolute;
      top: 50%;
      right: 24px;
      transform: translateY(-50%);
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 30%, rgba(40,40,50,0.9), rgba(12,12,14,0.96));
      box-shadow: 0 0 0 2.5px rgba(10,10,12,0.5), 0 0 0 4px rgba(6,6,8,0.3);
    }

    .camera.punch {
      top: 15px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, rgba(66,66,80,0.95), rgba(8,8,10,0.98) 60%);
      box-shadow: 0 0 0 3px rgba(0,0,0,0.45), inset 0 0.5px 0 rgba(255,255,255,0.04);
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
      padding: 0 24px 8px;
      color: white;
      font-size: 12px;
      font-weight: 700;
      z-index: 9999;
      pointer-events: none;
      background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%);
    }

    .status-time {
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.2px;
      font-variant-numeric: tabular-nums;
    }

    .statusbar.right-offset {
      padding-right: 28px;
    }

    .status-icons {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
    }

    .signal-bars {
      display: flex;
      align-items: flex-end;
      gap: 1.5px;
      height: 12px;
    }

    .signal-bar {
      width: 3px;
      background: white;
      border-radius: 1px 1px 0 0;
      opacity: 0.95;
    }

    .signal-bar:nth-child(1) { height: 3px; }
    .signal-bar:nth-child(2) { height: 5px; }
    .signal-bar:nth-child(3) { height: 8px; }
    .signal-bar:nth-child(4) { height: 10px; }

    .wifi-icon {
      position: relative;
      width: 15px;
      height: 11px;
      opacity: 0.92;
    }

    .wifi-icon svg { width: 100%; height: 100%; }

    .battery-icon {
      position: relative;
      width: 25px;
      height: 12px;
      opacity: 0.92;
    }

    .battery-icon svg { width: 100%; height: 100%; }

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
      height: 36px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.15);
      padding: 0 16px;
      font-size: 12px;
      text-align: center;
      color: rgba(255,255,255,0.92);
      outline: none;
      background: rgba(22, 22, 26, 0.82);
      backdrop-filter: blur(24px) saturate(1.4);
      -webkit-backdrop-filter: blur(24px) saturate(1.4);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      letter-spacing: 0.2px;
    }

    .address-bar:focus {
      border-color: rgba(0, 122, 255, 0.5);
      box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
    }

    .address-bar::placeholder {
      color: rgba(255,255,255,0.4);
    }

    .home-indicator {
      position: absolute;
      bottom: 8px;
      left: 50%;
      width: 134px;
      height: 5px;
      transform: translateX(-50%);
      border-radius: 999px;
      background: rgba(255,255,255,0.85);
      z-index: 999999;
      pointer-events: none;
    }

    .home-indicator.hidden {
      display: none;
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 0;
      padding: 0 4px;
      flex-shrink: 0;
    }

    .toolbar-btn {
      width: 36px;
      height: 36px;
      border: none;
      background: transparent;
      color: rgba(255,255,255,0.5);
      cursor: pointer;
      border-radius: 8px;
      display: grid;
      place-items: center;
      transition: all 0.2s ease;
      padding: 0;
      position: relative;
    }

    .toolbar-btn:hover {
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.85);
    }

    .toolbar-btn:active {
      background: rgba(255,255,255,0.12);
      transform: scale(0.92);
    }

    .toolbar-btn.active {
      color: rgba(0, 122, 255, 0.9);
    }

    .toolbar-btn svg {
      width: 18px;
      height: 18px;
    }

    .toolbar-btn .badge {
      position: absolute;
      top: 2px;
      right: 2px;
      font-size: 9px;
      font-weight: 700;
      color: rgba(255,255,255,0.7);
      background: rgba(255,255,255,0.1);
      border-radius: 4px;
      padding: 1px 4px;
      line-height: 1;
    }

    .frame-overlay {
      position: absolute;
      inset: 0;
      z-index: 100000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.55);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      transition: opacity 0.3s ease;
      border-radius: inherit;
    }

    .frame-overlay.hidden {
      opacity: 0;
      pointer-events: none;
    }

    .frame-overlay .spinner {
      width: 28px;
      height: 28px;
      border: 2.5px solid rgba(255,255,255,0.12);
      border-top-color: rgba(255,255,255,0.7);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      margin-bottom: 12px;
    }

    .frame-overlay .icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255,68,68,0.2);
      color: #ff4444;
      display: grid;
      place-items: center;
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 10px;
    }

    .frame-overlay .icon.hidden {
      display: none;
    }

    .frame-overlay .msg {
      color: rgba(255,255,255,0.85);
      font-size: 13px;
      font-weight: 500;
    }

    .frame-overlay .sub {
      color: rgba(255,255,255,0.4);
      font-size: 11px;
      margin-top: 4px;
      max-width: 80%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .qr-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }

    .qr-overlay.open {
      opacity: 1;
      pointer-events: auto;
    }

    .qr-card {
      background: #1a1a1e;
      border-radius: 16px;
      padding: 24px 32px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6);
      border: 1px solid rgba(255,255,255,0.06);
    }

    .qr-card img {
      width: 200px;
      height: 200px;
      border-radius: 8px;
      display: block;
      margin: 0 auto 16px;
    }

    .qr-card .qr-url {
      color: rgba(255,255,255,0.5);
      font-size: 12px;
      max-width: 260px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-bottom: 16px;
    }

    .qr-card .qr-close {
      background: rgba(255,255,255,0.08);
      border: none;
      color: rgba(255,255,255,0.7);
      padding: 8px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s ease;
    }

    .qr-card .qr-note {
      color: rgba(255,255,255,0.3);
      font-size: 11px;
      text-align: center;
      max-width: 240px;
      line-height: 1.4;
      margin: -8px 0 16px;
    }

    .qr-card .qr-close:hover {
      background: rgba(255,255,255,0.14);
      color: white;
    }
  </style>
</head>
<body>
  <header class="toolbar">
    <div class="toolbar-brand">
      <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2.5" />
        <line x1="12" y1="18" x2="12" y2="18" stroke-width="2"/>
      </svg>
      <span>Preview</span>
    </div>
    <div class="select-shell">
      <select id="deviceSelect" class="device-picker device-select">${selectMarkup}</select>
    </div>
    <div class="toolbar-actions">
      <button id="rotateBtn" class="toolbar-btn" title="Rotate">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 4v6h6"/>
          <path d="M3.5 15.5a9 9 0 1 0 2.1-11.2L1 10"/>
        </svg>
      </button>
      <button id="zoomOutBtn" class="toolbar-btn" title="Zoom out">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
          <circle cx="11" cy="11" r="7.5"/>
          <line x1="16.5" y1="16.5" x2="21" y2="21"/>
          <line x1="7.5" y1="11" x2="14.5" y2="11"/>
        </svg>
      </button>
      <span id="zoomLabel" class="badge" style="font-size:10px;font-weight:600;color:rgba(255,255,255,0.4);min-width:28px;text-align:center;padding:0;">1×</span>
      <button id="zoomInBtn" class="toolbar-btn" title="Zoom in">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
          <circle cx="11" cy="11" r="7.5"/>
          <line x1="16.5" y1="16.5" x2="21" y2="21"/>
          <line x1="7.5" y1="11" x2="14.5" y2="11"/>
          <line x1="11" y1="7.5" x2="11" y2="14.5"/>
        </svg>
      </button>
      <button id="qrBtn" class="toolbar-btn" title="QR code">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="8" height="8" rx="1"/>
          <rect x="14" y="2" width="8" height="8" rx="1"/>
          <rect x="2" y="14" width="8" height="8" rx="1"/>
          <line x1="14" y1="14" x2="18" y2="14"/>
          <line x1="14" y1="14" x2="14" y2="18"/>
          <line x1="22" y1="14" x2="22" y2="18"/>
          <line x1="18" y1="22" x2="22" y2="22"/>
          <line x1="22" y1="18" x2="22" y2="22"/>
        </svg>
      </button>
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
                <span class="signal-bars">
                  <span class="signal-bar"></span>
                  <span class="signal-bar"></span>
                  <span class="signal-bar"></span>
                  <span class="signal-bar"></span>
                </span>
                <span class="wifi-icon">
                  <svg viewBox="0 0 18 14" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round">
                    <path d="M1 5.5c4-3.3 12-3.3 16 0" opacity="0.4"/>
                    <path d="M4 8.5c3-2 8-2 11 0" opacity="0.6"/>
                    <path d="M7 11.5c2-1 5-1 7 0"/>
                    <circle cx="9.5" cy="13" r="1" fill="white" stroke="none"/>
                  </svg>
                </span>
                <span class="battery-icon">
                  <svg viewBox="0 0 28 14" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="0.5" y="0.5" width="23" height="13" rx="2.5" opacity="0.95"/>
                    <rect x="24" y="4" width="3" height="6" rx="1" opacity="0.5"/>
                    <rect x="3" y="3" width="14" height="8" rx="1.5" fill="white" opacity="0.95"/>
                  </svg>
                </span>
              </span>
            </div>

            <iframe
              id="previewFrame"
              class="webview-frame"
              src="${safeFrame}"
              title="Mobile Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            ></iframe>

            <div class="address-bar-wrap">
              <input
                id="urlInput"
                class="address-bar"
                value="${safeTarget}"
                spellcheck="false"
                placeholder="Enter URL and press Enter"
              />
            </div>

            <div id="homeIndicator" class="home-indicator"></div>
            <div id="frameOverlay" class="frame-overlay hidden">
              <div id="overlaySpinner" class="spinner"></div>
              <div id="overlayIcon" class="icon hidden">!</div>
              <div id="overlayMsg" class="msg">Loading...</div>
              <div id="overlaySub" class="sub"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <div id="qrOverlay" class="qr-overlay">
    <div class="qr-card">
      <img id="qrImage" alt="QR Code" />
      <div id="qrUrl" class="qr-url"></div>
      <div class="qr-note">Phone &amp; laptop must be on the same Wi‑Fi network</div>
      <button id="qrClose" class="qr-close">Close</button>
    </div>
  </div>

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
    const screenShell = document.getElementById("screenShell");
    const camera = document.getElementById("camera");
    const statusbar = document.getElementById("statusbar");
    const homeIndicator = document.getElementById("homeIndicator");
    const volumeUp = document.getElementById("volumeUp");
    const volumeDown = document.getElementById("volumeDown");
    const powerButton = document.getElementById("powerButton");
    const iframe = document.getElementById("previewFrame");
    const rotateBtn = document.getElementById("rotateBtn");
    const zoomInBtn = document.getElementById("zoomInBtn");
    const zoomOutBtn = document.getElementById("zoomOutBtn");
    const zoomLabel = document.getElementById("zoomLabel");
    const qrBtn = document.getElementById("qrBtn");
    const qrOverlay = document.getElementById("qrOverlay");
    const qrImage = document.getElementById("qrImage");
    const qrUrl = document.getElementById("qrUrl");
    const qrClose = document.getElementById("qrClose");
    const frameOverlay = document.getElementById("frameOverlay");
    const overlaySpinner = document.getElementById("overlaySpinner");
    const overlayIcon = document.getElementById("overlayIcon");
    const overlayMsg = document.getElementById("overlayMsg");
    const overlaySub = document.getElementById("overlaySub");
    const LOCAL_IP = "${safeIp}";
    urlInput.dataset.fullUrl = "${safeJsUrl}";

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
        return parsed.host || normalized.replace(/^https?:\\/\\//i, "");
      } catch {
        return normalized.replace(/^https?:\\/\\//i, "");
      }
    }

    const devices = new Map();
    catalog.forEach((group) => group.devices.forEach((item) => devices.set(item.id, item)));

    let currentDeviceId = "iphone-15";
    let isLandscape = false;
    let currentZoom = 1;
    deviceSelect.value = currentDeviceId;

    function normalizeUrl(value) {
      const input = String(value || "").trim();
      if (!input) return "${safeJsUrl}";
      if (/^\\d+$/.test(input)) return "http://localhost:" + input;
      if (/^:\\d+$/.test(input)) return "http://localhost" + input;
      if (!/^https?:\\/\\//i.test(input)) return "http://" + input;
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

      return {
        outerWidth: definition.width + bezel * 2 + sideAllowance,
        outerHeight: definition.height + topInset + bottomInset,
        screenRadius: isTablet ? 28 : (isIOS ? 42 : 32),
        frameRadius: isTablet ? 38 : (isIOS ? 52 : 40),
        statusPadTop: isTablet ? 16 : (chromeType === "notch" ? 18 : 19),
        cameraWidth: chromeType === "island" ? 126 : 176,
        cameraHeight: chromeType === "island" ? 37 : 32
      };
    }

    function setOverlay(state, url) {
      if (state === "loading") {
        frameOverlay.classList.remove("hidden");
        overlaySpinner.classList.remove("hidden");
        overlayIcon.classList.add("hidden");
        overlayMsg.textContent = "Loading...";
        overlaySub.textContent = url || "";
      } else if (state === "error") {
        frameOverlay.classList.remove("hidden");
        overlaySpinner.classList.add("hidden");
        overlayIcon.classList.remove("hidden");
        overlayMsg.textContent = "Unable to connect";
        overlaySub.textContent = url || "";
      } else {
        frameOverlay.classList.add("hidden");
      }
    }

    function scaleFrame() {
      if (!previewArea || !phoneScale) return;

      const rect = previewArea.getBoundingClientRect();
      const availW = Math.max(0, rect.width - 32);
      const availH = Math.max(0, rect.height - 32);
      const frameW = phoneScale.offsetWidth;
      const frameH = phoneScale.offsetHeight;
      if (!frameW || !frameH) return;
      const scaleX = availW / frameW;
      const scaleY = availH / frameH;
      const scale = Math.min(scaleX, scaleY, 1) * currentZoom;

      phoneScale.style.transform = "scale(" + Math.max(scale, 0).toFixed(4) + ")";
    }

    function renderDevice() {
      const definition = devices.get(currentDeviceId) || devices.get("iphone-15");
      const metrics = getDeviceMetrics(definition);
      const chromeType = getChromeType(definition);
      const isTablet = definition.family === "tablet";
      const padding = isTablet ? 14 : 15;
      const border = 1;
      const screenW = isLandscape ? definition.height : definition.width;
      const screenH = isLandscape ? definition.width : definition.height;
      const outerW = isLandscape ? metrics.outerHeight : metrics.outerWidth;
      const outerH = isLandscape ? metrics.outerWidth : metrics.outerHeight;
      const phoneW = screenW + padding * 2 + border * 2;
      const phoneH = screenH + padding * 2 + border * 2;

      root.style.setProperty("--screen-width", screenW + "px");
      root.style.setProperty("--screen-height", screenH + "px");
      root.style.setProperty("--outer-width", outerW + "px");
      root.style.setProperty("--outer-height", outerH + "px");
      root.style.setProperty("--screen-radius", metrics.screenRadius + "px");
      root.style.setProperty("--frame-radius", metrics.frameRadius + "px");
      root.style.setProperty("--status-pad-top", metrics.statusPadTop + "px");
      root.style.setProperty("--camera-width", metrics.cameraWidth + "px");
      root.style.setProperty("--camera-height", metrics.cameraHeight + "px");

      phoneViewport.style.width = outerW + "px";
      phoneViewport.style.height = outerH + "px";
      phoneScale.style.width = outerW + "px";
      phoneScale.style.height = outerH + "px";
      phone.style.width = phoneW + "px";
      phone.style.height = phoneH + "px";
      screenShell.style.width = screenW + "px";
      screenShell.style.height = screenH + "px";

      phone.classList.toggle("tablet", isTablet);
      camera.className = "camera " + chromeType;
      statusbar.classList.toggle("right-offset", chromeType === "island");
      homeIndicator.classList.toggle("hidden", isTablet);
      volumeUp.classList.toggle("hidden", isTablet);
      volumeDown.classList.toggle("hidden", isTablet);
      powerButton.classList.toggle("hidden", isTablet);
      rotateBtn.classList.toggle("active", isLandscape);

      requestAnimationFrame(scaleFrame);
    }

    function submitUrl(url) {
      const normalized = normalizeUrl(url);
      urlInput.dataset.fullUrl = normalized;
      urlInput.value = getUrlDisplayValue(normalized);
      iframe.src = normalized;
      setOverlay("loading", normalized);
      vscode.postMessage({ command: "loadUrl", url: normalized });
    }

    function submit() { submitUrl(urlInput.value); }

    iframe.addEventListener("load", () => {
      setOverlay("hide");
    });

    iframe.addEventListener("error", () => {
      setOverlay("error", iframe.src);
    });

    deviceSelect.addEventListener("change", () => {
      currentDeviceId = deviceSelect.value;
      isLandscape = false;
      currentZoom = 1;
      zoomLabel.textContent = "1×";
      renderDevice();
    });

    rotateBtn.addEventListener("click", () => {
      isLandscape = !isLandscape;
      renderDevice();
    });

    zoomInBtn.addEventListener("click", () => {
      currentZoom = Math.min(currentZoom + 0.25, 3);
      zoomLabel.textContent = currentZoom.toFixed(2).replace(/\.?0+$/, "") + "×";
      scaleFrame();
    });

    zoomOutBtn.addEventListener("click", () => {
      currentZoom = Math.max(currentZoom - 0.25, 0.25);
      zoomLabel.textContent = currentZoom.toFixed(2).replace(/\.?0+$/, "") + "×";
      scaleFrame();
    });

    function qrUrlForNetwork(url) {
      if (LOCAL_IP && LOCAL_IP !== "localhost") {
        return url
          .replace(/^https?:\\/\\/(localhost|127\\.0\\.0\\.1)(:\\d+)?/i, "http://" + LOCAL_IP + "$2");
      }
      return url;
    }

    qrBtn.addEventListener("click", () => {
      const url = qrUrlForNetwork(urlInput.dataset.fullUrl || normalizeUrl(urlInput.value));
      qrImage.src = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodeURIComponent(url);
      qrUrl.textContent = getUrlDisplayValue(url);
      qrOverlay.classList.add("open");
    });

    qrClose.addEventListener("click", () => {
      qrOverlay.classList.remove("open");
    });

    qrOverlay.addEventListener("click", (e) => {
      if (e.target === qrOverlay) qrOverlay.classList.remove("open");
    });

    urlInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") submit();
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

    let resizeTimer;
    window.addEventListener("resize", () => {
      if (resizeTimer) cancelAnimationFrame(resizeTimer);
      resizeTimer = requestAnimationFrame(scaleFrame);
    });

    urlInput.value = getUrlDisplayValue(urlInput.dataset.fullUrl);
    setOverlay("loading", urlInput.dataset.fullUrl);
    renderDevice();
  </script>
</body>
</html>`;
}

module.exports = { getHtml };
