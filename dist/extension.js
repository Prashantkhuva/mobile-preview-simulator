"use strict";

const vscode = require("vscode");

const COMMAND = "mobile-preview-simulator.openPreview";
const VIEW_TYPE = "mobilePreviewSimulator";
const DEFAULT_URL = "http://localhost:5173";

const DEVICE_GROUPS = [
  {
    group: "Apple",
    devices: [
      {
        id: "iphone-11",
        name: "iPhone 11",
        width: 390,
        height: 844,
        family: "phone",
        os: "ios",
        chrome: "notch",
      },
      {
        id: "iphone-12-mini",
        name: "iPhone 12 Mini",
        width: 360,
        height: 780,
        family: "phone",
        os: "ios",
        chrome: "notch",
      },
      {
        id: "iphone-13-pro",
        name: "iPhone 13 Pro",
        width: 390,
        height: 844,
        family: "phone",
        os: "ios",
        chrome: "notch",
      },
      {
        id: "iphone-14-pro",
        name: "iPhone 14 Pro",
        width: 393,
        height: 852,
        family: "phone",
        os: "ios",
        chrome: "island",
      },
      {
        id: "iphone-15",
        name: "iPhone 15",
        width: 393,
        height: 852,
        family: "phone",
        os: "ios",
        chrome: "island",
      },
      {
        id: "iphone-15-pro-max",
        name: "iPhone 15 Pro Max",
        width: 430,
        height: 932,
        family: "phone",
        os: "ios",
        chrome: "island",
      },
      {
        id: "iphone-16",
        name: "iPhone 16",
        width: 393,
        height: 852,
        family: "phone",
        os: "ios",
        chrome: "island",
      },
      {
        id: "iphone-16-pro",
        name: "iPhone 16 Pro",
        width: 402,
        height: 874,
        family: "phone",
        os: "ios",
        chrome: "island",
      },
      {
        id: "iphone-16-pro-max",
        name: "iPhone 16 Pro Max",
        width: 440,
        height: 956,
        family: "phone",
        os: "ios",
        chrome: "island",
      },
      {
        id: "iphone-17",
        name: "iPhone 17",
        width: 393,
        height: 852,
        family: "phone",
        os: "ios",
        chrome: "island",
      },
      {
        id: "iphone-17-pro",
        name: "iPhone 17 Pro",
        width: 402,
        height: 874,
        family: "phone",
        os: "ios",
        chrome: "island",
      },
      {
        id: "iphone-17-pro-max",
        name: "iPhone 17 Pro Max",
        width: 440,
        height: 956,
        family: "phone",
        os: "ios",
        chrome: "island",
      },
      {
        id: "iphone-air",
        name: "iPhone Air",
        width: 393,
        height: 852,
        family: "phone",
        os: "ios",
        chrome: "island",
      },
      {
        id: "ipad-pro-11",
        name: "iPad Pro 11",
        width: 834,
        height: 1194,
        family: "tablet",
        os: "ios",
        chrome: "tablet",
      },
      {
        id: "ipad-air",
        name: "iPad Air",
        width: 820,
        height: 1180,
        family: "tablet",
        os: "ios",
        chrome: "tablet",
      },
      {
        id: "ipad-mini",
        name: "iPad Mini",
        width: 768,
        height: 1024,
        family: "tablet",
        os: "ios",
        chrome: "tablet",
      },
    ],
  },
  {
    group: "Samsung",
    devices: [
      {
        id: "galaxy-s25",
        name: "Samsung Galaxy S25",
        width: 384,
        height: 854,
        family: "phone",
        os: "android",
        chrome: "punch",
      },
      {
        id: "galaxy-s25-ultra",
        name: "Samsung Galaxy S25 Ultra",
        width: 384,
        height: 924,
        family: "phone",
        os: "android",
        chrome: "punch",
      },
      {
        id: "galaxy-s23",
        name: "Samsung Galaxy S23",
        width: 384,
        height: 854,
        family: "phone",
        os: "android",
        chrome: "punch",
      },
      {
        id: "galaxy-tab-s8",
        name: "Samsung Galaxy Tab S8",
        width: 753,
        height: 1037,
        family: "tablet",
        os: "android",
        chrome: "tablet",
      },
    ],
  },
  {
    group: "Google",
    devices: [
      {
        id: "pixel-9",
        name: "Google Pixel 9",
        width: 412,
        height: 915,
        family: "phone",
        os: "android",
        chrome: "punch",
      },
      {
        id: "pixel-9-pro",
        name: "Google Pixel 9 Pro",
        width: 412,
        height: 915,
        family: "phone",
        os: "android",
        chrome: "punch",
      },
      {
        id: "pixel-7",
        name: "Google Pixel 7",
        width: 412,
        height: 915,
        family: "phone",
        os: "android",
        chrome: "punch",
      },
      {
        id: "pixel-tablet",
        name: "Google Pixel Tablet",
        width: 834,
        height: 1194,
        family: "tablet",
        os: "android",
        chrome: "tablet",
      },
    ],
  },
  {
    group: "OnePlus",
    devices: [
      {
        id: "oneplus-10-pro",
        name: "OnePlus 10 Pro",
        width: 412,
        height: 919,
        family: "phone",
        os: "android",
        chrome: "punch",
      },
    ],
  },
  {
    group: "Xiaomi",
    devices: [
      {
        id: "xiaomi-15",
        name: "Xiaomi 15",
        width: 393,
        height: 852,
        family: "phone",
        os: "android",
        chrome: "punch",
      },
      {
        id: "xiaomi-15-pro",
        name: "Xiaomi 15 Pro",
        width: 402,
        height: 874,
        family: "phone",
        os: "android",
        chrome: "punch",
      },
      {
        id: "xiaomi-13",
        name: "Xiaomi 13",
        width: 393,
        height: 852,
        family: "phone",
        os: "android",
        chrome: "punch",
      },
    ],
  },
];

