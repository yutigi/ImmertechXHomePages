import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
//import Stats from 'three/examples/jsm/libs/stats.module'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { AnimationMixer, Clock } from 'three';


const scene = new THREE.Scene()

// // Debug Grid
// const gridHelper = new THREE.GridHelper(10, 10, 0xaec6cf, 0xaec6cf)
// scene.add(gridHelper)

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)

camera.position.set(0,1,2)

const renderer = new THREE.WebGLRenderer()
renderer.physicallyCorrectLights = true
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.toneMapping = THREE.ReinhardToneMapping;
document.body.appendChild(renderer.domElement)

// post process
const composer = new EffectComposer( renderer )
const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );

const params = {
    exposure: 1,
    bloomStrength: 1.2,
    bloomThreshold: 0.1,
    bloomRadius: 0.5
};
// Unreal Bloom
const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;
composer.addPass( bloomPass );


// const geometry = new THREE.BoxGeometry()
// const material = new THREE.MeshBasicMaterial({
//     color: 0x00ff00,
//     wireframe: true,
// })

// const cube = new THREE.Mesh(geometry, material)
// cube.position.set(0, 0.5, -10)
// scene.add(cube)

// animation mixer
let mixer:AnimationMixer, clock:Clock;
clock = new THREE.Clock()

const loader = new GLTFLoader()
loader.load(
    './models/ImmertechLogo.glb',
    function (gltf) {
        gltf.scene.traverse(function (child) {
            if ((child as THREE.Mesh).isMesh) {
                const m = (child as THREE.Mesh)
                //m.receiveShadow = true
                //m.castShadow = true
            }
        //     if (((child as THREE.Light)).isLight) {
        //         const l = (child as THREE.Light)
        //         l.castShadow = true
        //         l.shadow.bias = -.003
        //         l.shadow.mapSize.width = 2048
        //         l.shadow.mapSize.height = 2048
        //     }
        })
        gltf.scene.scale.set(0.1,0.1,0.1)
        gltf.scene.position.set(0,1,0)

        mixer = new THREE.AnimationMixer( gltf.scene )
        for (let index = 0; index < gltf.animations.length; index++) {
            //AnimationsSeq.push(gltf.animations[index])
            const clip = gltf.animations[index]
            mixer.clipAction( clip.optimize() ).play()
        }
        // const clip = gltf.animations[0]
        // mixer.clipAction( clip.optimize() ).play()

        scene.add(gltf.scene)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    composer.setSize(window.innerWidth, window.innerHeight)
    render()
}

/* Liner Interpolation
 * lerp(min, max, ratio)
 * eg,
 * lerp(20, 60, .5)) = 40
 * lerp(-20, 60, .5)) = 20
 * lerp(20, 60, .75)) = 50
 * lerp(-20, -10, .1)) = -.19
 */
function lerp(x: number, y: number, a: number): number {
    return (1 - a) * x + a * y
}

// Used to fit the lerps to start and end at specific scrolling percentages
function scalePercent(start: number, end: number) {
    return (scrollPercent - start) / (end - start)
}

const animationScripts: { start: number; end: number; func: () => void }[] = []

//add an animation that flashes the cube through 100 percent of scroll
animationScripts.push({
    start: 0,
    end: 101,
    func: () => {
        // let g = material.color.g
        // g -= 0.05
        // if (g <= 0) {
        //     g = 1.0
        // }
        // material.color.g = g
    },
})

//add an animation that moves the cube through first 40 percent of scroll
animationScripts.push({
    start: 0,
    end: 40,
    func: () => {
        // camera.lookAt(cube.position)
        // camera.position.set(0, 1, 2)
        // cube.position.z = lerp(-10, 0, scalePercent(0, 40))
        // //console.log(cube.position.z)
    },
})

//add an animation that rotates the cube between 40-60 percent of scroll
animationScripts.push({
    start: 40,
    end: 60,
    func: () => {
        // camera.lookAt(cube.position)
        // camera.position.set(0, 1, 2)
        // cube.rotation.z = lerp(0, Math.PI, scalePercent(40, 60))
        // //console.log(cube.rotation.z)
    },
})

//add an animation that moves the camera between 60-80 percent of scroll
animationScripts.push({
    start: 60,
    end: 80,
    func: () => {
        // camera.position.x = lerp(0, 5, scalePercent(60, 80))
        // camera.position.y = lerp(1, 5, scalePercent(60, 80))
        // camera.lookAt(cube.position)
        // //console.log(camera.position.x + " " + camera.position.y)
    },
})

//add an animation that auto rotates the cube from 80 percent of scroll
animationScripts.push({
    start: 80,
    end: 101,
    func: () => {
        // //auto rotate
        // cube.rotation.x += 0.01
        // cube.rotation.y += 0.01
    },
})

function playScrollAnimations() {
    animationScripts.forEach((a) => {
        if (scrollPercent >= a.start && scrollPercent < a.end) {
            a.func()
        }
    })
}

let scrollPercent = 0

document.body.onscroll = () => {
    //calculate the current scroll progress as a percentage
    scrollPercent =
        ((document.documentElement.scrollTop || document.body.scrollTop) /
            ((document.documentElement.scrollHeight ||
                document.body.scrollHeight) -
                document.documentElement.clientHeight)) *
        100
    // // Debug scroll progress
    // ;(document.getElementById('scrollProgress') as HTMLDivElement).innerText =
    //     'Scroll Progress : ' + scrollPercent.toFixed(2)
}

document.body.onmousemove = (event) => {

    const sensitivity = 0.0001

    camera.position.y += event.movementY * sensitivity
    camera.position.x += event.movementX * sensitivity      
    camera.quaternion.y += event.movementX * sensitivity/10
    camera.quaternion.x += event.movementY * sensitivity/10

    // if(event.button == 0){
    //     camera.position.y -= event.movementY * sensitivity
    //     camera.position.x -= event.movementX * sensitivity        
    // } else if(event.button == 2){
    //     camera.quaternion.y -= event.movementX * sensitivity/10
    //     camera.quaternion.x -= event.movementY * sensitivity/10
    // }
}

// Debug Stats
// const stats = Stats()
// document.body.appendChild(stats.dom)

function animate() {
    requestAnimationFrame(animate)

    playScrollAnimations()

    // const delta = clock.getDelta();
	// mixer.update( delta );

    mixer.setTime(scrollPercent / 24)

    composer.render()

    render()

    //stats.update()
}

function render() {
    composer.render()
    //renderer.render(scene, camera)
}

window.scrollTo({ top: 0, behavior: 'smooth' })
animate()