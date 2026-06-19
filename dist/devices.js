"use strict";

const { escapeHtml } = require("./utils");

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

function getDeviceMarkup(deviceGroups) {
  const groups = deviceGroups || DEVICE_GROUPS;
  return groups
    .map((group) => {
      const options = group.devices
        .map(
          (device) =>
            `<option value="${device.id}">${escapeHtml(device.name)} (${device.width}x${device.height})</option>`,
        )
        .join("");
      return `<optgroup label="${escapeHtml(group.group)}">${options}</optgroup>`;
    })
    .join("");
}

function mergeCustomDevices(customDevices) {
  if (!customDevices || !Array.isArray(customDevices) || !customDevices.length) {
    return DEVICE_GROUPS;
  }
  const valid = customDevices.filter(
    (d) => d.name && d.width > 0 && d.height > 0,
  );
  if (!valid.length) return DEVICE_GROUPS;

  const slugify = (name) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "custom";

  return [
    {
      group: "Custom",
      devices: valid.map((d, i) => ({
        id: d.id || "custom-" + slugify(d.name) + "-" + i,
        name: d.name,
        width: d.width,
        height: d.height,
        family: d.family || "phone",
        os: d.os || "android",
        chrome: d.chrome || "punch",
      })),
    },
    ...DEVICE_GROUPS,
  ];
}

module.exports = { DEVICE_GROUPS, getDeviceMarkup, mergeCustomDevices };
