import * as THREE from 'three';
import * as CANNON from 'cannon-es';

declare module 'three' {
    interface Vector3 {
        toCannon(): CANNON.Vec3;

        onChange(callback: () => void): this;
        onChangeCallback?: () => void;
    }

    interface Vector2 {
        toVector3(): Vector3;
    }

    interface Euler {
        onChange(callback: () => void): this;
        onChangeCallback?: () => void;
    }

    interface Quaternion {
        toCannon(): CANNON.Quaternion;

        onChange(callback: () => void): this;
        onChangeCallback?: () => void;
    }
}

declare module 'cannon-es' {
    interface Vec3 {
        toThree(): THREE.Vector3;
    }

    interface Quaternion {
        toThree(): THREE.Quaternion;
    }
}

// Convert from THREE.Vector3 to CANNON.Vec3
THREE.Vector3.prototype.toCannon = function() {
    return new CANNON.Vec3(this.x, this.y, this.z);
}

THREE.Vector2.prototype.toVector3 = function() {
    return new THREE.Vector3(this.x, this.y, 1);
}

// Convert from THREE.Quaternion to CANNON.Quaternion
THREE.Quaternion.prototype.toCannon = function() {
    return new CANNON.Quaternion(this.x, this.y, this.z, this.w);
}

// Convert from CANNON.Vec3 to THREE.Vector3
CANNON.Vec3.prototype.toThree = function() {
    return new THREE.Vector3(this.x, this.y, this.z);
}

// Convert from CANNON.Quaternion to THREE.Quaternion
CANNON.Quaternion.prototype.toThree = function() {
    return new THREE.Quaternion(this.x, this.y, this.z, this.w);
}

// On value change
function onChange(object: any) {
    if (typeof object.onChangeCallback === 'function') object.onChangeCallback();
}

function addOnChange<T>(Class: new() => T, isChanged: (a: T, b: T) => boolean) {
    const instance = new Class();
    const proto = Class.prototype;
    const mutatingMethods: string[] = [];

    for (const key of Object.getOwnPropertyNames(proto)) {
        const method = proto[key];
        if (typeof method !== 'function' || key === 'constructor') continue;

        const clone = structuredClone(instance);

        try {
            method.apply(instance);
            if (isChanged(clone, instance)) mutatingMethods.push(key);
        } catch {}
    }

    proto.onChangeCallback = null;
    proto.onChange = function (callback: () => void) {
        this.onChangeCallback = callback;
        return this;
    };

    for (const method of mutatingMethods) {
        const original = proto[method];

        proto[method] = function (...args: any[]) {
            const result = original.apply(this, args);
            onChange(this);
            return result;
        };
    }
}

addOnChange(THREE.Vector3, (a, b) => !a.equals(b));
addOnChange(THREE.Euler, (a, b) => !a.equals(b));
addOnChange(THREE.Quaternion, (a, b) => !a.equals(b));