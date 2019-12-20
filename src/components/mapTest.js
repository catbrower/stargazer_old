import React from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";
const THREE = require('three');

const client = new W3CWebSocket('ws://localhost:3001/data');

class StarMapTest extends React.Component {
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
        this.controlsOn = true;
        this.scale = 100;
        this.data = [];
        this.POINT_LIMIT = 10000;
        this.starsLoaded = 0;

        //Star system geometry stuff
        this.positions = new Float32Array(this.POINT_LIMIT * 3);
        this.colors = new Float32Array(this.POINT_LIMIT * 3);
        this.magnitudes = new Float32Array(this.POINT_LIMIT);
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.star_system_geo = new THREE.BufferGeometry();

        for(let i = 0; i < this.magnitudes.length; i++) {
            this.magnitudes[i] = 5;
        }
        this.star_system_geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        // this.star_system_geo.setAttribute('customColor', new THREE.BufferAttribute(this.colors, 3));
        this.star_system_geo.setAttribute('scale', new THREE.BufferAttribute(this.magnitudes, 1));
        // this.star_system_geo.setDrawRange(0, this.starsLoaded);

        var material = new THREE.ShaderMaterial( {
            uniforms: {
                color: { value: new THREE.Color( 0xffffff ) },
            },
            vertexShader: document.getElementById( 'vertexshader' ).textContent,
            fragmentShader: document.getElementById( 'fragmentshader' ).textContent
        } );

        this.stars = new THREE.Points(this.star_system_geo, material);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        //I can't see anything, add a test cube
        let cubeGeometry = new THREE.BoxBufferGeometry();
        let cubeMaterial = new THREE.MeshBasicMaterial();
        let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

        this.camera.position.z = 10;
        this.scene.add(cube);
        this.scene.add(this.stars);
    }

    componentDidMount() {
        this.canvasRef.current.appendChild(this.renderer.domElement);

        client.onopen = () => {
            console.log('WebSocket cLient Connected');
        };

        client.onmessage = (message) => {
            if(this.starsLoaded < this.POINT_LIMIT) {
                // this.addStar(JSON.parse(message.data));
            }
        }

        this.animate();
    }

    addStar = (star) => {
        const index = this.starsLoaded * 3;
        this.positions[index] = star.x * this.scale;
        this.positions[index + 1] = star.y * this.scale;
        this.positions[index + 2] = star.z * this.scale;
        this.colors[index] = star.r;
        this.colors[index + 1] = star.g;
        this.colors[index + 2] = star.b;
        this.magnitudes[this.starsLoaded] = star.Hpmag;
        this.star_system_geo.setDrawRange(0, ++this.starsLoaded);
        // debugger;
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

export default StarMapTest;