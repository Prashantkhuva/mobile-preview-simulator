"use strict";

const DEFAULT_URL = "http://localhost:5173";

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

function escapeJs(value) {
  return String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("`", "\\`")
    .replaceAll("${", "\\${")
    .replaceAll('"', '\\"');
}

module.exports = { DEFAULT_URL, normalizeUrl, escapeHtml, escapeJs };
