// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Function to show/hide overlay and dropdown menu
const menuIcon = document.getElementById('menu-icon');
const overlay = document.getElementById('overlay');
const dropdownMenu = document.getElementById('dropdown-menu');

function toggleMenu() {
    overlay.classList.toggle('visible');
    dropdownMenu.classList.toggle('visible');

    if (dropdownMenu.classList.contains('visible')) {
        dropdownMenu.style.display = 'block';
        overlay.style.display = 'block';
        setTimeout(() => {
            dropdownMenu.style.opacity = '1';    
            dropdownMenu.style.transform = 'translateY(0)'; 
            overlay.style.opacity = '1';        
        }, 0);
        menuIcon.classList.add('menu-open');
    } else {
        dropdownMenu.style.opacity = '0';      
        dropdownMenu.style.transform = 'translateY(-20px)'; 
        overlay.style.opacity = '0';            
        setTimeout(() => {
            dropdownMenu.style.display = 'none';
            overlay.style.display = 'none';
        }, 300); 
        menuIcon.classList.remove('menu-open');
    }
}

menuIcon.addEventListener('click', toggleMenu);

function closeMenu() {
    overlay.classList.remove('visible');
    dropdownMenu.classList.remove('visible');
    dropdownMenu.style.display = 'none';
    overlay.style.opacity = '0';
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300);
}

// control the modal appearance
document.addEventListener("DOMContentLoaded", () => {
    const welcomeModal = document.getElementById("welcome-modal");
    const closeModalButton = document.getElementById("close-modal");

    setTimeout(() => {
        welcomeModal.classList.add("show");
    }, 400); 

    closeModalButton.addEventListener("click", () => {
        welcomeModal.classList.remove("show");
    });
});

// Toggle info dropdown visibility
const infoButton = document.getElementById('info-button');
const infoDropdown = document.getElementById('info-dropdown');

infoButton.addEventListener('click', () => {
    infoDropdown.classList.toggle('visible');
});

// Close the dropdown if clicked outside
document.addEventListener('click', (event) => {
    if (!infoButton.contains(event.target) && !infoDropdown.contains(event.target)) {
        infoDropdown.classList.remove('visible');
    }
});

// Link menu items to camera movements
const homeMenuItem = document.getElementById('home');
const learningOutcomesMenuItem = document.getElementById('learning-outcomes');
const submenuItems = document.querySelectorAll('.submenu li');
const projectsMenuItem = document.getElementById('projects');
homeMenuItem.addEventListener('click', () => {
    closeMenu();
    moveCameraTo(cameraTargets.home); 
    menuIcon.classList.remove('menu-open');
});

learningOutcomesMenuItem.addEventListener('click', () => {
    closeMenu();
    moveCameraTo(cameraTargets.learningOutcomes);
    menuIcon.classList.remove('menu-open');  
});

projectsMenuItem.addEventListener('click', () => {
    closeMenu();
    moveCameraTo(cameraTargets.projects);  
    menuIcon.classList.remove('menu-open');
});

document.addEventListener('click', (event) => {
    if (!dropdownMenu.contains(event.target) && !menuIcon.contains(event.target)) {
        closeMenu();  
        menuIcon.classList.remove('menu-open');
    }
});

const outcomeTargets = {
    outcome1: new THREE.Vector3(190, 204, -60),
    outcome2: new THREE.Vector3(250, 219, -57),
    outcome3: new THREE.Vector3(270, 190, -59),
    outcome4: new THREE.Vector3(290, 234, -58),
    outcome5: new THREE.Vector3(310, 203, -60)
};

// Go to a specific constellation
function moveAndZoomToConstellation(targetPosition, onComplete) {
    const zoomOutTargetZ = 200;
    const moveSpeed = 0.1; 
    const zoomOutSpeed = 0.2;  
    const positionThreshold = 5; 

    let phase = "zoomOut";
    let frameCounter = 0; 

    function animate() {
        const distanceToTarget = camera.position.distanceTo(targetPosition);

        if (phase === "zoomOut") {
            frameCounter++;
            camera.position.z += (zoomOutTargetZ - camera.position.z) * zoomOutSpeed;

            if (Math.abs(camera.position.z - zoomOutTargetZ) < 0.1 || frameCounter > 50) {
                camera.position.z = zoomOutTargetZ; 
                frameCounter = 0;
                phase = "moveToTarget";
                console.log("Completed Zoom Out. Moving to target.");
            }

        } else if (phase === "moveToTarget") {
            frameCounter++;

            camera.position.x += (targetPosition.x - camera.position.x) * moveSpeed;
            camera.position.y += (targetPosition.y - camera.position.y) * moveSpeed;

            if (Math.abs(camera.position.x - targetPosition.x) < positionThreshold &&
                Math.abs(camera.position.y - targetPosition.y) < positionThreshold) {
                camera.position.x = targetPosition.x;
                camera.position.y = targetPosition.y;
                console.log("Reached target position. Animation complete.");
                if (onComplete) onComplete();
                return;
            }
        }

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    animate();
}

// Adding this to submenu items
submenuItems.forEach((item) => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        closeMenu();
        menuIcon.classList.remove('menu-open');


        const targetPosition = outcomeTargets[item.id];
        if (targetPosition) {
            moveAndZoomToConstellation(targetPosition, () => {
                console.log(`Reached ${item.id}`);
            });
        }
    });
});

