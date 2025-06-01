let gameData = {
    scores: [],
    speeds: [],
    obstacles: [],
    jumps: [],
    currentRound: {
        startTime: Date.now(),
        obstacleCount: 0,
        jumpCount: 0,
        maxSpeed: 0,
    },
};

/**
 * Record game score
 * @param {number} score - Current game score
 */
export function recordGameScore(score) {
    if (typeof score === "number" && !isNaN(score)) {
        gameData.scores.push(score);
    }
}

/**
 * Record game speed
 * @param {number} speed - Current game speed
 */
export function recordGameSpeed(speed) {
    if (typeof speed === "number" && !isNaN(speed)) {
        gameData.speeds.push(speed);

        // Update the maximum speed for the current round
        if (speed > gameData.currentRound.maxSpeed) {
            gameData.currentRound.maxSpeed = speed;
        }
    }
}

/**
 * Record obstacle encounter
 * @param {Object} obstacle - Obstacle object
 */
export function recordObstacleEncounter(obstacle) {
    if (obstacle) {
        gameData.obstacles.push({
            type: obstacle.isBird ? "bird" : "cactus",
            height: obstacle.height,
            y: obstacle.y,
            time: Date.now(),
        });

        gameData.currentRound.obstacleCount++;
    }
}

/**
 * Record jump action
 * @param {Object} gameState - Game state
 * @param {Object} obstacle - Obstacle
 * @param {number} distance - Distance to obstacle
 * @param {boolean} success - Whether the jump was successful
 */
export function recordJump(gameState, obstacle, distance, success) {
    if (gameState && obstacle) {
        gameData.jumps.push({
            obstacleType: obstacle.isBird ? "bird" : "cactus",
            relativeHeight: obstacle.isBird ? obstacle.y / (gameState.canvas.height || 150) : null,
            distance: distance,
            speed: gameState.speed,
            success: success,
            time: Date.now(),
        });

        gameData.currentRound.jumpCount++;
    }
}

/**
 * Generate analytics data for the current game round
 * @returns {Object} Game analytics data
 */
export function generateGameAnalytics() {
    const now = Date.now();
    const roundDuration = now - gameData.currentRound.startTime;

    // Calculate average speed
    const speeds = gameData.speeds.slice(-100); // Only use recent speed data
    const avgSpeed = speeds.length > 0 ? speeds.reduce((sum, s) => sum + s, 0) / speeds.length : 0;

    // Get final score
    const lastScore = gameData.scores.length > 0 ? gameData.scores[gameData.scores.length - 1] : 0;

    // Calculate bird and cactus obstacle ratios
    const recentObstacles = gameData.obstacles.slice(-50);
    const birdCount = recentObstacles.filter((o) => o.type === "bird").length;
    const cactusCount = recentObstacles.filter((o) => o.type === "cactus").length;

    // Reset current round statistics
    const roundStats = {
        duration: roundDuration,
        obstacleCount: gameData.currentRound.obstacleCount,
        jumpCount: gameData.currentRound.jumpCount,
        score: lastScore,
        avgSpeed: avgSpeed.toFixed(2),
        maxSpeed: gameData.currentRound.maxSpeed.toFixed(2),
        birdRatio: recentObstacles.length > 0 ? (birdCount / recentObstacles.length).toFixed(2) : 0,
        cactusRatio: recentObstacles.length > 0 ? (cactusCount / recentObstacles.length).toFixed(2) : 0,
    };

    // Reset current round data
    gameData.currentRound = {
        startTime: Date.now(),
        obstacleCount: 0,
        jumpCount: 0,
        maxSpeed: 0,
    };

    return roundStats;
}

/**
 * Get decision formula explanation
 * @param {Object} gameState - Game state
 * @param {Object} obstacle - Obstacle
 * @returns {string} Decision formula
 */
export function getDecisionFormula(gameState, obstacle) {
    if (!gameState || !obstacle) return "N/A";

    const isBird = obstacle.isBird;
    if (isBird) {
        const birdY = obstacle.y;
        const canvasHeight = gameState.canvas.height || 150;
        const relativeHeight = birdY / canvasHeight;

        if (relativeHeight > 0.8) {
            return "d < 35";
        } else if (relativeHeight > 0.7) {
            return `d < min(60, 40 + ${gameState.speed.toFixed(1)} × 2)`;
        } else if (relativeHeight > 0.6) {
            return `d < 55 + ${gameState.speed.toFixed(1)} × 1.5`;
        } else if (relativeHeight > 0.5) {
            return `d < 65 + ${gameState.speed.toFixed(1)} × 3`;
        } else if (relativeHeight > 0.4) {
            return `d < 50 + ${gameState.speed.toFixed(1)} × 2`;
        } else {
            return "No jump needed (h < 0.4)";
        }
    } else {
        const speedFactor = Math.max(1, gameState.speed / 7);
        if (obstacle.height < 50) {
            return `d < 60 × ${speedFactor.toFixed(2)} × 0.6`;
        } else {
            return `d < 60 × ${speedFactor.toFixed(2)} × 0.9`;
        }
    }
}

/**
 * Get cactus jump formula
 * @param {number} speedFactor - Speed factor
 * @returns {string} Cactus jump formula
 */
export function getCactusJumpFormula(speedFactor) {
    return `J(d, h) = {
  Small: d < 60 × ${speedFactor.toFixed(2)} × 0.6
  Large: d < 60 × ${speedFactor.toFixed(2)} × 0.9
}`;
}

/**
 * Get bird jump formula
 * @returns {string} Bird jump formula
 */
export function getBirdJumpFormula() {
    return `J(d, h, s) = {
  h > 0.8: d < 35
  h ∈ (0.7, 0.8]: d < min(60, 40 + s × 2)
  h ∈ (0.6, 0.7]: d < 55 + s × 1.5
  h ∈ (0.5, 0.6]: d < 65 + s × 3
  h ∈ (0.4, 0.5]: d < 50 + s × 2
  h < 0.4: No jump needed
}`;
}

/**
 * Get PCA decision formula
 * @returns {string} PCA decision formula
 */
export function getPCAFormula() {
    return `PCA(d, h) = {
  Feature combination: d/100 - 0.5 × h/50 < 1.0
}`;
}
