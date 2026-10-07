// Инициализация Telegram Web App
if (window.Telegram?.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
}

// === Three.js сцена ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 20, 100);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 2, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.getElementById('gameContainer').appendChild(renderer.domElement);

// === Свет ===
const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.3);
directionalLight.position.set(15, 22, 12);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.left = -50;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.bottom = -50;
scene.add(directionalLight);

// === Мир ===
const world = new THREE.Group();
scene.add(world);

// Земля
const ground = new THREE.Mesh(
    new THREE.BoxGeometry(100, 2, 100),
    new THREE.MeshStandardMaterial({ color: 0x4caf50, roughness: 0.9 })
);
ground.position.y = -1;
ground.castShadow = true;
ground.receiveShadow = true;
world.add(ground);

const platforms = [];

function createPlatform(x, y, z, w = 6, h = 1, d = 6, color = 0x8d6e63) {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color, roughness: 0.8 })
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    world.add(mesh);
    platforms.push({ mesh, w, h, d });
}

// Путь из платформ
createPlatform(0, 1, 0, 6, 1, 6, 0x8d6e63);
createPlatform(-10, 3, -6, 7, 1, 7, 0x6d4c41);
createPlatform(12, 5, -8, 8, 1, 8, 0x5d4037);
createPlatform(16, 8, 6, 9, 1, 8, 0x7b5e57);
createPlatform(-16, 6, 12, 10, 1, 8, 0x795548);
createPlatform(0, 11, 22, 8, 1, 8, 0x6d4c41);
createPlatform(18, 9, -20, 7, 1, 7, 0x8d6e63);

// === Финиш ===
const finishGeom = new THREE.BoxGeometry(5, 0.5, 5);
const finishMat = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffaa00 });
const finish = new THREE.Mesh(finishGeom, finishMat);
finish.position.set(0, 12, 22);
finish.castShadow = true;
world.add(finish);

// === Игрок ===
const player = new THREE.Group();

const playerBody = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.6, 1.2, 6, 12),
    new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.6 })
);
playerBody.castShadow = true;
player.add(playerBody);

const playerHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 18, 18),
    new THREE.MeshStandardMaterial({ color: 0xf5d0a9 })
);
playerHead.position.y = 1.2;
playerHead.castShadow = true;
player.add(playerHead);

player.position.set(0, 2.5, 8);
scene.add(player);

// === Управление ===
const pointer = { yaw: 0, pitch: 0 };
const keys = {};
const playerState = {
    velocityY: 0,
    grounded: false,
    speed: 8,
    jumpForce: 9,
    gravity: 22
};

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === document.body) {
        pointer.yaw -= e.movementX * 0.0022;
        pointer.pitch -= e.movementY * 0.0018;
        pointer.pitch = Math.max(-1.3, Math.min(1.3, pointer.pitch));
    }
});

renderer.domElement.addEventListener('click', () => {
    document.body.requestPointerLock?.();
});

// === Функции движения ===
function updatePlayer(delta) {
    const forward = new THREE.Vector3(Math.sin(pointer.yaw), 0, Math.cos(pointer.yaw));
    const right = new THREE.Vector3(forward.z, 0, -forward.x);

    let moveX = 0;
    let moveZ = 0;

    if (keys.KeyW) moveZ += 1;
    if (keys.KeyS) moveZ -= 1;
    if (keys.KeyA) moveX -= 1;
    if (keys.KeyD) moveX += 1;

    if (moveX !== 0 || moveZ !== 0) {
        const direction = new THREE.Vector3();
        direction.addScaledVector(forward, moveZ);
        direction.addScaledVector(right, moveX);
        direction.normalize();

        const step = playerState.speed * delta;
        player.position.x += direction.x * step;
        player.position.z += direction.z * step;
    }

    // Прыжок
    if (keys.Space && playerState.grounded) {
        playerState.velocityY = playerState.jumpForce;
        playerState.grounded = false;
    }

    // Гравитация
    playerState.velocityY -= playerState.gravity * delta;
    player.position.y += playerState.velocityY * delta;

    // Проверка приземления
    playerState.grounded = false;
    const playerBottom = player.position.y - 1.5;

    for (const platform of platforms) {
        const halfH = platform.h / 2;
        const halfW = platform.w / 2;
        const halfD = platform.d / 2;
        const platformTop = platform.mesh.position.y + halfH;

        const dx = Math.abs(player.position.x - platform.mesh.position.x);
        const dz = Math.abs(player.position.z - platform.mesh.position.z);

        if (dx < halfW + 0.7 && dz < halfD + 0.7) {
            if (playerBottom <= platformTop + 0.2 && playerState.velocityY <= 0) {
                player.position.y = platformTop + 1.5;
                playerState.velocityY = 0;
                playerState.grounded = true;
                break;
            }
        }
    }

    // Проверка земли
    if (player.position.y <= 1.2) {
        player.position.y = 1.2;
        playerState.velocityY = 0;
        playerState.grounded = true;
    }

    // Ограничение мира
    player.position.x = THREE.MathUtils.clamp(player.position.x, -50, 50);
    player.position.z = THREE.MathUtils.clamp(player.position.z, -50, 50);

    // Падение в пустоту
    if (player.position.y < -20) {
        player.position.set(0, 2.5, 8);
        playerState.velocityY = 0;
    }

    // Проверка финиша
    const distToFinish = player.position.distanceTo(finish.position);
    if (distToFinish < 4) {
        alert('🎉 Вы прошли уровень!');
        player.position.set(0, 2.5, 8);
        playerState.velocityY = 0;
    }
}

function updateCamera() {
    camera.position.x = player.position.x - Math.sin(pointer.yaw) * 5;
    camera.position.y = player.position.y + 1.8 + Math.sin(pointer.pitch) * 2;
    camera.position.z = player.position.z - Math.cos(pointer.yaw) * 5;

    const lookTarget = new THREE.Vector3(
        player.position.x + Math.sin(pointer.yaw) * 10,
        player.position.y + 1.8 + Math.sin(pointer.pitch) * 3,
        player.position.z + Math.cos(pointer.yaw) * 10
    );

    camera.lookAt(lookTarget);
}

function updateUI() {
    const speed = Math.sqrt(
        (keys.KeyW || keys.KeyS ? 8 : 0) ** 2 +
        (keys.KeyA || keys.KeyD ? 8 : 0) ** 2
    );

    document.getElementById('posX').textContent = player.position.x.toFixed(1);
    document.getElementById('posY').textContent = player.position.y.toFixed(1);
    document.getElementById('posZ').textContent = player.position.z.toFixed(1);
    document.getElementById('speed').textContent = speed.toFixed(1);
    document.getElementById('grounded').textContent = playerState.grounded ? 'Да ✓' : 'Нет';
}

// === Главный loop ===
let lastTime = 0;
function animate(ts) {
    const delta = Math.min((ts - lastTime) / 1000, 0.033);
    lastTime = ts;

    updatePlayer(delta);
    updateCamera();
    updateUI();

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// Обработка resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Запуск
requestAnimationFrame(animate);