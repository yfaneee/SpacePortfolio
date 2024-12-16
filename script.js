const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 50);

console.log('EXRLoader: ', THREE.EXRLoader); 

const exrLoader = new THREE.EXRLoader();
exrLoader.load('static/background.exr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;  
});

const clock = new THREE.Clock();
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

    let scrollTimeout;
    let hasScrolled = false;

    window.addEventListener('wheel', () => {
        if (!hasScrolled) {
            hasScrolled = true;
            scrollTimeout = setTimeout(() => {
                const zoomHint = document.getElementById('zoom-hint');
                if (zoomHint) {
                    zoomHint.remove();
                }
            }, 1000); 
        }
    });

    setTimeout(() => {
        welcomeModal.classList.add("show");
    }, 400); 

    closeModalButton.addEventListener("click", () => {
        welcomeModal.classList.remove("show");
    });

    setTimeout(() => {
        const zoomHint = document.getElementById('zoom-hint');
        if (zoomHint && !hasScrolled) {
            zoomHint.remove();
        }
    }, 30000);
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
const artworkMenuItem = document.getElementById('artwork');
const contactMenuItem = document.getElementById('contact');
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

artworkMenuItem.addEventListener('click', () => {
    closeMenu();
    moveCameraTo(cameraTargets.artwork);
    menuIcon.classList.remove('menu-open');  
});

contactMenuItem.addEventListener('click', () => {
    closeMenu();
    moveCameraTo(cameraTargets.contact);
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
    outcome2: new THREE.Vector3(258, 224, -57),
    outcome3: new THREE.Vector3(310, 175, -59),
    outcome4: new THREE.Vector3(300, 243, -58),
    outcome5: new THREE.Vector3(355, 223, -60)
};

// Go to a specific constellation
function moveAndZoomToConstellation(targetPosition, onComplete) {
    const zoomOutTargetZ = 200;
    const moveSpeed = 0.02; 
    const zoomOutSpeed = 0.05;  
    const positionThreshold = 5;
    const documentationDelay = 2000;

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
                
                if (onComplete) {
                    setTimeout(() => {
                        onComplete();
                    }, documentationDelay);
                }
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
            smoothZoomTo(targetPosition, () => {
                const documentId = item.id.replace('outcome', 'learningoutcome');
                console.log(`Smoothly zoomed to ${documentId}`);
                loadDocumentationHTML(documentId);
            });
        }
    });
});

