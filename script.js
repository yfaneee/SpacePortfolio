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
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('static/earth.png');

    const material = new THREE.MeshBasicMaterial({ map: texture });
    const planet = new THREE.Mesh(geometry, material);
    scene.add(planet);
    
    planet.position.set(0, 0, -30);
    return planet;
}

createStarField();
const planet = createPlanet();
camera.position.set(0, 0, 50);

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

document.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        // Adjust the camera position instead of rotation
        camera.position.x -= deltaX * 0.1; // Move left/right
        camera.position.y += deltaY * 0.1; // Move up/down
        
        // Update previous mouse position
        previousMousePosition = { x: e.clientX, y: e.clientY };
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

document.addEventListener('wheel', (e) => {
    // Zoom in/out based on the scroll direction
    camera.position.z += e.deltaY * 0.05; // Adjust zoom speed here
    // Limit zoom range to avoid going too close or too far
    camera.position.z = Math.max(5, Math.min(camera.position.z, 100)); // Prevent going too close or too far
});

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    
    checkMenuVisibility();
}

function checkMenuVisibility() { 
    const menu = document.getElementById('menu');
    const zoom = document.getElementById('zoom');
    const title = document.getElementById('title');
    const distance = camera.position.distanceTo(planet.position);
    
    if (distance < 35.5) { // Change this value as needed
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