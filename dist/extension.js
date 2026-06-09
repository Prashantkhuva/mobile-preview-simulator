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

      const initialUrl = currentState.url;
      const normalized = normalizeUrl(initialUrl);
      const externalUri = await vscode.env.asExternalUri(
        vscode.Uri.parse(normalized),
      );
      currentState.url = normalized;
      panel.webview.html = getHtml(normalized, externalUri.toString());

      panel.webview.onDidReceiveMessage(async (message) => {
        if (!message) return;

        if (message.command === "resolveUrl") {
          try {
            const resolved = await vscode.env.asExternalUri(
              vscode.Uri.parse(message.url || currentState.url),
            );
            currentState.url = message.url || currentState.url;
            await panel.webview.postMessage({
              command: "urlResolved",
              url: message.url || currentState.url,
              resolvedUrl: resolved.toString(),
            });
          } catch (error) {
            const text = error instanceof Error ? error.message : String(error);
            void vscode.window.showErrorMessage(
              `Open Preview: ${text}`,
            );
          }
        }
      });

      panel.onDidDispose(() => {
        currentPanel = undefined;
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

    body::before {
      content: "";
      position: fixed;
      inset: 0;
      background:
        radial-gradient(ellipse 60% 40% at 20% 50%, rgba(255,255,255,0.015) 0%, transparent 60%);
      pointer-events: none;
      z-index: -1;
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

    .toolbar::after {
      content: "";
      position: absolute;
      bottom: -1px;
      left: 10%;
      right: 10%;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(0, 122, 255, 0.2), transparent);
      pointer-events: none;
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
      transition: transform 0.2s ease;
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
      width: var(--outer-width);
      height: var(--outer-height);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1), height 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      will-change: transform;
    }

    .phone-viewport::before {
      content: "";
      position: absolute;
      inset: -30px;
      border-radius: 50%;
      background: radial-gradient(circle at center, var(--glow-color) 0%, transparent 70%);
      opacity: 0;
      transition: opacity 0.6s ease;
      pointer-events: none;
    }

    .phone-viewport.has-glow::before {
      opacity: 1;
    }

    .phone-scale,
    .phone-frame-wrapper {
      width: var(--outer-width);
      height: var(--outer-height);
      display: grid;
      place-items: center;
      transform-origin: center center;
      transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      contain: layout style;
    }

    .phone {
      position: relative;
      width: calc(var(--screen-width) + 36px);
      height: calc(var(--screen-height) + 36px);
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

    .phone::after {
      content: "";
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 30%;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
      pointer-events: none;
    }

    .phone.tablet {
      width: calc(var(--screen-width) + 34px);
      height: calc(var(--screen-height) + 34px);
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
      width: var(--screen-width);
      height: var(--screen-height);
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
      box-shadow: inset 0 0.5px 0 rgba(255,255,255,0.04);
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
      box-shadow:
        0 0 0 2.5px rgba(10,10,12,0.5),
        0 0 0 4px rgba(6,6,8,0.3);
    }

    .camera.notch {
      width: 176px;
      height: 34px;
      border-radius: 0 0 22px 22px;
      background: linear-gradient(180deg, #0d0d0f 0%, #050507 100%);
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
      box-shadow:
        0 0 0 2.5px rgba(10,10,12,0.5),
        0 0 0 4px rgba(6,6,8,0.3);
    }

    .camera.punch {
      top: 15px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background:
        radial-gradient(circle at 35% 35%, rgba(66,66,80,0.95), rgba(8,8,10,0.98) 60%);
      box-shadow:
        0 0 0 3px rgba(0,0,0,0.45),
        inset 0 0.5px 0 rgba(255,255,255,0.04);
    }

    .camera.tablet {
      top: 14px;
      width: 58px;
      height: 8px;
      border-radius: 999px;
      background: rgba(0,0,0,0.72);
      box-shadow: inset 0 0.5px 0 rgba(255,255,255,0.03);
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
      background: linear-gradient(
        to bottom,
        rgba(0,0,0,0.6) 0%,
        transparent 100%
      );
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

    .wifi-icon svg {
      width: 100%;
      height: 100%;
    }

    .battery-icon {
      position: relative;
      width: 25px;
      height: 12px;
      opacity: 0.92;
    }

    .battery-icon svg {
      width: 100%;
      height: 100%;
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
      pointer-events: auto;
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
      animation: homePulse 3s ease-in-out infinite;
    }

    .home-indicator.hidden {
      display: none;
    }

    @keyframes homePulse {
      0%, 100% { opacity: 0.85; }
      50% { opacity: 0.65; }
    }

    @media (max-width: 640px) {
      .toolbar {
        padding: 0;
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
      <select id="deviceSelect" class="device-picker device-select">${getDeviceMarkup()}</select>
    </div>
  </header>

  <main class="preview-container preview-area">
    <div id="phoneViewport" class="phone-viewport has-glow">
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
    const iframe = document.getElementById("previewFrame");
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
      if (!input) return "${safeTarget}";
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
      if (!frameW || !frameH) return;
      const scaleX = availW / frameW;
      const scaleY = availH / frameH;
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

      phoneViewport.classList.toggle("has-glow", definition.os === "ios");

      requestAnimationFrame(scaleFrame);
    }

    function submitUrl(url) {
      const normalized = normalizeUrl(url);
      urlInput.dataset.fullUrl = normalized;
      urlInput.value = getUrlDisplayValue(normalized);
      vscode.postMessage({ command: "resolveUrl", url: normalized });
    }

    function submit() {
      submitUrl(urlInput.value);
    }

    window.addEventListener("message", (event) => {
      const msg = event.data;
      if (msg.command === "urlResolved") {
        urlInput.dataset.fullUrl = msg.url;
        urlInput.value = getUrlDisplayValue(msg.url);
        iframe.src = msg.resolvedUrl;
      }
    });

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

    let resizeTimer;
    window.addEventListener("resize", () => {
      if (resizeTimer) cancelAnimationFrame(resizeTimer);
      resizeTimer = requestAnimationFrame(scaleFrame);
    });

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
