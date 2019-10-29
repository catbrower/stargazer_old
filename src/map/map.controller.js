(() => {
    'use strict';

    let THREE = require('three');
    let FlyControls = require('three-fly-controls');
    let OrbitControls = require('three-orbit-controls');

    angular
        .module('StarGazer')
        .controller('MapController', ['$scope', '$http', MapController]);

    function MapController($scope, $http) {
        var controlsOn = true;
        var scale = 100;
        var pageSize = 1000;
        var data = [];
        var star_system;
        var loaded, loadedTotal, created, createdTotal;
        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

        $scope.loadingDone = false;
        $scope.creatingDone = false;
        $scope.constellationNames = ['Orion', 'Gemini'];
        $scope.constellations = {};

        $scope.getLoaded = function() {
            return Math.round(loaded / loadedTotal * 100);
        };

        $scope.getCreated = function() {
            return Math.round(created / createdTotal * 100);
        };

        $scope.showConstellation = function(name) {
            var constellation = $scope.constellations[name];

            if(!constellation.visible) {
                constellation.visible = true;
                scene.add(constellation.data);
            } else {
                constellation.visible = false;
                scene.remove(scene.getObjectByName(name));
            }
        };

        $scope.returnToEarth = function() {
            camera.position.set(0,0,0);
        };

        var sceneLoaded = function() {
            $scope.loadingDone = true;
            //$("#canvas").css({'display': "block"});

            scene.add(constructStars({data: data}, 0.0015));

            loadScene();

            var thing = function(index) {
                if(index < $scope.constellationNames.length) {
                    getConstellation($scope.constellationNames[index], function() {thing(index + 1)});
                }
            };

            thing(0);

        };

        var constructStars = function(res, size) {
            var amount = res.data[res.data.length - 1].id;
            var positions = new Float32Array(amount * 3);
            var colors = new Float32Array(amount * 3);
            var sizes = new Float32Array(amount);
            var magnitudes = new Float32Array(amount);

            var vertex = new THREE.Vector3();
            var color = new THREE.Color(0xffffff);

            for (var i = 0; i < amount; i++) {
                vertex.x = 0;
                vertex.y = 0;
                vertex.z = 0;
                color.setRGB(0 ,0 ,0);
                magnitudes[i] = 0;
                sizes[i] = 0;
                vertex.toArray(positions, i * 3);
                color.toArray(colors, i * 3);
            }

            for(var i = 0; i < res.data.length; i++) {
                var star = res.data[i];
                vertex.x = star.x * scale;
                vertex.y = star.y * scale;
                vertex.z = star.z * scale;
                color.setRGB(star.r / 255.0, star.g / 255.0, star.b / 255.0);
                magnitudes[i] = star.Hpmag;
                sizes[i] = 0.2;

                vertex.toArray(positions, star.id * 3);
                color.toArray(colors, star.id * 3);
            }

            var star_system_geo = new THREE.BufferGeometry();
            star_system_geo.addAttribute('position', new THREE.BufferAttribute(positions, 3));
            star_system_geo.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
            star_system_geo.addAttribute('size', new THREE.BufferAttribute(sizes, 1));
            star_system_geo.addAttribute('magnitude', new THREE.BufferAttribute(magnitudes, 1));

            var material = new THREE.ShaderMaterial( {
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
        var getStar = function(cur, max) {
            $http.get("http://localhost:3000/api/get_hip/" + pageSize + "/" + cur).then(
                function success(res) {
                    data = data.concat(res.data);
                    loaded = data.length;

                    if(cur < max) {
                        getStar(cur += 1, max);
                    } else {
                        sceneLoaded();
                    }
                }, function fail(res) {
                    console.log(res);
                }
            );
        };

        var getConstellation = function(name, cb) {
            $http.get("http://localhost:3000api/constellation/" + name).then(
                function success(res) {
                    var geometry = new THREE.Geometry();
                    var material = new THREE.LineBasicMaterial({color: 0xff00ff});

                    var pos = star_system.geometry.attributes.position.array;
                    res.data.forEach(function(item) {
                        var i = parseInt(item.starA);
                        var j = parseInt(item.starB);
                        var a = {x: pos[i*3], y: pos[i*3 + 1], z: pos[i*3 + 2]};
                        var b = {x: pos[j*3], y: pos[j*3 + 1], z: pos[j*3 + 2]};

                        geometry.vertices.push(
                            new THREE.Vector3(a.x, a.y, a.z),
                            new THREE.Vector3(b.x, b.y, b.z)
                        );
                    });

                    var line = new THREE.LineSegments(geometry, material);
                    line.name = name;
                    $scope.constellations[name] = {name: name, visible: false, data: line};

                    if(cb) {
                        cb();
                    }
                }, function fail(res) {
                    console.log(res);
                }
            )
        };

        var loadScene = function() {
            var renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
            renderer.setClearColor (0x000000, 1);
            renderer.setSize( window.innerWidth, window.innerHeight );
            document.body.appendChild( renderer.domElement );

            // controls
            window.controls = new FlyControls( camera );
            window.controls.movementSpeed = 1000;
            window.controls.domElement = renderer.domElement;
            window.controls.rollSpeed = Math.PI / 10;
            window.controls.autoForward = false;
            window.controls.dragToLook = false;

            var clock = new THREE.Clock();
            var render = function () {
                requestAnimationFrame( render );

                var delta = clock.getDelta();

                if(controlsOn) {
                    window.controls.movementSpeed = 0.33 * scale;
                    window.controls.update(delta);
                }

                var time = Date.now() * 0.005;

                var geometry = star_system.geometry;
                var attributes = geometry.attributes;

                for (var i = 0; i < attributes.size.array.length; i++) {
                    var mag = attributes.magnitude.array[i];
                    var v = (mag * Math.sin(0.1 * i + time) / 100.0);
                    //attributes.size.array[i] = Math.pow(0 - mag, 10)  / 1000000000.0;
                    attributes.size.array[i] = (mag * Math.sin(0.1 * i + time)) / 10;
                }

                attributes.size.needsUpdate = true;

                renderer.render(scene, camera);
            };

            render();
        };

        $http.get("http://localhost:3000/api/hip_count").then(
            function success(res) {
                loadedTotal = res.data;
                getStar(1, res.data / pageSize);
            }, function fail(res) {
                $scope.count = res;
            }
        );
    }

})();
