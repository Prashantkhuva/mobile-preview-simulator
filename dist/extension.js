"use strict";

const vscode = require("vscode");
const { DEFAULT_URL, normalizeUrl } = require("./utils");
const { getHtml } = require("./template");
const { mergeCustomDevices } = require("./devices");

const COMMAND = "mobile-preview-simulator.openPreview";
const VIEW_TYPE = "mobilePreviewSimulator";

let currentPanel;
let currentState = { url: DEFAULT_URL };

function activate(context) {
  const openPreviewCommand = vscode.commands.registerCommand(
    COMMAND,
    async () => {
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

      const config = vscode.workspace.getConfiguration("mobilePreview");
      const customDevices = config.get("customDevices") || [];
      const deviceCatalog = mergeCustomDevices(customDevices);

      panel.iconPath = {
        light: vscode.Uri.joinPath(context.extensionUri, "images", "icon.svg"),
        dark: vscode.Uri.joinPath(
          context.extensionUri,
          "images",
          "icon-dark.svg",
        ),
      };

      const render = (targetUrl) => {
        const normalized = normalizeUrl(targetUrl);
        currentState.url = normalized;
        panel.webview.html = getHtml(normalized, deviceCatalog);
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
        if (!message || message.command !== "loadUrl") {
          return;
        }
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
