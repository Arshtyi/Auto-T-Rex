import {
    recordGameScore,
    recordGameSpeed,
    recordObstacleEncounter,
    recordJump,
    generateGameAnalytics,
    getDecisionFormula,
    getCactusJumpFormula,
    getBirdJumpFormula,
    getPCAFormula,
} from "./analytics.js";

import { createInfoPanel, updateInfoPanel, updateFormulaDisplay } from "./ui.js";

export async function startAutoPlay(page) {
    console.log("Starting AI gameplay...");
    await createInfoPanel(page);
    let lastScore = 0;
    let frameCount = 0;
    let iterationCount = 1;
    let highestScore = 0;
    while (true) {
        try {
            if (frameCount % 100 === 0) {
                // Get current score and game speed
                const gameData = await page.evaluate(() => {
                    const runner = window.Runner?.instance_;
                    return {
                        score: runner?.distanceMeter?.digits.join("") || "0",
                        speed: runner?.currentSpeed || 0,
                    };
                });
                if (gameData.score !== lastScore) {
                    console.log(`Current score: ${gameData.score}`);
                    const currentScoreNum = parseInt(gameData.score, 10);
                    if (currentScoreNum > highestScore) {
                        highestScore = currentScoreNum;
                    }
                    recordGameScore(currentScoreNum);
                    recordGameSpeed(gameData.speed);
                    lastScore = gameData.score;
                }
            }
            frameCount++;
            // Check if game is over
            const isGameOver = await page.evaluate(() => window.isGameOver);
            if (isGameOver) {
                console.log("Game over, press Space to restart...");
                // Record final game score
                const finalScore = parseInt(lastScore, 10);
                recordGameScore(finalScore);
                // Generate analytics for this game round
                const roundAnalytics = generateGameAnalytics();
                console.log("Round Statistics:", roundAnalytics);
                // Display game over message to user
                await updateInfoPanel(page, {
                    iteration: iterationCount,
                    highScore: highestScore,
                    currentScore: finalScore,
                    speed: 0,
                    gameOver: true,
                    analytics: roundAnalytics,
                });

                await page.waitForTimeout(1000);
                await page.keyboard.press("Space");
                await page.waitForTimeout(1000);
                // Game restarted, increment iteration count
                iterationCount++;
                lastScore = 0; // Reset current score
                // Reset game analytics and update info panel
                await updateInfoPanel(page, {
                    iteration: iterationCount,
                    highScore: highestScore,
                    currentScore: 0,
                    speed: 0,
                    gameReset: true,
                });
                // Game round summary can also be added here
                const analytics = generateGameAnalytics();
                console.log(`Game round ended #${iterationCount - 1}`, analytics);
                continue;
            }
            const gameState = await getGameState(page);
            if (gameState) {
                const result = analyzeObstacles(gameState);
                const shouldJump = result.shouldJump;
                // Update info panel with current game state and AI decision (every frame)
                if (gameState.obstacles && gameState.obstacles.length > 0) {
                    const nearest = gameState.obstacles[0];
                    const distance = nearest.x - (gameState.tRex.x + gameState.tRex.width);
                    // Record obstacle encounter
                    recordObstacleEncounter(nearest);
                    // Generate mathematical decision formula
                    const decisionFormula = getDecisionFormula(gameState, nearest);
                    // Update mathematical formula display
                    await updateFormulaDisplay(page, {
                        jumpThreshold: decisionFormula,
                        cactus: nearest.isBird ? null : getCactusJumpFormula(Math.max(1, gameState.speed / 7)),
                        bird: nearest.isBird ? getBirdJumpFormula() : null,
                        pca: getPCAFormula(),
                    });
                    // Update info panel with latest data
                    await updateInfoPanel(page, {
                        iteration: iterationCount,
                        highScore: highestScore,
                        currentScore: parseInt(lastScore, 10),
                        speed: gameState.speed,
                        obstacleInfo: nearest.isBird
                            ? `Bird (Height: ${nearest.y}, Relative: ${(
                                  nearest.y / (gameState.canvas.height || 150)
                              ).toFixed(2)})`
                            : `Cactus (Height: ${nearest.height})`,
                        shouldJump: shouldJump,
                        distance: distance,
                        reason: result.reason,
                        thresholdCalc: result.thresholdCalc,
                    });

                    // If decided to jump, record jump data
                    if (shouldJump) {
                        recordJump(gameState, nearest, distance, true);
                    }
                    // Log detailed info every 100 frames to avoid console spam
                    if (frameCount % 100 === 0) {
                        console.log(
                            `Obstacle: Distance=${distance}, Speed=${gameState.speed.toFixed(2)}, Type=${
                                nearest.isBird ? "Bird" : "Cactus"
                            }, Jump=${shouldJump}`
                        );
                        // If it's a bird obstacle, output its relative height and perform safety checks
                        if (nearest.isBird) {
                            const canvasHeight = gameState.canvas.height || 150;
                            const relativeHeight =
                                typeof nearest.y === "number" && canvasHeight > 0
                                    ? nearest.y / canvasHeight
                                    : "unknown";
                            console.log(
                                `Bird Position: Relative Height=${
                                    typeof relativeHeight === "number" ? relativeHeight.toFixed(2) : relativeHeight
                                }`
                            );
                        }
                    }
                }
                if (shouldJump) {
                    await page.keyboard.press("Space");
                    await page.waitForTimeout(100);
                }
            }
            await page.waitForTimeout(10);
        } catch (error) {
            console.error("Error in auto play loop:", error);
            await page.waitForTimeout(500);
        }
    }
}

