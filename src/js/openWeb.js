import { chromium } from "playwright";
export async function openDinosaurGame() {
    try {
        const browser = await chromium.launch({
            channel: "chrome",
            headless: false,
            args: ["--start-maximized"],
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