let currentPanel;
let currentState = { url: DEFAULT_URL };

function activate(context) {
  const openPreviewCommand = vscode.commands.registerCommand(COMMAND, async () => {
      if (currentPanel) {
        currentPanel.reveal(vscode.ViewColumn.Beside);
        return;
      }

      const panel = vscode.window.createWebviewPanel(
        VIEW_TYPE,
        "Open Preview",
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        },
      );

      currentPanel = panel;
      panel.iconPath = {
        light: vscode.Uri.joinPath(context.extensionUri, "images", "icon.svg"),
        dark: vscode.Uri.joinPath(context.extensionUri, "images", "icon-dark.svg"),
      };

      const render = async (targetUrl) => {
        const normalized = normalizeUrl(targetUrl);
        const externalUri = await vscode.env.asExternalUri(
          vscode.Uri.parse(normalized),
        );
        currentState.url = normalized;
        panel.webview.html = getHtml(normalized, externalUri.toString());
      };

      await render(currentState.url);

      panel.onDidDispose(() => {
        currentPanel = undefined;
      });

      panel.webview.onDidReceiveMessage(async (message) => {
        if (!message || message.command !== "loadUrl") {
          return;
        }

        try {
          await render(message.url || currentState.url);
        } catch (error) {
          const text = error instanceof Error ? error.message : String(error);
          void vscode.window.showErrorMessage(
            `Open Preview: ${text}`,
          );
        }
      });
    });

  const previewViewProvider = vscode.window.registerWebviewViewProvider(
    "mobile-preview-view",
    {
      resolveWebviewView(webviewView) {
        void vscode.commands.executeCommand(
          "mobile-preview-simulator.openPreview",
        );
        webviewView.webview.html = `
        <html>
          <body style="
            background: #0a0a0a; 
            display:flex; 
            align-items:center; 
            justify-content:center;
            height:100vh;
            color: rgba(255,255,255,0.4);
            font-family: sans-serif;
            font-size: 12px;
            text-align: center;
            padding: 16px;
          ">
            <p>Mobile Preview opened in side panel →</p>
          </body>
        </html>
      `;
      },
    },
  );

  context.subscriptions.push(openPreviewCommand, previewViewProvider);
}

function deactivate() {}