// Create stars 
function createStarField() {
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    const starColors = [];
    const velocities = [];
    
    const numStars = 10000;
    const galaxyRadius = 1500;
    const zOffset = -800; 

    for (let i = 0; i < numStars; i++) {
        const radius = Math.pow(Math.random(), 2) * galaxyRadius;
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos((Math.random() * 2) - 1);

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi) + zOffset; 

        starVertices.push(x, y, z);

        velocities.push(
            THREE.MathUtils.randFloat(-0.1, 0.1), 
            THREE.MathUtils.randFloat(-0.1, 0.1), 
            THREE.MathUtils.randFloat(-0.1, 0.1)
        );

        const color = new THREE.Color();
        if (radius < galaxyRadius * 0.3) {
            color.setHSL(0.6, 0.7, 0.8);
        } else if (radius < galaxyRadius * 0.6) {
            color.setHSL(0.7, 0.5, 0.6); 
        } else {
            color.setHSL(0.0, 0.0, 0.8); 
        }

        starColors.push(color.r, color.g, color.b);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    starGeometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));

    const starMaterial = new THREE.PointsMaterial({
        size: 1.5,  
        vertexColors: true,  
        sizeAttenuation: true,
        map: createCircleTexture(),
        transparent: true,
        alphaTest: 0.5
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    return stars;
}

// Create stars
let stars = createStarField();  

function createStarFieldWithOffsets() {
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    const starColors = [];
    const velocities = [];
    
    const numStars = 10000;
    const galaxyRadius = 1500;
    const xOffset = 500;  
    const yOffset = -300; 

    for (let i = 0; i < numStars; i++) {
        const radius = Math.pow(Math.random(), 2) * galaxyRadius;
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos((Math.random() * 2) - 1);

        const x = radius * Math.sin(phi) * Math.cos(theta) + xOffset; 
        const y = radius * Math.sin(phi) * Math.sin(theta) + yOffset;
        const z = radius * Math.cos(phi); 

        starVertices.push(x, y, z);

        velocities.push(
            THREE.MathUtils.randFloat(-0.1, 0.1), 
            THREE.MathUtils.randFloat(-0.1, 0.1), 
            THREE.MathUtils.randFloat(-0.1, 0.1)
        );

        const color = new THREE.Color();
        if (radius < galaxyRadius * 0.3) {
            color.setHSL(0.6, 0.7, 0.8);
        } else if (radius < galaxyRadius * 0.6) {
            color.setHSL(0.7, 0.5, 0.6);
        } else {
            color.setHSL(0.0, 0.0, 0.8); 
        }

        starColors.push(color.r, color.g, color.b);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    starGeometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));

    const starMaterial = new THREE.PointsMaterial({
        size: 1.5,  
        vertexColors: true,  
        sizeAttenuation: true,
        map: createCircleTexture(),
        transparent: true,
        alphaTest: 0.5
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    return stars;
}

createStarFieldWithOffsets();

// Create stars
function createStarFieldWithOffsetsSecond() {
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    const starColors = [];
    const velocities = [];
    
    const numStars = 10000;
    const galaxyRadius = 1500;
    const xOffset = -300;  
    const yOffset = 700; 

    for (let i = 0; i < numStars; i++) {
        const radius = Math.pow(Math.random(), 2) * galaxyRadius;
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos((Math.random() * 2) - 1);

        const x = radius * Math.sin(phi) * Math.cos(theta) + xOffset; 
        const y = radius * Math.sin(phi) * Math.sin(theta) + yOffset;
        const z = radius * Math.cos(phi); 

        starVertices.push(x, y, z);

        velocities.push(
            THREE.MathUtils.randFloat(-0.1, 0.1), 
            THREE.MathUtils.randFloat(-0.1, 0.1), 
            THREE.MathUtils.randFloat(-0.1, 0.1)
        );

        const color = new THREE.Color();
        if (radius < galaxyRadius * 0.3) {
            color.setHSL(0.6, 0.7, 0.8);
        } else if (radius < galaxyRadius * 0.6) {
            color.setHSL(0.7, 0.5, 0.6);
        } else {
            color.setHSL(0.0, 0.0, 0.8); 
        }

        starColors.push(color.r, color.g, color.b);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    starGeometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));

    const starMaterial = new THREE.PointsMaterial({
        size: 1.5,  
        vertexColors: true,  
        sizeAttenuation: true,
        map: createCircleTexture(),
        transparent: true,
        alphaTest: 0.5
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    return stars;
}

// Create stars
createStarFieldWithOffsetsSecond();

function createStarFieldWithCustomOffsets() {
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    const starColors = [];
    const velocities = [];
    
    const numStars = 10000;
    const galaxyRadius = 1500;
    const xOffset = -100;  
    const yOffset = 100;
    const zOffset = 300;

    for (let i = 0; i < numStars; i++) {
        const radius = Math.pow(Math.random(), 2) * galaxyRadius;
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos((Math.random() * 2) - 1);

        const x = radius * Math.sin(phi) * Math.cos(theta) + xOffset; 
        const y = radius * Math.sin(phi) * Math.sin(theta) + yOffset;
        const z = radius * Math.cos(phi) + zOffset;

        starVertices.push(x, y, z);

        velocities.push(
            THREE.MathUtils.randFloat(-0.1, 0.1), 
            THREE.MathUtils.randFloat(-0.1, 0.1), 
            THREE.MathUtils.randFloat(-0.1, 0.1)
        );

        const color = new THREE.Color();
        if (radius < galaxyRadius * 0.3) {
            color.setHSL(0.6, 0.7, 0.8);
        } else if (radius < galaxyRadius * 0.6) {
            color.setHSL(0.7, 0.5, 0.6);
        } else {
            color.setHSL(0.0, 0.0, 0.8); 
        }

        starColors.push(color.r, color.g, color.b);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    starGeometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));

    const starMaterial = new THREE.PointsMaterial({
        size: 1.5,  
        vertexColors: true,  
        sizeAttenuation: true,
        map: createCircleTexture(),
        transparent: true,
        alphaTest: 0.5
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    return stars;
}

createStarFieldWithCustomOffsets();

// Create stars
function createStarFieldWithCustomOffsetsSecond() {
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    const starColors = [];
    const velocities = [];
    
    const numStars = 10000;
    const galaxyRadius = 1500;
    const xOffset = 700;  
    const yOffset = 600;
    const zOffset = -400;

    for (let i = 0; i < numStars; i++) {
        const radius = Math.pow(Math.random(), 2) * galaxyRadius;
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos((Math.random() * 2) - 1);

        const x = radius * Math.sin(phi) * Math.cos(theta) + xOffset; 
        const y = radius * Math.sin(phi) * Math.sin(theta) + yOffset;
        const z = radius * Math.cos(phi) + zOffset;

        starVertices.push(x, y, z);

        velocities.push(
            THREE.MathUtils.randFloat(-0.1, 0.1), 
            THREE.MathUtils.randFloat(-0.1, 0.1), 
            THREE.MathUtils.randFloat(-0.1, 0.1)
        );

        const color = new THREE.Color();
        if (radius < galaxyRadius * 0.3) {
            color.setHSL(0.6, 0.7, 0.8);
        } else if (radius < galaxyRadius * 0.6) {
            color.setHSL(0.7, 0.5, 0.6);
        } else {
            color.setHSL(0.0, 0.0, 0.8); 
        }

        starColors.push(color.r, color.g, color.b);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    starGeometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));

    const starMaterial = new THREE.PointsMaterial({
        size: 1.5,  
        vertexColors: true,  
        sizeAttenuation: true,
        map: createCircleTexture(),
        transparent: true,
        alphaTest: 0.5
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    return stars;
}

createStarFieldWithCustomOffsetsSecond();

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
        { positions: [[238, 153, -57], [230, 188, -60], [180, 204, -60], [191, 211, -57], [200, 216, -58], [222, 223, -60]], name: 'Learning outcome 1: Interactive Media Products', id: 'learningOutcome1' },
        { positions: [[270, 219, -57], [283, 224, -59], [262, 231, -60]], name: 'Learning outcome 2: Development and Version control', id: 'learningOutcome2' },
        { positions: [[300, 180, -59], [311, 171, -59], [332, 151, -59], [282, 167, -56]], name: 'Learning outcome 3: Iterative design', id: 'learningOutcome3' },
        { positions: [[310, 234, -58], [322, 242, -59], [297, 240, -57], [352, 265, -60], [376, 244, -58]], name: 'Learning outcome 4: Professional standard', id: 'learningOutcome4' },
        { positions: [[350, 203, -60], [362, 231, -60], [366, 221, -56]], name: 'Learning outcome 5: Personal Leadership', id: 'learningOutcome5' },
    ];

    constellations.forEach(group => {
        createStarGroup(group.positions, group.name, group.id);
    });
}

// Create constellations for Projects
function createProjectsConstellations() {
    const constellations = [
        { positions: [[-402, 275, -60], [-219, 255, -57], [-234, 220, -58], [-205, 197, -58]], name: 'Veneman en de Groot - Branding Project', id: 'project1' },
        { positions: [[-270, 230, -60], [-283, 216, -58], [-295, 223, -60]], name: 'Hike One - Media Campaign', id: 'project2' },
        { positions: [[-316, 195, -59], [-340, 201, -60], [-330, 138, -55], [-290, 158, -55]], name: 'CZ - Development Project', id: 'project3' },
        { positions: [[-330, 239, -60], [-329, 245, -59], [-353, 230, -57]], name: 'Project 4', id: 'project4' }  
    ];

    constellations.forEach(group => {
        createStarGroup(group.positions, group.name, group.id);
    });
}

// Create constellations for Artwork
function createArtworkConstellations() {
    const constellations = [
        { positions: [[ 22, 425, -60], [ 9, 417, -57], [ 14, 410, -58]], name: 'Artwork 1', id: 'artwork1' },
        { positions: [[ 50, 430, -60], [ 63, 416, -58], [ 75, 401, -60]], name: 'Artwork 2', id: 'artwork1' },
        { positions: [[ 96, 435, -59], [ -30, 491, -60], [ 10, 378, -55], [ 38, 399, -57], [ 55, 367, -59]], name: 'Artwork 3', id: 'artwork1' },
        { positions: [[ 10, 439, -60], [ 19, 445, -59], [ 33, 430, -57]], name: 'Artwork 4', id: 'artwork1' }  
    ];

    constellations.forEach(group => {
        createStarGroup(group.positions, group.name, group.id);
    });
}

// Create constellation for Contact
function createContactConstellation() {
    const constellations = [
        { positions: [[ 84, -325, -59], [ 46, -280, -59], [ -30, -361, -60], [ 10, -378, -55], [ 42, -425, -57], [ 55, -367, -59]], name: 'Contact', id: 'contact' }
    ];

    constellations.forEach(group => {
        createStarGroup(group.positions, group.name, group.id);
    });
}

// Create a group of stars
function createStarGroup(positions, name, id) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const hitboxes = [];

    positions.forEach(pos => {
        vertices.push(...pos);
        const hitboxGeometry = new THREE.SphereGeometry(10, 16, 16); 
        const hitboxMaterial = new THREE.MeshBasicMaterial({
            visible: false, 
        });
        const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
        hitbox.position.set(...pos);
        scene.add(hitbox);
        hitboxes.push(hitbox);
    });

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 7 });
    const stars = new THREE.Points(geometry, starMaterial);

    scene.add(stars);
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(positions.map(pos => new THREE.Vector3(...pos)));
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3 });
    const line = new THREE.Line(lineGeometry, lineMaterial);

    scene.add(line);
    starGroups.push({ stars, line, name, starMaterial, lineMaterial, id, hitboxes });
}

