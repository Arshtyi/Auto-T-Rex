// UI Module - Responsible for creating and updating game interface elements

/**
 * Create information panel
 * @param {Object} page - Playwright page object
 */
export async function createInfoPanel(page) {
    await page.evaluate(() => {
        // Remove existing panel if it exists
        const existingPanel = document.getElementById("ai-info-panel");
        if (existingPanel) {
            existingPanel.remove();
        }

        const style = document.createElement("style");
        style.textContent = `
            :root {
                --primary-color: #4dabf7;
                --secondary-color: #ffcc00;
                --accent-color: #ff5252;
                --bg-dark: rgba(20, 20, 30, 0.85);
                --bg-panel: rgba(30, 30, 40, 0.8);
                --bg-card: rgba(40, 40, 50, 0.7);
                --border-color: rgba(100, 100, 150, 0.4);
                --text-primary: #ffffff;
                --text-secondary: #cccccc;
                --font-mono: 'Consolas', 'Monaco', 'Courier New', monospace;
                --success-color: #2ecc71;
                --warning-color: #f39c12;
                --danger-color: #e74c3c;
            }

            body[data-theme="light"] {
                --bg-dark: rgba(240, 240, 245, 0.85);
                --bg-panel: rgba(230, 230, 235, 0.8);
                --bg-card: rgba(220, 220, 225, 0.7);
                --border-color: rgba(150, 150, 200, 0.4);
                --text-primary: #333333;
                --text-secondary: #666666;
                --primary-color: #0066cc;
                --secondary-color: #ff9900;
                --success-color: #27ae60;
                --warning-color: #e67e22;
                --danger-color: #c0392b;
            }

            #ai-info-panel {
                position: fixed;
                top: 15px;
                right: 15px;
                background-color: var(--bg-dark);
                color: var(--text-primary);
                padding: 15px;
                border-radius: 12px;
                font-family: system-ui, -apple-system, sans-serif;
                font-size: 14px;
                z-index: 9999;
                width: 480px; /* Significantly increased width */
                max-height: 85vh;
                overflow-y: auto;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                border: 1px solid var(--border-color);
                transition: all 0.3s ease;
                backdrop-filter: blur(5px); /* Added background blur effect */
            }

            .panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                border-bottom: 1px solid var(--border-color);
                padding-bottom: 10px;
            }

            .panel-header::after {
                content: '';
                position: absolute;
                top: 50px;
                right: 15px;
                left: 15px;
                height: 1px;
                background: linear-gradient(to right, transparent, var(--border-color), transparent);
            }
            
            .panel-title {
                font-size: 18px;
                letter-spacing: 0.7px;
                background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                text-shadow: 0px 1px 1px rgba(0,0,0,0.1);
                margin: 0;
                display: flex;
                align-items: center;
            }

            .panel-title .icon {
                margin-right: 8px;
            }

            .panel-controls {
                display: flex;
                gap: 5px;
            }

            .panel-btn {
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 4px;
                background: var(--bg-card);
                color: var(--secondary-color);
                border: 1px solid var(--border-color);
                transition: all 0.2s ease;
            }

            .panel-btn:hover {
                background: var(--secondary-color);
                color: var(--bg-dark);
            }

            .card {
                background-color: var(--bg-card);
                border-radius: 12px; /* Increased border radius */
                padding: 18px; /* Increased padding */
                margin-bottom: 18px; /* Increased margin */
                border: 1px solid var(--border-color);
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); /* Enhanced shadow */
                position: relative;
                overflow: hidden;
            }

            .card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(to right, transparent, var(--primary-color), transparent);
                opacity: 0;
                transition: opacity 0.3s ease;
                border-radius: 12px 12px 0 0;
            }
            
            .card:hover {
                transform: translateY(-2px); /* Added hover effect */
                box-shadow: 0 5px 12px rgba(0, 0, 0, 0.2);
            }

            .card:hover::before {
                opacity: 1;
            }

            .card-header {
                font-size: 16px; /* Increased font size */
                font-weight: bold;
                margin-bottom: 15px; /* Increased margin */
                color: var(--primary-color);
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-bottom: 10px; /* Increased bottom padding */
                border-bottom: 1px solid var(--border-color); /* Added bottom separator */
                letter-spacing: 0.5px; /* Added letter spacing */
                cursor: pointer; /* 添加指针样式，表示可点击 */
            }
            
            /* 添加折叠图标样式 */
            .collapse-icon {
                font-size: 16px;
                transition: transform 0.3s ease;
                margin-left: 8px;
                color: var(--text-secondary);
                user-select: none;
            }
            
            /* 添加卡片内容容器样式 */
            .card-content {
                transition: max-height 0.3s ease, opacity 0.3s ease;
                max-height: 800px;
                opacity: 1;
                overflow: hidden;
            }
            
            /* 折叠状态样式 */
            .card-collapsed .card-content {
                max-height: 0;
                opacity: 0;
                margin: 0;
                padding: 0;
            }
            
            /* 折叠状态下的图标旋转 */
            .card-collapsed .collapse-icon {
                transform: rotate(-90deg);
            }
            
            /* 调整卡片头部在折叠状态下的样式 */
            .card-collapsed .card-header {
                margin-bottom: 0;
                border-bottom: none;
            }

            .stats-row {
                display: flex;
                justify-content: space-between;
                margin: 8px 0; /* Increased top/bottom margin */
                color: var(--text-secondary);
                padding: 4px 0; /* Added top/bottom padding */
                font-size: 14px; /* Set appropriate font size */
                align-items: center; /* Ensure vertical centering */
            }

            .stat-value {
                color: var(--primary-color);
                font-weight: bold;
                text-align: right; /* Ensure numbers are right-aligned */
                flex: 0 0 auto; /* Prevent width from shrinking */
                min-width: 180px; /* Increased min-width for wider panel */
                max-width: 65%; /* Set max-width percentage */
                word-break: break-word; /* Allow long text to wrap if necessary */
            }

            .formula-container {
                font-family: var(--font-mono);
                font-size: 14px; /* Increased font size */
                line-height: 1.6; /* Increased line height */
                padding: 15px; /* Increased padding */
                background-color: rgba(0, 0, 0, 0.15); /* Slightly darker background */
                border-radius: 10px; /* Increased border radius */
                border-left: 4px solid var(--accent-color); /* Bolded left border */
                white-space: pre-wrap;
                overflow-x: auto;
                margin-top: 8px; /* Increased top margin */
                color: var(--text-primary); /* Ensure consistent text color */
                max-height: 250px; /* Increased max height */
                overflow-y: auto; /* Added vertical scrollbar */
                box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1); /* Added inner shadow */
            }

            .obstacle-info {
                padding: 8px;
                background-color: rgba(0, 0, 0, 0.1);
                border-radius: 6px;
                margin-top: 8px;
            }

            .project-link {
                color: var(--primary-color);
                text-decoration: none;
                font-weight: bold;
                display: inline-block;
                margin-top: 5px;
                transition: color 0.2s ease;
            }

            .project-link:hover {
                color: var(--secondary-color);
                text-decoration: underline;
            }

            .jump-decision {
                margin-top: 5px;
                padding: 5px 10px; /* Increased padding */
                border-radius: 6px; /* Increased border radius */
                display: inline-block;
                font-weight: bold;
                font-size: 13px; /* Increased font size */
                text-align: center; /* Center text */
                min-width: 50px; /* Set min-width */
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); /* Added subtle shadow */
            }

            .jump-yes {
                background-color: rgba(40, 200, 40, 0.25); /* Slightly darker background */
                color: #2ecc71;
                border: 1px solid rgba(46, 204, 113, 0.3); /* Added border */
            }

            .jump-no {
                background-color: rgba(200, 40, 40, 0.25); /* Slightly darker background */
                color: #e74c3c;
                border: 1px solid rgba(231, 76, 60, 0.3); /* Added border */
            }

            .status-indicator {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                display: inline-block;
                background-color: var(--warning-color); /* Default yellow, indicates waiting */
            }

            .status-active {
                background-color: var(--success-color); /* Green, indicates active state */
                box-shadow: 0 0 5px var(--success-color);
                animation: pulse 1.5s infinite;
            }

            .stats-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 8px;
            }
            
            .two-column {
                grid-template-columns: 1fr 1fr; /* Project info card uses two-column layout */
                gap: 12px;
            }
            
            .two-column .stats-row {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .two-column .stat-value {
                margin-top: 5px;
                text-align: left;
                min-width: auto;
                max-width: 100%;
            }

            .small-text {
                font-size: 12px;
                line-height: 1.3;
            }

            @keyframes pulse {
                0% {
                    box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.4);
                }
                70% {
                    box-shadow: 0 0 0 5px rgba(46, 204, 113, 0);
                }
                100% {
                    box-shadow: 0 0 0 0 rgba(46, 204, 113, 0);
                }
            }

            /* 添加响应式布局 */
            @media (max-width: 1200px) {
                #ai-info-panel {
                    width: 450px;
                }
            }
            
            @media (max-width: 900px) {
                #ai-info-panel {
                    width: 400px;
                }
            }
            
            @media (max-width: 768px) {
                #ai-info-panel {
                    width: 360px;
                    font-size: 13px;
                }
                
                .card {
                    padding: 15px;
                    margin-bottom: 15px;
                }
                
                .card-header {
                    font-size: 14px;
                }
                
                .stat-value {
                    min-width: 150px;
                }
            }
            
            @media (max-width: 480px) {
                #ai-info-panel {
                    width: 320px;
                    right: 10px;
                    top: 10px;
                }
                
                .stat-value {
                    min-width: 120px;
                }
            }

            .game-over {
                animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                transform: translate3d(0, 0, 0);
                border: 2px solid var(--danger-color) !important;
            }

            @keyframes shake {
                10%, 90% {
                    transform: translate3d(-1px, 0, 0);
                }
                20%, 80% {
                    transform: translate3d(2px, 0, 0);
                }
                30%, 50%, 70% {
                    transform: translate3d(-4px, 0, 0);
                }
                40%, 60% {
                    transform: translate3d(4px, 0, 0);
                }
            }

            /* 增强可点击元素的样式 */
            .panel-btn, .project-link {
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
                overflow: hidden;
            }

            .panel-btn:after, .project-link:after {
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0;
                left: -100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: 0.5s;
            }

            .panel-btn:hover:after, .project-link:hover:after {
                left: 100%;
            }
        `;
        document.head.appendChild(style);
        const panel = document.createElement("div");
        panel.id = "ai-info-panel";

        panel.innerHTML = `
            <div class="panel-header">
                <h3 class="panel-title"><span class="icon">🦖</span> T-Rex AI Control Panel</h3>
                <div class="panel-controls">
                    <div class="panel-btn" id="theme-toggle" title="Toggle Theme">🎨</div>
                    <div class="panel-btn" id="minimize-panel" title="Minimize">_</div>
                </div>
            </div>

            <div class="card" id="game-stats">
                <div class="card-header">
                    <span>Game Statistics</span>
                    <span class="collapse-icon">▼</span>
                </div>
                <div class="card-content">
                    <div class="stats-grid">
                        <div class="stats-row">
                            <span>Iteration:</span>
                            <span id="iteration-count" class="stat-value">0</span>
                        </div>
                        <div class="stats-row">
                            <span>Current Score:</span>
                            <span id="current-score" class="stat-value">0</span>
                        </div>
                        <div class="stats-row">
                            <span>Highest Score:</span>
                            <span id="high-score" class="stat-value">0</span>
                        </div>
                        <div class="stats-row">
                            <span>Game Speed:</span>
                            <span id="game-speed" class="stat-value">0</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card" id="ai-decision">
                <div class="card-header">
                    <span>AI Decision Analysis</span>
                    <div style="display: flex; align-items: center;">
                        <span id="decision-status" class="status-indicator"></span>
                        <span class="collapse-icon" style="margin-left: 10px;">▼</span>
                    </div>
                </div>
                <div class="card-content">
                    <div id="obstacle-container">
                        <div class="stats-row">
                            <span>Obstacle Type:</span>
                            <span id="obstacle-info" class="stat-value">None</span>
                        </div>
                        <div class="stats-row">
                            <span>Obstacle Distance:</span>
                            <span id="obstacle-distance" class="stat-value">0</span>
                        </div>
                        <div class="stats-row">
                            <span>AI Decision:</span>
                            <span id="jump-decision" class="stat-value">Waiting</span>
                        </div>
                        <div class="stats-row">
                            <span>Decision Reason:</span>
                            <span id="decision-reason" class="stat-value">-</span>
                        </div>
                        <div class="stats-row">
                            <span>Threshold Calculation:</span>
                            <span id="threshold-calc" class="stat-value small-text">-</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card" id="math-model">
                <div class="card-header">
                    <span>Mathematical Model & Algorithm Analysis</span>
                    <span class="collapse-icon">▼</span>
                </div>
                <div class="card-content">
                    <div id="formula-display" class="formula-container">Loading mathematical model...</div>
                </div>
            </div>

            <div class="card" id="project-info">
                <div class="card-header">
                    <span>Project Information</span>
                    <span class="collapse-icon">▼</span>
                </div>
                <div class="card-content">
                    <div class="stats-grid two-column">
                        <div class="stats-row">
                            <span>Project Name:</span>
                            <span class="stat-value">Auto-T-Rex</span>
                        </div>
                        <div class="stats-row">
                            <span>Version:</span>
                            <span class="stat-value">1.0.0</span>
                        </div>
                        <div class="stats-row">
                            <span>GitHub:</span>
                            <span>
                                <a href="https://github.com/Arshtyi/Auto-T-Rex" class="project-link" target="_blank">Arshtyi/Auto-T-Rex</a>
                            </span>
                        </div>
                        <div class="stats-row">
                            <span>License:</span>
                            <span class="stat-value">MIT</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(panel);

        // 初始化事件监听器
        const themeToggle = document.getElementById("theme-toggle");
        if (themeToggle) {
            themeToggle.addEventListener("click", () => {
                const currentTheme = document.body.getAttribute("data-theme") || "dark";
                document.body.setAttribute("data-theme", currentTheme === "dark" ? "light" : "dark");
            });
        }

        const minimizeBtn = document.getElementById("minimize-panel");
        if (minimizeBtn) {
            minimizeBtn.addEventListener("click", () => {
                const panel = document.getElementById("ai-info-panel");
                if (panel.classList.contains("minimized")) {
                    panel.classList.remove("minimized");
                    panel.style.width = "480px"; // Use updated width
                    panel.style.height = "auto";
                    minimizeBtn.textContent = "_";
                    minimizeBtn.title = "Minimize";
                } else {
                    panel.classList.add("minimized");
                    const header = panel.querySelector(".panel-header");
                    panel.style.width = "200px"; // Slightly increase minimized width
                    panel.style.height = header ? header.offsetHeight + "px" : "40px";
                    minimizeBtn.textContent = "□";
                    minimizeBtn.title = "Restore";
                }
            });
        }

        // 添加卡片折叠功能
        const cards = document.querySelectorAll(".card");
        cards.forEach((card) => {
            const header = card.querySelector(".card-header");
            if (header) {
                header.addEventListener("click", () => {
                    card.classList.toggle("card-collapsed");
                });
            }
        });

        // 添加 GitHub 链接的点击处理
        const projectLink = document.querySelector(".project-link");
        if (projectLink) {
            projectLink.addEventListener("click", (e) => {
                // Prevent default behavior since links can't be opened in offline mode
                e.preventDefault();
                // Show information message
                alert("Project URL: https://github.com/Arshtyi/Auto-T-Rex\n(Cannot open links in offline mode)");
            });
        }

        console.log("T-Rex AI Control Panel created");
    });
}

/**
 * Update information panel
 * @param {Object} page - Playwright page object
 * @param {Object} data - Data to update
 */
export async function updateInfoPanel(page, data) {
    await page.evaluate((data) => {
        // Update basic game statistics
        if (document.getElementById("iteration-count")) {
            document.getElementById("iteration-count").textContent = data.iteration || "0";
        }
        if (document.getElementById("current-score")) {
            document.getElementById("current-score").textContent = data.currentScore || "0";
        }
        if (document.getElementById("high-score")) {
            document.getElementById("high-score").textContent = data.highScore || "0";
        }
        if (document.getElementById("game-speed")) {
            document.getElementById("game-speed").textContent = data.speed ? data.speed.toFixed(2) : "0";
        }

        // Update obstacle information
        if (document.getElementById("obstacle-info") && data.obstacleInfo) {
            document.getElementById("obstacle-info").textContent = data.obstacleInfo;
        }
        if (document.getElementById("obstacle-distance") && typeof data.distance !== "undefined") {
            document.getElementById("obstacle-distance").textContent = data.distance.toFixed(1);
        }

        // 更新决策信息
        if (document.getElementById("jump-decision") && typeof data.shouldJump !== "undefined") {
            const jumpElement = document.getElementById("jump-decision");
            jumpElement.textContent = data.shouldJump ? "Jump" : "No Jump";
            jumpElement.className = data.shouldJump ? "jump-decision jump-yes" : "jump-decision jump-no";

            // Update status indicator
            const statusIndicator = document.getElementById("decision-status");
            if (statusIndicator) {
                statusIndicator.className = "status-indicator status-active";
                // Reset to default state after 5 seconds
                setTimeout(() => {
                    statusIndicator.className = "status-indicator";
                }, 5000);
                // 已移除自动展开功能
            }
        }
        if (document.getElementById("decision-reason") && data.reason) {
            document.getElementById("decision-reason").textContent = data.reason;
        }

        if (document.getElementById("threshold-calc") && data.thresholdCalc) {
            document.getElementById("threshold-calc").textContent = data.thresholdCalc;
        }

        // Handle game over state
        if (data.gameOver) {
            const panel = document.getElementById("ai-info-panel");
            if (panel) {
                // Add visual feedback when game is over
                panel.classList.add("game-over");
                setTimeout(() => {
                    panel.classList.remove("game-over");
                }, 2000);

                // 已移除游戏结束时自动展开卡片的功能
            }
        }

        // Handle game reset state
        if (data.gameReset) {
            // Reset all states and displays
            if (document.getElementById("obstacle-info")) {
                document.getElementById("obstacle-info").textContent = "None";
            }
            if (document.getElementById("obstacle-distance")) {
                document.getElementById("obstacle-distance").textContent = "0";
            }
            if (document.getElementById("jump-decision")) {
                document.getElementById("jump-decision").textContent = "Waiting";
                document.getElementById("jump-decision").className = "stat-value";
            }
            if (document.getElementById("decision-reason")) {
                document.getElementById("decision-reason").textContent = "-";
            }
            if (document.getElementById("threshold-calc")) {
                document.getElementById("threshold-calc").textContent = "-";
            }
            if (document.getElementById("formula-display")) {
                document.getElementById("formula-display").textContent = "Game reset, waiting for new analysis...";
            }
        }
    }, data);
}

/**
 * Update formula display
 * @param {Object} page - Playwright page object
 * @param {Object} formulas - Formulas to display
 */
export async function updateFormulaDisplay(page, formulas) {
    await page.evaluate((formulas) => {
        const formulaContainer = document.getElementById("formula-display");
        if (formulaContainer) {
            let formulaText = "";

            if (formulas.jumpThreshold) {
                formulaText += `Current Decision: ${formulas.jumpThreshold}\n\n`;
            }

            if (formulas.cactus) {
                formulaText += `Cactus Decision Formula:\n${formulas.cactus}\n\n`;
            }

            if (formulas.bird) {
                formulaText += `Bird Decision Formula:\n${formulas.bird}\n\n`;
            }

            if (formulas.pca) {
                formulaText += `Principal Component Analysis:\n${formulas.pca}`;
            }

            formulaContainer.textContent = formulaText || "No mathematical formulas available";

            // 已移除新公式更新时自动展开卡片的功能
        }
    }, formulas);
}
