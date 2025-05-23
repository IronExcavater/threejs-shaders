import * as THREE from 'three';
import {camera, onUpdate, renderer, scene} from "./app";

export default class CamouflageMaterial extends THREE.ShaderMaterial {
    constructor() {
        super({
            uniforms: {
                time: { value: 0 },
                baseColor: { value: new THREE.Color(0xffffff) },
                strength: { value: 0.6 },
                edgeFalloff: { value: 2.5 },
                distortion: { value: 0.1 },
                scale: { value: 1 },
                speed: { value: 0.5 },
                direction: { value: new THREE.Vector2(1, 0) },
                IOR: { value: 0.05 },
                screenSize: { value: new THREE.Vector2(1, 1) },
                screenTexture: { value: null }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vWorldPosition;
                varying vec3 vViewPosition;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vec4 worldPos = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPos.xyz;
                    
                    vec4 viewPos = viewMatrix * worldPos;
                    vViewPosition = viewPos.xyz;
                    
                    gl_Position = projectionMatrix * viewPos;
                }
            `,
            fragmentShader: `
                precision mediump float;
                
                uniform float time;
                uniform vec3 baseColor;
                uniform float strength;
                uniform float edgeFalloff;
                uniform float distortion;
                uniform float scale;
                uniform float speed;
                uniform vec2 direction;
                uniform float IOR;
                uniform vec2 screenSize;
                uniform sampler2D screenTexture;
                
                varying vec3 vNormal;
                varying vec3 vWorldPosition;
                varying vec3 vViewPosition;
                
                // Simple 2D noise (value noise style)
                vec2 fade(vec2 t) {
                    return t * t * (3.0 - 2.0 * t);
                }
                
                float grad(vec2 p, vec2 offset) {
                    return dot(offset, vec2(
                        sin(dot(p, vec2(127.1, 311.7))),
                        cos(dot(p, vec2(269.5, 183.3)))
                    ));
                }
                
                float perlin(vec2 p) {
                    vec2 i = floor(p);
                    vec2 f = fract(p);
                    vec2 u = fade(f);
                
                    float a = grad(i, f);
                    float b = grad(i + vec2(1.0, 0.0), f - vec2(1.0, 0.0));
                    float c = grad(i + vec2(0.0, 1.0), f - vec2(0.0, 1.0));
                    float d = grad(i + vec2(1.0, 1.0), f - vec2(1.0, 1.0));
                
                    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
                }
                
                float fresnel(vec3 normal, vec3 viewDir, float falloff) {
                    return pow(1.0 - max(dot(normal, viewDir), 0.0), falloff);
                }
                
                void main() {
                    float edge = fresnel(vNormal, normalize(-vViewPosition), edgeFalloff);
                    
                    vec2 offset = direction * time * speed;
                    float n = perlin(vWorldPosition.xy * scale + offset);
                    float d = n * 2.0 * distortion;
                    
                    float camouflageAmount = edge * strength + d * strength;
                    
                    vec2 screenUV = gl_FragCoord.xy / screenSize;
                    vec2 normalOffset = vNormal.xy * IOR;
                    
                    vec4 sceneColor = texture2D(screenTexture, screenUV + normalOffset);
                    vec3 camoColor = mix(vec3(0.0), baseColor, camouflageAmount);
                    
                    vec3 finalColor = mix(sceneColor.rgb, camoColor, camouflageAmount);
                    
                    gl_FragColor = vec4(finalColor, camouflageAmount);
                }
            `,
            transparent: true,
            depthWrite: false,
        });

        let time = 0;
        const renderTarget = new THREE.WebGLRenderTarget();

        onUpdate.subscribe((delta) => {
            time += delta;
            this.uniforms.time.value = time;
            this.uniforms.screenSize.value = new THREE.Vector2(window.innerWidth, window.innerHeight);

            renderTarget.setSize(window.innerWidth, window.innerHeight);
            renderer.setRenderTarget(renderTarget);
            renderer.render(scene, camera);
            renderer.setRenderTarget(null);
            this.uniforms.screenTexture.value = renderTarget.texture;
        });
    }

    get time() {
        return this.uniforms.time.value;
    }

    set time(value: number) {
        this.uniforms.time.value = value;
    }

    get strength() {
        return this.uniforms.strength.value;
    }

    set strength(value: number) {
        this.uniforms.strength.value = value;
    }

    get edgeFalloff() {
        return this.uniforms.edgeFalloff.value;
    }

    set edgeFalloff(value: number) {
        this.uniforms.edgeFalloff.value = value;
    }

    get distortion() {
        return this.uniforms.distortion.value;
    }

    set distortion(value: number) {
        this.uniforms.distortion.value = value;
    }

    get baseColor() {
        return this.uniforms.baseColor.value;
    }

    set baseColor(value: THREE.Color) {
        this.uniforms.baseColor.value = value;
    }

    get scale() {
        return this.uniforms.scale.value;
    }

    set scale(value: number) {
        this.uniforms.scale.value = value;
    }

    get speed() {
        return this.uniforms.speed.value;
    }

    set speed(value: number) {
        this.uniforms.speed.value = value;
    }

    get direction() {
        return this.uniforms.direction.value;
    }
    set direction(value: THREE.Vector2) {
        this.uniforms.direction.value = value;
    }

    get IOR() {
        return this.uniforms.IOR.value;
    }

    set IOR(value: number) {
        this.uniforms.IOR.value = value;
    }

    get screenSize() {
        return this.uniforms.screenSize.value;
    }

    set screenSize(value: THREE.Vector2) {
        this.uniforms.screenSize.value = value;
    }

    get screenTexture() {
        return this.uniforms.screenTexture.value;
    }

    set screenTexture(value: THREE.Texture) {
        this.uniforms.screenTexture.value = value;
    }
}