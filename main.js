import { openDinosaurGame } from "./src/js/openWeb.js";
import { startAutoPlay } from "./src/js/play.js";

let browser = null;

async function main() {
    try {
        console.log("Starting Chrome Dinosaur Game...");
        const gameContext = await openDinosaurGame();
        browser = gameContext.browser;
        const page = gameContext.page;
        page.on("error", (err) => {
            console.error("Page error:", err);
        });
        page.on("console", (msg) => {
            if (msg.type() === "error" || msg.type() === "warning") {
                console.log(`Page ${msg.type()}: ${msg.text()}`);
            }
        });
        await page.waitForTimeout(1000);
        console.log("Press Space to start the game...");
        await page.keyboard.press("Space");
        await page.waitForTimeout(1000);
        console.log("Starting AI gameplay...");
        try {
            await startAutoPlay(page);
        } catch (gameError) {
            console.error("AI gameplay loop interrupted:", gameError);
        }
        console.log("AI gameplay session ended, closing browser...");
        if (browser) {
            await browser.close().catch((e) => console.error("Error closing browser:", e));
        }
    } catch (error) {
        console.error("Error occurred during program execution:", error);
        if (browser) {
            await browser.close().catch((e) => {});
        }
        process.exit(1);
    }
}
process.on("SIGINT", async () => {
    console.log("\nReceived termination signal, shutting down gracefully...");
    if (browser) {
        await browser.close().catch((e) => {});
    }
    process.exit(0);
});

main().catch((err) => {
    console.error("Unhandled error caught in main program:", err);
    if (browser) {
        browser
            .close()
            .catch((e) => {})
            .finally(() => {
                process.exit(1);
            });
    } else {
        process.exit(1);
    }
});