// Zoom into star logic
function smoothZoomTo(targetPosition, onComplete) {
    const zoomSpeed = 0.02;
    const finalZoomDistance = 10;
    const startPosition = camera.position.clone();
    const startRotation = camera.rotation.z;
    let progress = 0;

    function animateZoom() {
        progress += zoomSpeed;
        
        progress = Math.min(1, progress);
        
        camera.position.lerpVectors(startPosition, targetPosition, progress);
        
        const zOffset = (1 - progress) * 301;
        camera.position.z -= zoomSpeed * zOffset;
        
        camera.rotation.z = startRotation + (progress * Math.PI * 0.1);

        if (progress >= 1) {
            camera.position.copy(targetPosition);
            if (onComplete) onComplete();
        } else {
            renderer.render(scene, camera);
            requestAnimationFrame(animateZoom);
        }
    }
    
    animateZoom();
}

// Add this variable at the top level of your script
let documentationOpen = false;

function loadDocumentationHTML(id) {
    const documentationElement = document.getElementById('documentation');
    documentationOpen = true;

    documentationElement.scrollTop = 0;

    fetch(`docs/${id}.html`)
        .then(response => response.text())
        .then(htmlContent => {
            documentationElement.innerHTML = `
                <div class="documentation-wrapper">
                    <div class="close-icon" onclick="closeDocumentation()">X</div>
                    <div class="documentation-content">
                        ${htmlContent}
                    </div>
                </div>`;
            documentationElement.style.display = 'block';
            
            documentationElement.scrollTop = 0;
        })
        .catch(error => {
            console.error('Error loading documentation:', error);
            documentationElement.innerHTML = '<p>Error loading content.</p>';
            documentationElement.style.display = 'block';
        });
}

