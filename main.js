// three.js coordinate  - ... +
// x is left ... right
// y is down ... up
// z is back ... front

import * as three from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { createNoise2D} from 'simplex-noise';

const terrainSize = 100;
const terrainResolution = 128; // 2^6

const startingHeight = 15;
const hillAmplitude = 20;

let targetingSpeed = 0.02;

let equilibriumPosition  = 0.5;
let targetPosition = equilibriumPosition;

let sliderPosition = equilibriumPosition * 100;
let targetSliderPosition = sliderPosition;

const colours = [];

const noise = createNoise2D();
const noiseAmplitude = 0.40;
const noiseResultion = 0.15;

function updateTerrain(equilibriumPosition ) {
    const positions = geometry.attributes.position;

    for (let i = 0; i < positions.count; i++) {
        let x = positions.getX(i);
        let y = positions.getY(i)

        // Height graph 
        //https://www.desmos.com/3d/btdxdtzb4d
        const leftPeak = Math.exp(-Math.pow((x + startingHeight * 2) / startingHeight, 2)) * hillAmplitude * (1 - equilibriumPosition );
        const rightPeak = Math.exp(-Math.pow((x - startingHeight * 2) / startingHeight, 2)) * hillAmplitude * equilibriumPosition ;

        // Noise for texture
        const noiseValue = noise(x * noiseResultion, y * noiseResultion) * noiseAmplitude;

        const height = leftPeak + rightPeak + (noiseValue * x / 20);

        positions.setZ(i, height);
      
    }

    // Render updates and recompute normals for lighting
    positions.needsUpdate = true;
    geometry.computeVertexNormals();

}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Smooth transition between actual and target positions
    const difference = targetPosition - equilibriumPosition;
    equilibriumPosition  += difference * targetingSpeed;

    // Smooth transition for slider position
    const sliderDifference = targetSliderPosition - sliderPosition;
    sliderPosition += sliderDifference * targetingSpeed;
    slider.value = sliderPosition;

    // Only update terrain if there's a sensible difference
    if (Math.abs(difference) > 0.001) {
        updateTerrain(equilibriumPosition);

    }

    controls.update();

    renderer.render(scene, camera);

}

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

camera.position.set(0, 60, 80);
camera.rotation.x = -Math.PI / 6

// Lights
const ambientLight = new three.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const keyLight = new three.DirectionalLight(0xffffff, 0.8);
keyLight.position.set(20, 100, 10);
scene.add(keyLight);

const rimLight = new three.DirectionalLight(0xffffff, 0.5);
rimLight.position.set(0, 30, -50);
scene.add(rimLight);

const fillLight = new three.DirectionalLight(0xffffff, 1.2);
fillLight.position.set(0, -10, 0);
scene.add(fillLight);

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

updateTerrain(equilibriumPosition );

const slider = document.getElementById("equilibrium-slider");
slider.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    targetPosition = value / 100;
    // Sync slider positions to prevent animation from fighting manual input
    sliderPosition = value;
    targetSliderPosition = value;

})

const buttons = document.querySelectorAll("[data-stress]");
buttons.forEach(button => {
    button.addEventListener("click", (e) => {
        const stress = button.dataset.stress;

        switch (stress) {
            case "reactant":
                targetPosition = Math.max(0, targetPosition - 0.1);
                
                break;
            
            case "product":
                targetPosition = Math.min(1, targetPosition + 0.1);

                break;
            
            case "heat":
                targetPosition = Math.min(1, targetPosition + 0.05); // Assuming endothermic for now

                break;
            
            case "cool":
                targetPosition = Math.max(0, targetPosition - 0.05); // Again assuming endothermic

                break;

        }

        targetSliderPosition = targetPosition * 100;

    })
})

const colourA = new three.Color(0xff0000);
const colourB = new three.Color(0x0000ff);

const positions = geometry.attributes.position;
for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);

    const mixFactor = (x + 50) / 100;

    const colour = new three.Color();
    colour.lerpColors(colourA, colourB, mixFactor);

    colours.push(colour.r, colour.g, colour.b);

}

geometry.setAttribute('color', new three.Float32BufferAttribute(colours, 3));

const material = new three.MeshStandardMaterial({
    roughness: 0.65,
    metalness: 0.2,
    wireframe: false,
    vertexColors: true,
    side: three.DoubleSide

});

const terrain = new three.Mesh(geometry, material);

// Rotate to flat
terrain.rotation.x = -Math.PI / 2;

scene.add(terrain);

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

});