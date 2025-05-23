import * as THREE from 'three';
import {onUpdate, scene} from './app';
import CamouflageMaterial from './CamouflageMaterial';
import {getTextureSet} from "./resources";

export default class CamouflageObject extends THREE.Object3D {
    private camouflageMaterial: CamouflageMaterial;
    private standardMaterial: THREE.MeshStandardMaterial;
    private geometry: THREE.BufferGeometry;

    private camouflageMesh: THREE.Mesh;
    private standardMesh: THREE.Mesh;

    public camouflageStrength: number;

    constructor({
        geometry = new THREE.BufferGeometry(),
        camouflageMaterial = new CamouflageMaterial(),
        textureSetName = '',
    }: {
        geometry: THREE.BufferGeometry,
        camouflageMaterial: CamouflageMaterial,
        textureSetName: string,
    }) {
        super();

        this.camouflageStrength = 0.5;

        this.geometry = geometry;
        this.camouflageMaterial = camouflageMaterial;
        const textureSet = getTextureSet(textureSetName);
        this.standardMaterial = new THREE.MeshStandardMaterial({
            map: textureSet.map,
            normalMap: textureSet.normalMap,
            roughnessMap: textureSet.roughnessMap,
            depthTest: false,
            transparent: true,
        });

        this.camouflageMesh = new THREE.Mesh(this.geometry, this.camouflageMaterial);
        this.standardMesh = new THREE.Mesh(this.geometry, this.standardMaterial);

        this.camouflageMesh.renderOrder = 1;
        this.standardMesh.renderOrder = 0;

        this.add(this.camouflageMesh);
        this.add(this.standardMesh);
        scene.add(this);

        onUpdate.subscribe(delta => this.update(delta));
    }

    private update(delta: number) {
        this.camouflageMaterial.uniforms.strength.value = this.camouflageStrength;
        this.standardMaterial.opacity = 1 - this.camouflageStrength;
    }
}