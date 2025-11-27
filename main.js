// three.js coordinate  - ... +
// x is left ... right
// y is down ... up
// z is back ... front

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

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

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.maxPolarAngle = Math.PI / 2.2; // Prevent ground clipping

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
  
  controls.update;
  
  renderer.render(scene, camera);

}

animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

});