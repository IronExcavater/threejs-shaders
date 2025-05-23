import GUI from 'lil-gui';
import {camouflageMaterial, camouflageObject} from './app';

const gui = new GUI();

export default function initGui() {
    const shaderGroup = gui.addFolder('Camouflage Shader');
    shaderGroup.add(camouflageObject, 'camouflageStrength', 0, 1, 0.01).name('Strength');
    shaderGroup.addColor(camouflageMaterial, 'baseColor').name('Color');
    shaderGroup.add(camouflageMaterial, 'edgeFalloff', 0.1, 5, 0.01).name('Edge Falloff');
    shaderGroup.add(camouflageMaterial, 'distortion', 0, 1, 0.01).name('Distortion');
    shaderGroup.add(camouflageMaterial, 'scale', 0.1, 10, 0.01).name('Scale');
    shaderGroup.add(camouflageMaterial, 'speed', 0, 3, 0.01).name('Speed');
    shaderGroup.add(camouflageMaterial.direction, 'x', -1, 1, 0.01).name('Direction X');
    shaderGroup.add(camouflageMaterial.direction, 'y', -1, 1, 0.01).name('Direction Y');
    shaderGroup.add(camouflageMaterial, 'IOR', -1, 1, 0.01).name('Index of Refraction');
}