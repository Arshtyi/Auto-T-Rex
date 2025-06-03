// Neural Network Module - Uses TensorFlow.js to optimize game parameters

import * as tf from "@tensorflow/tfjs";

// Neural network model to optimize game parameters
let model = null;
let optimizer = null;
let trainingData = {
    inputs: [],
    targets: [],
    rewards: [],
};
let currentEpisode = [];
let episodeReward = 0;
let episodeCount = 0;
let lastScore = 0;
let learningRate = 0.002;
let paramsBuffer = [];

// Parameter configuration
const defaultParams = {
    // Cactus parameters
    smallCactusThresholdBase: 60,
    smallCactusSpeedFactor: 1,
    smallCactusHeightFactor: 0.6,

    largeCactusThresholdBase: 60,
    largeCactusSpeedFactor: 1,
    largeCactusHeightFactor: 0.9,

    // Bird parameters
    lowestBirdThreshold: 35,

    bottomBirdBaseThreshold: 40,
    bottomBirdSpeedFactor: 2,
    bottomBirdMaxThreshold: 60,

    mediumBottomBirdBaseThreshold: 55,
    mediumBottomBirdSpeedFactor: 1.5,

    middleBirdBaseThreshold: 65,
    middleBirdSpeedFactor: 3,

    mediumTopBirdBaseThreshold: 50,
    mediumTopBirdSpeedFactor: 2,

    // PCA parameters
    pcaDistanceFactor: 100,
    pcaHeightFactor: 50,
    pcaHeightWeight: 0.5,
    pcaThreshold: 1.0,
};

// Current optimized parameters (will be updated by neural network)
let currentParams = { ...defaultParams };

/**
 * Initialize the neural network model
 */
export function initializeNeuralNetwork() {
    console.log("Initializing neural network...");

    // Create a simple neural network model
    model = tf.sequential();

    // Input layer (game state features)
    model.add(
        tf.layers.dense({
            units: 64,
            activation: "relu",
            inputShape: [8], // Our game state features
        })
    );

    // Hidden layer
    model.add(
        tf.layers.dense({
            units: 32,
            activation: "relu",
        })
    );

    // Output layer (parameter adjustments)
    model.add(
        tf.layers.dense({
            units: Object.keys(defaultParams).length,
            activation: "tanh", // Output between -1 and 1 for parameter adjustments
        })
    );

    // Compile the model
    optimizer = tf.train.adam(learningRate);
    model.compile({
        optimizer: optimizer,
        loss: "meanSquaredError",
    });

    console.log("Neural network initialized");

    // Reset training data
    resetTrainingData();

    return {
        modelSummary: "TensorFlow.js Neural Network (3 layers, Adam optimizer)",
        episodeCount: episodeCount,
    };
}

/**
 * Reset training data between episodes
 */
export function resetTrainingData() {
    currentEpisode = [];
    episodeReward = 0;
    lastScore = 0;
}

/**
 * Extract features from game state
 * @param {Object} gameState - Current game state
 * @param {Object} obstacle - Nearest obstacle
 * @returns {Array} Features array
 */
function extractFeatures(gameState, obstacle) {
    if (!gameState || !obstacle) return null;

    const isBird = obstacle.isBird;
    const distance = obstacle.x - (gameState.tRex.x + gameState.tRex.width);
    const normalizedDistance = distance / 200; // Normalize distance
    const normalizedSpeed = gameState.speed / 15; // Normalize speed
    const normalizedHeight = obstacle.height / 100; // Normalize height

    let relativeHeight = 0;
    if (isBird && gameState.canvas.height) {
        relativeHeight = obstacle.y / gameState.canvas.height;
    }

    return [
        normalizedDistance,
        normalizedSpeed,
        normalizedHeight,
        isBird ? 1 : 0,
        relativeHeight,
        gameState.tRex.jumping ? 1 : 0,
        obstacle.width / 100,
        gameState.tRex.y / gameState.canvas.height,
    ];
}

/**
 * Make decision about jumping based on current parameters
 * @param {Object} gameState - Current game state
 * @param {Object} obstacle - Nearest obstacle
 * @returns {Object} Decision object with shouldJump flag and explanation
 */