// Create stars 
function createStarField() {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const colors = [];
  const velocities = [];
  
  // Generate random star positions
  for (let i = 0; i < 100000; i++) {
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
        { positions: [[190, 204, -60], [201, 211, -57], [210, 216, -58], [232, 223, -60]], name: 'Learning outcome 1: Interactive Media Products', id: 'learningOutcome1' },
        { positions: [[250, 219, -57], [263, 224, -59], [242, 231, -60]], name: 'Learning outcome 2: Development and Version control', id: 'learningOutcome2' },
        { positions: [[270, 190, -59], [281, 181, -59], [252, 177, -56]], name: 'Learning outcome 3: Iterative design', id: 'learningOutcome3' },
        { positions: [[290, 234, -58], [302, 242, -59], [277, 240, -57], [312, 251, -60]], name: 'Learning outcome 4: Professional standard', id: 'learningOutcome4' },
        { positions: [[310, 203, -60], [322, 231, -60], [326, 221, -56]], name: 'Learning outcome 5: Personal Leadership', id: 'learningOutcome5' }
    ];

    constellations.forEach(group => {
        createStarGroup(group.positions, group.name, group.id);
    });
}

// Create constellations for Projects
function createProjectsConstellations() {
    const constellations = [
        { positions: [[-222, 225, -60], [-199, 217, -57], [-214, 210, -58]], name: 'Veneman en de Groot - Branding Project', id: 'project1' },
        { positions: [[-250, 230, -60], [-263, 216, -58], [-275, 223, -60]], name: 'Project 2', id: 'project2' },
        { positions: [[-286, 205, -59], [-310, 211, -60], [-300, 198, -55]], name: 'Project 3', id: 'project3' },
        { positions: [[-310, 239, -60], [-319, 245, -59], [-333, 230, -57]], name: 'Project 4', id: 'project4' }  
    ];

    constellations.forEach(group => {
        createStarGroup(group.positions, group.name, group.id);
    });
}

// Create a group of stars
function createStarGroup(positions, name, id) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    positions.forEach(pos => {
        vertices.push(...pos);
    });

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 4 });
    const stars = new THREE.Points(geometry, starMaterial);

    scene.add(stars);
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(positions.map(pos => new THREE.Vector3(...pos)));
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1 });
    const line = new THREE.Line(lineGeometry, lineMaterial);

    scene.add(line);
    starGroups.push({ stars, line, name, starMaterial, lineMaterial, id });
}

function smoothZoomTo(targetPosition, onComplete) {
    const zoomSpeed = 0.02; 
    const finalZoomDistance = 10; 

    function animateZoom() {
        const distanceToTarget = camera.position.distanceTo(targetPosition);
        
        camera.position.lerp(targetPosition, zoomSpeed);

        camera.position.z -= zoomSpeed * 301;
        camera.rotation.z += 0.001;
        if (distanceToTarget < finalZoomDistance || camera.position.z <= targetPosition.z) {
            camera.position.copy(targetPosition); 
            if (onComplete) onComplete(); 
            
        } else {
            renderer.render(scene, camera);
            requestAnimationFrame(animateZoom);
        }
    }
    
    animateZoom();
}

document.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(starGroups.map(group => group.stars));

    if (intersects.length > 0) {
        const clickedGroup = starGroups.find(group => group.stars === intersects[0].object);
        const targetPosition = intersects[0].point;

        smoothZoomTo(targetPosition, () => loadDocumentationHTML(clickedGroup.id));
    }
});