function closeDocumentation() {
    const documentationElement = document.getElementById('documentation');
    documentationElement.style.display = 'none';
    menuIcon.style.display = 'block';
    documentationOpen = false;
    
    const startRotation = camera.rotation.z;
    const normalizedRotation = startRotation % (Math.PI * 2);
    let progress = 0;
    
    function resetRotation() {
        progress += 0.02; 
        progress = Math.min(1, progress);
        
        camera.rotation.z = normalizedRotation * (1 - progress);
        
        if (progress < 1 && Math.abs(camera.rotation.z) > 0.01) {
            requestAnimationFrame(resetRotation);
        } else {
            camera.rotation.z = 0;
        }
    }
    
    if (Math.abs(normalizedRotation) > 0.01) {
        resetRotation();
    }
    
    documentationElement.scrollTop = 0;
}

// For camera dragging
document.addEventListener('mousedown', (e) => {
    if (!documentationOpen) {
        isDragging = true;
    }
});

document.addEventListener('mousemove', (e) => {
    if (!documentationOpen && isDragging) {
        const deltaX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
        const deltaY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

        targetRotationY -= deltaX * rotationSpeed;
        targetRotationX -= deltaY * rotationSpeed;

        targetRotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotationX));
    }
});

// For WASD movement
document.addEventListener('keydown', (e) => {
    if (!documentationOpen) {
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
    }
});

