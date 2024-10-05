// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create stars 
function createStarField() {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const colors = [];
  
  // Generate random star positions
  for (let i = 0; i < 100000; i++) {
    const x = THREE.MathUtils.randFloatSpread(5000);
    const y = THREE.MathUtils.randFloatSpread(5000);
    const z = THREE.MathUtils.randFloatSpread(5000);

    vertices.push(x, y, z);

    const color = new THREE.Color(Math.random(), Math.random(), Math.random());
    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  // Basic star material with circle shape
  const starMaterial = new THREE.PointsMaterial({
    size: 2,  
    vertexColors: true,  
    sizeAttenuation: true,  
    map: createCircleTexture(),  
    transparent: true,
    alphaTest: 0.5
  });

  const stars = new THREE.Points(geometry, starMaterial);
  scene.add(stars);
}

// Function to create a circular texture 
function createCircleTexture() {
  const size = 64;  
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  
  const context = canvas.getContext('2d');
  
  context.beginPath();
  context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  context.fillStyle = 'white';
  context.fill();
  
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;  
  return texture;
}

function createPlanet() {
    const geometry = new THREE.SphereGeometry(14, 128, 128);
    const material = new THREE.MeshBasicMaterial({ color: 0x001420 });
    const planet = new THREE.Mesh(geometry, material);
    scene.add(planet);
    
    planet.position.set(0, 0, -30);
    return planet;
}

createStarField();
const planet = createPlanet();
camera.position.set(0, 0, 50);

let isMoving = {
    up: false,
    down: false,
    left: false,
    right: false
};

const moveSpeed = 0.2;
const zoomSpeed = 0.05;

// Smoothing factors for rotation
const rotationSpeed = 0.002; 
const smoothFactor = 0.1;   

let targetRotationX = camera.rotation.x;
let targetRotationY = camera.rotation.y;

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w':
            isMoving.up = true;
            break;
        case 's':
            isMoving.down = true;
            break;
        case 'a':
            isMoving.left = true;
            break;
        case 'd':
            isMoving.right = true;
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'w':
            isMoving.up = false;
            break;
        case 's':
            isMoving.down = false;
            break;
        case 'a':
            isMoving.left = false;
            break;
        case 'd':
            isMoving.right = false;
            break;
    }
});

// Mouse dragging camera rotation
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

document.addEventListener('mousedown', (e) => {
    isDragging = true;
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const deltaX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
        const deltaY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

        targetRotationY -= deltaX * rotationSpeed;
        targetRotationX -= deltaY * rotationSpeed;

        targetRotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotationX));
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

const scrollSpeed = 0.05;
let targetZoom = camera.position.z;  

document.addEventListener('wheel', (e) => {
    targetZoom += e.deltaY * scrollSpeed;

    // Clamp the target zoom to the desired range
    targetZoom = Math.max(5, Math.min(targetZoom, 100));
});

function animate() {
    requestAnimationFrame(animate);

    const zoomLerpFactor = 0.1; 
    camera.position.z += (targetZoom - camera.position.z) * zoomLerpFactor;

    camera.rotation.x += (targetRotationX - camera.rotation.x) * smoothFactor;
    camera.rotation.y += (targetRotationY - camera.rotation.y) * smoothFactor;

    if (isMoving.up) {
        camera.position.y += moveSpeed;
    }
    if (isMoving.down) {
        camera.position.y -= moveSpeed;
    }
    if (isMoving.left) {
        camera.position.x -= moveSpeed;
    }
    if (isMoving.right) {
        camera.position.x += moveSpeed;
    }

    renderer.render(scene, camera);
    checkMenuVisibility();
}

function checkMenuVisibility() {
    const menu = document.getElementById('menu');
    const zoom = document.getElementById('zoom');
    const title = document.getElementById('title');
    const distance = camera.position.distanceTo(planet.position);

    if (distance < 35.5) {
        menu.style.display = 'flex';
        zoom.style.display = 'none';
        title.style.display = 'none';
    } else {
        menu.style.display = 'none';
    }
}

animate();

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