async function getGameState(page) {
    try {
        return await page.evaluate(() => {
            if (!window.Runner || !window.Runner.instance_) {
                console.error("Game instance does not exist");
                return null;
            }
            const runner = window.Runner.instance_;
            if (!runner.tRex) {
                console.error("T-Rex object does not exist");
                return null;
            }
            const tRex = runner.tRex;
            let obstacles = [];
            try {
                if (runner.horizon && runner.horizon.obstacles) {
                    const obstaclesArray = Array.isArray(runner.horizon.obstacles)
                        ? runner.horizon.obstacles
                        : runner.horizon.obstacles.obstacles || [];
                    obstacles = obstaclesArray.map((obstacle) => {
                        return {
                            type: obstacle.typeConfig?.type || "unknown",
                            width: obstacle.width,
                            height: obstacle.height,
                            x: obstacle.xPos,
                            y: obstacle.yPos,
                            gap: obstacle.gap,
                            isBird: obstacle.typeConfig?.type.includes("PTERODACTYL"),
                            birdFlightHeight: obstacle.typeConfig?.type.includes("PTERODACTYL") ? obstacle.yPos : null,
                            typeConfig: obstacle.typeConfig,
                        };
                    });
                }
            } catch (e) {
                console.error("Error getting obstacles:", e);
                obstacles = [];
            }
            const speed = runner.currentSpeed;
            return {
                tRex: {
                    x: tRex.xPos,
                    y: tRex.yPos,
                    width: tRex.config.WIDTH,
                    height: tRex.config.HEIGHT,
                    status: tRex.status,
                    jumping: tRex.jumping,
                },
                obstacles: obstacles,
                speed: speed,
                canvas: {
                    width: runner.dimensions.WIDTH,
                    height: runner.dimensions.HEIGHT,
                },
            };
        });
    } catch (error) {
        console.error("Error getting game state:", error);
        return null;
    }
}

