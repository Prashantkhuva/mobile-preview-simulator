"use strict";

const vscode = require("vscode");
const os = require("os");
const { DEFAULT_URL, normalizeUrl } = require("./utils");
const { getHtml } = require("./template");

const COMMAND = "mobile-preview-simulator.openPreview";
const VIEW_TYPE = "mobilePreviewSimulator";

let currentPanel;
let currentState = { url: DEFAULT_URL };

function getLocalIp() {
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === "IPv4" && !iface.internal) {
          return iface.address;
        }
      }
    }
  } catch {}
  return "localhost";
}

function activate(context) {
  const openPreviewCommand = vscode.commands.registerCommand(
    COMMAND,
    () => {
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

      const localIp = getLocalIp();

      const render = (targetUrl) => {
        const normalized = normalizeUrl(targetUrl);
        currentState.url = normalized;
        panel.webview.html = getHtml(normalized, normalized, localIp);
      };

      try {
        render(currentState.url);
      } catch (error) {
        const text = error instanceof Error ? error.message : String(error);
        void vscode.window.showErrorMessage(`Open Preview: ${text}`);
      }

      panel.onDidDispose(() => {
        currentPanel = undefined;
      });

      panel.webview.onDidReceiveMessage((message) => {
        if (!message || message.command !== "loadUrl") return;
        currentState.url = normalizeUrl(message.url || currentState.url);
      });
    },
  );

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

module.exports = {
  activate,
  deactivate,
};