// For star clicking/raycasting
document.addEventListener('click', (event) => {
    const documentationElement = document.getElementById('documentation');
    const documentationContent = document.querySelector('.documentation-wrapper');

    if (documentationElement.style.display === 'block') {
        if (!documentationContent.contains(event.target)) {
            event.preventDefault();
            event.stopPropagation();
        }
        return;
    }

    // Only process star clicks if documentation is not open
    if (!documentationOpen) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(starGroups.flatMap(group => group.hitboxes));

        if (intersects.length > 0) {
            const clickedGroup = starGroups.find(group => 
                group.hitboxes.includes(intersects[0].object)
            );

            if (clickedGroup) {
                const targetPosition = intersects[0].point;
                smoothZoomTo(targetPosition, () => loadDocumentationHTML(clickedGroup.id));
            }
        }
    }
});

// For wheel/zoom
document.addEventListener('wheel', (e) => {
    if (!documentationOpen) {
        targetZoom += e.deltaY * scrollSpeed;
        targetZoom = Math.max(5, Math.min(targetZoom, 150));
    }
}, { passive: false });

function scrollToExample(exampleId) {
    const exampleElement = document.getElementById(exampleId);

    if (exampleElement) {
        exampleElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

document.body.insertAdjacentHTML('beforeend', `
    <div id="documentation" style="display:none; position:absolute; top:0; right:0; width:100%; height:100%; background-color:rgba(0,0,0,0.8); color:black; padding:20px; overflow-y:auto; -ms-overflow-style: none; scrollbar-width: none;">
        <!-- Content will be loaded dynamically -->
    </div>
`);

document.addEventListener('click', (event) => {
    const documentationElement = document.getElementById('documentation');
    const documentationContent = document.querySelector('.documentation-wrapper');

    if (documentationElement.style.display === 'block' && 
        !documentationContent.contains(event.target) &&
        !event.target.closest('.documentation-wrapper')) {
        closeDocumentation();
    }
});

// hover lo's/projects
document.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const objectsToCheck = starGroups.flatMap(group => group.hitboxes);
    const intersects = raycaster.intersectObjects(objectsToCheck);

    if (intersects.length > 0) {
        const firstIntersectedObject = intersects[0].object;
        
        const hoveredGroup = starGroups.find(group =>
            group.hitboxes.includes(firstIntersectedObject)
        );
    
        if (hoveredGroup) {
            console.log(`Hovered over: ${hoveredGroup.name}`); 
            tooltip.innerText = hoveredGroup.name;
            tooltip.style.display = 'block';  
            tooltip.style.left = `${event.clientX + 7}px`;
            tooltip.style.top = `${event.clientY + 7}px`;

            hoveredGroup.stars.material.color.set(0x1a73e8);  
            hoveredGroup.line.material.color.set(0xe88f1a);  

            document.body.style.cursor = 'pointer';
            return;
        }
    } 

    tooltip.style.display = 'none';
    document.body.style.cursor = 'default'; 

    starGroups.forEach(group => {
        group.stars.material.color.set(0xffffff);  
        group.line.material.color.set(0xffffff);  
    });
});

const loadingOverlay = document.getElementById('loading-overlay');

function hideLoadingOverlay() {
    loadingOverlay.style.opacity = '0';
    setTimeout(() => {
        loadingOverlay.style.display = 'none';
    }, 300); 
}

setTimeout(hideLoadingOverlay, 8000);

