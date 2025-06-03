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
                padding: 18px;
                border-radius: 15px;
                font-family: system-ui, -apple-system, sans-serif;
                font-size: 14px;
                z-index: 9999;
                width: 580px; /* 进一步增加宽度 */
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
                border: 1px solid var(--border-color);
                transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                backdrop-filter: blur(8px); /* 增加背景模糊效果 */
            }
            
            #ai-info-panel:hover {
                box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
                transform: translateY(-2px);
            }

            .panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                border-bottom: 1px solid var(--border-color);
                padding-bottom: 12px;
                position: relative;
            }

            .panel-header::after {
                content: '';
                position: absolute;
                bottom: -1px;
                right: 0;
                left: 0;
                height: 2px;
                background: linear-gradient(to right, transparent, var(--primary-color), var(--secondary-color), transparent);
                border-radius: 2px;
            }
            
            .panel-title {
                font-size: 20px;
                letter-spacing: 0.7px;
                background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                text-shadow: 0px 2px 2px rgba(0,0,0,0.2);
                margin: 0;
                display: flex;
                align-items: center;
                font-weight: bold;
            }

            .panel-title .icon {
                margin-right: 10px;
                font-size: 24px;
                display: inline-block;
                animation: bounce 1s infinite alternate ease-in-out;
            }
            
            @keyframes bounce {
                0% { transform: translateY(0); }
                100% { transform: translateY(-5px); }
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            /* 游戏状态卡片样式 */
            .game-stats-container {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin-bottom: 20px;
            }
            
            .stats-card {
                background: linear-gradient(to bottom right, var(--bg-card), rgba(40, 40, 60, 0.8));
                border-radius: 12px;
                padding: 15px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                border: 1px solid var(--border-color);
                transition: all 0.3s ease;
            }
            
            .stats-card:hover {
                transform: translateY(-3px);
                box-shadow: 0 6px 15px rgba(0, 0, 0, 0.25);
            }
            
            .stats-title {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 12px;
                color: var(--primary-color);
                border-bottom: 1px solid var(--border-color);
                padding-bottom: 8px;
                text-align: center;
                letter-spacing: 0.5px;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
            }
            
            .stats-item {
                display: flex;
                flex-direction: column;
                padding: 8px;
                background: rgba(0,0,0,0.1);
                border-radius: 8px;
                transition: all 0.3s ease;
            }
            
            .stats-item:hover {
                background: rgba(0,0,0,0.2);
            }
            
            .stats-label {
                font-size: 12px;
                color: var(--text-secondary);
                margin-bottom: 5px;
            }
            
            .stats-value {
                font-family: var(--font-mono);
                font-weight: bold;
                font-size: 15px;
                color: var(--text-primary);
            }
            
            .stats-value.highlight {
                color: var(--secondary-color);
                font-size: 16px;
                text-shadow: 0 0 5px rgba(255, 204, 0, 0.3);
            }
            
            .action-badge {
                display: inline-block;
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 13px;
                font-weight: bold;
                background-color: var(--bg-panel);
                color: var(--text-secondary);
                transition: all 0.3s ease;
            }
            
            .action-badge.jump {
                background-color: var(--secondary-color);
                color: var(--bg-dark);
                animation: pulse 1s infinite;
            }
            
            /* 公式显示样式 */
            .formula-display {
                background: linear-gradient(to bottom right, var(--bg-card), rgba(40, 40, 60, 0.8));
                border-radius: 12px;
                padding: 15px;
                margin-bottom: 20px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                border: 1px solid var(--border-color);
            }
            
            .formula-header {
                display: flex;
                align-items: center;
                margin-bottom: 12px;
                border-bottom: 1px solid var(--border-color);
                padding-bottom: 10px;
            }
            
            .formula-icon {
                font-size: 20px;
                margin-right: 10px;
                color: var(--primary-color);
            }
            
            .formula-title {
                font-size: 16px;
                font-weight: bold;
                color: var(--primary-color);
                letter-spacing: 0.5px;
            }
            
            .formula-content {
                background: rgba(0,0,0,0.1);
                border-radius: 8px;
                padding: 12px;
                font-family: var(--font-mono);
                font-size: 13px;
                color: var(--text-secondary);
                line-height: 1.6;
                max-height: 100px;
                overflow-y: auto;
                border-left: 3px solid var(--primary-color);
            }
            
            .formula {
                margin-bottom: 5px;
                word-break: break-word;
                transition: all 0.3s ease;
            }
            
            .formula:last-child {
                margin-bottom: 0;
            }
            
            .cactus-formula {
                color: #4dabf7;
            }
            
            .bird-formula {
                color: #ffcc00;
            }
            
            .pca-formula {
                color: #64c2ff;
            }
            
            /* Neural Network Visualization Styles */
            .neural-section {
                background-color: var(--bg-card);
                border-radius: 12px;
                padding: 15px;
                margin-top: 18px;
                border: 1px solid var(--border-color);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
            }
            
            .neural-title {
                font-size: 16px;
                margin-bottom: 12px;
                color: var(--primary-color);
                border-bottom: 1px solid var(--border-color);
                padding-bottom: 8px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .neural-icon {
                margin-right: 6px;
                font-size: 18px;
            }
            
            .neural-stats {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
                margin-bottom: 15px;
                padding: 8px;
                background-color: rgba(0,0,0,0.1);
                border-radius: 8px;
            }
            
            .neural-stat-item {
                display: flex;
                flex-direction: column;
            }
            
            .stat-label {
                font-size: 11px;
                color: var(--text-secondary);
                margin-bottom: 2px;
            }
            
            .stat-value {
                font-family: var(--font-mono);
                font-weight: bold;
            }
            
            .neural-stats-pill {
                background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: bold;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            
            .param-filter {
                display: flex;
                gap: 10px;
                font-size: 12px;
                margin-left: 15px;
            }
            
            .param-filter span {
                cursor: pointer;
                padding: 4px 12px;
                border-radius: 15px;
                background-color: rgba(0,0,0,0.15);
                transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                font-weight: bold;
                letter-spacing: 0.5px;
                display: flex;
                align-items: center;
                position: relative;
                overflow: hidden;
            }
            
            .param-filter span::after {
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0;
                left: -100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: 0.5s;
            }
            
            .param-filter span:hover::after {
                left: 100%;
            }
            
            .param-filter span:hover {
                transform: translateY(-2px);
                box-shadow: 0 3px 6px rgba(0,0,0,0.2);
                background-color: rgba(0,0,0,0.25);
            }
            
            .param-filter span.active {
                background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
                color: white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }
            
            .filter-icon {
                margin-right: 5px;
                font-size: 14px;
            }
            
            /* 改进的参数网格显示 */
            .param-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr); /* 3列参数网格 */
                gap: 12px;
                font-size: 12px;
                margin-top: 15px;
            }
            
            .param-item {
                background: linear-gradient(135deg, rgba(0,0,0,0.1), rgba(0,0,0,0.2));
                padding: 10px 12px;
                border-radius: 10px;
                display: flex;
                flex-direction: column;
                transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                border: 1px solid rgba(100, 100, 150, 0.1);
                box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                position: relative;
                overflow: hidden;
            }
            
            .param-item:hover {
                background: linear-gradient(135deg, rgba(0,0,0,0.15), rgba(0,0,0,0.25));
                transform: translateY(-3px);
                border-color: var(--border-color);
                box-shadow: 0 5px 15px rgba(0,0,0,0.15);
            }
            
            .param-item::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(to right, transparent, var(--primary-color), var(--secondary-color), transparent);
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .param-item:hover::before {
                opacity: 1;
            }
            
            .param-item.cactus-param {
                border-left: 3px solid rgba(77, 171, 247, 0.7);
            }
            
            .param-item.bird-param {
                border-left: 3px solid rgba(255, 204, 0, 0.7);
            }
            
            .param-item.pca-param {
                border-left: 3px solid rgba(100, 200, 100, 0.7);
            }
            
            .param-name {
                font-weight: bold;
                color: var(--secondary-color);
                font-size: 12px;
                margin-bottom: 5px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                display: flex;
                justify-content: space-between;
                align-items: center;
                letter-spacing: 0.5px;
            }
            
            .param-type-icon {
                font-size: 14px;
                margin-right: 6px;
                opacity: 0.8;
            }
            
            .param-value {
                font-family: var(--font-mono);
                font-size: 15px;
                padding: 4px 8px;
                background-color: rgba(0,0,0,0.15);
                border-radius: 4px;
                margin: 4px 0;
                text-align: center;
                box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .param-change {
                font-size: 11px;
                margin-top: 6px;
                padding: 3px 6px;
                border-radius: 12px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                letter-spacing: 0.5px;
                transition: all 0.3s ease;
            }
            
            .param-change-icon {
                margin-right: 4px;
                font-size: 10px;
            }
            
            .param-change.positive {
                color: var(--bg-dark);
                background: linear-gradient(to right, var(--success-color), #27ae60);
                animation: pulse-green 2s infinite;
            }
            
            .param-change.negative {
                color: var(--bg-dark);
                background: linear-gradient(to right, var(--danger-color), #c0392b);
            }
            
            @keyframes pulse-green {
                0% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.4); }
                70% { box-shadow: 0 0 0 4px rgba(46, 204, 113, 0); }
                100% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0); }
            }
            
            /* 添加节点标签和工具提示 */
            .network-node-label {
                position: absolute;
                font-size: 11px;
                color: var(--text-primary);
                white-space: nowrap;
                right: 120%;
                top: 50%;
                transform: translateY(-50%) translateX(10px);
                background-color: rgba(0,0,0,0.5);
                padding: 4px 8px;
                border-radius: 8px;
                opacity: 0;
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                z-index: 15;
                pointer-events: none;
                border: 1px solid var(--border-color);
                font-weight: bold;
                box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                letter-spacing: 0.5px;
            }
            
            .network-node:hover + .network-node-label,
            .network-node:hover .node-tooltip {
                opacity: 1;
                transform: translateY(-50%) translateX(0);
            }
            
            .node-tooltip {
                position: absolute;
                background-color: var(--bg-dark);
                color: var(--text-primary);
                padding: 8px 12px;
                border-radius: 10px;
                font-size: 12px;
                bottom: 130%;
                left: 50%;
                transform: translateX(-50%) translateY(10px);
                white-space: nowrap;
                opacity: 0;
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                z-index: 30;
                pointer-events: none;
                border: 1px solid var(--primary-color);
                box-shadow: 0 6px 15px rgba(0,0,0,0.4);
                min-width: 130px;
                text-align: center;
                letter-spacing: 0.5px;
            }
            
            .node-tooltip::after {
                content: '';
                position: absolute;
                top: 100%;
                left: 50%;
                margin-left: -8px;
                border-width: 8px;
                border-style: solid;
                border-color: var(--bg-dark) transparent transparent transparent;
            }
            
            /* 节点激活动画 */
            @keyframes node-activate {
                0% { box-shadow: 0 0 5px currentColor; transform: scale(1); }
                50% { box-shadow: 0 0 15px currentColor; transform: scale(1.3); }
                100% { box-shadow: 0 0 5px currentColor; transform: scale(1); }
            }
            
            .network-node.active {
                animation: node-activate 0.6s ease-in-out;
            }
            
            /* 改进整体网络可视化容器 */
            .network-viz {
                position: relative;
                width: 100%;
                height: 160px; /* 增加高度提供更多空间 */
                margin: 15px 0;
                background: linear-gradient(to right, rgba(0,0,0,0.05), rgba(0,0,0,0.12), rgba(0,0,0,0.05));
                border-radius: 10px;
                border: 1px solid var(--border-color);
                overflow: hidden;
                transition: all 0.3s ease;
            }
            
            .network-viz:hover {
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            }
            
            /* 神经网络进度条 */
            .neural-progress {
                height: 6px;
                width: 100%;
                background-color: rgba(0,0,0,0.2);
                border-radius: 3px;
                margin-top: 5px;
                overflow: hidden;
                box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
            }
            
            .neural-progress-bar {
                height: 100%;
                background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
                border-radius: 3px;
                transition: width 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                box-shadow: 0 0 8px rgba(77, 171, 247, 0.3);
            }
            
            /* 添加网络脉冲动画 */
            @keyframes network-pulse {
                0% { box-shadow: inset 0 0 10px rgba(77, 171, 247, 0.2); }
                50% { box-shadow: inset 0 0 30px rgba(77, 171, 247, 0.5); }
                100% { box-shadow: inset 0 0 10px rgba(77, 171, 247, 0.2); }
            }
            
            .pulse-animation {
                animation: network-pulse 2s infinite;
            }
            
            /* 添加迭代控制开关样式 */
            .iteration-control {
                display: flex;
                align-items: center;
                margin: 12px 0;
                padding: 12px;
                background: linear-gradient(to right, rgba(0,0,0,0.08), rgba(0,0,0,0.15));
                border-radius: 12px;
                transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                border-left: 3px solid var(--primary-color);
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .iteration-control:hover {
                background: linear-gradient(to right, rgba(0,0,0,0.12), rgba(0,0,0,0.22));
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            
            .iteration-label {
                flex: 1;
                font-size: 15px;
                font-weight: bold;
                background: linear-gradient(to right, var(--text-primary), var(--text-secondary));
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                letter-spacing: 0.5px;
            }
            
            .iteration-status {
                font-size: 12px;
                font-weight: bold;
                padding: 6px 12px;
                border-radius: 12px;
                margin-right: 12px;
                transition: all 0.3s ease;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .iteration-status.active {
                background: linear-gradient(to right, var(--success-color), #20a060);
                color: white;
                animation: pulse-glow 2s infinite alternate;
            }
            
            .iteration-status.paused {
                background: linear-gradient(to right, var(--warning-color), #d35400);
                color: white;
            }
            
            @keyframes pulse-glow {
                from { box-shadow: 0 0 5px rgba(46, 204, 113, 0.5); }
                to { box-shadow: 0 0 15px rgba(46, 204, 113, 0.8); }
            }
            
            .toggle-switch {
                position: relative;
                display: inline-block;
                width: 56px;
                height: 28px;
            }
            
            .toggle-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            
            .toggle-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0,0,0,0.25);
                transition: .4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
                border-radius: 28px;
                box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
            }
            
            .toggle-slider:before {
                position: absolute;
                content: "";
                height: 20px;
                width: 20px;
                left: 4px;
                bottom: 4px;
                background: linear-gradient(135deg, #ffffff, #f0f0f0);
                transition: .4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
                border-radius: 50%;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }
            
            input:checked + .toggle-slider {
                background: linear-gradient(to right, var(--success-color), #20a060);
            }
            
            input:focus + .toggle-slider {
                box-shadow: 0 0 2px var(--success-color);
            }
            
            input:checked + .toggle-slider:before {
                transform: translateX(28px);
            }
            
            .toggle-slider:after {
                content: "✓";
                position: absolute;
                right: 8px;
                top: 6px;
                color: white;
                font-size: 12px;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            input:checked + .toggle-slider:after {
                opacity: 1;
            }
            
            .network-viz {
                height: 220px; /* 大幅增加高度以提供更宽敞的垂直空间 */
                width: 100%;
                background: linear-gradient(to bottom, rgba(0,0,0,0.08), rgba(0,0,0,0.12)); /* 渐变背景 */
                border-radius: 12px;
                margin: 15px 0;
                position: relative;
                overflow: hidden;
                box-shadow: inset 0 0 15px rgba(0,0,0,0.15);
                border: 1px solid var(--border-color);
                transition: all 0.3s ease;
            }
            
            .network-viz:hover {
                box-shadow: inset 0 0 20px rgba(0,0,0,0.2), 0 5px 15px rgba(0,0,0,0.1);
                transform: translateY(-2px);
            }
            
            .network-layer {
                position: absolute;
                display: flex;
                flex-direction: column;
                justify-content: space-around;
                height: 100%;
                padding: 15px 0; /* 顶部和底部添加内边距 */
            }
            
            .network-node {
                width: 22px; /* 更大的节点，显著提高可见性 */
                height: 22px;
                border-radius: 50%;
                background-color: var(--primary-color);
                box-shadow: 0 0 10px var(--primary-color);
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                position: relative;
                border: 1px solid rgba(255, 255, 255, 0.6);
                z-index: 5;
                margin: 8px; /* 增加节点间距 */
                cursor: pointer;
                backdrop-filter: blur(5px);
            }
            
            .network-node:hover {
                transform: scale(1.8);
                z-index: 30;
                box-shadow: 0 0 15px var(--secondary-color), 0 0 30px rgba(255, 255, 255, 0.3);
            }
            
            /* 为不同层的节点添加独特的样式 */
            .network-node[data-layer="input"] {
                background: linear-gradient(135deg, #4dabf7, #2b8ad6);
            }
            
            .network-node[data-layer="hidden1"] {
                background: linear-gradient(135deg, #54d8ff, #2e8aef);
            }
            
            .network-node[data-layer="hidden2"] {
                background: linear-gradient(135deg, #64c2ff, #4a72e5);
            }
            
            .network-node[data-layer="output"] {
                background: linear-gradient(135deg, #ffcc00, #ff9500);
                width: 24px; /* 输出节点更大 */
                height: 24px;
            }
            
            /* 添加节点内部结构 */
            .network-node::after {
                content: '';
                position: absolute;
                top: 15%;
                left: 15%;
                width: 35%;
                height: 35%;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 50%;
                filter: blur(1px);
            }
            
            /* 添加节点脉冲动画 */
            @keyframes node-pulse {
                0% { box-shadow: 0 0 8px currentColor; }
                50% { box-shadow: 0 0 20px currentColor, 0 0 30px rgba(255, 255, 255, 0.3); }
                100% { box-shadow: 0 0 8px currentColor; }
            }
            
            .network-node.active {
                animation: node-pulse 1.2s infinite;
            }
            
            .network-connections {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
                pointer-events: none; /* 防止连接线阻挡节点点击 */
                opacity: 0.9;
            }
            
            /* 优化连接线样式 */
            .network-connection {
                transition: stroke 0.5s ease, stroke-width 0.5s ease, stroke-opacity 0.5s ease;
                stroke-linecap: round;
                filter: drop-shadow(0 0 5px currentColor);
            }
            
            .network-connection.active {
                stroke-width: 3 !important;
                stroke-opacity: 0.95 !important;
                animation: connection-pulse 2s infinite alternate;
            }
            
            @keyframes connection-pulse {
                0% { stroke-opacity: 0.5; filter: drop-shadow(0 0 3px currentColor); }
                100% { stroke-opacity: 0.95; filter: drop-shadow(0 0 12px currentColor); }
            }
            
            /* 改进层布局 */
            .layer-highlight {
                position: absolute;
                width: 42px; /* 更宽的层高亮 */
                height: 90%;
                top: 50%;
                border-radius: 16px;
                z-index: 0;
                opacity: 0.3; /* 半透明 */
                transform: translate(-50%, -50%);
                transition: opacity 0.4s ease;
            }
            
            /* 层标签样式优化 */
            .layer-label {
                position: absolute;
                font-size: 13px;
                color: var(--text-primary);
                text-align: center;
                width: 100%;
                bottom: 5px;
                font-weight: bold;
                text-shadow: 0 1px 3px rgba(0,0,0,0.4);
                background: rgba(0,0,0,0.25);
                padding: 4px 0;
                border-radius: 8px;
                z-index: 10;
                letter-spacing: 0.5px;
            }
            
            /* 添加网络层节点标签 */
            .network-node-label {
                position: absolute;
                font-size: 8px;
                color: var(--text-secondary);
                width: 100%;
                text-align: right;
                right: -15px;
                pointer-events: none;
            }

            /* 美化项目信息和帮助面板 */
            .project-info {
                margin-top: 25px;
                background: linear-gradient(to bottom right, var(--bg-card), rgba(40, 40, 60, 0.8));
                border-radius: 15px;
                padding: 20px;
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
                border: 1px solid var(--border-color);
                position: relative;
                overflow: hidden;
            }
            
            .project-info::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
                border-radius: 3px;
            }
            
            .project-header {
                display: flex;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .project-logo {
                font-size: 32px;
                margin-right: 15px;
                background: linear-gradient(135deg, var(--secondary-color), var(--accent-color));
                width: 60px;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                box-shadow: 0 5px 10px rgba(0,0,0,0.2);
                animation: float 3s ease-in-out infinite;
            }
            
            @keyframes float {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
                100% { transform: translateY(0px); }
            }
            
            .project-title-container {
                flex: 1;
            }
            
            .project-title {
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 5px;
                background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                letter-spacing: 0.5px;
            }
            
            .project-subtitle {
                font-size: 14px;
                color: var(--text-secondary);
                font-style: italic;
            }
            
            .project-description {
                margin: 15px 0;
                line-height: 1.6;
                color: var(--text-secondary);
                font-size: 14px;
                padding: 10px 15px;
                background-color: rgba(0,0,0,0.1);
                border-radius: 10px;
                border-left: 3px solid var(--primary-color);
            }
            
            .project-description p {
                margin: 0;
            }
            
            .project-links {
                display: flex;
                gap: 12px;
                margin-top: 15px;
            }
            
            .project-link {
                display: flex;
                align-items: center;
                padding: 8px 16px;
                background: linear-gradient(to right, rgba(0,0,0,0.2), rgba(0,0,0,0.3));
                border-radius: 25px;
                text-decoration: none;
                color: var(--text-primary);
                transition: all 0.3s ease;
                font-size: 14px;
                font-weight: bold;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            
            .project-link:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 10px rgba(0,0,0,0.2);
                background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
                color: white;
            }
            
            .project-link .icon {
                margin-right: 8px;
                font-size: 16px;
            }
            
            .toggle-indicator {
                margin-left: 5px;
                font-size: 10px;
                transition: transform 0.3s ease;
            }
            
            .help-toggle.active .toggle-indicator {
                transform: rotate(180deg);
            }
            
            /* 帮助面板样式 */
            .help-panel {
                margin-top: 20px;
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.5s cubic-bezier(0, 1, 0, 1);
                border-radius: 10px;
            }
            
            .help-panel.expanded {
                max-height: 1500px;
                transition: max-height 1s ease-in-out;
            }
            
            .help-section {
                margin-bottom: 15px;
                padding: 12px;
                background: linear-gradient(to right, rgba(0,0,0,0.1), rgba(0,0,0,0.15));
                border-radius: 10px;
                border-left: 3px solid var(--primary-color);
                transition: all 0.3s ease;
            }
            
            .help-section:hover {
                background: linear-gradient(to right, rgba(0,0,0,0.15), rgba(0,0,0,0.2));
                transform: translateX(3px);
            }
            
            .help-title {
                display: flex;
                align-items: center;
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 10px;
                color: var(--secondary-color);
                letter-spacing: 0.5px;
            }
            
            .help-icon {
                margin-right: 10px;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
            }
            
            .help-content {
                color: var(--text-secondary);
                font-size: 14px;
                line-height: 1.5;
                padding: 5px 0 0 34px;
            }
            
            .help-content p {
                margin: 0 0 10px 0;
            }
            
            /* 神经网络结构图表 */
            .network-structure {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin: 15px 0;
                flex-wrap: wrap;
            }
            
            .structure-layer {
                background: rgba(0,0,0,0.15);
                border-radius: 8px;
                padding: 8px 12px;
                text-align: center;
                flex: 1;
                min-width: 80px;
                margin: 5px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
            }
            
            .structure-layer:hover {
                transform: translateY(-3px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            }
            
            .structure-layer:nth-child(1) {
                border-bottom: 3px solid #4dabf7;
            }
            
            .structure-layer:nth-child(3) {
                border-bottom: 3px solid #54d8ff;
            }
            
            .structure-layer:nth-child(5) {
                border-bottom: 3px solid #64c2ff;
            }
            
            .structure-layer:nth-child(7) {
                border-bottom: 3px solid #ffcc00;
            }
            
            .structure-name {
                font-size: 12px;
                font-weight: bold;
                color: var(--text-primary);
            }
            
            .structure-nodes {
                font-size: 14px;
                font-weight: bold;
                color: var(--secondary-color);
                margin: 5px 0;
                font-family: var(--font-mono);
            }
            
            .structure-desc {
                font-size: 10px;
                color: var(--text-secondary);
            }
            
            .structure-arrow {
                color: var(--primary-color);
                font-size: 18px;
                margin: 0 5px;
            }
            
            /* 学习步骤 */
            .learning-steps {
                display: flex;
                justify-content: space-between;
                margin-top: 15px;
                flex-wrap: wrap;
            }
            
            .learning-step {
                display: flex;
                align-items: center;
                margin: 5px;
                flex: 1;
                min-width: 100px;
            }
            
            .step-number {
                width: 25px;
                height: 25px;
                border-radius: 50%;
                background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 12px;
                margin-right: 8px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            
            .step-desc {
                font-size: 12px;
                color: var(--text-primary);
            }
            
            /* 参数分类 */
            .param-categories {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .param-category {
                background: rgba(0,0,0,0.15);
                border-radius: 10px;
                padding: 12px;
                display: flex;
                flex-direction: column;
                align-items: center;
                flex: 1;
                min-width: 120px;
                transition: all 0.3s ease;
            }
            
            .param-category:hover {
                background: rgba(0,0,0,0.25);
                transform: translateY(-3px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            }
            
            .category-icon {
                font-size: 20px;
                margin-bottom: 8px;
            }
            
            .category-name {
                font-size: 12px;
                font-weight: bold;
                color: var(--text-primary);
                margin-bottom: 5px;
            }
            
            .category-desc {
                font-size: 11px;
                color: var(--text-secondary);
                text-align: center;
                line-height: 1.4;
            }
        `;
        document.head.appendChild(style);

        const panel = document.createElement("div");
        panel.id = "ai-info-panel";
        panel.innerHTML = `
            <div class="panel-header">
                <h2 class="panel-title">
                    <span class="icon">🦖</span>
                    T-Rex Neural AI Runner
                </h2>
            </div>
            
            <div class="panel-content">
                <div class="game-stats-container">
                    <div class="stats-card">
                        <div class="stats-title">游戏统计</div>
                        <div class="stats-grid">
                            <div class="stats-item">
                                <div class="stats-label">迭代次数:</div>
                                <div class="stats-value" id="iteration">1</div>
                            </div>
                            <div class="stats-item">
                                <div class="stats-label">最高分:</div>
                                <div class="stats-value highlight" id="high-score">0</div>
                            </div>
                            <div class="stats-item">
                                <div class="stats-label">当前分数:</div>
                                <div class="stats-value" id="current-score">0</div>
                            </div>
                            <div class="stats-item">
                                <div class="stats-label">游戏速度:</div>
                                <div class="stats-value" id="game-speed">0</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stats-card">
                        <div class="stats-title">障碍物信息</div>
                        <div class="stats-grid">
                            <div class="stats-item">
                                <div class="stats-label">类型:</div>
                                <div class="stats-value" id="obstacle-info">无</div>
                            </div>
                            <div class="stats-item">
                                <div class="stats-label">距离:</div>
                                <div class="stats-value" id="distance">0</div>
                            </div>
                            <div class="stats-item">
                                <div class="stats-label">动作:</div>
                                <div class="action-badge" id="should-jump">不跳跃</div>
                            </div>
                            <div class="stats-item">
                                <div class="stats-label">原因:</div>
                                <div class="stats-value" id="jump-reason">N/A</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="formula-display">
                    <div class="formula-header">
                        <div class="formula-icon">📐</div>
                        <div class="formula-title">决策公式</div>
                    </div>
                    <div class="formula-content">
                        <div id="threshold-formula" class="formula">...</div>
                        <div id="cactus-formula" class="formula cactus-formula"></div>
                        <div id="bird-formula" class="formula bird-formula"></div>
                        <div id="pca-formula" class="formula pca-formula"></div>
                    </div>
                </div>
                
                <!-- Neural Network Section -->
                <div class="neural-section">
                    <div class="neural-title">
                        <span class="neural-icon">🧠</span> 
                        神经网络状态
                        <div class="neural-stats-pill">
                            <span id="nn-episodes">0</span> 回合
                        </div>
                    </div>
                    
                    <div class="neural-stats">
                        <div class="neural-stat-item">
                            <div class="stat-label">训练数据:</div> 
                            <div class="stat-value"><span id="nn-data">0</span> 样本</div>
                        </div>
                        <div class="neural-stat-item">
                            <div class="stat-label">学习率:</div> 
                            <div class="stat-value"><span id="nn-learning-rate">0.002</span></div>
                        </div>
                        <div class="neural-stat-item">
                            <div class="stat-label">最新损失:</div> 
                            <div class="stat-value"><span id="nn-loss">N/A</span></div>
                        </div>
                    </div>
                    
                    <div class="network-viz">
                        <div class="network-connections">
                            <!-- SVG connections will be drawn here -->
                        </div>
                        <!-- Network visualization will be added dynamically -->
                    </div>
                    
                    <!-- 迭代控制开关 -->
                    <div class="iteration-control">
                        <div class="iteration-label">是否继续迭代？</div>
                        <div class="iteration-status active" id="iteration-status">正在训练</div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="iteration-toggle" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    
                    <div class="neural-title">
                        <span class="neural-icon">📊</span> 
                        参数优化
                        <div class="param-filter">
                            <span class="filter-all active">全部</span>
                            <span class="filter-cactus">仙人掌</span>
                            <span class="filter-bird">飞鸟</span>
                        </div>
                    </div>
                    
                    <div class="param-grid" id="nn-params">
                        <!-- Parameter items will be added dynamically -->
                    </div>
                </div>
                
                <!-- Project Information Section -->
                <div class="project-info">
                    <div class="project-header">
                        <div class="project-logo">🦖</div>
                        <div class="project-title-container">
                            <div class="project-title">Auto-T-Rex: 神经网络驱动的恐龙奔跑游戏</div>
                            <div class="project-subtitle">基于TensorFlow.js + 强化学习的智能体</div>
                        </div>
                    </div>
                    
                    <div class="project-description">
                        <p>这个项目使用TensorFlow.js实现的神经网络，通过强化学习优化Chrome恐龙游戏的自动运行策略。神经网络不断学习和优化跳跃策略，应对不同类型的障碍物。</p>
                    </div>
                    
                    <div class="project-links">
                        <a href="https://github.com/Arshtyi/Auto-T-Rex" class="project-link" target="_blank">
                            <span class="icon">📂</span> GitHub
                        </a>
                        <a href="javascript:void(0)" class="project-link help-toggle" onclick="toggleHelpPanel()">
                            <span class="icon">ℹ️</span> 帮助说明
                            <span class="toggle-indicator">▼</span>
                        </a>
                    </div>
                    
                    <!-- Help Panel (Hidden by default) -->
                    <div class="help-panel" id="help-panel">
                        <div class="help-section">
                            <div class="help-title">
                                <span class="help-icon">📋</span>
                                项目简介
                            </div>
                            <div class="help-content">
                                <p>Auto-T-Rex使用神经网络和强化学习算法，通过反复训练优化Chrome浏览器的恐龙游戏参数，实现自动奔跑的智能体。每次游戏运行都会收集数据并改进决策策略。</p>
                            </div>
                        </div>
                        
                        <div class="help-section">
                            <div class="help-title">
                                <span class="help-icon">🧠</span>
                                神经网络结构
                            </div>
                            <div class="help-content">
                                <div class="network-structure">
                                    <div class="structure-layer">
                                        <div class="structure-name">输入层</div>
                                        <div class="structure-nodes">8节点</div>
                                        <div class="structure-desc">游戏状态特征</div>
                                    </div>
                                    <div class="structure-arrow">→</div>
                                    <div class="structure-layer">
                                        <div class="structure-name">隐藏层1</div>
                                        <div class="structure-nodes">64节点</div>
                                        <div class="structure-desc">ReLU激活</div>
                                    </div>
                                    <div class="structure-arrow">→</div>
                                    <div class="structure-layer">
                                        <div class="structure-name">隐藏层2</div>
                                        <div class="structure-nodes">32节点</div>
                                        <div class="structure-desc">ReLU激活</div>
                                    </div>
                                    <div class="structure-arrow">→</div>
                                    <div class="structure-layer">
                                        <div class="structure-name">输出层</div>
                                        <div class="structure-nodes">多节点</div>
                                        <div class="structure-desc">Tanh激活</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="help-section">
                            <div class="help-title">
                                <span class="help-icon">📈</span>
                                学习过程
                            </div>
                            <div class="help-content">
                                <p>每次游戏会话都会产生训练数据，得分越高会产生更强的奖励信号。神经网络会根据游戏状态和障碍物类型做出决策，并通过强化学习不断优化其决策策略。</p>
                                <div class="learning-steps">
                                    <div class="learning-step">
                                        <div class="step-number">1</div>
                                        <div class="step-desc">收集游戏数据</div>
                                    </div>
                                    <div class="learning-step">
                                        <div class="step-number">2</div>
                                        <div class="step-desc">计算奖励</div>
                                    </div>
                                    <div class="learning-step">
                                        <div class="step-number">3</div>
                                        <div class="step-desc">训练网络</div>
                                    </div>
                                    <div class="learning-step">
                                        <div class="step-number">4</div>
                                        <div class="step-desc">优化参数</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="help-section">
                            <div class="help-title">
                                <span class="help-icon">🔧</span>
                                参数解释
                            </div>
                            <div class="help-content">
                                <div class="param-categories">
                                    <div class="param-category">
                                        <div class="category-icon">🌵</div>
                                        <div class="category-name">仙人掌参数</div>
                                        <div class="category-desc">控制对不同大小仙人掌的跳跃时机</div>
                                    </div>
                                    <div class="param-category">
                                        <div class="category-icon">🦅</div>
                                        <div class="category-name">飞鸟参数</div>
                                        <div class="category-desc">优化对不同高度飞鸟的应对策略</div>
                                    </div>
                                    <div class="param-category">
                                        <div class="category-icon">📊</div>
                                        <div class="category-name">PCA参数</div>
                                        <div class="category-desc">使用主成分分析提取游戏关键特征</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(panel);

        // 初始化全局变量
        window.continueIteration = true;

        // 初始状态下折叠帮助面板
        const helpPanel = document.getElementById("help-panel");
        if (helpPanel) {
            helpPanel.classList.add("collapsed");
        }

        // 初始化全局函数
        window.toggleHelpPanel = function () {
            const helpPanel = document.getElementById("help-panel");
            const helpToggle = document.querySelector(".help-toggle");

            if (helpPanel) {
                helpPanel.classList.toggle("expanded");

                if (helpToggle) {
                    helpToggle.classList.toggle("active");
                }
            }
        };

        // Initialize neural network visualization
        initNetworkViz();

        function initNetworkViz() {
            const viz = document.querySelector(".network-viz");
            const connections = document.querySelector(".network-connections");

            // Create SVG for connections
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("width", "100%");
            svg.setAttribute("height", "100%");
            connections.appendChild(svg);

            // Add a label at the top
            const label = document.createElement("div");
            label.style.position = "absolute";
            label.style.top = "5px";
            label.style.left = "0";
            label.style.width = "100%";
            label.style.textAlign = "center";
            label.style.fontSize = "12px";
            label.style.color = "var(--text-secondary)";
            label.style.fontWeight = "bold";
            label.style.textShadow = "0 1px 2px rgba(0,0,0,0.2)";
            label.textContent = "TensorFlow.js Neural Network";
            viz.appendChild(label);

            // 重新设计层位置和间距，使用垂直和水平居中对齐
            const layerSpacing = 22; // 增加一点空间，避免标签重叠

            // 添加CSS样式使连接线更美观
            const networkStyles = document.createElement("style");
            networkStyles.textContent = `
                .network-connection {
                    transition: stroke 0.3s ease, stroke-width 0.3s ease;
                }
                .network-connection.active {
                    stroke-width: 2.5 !important;
                    filter: drop-shadow(0 0 3px currentColor);
                }
                .network-node {
                    position: relative;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .network-node[data-layer="input"] {
                    background: linear-gradient(135deg, #4dabf7, #2b8ad6);
                }
                .network-node[data-layer="hidden1"] {
                    background: linear-gradient(135deg, #54d8ff, #2e8aef);
                }  
                .network-node[data-layer="hidden2"] {
                    background: linear-gradient(135deg, #64c2ff, #4a72e5);
                }
                .network-node[data-layer="output"] {
                    background: linear-gradient(135deg, #ffcc00, #ff9500);
                }
                .layer-highlight {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 30px;
                    height: 80%;
                    border-radius: 15px;
                    opacity: 0.05;
                    z-index: -1;
                }
                .node-tooltip {
                    position: absolute;
                    background: rgba(0,0,0,0.7);
                    color: white;
                    padding: 3px 6px;
                    border-radius: 4px;
                    font-size: 9px;
                    white-space: nowrap;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                    bottom: 120%;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 100;
                }
                .network-node:hover .node-tooltip {
                    opacity: 1;
                }

                /* 美化项目信息和帮助面板 */
                .project-info {
                    margin-top: 25px;
                    background: linear-gradient(to bottom right, var(--bg-card), rgba(40, 40, 60, 0.8));
                    border-radius: 15px;
                    padding: 20px;
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
                    border: 1px solid var(--border-color);
                    position: relative;
                    overflow: hidden;
                }
                
                .project-info::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
                    border-radius: 3px;
                }
                
                .project-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 15px;
                }
                
                .project-logo {
                    font-size: 32px;
                    margin-right: 15px;
                    background: linear-gradient(135deg, var(--secondary-color), var(--accent-color));
                    width: 60px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    box-shadow: 0 5px 10px rgba(0,0,0,0.2);
                    animation: float 3s ease-in-out infinite;
                }
                
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
                
                .project-title-container {
                    flex: 1;
                }
                
                .project-title {
                    font-size: 20px;
                    font-weight: bold;
                    margin-bottom: 5px;
                    background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                    letter-spacing: 0.5px;
                }
                
                .project-subtitle {
                    font-size: 14px;
                    color: var(--text-secondary);
                    font-style: italic;
                }
                
                .project-description {
                    margin: 15px 0;
                    line-height: 1.6;
                    color: var(--text-secondary);
                    font-size: 14px;
                    padding: 10px 15px;
                    background-color: rgba(0,0,0,0.1);
                    border-radius: 10px;
                    border-left: 3px solid var(--primary-color);
                }
                
                .project-description p {
                    margin: 0;
                }
                
                .project-links {
                    display: flex;
                    gap: 12px;
                    margin-top: 15px;
                }
                
                .project-link {
                    display: flex;
                    align-items: center;
                    padding: 8px 16px;
                    background: linear-gradient(to right, rgba(0,0,0,0.2), rgba(0,0,0,0.3));
                    border-radius: 25px;
                    text-decoration: none;
                    color: var(--text-primary);
                    transition: all 0.3s ease;
                    font-size: 14px;
                    font-weight: bold;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                
                .project-link:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 10px rgba(0,0,0,0.2);
                    background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
                    color: white;
                }
                
                .project-link .icon {
                    margin-right: 8px;
                    font-size: 16px;
                }
                
                .toggle-indicator {
                    margin-left: 5px;
                    font-size: 10px;
                    transition: transform 0.3s ease;
                }
                
                .help-toggle.active .toggle-indicator {
                    transform: rotate(180deg);
                }
                
                /* 帮助面板样式 */
                .help-panel {
                    margin-top: 20px;
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.5s cubic-bezier(0, 1, 0, 1);
                    border-radius: 10px;
                }
                
                .help-panel.expanded {
                    max-height: 1500px;
                    transition: max-height 1s ease-in-out;
                }
                
                .help-section {
                    margin-bottom: 15px;
                    padding: 12px;
                    background: linear-gradient(to right, rgba(0,0,0,0.1), rgba(0,0,0,0.15));
                    border-radius: 10px;
                    border-left: 3px solid var(--primary-color);
                    transition: all 0.3s ease;
                }
                
                .help-section:hover {
                    background: linear-gradient(to right, rgba(0,0,0,0.15), rgba(0,0,0,0.2));
                    transform: translateX(3px);
                }
                
                .help-title {
                    display: flex;
                    align-items: center;
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: var(--secondary-color);
                    letter-spacing: 0.5px;
                }
                
                .help-icon {
                    margin-right: 10px;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                }
                
                .help-content {
                    color: var(--text-secondary);
                    font-size: 14px;
                    line-height: 1.5;
                    padding: 5px 0 0 34px;
                }
                
                .help-content p {
                    margin: 0 0 10px 0;
                }
                
                /* 神经网络结构图表 */
                .network-structure {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin: 15px 0;
                    flex-wrap: wrap;
                }
                
                .structure-layer {
                    background: rgba(0,0,0,0.15);
                    border-radius: 8px;
                    padding: 8px 12px;
                    text-align: center;
                    flex: 1;
                    min-width: 80px;
                    margin: 5px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    transition: all 0.3s ease;
                }
                
                .structure-layer:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                }
                
                .structure-layer:nth-child(1) {
                    border-bottom: 3px solid #4dabf7;
                }
                
                .structure-layer:nth-child(3) {
                    border-bottom: 3px solid #54d8ff;
                }
                
                .structure-layer:nth-child(5) {
                    border-bottom: 3px solid #64c2ff;
                }
                
                .structure-layer:nth-child(7) {
                    border-bottom: 3px solid #ffcc00;
                }
                
                .structure-name {
                    font-size: 12px;
                    font-weight: bold;
                    color: var(--text-primary);
                }
                
                .structure-nodes {
                    font-size: 14px;
                    font-weight: bold;
                    color: var(--secondary-color);
                    margin: 5px 0;
                    font-family: var(--font-mono);
                }
                
                .structure-desc {
                    font-size: 10px;
                    color: var(--text-secondary);
                }
                
                .structure-arrow {
                    color: var(--primary-color);
                    font-size: 18px;
                    margin: 0 5px;
                }
                
                /* 学习步骤 */
                .learning-steps {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 15px;
                    flex-wrap: wrap;
                }
                
                .learning-step {
                    display: flex;
                    align-items: center;
                    margin: 5px;
                    flex: 1;
                    min-width: 100px;
                }
                
                .step-number {
                    width: 25px;
                    height: 25px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 12px;
                    margin-right: 8px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                
                .step-desc {
                    font-size: 12px;
                    color: var(--text-primary);
                }
                
                /* 参数分类 */
                .param-categories {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }
                
                .param-category {
                    background: rgba(0,0,0,0.15);
                    border-radius: 10px;
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    flex: 1;
                    min-width: 120px;
                    transition: all 0.3s ease;
                }
                
                .param-category:hover {
                    background: rgba(0,0,0,0.25);
                    transform: translateY(-3px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                }
                
                .category-icon {
                    font-size: 20px;
                    margin-bottom: 8px;
                }
                
                .category-name {
                    font-size: 12px;
                    font-weight: bold;
                    color: var(--text-primary);
                    margin-bottom: 5px;
                }
                
                .category-desc {
                    font-size: 11px;
                    color: var(--text-secondary);
                    text-align: center;
                    line-height: 1.4;
                }
            `;
            document.head.appendChild(networkStyles);

            // 添加层高亮背景
            const layerHighlights = [
                { left: `${layerSpacing}%`, color: "rgba(77, 171, 247, 0.3)" },
                { left: `${layerSpacing * 2}%`, color: "rgba(84, 160, 255, 0.3)" },
                { left: `${layerSpacing * 3}%`, color: "rgba(100, 130, 255, 0.3)" },
                { left: `${layerSpacing * 4}%`, color: "rgba(255, 204, 0, 0.3)" },
            ];

            layerHighlights.forEach((highlight) => {
                const highlightDiv = document.createElement("div");
                highlightDiv.className = "layer-highlight";
                highlightDiv.style.left = highlight.left;
                highlightDiv.style.background = highlight.color;
                highlightDiv.style.transform = "translate(-50%, -50%)";
                viz.appendChild(highlightDiv);
            });

            // Input layer (8 nodes)
            const inputLayer = document.createElement("div");
            inputLayer.className = "network-layer";
            inputLayer.style.left = `${layerSpacing}%`;
            inputLayer.style.transform = "translateX(-50%)";

            // 创建输入层节点并添加信息提示
            const inputNodeCount = 8;
            const inputNodeTooltips = [
                "距离",
                "速度",
                "高度",
                "障碍物类型",
                "相对高度",
                "跳跃状态",
                "宽度",
                "恐龙Y位置",
            ];

            // 添加每个节点的详细信息
            const inputNodeDetails = [
                "到障碍物的距离（归一化）",
                "当前游戏速度（归一化）",
                "障碍物高度（归一化）",
                "障碍物类型（1=鸟类, 0=仙人掌）",
                "障碍物相对画布高度的位置",
                "恐龙是否正在跳跃（1=是, 0=否）",
                "障碍物宽度（归一化）",
                "恐龙在画布中的Y坐标（归一化）",
            ];

            for (let i = 0; i < inputNodeCount; i++) {
                const nodeContainer = document.createElement("div");
                nodeContainer.style.position = "relative";
                nodeContainer.style.marginBottom = "10px"; // 增加垂直间距

                const node = document.createElement("div");
                node.className = "network-node";
                node.dataset.layer = "input";
                node.dataset.index = i;

                // 添加更详细的工具提示
                const tooltip = document.createElement("div");
                tooltip.className = "node-tooltip";
                tooltip.innerHTML = `<strong>输入${i + 1}: ${inputNodeTooltips[i]}</strong><br><small>${
                    inputNodeDetails[i]
                }</small>`;
                node.appendChild(tooltip);

                // 为所有节点添加侧面标签
                const nodeLabel = document.createElement("div");
                nodeLabel.className = "network-node-label";
                nodeLabel.textContent = inputNodeTooltips[i];
                nodeContainer.appendChild(nodeLabel);

                nodeContainer.appendChild(node);
                inputLayer.appendChild(nodeContainer);
            }
            viz.appendChild(inputLayer);

            // Hidden layer 1 (show only 10 of 64 for visualization)
            const hiddenLayer1 = document.createElement("div");
            hiddenLayer1.className = "network-layer";
            hiddenLayer1.style.left = `${layerSpacing * 2}%`;
            hiddenLayer1.style.transform = "translateX(-50%)";

            // 用循环创建隐藏层1的节点
            for (let i = 0; i < 10; i++) {
                const node = document.createElement("div");
                node.className = "network-node";
                node.dataset.layer = "hidden1";
                node.dataset.index = i;

                const tooltip = document.createElement("div");
                tooltip.className = "node-tooltip";
                tooltip.textContent = `隐藏1-${i + 1}`;
                node.appendChild(tooltip);

                hiddenLayer1.appendChild(node);
            }
            viz.appendChild(hiddenLayer1);

            // Hidden layer 2 (show only 8 of 32 for visualization)
            const hiddenLayer2 = document.createElement("div");
            hiddenLayer2.className = "network-layer";
            hiddenLayer2.style.left = `${layerSpacing * 3}%`;
            hiddenLayer2.style.transform = "translateX(-50%)";

            // 用循环创建隐藏层2的节点
            for (let i = 0; i < 8; i++) {
                const node = document.createElement("div");
                node.className = "network-node";
                node.dataset.layer = "hidden2";
                node.dataset.index = i;

                const tooltip = document.createElement("div");
                tooltip.className = "node-tooltip";
                tooltip.textContent = `隐藏2-${i + 1}`;
                node.appendChild(tooltip);

                hiddenLayer2.appendChild(node);
            }
            viz.appendChild(hiddenLayer2);

            // Output layer with 4 nodes (for different parameter categories)
            const outputLayer = document.createElement("div");
            outputLayer.className = "network-layer";
            outputLayer.style.left = `${layerSpacing * 4}%`;
            outputLayer.style.transform = "translateX(-50%)";

            // 创建输出层节点并添加标签
            const outputLabels = ["仙人掌参数", "鸟类参数", "高度参数", "速度参数"];
            for (let i = 0; i < 4; i++) {
                const nodeContainer = document.createElement("div");
                nodeContainer.style.position = "relative";

                const node = document.createElement("div");
                node.className = "network-node";
                node.dataset.layer = "output";
                node.dataset.index = i;

                const tooltip = document.createElement("div");
                tooltip.className = "node-tooltip";
                tooltip.textContent = outputLabels[i];
                node.appendChild(tooltip);

                const nodeLabel = document.createElement("div");
                nodeLabel.className = "network-node-label";
                nodeLabel.textContent = outputLabels[i].replace("参数", "");
                nodeContainer.appendChild(nodeLabel);

                nodeContainer.appendChild(node);
                outputLayer.appendChild(nodeContainer);
            }
            viz.appendChild(outputLayer);

            // 添加层标签（使用独立元素）
            const layerLabels = [
                { text: "输入层", left: `${layerSpacing}%` },
                { text: "隐藏层 1", left: `${layerSpacing * 2}%` },
                { text: "隐藏层 2", left: `${layerSpacing * 3}%` },
                { text: "输出层", left: `${layerSpacing * 4}%` },
            ];

            layerLabels.forEach((item) => {
                const labelDiv = document.createElement("div");
                labelDiv.className = "layer-label";
                labelDiv.style.left = item.left;
                labelDiv.style.transform = "translateX(-50%)";
                labelDiv.textContent = item.text;
                viz.appendChild(labelDiv);
            });

            // 获取所有节点
            const inputNodes = inputLayer.querySelectorAll(".network-node");
            const hidden1Nodes = hiddenLayer1.querySelectorAll(".network-node");
            const hidden2Nodes = hiddenLayer2.querySelectorAll(".network-node");
            const outputNodes = outputLayer.querySelectorAll(".network-node");

            // 使用不同颜色绘制连接线
            const inputConnections = drawConnections(inputNodes, hidden1Nodes, svg, viz, "rgba(77, 171, 247, 0.4)");
            const hidden1Connections = drawConnections(
                hidden1Nodes,
                hidden2Nodes,
                svg,
                viz,
                "rgba(100, 200, 100, 0.4)"
            );
            const outputConnections = drawConnections(hidden2Nodes, outputNodes, svg, viz, "rgba(255, 204, 0, 0.4)");

            // 所有连接的ID集合，用于动画
            const allConnections = [...inputConnections, ...hidden1Connections, ...outputConnections];

            // 改进的连接线绘制函数，使用贝塞尔曲线和唯一ID
            function drawConnections(sourceNodes, targetNodes, svg, vizElement, color) {
                const sourceLayer = Array.from(sourceNodes)[0].dataset.layer;
                const targetLayer = Array.from(targetNodes)[0].dataset.layer;

                // 根据不同的层使用不同密度的连接
                let connectionFrequency = 6; // 默认每6个连接画1个
                let strokeWidth = 1.2;

                // 为输出层定制连接样式
                if (targetLayer === "output") {
                    connectionFrequency = 2; // 增加输出层连接密度
                    strokeWidth = 1.6; // 增加输出层连接粗细
                }

                // 为不同层设置渐变颜色
                let gradientColor = color;
                if (sourceLayer === "input" && targetLayer === "hidden1") {
                    gradientColor = "rgba(77, 171, 247, 0.35)"; // 蓝色
                } else if (sourceLayer === "hidden1" && targetLayer === "hidden2") {
                    gradientColor = "rgba(100, 200, 100, 0.35)"; // 绿色
                } else if (sourceLayer === "hidden2" && targetLayer === "output") {
                    gradientColor = "rgba(255, 204, 0, 0.35)"; // 黄色
                }

                // 创建连接ID数组以便后续引用
                const connectionIds = [];

                for (let i = 0; i < sourceNodes.length; i++) {
                    for (let j = 0; j < targetNodes.length; j++) {
                        if ((i * targetNodes.length + j) % connectionFrequency === 0) {
                            const sourceRect = sourceNodes[i].getBoundingClientRect();
                            const targetRect = targetNodes[j].getBoundingClientRect();

                            const x1 = sourceRect.left - vizElement.getBoundingClientRect().left + sourceRect.width / 2;
                            const y1 = sourceRect.top - vizElement.getBoundingClientRect().top + sourceRect.height / 2;
                            const x2 = targetRect.left - vizElement.getBoundingClientRect().left + targetRect.width / 2;
                            const y2 = targetRect.top - vizElement.getBoundingClientRect().top + targetRect.height / 2;

                            // 使用改进的贝塞尔曲线，更加平滑
                            const controlX = (x1 + x2) / 2;
                            const controlOffset = 10 + Math.abs(y2 - y1) * 0.2; // 动态控制曲线弯曲程度

                            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

                            // 生成唯一ID以便高亮引用
                            const connectionId = `connection-${sourceLayer}-${i}-${targetLayer}-${j}`;
                            path.setAttribute("id", connectionId);
                            connectionIds.push(connectionId);

                            path.setAttribute(
                                "d",
                                `M ${x1} ${y1} Q ${controlX} ${y1 + controlOffset} ${controlX} ${
                                    (y1 + y2) / 2
                                } T ${x2} ${y2}`
                            );
                            path.setAttribute("stroke", gradientColor);
                            path.setAttribute("stroke-width", strokeWidth);
                            path.setAttribute("fill", "none");

                            // 添加透明度和平滑度
                            path.setAttribute("stroke-linecap", "round");
                            path.setAttribute("stroke-opacity", "0.8");

                            // 添加动画效果预备
                            path.setAttribute("class", "network-connection");
                            path.dataset.sourceNode = i;
                            path.dataset.targetNode = j;
                            path.dataset.sourceLayer = sourceLayer;
                            path.dataset.targetLayer = targetLayer;

                            svg.appendChild(path);
                        }
                    }
                }
                return connectionIds; // 返回连接ID数组，用于后续动画
            }

            // 初始化迭代控制开关的事件监听
            const iterationToggle = document.getElementById("iteration-toggle");
            const iterationStatus = document.getElementById("iteration-status");

            if (iterationToggle && iterationStatus) {
                iterationToggle.addEventListener("change", function () {
                    if (this.checked) {
                        iterationStatus.textContent = "正在训练";
                        iterationStatus.className = "iteration-status active";
                        // 在这里触发继续迭代的逻辑
                        window.continueIteration = true;
                        // 添加动画效果
                        iterationStatus.style.animation = "pulse 1s";
                        setTimeout(() => {
                            iterationStatus.style.animation = "";
                        }, 1000);
                    } else {
                        iterationStatus.textContent = "已暂停";
                        iterationStatus.className = "iteration-status paused";
                        // 在这里触发暂停迭代的逻辑
                        window.continueIteration = false;
                    }
                });

                // 设置初始状态
                window.continueIteration = iterationToggle.checked;
            }
        }
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
        if (document.getElementById("iteration")) {
            document.getElementById("iteration").textContent = data.iteration || "0";
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
        if (document.getElementById("distance") && typeof data.distance !== "undefined") {
            document.getElementById("distance").textContent = data.distance.toFixed(1);
        }

        // Update decision information
        if (document.getElementById("should-jump") && typeof data.shouldJump !== "undefined") {
            const jumpElement = document.getElementById("should-jump");
            jumpElement.textContent = data.shouldJump ? "跳跃" : "不跳跃";
            jumpElement.className = data.shouldJump ? "action-badge jump" : "action-badge";

            // 跳跃时增加动画效果
            if (data.shouldJump) {
                // 首先移除可能存在的动画，然后重新添加
                jumpElement.style.animation = "none";
                // 触发重绘
                void jumpElement.offsetWidth;
                // 重新应用动画
                jumpElement.style.animation = "pulse 0.8s infinite";

                // 5秒后重置动画
                setTimeout(() => {
                    jumpElement.style.animation = "";
                }, 5000);
            }
        }
        if (document.getElementById("jump-reason") && data.reason) {
            document.getElementById("jump-reason").textContent = data.reason;
        }

        if (document.getElementById("threshold-formula") && data.thresholdCalc) {
            document.getElementById("threshold-formula").textContent = data.thresholdCalc;
        }

        // 更新迭代状态（如果从外部提供）
        if (typeof data.continueIteration !== "undefined" && document.getElementById("iteration-toggle")) {
            const iterationToggle = document.getElementById("iteration-toggle");
            const iterationStatus = document.getElementById("iteration-status");

            iterationToggle.checked = data.continueIteration;

            if (data.continueIteration) {
                iterationStatus.textContent = "正在训练";
                iterationStatus.className = "iteration-status active";
                window.continueIteration = true;
            } else {
                iterationStatus.textContent = "已暂停";
                iterationStatus.className = "iteration-status paused";
                window.continueIteration = false;
            }
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

                // Auto-expand feature for game over removed
            }
        }

        // Handle game reset state
        if (data.gameReset) {
            // Reset all states and displays
            if (document.getElementById("obstacle-info")) {
                document.getElementById("obstacle-info").textContent = "None";
            }
            if (document.getElementById("distance")) {
                document.getElementById("distance").textContent = "0";
            }
            if (document.getElementById("should-jump")) {
                document.getElementById("should-jump").textContent = "Waiting";
                document.getElementById("should-jump").className = "";
            }
            if (document.getElementById("jump-reason")) {
                document.getElementById("jump-reason").textContent = "-";
            }
            if (document.getElementById("threshold-formula")) {
                document.getElementById("threshold-formula").textContent = "-";
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
        if (formulas.jumpThreshold && document.getElementById("threshold-formula")) {
            document.getElementById("threshold-formula").textContent = formulas.jumpThreshold;
        }

        if (formulas.cactus && document.getElementById("cactus-formula")) {
            document.getElementById("cactus-formula").textContent = formulas.cactus;
        } else if (document.getElementById("cactus-formula")) {
            document.getElementById("cactus-formula").textContent = "";
        }

        if (formulas.bird && document.getElementById("bird-formula")) {
            document.getElementById("bird-formula").textContent = formulas.bird;
        } else if (document.getElementById("bird-formula")) {
            document.getElementById("bird-formula").textContent = "";
        }

        if (formulas.pca && document.getElementById("pca-formula")) {
            document.getElementById("pca-formula").textContent = formulas.pca;
        }
    }, formulas);
}

/**
 * Update neural network display
 * @param {Object} page - Playwright page object
 * @param {Object} networkData - Neural network data to display
 */
export async function updateNeuralNetworkDisplay(page, networkData) {
    await page.evaluate((data) => {
        // Update neural network statistics
        if (document.getElementById("nn-episodes")) {
            document.getElementById("nn-episodes").textContent = data.episodes || "0";
        }

        if (document.getElementById("nn-data")) {
            document.getElementById("nn-data").textContent = data.trainingSize || "0";
        }

        if (document.getElementById("nn-loss")) {
            document.getElementById("nn-loss").textContent = data.loss ? data.loss.toFixed(4) : "N/A";
        }

        if (document.getElementById("nn-learning-rate")) {
            document.getElementById("nn-learning-rate").textContent = data.learningRate || "0.001";
        }

        // Update parameter display
        const paramGrid = document.getElementById("nn-params");
        if (paramGrid && data.paramChanges) {
            // Clear existing parameters
            paramGrid.innerHTML = "";

            // Get the keys and sort them by category
            const paramKeys = Object.keys(data.paramChanges);

            // Create categories
            const categories = {
                cactus: paramKeys.filter((k) => k.includes("actus")),
                bird: paramKeys.filter((k) => k.includes("ird")),
                pca: paramKeys.filter((k) => k.includes("pca")),
            };

            // Function to create parameter item
            const createParamItem = (key) => {
                const param = data.paramChanges[key];
                const percentChange = parseFloat(param.percentChange);

                const paramItem = document.createElement("div");
                paramItem.className = "param-item";

                // Truncate or simplify parameter name for display
                let displayName = key
                    .replace("small", "S")
                    .replace("large", "L")
                    .replace("Cactus", "Cact")
                    .replace("Bird", "B")
                    .replace("Threshold", "Th")
                    .replace("Factor", "F")
                    .replace("Base", "B")
                    .replace("Speed", "Sp")
                    .replace("Height", "H")
                    .replace("Weight", "W")
                    .replace("pca", "PCA");

                // Limit to 10 characters
                if (displayName.length > 10) {
                    displayName = displayName.substring(0, 10);
                }

                paramItem.innerHTML = `
                    <div class="param-name">${displayName}</div>
                    <div class="param-value">${param.current.toFixed(2)}</div>
                    <div class="param-change ${percentChange >= 0 ? "positive" : "negative"}">
                        ${percentChange >= 0 ? "+" : ""}${param.percentChange}
                    </div>
                    <div class="neural-progress">
                        <div class="neural-progress-bar" style="width: ${Math.min(
                            100,
                            Math.max(0, (param.current / (param.default * 1.5)) * 100)
                        )}%"></div>
                    </div>
                `;

                return paramItem;
            };

            // Add parameters by category in a balanced layout (3 columns)
            const totalParams = Math.min(12, paramKeys.length); // Show at most 12 parameters
            const paramsToShow = [];

            // Add a balanced mix of different parameter types
            if (categories.cactus.length > 0) paramsToShow.push(categories.cactus[0]);
            if (categories.bird.length > 0) paramsToShow.push(categories.bird[0]);
            if (categories.pca.length > 0) paramsToShow.push(categories.pca[0]);

            if (categories.cactus.length > 1) paramsToShow.push(categories.cactus[1]);
            if (categories.bird.length > 1) paramsToShow.push(categories.bird[1]);
            if (categories.pca.length > 1) paramsToShow.push(categories.pca[1]);

            // Fill remaining slots with other parameters
            let remaining = totalParams - paramsToShow.length;
            let catIndex = 0;
            const allCategories = [categories.cactus.slice(2), categories.bird.slice(2), categories.pca.slice(2)];

            while (remaining > 0 && allCategories.some((cat) => cat.length > 0)) {
                const category = allCategories[catIndex % allCategories.length];
                if (category.length > 0) {
                    paramsToShow.push(category.shift());
                    remaining--;
                }
                catIndex++;
            }

            // Render the parameters
            paramsToShow.forEach((key) => {
                paramGrid.appendChild(createParamItem(key));
            });

            // Animate neural network nodes if episode changed
            if (data.newEpisode) {
                // Pulse animation for the entire network visualization
                const networkViz = document.querySelector(".network-viz");
                if (networkViz) {
                    networkViz.classList.add("pulse-animation");
                    setTimeout(() => {
                        networkViz.classList.remove("pulse-animation");
                    }, 2000);
                }

                // Animate all nodes with a cascade effect
                const nodes = document.querySelectorAll(".network-node");
                nodes.forEach((node, index) => {
                    setTimeout(() => {
                        node.style.backgroundColor = "var(--accent-color)";
                        node.style.boxShadow = "0 0 10px var(--accent-color)";

                        setTimeout(() => {
                            node.style.backgroundColor = "";
                            node.style.boxShadow = "";
                        }, 400);
                    }, index * 20); // Staggered animation
                });

                // Update the episode counter with a highlight effect
                const episodeCounter = document.getElementById("nn-episodes");
                if (episodeCounter) {
                    episodeCounter.style.color = "var(--accent-color)";
                    episodeCounter.style.fontWeight = "bold";
                    setTimeout(() => {
                        episodeCounter.style.color = "";
                        episodeCounter.style.fontWeight = "";
                    }, 1000);
                }
            }
        }
    }, networkData);
}

/**
 * Get the current iteration state
 * @param {Object} page - Playwright page object
 * @returns {Promise<boolean>} - Whether to continue iteration
 */
export async function getIterationState(page) {
    return await page.evaluate(() => {
        return window.continueIteration || false;
    });
}
