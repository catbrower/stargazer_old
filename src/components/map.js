import React from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
require('three-orbit-controls')(THREE);

const client = new W3CWebSocket('ws://localhost:3001/data');

class StarMap extends React.Component {
    constructor(props) {
        super(props);
        this.controlsOn = true;
        this.scale = 100;
        this.POINT_LIMIT = 100000;
        this.starsLoaded = 0;
        this.magnitudeAdjust = 1.25;
        this.canvasRef = React.createRef();
    }

    initGeometry() {
        //Star system geometry stuff
        this.positions = new Float32Array(this.POINT_LIMIT * 3);
        this.colors = new Float32Array(this.POINT_LIMIT * 3);
        this.magnitudes = new Float32Array(this.POINT_LIMIT);
        this.renderer = new THREE.WebGLRenderer({antialias: false});
        this.geometry = new THREE.BufferGeometry();

        window.addEventListener('resize', this.onWindowResize, false);

        for(let i = 0; i < this.magnitudes.length; i++) {
            this.magnitudes[i] = 0.1;
        }
        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        this.geometry.setAttribute('customColor', new THREE.BufferAttribute(this.colors, 3));
        this.geometry.setAttribute('scale', new THREE.BufferAttribute(this.magnitudes, 1));
        this.geometry.setDrawRange(0, this.starsLoaded);

        let material = new THREE.ShaderMaterial({
            uniforms: {
                color:     {value: new THREE.Color(0xffffff)},
                texture:   {value: new THREE.TextureLoader().load("lensflare3.png")}
            },
            vertexShader:   document.getElementById('star_vertex_shader').textContent,
            fragmentShader: document.getElementById('star_fragment_shader').textContent,
            blending:       THREE.AdditiveBlending,
            depthTest:      false,
            transparent:    true
        });

        this.stars = new THREE.Points(this.geometry, material);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.camera.position.z = 5;
        this.scene.add(this.stars);
        this.canvasRef.current.appendChild(this.renderer.domElement);

        if(!this.props.disableControls) {
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        }

        this.onWindowResize();
        this.animate();
    }

    getDataFromBackend() {
        fetch('http://localhost:3001/api/hip_count').then(results => {
            return results.json();
        }).then(data => {
            this.POINT_LIMIT = data;
            this.initGeometry();

            client.onopen = () => {
                console.log('WebSocket Client Connected');
            };
    
            client.onmessage = (message) => {
                if(this.starsLoaded < this.POINT_LIMIT) {
                    this.addStar(JSON.parse(message.data));
                }
            }
        });
    }

    componentDidMount() {
        if(this.props.useRandomData) {
            this.initGeometry();

            for(let i = 0; i < this.POINT_LIMIT; i++) {
                this.addStar({
                    x: (Math.random() - 0.5) / 10,
                    y: (Math.random() - 0.5) / 10,
                    z: (Math.random() - 0.5) / 10,
                    r: 255,
                    g: 255,
                    b: 255,
                    Hpmag: 10
                });
            }
        } else {
            this.getDataFromBackend();
        }
    }

    onWindowResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    addStar = (star) => {
        const index = this.starsLoaded * 3;
        this.positions[index] = star.x * this.scale;
        this.positions[index + 1] = star.y * this.scale;
        this.positions[index + 2] = star.z * this.scale;

        let color = new THREE.Color(0xffffff);
        color.setRGB(star.r / 255.0, star.g / 255.0, star.b / 255.0);
        color.toArray(this.colors, index * 3);

        //I'm assuming Hpmag is apparent mag and convert it to absolute mag
        this.magnitudes[this.starsLoaded] = this.magnitudeAdjust * (star.Hpmag - 5 * Math.log(star.Plx))

        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.customColor.needsUpdate = true;
        this.geometry.setDrawRange(0, ++this.starsLoaded);
    }

    animate = () => {
        requestAnimationFrame(this.animate);

        if(!this.props.disableControls) {
            this.controls.update();
        }
        
	    this.renderer.render(this.scene, this.camera);
    }

    render() {
        return (
            <div ref={this.canvasRef}></div>
        );
    }
}

export default StarMap;