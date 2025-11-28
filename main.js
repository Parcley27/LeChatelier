// three.js coordinate  - ... +
// x is left ... right
// y is down ... up
// z is back ... front

import * as three from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const terrainSize = 100;
const terrainResolution = 64; // 2^6

const startingHeight = 15;

// Create scene
const scene = new three.Scene();
scene.background = new three.Color(0x000000);

// Create camera
const camera = new three.PerspectiveCamera(
  75, // Field of view
  window.innerWidth / window.innerHeight, // Aspect ratio
  0.1, // Near clipping plane
  1000 // Far clipping plane

);

camera.position.set(0, 40, 60);
camera.rotation.x = -Math.PI / 6

// Create renderer
const renderer = new three.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement); // Add canvas to page

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.maxPolarAngle = Math.PI / 2.2; // Prevent ground clipping

// Create geometry plane
// Planes are defined as vertical by default
const geometry = new three.PlaneGeometry(
    terrainSize, // Width
    terrainSize, // Height
    terrainResolution, // Width resolution
    terrainResolution // Height resolution

);

const positions = geometry.attributes.position;

for (let i = 0; i < positions.count; i++) {
    let x = positions.getX(i);

    // Height graph 
    //https://www.desmos.com/3d/btdxdtzb4d
    const leftPeak = Math.exp(-Math.pow((x + startingHeight * 2) / startingHeight, 2)) * startingHeight;
    const rightPeak = Math.exp(-Math.pow((x - startingHeight * 2) / startingHeight, 2)) * startingHeight;

    const height = leftPeak + rightPeak;

    positions.setZ(i, height);
    
}

// Render updates and recompute normals for lighting
positions.needsUpdate = true;
geometry.computeVertexNormals();

const material = new three.MeshBasicMaterial({
  color: 0x0000ff,
  wireframe: true

});

const terrain = new three.Mesh(geometry, material);

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