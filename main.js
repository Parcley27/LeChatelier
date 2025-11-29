// three.js coordinate  - ... +
// x is left ... right
// y is down ... up
// z is back ... front

import * as three from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { createNoise2D} from 'simplex-noise';
import systemsData from "./equilibrium-systems.json";

const terrainSize = 100;
const terrainResolution = 128; // 2^6

const startingHeight = 15;
const hillAmplitude = 20;

const historyLength = 2100;
const equilibriumHistory = new Array(historyLength).fill(0.5);
const concentrationHistory = new Array(historyLength).fill(1.0);
let historyIndex = 0;

let targetingSpeed = 0.02 / 5;

let equilibriumPosition  = 0.5;
let targetPosition = equilibriumPosition;

let sliderPosition = equilibriumPosition * 100;
let targetSliderPosition = sliderPosition;

let totalConcentration = 1.0;
let targetConcentration = totalConcentration;

const systems = {};
systemsData.systems.forEach(system => {
    systems[system.id] = system;

});

let currentSystem = systems["btb"]; // btb, fescn, cu ammine, cu aqua, cobalt, co2

const colours = [];

const reactantColour = new three.Color(currentSystem.reactantColour || 0xff0000);
const productColour = new three.Color(currentSystem.productColour || 0x0000ff);

let frameCount = 0;
const simulationSpeed = 1/150;

const noise = createNoise2D();
const noiseAmplitude = 0.25; 
const noiseResultion = 0.15;

function getHistory(y) {
    const normalizedY = (y + terrainSize / 2) / terrainSize; // 0 ... 1
    const historyLookback = Math.floor(normalizedY * (historyLength - 1));
    const lookbackIndex = (historyIndex - historyLookback + historyLength) % historyLength;

    return {
        equilibrium: equilibriumHistory[lookbackIndex],
        concentration: concentrationHistory[lookbackIndex]

    };

}

function updateTerrain(equilibriumPosition ) {
    const positions = geometry.attributes.position;

    frameCount++;

    // Update history buffer
    historyIndex = (historyIndex + 1) % historyLength;

    equilibriumHistory[historyIndex] = equilibriumPosition;
    concentrationHistory[historyIndex] = totalConcentration;

    for (let i = 0; i < positions.count; i++) {
        let x = positions.getX(i);
        let y = positions.getY(i)

        const historicalEquilibrium = getHistory(y).equilibrium;
        const historicalConcentration = getHistory(y).concentration;

        // Height graph
        //https://www.desmos.com/3d/btdxdtzb4d
        const leftPeak = Math.exp(-Math.pow((x + startingHeight * 2) / startingHeight, 2)) * hillAmplitude * (1 - historicalEquilibrium ) * historicalConcentration;
        const rightPeak = Math.exp(-Math.pow((x - startingHeight * 2) / startingHeight, 2)) * hillAmplitude * historicalEquilibrium * historicalConcentration;

        // Noise for texture
        const noiseValue = noise(x * noiseResultion, y * noiseResultion - frameCount * simulationSpeed) * noiseAmplitude;

        const height = leftPeak + rightPeak + (noiseValue * x / 20);

        positions.setZ(i, height);

    }

    // Render updates and recompute normals for lighting
    positions.needsUpdate = true;
    geometry.computeVertexNormals();

}

function updateColours(equilibriumPosition) {
    const positions = geometry.attributes.position;
    const colourAttribute = geometry.attributes.color;

    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);

        const historicalEquilibrium = getHistory(y).equilibrium;

        // Base mix factor from position (0 = left/red, 1 = right/blue)
        const baseMixFactor = (x + 50) / 100;

        // Adjust mix factor based on equilibrium position
        // When equilibrium is right (1.0), bias toward blue
        // When equilibrium is left (0.0), bias toward red
        const mixFactor = Math.max(0, Math.min(1, baseMixFactor + (historicalEquilibrium - 0.5)));

        const colour = new three.Color();
        colour.lerpColors(reactantColour, productColour, mixFactor);

        colourAttribute.setXYZ(i, colour.r, colour.g, colour.b);

    }

    colourAttribute.needsUpdate = true;

}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Smooth transition between actual and target positions
    const difference = targetPosition - equilibriumPosition;
    equilibriumPosition  += difference * targetingSpeed;

    // Transition for concentration
    const concentrationDifference = targetConcentration - totalConcentration;
    totalConcentration += concentrationDifference * targetingSpeed;

    // Smooth transition for slider position
    const sliderDifference = targetSliderPosition - sliderPosition;
    sliderPosition += sliderDifference * targetingSpeed;
    slider.value = sliderPosition;

    updateTerrain(equilibriumPosition);
    updateColours(equilibriumPosition);

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

camera.position.set(0, 60, 90);
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
    terrainSize, // Time
    terrainResolution, // Width resolution
    terrainResolution * 2 // Time resolution

);

updateTerrain(equilibriumPosition );

const systemSelect = document.getElementById("equilibrium-selector");
systemSelect.addEventListener("change", (e) => {
    currentSystem = systems[e.target.value];

    reactantColour.set(currentSystem.reactantColour || 0xff0000);
    productColour.set(currentSystem.productColour || 0x0000ff);

    updateColours(equilibriumPosition);

})

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
                targetConcentration = Math.min(5.0, targetConcentration + 0.1);
                
                break;
            
            case "product":
                targetPosition = Math.min(1, targetPosition + 0.1);
                targetConcentration = Math.min(5.0, targetConcentration + 0.1);

                break;
            
            case "heat":
                targetPosition = Math.min(1, targetPosition + 0.05); // Assuming endothermic for now

                break;
            
            case "cool":
                targetPosition = Math.max(0, targetPosition - 0.05); // Again assuming endothermic

                break;
            
            case "reduce-concentration":
                targetConcentration = Math.max(0.5, targetConcentration - 0.1);

                break;

        }

        targetSliderPosition = targetPosition * 100;

    })
})

const positions = geometry.attributes.position;
// Initialize colours array with zeros
for (let i = 0; i < positions.count * 3; i++) {
    colours.push(0);
}

geometry.setAttribute('color', new three.Float32BufferAttribute(colours, 3));

// Set initial colours based on equilibrium position
updateColours(equilibriumPosition);

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
terrain.position.z = -10;

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

});