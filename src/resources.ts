import * as THREE from 'three';
import {EXRLoader} from 'three/addons';

const textureLoader = new THREE.TextureLoader();
const exrLoader = new EXRLoader();

const textures: Record<string, {
    map: THREE.Texture,
    normalMap: THREE.Texture,
    roughnessMap: THREE.Texture,
}> = {};
const environments: Record<string, THREE.Texture> = {};

async function loadTextureSet(name: string, path: string) : Promise<any> {
    const [map, normalMap, roughnessMap] = await Promise.all([
        textureLoader.loadAsync(`${path}_albedo.jpg`),
        textureLoader.loadAsync(`${path}_normal.jpg`),
        textureLoader.loadAsync(`${path}_roughness.jpg`)
    ]);

    textures[name] = {map, normalMap, roughnessMap};
}

export function getTextureSet(name: string) {
    return textures[name];
}

async function loadEnvironment(name: string, path: string) {
    return new Promise((resolve, reject) => {
        exrLoader.load(path,
            (texture: THREE.Texture) => {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                environments[name] = texture;
                resolve(texture);
            },
            undefined,
            reject
        );
    });
}

export function getEnvironment(name: string) {
    return environments[name];
}

export const preloadResources = (async () => {
    await Promise.all([
        loadTextureSet('sapphire', 'assets/textures/sapphire/sapphire'),
        loadEnvironment('sky', 'assets/textures/qwantani-4k.exr')
    ]);
});