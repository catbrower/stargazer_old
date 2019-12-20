import React from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";
const THREE = require('three');
require('three-orbit-controls')(THREE);

const client = new W3CWebSocket('ws://localhost:3001/data');

class StarMap extends React.Component {
    constructor(props) {
        super(props);
        this.controlsOn = true;
        this.scale = 100;
        this.POINT_LIMIT = 100000;
        this.starsLoaded = 0;
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
            vertexShader:   document.getElementById('vertexshader').textContent,
            fragmentShader: document.getElementById('fragmentshader').textContent,
            blending:       THREE.AdditiveBlending,
            depthTest:      false,
            transparent:    true
        });

        this.stars = new THREE.Points(this.geometry, material);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        //Controls


        this.camera.position.z = 5;
        this.scene.add(this.stars);
        this.canvasRef.current.appendChild(this.renderer.domElement);

        this.onWindowResize();
        this.animate();
    }

    componentDidMount() {
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

        this.magnitudes[this.starsLoaded] = star.Hpmag;
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.customColor.needsUpdate = true;
        this.geometry.setDrawRange(0, ++this.starsLoaded);
    }

    animate = () => {
        requestAnimationFrame(this.animate);
	    this.renderer.render(this.scene, this.camera);
    }

    render() {
        return (
            <div ref={this.canvasRef}></div>
        );
    }
}

export default StarMap;