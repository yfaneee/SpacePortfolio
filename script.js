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
  const velocities = [];
  
  // Generate random star positions
  for (let i = 0; i < 400000; i++) {
    const x = THREE.MathUtils.randFloatSpread(5000);
    const y = THREE.MathUtils.randFloatSpread(5000);
    const z = THREE.MathUtils.randFloatSpread(5000);

    vertices.push(x, y, z);

    velocities.push(
        THREE.MathUtils.randFloat(-0.1, 0.1), 
        THREE.MathUtils.randFloat(-0.1, 0.1), 
        THREE.MathUtils.randFloat(-0.1, 0.1)  
    );

    const color = new THREE.Color(Math.random(), Math.random(), Math.random());
    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));

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
  return stars;
}

let stars = createStarField();  

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

// Hover effect for constellations
const tooltip = document.createElement('div');
tooltip.style.position = 'absolute';
tooltip.style.padding = '5px';
tooltip.style.color = 'white';
tooltip.style.background = 'rgba(0, 0, 0, 0.7)';
tooltip.style.borderRadius = '3px';
tooltip.style.display = 'none';  
tooltip.style.pointerEvents = 'none'; 
document.body.appendChild(tooltip);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const starGroups = [];

// Create constellations for Learning Outcomes
function createLearningOutcomesConstellations() {
    const constellations = [
        { positions: [[190, 204, -60], [201, 211, -57], [210, 216, -58], [232, 223, -60]], name: 'Learning Outcome 1' },  
        { positions: [[250, 219, -62], [263, 224, -61], [242, 231, -61]], name: 'Learning Outcome 2' }, 
        { positions: [[270, 190, -59], [281, 181, -59], [252, 177, -64]], name: 'Learning Outcome 3' }, 
        { positions: [[290, 234, -63], [302, 242, -62], [285, 229, -57], [296, 245, -60]], name: 'Learning Outcome 4' }, 
        { positions: [[310, 203, -60], [322, 231, -60], [316, 221, -56]], name: 'Learning Outcome 5' },  
    ];

    constellations.forEach(group => {
        createStarGroup(group.positions, group.name);
    });
}

// Create constellations for Projects
function createProjectsConstellations() {
    const constellations = [
        { positions: [[-222, 225, -60], [-199, 217, -57], [-214, 210, -58]], name: 'Project 1' },  
        { positions: [[-250, 230, -62], [-263, 216, -60], [-275, 223, -60]], name: 'Project 2' }, 
        { positions: [[-286, 205, -69], [-291, 211, -62], [-300, 198, -63]], name: 'Project 3' },  
        { positions: [[-310, 239, -63], [-319, 245, -59], [-333, 230, -62]], name: 'Project 4' },   
    ];

    constellations.forEach(group => {
        createStarGroup(group.positions, group.name);
    });
}

// Create a group of stars
function createStarGroup(positions, name) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    positions.forEach(pos => {
        vertices.push(...pos);
    });

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 3 });
    const stars = new THREE.Points(geometry, starMaterial);

    scene.add(stars);
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(positions.map(pos => new THREE.Vector3(...pos)));
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1 });
    const line = new THREE.Line(lineGeometry, lineMaterial);

    scene.add(line);
    
    starGroups.push({ stars, line, name, starMaterial, lineMaterial });
}

document.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const objectsToCheck = starGroups.flatMap(group => [group.stars, group.line]);
    const intersects = raycaster.intersectObjects(objectsToCheck);

    if (intersects.length > 0) {
        const firstIntersectedObject = intersects[0].object;
        
        const hoveredGroup = starGroups.find(group => 
            group.stars === firstIntersectedObject || group.line === firstIntersectedObject
        );

        if (hoveredGroup) {
            console.log(`Hovered over: ${hoveredGroup.name}`); 
            tooltip.innerText = hoveredGroup.name;
            tooltip.style.display = 'block';  
            tooltip.style.left = `${event.clientX + 10}px`;
            tooltip.style.top = `${event.clientY + 10}px`;

            hoveredGroup.stars.material.color.set(0xff0000);  
            hoveredGroup.line.material.color.set(0xff0000);  
        }
    } else {
        tooltip.style.display = 'none';

        starGroups.forEach(group => {
            group.stars.material.color.set(0xffffff);  
            group.line.material.color.set(0xffffff);  
        });
    }
});
// Create constellations
createProjectsConstellations();

