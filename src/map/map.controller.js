(() => {
    'use strict';

    let THREE = require('three');
    require('three-fly-controls')(THREE);
    require('three-orbit-controls')(THREE);

    angular
        .module('StarGazer')
        .controller('MapController', ['$scope', '$http', MapController]);

    function MapController($scope, $http) {
        let controlsOn = true;
        let scale = 100;
        let pageSize = 1000;
        let data = [];
        let star_system;
        let loaded, loadedTotal, created, createdTotal;
        let scene = new THREE.Scene();
        let camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

        $scope.loadingDone = false;
        $scope.creatingDone = false;
        $scope.constellationNames = ['Orion', 'Gemini'];
        $scope.constellations = {};

        $scope.getLoaded = () => {
            return Math.round(loaded / loadedTotal * 100);
        };

        $scope.getCreated = () => {
            return Math.round(created / createdTotal * 100);
        };

        $scope.showConstellation = (name) => {
            let constellation = $scope.constellations[name];

            if(!constellation.visible) {
                constellation.visible = true;
                scene.add(constellation.data);
            } else {
                constellation.visible = false;
                scene.remove(scene.getObjectByName(name));
            }
        };

        $scope.returnToEarth = () => {
            camera.position.set(0,0,0);
        };

        let sceneLoaded = () => {
            $scope.loadingDone = true;

            scene.add(constructStars({data: data}, 0.0015));

            loadScene();

            let thing = (index) => {
                if(index < $scope.constellationNames.length) {
                    getConstellation($scope.constellationNames[index], () => {thing(index + 1)});
                }
            };

            thing(0);

        };

        let constructStars = (res, size) => {
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
        };

        //Asynxchronously load star data in chunks
        let getStar = (cur, max) => {
            $http.get("http://localhost:3000/api/get_hip/" + pageSize + "/" + cur).then(
                (res) => {
                    data = data.concat(res.data);
                    loaded = data.length;

                    if(cur < max) {
                        getStar(cur += 1, max);
                    } else {
                        sceneLoaded();
                    }
                }, (res) => {
                    console.error(res);
                }
            );
        };

        let loadScene = () => {
            let renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
            renderer.setClearColor (0x000000, 1);
            renderer.setSize( window.innerWidth, window.innerHeight );
            document.body.appendChild( renderer.domElement );

            // controls
            THREE.FlyControls(camera, renderer.domElement);
            // THREE.OrbitControls(cameraObject, domElement);
            // window.controls = new FlyControls(camera);
            // window.controls.movementSpeed = 1000;
            // window.controls.domElement = renderer.domElement;
            // window.controls.rollSpeed = Math.PI / 10;
            // window.controls.autoForward = false;
            // window.controls.dragToLook = false;

            let clock = new THREE.Clock();
            let render = function () {
                requestAnimationFrame( render );

                let delta = clock.getDelta();

                if(controlsOn) {
                    // window.controls.movementSpeed = 0.33 * scale;
                    // window.controls.update(delta);
                }

                let time = Date.now() * 0.005;

                let geometry = star_system.geometry;
                let attributes = geometry.attributes;

                for (let i = 0; i < attributes.size.array.length; i++) {
                    let mag = attributes.magnitude.array[i];
                    let v = (mag * Math.sin(0.1 * i + time) / 100.0);
                    //attributes.size.array[i] = Math.pow(0 - mag, 10)  / 1000000000.0;
                    attributes.size.array[i] = (mag * Math.sin(0.1 * i + time)) / 10;
                }

                attributes.size.needsUpdate = true;

                renderer.render(scene, camera);
            };

            render();
        };

        $http.get("http://localhost:3000/api/hip_count").then(
            (res) => {
                loadedTotal = res.data;
                getStar(1, res.data / pageSize);
            }, (res) => {
                $scope.count = res;
            }
        );
    }

})();
