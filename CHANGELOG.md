# Changelog

## 3.6.0

- Added a Reload button to the toolbar and keyboard shortcuts: R rotates, +/- zooms, Ctrl/Cmd+R reloads the preview, Ctrl/Cmd+L focuses the URL bar, Escape closes overlays.
- Added an Auto-refresh toggle: when on, saving any file in the workspace reloads the preview automatically.
- The preview now remembers your device, rotation, zoom, URL, and auto-refresh choice when the view is rebuilt.
- Added a recent-URLs list: open the URL bar and click the chevron to jump back to any of your last 10 URLs.

## 3.5.7

- Shows a clear error screen inside the phone when the previewed server is not running: "Server not reachable" with the URL, a hint, and a Reload button. The preview now probes the URL after each load instead of showing a blank white screen.

## 3.5.6

- Redesigned the QR code modal: layered card, icon header, QR on a white plate, URL chip, close button, entrance animation, Escape-to-close and focus handling.

## 3.5.5

- The URL bar now collapses into a small icon at the bottom-right corner: click it to edit the URL, and it hides again when you click the preview, so nothing on the phone screen gets covered.

## 3.5.4

- The URL bar now floats at the bottom of the preview instead of taking a full row at the top, so the phone frame gets the extra height.

## 3.5.3

- Moved the URL bar out of the phone screen into its own row under the device-size toolbar, so the previewed site gets the full screen height.

## 3.5.2

- Fixed the sidebar preview not opening: the sidebar webview now enables scripts, so it renders the same mobile frame as the side panel.

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
