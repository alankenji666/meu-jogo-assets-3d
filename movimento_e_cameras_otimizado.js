// input-manager.js

// As dependências do módulo serão injetadas através da função init.
let State;
let World;
let Player;
let UIElements;

/**
 * InputManager lida com todos os inputs do usuário, incluindo teclado, mouse e joystick virtual,
 * para controlar o movimento do jogador e a câmera.
 */
const InputManager = {
    /**
     * Inicializa o InputManager e configura todos os event listeners.
     * @param {object} stateRef - A referência para o objeto de estado global.
     * @param {object} worldRef - A referência para o módulo World.
     * @param {object} playerRef - A referência para o módulo Player.
     * @param {object} uiElementsRef - A referência para os elementos da UI cacheados.
     */
    init(stateRef, worldRef, playerRef, uiElementsRef) {
        State = stateRef;
        World = worldRef;
        Player = playerRef;
        UIElements = uiElementsRef;

        this.setupEventListeners();
    },

    /**
     * Configura todos os event listeners para os controles.
     */
    setupEventListeners() {
        const gameCanvas = UIElements.gameCanvas;

        // Listeners do Teclado
        window.addEventListener('keydown', this.onKeyDown.bind(this), false);
        window.addEventListener('keyup', this.onKeyUp.bind(this), false);

        // Listeners do Mouse para a Câmera
        gameCanvas?.addEventListener('mousedown', this.onMouseDown.bind(this), false);
        gameCanvas?.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        document.addEventListener('mouseup', this.onMouseUp.bind(this), false);

        // Listeners de Toque para a Câmera
        gameCanvas?.addEventListener('touchstart', this.onCameraTouchStart.bind(this), { passive: false });
        gameCanvas?.addEventListener('touchmove', this.onCameraTouchMove.bind(this), { passive: false });
        gameCanvas?.addEventListener('touchend', this.onCameraTouchEnd.bind(this), { passive: false });

        // Listeners de Toque para o Joystick
        UIElements.joystickContainer?.addEventListener('touchstart', this.onJoystickTouchStart.bind(this), { passive: false });
        UIElements.joystickContainer?.addEventListener('touchmove', this.onJoystickTouchMove.bind(this), { passive: false });
        UIElements.joystickContainer?.addEventListener('touchend', this.onJoystickTouchEnd.bind(this), { passive: false });
    },

    // --- Handlers de Teclado ---
    onKeyDown(e) {
        if (e.target.tagName === 'INPUT') return;
        if (e.key >= '1' && e.key <= '4') {
            Player.selectHotbarSlot(parseInt(e.key) - 1);
            return;
        }
        State.input.keysPressed[e.key.toLowerCase()] = true;
        this.updateMoveFromKeys();
    },

    onKeyUp(e) {
        State.input.keysPressed[e.key.toLowerCase()] = false;
        this.updateMoveFromKeys();
    },

    updateMoveFromKeys() {
        const keys = State.input.keysPressed;
        State.input.playerMove.forward = (keys['w'] || keys['arrowup']) ? 1 : (keys['s'] || keys['arrowdown']) ? -1 : 0;
        State.input.playerMove.right = (keys['d'] || keys['arrowright']) ? 1 : (keys['a'] || keys['arrowleft']) ? -1 : 0;
    },

    // --- Handlers de Câmera (Mouse e Toque) ---
    onCameraTouchStart(e) {
        if (e.touches.length === 1 && !e.target.closest('#joystickContainer, .ui-main-button, .ui-panel')) {
            State.input.isDraggingCamera = true;
            State.input.lastCameraTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    },

    onCameraTouchMove(e) {
        if (State.input.isDraggingCamera && e.touches.length === 1) {
            this.handleCameraDrag(e.touches[0].clientX, e.touches[0].clientY);
            e.preventDefault();
        }
    },

    onCameraTouchEnd() {
        State.input.isDraggingCamera = false;
    },

    onMouseDown(e) {
        if (e.button === 0 && !e.target.closest('#joystickContainer, .ui-main-button, .ui-panel')) {
            State.input.isDraggingCamera = true;
            State.input.lastCameraTouch = { x: e.clientX, y: e.clientY };
        }
    },

    onMouseMove(e) {
        if (State.input.isDraggingCamera) {
            this.handleCameraDrag(e.clientX, e.clientY);
        }
    },

    onMouseUp(e) {
        if (e.button === 0) {
            State.input.isDraggingCamera = false;
        }
    },

    handleCameraDrag(currentX, currentY) {
        const deltaX = currentX - State.input.lastCameraTouch.x;
        const deltaY = currentY - State.input.lastCameraTouch.y;
        State.camera.angleX -= deltaX * 0.005;
        State.camera.angleY -= deltaY * 0.005;
        State.camera.angleY = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, State.camera.angleY));
        State.input.lastCameraTouch = { x: currentX, y: currentY };
    },

    // --- Handlers do Joystick ---
    onJoystickTouchStart(e) {
        e.preventDefault();
        State.input.isJoystickActive = true;
        // Centraliza o joystick no ponto do toque para uma melhor experiência
        const rect = UIElements.joystickContainer.getBoundingClientRect();
        State.input.joystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        this.onJoystickTouchMove(e); // Processa o movimento inicial
    },

    onJoystickTouchMove(e) {
        e.preventDefault();
        if (!State.input.isJoystickActive) return;

        const touch = e.touches[0];
        let dx = touch.clientX - State.input.joystickCenter.x;
        let dy = touch.clientY - State.input.joystickCenter.y;

        const distance = Math.hypot(dx, dy);
        const maxDistance = UIElements.joystickBase.offsetWidth / 3; // Limita o movimento do knob

        if (distance > maxDistance) {
            dx = (dx / distance) * maxDistance;
            dy = (dy / distance) * maxDistance;
        }

        UIElements.joystickKnob.style.transform = `translate(${dx}px, ${dy}px)`;

        // Normaliza o output para -1 a 1
        State.input.playerMove.right = dx / maxDistance;
        State.input.playerMove.forward = -dy / maxDistance; // Y é invertido
    },

    onJoystickTouchEnd(e) {
        e.preventDefault();
        State.input.isJoystickActive = false;
        UIElements.joystickKnob.style.transform = `translate(0px, 0px)`;
        State.input.playerMove.forward = 0;
        State.input.playerMove.right = 0;
    }
};

export { InputManager };