export function makeDecision(gameState, obstacle) {
    if (!gameState || !obstacle) {
        return { shouldJump: false, reason: "No valid state" };
    }

    if (gameState.tRex.jumping) {
        return { shouldJump: false, reason: "Currently jumping" };
    }

    const distance = obstacle.x - (gameState.tRex.x + gameState.tRex.width);
    const speedFactor = Math.max(1, gameState.speed / 7);
    const isBird = obstacle.isBird;
    const isCactus = !isBird;

    let shouldJump = false;
    let reason = "";
    let thresholdCalc = "";

    // Record the state for reinforcement learning
    const features = extractFeatures(gameState, obstacle);

    if (isCactus) {
        if (obstacle.height < 50) {
            // Small cactus
            const threshold =
                currentParams.smallCactusThresholdBase * speedFactor * currentParams.smallCactusHeightFactor;

            shouldJump = distance < threshold;
            reason = shouldJump ? "Small Cactus - Jump" : "Small Cactus - Keep Running";
            thresholdCalc = `Threshold=${threshold.toFixed(1)} (${
                currentParams.smallCactusThresholdBase
            }×${speedFactor.toFixed(2)}×${currentParams.smallCactusHeightFactor})`;
        } else {
            // Large cactus
            const threshold =
                currentParams.largeCactusThresholdBase * speedFactor * currentParams.largeCactusHeightFactor;

            shouldJump = distance < threshold;
            reason = shouldJump ? "Large Cactus - Jump" : "Large Cactus - Keep Running";
            thresholdCalc = `Threshold=${threshold.toFixed(1)} (${
                currentParams.largeCactusThresholdBase
            }×${speedFactor.toFixed(2)}×${currentParams.largeCactusHeightFactor})`;
        }
    } else if (isBird) {
        const birdY = obstacle.y;
        const canvasHeight = gameState.canvas.height || 150;
        const birdRelativeHeight = typeof birdY === "number" && canvasHeight > 0 ? birdY / canvasHeight : 0.5;

        if (birdRelativeHeight > 0.8) {
            // Lowest flying bird
            const threshold = currentParams.lowestBirdThreshold;
            shouldJump = distance < threshold;
            reason = "Lowest Zone Bird";
            thresholdCalc = `Threshold=${threshold} (fixed value)`;
        } else if (birdRelativeHeight > 0.7 && birdRelativeHeight <= 0.8) {
            // Bottom zone bird
            const jumpDistance = Math.min(
                currentParams.bottomBirdMaxThreshold,
                currentParams.bottomBirdBaseThreshold + gameState.speed * currentParams.bottomBirdSpeedFactor
            );
            shouldJump = distance < jumpDistance;
            reason = "Bottom Zone Bird";
            thresholdCalc = `Threshold=${jumpDistance.toFixed(1)} (min(${currentParams.bottomBirdMaxThreshold}, ${
                currentParams.bottomBirdBaseThreshold
            }+${gameState.speed.toFixed(1)}×${currentParams.bottomBirdSpeedFactor}))`;
        } else if (birdRelativeHeight > 0.6 && birdRelativeHeight <= 0.7) {
            // Medium-bottom zone bird
            const jumpDistance =
                currentParams.mediumBottomBirdBaseThreshold +
                gameState.speed * currentParams.mediumBottomBirdSpeedFactor;
            shouldJump = distance < jumpDistance;
            reason = "Medium-Bottom Zone Bird";
            thresholdCalc = `Threshold=${jumpDistance.toFixed(1)} (${
                currentParams.mediumBottomBirdBaseThreshold
            }+${gameState.speed.toFixed(1)}×${currentParams.mediumBottomBirdSpeedFactor})`;
        } else if (birdRelativeHeight > 0.5 && birdRelativeHeight <= 0.6) {
            // Middle zone bird
            const tRexJumpApex = canvasHeight * 0.55;
            if (Math.abs(birdY - tRexJumpApex) < 10 && distance < 40) {
                shouldJump = false;
                reason = "Middle Zone Bird - Avoid";
                thresholdCalc = `Jump apex diff=${Math.abs(birdY - tRexJumpApex).toFixed(1)} < 10`;
            } else {
                const jumpDistance =
                    currentParams.middleBirdBaseThreshold + gameState.speed * currentParams.middleBirdSpeedFactor;
                shouldJump = distance < jumpDistance;
                reason = "Middle Zone Bird - Jump";
                thresholdCalc = `Threshold=${jumpDistance.toFixed(1)} (${
                    currentParams.middleBirdBaseThreshold
                }+${gameState.speed.toFixed(1)}×${currentParams.middleBirdSpeedFactor})`;
            }
        } else if (birdRelativeHeight > 0.4 && birdRelativeHeight <= 0.5) {
            // Medium-high zone bird
            const jumpDistance =
                currentParams.mediumTopBirdBaseThreshold + gameState.speed * currentParams.mediumTopBirdSpeedFactor;
            shouldJump = distance < jumpDistance;
            reason = "Medium-Top Zone Bird";
            thresholdCalc = `Threshold=${jumpDistance.toFixed(1)} (${
                currentParams.mediumTopBirdBaseThreshold
            }+${gameState.speed.toFixed(1)}×${currentParams.mediumTopBirdSpeedFactor})`;
        } else {
            // High flying bird
            shouldJump = false;
            reason = "High Zone Bird - No Jump Needed";
            thresholdCalc = `Relative height=${birdRelativeHeight.toFixed(2)} < 0.4`;
        }
    } else {
        // PCA-based decision
        const heightFactor = obstacle.height / currentParams.pcaHeightFactor;
        const distanceFactor = distance / currentParams.pcaDistanceFactor;
        const combinedFactor = distanceFactor - currentParams.pcaHeightWeight * heightFactor;
        shouldJump = combinedFactor < currentParams.pcaThreshold;
        reason = "Neural PCA Decision";
        thresholdCalc = `${distanceFactor.toFixed(2)}-${currentParams.pcaHeightWeight}×${heightFactor.toFixed(
            2
        )}=${combinedFactor.toFixed(2)} < ${currentParams.pcaThreshold}`;
    }

    // Save state and action for reinforcement learning
    if (features) {
        currentEpisode.push({
            features,
            action: shouldJump ? 1 : 0,
            state: {
                distance,
                speed: gameState.speed,
                obstacle: {
                    type: isBird ? "bird" : "cactus",
                    height: obstacle.height,
                    y: obstacle.y,
                },
            },
        });
    }

    return {
        shouldJump,
        reason,
        distance,
        obstacleType: isBird ? "Bird" : "Cactus",
        obstacleHeight: obstacle.height,
        obstacleY: obstacle.y,
        thresholdCalc,
        neural: true,
    };
}

