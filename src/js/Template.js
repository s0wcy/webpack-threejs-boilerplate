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

        this.uniforms = {
            u_time: {
                type: 'v2',
                value: 1.0
            },
            u_resolution: {
                type: 'v2',
                value: new THREE.Vector2()
            },
            u_mouse: {
                type: 'v2',
                value: new THREE.Vector2()
            }
        }

        this.shaderMaterial = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        })

        this.mesh = new THREE.Mesh(
            new THREE.CubeGeometry(8, 8, 8),
            this.material
        )
        this.scene.add(this.mesh)


        /**
         * Controler
         */
        this.controllerProps = {
            deltaDevider: 8,
            zoom: {
                min: 15,
                max: 50,
            },
            azimuth: {
                min: -Infinity,
                max: Infinity
            },
            polar: {
                min: 0,
                max: Math.PI
            },
            rotateSpeed: 0.8,
            damping: 1,
        }

        this.start = Date.now()
        this.clock = new THREE.Clock()
        this.delta = this.clock.getDelta()
        this.controller = null
        this.initControler()

        setTimeout( () => this.rotateCamera(this.controller, 1, 2), 2000)

        /**
         * Events & Animation
         */
        window.addEventListener('resize', () => this.resize())

        document.addEventListener('mousemove', (_e) => {
            this.uniforms.u_mouse.value.x = _e.clientX
            this.uniforms.u_mouse.value.y = _e.clientY
        })

        document.addEventListener('keydown', (_e) => {
            if(_e.keyCode === 38) { this.truckCamera(this.controller, 0, 10) }
            else if (_e.keyCode === 40) { this.truckCamera(this.controller, 0, -10) }
            else if (_e.keyCode === 37) { this.truckCamera(this.controller, 10, 0) }
            else if (_e.keyCode === 39) { this.truckCamera(this.controller, -10, 0) }
        })

        this.loop = this.loop.bind(this)
        this.loop()
    }

    /**
     * Animations
     */
    rotateCamera(_camera, _azimuth, _polar) {
        _camera.rotate(
            _azimuth++,
            _polar++,
            true
        )
    }

    truckCamera(_camera, _x, _y) {
        _camera.truck(_x, _y, true)
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

        // Update Shader
        this.uniforms.value.x = this.containerSize.width
        this.uniforms.value.y = this.containerSize.height
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
        this.controller =  new CameraControls(this.camera, this.renderer.domElement)

        this.controller.dollyTo(20, true)

        this.controller.minDistance = this.controllerProps.zoom.min
        this.controller.maxDistance = this.controllerProps.zoom.max
        this.controller.dampingFactor = this.controllerProps.damping
        this.controller.azimuthRotateSpeed = this.controllerProps.rotateSpeed

        this.controller.enableDamping = true
        this.controller.enablePan = false
    }

    /**
     * Animate
     */
    update() {
        this.delta = this.clock.getDelta()
        this.uniforms.u_time.value = this.clock.elapsedTime
        this.controller.update(this.delta / this.controllerProps.deltaDevider)
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