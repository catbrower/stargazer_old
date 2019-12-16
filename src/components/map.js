import React from 'react';
import THREE from 'three';


class StarMap extends React.Component {
    constructor() {
        let controlsOn = true;
        let scale = 100;
        let pageSize = 1000;
        let data = [];
        let star_system;
        let loaded, loadedTotal, created, createdTotal;
        let scene = new THREE.Scene();
        let camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    }

    constructStars = (res, size) => {
        let amount = res.data[res.data.length - 1].id;
        let positions = new Float32Array(amount * 3);
        let colors = new Float32Array(amount * 3);
        let sizes = new Float32Array(amount);
        let magnitudes = new Float32Array(amount);

        let vertex = new THREE.Vector3();
        let color = new THREE.Color(0xffffff);

        for (let i = 0; i < amount; i++) {
            vertex.x = 0;
            vertex.y = 0;
            vertex.z = 0;
            color.setRGB(0 ,0 ,0);
            magnitudes[i] = 0;
            sizes[i] = 0;
            vertex.toArray(positions, i * 3);
            color.toArray(colors, i * 3);
        }

        for(let i = 0; i < res.data.length; i++) {
            let star = res.data[i];
            vertex.x = star.x * scale;
            vertex.y = star.y * scale;
            vertex.z = star.z * scale;
            color.setRGB(star.r / 255.0, star.g / 255.0, star.b / 255.0);
            magnitudes[i] = star.Hpmag;
            sizes[i] = 0.2;

            vertex.toArray(positions, star.id * 3);
            color.toArray(colors, star.id * 3);
        }

        let star_system_geo = new THREE.BufferGeometry();
        star_system_geo.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        star_system_geo.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
        star_system_geo.addAttribute('size', new THREE.BufferAttribute(sizes, 1));
        star_system_geo.addAttribute('magnitude', new THREE.BufferAttribute(magnitudes, 1));

        let material = new THREE.ShaderMaterial({
            uniforms: {
                amplitude: {value: 1.0},
                color:     {value: new THREE.Color(0xffffff)},
                texture:   {value: new THREE.TextureLoader().load("img/lensflare3.png")}
            },
            vertexShader:   document.getElementById('vertexshader').textContent,
            fragmentShader: document.getElementById('fragmentshader').textContent,
            blending:       THREE.AdditiveBlending,
            depthTest:      false,
            transparent:    true
        });

        star_system = new THREE.Points(star_system_geo, material);

        $scope.creatingDone = true;
        return star_system;
    }

    render() {
        return (
            <div>

            </div>
        );
    }
}