function loadDocumentationHTML(id) {
    const documentationElement = document.getElementById('documentation');
    menuIcon.style.display = 'none';

    fetch(`docs/${id}.html`)
        .then(response => response.text())
        .then(htmlContent => {
            documentationElement.innerHTML = `
            <div style="display: flex; justify-content: flex-end; padding: 10px;">
                <div class="close-icon" onclick="closeDocumentation()">X</div>
            </div>
            <div style="padding: 20px; margin: 10px;">
                ${htmlContent}
            </div>`;
            documentationElement.style.display = 'block';
        })
        .catch(error => {
            console.error('Error loading documentation:', error);
            documentationElement.innerHTML = '<p>Error loading content.</p>';
            documentationElement.style.display = 'block';
        });
}

function closeDocumentation() {
    document.getElementById('documentation').style.display = 'none';
    menuIcon.style.display = 'block';

}

document.body.insertAdjacentHTML('beforeend', `
    <div id="documentation" style="display:none; position:absolute; top:0; right:0; width:100%; height:100%; background-color:rgba(0,0,0,0.8); color:black; padding:20px; overflow-y:auto; -ms-overflow-style: none; scrollbar-width: none;">
        <!-- Content will be loaded dynamically -->
    </div>
`);

// hover lo's/projects
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

            hoveredGroup.stars.material.color.set(0x660033);  
            hoveredGroup.line.material.color.set(0x272757);  
        }
    } else {
        tooltip.style.display = 'none';

        starGroups.forEach(group => {
            group.stars.material.color.set(0xffffff);  
            group.line.material.color.set(0xffffff);  
        });
    }
});

// Function to create the planet 
function createPlanet() {
    const textureLoader = new THREE.TextureLoader();
    const planetTexture = textureLoader.load('static/planettext.jpg'); 

    const geometry = new THREE.SphereGeometry(20, 164, 164);
    const material = new THREE.MeshStandardMaterial({
        map: planetTexture
    });
    
    const planet = new THREE.Mesh(geometry, material);

    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(50, 50, 50);
    scene.add(light);

    planet.position.set(0, 0, -30);
    scene.add(planet);
    
    return planet;
}

function createOrbitingPlanet() {
    const textureLoader = new THREE.TextureLoader();
    const orbitingPlanetTexture = textureLoader.load('static/planet.jpg'); 

    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        map: orbitingPlanetTexture,
        roughness: 1,    
        metalness: 0     
    });

    const orbitingPlanet = new THREE.Mesh(geometry, material);

    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(10, 10, 10);
    scene.add(light);

    scene.add(orbitingPlanet);

    return orbitingPlanet;
}

createStarField();
const orbitingPlanet = createOrbitingPlanet();
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

const moveSpeed = 0.7;
const zoomSpeed = 0.05;

// Smoothing factors for rotation
const rotationSpeed = 0.002; 
const smoothFactor = 0.1;   

let targetRotationX = camera.rotation.x;
let targetRotationY = camera.rotation.y;

// WASD input
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

// Scroll function
const scrollSpeed = 0.07;
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

// Function for navigation through learning outcomes and projects
const cameraZoomOutDistance = 200;
const zoomInDistance = 50;  
const zoomDuration = 1000; 
let isZoomingOut = false;
let zoomPhaseCompleted = false; 

const cameraTargets = {
    projects: new THREE.Vector3(-280, 220, 50), 
    learningOutcomes: new THREE.Vector3(266, 215, 50),
    home: new THREE.Vector3(0, 0, 50), 
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

let orbitRadius = 50;  
let orbitSpeed = 0.02; 
let orbitTime = Math.random() * Math.PI * 2;

// Function for animating orbiting planet
function animateOrbitingPlanet() {
    orbitTime += orbitSpeed;  

    const x = orbitRadius * Math.sin(orbitTime);  
    const y = orbitRadius * Math.sin(orbitTime * 0.5);  
    const z = orbitRadius * Math.cos(orbitTime);

    orbitingPlanet.position.set(planet.position.x + x, planet.position.y + y, planet.position.z + z);
}

// Function for animations
function animate() {
    requestAnimationFrame(animate);
    animateOrbitingPlanet();

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

    // Condition for navigation with zooming in and out
    if (isZoomingOut && !zoomPhaseCompleted) {
        camera.position.z += (cameraZoomOutDistance - camera.position.z) * 0.07; 
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

// Function for menu on planet zoom
function checkMenuVisibility() {
    const menu = document.getElementById('menu');
    const distance = camera.position.distanceTo(planet.position);

    if (distance < 35.5) {
        menu.style.display = 'flex';
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
