import * as THREE from 'three'
import CameraControls from 'camera-controls'
CameraControls.install( { THREE: THREE } )

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
            target: new THREE.Vector3(0, 0, 100),
        }

        this.camera = null
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
        this.controlerProps = {
            zoom: {
                min: 15,
                max: 200,
            },
            azimuth: {
                min: -Infinity,
                max: Infinity
            },
            polar: {
                min: 0,
                max: Math.PI
            },
            rotateSpeed: 0.1,
            damping: 1
        }

        this.clock = new THREE.Clock()
        this.delta = this.clock.getDelta()
        this.controler = null
        this.initControler()

        setTimeout( () => this.rotateCamera(this.controler, 1, 2), 2000)

        /**
         * Events & Animation
         */
        window.addEventListener('resize', () => this.resize())

        this.loop = this.loop.bind(this)
        this.loop()
    }

    /**
     * Animations
     */
    rotateCamera(_camera, _azimuth, _polar) {
        _camera.rotate(
            _azimuth,
            _polar,
            true
        )
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
        this.camera = new THREE.PerspectiveCamera(
            this.cameraProps.fov,
            this.cameraProps.aspect,
            this.cameraProps.near,
            this.cameraProps.far,
        )

        this.camera.lookAt(this.cameraProps.target)
        this.camera.updateProjectionMatrix()
    }

    initControler() {
        this.controler =  new CameraControls(this.camera, this.renderer.domElement)

        this.controler.dollyTo(20, true)

        this.controler.minDistance = this.controlerProps.zoom.min
        this.controler.maxDistance = this.controlerProps.zoom.max
        this.controler.dampingFactor = this.controlerProps.damping
        this.controler.azimuthRotateSpeed = this.controlerProps.rotateSpeed

        this.controler.enableDamping = true
        this.controler.enablePan = false
    }

    /**
     * Animate
     */
    update() {
        this.delta = this.clock.getDelta() / 4
        this.controler.update(this.delta)
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