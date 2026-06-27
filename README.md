# CF-PC2-Emulator

A browser extension that transforms Codeforces contests into the classic PC² (Programming Contest Control System) interface. Developed by Abdo Sleem.

## Features
- **PC² Interface**: Replaces the Codeforces dashboard with a faithful reproduction of the retro PC² UI.
- **Seamless Submissions**: Submit code directly through the PC² interface, bypassing the standard Codeforces forms.
- **Live Verdict Polling**: Receive real-time draggable popups with your submission verdicts exactly as they arrive.
- **View Runs Tab**: View your submission history for the contest in a familiar PC² tabular format.
- **Contest Countdown & Timer**: Real-time sync with Codeforces countdowns, locking submissions before the contest starts and unlocking automatically at zero.
- **Smart URL Matching**: The interface only activates on the contest dashboard. It stands down automatically on problem descriptions or standings pages so you can continue using Codeforces as normal.

## How to Install

### For Google Chrome, Microsoft Edge, Brave, and other Chromium browsers
1. Download or clone this repository to your local machine.
2. Open your browser and navigate to the Extensions page:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Brave: `brave://extensions/`
3. Enable **Developer mode** (usually a toggle switch in the top right or bottom left corner).
4. Click the **Load unpacked** button.
5. Select the folder containing the `manifest.json` file.
6. The extension is now installed and active!

### For Mozilla Firefox
1. Download or clone this repository to your local machine.
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
3. Click on the **Load Temporary Add-on...** button.
4. Select the `manifest.json` file inside the repository folder.
5. The extension is now installed! *(Note: Firefox removes temporary add-ons when the browser is fully closed).*

## How to Use
1. Navigate to any active or upcoming Codeforces contest dashboard (e.g., `https://codeforces.com/contest/2237`).
2. The standard Codeforces page will instantly be replaced with the PC² interface.
3. **To Read Problems**: Click on or navigate directly to a problem URL (e.g., `/problem/A`). The extension automatically deactivates on problem pages so you can read the problem descriptions using the standard Codeforces UI.
4. **Submitting**: Go back to the dashboard. Under the "Submit Run" tab, select the problem, your language, and the local file containing your code. Click "Submit".
5. **View Runs**: Switch to the "View Runs" tab to see all your past submissions for the current contest.
6. **Popups**: When you submit a run, you will receive an immediate confirmation popup. Once the Codeforces servers finish judging your code, a separate final verdict popup will appear on your screen, exactly like in a real PC² contest environment.
