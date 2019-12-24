import React from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import bvTable from '../data/bvTable';

const client = new W3CWebSocket('ws://localhost:3001/data');

class StarMap extends React.Component {
    constructor(props) {
        super(props);
        this.controlsOn = true;
        this.scale = 1000;
        this.POINT_LIMIT = 10000;
        this.minimumDistance = 0.1;
        this.starsLoaded = 0;
        this.magnitudeAdjust = 0.5;
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

        this.camera.position.z = this.minimumDistance;
        this.scene.add(this.stars);
        this.canvasRef.current.appendChild(this.renderer.domElement);

        if(!this.props.disableControls) {
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        }

        this.onWindowResize();
        this.animate();
    }

    //Convert polar coordinates, ra dec plx to euclidean x y z
    convertCoords(ra, dec, plx) {

    }

    bvLookup(bv) {
        const length = bvTable.bv.length;
        if(bv >= bvTable.max) {
            return bvTable.bv[length - 1];
        } else if(bv <= bvTable.min) {
            return bvTable.bv[0]
        } else {
            const index = Math.floor(bv / bvTable.step);
            let result = bvTable.bv[index];
            return result;
        }
    }

    distance(x, y, z) {
        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
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
                    const star = JSON.parse(message.data);
                    if(star.B_V && this.distance(star.x, star.y, star.z) > this.minimumDistance) {
                        this.addStar(star);
                    } else {
                        // console.log(star._id)
                    }
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
                    B_V: Math.random() * 5,
                    Hpmag: 1
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
        let rgb = this.bvLookup(parseFloat(star.B_V));
        try {
            color.setRGB(rgb[0] / 255.0, rgb[1] / 255.0, rgb[2] / 255.0);
        } catch {
            debugger;
        }
        color.toArray(this.colors, index * 3);

        //I'm assuming Hpmag is apparent mag and convert it to absolute mag
        this.magnitudes[this.starsLoaded] = star.Hpmag * this.magnitudeAdjust;

        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.customColor.needsUpdate = true;
        this.geometry.attributes.scale.needsUpdate = true;
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