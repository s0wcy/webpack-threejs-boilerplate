import * as THREE from 'three'
import OrbitControls from 'three-orbitcontrols'

import vertexShader from '../glsl/vertexShader.vert'
import fragmentShader from '../glsl/fragmentShader.frag'

export default class Template {
    constructor(_DOMel) {
        // DOM config
        this.$container = _DOMel
        this.containerSize = {
            width: this.$container.offsetWidth,
            height: this.$container.offsetHeight,
        }

        /**
         * Camera
         */
        this.cameraProps = {
            fov: 75,
            aspect: this.containerSize.width / this.containerSize.height,
            near: 1,
            far: 1000,
            target: new THREE.Vector3(0, 0, 50),
        }

        this.camera = new THREE.PerspectiveCamera(
            this.cameraProps.fov,
            this.cameraProps.aspect,
            this.cameraProps.near,
            this.cameraProps.far,
        )
        this.initCamera()

        /**
         * Scene
         */
        this.scene = new THREE.Scene()
        this.scene.autoUpdate = true

        /**
         * Renderer
         */
        this.renderer = new THREE.WebGLRenderer({
            alpha: false,
        })

        // Append Canvas
        this.renderer.domElement.classList.add('confettis')
        this.$container.appendChild(this.renderer.domElement)


        /**
         * Magic here
         */
        this.material = new THREE.MeshBasicMaterial({
            color: 0xb7ff00,
            wireframe: true
        })
        this.mesh = new THREE.Mesh(
            new THREE.CubeGeometry(10, 10, 10),
            this.material
        )
        this.scene.add(this.mesh)


        /**
         * Controler
         */
        this.controler = null
        this.controlerProps = {
            zoom: {
                min: 15,
                max: 200,
                speed: 0.2
            },
            rotateSpeed: 0.1,
            damping: 1
        }
        this.initControler()

        /**
         * Events & Animation
         */
        window.addEventListener('resize', () => this.resize())

        this.loop = this.loop.bind(this)
        this.loop()
    }

    /**
     * Responsive
     */
    resize() {
        this.containerSize.width = window.innerWidth
        this.containerSize.height = window.innerHeight

        // keep aspect ratio of camera
        this.camera.aspect = this.containerSize.width / this.containerSize.height
        this.camera.updateProjectionMatrix()

        this.renderer.setSize(this.containerSize.width / this.containerSize.height)
    }

    /**
     * Init configurations
     */
    initCamera() {
        this.camera.lookAt(this.cameraProps.target)
        this.camera.position.set(0, 0, this.cameraProps.far)
        this.camera.updateProjectionMatrix()
    }

    initControler() {
        this.controler =  new OrbitControls(this.camera, this.renderer.domElement)
        this.controler.minDistance = this.controlerProps.zoom.min
        this.controler.maxDistance = this.controlerProps.zoom.max
        this.controler.rotateSpeed = this.controlerProps.zoom.speed
        this.controler.autoRotate = true
        this.controler.autoRotateSpeed = this.controlerProps.rotateSpeed
        this.controler.enableDamping = true
        this.controler.enablePan = false
        this.dampingFactor = this.controlerProps.damping
    }

    /**
     * Animate
     */
    update() {
        this.controler.update()
        this.renderer.setSize(this.containerSize.width, this.containerSize.height)
    }

    render() {
        this.renderer.render(this.scene, this.camera)
    }

    loop() {
        window.requestAnimationFrame(this.loop)

        // Renderer & Update
        this.update()
        this.render()
    }
}