// Function to create the planet 
function createPlanet() {
    const textureLoader = new THREE.TextureLoader();
    const planetTexture = textureLoader.load('static/background2.jpg'); 

    const geometry = new THREE.SphereGeometry(60, 492, 492);
    const material = new THREE.MeshStandardMaterial({
        map: planetTexture
    });
    
    const planet = new THREE.Mesh(geometry, material);

    planet.position.set(0, 0, -50);
    scene.add(planet);
    
    return planet;
}

function createBigPlanet() {
    const textureLoader = new THREE.TextureLoader();
    const planetTexture = textureLoader.load('static/BigPlan.jpg'); 

    const geometry = new THREE.SphereGeometry(50, 328, 328);
    const material = new THREE.MeshStandardMaterial({
        map: planetTexture
    });
    
    const planet = new THREE.Mesh(geometry, material);

    planet.position.set(720, 820, -200);
    scene.add(planet);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.5); 
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); 
    directionalLight.position.set(100, 200, 300); 
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 1000;
    scene.add(directionalLight);

    return planet;
}

// Function to create the orbiting planet 
function createOrbitingPlanet() {
    const textureLoader = new THREE.TextureLoader();
    const orbitingPlanetTexture = textureLoader.load('static/hairb.jpg'); 

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
const bigPlanet = createBigPlanet();
createLearningOutcomesConstellations();
createProjectsConstellations();
createArtworkConstellations()
createContactConstellation()
camera.position.set(0, 0, 100);

// Function for camera movement with W,A,S,D
let isMoving = {
    up: false,
    down: false,
    left: false,
    right: false,
    sprint: false  
};

const moveSpeed = 0.7;
const sprintMultiplier = 3;  
const zoomSpeed = 0.05;

// Smoothing factors for rotation
const rotationSpeed = 0.002; 
const smoothFactor = 0.1;   

let targetRotationX = camera.rotation.x;
let targetRotationY = camera.rotation.y;

// Update WASD and Shift input
document.addEventListener('keydown', (e) => {
    switch (e.key.toLowerCase()) {  
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
        case 'shift':
            isMoving.sprint = true;
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch (e.key.toLowerCase()) {  
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
        case 'shift':
            isMoving.sprint = false;
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
const initialCameraPosition = new THREE.Vector3(0, 0, 100);
const initialCameraRotation = new THREE.Euler(0, 0, 760, 'XYZ');

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
const zoomInDistance = 200;  
const zoomDuration = 1000; 
let isZoomingOut = false;
let zoomPhaseCompleted = false; 

const cameraTargets = {
    projects: new THREE.Vector3(-280, 205, 200), 
    learningOutcomes: new THREE.Vector3(280, 210, 200),
    artwork: new THREE.Vector3(33, 430, 200),
    contact: new THREE.Vector3(42, -345, 200),
    home: new THREE.Vector3(0, 0, 200), 
    initial: new THREE.Vector3(0, 0, 200) 
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
const menuArtwork = document.querySelector('#menu a[href="#artwork"]');
const menuContact = document.querySelector('#menu a[href="#contact"]');

menuProjects.addEventListener('click', () => {
    moveCameraTo(cameraTargets.projects); 
});

menuLearningOutcomes.addEventListener('click', () => {
    moveCameraTo(cameraTargets.learningOutcomes); 
});

menuContact.addEventListener('click', () => {
    moveCameraTo(cameraTargets.contact); 
});

menuArtwork.addEventListener('click', () => {
    moveCameraTo(cameraTargets.artwork);
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

    orbitingPlanet.position.set(planet.position.x + x*2, planet.position.y + y*2, planet.position.z + z*2);
}

function createBlackHole(x = 0, y = 0, z = 0) {
    const blackHoleGroup = new THREE.Group();
    blackHoleGroup.position.set(x, y, z);

    const blackHoleGeometry = new THREE.SphereGeometry(10, 128, 128);
    const blackHoleMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const blackHoleCore = new THREE.Mesh(blackHoleGeometry, blackHoleMaterial);
    blackHoleGroup.add(blackHoleCore);

    const accretionDiskGeometry = new THREE.RingGeometry(12, 20, 256);
    const accretionDiskMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4500,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
    });
    const accretionDisk = new THREE.Mesh(accretionDiskGeometry, accretionDiskMaterial);
    accretionDisk.rotation.x = Math.PI / 2;  
    blackHoleGroup.add(accretionDisk);

    scene.add(blackHoleGroup);

    function animateBlackHole() {
        accretionDisk.rotation.z += 0.02;  
        blackHoleCore.scale.x = 1 + Math.sin(Date.now() * 0.001) * 0.02;
        blackHoleCore.scale.y = 1 + Math.sin(Date.now() * 0.001) * 0.02;
    }

    return animateBlackHole;
}

const animateBlackHole = createBlackHole(-300, 170, -500);

function createStarCluster(xOffset = 0, yOffset = 0, zOffset = 0, clusterRadius = 100, numStars = 500) {
    const clusterGeometry = new THREE.BufferGeometry();
    const clusterVertices = [];
    const clusterColors = [];
    
    for (let i = 0; i < numStars; i++) {
        const radius = Math.random() * clusterRadius;
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos((Math.random() * 2) - 1);

        const x = radius * Math.sin(phi) * Math.cos(theta) + xOffset;
        const y = radius * Math.sin(phi) * Math.sin(theta) + yOffset;
        const z = radius * Math.cos(phi) + zOffset;

        clusterVertices.push(x, y, z);

        const color = new THREE.Color();
        if (radius < clusterRadius * 0.5) {
            color.setHSL(0.75, 0.8, 0.7); 
        } else {
            color.setHSL(0.6, 0.7, 0.8);  
        }
        clusterColors.push(color.r, color.g, color.b);
    }

    clusterGeometry.setAttribute('position', new THREE.Float32BufferAttribute(clusterVertices, 3));
    clusterGeometry.setAttribute('color', new THREE.Float32BufferAttribute(clusterColors, 3));

    const clusterMaterial = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
    });

    const starCluster = new THREE.Points(clusterGeometry, clusterMaterial);
    scene.add(starCluster);
    return starCluster;
}

createStarCluster(-400, -200, -300, 50, 700);
createStarCluster(-300, -800, -500, 55, 700);
createStarCluster(100, 600, -270, 70, 900);
createStarCluster(-400, 300, -100, 60, 800);
createStarCluster(500, 300, 100, 125, 1000);

const restrictedZoneRadius = 80; 
function restrictCameraMovement(planet) {
    const cameraDistance = camera.position.distanceTo(planet.position);

    if (cameraDistance < restrictedZoneRadius) {
        // Move the camera back to the edge of the restricted zone
        const direction = camera.position.clone().sub(planet.position).normalize();
        camera.position.copy(planet.position.clone().add(direction.multiplyScalar(restrictedZoneRadius)));
    }
}
// Function for animations
function animate() {
    requestAnimationFrame(animate);
    
    if (!documentationOpen) {
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

            // Calculate current movement speed
            const currentMoveSpeed = isMoving.sprint ? moveSpeed * sprintMultiplier : moveSpeed;

            // Apply movement
            if (isMoving.up) camera.position.y += currentMoveSpeed;
            if (isMoving.down) camera.position.y -= currentMoveSpeed;
            if (isMoving.left) camera.position.x -= currentMoveSpeed;
            if (isMoving.right) camera.position.x += currentMoveSpeed;
        }

        animateBlackHole();
        restrictCameraMovement(planet);
        renderer.render(scene, camera);
        checkCameraMovement();
        checkMenuVisibility();
    }
}

let menuVisible = false; 

function checkMenuVisibility() {
    const menu = document.getElementById('menu');
    const distance = camera.position.distanceTo(planet.position);

    const minDistance = 80; 
    const maxDistance = 120; 

    if (distance >= minDistance && distance <= maxDistance) {
        if (!menuVisible) { 
            menu.style.display = 'flex';
            menuVisible = true;
        }
    } else {
        if (menuVisible) { 
            menu.style.display = 'none';
            menuVisible = false;
        }
    }
}

animate();

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

function openModal(imgElement) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    
    modal.style.display = "flex"; 
    modalImg.src = imgElement.src;

    modal.onclick = function(e) {
        if (e.target === modal || e.target.className === 'close-icon') {
            closeModal();
        }
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

function closeModal() {
    document.getElementById("imageModal").style.display = "none";
}