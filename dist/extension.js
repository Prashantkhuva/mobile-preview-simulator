"use strict";

const vscode = require("vscode");
const os = require("os");
const http = require("http");
const https = require("https");
const { DEFAULT_URL, normalizeUrl } = require("./utils");
const { getHtml } = require("./template");

const COMMAND = "mobile-preview-simulator.openPreview";
const VIEW_TYPE = "mobilePreviewSimulator";

let currentPanel;
let currentView;
let currentState = { url: DEFAULT_URL };

let proxyServer = null;
let proxyPort = 0;
let proxyTargetOrigin = "";

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

function ensureProxy() {
  if (proxyServer) return Promise.resolve(proxyPort);
  return new Promise((resolve) => {
    let settled = false;
    const done = (value) => {
      if (!settled) {
        settled = true;
        resolve(value);
      }
    };
    const server = http.createServer((req, res) => proxyRequest(req, res));
    server.on("upgrade", (req, socket, head) =>
      proxyUpgrade(req, socket, head),
    );
    server.on("error", () => done(0));
    server.listen(0, "127.0.0.1", () => {
      proxyServer = server;
      proxyPort = server.address().port;
      done(proxyPort);
    });
  });
}

function rewriteLocation(value) {
  if (proxyTargetOrigin && value.startsWith(proxyTargetOrigin)) {
    return `http://127.0.0.1:${proxyPort}${value.slice(proxyTargetOrigin.length)}`;
  }
  return value;
}

function proxyRequest(req, res) {
  if (!proxyTargetOrigin) {
    res.writeHead(502);
    res.end("Proxy target not set");
    return;
  }
  let dest;
  try {
    dest = new URL(req.url || "/", proxyTargetOrigin);
  } catch {
    res.writeHead(400);
    res.end();
    return;
  }
  const transport = dest.protocol === "https:" ? https : http;
  const headers = { ...req.headers, host: dest.host };
  if (headers.origin) headers.origin = proxyTargetOrigin;
  headers["x-forwarded-host"] = dest.host;
  headers["x-forwarded-proto"] = dest.protocol.replace(":", "");

  const upstream = transport.request(
    {
      protocol: dest.protocol,
      hostname: dest.hostname,
      port: dest.port || (dest.protocol === "https:" ? 443 : 80),
      path: dest.pathname + dest.search,
      method: req.method,
      headers,
    },
    (upstreamRes) => {
      const out = {};
      for (const [key, value] of Object.entries(upstreamRes.headers)) {
        const lower = key.toLowerCase();
        if (lower === "x-frame-options") continue;
        if (lower === "content-security-policy") continue;
        if (lower === "content-security-policy-report-only") continue;
        if (lower === "location") {
          out.location = rewriteLocation(String(value));
          continue;
        }
        out[key] = value;
      }
      res.writeHead(upstreamRes.statusCode || 502, out);
      upstreamRes.pipe(res);
    },
  );
  upstream.on("error", (error) => {
    try {
      res.writeHead(502);
      res.end(String(error.message));
    } catch {}
  });
  req.pipe(upstream);
}

function proxyUpgrade(req, socket, head) {
  if (!proxyTargetOrigin) {
    socket.destroy();
    return;
  }
  let dest;
  try {
    dest = new URL(req.url || "/", proxyTargetOrigin);
  } catch {
    socket.destroy();
    return;
  }
  const transport = dest.protocol === "https:" ? https : http;
  const headers = { ...req.headers, host: dest.host };
  if (headers.origin) headers.origin = proxyTargetOrigin;

  const upstream = transport.request({
    protocol: dest.protocol,
    hostname: dest.hostname,
    port: dest.port || (dest.protocol === "https:" ? 443 : 80),
    path: dest.pathname + dest.search,
    method: req.method,
    headers,
  });

  const writeHead = (res, rawHead) => {
    let raw = `HTTP/1.1 ${res.statusCode || 101} ${res.statusMessage || ""}\r\n`;
    for (const [key, value] of Object.entries(res.headers)) {
      raw += `${key}: ${Array.isArray(value) ? value.join(", ") : value}\r\n`;
    }
    raw += "\r\n";
    socket.write(raw);
    if (rawHead && rawHead.length) socket.write(rawHead);
  };

  upstream.on("upgrade", (upRes, upSocket, upHead) => {
    writeHead(upRes, upHead);
    if (head && head.length) upSocket.write(head);
    upSocket.pipe(socket);
    socket.pipe(upSocket);
    socket.on("error", () => upSocket.destroy());
    upSocket.on("error", () => socket.destroy());
  });
  upstream.on("response", (upRes) => {
    writeHead(upRes, undefined);
    upRes.pipe(socket);
    socket.on("error", () => upRes.destroy());
  });
  upstream.on("error", () => socket.destroy());
  upstream.end();
}

async function probeUrl(url) {
  let frameBlocked = false;
  let finalUrl = url;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (response.url) finalUrl = response.url;
    const xfo = response.headers.get("x-frame-options");
    const csp = response.headers.get("content-security-policy");
    if (xfo && xfo.trim()) frameBlocked = true;
    if (csp && /frame-ancestors/i.test(csp)) {
      const match = csp.match(/frame-ancestors([^;]*)/i);
      const sources = match ? match[1] : "";
      if (!sources.includes("*")) frameBlocked = true;
    }
  } catch {
    return { ok: false, frameBlocked: false, frameUrl: "" };
  }
  if (!frameBlocked) {
    return { ok: true, frameBlocked: false, frameUrl: finalUrl };
  }
  const port = await ensureProxy();
  if (!port) {
    return { ok: true, frameBlocked: true, frameUrl: "" };
  }
  try {
    const parsed = new URL(finalUrl);
    proxyTargetOrigin = parsed.origin;
    return {
      ok: true,
      frameBlocked: true,
      frameUrl: `http://127.0.0.1:${port}${parsed.pathname}${parsed.search}`,
    };
  } catch {
    return { ok: true, frameBlocked: true, frameUrl: "" };
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
          frameUrl: result.frameUrl,
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
  context.subscriptions.push({
    dispose: () => {
      if (proxyServer) {
        try {
          proxyServer.close();
        } catch {}
        proxyServer = null;
        proxyPort = 0;
        proxyTargetOrigin = "";
      }
    },
  });
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
