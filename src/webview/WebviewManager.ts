import * as vscode from 'vscode';
import * as path from 'path';
import { ConfigurationManager } from '../config/ConfigurationManager';

export class WebviewManager {
    private panel: vscode.WebviewPanel | undefined;
    private disposables: vscode.Disposable[] = [];

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly configManager: ConfigurationManager
    ) {
        // Listen for configuration changes
        this.configManager.onConfigurationChanged(this.onConfigurationChanged, this, this.disposables);
    }

    public createWebviewPanel(): void {
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.Beside);
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'fabfebCountdown',
            '🍩 FabFeb Countdown',
            {
                viewColumn: vscode.ViewColumn.Two,
                preserveFocus: false
            },
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.file(path.join(this.context.extensionPath, 'src', 'webview')),
                    vscode.Uri.file(path.join(this.context.extensionPath, 'assets'))
                ]
            }
        );

        this.panel.webview.html = this.getWebviewContent();
        this.setupMessageHandling();

        this.panel.onDidDispose(() => {
            this.panel = undefined;
        }, null, this.disposables);
    }

    public showCountdown(): void {
        if (!this.panel) {
            this.createWebviewPanel();
        }

        const config = this.configManager.getConfiguration();
        const daysUntil = this.configManager.calculateDaysUntil(config.targetDate);
        const message = this.configManager.formatCountdownMessage(daysUntil, config.targetDate);
        
        this.panel?.webview.postMessage({
            type: 'showCountdown',
            data: {
                daysUntil,
                targetDate: config.targetDate,
                message,
                autoHideTimeout: config.autoHideTimeout
            }
        });
    }

    public dispose(): void {
        this.panel?.dispose();
        this.disposables.forEach(d => d.dispose());
    }

    private onConfigurationChanged(config: any): void {
        if (this.panel) {
            // Send updated configuration to webview
            this.panel.webview.postMessage({
                type: 'configUpdate',
                data: config
            });
        }
    }

    private setupMessageHandling(): void {
        if (!this.panel) return;

        this.panel.webview.onDidReceiveMessage(
            message => {
                switch (message.type) {
                    case 'requestCountdown':
                        this.showCountdown();
                        break;
                    case 'error':
                        console.error('Webview error:', message.data);
                        break;
                    default:
                        console.warn('Unknown message type:', message.type);
                }
            },
            null,
            this.disposables
        );

        // Send initial configuration
        const config = this.configManager.getConfiguration();
        this.panel.webview.postMessage({
            type: 'config',
            data: config
        });
    }

    private getWebviewContent(): string {
        const webviewUri = this.panel?.webview.asWebviewUri(
            vscode.Uri.file(path.join(this.context.extensionPath, 'src', 'webview'))
        );

        // ASSUMPTION: Using nonce for CSP security
        const nonce = this.getNonce();

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${this.panel?.webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${this.panel?.webview.cspSource} data:;">
    <title>FabFeb Countdown</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            width: 100vw;
            height: 100vh;
            overflow: hidden;
            background: transparent;
            font-family: var(--vscode-font-family);
            position: relative;
        }

        #sprite-container {
            position: absolute;
            bottom: 20px;
            right: 20px;
            width: 64px;
            height: 64px;
            cursor: pointer;
            user-select: none;
            transition: transform 0.2s ease;
            z-index: 1000;
            display: block;
        }

        #sprite {
            width: 100%;
            height: 100%;
            transition: transform 0.2s ease;
            object-fit: contain;
        }

        #sprite:hover {
            transform: scale(1.1);
        }

        #speech-bubble {
            position: absolute;
            bottom: 95px;
            right: 20px;
            background: var(--vscode-editor-background, #1e1e1e);
            border: 2px solid var(--vscode-editor-foreground, #cccccc);
            border-radius: 10px;
            padding: 10px 15px;
            max-width: 200px;
            opacity: 0;
            transform: translateY(10px);
            transition: opacity 0.3s ease, transform 0.3s ease;
            font-size: 14px;
            color: var(--vscode-editor-foreground, #cccccc);
            z-index: 999;
        }

        #speech-bubble.show {
            opacity: 1;
            transform: translateY(0);
        }

        #speech-bubble::after {
            content: '';
            position: absolute;
            bottom: -10px;
            right: 30px;
            width: 0;
            height: 0;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-top: 10px solid var(--vscode-editor-foreground, #cccccc);
            z-index: -1;
        }

        /* Sprite animations */
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
                transform: translateY(0) scale(1);
            }
            40% {
                transform: translateY(-10px) scale(1.1);
            }
            60% {
                transform: translateY(-5px) scale(1.05);
            }
        }

        @keyframes walking {
            0% { transform: rotate(0deg) scale(1); }
            25% { transform: rotate(-2deg) scale(1.02); }
            50% { transform: rotate(0deg) scale(1); }
            75% { transform: rotate(2deg) scale(1.02); }
            100% { transform: rotate(0deg) scale(1); }
        }

        @keyframes wallBounce {
            0% { transform: scale(1); }
            50% { transform: scale(1.15) rotate(5deg); }
            100% { transform: scale(1); }
        }

        .sprite-bounce {
            animation: bounce 1s ease-in-out;
        }

        .sprite-walking {
            animation: walking 0.8s ease-in-out infinite;
        }

        .sprite-bounce-wall {
            animation: wallBounce 0.3s ease-out;
        }

        .sprite-bounce.slow {
            animation-duration: 2s;
        }

        .sprite-bounce.fast {
            animation-duration: 0.5s;
        }

        .sprite-walking.slow {
            animation-duration: 1.6s;
        }

        .sprite-walking.fast {
            animation-duration: 0.4s;
        }
    </style>
