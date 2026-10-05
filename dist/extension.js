"use strict";

const vscode = require("vscode");
const os = require("os");
const { DEFAULT_URL, normalizeUrl } = require("./utils");
const { getHtml } = require("./template");

const COMMAND = "mobile-preview-simulator.openPreview";
const VIEW_TYPE = "mobilePreviewSimulator";

let currentPanel;
let currentView;
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

async function probeUrl(url) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timer);
    const xfo = response.headers.get("x-frame-options");
    const csp = response.headers.get("content-security-policy");
    let frameBlocked = false;
    if (xfo && xfo.trim()) frameBlocked = true;
    if (csp && /frame-ancestors/i.test(csp)) {
      const match = csp.match(/frame-ancestors([^;]*)/i);
      const sources = match ? match[1] : "";
      if (!sources.includes("*")) frameBlocked = true;
    }
    return { ok: true, frameBlocked };
  } catch {
    return { ok: false, frameBlocked: false };
  }
}

function activate(context) {
  const postTo = (target, payload) => {
    if (!target) return;
    try {
      const result = target.webview.postMessage(payload);
      if (result && typeof result.then === "function") {
        result.catch(() => {});
      }
    } catch {}
  };

  const sendUrl = (target, url) => {
    postTo(target, { command: "setUrl", url });
  };

  const handleLoadUrl = (source, message) => {
    if (!message || message.command !== "loadUrl") return;
    const normalized = normalizeUrl(message.url || currentState.url);
    currentState.url = normalized;

    if (source === "panel") {
      if (currentView) sendUrl(currentView, normalized);
    } else if (currentPanel) {
      sendUrl(currentPanel, normalized);
    }
  };

  const handleMessage = (source, message) => {
    if (!message) return;
    if (message.command === "probe") {
      const url = String(message.url || "");
      const token = message.token;
      probeUrl(url).then((result) => {
        const target = source === "panel" ? currentPanel : currentView;
        postTo(target, {
          command: "probeResult",
          token,
          url,
          ok: result.ok,
          frameBlocked: result.frameBlocked,
        });
      });
      return;
    }
    if (message.command === "openExternal" && message.url) {
      try {
        void vscode.env.openExternal(vscode.Uri.parse(String(message.url)));
      } catch {}
      return;
    }
    handleLoadUrl(source, message);
  };

  const sendCommand = (target, command) => {
    postTo(target, { command });
  };

  let reloadTimer;
  const autoRefreshSubscription = vscode.workspace.onDidSaveTextDocument(() => {
    clearTimeout(reloadTimer);
    reloadTimer = setTimeout(() => {
      sendCommand(currentPanel, "reload");
      sendCommand(currentView, "reload");
    }, 200);
  });

  const openPreviewCommand = vscode.commands.registerCommand(COMMAND, () => {
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
      dark: vscode.Uri.joinPath(
        context.extensionUri,
        "images",
        "icon-dark.svg",
      ),
    };

    const localIp = getLocalIp();

    try {
      panel.webview.html = getHtml(currentState.url, currentState.url, localIp);
    } catch (error) {
      const text = error instanceof Error ? error.message : String(error);
      void vscode.window.showErrorMessage(`Open Preview: ${text}`);
    }

    panel.onDidDispose(() => {
      currentPanel = undefined;
    });

    panel.webview.onDidReceiveMessage((message) =>
      handleMessage("panel", message),
    );
  });

  const previewViewProvider = vscode.window.registerWebviewViewProvider(
    "mobile-preview-view",
    {
      resolveWebviewView(webviewView) {
        currentView = webviewView;

        webviewView.webview.options = { enableScripts: true };

        const localIp = getLocalIp();

        try {
          webviewView.webview.html = getHtml(
            currentState.url,
            currentState.url,
            localIp,
          );
        } catch (error) {
          const text = error instanceof Error ? error.message : String(error);
          void vscode.window.showErrorMessage(`Open Preview: ${text}`);
        }

        webviewView.webview.onDidReceiveMessage((message) =>
          handleMessage("view", message),
        );

        webviewView.onDidDispose(() => {
          currentView = undefined;
        });
      },
    },
    { webviewOptions: { retainContextWhenHidden: true } },
  );

  context.subscriptions.push(
    openPreviewCommand,
    previewViewProvider,
    autoRefreshSubscription,
  );
  context.subscriptions.push({ dispose: () => clearTimeout(reloadTimer) });
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
