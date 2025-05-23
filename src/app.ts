import * as THREE from 'three';
import {OrbitControls} from 'three/addons';
import * as CANNON from 'cannon-es';
import Event from './Event';
import CamouflageMaterial from './CamouflageMaterial';
import {getEnvironment, preloadResources} from './resources';
import initGui from './gui';

import '/styles/app.css';
import CamouflageObject from "./CamouflageObject";


await preloadResources();

// Core three.js components
export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1, 5);

export const clock = new THREE.Clock();

export const renderer = new THREE.WebGLRenderer({
    antialias: true,
});
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
renderer.setAnimationLoop(() => update(clock.getDelta()));
renderer.debug.checkShaderErrors = true;

window.addEventListener('resize', () => windowResize());
windowResize();


// Core cannon.js components
export const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.81, 0)
});


// Event functions
function windowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

export const onUpdate = new Event<(delta: number) => void>();

function update(delta: number) {
    world.fixedStep();
    onUpdate.invoke(delta);
    renderer.render(scene, camera);
}


// Extras
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

scene.background = getEnvironment('sky');

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.maxDistance = 5;
onUpdate.subscribe(delta => controls.update());

export const camouflageMaterial = new CamouflageMaterial();
export const camouflageObject = new CamouflageObject({
    geometry: new THREE.SphereGeometry(1, 32, 32),
    camouflageMaterial,
    textureSetName: 'sapphire'
});

initGui();