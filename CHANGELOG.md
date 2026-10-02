# Changelog

## 3.5.1

- Fixed the preview clipping in a narrow sidebar: the toolbar now compacts below 440px so the phone frame stays fully visible.
- The frame scale now uses the real visible width instead of the overflowing layout width.

## 3.5.0

- Added a sidebar entry: click the Preview icon in the left activity bar to render the mobile preview directly in the sidebar.
- Sidebar and side panel preview now share the same URL — editing it in one updates the other.

## 2.0.0

- Promoted the extension to version 2.0.0 for the next Marketplace release.

## 1.2.6

- Moved the embedded preview iframe below the status bar and above the bottom overlays so the status bar, URL bar, and home indicator always stay visible.

## 1.2.5

- Fixed the phone preview layering so iframe content stays behind the status bar, dynamic island, and Safari URL bar overlays.

## 1.2.4

- Cleaned up the simulated iPhone chrome with a strict status bar layout, corrected dynamic island and notch behavior, a darker frame finish, and a host-only bottom URL display.

## 1.2.3

- Strengthened the phone bezel and body styling so the device frame reads clearly as a solid physical shell around the preview.

## 1.2.2

- Removed leftover side padding from the webview layout and made the toolbar stretch edge to edge.
- Added responsive phone-frame scaling so the preview stays centered and fully visible as the VS Code panel resizes.

## 1.2.1

- Tightened the webview layout so the device selector sits flush at the top and the preview fills the remaining viewport without extra whitespace.

## 1.2.0

- Redesigned the simulator UI with a premium centered device frame, floating in-phone address bar, and streamlined controls.

## 1.0.0

- Rebuilt the extension from scratch with a minimal preview implementation.
