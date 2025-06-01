# Auto T-Rex Player

This project is an AI that automatically plays the Chrome Dinosaur Game.

## Environment Requirements

-   Node.js
-   npm

## Setup and Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/Arshtyi/Auto-T-Rex.git
    cd Auto-T-Rex
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

## How to Run

To start the AI player, run the following command in the project directory:

```bash
npm start
```

This will:

1. Open a new Chrome browser window.
2. Navigate to the `chrome://dino` page (the offline dinosaur game).
3. Automatically start playing the game.
4. Display an AI Control Panel with real-time game statistics and decision-making insights.

Press `Ctrl+C` in the terminal to stop the program.

## Implementation Details

The project is built using Node.js and relies on the Playwright library for browser automation.

### Core Modules:

-   **`main.js`**: The main entry point of the application. It initializes Playwright, opens the game, and starts the auto-play loop.
-   **`src/js/openWeb.js`**: Handles the browser and page setup, including navigating to the game and injecting necessary scripts.
-   **`src/js/play.js`**: Contains the primary game-playing logic. It continuously:
    -   Retrieves the current game state (T-Rex position, speed, obstacle locations).
    -   Analyzes obstacles to decide whether to jump or not.
    -   Executes jump actions by simulating keyboard presses.
    -   Updates the UI with game information.
-   **`src/js/ui.js`**: Manages the dynamic information panel displayed on the game page. This panel shows:
    -   Game Statistics (iteration, current score, highest score, game speed).
    -   AI Decision Analysis (obstacle type, distance, AI decision, reason, threshold calculation).
    -   Mathematical Model & Algorithm Analysis (formulas used for decision making).
    -   Project Information.
-   **`src/js/analytics.js`**: Collects and processes game data for analysis and provides formulas for the UI.

### Game State Retrieval:

The AI accesses the game's internal state by executing JavaScript code within the browser context using `page.evaluate()`. This allows it to get information like:

-   T-Rex's position and status (e.g., jumping, ducking).
-   Positions, types (cactus, bird), and dimensions of upcoming obstacles.
-   Current game speed.
-   Score.

### Decision-Making Logic (`analyzeObstacles` function in `src/js/play.js`):

The core decision-making process involves:

1. **Identifying the nearest obstacle**: The AI focuses on the closest obstacle in front of the T-Rex.
2. **Calculating distance**: The horizontal distance to the nearest obstacle is a key factor.
3. **Considering game speed**: The game speeds up over time, so jump decisions must adapt. A `speedFactor` is calculated.
4. **Obstacle-specific strategies**:
    - **Cacti**:
        - The jump threshold is adjusted based on the cactus's height (smaller cacti can be jumped later).
        - Formula: `distance < (base_threshold * speedFactor * height_adjustment_factor)`
    - **Birds (Pterodactyls)**:
        - Bird altitude is crucial. The AI uses different jump thresholds and strategies based on whether the bird is flying low, medium, or high.
        - For very high birds, the AI will not jump.
        - For birds at a height that might collide with the T-Rex at the apex of its jump, the AI might decide not to jump if the bird is close.
        - Formulas involve `distance`, `speed`, and `relativeHeight` of the bird.
5. **Jump execution**: If the analysis determines a jump is necessary, the AI simulates pressing the "Space" key.
6. **Cooldown**: A short timeout is applied after a jump to prevent accidental double jumps and allow the T-Rex to land.

### UI Panel:

The information panel is dynamically created and updated using DOM manipulation within the `page.evaluate()` context. It provides a transparent view into the AI's "thought process" and the game's current state. It also includes a theme toggle (dark/light) and a minimize button.

## Principles of Operation

1. **Browser Automation**: Playwright launches and controls a Chrome browser instance.
2. **Game State Injection & Extraction**:
    - The game's `Runner.instance_.gameOver()` and `Runner.instance_.restart()` functions are overridden to allow the AI to detect game over and reset states.
    - Game variables (like `Runner.instance_.horizon.obstacles`, `tRex.xPos`, `currentSpeed`) are read directly from the game's JavaScript environment.
3. **Real-time Analysis**: In a continuous loop, the AI fetches the game state, analyzes it, makes a decision, and acts.
4. **Dynamic Thresholds**: Jump decisions are not based on fixed distances. Instead, they use dynamic thresholds that take into account the current game speed and the specific characteristics (type, height, position) of the obstacles. This makes the AI more adaptive to the increasing difficulty of the game.
5. **Data Collection**: The `analytics.js` module is designed to record game events like scores, speeds, and obstacle encounters, which can be used for further analysis or model training (though advanced model training is not implemented in the current version).
6. **User Interface Feedback**: The UI panel provides immediate visual feedback on what the AI is "seeing" and "thinking," making it easier to understand its behavior and debug the logic.

This project serves as a fun example of applying browser automation and basic decision-making algorithms to play a simple game.