function normalizeUrl(value) {
  const input = String(value || "").trim();
  if (!input) return DEFAULT_URL;
  if (/^\d+$/.test(input)) return `http://localhost:${input}`;
  if (/^:\d+$/.test(input)) return `http://localhost${input}`;
  if (!/^https?:\/\//i.test(input)) return `http://${input}`;
  return input;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getDeviceMarkup() {
  return DEVICE_GROUPS.map((group) => {
    const options = group.devices
      .map(
        (device) =>
          `<option value="${device.id}">${escapeHtml(device.name)} (${device.width}x${device.height})</option>`,
      )
      .join("");
    return `<optgroup label="${escapeHtml(group.group)}">${options}</optgroup>`;
  }).join("");
}

function getHtml(targetUrl, iframeUrl) {
  const safeTarget = escapeHtml(targetUrl);
  const safeFrame = escapeHtml(iframeUrl);
  const catalogJson = JSON.stringify(DEVICE_GROUPS);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; frame-src http: https:;" />
  <title>Mobile Preview Simulator</title>
  <style>
    :root {
      --bg: #0a0a0a;
      --text: #f5f7fb;
      --muted: rgba(255,255,255,0.64);
      --frame-border: #1a1a1a;
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
      --phone-finish: linear-gradient(180deg, #0f1013 0%, #050507 100%);
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
      box-sizing: border-box;
      padding: 0;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0;
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

    .device-picker,
    .device-select {
      flex: 1;
      width: 100%;
      height: 48px;
      box-sizing: border-box;
      padding: 0 46px 0 18px;
      margin: 0;
      border-radius: 0;
      border: 0;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      color: var(--text);
      outline: none;
      appearance: none;
      background:
        linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)),
        #111214;
      box-shadow: inset 0 -1px 0 rgba(255,255,255,0.03);
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
      transition: transform 0.3s ease;
    }

    .phone {
      position: relative;
      width: calc(var(--screen-width) + 36px);
      height: calc(var(--screen-height) + 36px);
      padding: 15px;
      border-radius: 54px;
      border: 1px solid #3a3a3a;
      background: #1c1c1e;
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
      pointer-events: auto;
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

    @media (max-width: 640px) {
      .toolbar {
        padding: 8px 12px;
      }
    }
  </style>
</head>
<body>
  <header class="toolbar">
    <div class="select-shell">
      <select id="deviceSelect" class="device-picker device-select">${getDeviceMarkup()}</select>
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
    urlInput.dataset.fullUrl = "${safeTarget}";

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
    deviceSelect.value = currentDeviceId;

    function normalizeUrl(value) {
      const input = String(value || "").trim();
      if (!input) return "${safeTarget}";
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

    function scaleFrame() {
      if (!previewArea || !phoneScale) return;

      const availW = Math.max(0, previewArea.clientWidth - 32);
      const availH = Math.max(0, previewArea.clientHeight - 32);
      const frameW = phoneScale.offsetWidth;
      const frameH = phoneScale.offsetHeight;
      const scaleX = frameW ? availW / frameW : 1;
      const scaleY = frameH ? availH / frameH : 1;
      const scale = Math.min(scaleX, scaleY, 1);

      phoneScale.style.transform = "scale(" + Math.max(scale, 0).toFixed(4) + ")";
    }

    function renderDevice() {
      const definition = devices.get(currentDeviceId) || devices.get("iphone-15");
      const metrics = getDeviceMetrics(definition);
      const chromeType = getChromeType(definition);

      root.style.setProperty("--screen-width", definition.width + "px");
      root.style.setProperty("--screen-height", definition.height + "px");
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

      requestAnimationFrame(scaleFrame);
    }

    function submit() {
      const url = normalizeUrl(urlInput.value);
      urlInput.dataset.fullUrl = url;
      urlInput.value = getUrlDisplayValue(url);
      vscode.postMessage({ command: "loadUrl", url });
    }

    deviceSelect.addEventListener("change", () => {
      currentDeviceId = deviceSelect.value;
      renderDevice();
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

    urlInput.value = getUrlDisplayValue(urlInput.dataset.fullUrl);
    renderDevice();
  </script>
</body>
</html>`;
}

module.exports = {
  activate,
  deactivate,
};
