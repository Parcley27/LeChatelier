import * as THREE from 'three';
// Coord - ... +
// X is left ... right
// Y is down ... up
// Z is back ... front

const terrainSize = 100;
const terrainResolution = 64; // 2^6

// Create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Create camera
const camera = new THREE.PerspectiveCamera(
  75, // Field of view
  window.innerWidth / window.innerHeight, // Aspect ratio
  0.1, // Near clipping plane
  1000 // Far clipping plane

);

camera.position.set(0, 40, 60);
camera.rotation.x = -Math.PI / 6

// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement); // Add canvas to page

// Create geometry plane
// Planes are defined as vertical by default
const geometry = new THREE.PlaneGeometry(
    terrainSize, // Width
    terrainSize, // Height
    terrainResolution, // Width resolution
    terrainResolution // Height resolution

);

const material = new THREE.MeshBasicMaterial({
  color: 0x0000ff,
  wireframe: true

});

const terrain = new THREE.Mesh(geometry, material);

// Rotate to flat
terrain.rotation.x = -Math.PI / 2;

scene.add(terrain);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  terrain.rotation.z += 0.002;
  
  renderer.render(scene, camera);

}

animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

});