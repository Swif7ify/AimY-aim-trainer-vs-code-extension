export function getGameHTML3D(opts?: {
	fontFamily?: string;
	targetGoals?: number;
	targetMove?: boolean;
	targetSpeed?: number;
	targetSize?: number;
	targetTimeExists?: number;
	enableSoundEffects?: boolean;
	soundVolume?: number;
	enableEffects?: boolean;
	isLight?: boolean;
	gameMode?: string;
	timeFrenzyDuration?: number;
	hydraTargetCount?: number;
	hydraTotalTime?: number;
	hydraMode?: string;
}): string {
	const GAME_MODE = opts?.gameMode || "target_rush";
	const ff = (opts?.fontFamily || "Segoe UI").replace(/["`]/g, "");
	const IS_LIGHT = !!opts?.isLight;
	const TARGET_GOALS = opts?.targetGoals ?? 5;
	const DEFAULT_SIZE = (opts?.targetSize ?? 100) / 50; // Scale for 3D
	const DEFAULT_MOVE = opts?.targetMove ?? false;
	const DEFAULT_SPEED = (opts?.targetSpeed ?? 3000) / 1000; // Convert to units per second
	const TIME_EXISTS =
		GAME_MODE === "hydra_targets" ? 0 : opts?.targetTimeExists ?? 3000;
	const SOUND_EFFECTS = opts?.enableSoundEffects ?? true;
	const SOUND_VOLUME = opts?.soundVolume ?? 80;
	const ENABLE_EFFECTS = opts?.enableEffects ?? true;

	const TIME_FRENZY_DURATION = opts?.timeFrenzyDuration ?? 60000;
	const HYDRA_TARGET_COUNT = opts?.hydraTargetCount ?? 20;
	const HYDRA_TOTAL_TIME = opts?.hydraTotalTime ?? 60000;
	const HYDRA_MODE = opts?.hydraMode || "target_count";

	// Theme colors - Clean Professional
	const HUD_BG = IS_LIGHT ? "rgba(255,255,255,0.9)" : "rgba(20, 20, 25, 0.9)";
	const HUD_BORDER = IS_LIGHT ? "rgba(200, 200, 200, 0.5)" : "rgba(80, 80, 90, 0.5)";
	const HUD_TEXT = IS_LIGHT ? "#111111" : "#ffffff";
	const HUD_ACCENT = "#ffffff";
	const SCORE_COLOR = "#4ade80";
	const STREAK_COLOR = "#f97316";

	return `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AimY Game 3D</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;700&display=swap');
                
                :root {
                    --font-family: 'Rajdhani', ${ff}, sans-serif;
                    --font-display: 'Orbitron', monospace;
                    --hud-bg: ${HUD_BG};
                    --hud-border: ${HUD_BORDER};
                    --hud-text: ${HUD_TEXT};
                    --hud-accent: ${HUD_ACCENT};
                    --score-color: ${SCORE_COLOR};
                    --streak-color: ${STREAK_COLOR};
                    --glow-cyan: none;
                    --glow-magenta: none;
                }
                
                * { margin: 0; padding: 0; box-sizing: border-box; }
                
                body {
                    height: 100vh;
                    font-family: var(--font-family);
                    overflow: hidden;
                    background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%);
                }
                
                #game-area {
                    height: 100vh;
                    width: 100vw;
                }
                
                /* Premium HUD */
                .hud {
                    position: fixed;
                    top: 20px;
                    left: 20px;
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    padding: 14px 24px;
                    background: var(--hud-bg);
                    border: 1px solid var(--hud-border);
                    border-radius: 12px;
                    backdrop-filter: blur(20px);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                    font-size: 14px;
                    animation: hudSlideIn 0.5s ease-out;
                }
                
                @keyframes hudSlideIn {
                    from { transform: translateY(-100px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                .hud-title {
                    font-family: var(--font-display);
                    font-size: 16px;
                    font-weight: 900;
                    color: var(--hud-accent);
                    text-transform: uppercase;
                    letter-spacing: 3px;
                    padding-right: 20px;
                    border-right: 2px solid var(--hud-border);
                    margin-right: 8px;
                    text-shadow: none;
                    animation: titlePulse 2s ease-in-out infinite;
                }
                
                @keyframes titlePulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                }
                
                .hud-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2px;
                    font-weight: 500;
                    color: var(--hud-text);
                }
                
                .hud-item .label {
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    opacity: 0.7;
                }
                
                .hud-item .value {
                    font-family: var(--font-display);
                    font-size: 20px;
                    font-weight: 700;
                    transition: all 0.2s ease;
                }
                
                .score .value { 
                    color: var(--score-color); 
                }
                
                .streak .value { 
                    color: var(--streak-color); 
                }
                
                .accuracy .value { 
                    color: var(--hud-accent); 
                }
                
                .timer .value { 
                    color: #ffffff; 
                }
                
                /* Value change animation */
                .value.updated {
                    transform: scale(1.3);
                    filter: brightness(1.5);
                }
                
                /* Instructions overlay */
                .instructions {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(30, 30, 35, 0.95);
                    border: 1px solid rgba(100, 100, 110, 0.5);
                    color: white;
                    padding: 40px 60px;
                    border-radius: 16px;
                    text-align: center;
                    font-size: 18px;
                    z-index: 2000;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
                }
                
                @keyframes instructionsPulse {
                    0%, 100% { box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 255, 255, 0.3); }
                    50% { box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 50px rgba(0, 255, 255, 0.5); }
                }
                
                .instructions h2 {
                    font-family: var(--font-display);
                    font-size: 28px;
                    color: #ffffff;
                    margin-bottom: 16px;
                    letter-spacing: 4px;
                }
                
                .instructions p {
                    font-size: 16px;
                    opacity: 0.9;
                    line-height: 1.6;
                }
                
                .instructions .click-hint {
                    margin-top: 24px;
                    padding: 12px 28px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 8px;
                    display: inline-block;
                    font-weight: 600;
                }
                
                @keyframes clickPulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                
                .instructions.hidden { display: none; }
                
                /* Hit marker flash */
                .hit-marker {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    pointer-events: none;
                    z-index: 1500;
                    opacity: 0;
                }
                
                .hit-marker.show {
                    animation: hitMarkerFlash 0.15s ease-out;
                }
                
                @keyframes hitMarkerFlash {
                    0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
                }
                
                /* Combo popup */
                .combo-popup {
                    position: fixed;
                    top: 40%;
                    left: 50%;
                    transform: translateX(-50%);
                    font-family: var(--font-display);
                    font-size: 48px;
                    font-weight: 900;
                    color: var(--streak-color);
                    pointer-events: none;
                    z-index: 1500;
                    opacity: 0;
                }
                
                .combo-popup.show {
                    animation: comboPopup 0.8s ease-out;
                }
                
                @keyframes comboPopup {
                    0% { opacity: 1; transform: translateX(-50%) translateY(0) scale(0.5); }
                    50% { opacity: 1; transform: translateX(-50%) translateY(-20px) scale(1.2); }
                    100% { opacity: 0; transform: translateX(-50%) translateY(-50px) scale(1); }
                }
                
                /* Screen flash on hit */
                .screen-flash {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    pointer-events: none;
                    z-index: 1400;
                    opacity: 0;
                }
                
                .screen-flash.hit {
                    animation: screenFlashHit 0.1s ease-out;
                }
                
                @keyframes screenFlashHit {
                    0% { opacity: 0.15; background: radial-gradient(circle at center, rgba(0, 255, 136, 0.3), transparent 70%); }
                    100% { opacity: 0; }
                }
            </style>
        </head>
        <body>
            <div id="game-area"></div>
            
            <!-- Premium HUD -->
            <div class="hud">
                <div class="hud-title">AimY</div>
                <div class="hud-item score">
                    <span class="label">Score</span>
                    <span class="value"><span id="score">0</span>/<span id="targetTotal">${TARGET_GOALS}</span></span>
                </div>
                <div class="hud-item timer">
                    <span class="label">Time</span>
                    <span class="value" id="timer">0s</span>
                </div>
                <div class="hud-item accuracy">
                    <span class="label">Accuracy</span>
                    <span class="value"><span id="accuracy">100</span>%</span>
                </div>
                <div class="hud-item streak">
                    <span class="label">Streak</span>
                    <span class="value" id="streak">0</span>
                </div>
            </div>
            
            <!-- Instructions -->
            <div id="instructions" class="instructions">
                <h2>READY TO AIM</h2>
                <p>Lock onto targets and eliminate them with precision.</p>
                <div class="click-hint">Click to Start</div>
            </div>
            
            <!-- Hit marker -->
            <div id="hitMarker" class="hit-marker">
                <svg width="40" height="40" viewBox="0 0 40 40">
                    <line x1="0" y1="0" x2="15" y2="15" stroke="#00ff88" stroke-width="3"/>
                    <line x1="40" y1="0" x2="25" y2="15" stroke="#00ff88" stroke-width="3"/>
                    <line x1="0" y1="40" x2="15" y2="25" stroke="#00ff88" stroke-width="3"/>
                    <line x1="40" y1="40" x2="25" y2="25" stroke="#00ff88" stroke-width="3"/>
                </svg>
            </div>
            
            <!-- Combo popup -->
            <div id="comboPopup" class="combo-popup"></div>
            
            <!-- Screen flash -->
            <div id="screenFlash" class="screen-flash"></div>
        </body>
        
        <script type="module">
            import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
            import { PointerLockControls } from 'https://esm.sh/three@0.152.2/examples/jsm/controls/PointerLockControls.js';

            const vscode = acquireVsCodeApi();
            
            // ===== GAME STATE =====
            let score = 0;
            let shots = 0;
            let streak = 0;
            let bestStreak = 0;
            let targetCount = ${TARGET_GOALS};
            let gameStartTime = Date.now();
            let gameEndTime = null;
            let currentTargets = [];
            let gameTimeLimit = 0;
            let gameTargetLimit = 0;
            let gameActive = false;
            let particlePool = [];
            const MAX_PARTICLES = 100;
            
            // Game mode setup
            const GAME_MODE = "${GAME_MODE}";
            const HYDRA_MODE = "${HYDRA_MODE}";
            if (GAME_MODE === "time_frenzy") {
                gameTimeLimit = ${TIME_FRENZY_DURATION};
                targetCount = 999;
                document.getElementById('targetTotal').textContent = '∞';
            } else if (GAME_MODE === "hydra_targets") {
                if (HYDRA_MODE === "timed") {
                    gameTimeLimit = ${HYDRA_TOTAL_TIME};
                    targetCount = 999;
                    document.getElementById('targetTotal').textContent = '∞';
                } else {
                    gameTimeLimit = 0;
                    gameTargetLimit = ${HYDRA_TARGET_COUNT};
                    targetCount = gameTargetLimit;
                    document.getElementById('targetTotal').textContent = gameTargetLimit;
                }
            } else {
                document.getElementById('targetTotal').textContent = targetCount;
            }
            
            // UI elements
            const scoreElement = document.getElementById('score');
            const timerElement = document.getElementById('timer');
            const accuracyElement = document.getElementById('accuracy');
            const streakElement = document.getElementById('streak');
            const instructionsElement = document.getElementById('instructions');
            const hitMarker = document.getElementById('hitMarker');
            const comboPopup = document.getElementById('comboPopup');
            const screenFlash = document.getElementById('screenFlash');
            
            // ===== THREE.JS SCENE SETUP =====
            const scene = new THREE.Scene();
            
            // Fog for atmosphere
            scene.fog = new THREE.FogExp2(0x0a0a1a, 0.015);
            
            const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 15, 0);
            
            const renderer = new THREE.WebGLRenderer({ 
                antialias: true, 
                alpha: false,
                powerPreference: "high-performance"
            });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Limit for performance
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFShadowMap;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.2;
            
            const container = document.getElementById("game-area");
            container.appendChild(renderer.domElement);
            
            // ===== LIGHTING =====
            // Ambient light - deep blue tint
            const ambientLight = new THREE.AmbientLight(0x1a1a3e, 0.4);
            scene.add(ambientLight);
            
            // Main directional light - cyan tint
            const mainLight = new THREE.DirectionalLight(0x00ffff, 0.6);
            mainLight.position.set(30, 50, 20);
            mainLight.castShadow = true;
            mainLight.shadow.mapSize.width = 1024;
            mainLight.shadow.mapSize.height = 1024;
            mainLight.shadow.camera.near = 0.1;
            mainLight.shadow.camera.far = 150;
            mainLight.shadow.camera.left = -40;
            mainLight.shadow.camera.right = 40;
            mainLight.shadow.camera.top = 40;
            mainLight.shadow.camera.bottom = -40;
            scene.add(mainLight);
            
            // Accent light - magenta from opposite side
            const accentLight = new THREE.DirectionalLight(0xff00ff, 0.3);
            accentLight.position.set(-30, 30, -10);
            scene.add(accentLight);
            
            // Point lights for atmosphere
            const pointLight1 = new THREE.PointLight(0x00ffff, 0.5, 50);
            pointLight1.position.set(-20, 10, 0);
            scene.add(pointLight1);
            
            const pointLight2 = new THREE.PointLight(0xff00ff, 0.5, 50);
            pointLight2.position.set(20, 10, -20);
            scene.add(pointLight2);
            
            // ===== ENVIRONMENT =====
            
            // Sky gradient background
            const skyGeometry = new THREE.SphereGeometry(200, 32, 32);
            const skyMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    topColor: { value: new THREE.Color(0x0a0a2e) },
                    bottomColor: { value: new THREE.Color(0x1a0a2e) },
                    offset: { value: 20 },
                    exponent: { value: 0.6 }
                },
                vertexShader: \`
                    varying vec3 vWorldPosition;
                    void main() {
                        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                        vWorldPosition = worldPosition.xyz;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                \`,
                fragmentShader: \`
                    uniform vec3 topColor;
                    uniform vec3 bottomColor;
                    uniform float offset;
                    uniform float exponent;
                    varying vec3 vWorldPosition;
                    void main() {
                        float h = normalize(vWorldPosition + offset).y;
                        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
                    }
                \`,
                side: THREE.BackSide
            });
            const sky = new THREE.Mesh(skyGeometry, skyMaterial);
            scene.add(sky);
            
            // Grid floor - Tron style
            const gridSize = 100;
            const gridHelper = new THREE.GridHelper(gridSize, 50, 0x00aaff, 0x004466);
            gridHelper.position.y = 0;
            gridHelper.material.opacity = 0.3;
            gridHelper.material.transparent = true;
            scene.add(gridHelper);
            
            // Floor plane with subtle reflection
            const floorGeometry = new THREE.PlaneGeometry(gridSize, gridSize);
            const floorMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x0a0a1a,
                roughness: 0.8,
                metalness: 0.2,
                transparent: true,
                opacity: 0.95
            });
            const floor = new THREE.Mesh(floorGeometry, floorMaterial);
            floor.rotation.x = -Math.PI / 2;
            floor.receiveShadow = true;
            scene.add(floor);
            
            // ===== TARGET BOARD - Clean Frame =====
            // Board farther from player for more realistic aim training
            const boardWidth = 50;
            const boardHeight = 35;
            const boardDistance = 15;
            
            // Main board - semi-transparent, centered at camera height
            const boardGeometry = new THREE.PlaneGeometry(boardWidth, boardHeight);
            const boardMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x1a1a20,
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide
            });
            const targetBoard = new THREE.Mesh(boardGeometry, boardMaterial);
            // Center the board around camera Y position (10)
            targetBoard.position.set(0, 10, -boardDistance);
            scene.add(targetBoard);
            
            // Simple frame around board
            function createFrame(width, height, color, thickness = 0.2) {
                const frameGroup = new THREE.Group();
                const frameMaterial = new THREE.MeshBasicMaterial({ color: color });
                
                // Horizontal bars
                const hBar = new THREE.BoxGeometry(width + thickness * 2, thickness, thickness);
                const topBar = new THREE.Mesh(hBar, frameMaterial);
                topBar.position.y = height / 2;
                frameGroup.add(topBar);
                
                const bottomBar = new THREE.Mesh(hBar.clone(), frameMaterial);
                bottomBar.position.y = -height / 2;
                frameGroup.add(bottomBar);
                
                // Vertical bars
                const vBar = new THREE.BoxGeometry(thickness, height, thickness);
                const leftBar = new THREE.Mesh(vBar, frameMaterial);
                leftBar.position.x = -width / 2;
                frameGroup.add(leftBar);
                
                const rightBar = new THREE.Mesh(vBar.clone(), frameMaterial);
                rightBar.position.x = width / 2;
                frameGroup.add(rightBar);
                
                return frameGroup;
            }
            
            const mainFrame = createFrame(boardWidth, boardHeight, 0x444450);
            mainFrame.position.copy(targetBoard.position);
            mainFrame.position.z += 0.1;
            scene.add(mainFrame);
            
            // ===== CONTROLS =====
            const controls = new PointerLockControls(camera, renderer.domElement);
            scene.add(controls.getObject());
            
            // ===== CROSSHAIR =====
            function createCrosshair() {
                const crosshair = new THREE.Group();
                const lineLength = 0.025;
                const centerGap = 0.01;
                const dotSize = 0.003;
                
                // Crosshair lines - white
                const material = new THREE.LineBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.9
                });
                
                const lines = [
                    [new THREE.Vector3(0, centerGap, 0), new THREE.Vector3(0, centerGap + lineLength, 0)],
                    [new THREE.Vector3(0, -centerGap, 0), new THREE.Vector3(0, -centerGap - lineLength, 0)],
                    [new THREE.Vector3(-centerGap, 0, 0), new THREE.Vector3(-centerGap - lineLength, 0, 0)],
                    [new THREE.Vector3(centerGap, 0, 0), new THREE.Vector3(centerGap + lineLength, 0, 0)]
                ];
                
                lines.forEach(linePoints => {
                    const geometry = new THREE.BufferGeometry().setFromPoints(linePoints);
                    const line = new THREE.Line(geometry, material);
                    crosshair.add(line);
                });
                
                // Center dot
                const dotGeometry = new THREE.CircleGeometry(dotSize, 8);
                const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
                const dot = new THREE.Mesh(dotGeometry, dotMaterial);
                crosshair.add(dot);
                
                crosshair.position.z = -0.5;
                return crosshair;
            }
            
            const crosshair = createCrosshair();
            camera.add(crosshair);
            
            // ===== PISTOL MODEL =====
            function createPistol() {
                const pistol = new THREE.Group();
                
                // Modern pistol design - all parts built pointing forward (-Z)
                const bodyMaterial = new THREE.MeshStandardMaterial({ 
                    color: 0x1a1a1a, 
                    roughness: 0.3,
                    metalness: 0.8
                });
                const accentMaterial = new THREE.MeshStandardMaterial({ 
                    color: 0xcccccc, 
                    roughness: 0.4,
                    metalness: 0.6
                });
                
                // Main slide/body - oriented along Z axis (pointing forward)
                const slideGeometry = new THREE.BoxGeometry(0.12, 0.14, 0.55);
                const slide = new THREE.Mesh(slideGeometry, bodyMaterial);
                slide.position.set(0, 0.02, -0.1);
                pistol.add(slide);
                
                // Barrel - cylinder pointing forward
                const barrelGeometry = new THREE.CylinderGeometry(0.025, 0.03, 0.25, 8);
                const barrel = new THREE.Mesh(barrelGeometry, bodyMaterial);
                barrel.rotation.x = Math.PI / 2; // Point forward
                barrel.position.set(0, 0.02, -0.45);
                pistol.add(barrel);
                
                // Barrel tip - neon accent
                const barrelTip = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.028, 0.028, 0.04, 8),
                    accentMaterial
                );
                barrelTip.rotation.x = Math.PI / 2;
                barrelTip.position.set(0, 0.02, -0.58);
                pistol.add(barrelTip);
                
                // Grip - angled downward
                const gripGeometry = new THREE.BoxGeometry(0.1, 0.35, 0.16);
                const grip = new THREE.Mesh(gripGeometry, bodyMaterial);
                grip.position.set(0, -0.18, 0.08);
                grip.rotation.x = 0.2; // Slight backward angle
                pistol.add(grip);
                
                // Front sight - neon
                const frontSightGeometry = new THREE.BoxGeometry(0.02, 0.03, 0.02);
                const frontSight = new THREE.Mesh(frontSightGeometry, accentMaterial);
                frontSight.position.set(0, 0.105, -0.35);
                pistol.add(frontSight);
                
                // Rear sight
                const rearSightGeometry = new THREE.BoxGeometry(0.06, 0.025, 0.02);
                const rearSight = new THREE.Mesh(rearSightGeometry, accentMaterial);
                rearSight.position.set(0, 0.1, 0.1);
                pistol.add(rearSight);
                
                // Trigger guard
                const triggerGuardGeometry = new THREE.TorusGeometry(0.04, 0.012, 6, 12, Math.PI);
                const triggerGuard = new THREE.Mesh(triggerGuardGeometry, bodyMaterial);
                triggerGuard.position.set(0, -0.06, -0.08);
                triggerGuard.rotation.x = -Math.PI / 2;
                triggerGuard.rotation.z = Math.PI;
                pistol.add(triggerGuard);
                
                // Trigger
                const triggerGeometry = new THREE.BoxGeometry(0.015, 0.04, 0.015);
                const trigger = new THREE.Mesh(triggerGeometry, bodyMaterial);
                trigger.position.set(0, -0.05, -0.06);
                pistol.add(trigger);
                
                // Neon accent strip on side
                const accentStripGeometry = new THREE.BoxGeometry(0.002, 0.03, 0.3);
                const accentStrip1 = new THREE.Mesh(accentStripGeometry, accentMaterial);
                accentStrip1.position.set(0.062, 0.04, -0.1);
                pistol.add(accentStrip1);
                
                const accentStrip2 = new THREE.Mesh(accentStripGeometry.clone(), accentMaterial);
                accentStrip2.position.set(-0.062, 0.04, -0.1);
                pistol.add(accentStrip2);
                
                // Position for first person view - bottom right, pointing forward
                pistol.position.set(0.25, -0.22, -0.5);
                pistol.scale.set(1.2, 1.2, 1.2);
                
                return pistol;
            }
            
            const pistol = createPistol();
            camera.add(pistol);
            
            // ===== AUDIO =====
            let audioCtx = null;
            let masterGain = null;
            if (${SOUND_EFFECTS}) {
                try {
                    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    masterGain = audioCtx.createGain();
                    masterGain.gain.value = Math.max(0, Math.min(1, ${SOUND_VOLUME}/100));
                    masterGain.connect(audioCtx.destination);
                } catch (e) {
                    audioCtx = null;
                    masterGain = null;
                }
            }
            
            function playHitSound() {
                if (!${SOUND_EFFECTS} || !audioCtx || !masterGain) return;
                const now = audioCtx.currentTime;
                
                // Satisfying hit sound
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, now);
                osc.frequency.exponentialRampToValueAtTime(440, now + 0.1);
                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.exponentialRampToValueAtTime(0.25, now + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
                osc.connect(gain);
                gain.connect(masterGain);
                osc.start(now);
                osc.stop(now + 0.2);
                
                // Pop layer
                const osc2 = audioCtx.createOscillator();
                const gain2 = audioCtx.createGain();
                osc2.type = 'square';
                osc2.frequency.setValueAtTime(1200, now);
                osc2.frequency.exponentialRampToValueAtTime(300, now + 0.05);
                gain2.gain.setValueAtTime(0.0001, now);
                gain2.gain.exponentialRampToValueAtTime(0.1, now + 0.005);
                gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
                osc2.connect(gain2);
                gain2.connect(masterGain);
                osc2.start(now);
                osc2.stop(now + 0.1);
            }
            
            function playMissSound() {
                if (!${SOUND_EFFECTS} || !audioCtx || !masterGain) return;
                const now = audioCtx.currentTime;
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.12);
                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
                osc.connect(gain);
                gain.connect(masterGain);
                osc.start(now);
                osc.stop(now + 0.18);
            }
            
            // ===== TARGET CREATION =====
            const targetColors = [
                { main: 0xff4444, glow: 0xcc3333 }, // Red
                { main: 0xff6600, glow: 0xcc5500 }, // Orange
                { main: 0xffcc00, glow: 0xccaa00 }, // Yellow
                { main: 0x44aaff, glow: 0x3388cc }  // Blue
            ];
            
            function createTarget() {
                const size = ${DEFAULT_SIZE};
                const colorSet = targetColors[Math.floor(Math.random() * targetColors.length)];
                
                const target = new THREE.Group();
                
                // Outer glow ring
                const glowRingGeo = new THREE.RingGeometry(size * 0.9, size * 1.1, 24);
                const glowRingMat = new THREE.MeshBasicMaterial({ 
                    color: colorSet.main,
                    transparent: true,
                    opacity: 0.3,
                    side: THREE.DoubleSide
                });
                const glowRing = new THREE.Mesh(glowRingGeo, glowRingMat);
                target.add(glowRing);
                
                // Middle ring
                const midRingGeo = new THREE.RingGeometry(size * 0.5, size * 0.7, 20);
                const midRingMat = new THREE.MeshBasicMaterial({ 
                    color: colorSet.main,
                    transparent: true,
                    opacity: 0.7,
                    side: THREE.DoubleSide
                });
                const midRing = new THREE.Mesh(midRingGeo, midRingMat);
                target.add(midRing);
                
                // Core sphere
                const coreGeo = new THREE.SphereGeometry(size * 0.4, 16, 16);
                const coreMat = new THREE.MeshBasicMaterial({ 
                    color: colorSet.main
                });
                const core = new THREE.Mesh(coreGeo, coreMat);
                target.add(core);
                
                // Center bright point
                const centerGeo = new THREE.SphereGeometry(size * 0.15, 12, 12);
                const centerMat = new THREE.MeshBasicMaterial({ 
                    color: 0xffffff
                });
                const center = new THREE.Mesh(centerGeo, centerMat);
                target.add(center);
                
                // Position within board bounds - center around camera Y (10)
                const boardMargin = 4;
                const x = (Math.random() - 0.5) * (boardWidth - boardMargin * 2);
                // Y position: center at camera height (10), spread within board height
                const y = 10 + (Math.random() - 0.5) * (boardHeight - boardMargin * 2);
                const z = -boardDistance + 1.5;
                
                target.position.set(x, y, z);
                
                target.userData = {
                    isTarget: true,
                    size: size,
                    id: Date.now() + Math.random(),
                    startTime: Date.now(),
                    color: colorSet,
                    pulsePhase: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.02
                };
                
                // Movement if enabled
                if (${DEFAULT_MOVE} && GAME_MODE !== "hydra_targets") {
                    target.userData.moveSpeed = ${DEFAULT_SPEED};
                    target.userData.moveDirection = new THREE.Vector3(
                        (Math.random() - 0.5) * 2,
                        (Math.random() - 0.5) * 1.5,
                        0
                    ).normalize();
                    target.userData.boardBounds = {
                        minX: -boardWidth/2 + boardMargin,
                        maxX: boardWidth/2 - boardMargin,
                        minY: 10 - boardHeight/2 + boardMargin,
                        maxY: 10 + boardHeight/2 - boardMargin
                    };
                }
                
                scene.add(target);
                
                if (GAME_MODE === "hydra_targets") {
                    currentTargets.push(target);
                } else {
                    if (currentTargets[0]) scene.remove(currentTargets[0]);
                    currentTargets = [target];
                }
                
                // Auto-remove timer
                if (${TIME_EXISTS} > 0) {
                    setTimeout(() => {
                        const targetIndex = currentTargets.findIndex(t => t.userData.id === target.userData.id);
                        if (targetIndex !== -1) {
                            streak = 0;
                            scene.remove(target);
                            currentTargets.splice(targetIndex, 1);
                            
                            if (GAME_MODE === "hydra_targets" && currentTargets.length < 3) {
                                createTarget();
                            } else if (GAME_MODE !== "hydra_targets") {
                                createTarget();
                            }
                        }
                    }, ${TIME_EXISTS});
                }
            }
            
            // ===== PARTICLE SYSTEM =====
            function createHitParticles(position, color) {
                if (!${ENABLE_EFFECTS}) return;
                
                const particleCount = 25;
                const particles = new THREE.Group();
                
                for (let i = 0; i < particleCount; i++) {
                    const particleGeo = new THREE.SphereGeometry(0.08 + Math.random() * 0.08, 6, 6);
                    const particleMat = new THREE.MeshBasicMaterial({ 
                        color: i % 2 === 0 ? color.main : color.glow,
                        transparent: true,
                        opacity: 1
                    });
                    const particle = new THREE.Mesh(particleGeo, particleMat);
                    particle.position.copy(position);
                    
                    const angle = (i / particleCount) * Math.PI * 2;
                    const speed = 8 + Math.random() * 8;
                    particle.userData = {
                        velocity: new THREE.Vector3(
                            Math.cos(angle) * speed * (0.5 + Math.random()),
                            Math.sin(angle) * speed * (0.5 + Math.random()) + 3,
                            (Math.random() - 0.5) * speed * 0.5
                        ),
                        life: 1.0,
                        decay: 0.02 + Math.random() * 0.02
                    };
                    particles.add(particle);
                }
                
                scene.add(particles);
                
                // Animate particles
                const animateParticles = () => {
                    let hasActive = false;
                    particles.children.forEach(particle => {
                        if (particle.userData.life > 0) {
                            particle.position.add(particle.userData.velocity.clone().multiplyScalar(0.016));
                            particle.userData.velocity.y -= 15 * 0.016; // Gravity
                            particle.userData.velocity.multiplyScalar(0.96);
                            particle.userData.life -= particle.userData.decay;
                            particle.material.opacity = particle.userData.life;
                            particle.scale.setScalar(particle.userData.life);
                            hasActive = true;
                        }
                    });
                    if (hasActive) {
                        requestAnimationFrame(animateParticles);
                    } else {
                        // Cleanup
                        particles.children.forEach(p => {
                            p.geometry.dispose();
                            p.material.dispose();
                        });
                        scene.remove(particles);
                    }
                };
                animateParticles();
            }
            
            // Shockwave ring effect
            function createShockwave(position, color) {
                if (!${ENABLE_EFFECTS}) return;
                
                const ringGeo = new THREE.RingGeometry(0.1, 0.3, 32);
                const ringMat = new THREE.MeshBasicMaterial({
                    color: color.main,
                    transparent: true,
                    opacity: 0.8,
                    side: THREE.DoubleSide
                });
                const ring = new THREE.Mesh(ringGeo, ringMat);
                ring.position.copy(position);
                ring.lookAt(camera.position);
                scene.add(ring);
                
                let scale = 1;
                const animateRing = () => {
                    scale += 0.3;
                    ring.scale.setScalar(scale);
                    ring.material.opacity -= 0.08;
                    
                    if (ring.material.opacity > 0) {
                        requestAnimationFrame(animateRing);
                    } else {
                        ring.geometry.dispose();
                        ring.material.dispose();
                        scene.remove(ring);
                    }
                };
                animateRing();
            }
            
            // ===== SHOOTING =====
            const raycaster = new THREE.Raycaster();
            
            function showHitMarker() {
                hitMarker.classList.remove('show');
                void hitMarker.offsetWidth; // Trigger reflow
                hitMarker.classList.add('show');
            }
            
            function showCombo(combo) {
                if (combo >= 3) {
                    comboPopup.textContent = combo + 'x COMBO!';
                    comboPopup.classList.remove('show');
                    void comboPopup.offsetWidth;
                    comboPopup.classList.add('show');
                }
            }
            
            function showScreenFlash() {
                screenFlash.classList.remove('hit');
                void screenFlash.offsetWidth;
                screenFlash.classList.add('hit');
            }
            
            function animateValue(element) {
                element.classList.add('updated');
                setTimeout(() => element.classList.remove('updated'), 150);
            }
            
            function shoot() {
                if (!gameActive) return;
                
                raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
                
                const intersects = raycaster.intersectObjects(currentTargets, true);
                shots++;
                
                if (intersects.length > 0) {
                    const hit = intersects[0];
                    let target = hit.object;
                    while (target.parent && !target.userData.isTarget) {
                        target = target.parent;
                    }
                    
                    if (target.userData && target.userData.isTarget) {
                        score++;
                        streak++;
                        if (streak > bestStreak) bestStreak = streak;
                        
                        scoreElement.textContent = score;
                        animateValue(scoreElement.parentElement);
                        
                        if (${SOUND_EFFECTS}) playHitSound();
                        
                        // Visual feedback
                        showHitMarker();
                        showCombo(streak);
                        showScreenFlash();
                        
                        // Particle effects
                        if (${ENABLE_EFFECTS}) {
                            createHitParticles(hit.point, target.userData.color);
                            createShockwave(hit.point, target.userData.color);
                        }
                        
                        // Remove target
                        const targetIndex = currentTargets.findIndex(t => t.userData.id === target.userData.id);
                        if (targetIndex !== -1) {
                            scene.remove(target);
                            currentTargets.splice(targetIndex, 1);
                        }
                        
                        // Check win conditions
                        if (GAME_MODE === "target_rush" && score >= targetCount) {
                            gameComplete();
                        } else if (GAME_MODE === "hydra_targets" && HYDRA_MODE === "target_count" && score >= gameTargetLimit) {
                            gameComplete();
                        } else {
                            // Spawn replacement
                            if (GAME_MODE === "hydra_targets") {
                                while (currentTargets.length < 3) {
                                    createTarget();
                                }
                            } else {
                                createTarget();
                            }
                        }
                    }
                } else {
                    streak = 0;
                    if (${SOUND_EFFECTS}) playMissSound();
                }
                
                updateStats();
            }
            
            function updateStats() {
                const accuracy = shots > 0 ? Math.round((score / shots) * 100) : 100;
                accuracyElement.textContent = accuracy;
                streakElement.textContent = streak;
            }
            
            function initializeGame() {
                if (GAME_MODE === "hydra_targets") {
                    for (let i = 0; i < 3; i++) {
                        setTimeout(() => createTarget(), i * 150);
                    }
                } else {
                    createTarget();
                }
            }
            
            function gameComplete() {
                const finalTime = Math.floor((Date.now() - gameStartTime) / 1000);
                const finalAccuracy = shots > 0 ? Math.round((score / shots) * 100) : 100;
                
                if (gameTimer) clearInterval(gameTimer);
                currentTargets.forEach(target => scene.remove(target));
                currentTargets = [];
                gameActive = false;
                
                controls.unlock();
                
                vscode.postMessage({ 
                    command: 'gameComplete', 
                    score: score, 
                    time: finalTime, 
                    accuracy: finalAccuracy, 
                    bestStreak: bestStreak,
                    gameMode: GAME_MODE
                });
            }
            
            // ===== GAME TIMER =====
            let gameTimer = null;
            if (gameTimeLimit > 0) {
                gameEndTime = gameStartTime + gameTimeLimit;
                gameTimer = setInterval(() => {
                    const remaining = Math.max(0, Math.ceil((gameEndTime - Date.now()) / 1000));
                    timerElement.textContent = remaining + 's';
                    if (remaining <= 0) {
                        gameComplete();
                    }
                }, 100);
            } else {
                setInterval(() => {
                    const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
                    timerElement.textContent = elapsed + 's';
                }, 100);
            }
            
            // ===== EVENT LISTENERS =====
            controls.addEventListener('lock', () => {
                instructionsElement.classList.add('hidden');
                gameActive = true;
                gameStartTime = Date.now();
                if (gameTimeLimit > 0) {
                    gameEndTime = gameStartTime + gameTimeLimit;
                }
                initializeGame();
                if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
            });
            
            controls.addEventListener('unlock', () => {
                if (gameActive) {
                    instructionsElement.classList.remove('hidden');
                    gameActive = false;
                }
            });
            
            renderer.domElement.addEventListener('click', () => {
                if (!controls.isLocked) {
                    controls.lock();
                } else if (gameActive) {
                    shoot();
                }
            });
            
            // ===== AMBIENT PARTICLES =====
            const ambientParticles = [];
            if (${ENABLE_EFFECTS}) {
                for (let i = 0; i < 30; i++) {
                    const particleGeo = new THREE.SphereGeometry(0.05, 4, 4);
                    const particleMat = new THREE.MeshBasicMaterial({
                        color: i % 2 === 0 ? 0x888899 : 0x666677,
                        transparent: true,
                        opacity: 0.3 + Math.random() * 0.3
                    });
                    const particle = new THREE.Mesh(particleGeo, particleMat);
                    particle.position.set(
                        (Math.random() - 0.5) * 60,
                        Math.random() * 25 + 2,
                        (Math.random() - 0.5) * 40 - 10
                    );
                    particle.userData = {
                        speed: 0.005 + Math.random() * 0.01,
                        originalY: particle.position.y,
                        phase: Math.random() * Math.PI * 2
                    };
                    scene.add(particle);
                    ambientParticles.push(particle);
                }
            }
            
            // ===== ANIMATION LOOP =====
            const clock = new THREE.Clock();
            
            function animate() {
                requestAnimationFrame(animate);
                
                const delta = clock.getDelta();
                const elapsed = clock.getElapsedTime();
                
                // Animate targets
                currentTargets.forEach(target => {
                    if (target.userData) {
                        // Pulse animation
                        const pulse = 1 + Math.sin(elapsed * 3 + target.userData.pulsePhase) * 0.08;
                        target.scale.setScalar(pulse);
                        
                        // Rotation
                        target.rotation.z += target.userData.rotationSpeed;
                        
                        // Movement
                        if (target.userData.moveSpeed && target.userData.moveDirection && target.userData.boardBounds) {
                            target.position.add(
                                target.userData.moveDirection.clone().multiplyScalar(target.userData.moveSpeed * delta)
                            );
                            
                            const bounds = target.userData.boardBounds;
                            if (target.position.x <= bounds.minX || target.position.x >= bounds.maxX) {
                                target.userData.moveDirection.x *= -1;
                            }
                            if (target.position.y <= bounds.minY || target.position.y >= bounds.maxY) {
                                target.userData.moveDirection.y *= -1;
                            }
                            
                            target.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, target.position.x));
                            target.position.y = Math.max(bounds.minY, Math.min(bounds.maxY, target.position.y));
                        }
                    }
                });
                
                // Animate ambient particles
                ambientParticles.forEach(particle => {
                    particle.position.y = particle.userData.originalY + Math.sin(elapsed + particle.userData.phase) * 1.5;
                    particle.position.x += Math.sin(elapsed * 0.5 + particle.userData.phase) * 0.01;
                });
                
                // Animate frame (subtle)
                mainFrame.children.forEach(bar => {
                    // Static frame, no animation needed
                });
                
                renderer.render(scene, camera);
            }
            
            // ===== RESIZE HANDLER =====
            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });
            
            animate();
            updateStats();
        </script>
    </html>
    `;
}