/**
 * Record reward signal (score change)
 * @param {number} score - Current game score
 */
export function recordReward(score) {
    if (typeof score !== "number") return;

    const scoreChange = score - lastScore;

    if (scoreChange > 0) {
        // Positive reward for score increase
        episodeReward += scoreChange * 1.5;
    }

    lastScore = score;
}

/**
 * Game over - finalize episode and learn from it
 * @param {number} finalScore - Final score for the episode
 * @returns {Promise<Object>} Training statistics
 */
export async function finalizeEpisode(finalScore) {
    episodeCount++;

    // Only train if we have enough data
    if (currentEpisode.length < 5) {
        console.log("Not enough data for training");
        resetTrainingData();
        return { trained: false, reason: "Not enough data" };
    }

    console.log(
        `Episode ${episodeCount} completed with score ${finalScore} and ${currentEpisode.length} decision points`
    );

    // Calculate returns for each step (reward is the final score)
    // This assigns the episode's score as a reward proportionally to all actions
    const discountFactor = 0.97;
    let returns = new Array(currentEpisode.length).fill(0);

    // Assign immediate rewards based on survival
    for (let i = 0; i < currentEpisode.length; i++) {
        returns[i] = (Math.pow(discountFactor, currentEpisode.length - i - 1) * finalScore) / 100;
    }

    // Add returns and episode data to training buffer
    for (let i = 0; i < currentEpisode.length; i++) {
        trainingData.inputs.push(currentEpisode[i].features);
        trainingData.targets.push(currentEpisode[i].action);
        trainingData.rewards.push(returns[i]);
    }

    // Update parameters if we have enough data
    if (trainingData.inputs.length >= 100) {
        try {
            // Sample from buffer with preference for high-reward experiences
            const batchSize = Math.min(64, trainingData.inputs.length);
            const indices = [];

            // Select indices weighted by reward
            const rewardSum = trainingData.rewards.reduce((a, b) => a + b, 0);
            const rewardProbs = trainingData.rewards.map((r) => r / rewardSum);

            for (let i = 0; i < batchSize; i++) {
                let sampledIdx = 0;
                const threshold = Math.random();
                let cumulativeProb = 0;

                for (let j = 0; j < rewardProbs.length; j++) {
                    cumulativeProb += rewardProbs[j];
                    if (cumulativeProb >= threshold) {
                        sampledIdx = j;
                        break;
                    }
                }

                indices.push(sampledIdx);
            }

            // Extract batch data
            const batchInputs = indices.map((i) => trainingData.inputs[i]);
            const batchTargets = indices.map((i) => trainingData.targets[i]);

            // Convert to tensors
            const xs = tf.tensor2d(batchInputs);
            const ys = tf.tensor2d(batchTargets.map((t) => [t]));

            // Train the model to predict actions
            const result = await model.fit(xs, ys, {
                epochs: 1,
                batchSize: batchSize,
                shuffle: true,
                verbose: 0,
            });

            // Update parameters based on network prediction
            await updateParameters();

            // Clean up tensors
            xs.dispose();
            ys.dispose();

            // If buffer gets too large, keep only most recent experiences
            if (trainingData.inputs.length > 500) {
                trainingData.inputs = trainingData.inputs.slice(-500);
                trainingData.targets = trainingData.targets.slice(-500);
                trainingData.rewards = trainingData.rewards.slice(-500);
            }

            console.log(`Trained on ${batchSize} samples, loss: ${result.history.loss[0].toFixed(4)}`);

            return {
                trained: true,
                samples: batchSize,
                loss: result.history.loss[0],
                episodeCount,
                params: { ...currentParams },
            };
        } catch (error) {
            console.error("Error during training:", error);
            return { trained: false, error: error.message };
        }
    }

    resetTrainingData();
    return { trained: false, reason: "Not enough accumulated data", episodeCount };
}