// Function to create the planet 
function createPlanet() {
    const geometry = new THREE.SphereGeometry(20, 164, 164);
    const material = new THREE.MeshBasicMaterial({ color: 0x3b8bad });
    const planet = new THREE.Mesh(geometry, material);
    scene.add(planet);
    
    planet.position.set(0, 0, -30);
    return planet;
}

createStarField();
const planet = createPlanet();
createLearningOutcomesConstellations();
createProjectsConstellations();
camera.position.set(0, 0, 50);

// Function for camera movement with W,A,S,D
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
    targetZoom = Math.max(5, Math.min(targetZoom, 150));
});

// Function to reset the camera 
const initialCameraPosition = new THREE.Vector3(0, 0, 50);
const initialCameraRotation = new THREE.Euler(0, 0, 0, 'XYZ');

camera.position.copy(initialCameraPosition);
camera.rotation.copy(initialCameraRotation);
const resetButton = document.getElementById('reset-camera');

function resetCamera() {
    camera.position.copy(initialCameraPosition);
    camera.rotation.copy(initialCameraRotation);
    targetZoom = initialCameraPosition.z; 
    targetRotationX = initialCameraRotation.x;
    targetRotationY = initialCameraRotation.y;
    resetButton.style.display = 'none'; 
    title.style.display = 'flex';
}

resetButton.addEventListener('click', resetCamera);

function checkCameraMovement() {
    const cameraMoved = !camera.position.equals(initialCameraPosition) || 
                        !camera.rotation.equals(initialCameraRotation);

    if (cameraMoved) {
        resetButton.style.display = 'block';
    } else {
        resetButton.style.display = 'none'; 
    }
}

const cameraZoomOutDistance = 200;
const zoomInDistance = 50;  
const zoomDuration = 1000; 
let isZoomingOut = false;
let zoomPhaseCompleted = false; 

const cameraTargets = {
    projects: new THREE.Vector3(-280, 220, 50), 
    learningOutcomes: new THREE.Vector3(266, 215, 50), 
    initial: new THREE.Vector3(0, 0, 50) 
};

let targetPosition = cameraTargets.initial;
let isMovingToTarget = false;

function moveCameraTo(target) {
    isZoomingOut = true;
    zoomPhaseCompleted = false;
    targetPosition.copy(target);
    isMovingToTarget = false; 
}

const menuProjects = document.querySelector('#menu a[href="#projects"]');
const menuLearningOutcomes = document.querySelector('#menu a[href="#learning-outcomes"]');

menuProjects.addEventListener('click', () => {
    moveCameraTo(cameraTargets.projects); 
});

menuLearningOutcomes.addEventListener('click', () => {
    moveCameraTo(cameraTargets.learningOutcomes); 
});

function isCameraNearTarget() {
    const distance = camera.position.distanceTo(targetPosition);
    return distance < 0.1; 
}

function animate() {
    requestAnimationFrame(animate);

    const positions = stars.geometry.attributes.position.array;
    const velocities = stars.geometry.attributes.velocity.array;

    for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i];    
        positions[i + 1] += velocities[i + 1]; 
        positions[i + 2] += velocities[i + 2]; 

        if (positions[i] > 2500) positions[i] = -2500;
        if (positions[i + 1] > 2500) positions[i + 1] = -2500;
        if (positions[i + 2] > 2500) positions[i + 2] = -2500;

        if (positions[i] < -2500) positions[i] = 2500;
        if (positions[i + 1] < -2500) positions[i + 1] = 2500;
        if (positions[i + 2] < -2500) positions[i + 2] = 2500;
    }

    stars.geometry.attributes.position.needsUpdate = true; 

    if (isZoomingOut && !zoomPhaseCompleted) {
        camera.position.z += (cameraZoomOutDistance - camera.position.z) * 0.03; 
        if (Math.abs(camera.position.z - cameraZoomOutDistance) < 0.1) {
            isZoomingOut = false;
            zoomPhaseCompleted = true;
            isMovingToTarget = true;
        }
    }

    if (isMovingToTarget && zoomPhaseCompleted) {
        camera.position.lerp(targetPosition, 0.1);  

        if (camera.position.distanceTo(targetPosition) < 20) {
            const zoomInFactor = 0.1;
            camera.position.z += (zoomInDistance - camera.position.z) * zoomInFactor;
        }

        if (isCameraNearTarget()) {
            isMovingToTarget = false;  
            zoomPhaseCompleted = false;
        }
    }

    if (!isMovingToTarget && !isZoomingOut) {
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
    }

    renderer.render(scene, camera);
    checkCameraMovement();
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
