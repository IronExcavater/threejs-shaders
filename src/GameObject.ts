import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {onUpdate, scene, world} from './app';
import './utils';

export abstract class GameObject extends THREE.Object3D {
    protected mesh: THREE.Mesh;
    protected shape: CANNON.Shape;
    protected body: CANNON.Body;

    protected constructor(
        geometry: THREE.BufferGeometry,
        material: THREE.Material,
        shape: CANNON.Shape,
        mass = 0,
        position = new THREE.Vector3(),
        rotation = new THREE.Euler(),
        scale = new THREE.Vector3(),
    ) {
        super();

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.receiveShadow = true;
        this.mesh.castShadow = true;
        this.add(this.mesh);

        this.shape = shape;
        this.body = new CANNON.Body({
            mass,
            shape: this.shape,
        });

        world.addBody(this.body);
        this.addEventListener('added', () => world.addBody(this.body));
        this.addEventListener('removed', () => world.removeBody(this.body));

        this.position.onChange(() => {
            this.body.position.copy(this.position.toCannon());
        });

        this.quaternion.onChange(() => {
            this.body.quaternion.copy(this.quaternion.toCannon());
        });

        this.scale.onChange(() => {
            this.updateScale();
            this.updateUVRepeat();
        })

        this.position.copy(position);
        this.rotation.copy(rotation);
        this.scale.copy(scale);

        scene.add(this);
        onUpdate.subscribe(delta => this.update(delta));
    }

    dispose() {
        scene.remove(this);
        world.removeBody(this.body);
        onUpdate.unsubscribe(delta => this.update(delta));
    }

    protected update(delta: number): void {}

    protected abstract updateScale(): void;

    protected updateUVRepeat() {
        const size = new THREE.Vector3();
        new THREE.Box3().setFromObject(this).getSize(size);

        const maps: (keyof THREE.MeshStandardMaterial)[] = ['map', 'normalMap', 'roughnessMap'];
        for (const map of maps) {
            const tex = (this.mesh.material as any)[map] as THREE.Texture;
            if (tex) {
                tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                tex.repeat.set(size.x, size.z);
                tex.needsUpdate = true;
            }
        }
    }
}

export class PlaneObject extends GameObject {
    constructor(
        material: THREE.Material = new THREE.MeshStandardMaterial(),
        position = new THREE.Vector3(),
        rotation = new THREE.Euler(),
        visualScale = new THREE.Vector2(1, 1),
        mass = 0
    ) {
        super(
            new THREE.PlaneGeometry(visualScale.x, visualScale.y),
            material,
            new CANNON.Plane(),
            mass,
            position,
            rotation,
            visualScale.toVector3(),
        )
    }

    protected updateScale() {
        this.body.removeShape(this.shape);
        this.shape = new CANNON.Box(new CANNON.Vec3(this.scale.x / 2, this.scale.y / 2, this.scale.z / 2));
        this.body.addShape(this.shape);
    }
}

export class BoxObject extends GameObject {
    constructor({
        geometry = undefined,
        material = new THREE.MeshStandardMaterial(),
        position = new THREE.Vector3(),
        rotation = new THREE.Euler(),
        scale = new THREE.Vector3(1, 1, 1),
        mass = 0
    }: {
        geometry?: THREE.BoxGeometry,
        material?: THREE.Material,
        position?: THREE.Vector3,
        rotation?: THREE.Euler,
        scale?: THREE.Vector3,
        mass?: number
    }) {
        super(
            new THREE.BoxGeometry(scale.x, scale.y, scale.z),
            material,
            new CANNON.Box(new CANNON.Vec3(scale.x / 2, scale.y / 2, scale.z / 2)),
            mass,
            position,
            rotation,
            scale,
        )
    }

    protected updateScale() {
        this.body.removeShape(this.shape);
        this.shape = new CANNON.Box(new CANNON.Vec3(this.scale.x / 2, this.scale.y / 2, this.scale.z / 2));
        this.body.addShape(this.shape);
    }
}

export class SphereObject extends GameObject {
    constructor({
        geometry = undefined,
        material = new THREE.MeshStandardMaterial(),
        position = new THREE.Vector3(),
        rotation = new THREE.Euler(),
        radius = 1,
        mass = 0
    }: {
        geometry?: THREE.SphereGeometry,
        material?: THREE.Material,
        position?: THREE.Vector3,
        rotation?: THREE.Euler,
        radius?: number,
        mass?: number
    }) {
        super(
            geometry != undefined ? geometry : new THREE.SphereGeometry(radius, 32, 32),
            material,
            new CANNON.Sphere(radius),
            mass,
            position,
            rotation,
            new THREE.Vector3(radius, radius, radius),
        )
    }

    protected updateScale() {
        this.body.removeShape(this.shape);
        const radius = (this.scale.x + this.scale.y + this.scale.z) / 6;
        this.shape = new CANNON.Sphere(radius);
        this.body.addShape(this.shape);
    }
}