/**
 * Update game parameters based on neural network output
 */
async function updateParameters() {
    try {
        // Generate random test features to get parameter adjustments
        const testFeatures = [];
        for (let i = 0; i < 10; i++) {
            testFeatures.push([
                Math.random(), // distance
                Math.random() * 0.8, // speed
                Math.random(), // height
                Math.round(Math.random()), // isBird
                Math.random(), // relativeHeight
                0, // not jumping
                Math.random() * 0.5, // width
                Math.random() * 0.2 + 0.8, // tRex y position
            ]);
        }

        // Get network predictions for parameter adjustments
        const predictions = model.predict(tf.tensor2d(testFeatures));
        const paramAdjustments = await predictions.array();
        predictions.dispose();

        // Average the adjustments
        const avgAdjustment = [];
        for (let i = 0; i < Object.keys(defaultParams).length; i++) {
            avgAdjustment[i] = paramAdjustments.reduce((sum, adj) => sum + adj[i], 0) / paramAdjustments.length;
        }

        // Update parameters
        const paramKeys = Object.keys(defaultParams);

        for (let i = 0; i < paramKeys.length; i++) {
            const key = paramKeys[i];
            const defaultValue = defaultParams[key];

            // Apply scaled adjustment to parameter (tanh output is between -1 and 1)
            // Scale the adjustment based on parameter type
            let adjustmentScale = 0.15; // 15% adjustment scale by default

            // Increase scale for base thresholds
            if (key.includes("Threshold")) {
                adjustmentScale = 0.25;
            }

            // Smaller adjustments for factors
            if (key.includes("Factor")) {
                adjustmentScale = 0.08;
            }

            // Apply the adjustment
            currentParams[key] = defaultValue * (1 + avgAdjustment[i] * adjustmentScale);

            // Ensure value stays reasonable (not too far from default)
            const minValue = defaultValue * 0.5;
            const maxValue = defaultValue * 1.5;
            currentParams[key] = Math.max(minValue, Math.min(maxValue, currentParams[key]));
        }

        // Save parameter adjustments for visualization
        paramsBuffer.push({ ...currentParams });
        if (paramsBuffer.length > 20) {
            paramsBuffer.shift();
        }

        console.log("Parameters updated by neural network");
    } catch (error) {
        console.error("Error updating parameters:", error);
    }
}

/**
 * Get neural network model summary and current parameters
 * @returns {Object} Model information
 */
export function getModelInfo() {
    return {
        episodes: episodeCount,
        trainingData: {
            samples: trainingData.inputs.length,
            bufferSize: paramsBuffer.length,
        },
        currentParams: { ...currentParams },
        paramHistory: paramsBuffer.slice(-5), // Return last 5 parameter sets
        learningRate,
    };
}

/**
 * Get neural network visualization data
 * @returns {Object} Visualization data
 */
export function getVisualizationData() {
    // Calculate parameter changes over time
    const paramChanges = {};
    const paramKeys = Object.keys(defaultParams);

    paramKeys.forEach((key) => {
        paramChanges[key] = {
            current: currentParams[key],
            default: defaultParams[key],
            percentChange: (((currentParams[key] - defaultParams[key]) / defaultParams[key]) * 100).toFixed(1) + "%",
            history: paramsBuffer.map((p) => p[key]),
        };
    });

    return {
        episodeCount,
        paramChanges,
        trainingSize: trainingData.inputs.length,
    };
}
