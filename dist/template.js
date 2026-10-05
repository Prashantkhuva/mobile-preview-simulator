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
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; frame-src http: https:; img-src https: data:; connect-src http: https:;" />
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
      height: 100%;
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
      position: fixed;
      left: 12px;
      right: 12px;
      bottom: 10px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0;
      border-radius: 999px;
      z-index: 50;
      pointer-events: none;
    }

    .address-bar-wrap.open {
      padding: 6px;
      background: rgba(14, 14, 16, 0.88);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow:
        0 0 0 1px rgba(255,255,255,0.08),
        0 8px 32px rgba(0,0,0,0.55);
      pointer-events: auto;
    }

    .address-bar {
      display: none;
      flex: 1;
      width: auto;
      min-width: 0;
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

    .address-bar-wrap.open .address-bar {
      display: block;
    }

    .url-toggle {
      margin-left: auto;
      pointer-events: auto;
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      padding: 0;
      border: none;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: rgba(14, 14, 16, 0.92);
      box-shadow:
        0 0 0 1px rgba(255,255,255,0.08),
        0 4px 16px rgba(0,0,0,0.5);
      color: rgba(255,255,255,0.65);
      cursor: pointer;
      transition: all 0.2s ease;
      z-index: 51;
    }

    .url-toggle:hover {
      background: rgba(30, 30, 34, 0.95);
      color: rgba(255,255,255,0.9);
    }

    .url-toggle svg {
      width: 18px;
      height: 18px;
    }

    .address-bar-wrap.open .url-toggle {
      background: transparent;
      box-shadow: none;
    }

    .address-bar-wrap.open .url-toggle:hover {
      background: rgba(255,255,255,0.08);
    }

    .history-btn {
      display: none;
      pointer-events: auto;
      width: 32px;
      height: 32px;
      flex-shrink: 0;
      padding: 0;
      border: none;
      border-radius: 50%;
      place-items: center;
      background: transparent;
      color: rgba(255,255,255,0.55);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .address-bar-wrap.open .history-btn {
      display: grid;
    }

    .history-btn:hover {
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.9);
    }

    .history-btn svg {
      width: 16px;
      height: 16px;
    }

    .history-list {
      position: absolute;
      left: 0;
      right: 0;
      bottom: calc(100% + 8px);
      box-sizing: border-box;
      max-height: 210px;
      overflow-y: auto;
      padding: 6px;
      border-radius: 14px;
      background: rgba(14, 14, 16, 0.94);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow:
        0 0 0 1px rgba(255,255,255,0.08),
        0 12px 40px rgba(0,0,0,0.6);
      display: flex;
      flex-direction: column;
      gap: 2px;
      z-index: 60;
    }

    .history-list.hidden {
      display: none;
    }

    .address-bar-wrap:not(.open) .history-list {
      display: none;
    }

    .history-item {
      width: 100%;
      box-sizing: border-box;
      text-align: left;
      padding: 8px 12px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: rgba(255,255,255,0.75);
      font: 12px/1.3 ui-monospace, "Cascadia Mono", Consolas, monospace;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: background 0.15s ease;
    }

    .history-item:hover {
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.95);
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

    .frame-overlay .spinner.hidden,
    .frame-overlay .hint.hidden,
    .frame-overlay .overlay-retry.hidden,
    .frame-overlay .overlay-open.hidden {
      display: none;
    }

    .frame-overlay .hint {
      color: rgba(255,255,255,0.45);
      font-size: 11px;
      text-align: center;
      max-width: 82%;
      line-height: 1.5;
      margin-top: 6px;
    }

    .frame-overlay .overlay-retry {
      margin-top: 14px;
      padding: 7px 22px;
      border: none;
      border-radius: 8px;
      background: rgba(0, 122, 255, 0.92);
      color: white;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .frame-overlay .overlay-retry:hover {
      background: rgba(0, 122, 255, 1);
      box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
    }

    .frame-overlay .overlay-retry:active {
      transform: scale(0.96);
    }

    .frame-overlay .overlay-open {
      margin-top: 8px;
      padding: 7px 22px;
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 8px;
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.85);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .frame-overlay .overlay-open:hover {
      background: rgba(255,255,255,0.12);
      border-color: rgba(255,255,255,0.35);
    }

    .frame-overlay .overlay-open:active {
      transform: scale(0.96);
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
      padding: 16px;
      background: radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.78) 100%);
      backdrop-filter: blur(16px) saturate(0.9);
      -webkit-backdrop-filter: blur(16px) saturate(0.9);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }

    .qr-overlay.open {
      opacity: 1;
      pointer-events: auto;
    }

    .qr-card {
      position: relative;
      width: 100%;
      max-width: 304px;
      box-sizing: border-box;
      background: linear-gradient(180deg, #1d1d22 0%, #151518 100%);
      border-radius: 20px;
      padding: 28px 24px 24px;
      text-align: center;
      border: 1px solid rgba(255,255,255,0.07);
      box-shadow:
        0 0 0 1px rgba(0,0,0,0.5),
        0 24px 80px rgba(0,0,0,0.7),
        inset 0 1px 0 rgba(255,255,255,0.06);
      transform: translateY(10px) scale(0.97);
      transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .qr-overlay.open .qr-card {
      transform: none;
    }

    .qr-close {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 32px;
      height: 32px;
      padding: 0;
      border: none;
      border-radius: 8px;
      display: grid;
      place-items: center;
      background: transparent;
      color: rgba(255,255,255,0.45);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .qr-close:hover {
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.9);
    }

    .qr-close:active {
      background: rgba(255,255,255,0.12);
    }

    .qr-close:focus-visible {
      outline: 2px solid rgba(0, 122, 255, 0.75);
      outline-offset: 2px;
    }

    .qr-close svg {
      width: 16px;
      height: 16px;
    }

    .qr-head {
      margin-bottom: 18px;
    }

    .qr-icon {
      width: 38px;
      height: 38px;
      margin: 0 auto 12px;
      border-radius: 11px;
      display: grid;
      place-items: center;
      background: rgba(0, 122, 255, 0.14);
      border: 1px solid rgba(0, 122, 255, 0.28);
      color: rgba(130, 185, 255, 0.95);
    }

    .qr-icon svg {
      width: 20px;
      height: 20px;
    }

    .qr-title {
      font-size: 15px;
      font-weight: 600;
      letter-spacing: -0.01em;
      color: rgba(255,255,255,0.92);
    }

    .qr-plate {
      width: min(232px, 100%);
      aspect-ratio: 1;
      box-sizing: border-box;
      margin: 0 auto 16px;
      padding: 16px;
      background: #ffffff;
      border-radius: 16px;
      display: grid;
      place-items: center;
      box-shadow:
        0 4px 20px rgba(0,0,0,0.4),
        inset 0 0 0 1px rgba(0,0,0,0.05);
    }

    .qr-plate img {
      width: 100%;
      height: 100%;
      display: block;
      image-rendering: pixelated;
    }

    .qr-url {
      font: 500 11px/1.3 ui-monospace, "Cascadia Mono", Consolas, monospace;
      color: rgba(255,255,255,0.75);
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 999px;
      padding: 6px 14px;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-bottom: 14px;
    }

    .qr-note {
      color: rgba(255,255,255,0.32);
      font-size: 11px;
      text-align: center;
      max-width: 240px;
      line-height: 1.5;
      margin: 0 auto;
    }

    @media (max-width: 440px) {
      .toolbar-brand {
        display: none;
      }

      .toolbar-actions {
        padding: 0 2px;
      }

      .toolbar-btn {
        width: 28px;
        height: 28px;
      }

      .toolbar-btn svg {
        width: 16px;
        height: 16px;
      }

      .device-picker,
      .device-select {
        height: 40px;
        padding: 0 24px 0 6px;
        font-size: 12px;
      }

      .select-shell::after {
        right: 8px;
      }

      #zoomLabel {
        min-width: 20px !important;
        font-size: 9px !important;
        padding: 0 !important;
      }
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
      <button id="reloadBtn" class="toolbar-btn" title="Reload (Ctrl+R)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 4v6h-6"/>
          <path d="M1 20v-6h6"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/>
          <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
      </button>
      <button id="rotateBtn" class="toolbar-btn" title="Rotate (R)">
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
      <button id="autoRefreshBtn" class="toolbar-btn" title="Auto-refresh on save">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="17 1 21 5 17 9"/>
          <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
          <polyline points="7 23 3 19 7 15"/>
          <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
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

  <div id="urlBar" class="address-bar-wrap">
    <div id="historyList" class="history-list hidden"></div>
    <input
      id="urlInput"
      class="address-bar"
      value="${safeTarget}"
      spellcheck="false"
      placeholder="Enter URL and press Enter"
    />
    <button id="historyBtn" class="history-btn" type="button" title="Recent URLs" aria-label="Recent URLs">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15"/>
      </svg>
    </button>
    <button id="urlToggle" class="url-toggle" type="button" title="" aria-label="Show URL bar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    </button>
  </div>

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

            <div id="homeIndicator" class="home-indicator"></div>
            <div id="frameOverlay" class="frame-overlay hidden">
              <div id="overlaySpinner" class="spinner"></div>
              <div id="overlayIcon" class="icon hidden">!</div>
              <div id="overlayMsg" class="msg">Loading...</div>
              <div id="overlaySub" class="sub"></div>
              <div id="overlayHint" class="hint hidden">Start your dev server, then reload.</div>
              <button id="overlayRetry" class="overlay-retry hidden" type="button">Reload</button>
              <button id="overlayOpen" class="overlay-open hidden" type="button">Open in Browser</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <div id="qrOverlay" class="qr-overlay">
    <div class="qr-card" role="dialog" aria-modal="true" aria-label="Scan QR code">
      <button id="qrClose" class="qr-close" type="button" aria-label="Close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div class="qr-head">
        <div class="qr-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5"/>
            <line x1="14" y1="14" x2="17.5" y2="14"/>
            <line x1="21" y1="14" x2="21" y2="17.5"/>
            <line x1="14" y1="17.5" x2="14" y2="21"/>
            <line x1="17.5" y1="21" x2="21" y2="21"/>
            <line x1="21" y1="18" x2="21" y2="18" stroke-width="2.5"/>
          </svg>
        </div>
        <div class="qr-title">Scan to open on your phone</div>
      </div>
      <div class="qr-plate">
        <img id="qrImage" alt="QR code" />
      </div>
      <div id="qrUrl" class="qr-url"></div>
      <div class="qr-note">Phone &amp; laptop must be on the same Wi‑Fi network</div>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    const saved = vscode.getState() || {};
    const catalog = ${catalogJson};
    const root = document.documentElement;
    const urlInput = document.getElementById("urlInput");
    const urlBar = document.getElementById("urlBar");
    const urlToggle = document.getElementById("urlToggle");
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
    const reloadBtn = document.getElementById("reloadBtn");
    const autoRefreshBtn = document.getElementById("autoRefreshBtn");
    const historyBtn = document.getElementById("historyBtn");
    const historyList = document.getElementById("historyList");
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
    const overlayHint = document.getElementById("overlayHint");
    const overlayRetry = document.getElementById("overlayRetry");
    const overlayOpen = document.getElementById("overlayOpen");
    const LOCAL_IP = "${safeIp}";
    urlInput.dataset.fullUrl = "${safeJsUrl}";
    urlToggle.title = urlInput.dataset.fullUrl;

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

    let currentDeviceId = saved.deviceId || "iphone-15";
    let isLandscape = !!saved.landscape;
    let currentZoom = typeof saved.zoom === "number" ? saved.zoom : 1;
    let autoRefresh = !!saved.autoRefresh;
    let urlHistory = Array.isArray(saved.history) ? saved.history.slice(0, 10) : [];
    deviceSelect.value = currentDeviceId;

    function fmtZoom(value) {
      return value.toFixed(2).replace(/\\.?0+$/, "") + "\\u00d7";
    }

    function saveState() {
      vscode.setState({
        url: urlInput.dataset.fullUrl,
        deviceId: currentDeviceId,
        landscape: isLandscape,
        zoom: currentZoom,
        autoRefresh: autoRefresh,
        history: urlHistory,
      });
    }

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
        overlayHint.classList.add("hidden");
        overlayRetry.classList.add("hidden");
        overlayOpen.classList.add("hidden");
        overlayMsg.textContent = "Loading...";
        overlaySub.textContent = url || "";
      } else if (state === "error") {
        frameOverlay.classList.remove("hidden");
        overlaySpinner.classList.add("hidden");
        overlayIcon.classList.remove("hidden");
        overlayHint.classList.remove("hidden");
        overlayRetry.classList.remove("hidden");
        overlayOpen.classList.add("hidden");
        overlayMsg.textContent = "Server not reachable";
        overlaySub.textContent = url || "";
        overlayHint.textContent = "Start your dev server, then reload.";
      } else if (state === "blocked") {
        frameOverlay.classList.remove("hidden");
        overlaySpinner.classList.add("hidden");
        overlayIcon.classList.remove("hidden");
        overlayHint.classList.remove("hidden");
        overlayRetry.classList.remove("hidden");
        overlayOpen.classList.remove("hidden");
        overlayMsg.textContent = "Site blocks embedding";
        overlaySub.textContent = url || "";
        overlayHint.textContent =
          "The server sends X-Frame-Options or frame-ancestors headers that forbid showing it inside an iframe.";
      } else {
        frameOverlay.classList.add("hidden");
      }
    }

    function scaleFrame() {
      if (!previewArea || !phoneScale) return;

      const rect = previewArea.getBoundingClientRect();
      const visW = Math.min(rect.width, document.documentElement.clientWidth);
      const availW = Math.max(0, visW - 32);
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
      urlToggle.title = normalized;
      iframe.src = normalized;
      setOverlay("loading", normalized);
      pushHistory(normalized);
      saveState();
      vscode.postMessage({ command: "loadUrl", url: normalized });
    }

    function submit() { submitUrl(urlInput.value); }

    function reloadFrame() {
      const url = urlInput.dataset.fullUrl || normalizeUrl(urlInput.value);
      setOverlay("loading", url);
      iframe.src = url;
    }

    function openUrlBar() {
      urlBar.classList.add("open");
      urlInput.focus();
    }

    function pushHistory(url) {
      urlHistory = [url, ...urlHistory.filter((item) => item !== url)].slice(0, 10);
      renderHistory();
    }

    function renderHistory() {
      historyList.textContent = "";
      urlHistory.forEach((item) => {
        const entry = document.createElement("button");
        entry.type = "button";
        entry.className = "history-item";
        entry.textContent = item;
        entry.addEventListener("click", () => {
          historyList.classList.add("hidden");
          submitUrl(item);
          urlBar.classList.remove("open");
        });
        historyList.appendChild(entry);
      });
      if (urlHistory.length === 0) historyList.classList.add("hidden");
    }

    let probeToken = 0;

    window.addEventListener("message", (event) => {
      const message = event.data;
      if (!message) return;
      if (message.command === "reload") {
        if (autoRefresh) reloadFrame();
        return;
      }
      if (message.command === "probeResult") {
        if (message.token !== probeToken) return;
        if (!message.ok) setOverlay("error", message.url);
        else if (message.frameBlocked) setOverlay("blocked", message.url);
        else setOverlay("hide");
        return;
      }
      if (message.command !== "setUrl") return;
      const normalized = normalizeUrl(message.url || "");
      if (!normalized || normalized === urlInput.dataset.fullUrl) return;
      urlInput.dataset.fullUrl = normalized;
      urlInput.value = getUrlDisplayValue(normalized);
      urlToggle.title = normalized;
      iframe.src = normalized;
      setOverlay("loading", normalized);
      pushHistory(normalized);
      saveState();
    });

    iframe.addEventListener("load", () => {
      const token = ++probeToken;
      vscode.postMessage({
        command: "probe",
        url: urlInput.dataset.fullUrl,
        token,
      });
    });

    iframe.addEventListener("error", () => {
      setOverlay("error", urlInput.dataset.fullUrl);
    });

    overlayOpen.addEventListener("click", () => {
      vscode.postMessage({
        command: "openExternal",
        url: urlInput.dataset.fullUrl,
      });
    });

    overlayRetry.addEventListener("click", () => {
      submitUrl(urlInput.dataset.fullUrl);
    });

    deviceSelect.addEventListener("change", () => {
      currentDeviceId = deviceSelect.value;
      isLandscape = false;
      currentZoom = 1;
      zoomLabel.textContent = fmtZoom(currentZoom);
      renderDevice();
      saveState();
    });

    rotateBtn.addEventListener("click", () => {
      isLandscape = !isLandscape;
      renderDevice();
      saveState();
    });

    reloadBtn.addEventListener("click", () => {
      reloadFrame();
    });

    autoRefreshBtn.addEventListener("click", () => {
      autoRefresh = !autoRefresh;
      autoRefreshBtn.classList.toggle("active", autoRefresh);
      autoRefreshBtn.title = autoRefresh
        ? "Auto-refresh on save (on)"
        : "Auto-refresh on save (off)";
      saveState();
    });

    historyBtn.addEventListener("click", () => {
      historyList.classList.toggle("hidden");
    });

    zoomInBtn.addEventListener("click", () => {
      currentZoom = Math.min(currentZoom + 0.25, 3);
      zoomLabel.textContent = fmtZoom(currentZoom);
      scaleFrame();
      saveState();
    });

    zoomOutBtn.addEventListener("click", () => {
      currentZoom = Math.max(currentZoom - 0.25, 0.25);
      zoomLabel.textContent = fmtZoom(currentZoom);
      scaleFrame();
      saveState();
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
      qrClose.focus();
    });

    function closeQr() {
      qrOverlay.classList.remove("open");
      qrBtn.focus();
    }

    qrClose.addEventListener("click", closeQr);

    qrOverlay.addEventListener("click", (e) => {
      if (e.target === qrOverlay) closeQr();
    });

    document.addEventListener("keydown", (event) => {
      const target = event.target;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);
      const mod = event.ctrlKey || event.metaKey;

      if (event.key === "Escape") {
        if (qrOverlay.classList.contains("open")) {
          closeQr();
          return;
        }
        if (
          urlBar.classList.contains("open") &&
          !historyList.classList.contains("hidden")
        ) {
          historyList.classList.add("hidden");
          return;
        }
        if (urlBar.classList.contains("open")) {
          urlBar.classList.remove("open");
          urlInput.blur();
        }
        return;
      }

      if (typing) return;

      if (mod && (event.key === "r" || event.key === "R")) {
        event.preventDefault();
        reloadFrame();
        return;
      }
      if (mod && (event.key === "l" || event.key === "L")) {
        event.preventDefault();
        openUrlBar();
        return;
      }
      if (mod) return;

      if (event.key === "r" || event.key === "R") {
        rotateBtn.click();
        return;
      }
      if (event.key === "+" || event.key === "=") {
        zoomInBtn.click();
        return;
      }
      if (event.key === "-" || event.key === "_") {
        zoomOutBtn.click();
      }
    });

    urlToggle.addEventListener("click", () => {
      const open = urlBar.classList.toggle("open");
      if (open) urlInput.focus();
      else historyList.classList.add("hidden");
    });

    urlInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") submit();
      if (event.key === "Escape") {
        urlBar.classList.remove("open");
        urlInput.blur();
      }
    });

    urlInput.addEventListener("focus", () => {
      urlInput.value = urlInput.dataset.fullUrl || normalizeUrl(urlInput.value);
      requestAnimationFrame(() => urlInput.select());
    });

    urlInput.addEventListener("blur", (event) => {
      const fullUrl = normalizeUrl(urlInput.dataset.fullUrl || urlInput.value);
      urlInput.dataset.fullUrl = fullUrl;
      urlInput.value = getUrlDisplayValue(fullUrl);
      if (!event.relatedTarget || !urlBar.contains(event.relatedTarget)) {
        urlBar.classList.remove("open");
      }
    });

    let resizeTimer;
    window.addEventListener("resize", () => {
      if (resizeTimer) cancelAnimationFrame(resizeTimer);
      resizeTimer = requestAnimationFrame(scaleFrame);
    });

    urlInput.value = getUrlDisplayValue(urlInput.dataset.fullUrl);
    zoomLabel.textContent = fmtZoom(currentZoom);
    autoRefreshBtn.classList.toggle("active", autoRefresh);
    if (autoRefresh) autoRefreshBtn.title = "Auto-refresh on save (on)";
    renderHistory();
    if (saved.url && saved.url !== urlInput.dataset.fullUrl) {
      submitUrl(saved.url);
    } else {
      setOverlay("loading", urlInput.dataset.fullUrl);
    }
    renderDevice();
    saveState();
  </script>
</body>
</html>`;
}

module.exports = { getHtml };
