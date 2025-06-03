import { chromium } from "playwright";
export async function openDinosaurGame() {
    try {
        const browser = await chromium.launch({
            channel: "chrome",
            headless: false,
            args: ["--start-maximized", "--mute-audio"],
        });
        const context = await browser.newContext({
            viewport: null,
            offline: true, // Enable offline mode
        });
        const page = await context.newPage();
        try {
            await page.goto("chrome://dino/", {
                timeout: 10000,
                waitUntil: "domcontentloaded",
            });
        } catch (error) {
            console.log("Note: Page has loaded but reported network error (this is normal in offline mode)");
        }
        await page.waitForTimeout(2000);
        const isGameReady = await page
            .evaluate(() => {
                return window.Runner && window.Runner.instance_;
            })
            .catch(() => false);
        if (!isGameReady) {
            throw new Error("Unable to load dinosaur game, please check if chrome://dino/ is accessible");
        }

        // Mute all audio elements on the page
        await page.evaluate(() => {
            // Mute all audio and video elements
            const mediaElements = [...document.querySelectorAll("audio, video")];
            mediaElements.forEach((media) => {
                media.muted = true;
                media.volume = 0;
            });

            // If the game uses Web Audio API
            if (window.Runner && window.Runner.instance_ && window.Runner.instance_.audioContext) {
                try {
                    const audioContext = window.Runner.instance_.audioContext;
                    // Set main volume to 0
                    if (audioContext.destination && audioContext.destination.gain) {
                        audioContext.destination.gain.value = 0;
                    }

                    // 如果有单独的音频控制
                    if (window.Runner.instance_.audioConfig) {
                        window.Runner.instance_.audioConfig.muted = true;
                    }
                } catch (e) {
                    console.log("Note: Could not mute Web Audio API:", e);
                }
            }
        });

        await page.evaluate(() => {
            window.originalGameOver = window.Runner.instance_.gameOver;
            window.Runner.instance_.gameOver = function () {
                console.log("Game over called!");
                window.isGameOver = true;
                return window.originalGameOver.apply(this, arguments);
            };
            window.originalRestart = window.Runner.instance_.restart;
            window.Runner.instance_.restart = function () {
                console.log("Game restart called!");
                window.isGameOver = false;
                return window.originalRestart.apply(this, arguments);
            };
            window.isGameOver = false;
        });
        browser.on("disconnected", () => {
            console.log("Browser closed");
            process.exit(0);
        });
        console.log("Press Ctrl+C to terminate the program");
        return { page, browser };
    } catch (error) {
        console.error("Error occurred:", error);
        throw error;
    }
}