function analyzeObstacles(gameState) {
    if (!gameState || !gameState.obstacles || gameState.obstacles.length === 0) {
        return { shouldJump: false, reason: "No obstacles" };
    }
    if (gameState.tRex.jumping) {
        return { shouldJump: false, reason: "Currently jumping" };
    }
    const nearestObstacle = gameState.obstacles.reduce((nearest, current) => {
        if (current.x > gameState.tRex.x) {
            if (!nearest || current.x < nearest.x) {
                return current;
            }
        }
        return nearest;
    }, null);
    if (!nearestObstacle) {
        return { shouldJump: false, reason: "No nearby obstacles" };
    }
    const distance = nearestObstacle.x - (gameState.tRex.x + gameState.tRex.width);
    const speedFactor = Math.max(1, gameState.speed / 7);
    // Increase jump threshold to trigger later
    const jumpThreshold = 60 * speedFactor; // Obstacle type and height judgment
    const obstacleType = nearestObstacle.type || "";
    const isBird = obstacleType.includes("PTERODACTYL");
    const isCactus = !isBird;

    let shouldJump = false;
    let reason = "";
    let thresholdCalc = "";

    if (isCactus) {
        // Small cacti can be jumped over at closer distances (factor 0.6)
        if (nearestObstacle.height < 50) {
            const threshold = jumpThreshold * 0.6;
            shouldJump = distance < threshold;
            reason = shouldJump ? "Small Cactus - Jump" : "Small Cactus - Keep Running";
            thresholdCalc = `Threshold=${threshold.toFixed(1)} (60×${speedFactor.toFixed(2)}×0.6)`;
        }
        // Large cacti need to be jumped over earlier (factor 0.9)
        else {
            const threshold = jumpThreshold * 0.9;
            shouldJump = distance < threshold;
            reason = shouldJump ? "Large Cactus - Jump" : "Large Cactus - Keep Running";
            thresholdCalc = `Threshold=${threshold.toFixed(1)} (60×${speedFactor.toFixed(2)}×0.9)`;
        }
    } else if (isBird) {
        // Bird obstacle handling
        const birdY = nearestObstacle.y;
        const canvasHeight = gameState.canvas.height || 150; // Default value to prevent NaN
        const tRexHeight = gameState.tRex.height;
        // Calculate bird's relative height (0-1 range, 0 is top, 1 is bottom)
        const birdRelativeHeight =
            typeof birdY === "number" && typeof canvasHeight === "number" && canvasHeight > 0
                ? birdY / canvasHeight
                : 0.5; // Assume middle position if calculation fails

        // 1. Very low flying bird (lowest zone)
        if (birdRelativeHeight > 0.8) {
            const threshold = 35;
            shouldJump = distance < threshold;
            reason = "Lowest Zone Bird";
            thresholdCalc = `Threshold=${threshold} (fixed value)`;
        }
        // 2. Low flying bird (bottom zone)
        else if (birdRelativeHeight > 0.7 && birdRelativeHeight <= 0.8) {
            const jumpDistance = Math.min(60, 40 + gameState.speed * 2);
            shouldJump = distance < jumpDistance;
            reason = "Bottom Zone Bird";
            thresholdCalc = `Threshold=${jumpDistance.toFixed(1)} (min(60, 40+${gameState.speed.toFixed(1)}×2))`;
        }
        // 3. Medium-low flying bird (medium-bottom zone)
        else if (birdRelativeHeight > 0.6 && birdRelativeHeight <= 0.7) {
            const jumpDistance = 55 + gameState.speed * 1.5;
            shouldJump = distance < jumpDistance;
            reason = "Medium-Bottom Zone Bird";
            thresholdCalc = `Threshold=${jumpDistance.toFixed(1)} (55+${gameState.speed.toFixed(1)}×1.5)`;
        }
        // 4. Medium flying bird (middle zone)
        else if (birdRelativeHeight > 0.5 && birdRelativeHeight <= 0.6) {
            const tRexJumpApex = canvasHeight * 0.55;
            if (Math.abs(birdY - tRexJumpApex) < 10 && distance < 40) {
                shouldJump = false;
                reason = "Middle Zone Bird - Avoid";
                thresholdCalc = `Jump apex diff=${Math.abs(birdY - tRexJumpApex).toFixed(1)} < 10`;
            } else {
                const jumpDistance = 65 + gameState.speed * 3;
                shouldJump = distance < jumpDistance;
                reason = "Middle Zone Bird - Jump";
                thresholdCalc = `Threshold=${jumpDistance.toFixed(1)} (65+${gameState.speed.toFixed(1)}×3)`;
            }
        }
        // 5. Medium-high flying bird
        else if (birdRelativeHeight > 0.4 && birdRelativeHeight <= 0.5) {
            const jumpDistance = 50 + gameState.speed * 2;
            shouldJump = distance < jumpDistance;
            reason = "Medium-Top Zone Bird";
            thresholdCalc = `Threshold=${jumpDistance.toFixed(1)} (50+${gameState.speed.toFixed(1)}×2)`;
        }
        // 6. High flying bird (top zone)
        else {
            shouldJump = false; // No jump needed for high flying birds
            reason = "High Zone Bird - No Jump Needed";
            thresholdCalc = `Relative height=${birdRelativeHeight.toFixed(2)} < 0.4`;
        }
    } else {
        // Simple PCA concept: Use distance and height as features, make decisions through weighted combination
        // Closer distance means more need to jump; higher obstacle means need to jump earlier
        const heightFactor = nearestObstacle.height / 50; // Height normalization
        const distanceFactor = distance / 100; // Distance normalization
        // Combined feature: smaller distance + higher height = smaller result = more need to jump
        const combinedFactor = distanceFactor - 0.5 * heightFactor;
        // Jump if combined feature is less than threshold
        shouldJump = combinedFactor < 1.0;
        reason = "PCA Feature Decision";
        thresholdCalc = `${distanceFactor.toFixed(2)}-0.5×${heightFactor.toFixed(2)}=${combinedFactor.toFixed(
            2
        )} < 1.0`;
    }

    return {
        shouldJump,
        reason,
        distance,
        obstacleType: isBird ? "Bird" : "Cactus",
        obstacleHeight: nearestObstacle.height,
        obstacleY: nearestObstacle.y,
        thresholdCalc,
    };
}