</head>
<body>
    <div id="sprite-container">
        <img id="sprite" src="${this.getSpriteUri()}" alt="FabFeb Donut" width="64" height="64">
    </div>
    <div id="speech-bubble">
        <span id="countdown-text">Click me for countdown!</span>
    </div>

    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        let config = null;
        let spriteAnimator = null;

        // DOM elements
        const sprite = document.getElementById('sprite');
        const spriteContainer = document.getElementById('sprite-container');
        const speechBubble = document.getElementById('speech-bubble');
        const countdownText = document.getElementById('countdown-text');

        // Sprite Animation System
        class SpriteAnimator {
            constructor(sprite, container, config) {
                this.sprite = sprite;
                this.container = container;
                this.config = config;
                this.position = { x: 0, y: 0 };
                this.velocity = { x: 0, y: 0 };
                this.animationId = null;
                this.lastTime = 0;
                this.isMoving = false;
                this.movementTimer = null;
                this.idleTimer = null;
                
                // Constants
                this.SPRITE_SIZE = 64;
                this.MARGIN = 20;
                this.BASE_SPEED = 0.5;
                
                this.initializePosition();
                // Don't start animation automatically - let user interact first
                console.log('Sprite animator initialized, animation disabled for now');
                // if (config.enabled) {
                //     this.startAnimation();
                // }
            }

            initializePosition() {
                // Keep sprite in bottom-right corner, but ensure it's visible
                const containerWidth = this.container.clientWidth || 800; // fallback width
                const containerHeight = this.container.clientHeight || 600; // fallback height
                
                this.position.x = Math.max(0, containerWidth - this.SPRITE_SIZE - this.MARGIN);
                this.position.y = Math.max(0, containerHeight - this.SPRITE_SIZE - this.MARGIN);
                
                console.log('Sprite positioned at:', this.position.x, this.position.y);
                this.updateSpritePosition();
            }

            updateConfig(newConfig) {
                this.config = newConfig;
                if (newConfig.enabled && !this.animationId) {
                    this.startAnimation();
                } else if (!newConfig.enabled && this.animationId) {
                    this.stopAnimation();
                }
            }

            startAnimation() {
                if (this.animationId) return;
                this.lastTime = performance.now();
                this.scheduleNextMovement();
                this.animate();
            }

            stopAnimation() {
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                    this.animationId = null;
                }
                if (this.movementTimer) {
                    clearTimeout(this.movementTimer);
                    this.movementTimer = null;
                }
                if (this.idleTimer) {
                    clearTimeout(this.idleTimer);
                    this.idleTimer = null;
                }
                this.velocity = { x: 0, y: 0 };
                this.isMoving = false;
                this.sprite.classList.remove('sprite-walking');
            }

            animate() {
                const currentTime = performance.now();
                const deltaTime = currentTime - this.lastTime;
                this.lastTime = currentTime;

                if (this.isMoving) {
                    this.updatePosition(deltaTime);
                    this.checkBoundaries();
                    this.updateSpritePosition();
                }

                this.animationId = requestAnimationFrame(() => this.animate());
            }

            updatePosition(deltaTime) {
                const speedMultiplier = this.getSpeedMultiplier();
                this.position.x += this.velocity.x * deltaTime * speedMultiplier;
                this.position.y += this.velocity.y * deltaTime * speedMultiplier;
            }

            checkBoundaries() {
                const maxX = this.container.clientWidth - this.SPRITE_SIZE - this.MARGIN;
                const maxY = this.container.clientHeight - this.SPRITE_SIZE - this.MARGIN;
                const minX = this.MARGIN;
                const minY = this.MARGIN;

                let bounced = false;

                if (this.position.x <= minX || this.position.x >= maxX) {
                    this.velocity.x *= -1;
                    this.position.x = Math.max(minX, Math.min(maxX, this.position.x));
                    bounced = true;
                }

                if (this.position.y <= minY || this.position.y >= maxY) {
                    this.velocity.y *= -1;
                    this.position.y = Math.max(minY, Math.min(maxY, this.position.y));
                    bounced = true;
                }

                if (bounced) {
                    this.addBounceEffect();
                }
            }

            updateSpritePosition() {
                // Don't move the sprite for now - keep it in original CSS position
                console.log('Sprite position update skipped - keeping original position');
                // const x = Math.max(0, Math.min(this.position.x, (this.container.clientWidth || 800) - this.SPRITE_SIZE));
                // const y = Math.max(0, Math.min(this.position.y, (this.container.clientHeight || 600) - this.SPRITE_SIZE));
                // spriteContainer.style.transform = \`translate(\${x}px, \${y}px)\`;
            }

            scheduleNextMovement() {
                if (!this.config.enabled) return;
                const idleTime = 2000 + Math.random() * 6000; // 2-8 seconds
                this.idleTimer = setTimeout(() => {
                    this.startMovement();
                }, idleTime);
            }

            startMovement() {
                if (!this.config.enabled) return;
                
                const angle = Math.random() * Math.PI * 2;
                this.velocity.x = Math.cos(angle) * this.BASE_SPEED;
                this.velocity.y = Math.sin(angle) * this.BASE_SPEED;
                
                this.isMoving = true;
                this.addWalkingAnimation();

                const movementDuration = 1000 + Math.random() * 3000; // 1-4 seconds
                this.movementTimer = setTimeout(() => {
                    this.stopMovement();
                }, movementDuration);
            }

            stopMovement() {
                this.isMoving = false;
                this.velocity = { x: 0, y: 0 };
                this.sprite.classList.remove('sprite-walking');
                this.scheduleNextMovement();
            }

            addWalkingAnimation() {
                this.sprite.classList.add('sprite-walking');
                if (this.config.animationSpeed === 'slow') {
                    this.sprite.classList.add('slow');
                } else if (this.config.animationSpeed === 'fast') {
                    this.sprite.classList.add('fast');
                }
            }

            addBounceEffect() {
                this.sprite.classList.add('sprite-bounce-wall');
                setTimeout(() => {
                    this.sprite.classList.remove('sprite-bounce-wall');
                }, 300);
            }

            triggerBounce() {
                const animationClass = 'sprite-bounce';
                const speedClass = this.config?.animationSpeed || 'normal';
                
                this.sprite.classList.add(animationClass);
                if (speedClass !== 'normal') {
                    this.sprite.classList.add(speedClass);
                }
                
                const duration = speedClass === 'slow' ? 2000 : speedClass === 'fast' ? 500 : 1000;
                setTimeout(() => {
                    this.sprite.classList.remove(animationClass);
                    if (speedClass !== 'normal') {
                        this.sprite.classList.remove(speedClass);
                    }
                }, duration);
            }

            getSpeedMultiplier() {
                switch (this.config.speed) {
                    case 'slow': return 0.5;
                    case 'fast': return 2.0;
                    default: return 1.0;
                }
            }

            dispose() {
                this.stopAnimation();
            }
        }

        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            console.log('Received message:', message.type, message.data);
            
            switch (message.type) {
                case 'config':
                    config = message.data;
                    initializeSpriteAnimator();
                    updateVisibility();
                    break;
                case 'configUpdate':
                    config = message.data;
                    if (spriteAnimator) {
                        spriteAnimator.updateConfig(config);
                    }
                    updateVisibility();
                    break;
                case 'showCountdown':
                    showCountdown(message.data);
                    break;
            }
        });

        // Sprite click handler
        spriteContainer.addEventListener('click', () => {
            console.log('Sprite clicked!');
            
            // Trigger bounce animation through animator or fallback
            if (spriteAnimator) {
                spriteAnimator.triggerBounce();
            } else {
                // Fallback bounce animation
                sprite.classList.add('sprite-bounce');
                setTimeout(() => {
                    sprite.classList.remove('sprite-bounce');
                }, 1000);
            }

            // Request countdown from extension
            vscode.postMessage({
                type: 'requestCountdown'
            });
        });

        function initializeSpriteAnimator() {
            console.log('Initializing sprite animator with config:', config);
            if (spriteAnimator) {
                spriteAnimator.dispose();
            }
            
            if (config) {
                // Ensure sprite stays visible regardless of config
                spriteContainer.style.display = 'block';
                spriteAnimator = new SpriteAnimator(sprite, document.body, config);
                console.log('Sprite animator created successfully');
            } else {
                console.warn('No config available for sprite animator');
                // Keep sprite visible even without config
                spriteContainer.style.display = 'block';
            }
        }

        function showCountdown(data) {
            countdownText.textContent = data.message;

            // Show speech bubble
            speechBubble.classList.add('show');
            
            // Hide after configured timeout
            const timeout = data.autoHideTimeout || 3000;
            setTimeout(() => {
                speechBubble.classList.remove('show');
            }, timeout);
        }

        function updateVisibility() {
            // Always keep sprite visible for now - disable config-based hiding
            spriteContainer.style.display = 'block';
            console.log('Sprite forced to be visible');
            
            // if (config && config.enabled !== undefined) {
            //     spriteContainer.style.display = config.enabled ? 'block' : 'none';
            //     console.log('Sprite visibility updated:', config.enabled ? 'visible' : 'hidden');
            // } else {
            //     // Show sprite by default if no config yet
            //     spriteContainer.style.display = 'block';
            //     console.log('Sprite shown by default (no config)');
            // }
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            if (spriteAnimator) {
                spriteAnimator.initializePosition();
            }
        });
        
        // Initialize visibility immediately
        updateVisibility();
        
        // Show initial welcome message after a delay
        setTimeout(() => {
            showCountdown({
                message: "🍩 Hi! Are you exited for Fabric February?! Click me for countdown!",
                autoHideTimeout: 5000
            });
        }, 2000);
        
        console.log('FabFeb Countdown webview initialized with donut sprite!');
    </script>
</body>
</html>`;
    }

    private getSpriteUri(): string {
        if (!this.panel) {
            return '';
        }
        
        const spriteUri = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(this.context.extensionPath, 'assets', 'fabfeb-donut.svg'))
        );
        
        return spriteUri.toString();
    }

    private getNonce(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
} 