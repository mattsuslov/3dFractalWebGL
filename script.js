class Complex3d {
	constructor(x, y, z) {
	    this.x = x;
	    this.y = y;
	    this.z = z;
  	}

  	length_sq() {
  		return this.x**2 + this.y**2 + this.z**2;
  	}

  	length() {
  		return Math.sqrt(this.length_sq());
  	}

  	static mult(a, b) {
  		return new Complex3d(a.x * b.x - a.y * b.y - a.z * b.z,
  			a.y * b.x + a.x * b.y, a.y * b.z + a.x * b.z);
  	}

  	static add(a, b) {
  		return new Complex3d(a.x + b.x, a.y + b.y, a.z + b.z);
  	}
}

function isFrac2d(_complex, iters) {
	var z = math.complex(-0.74543, 0.11301);
	for (let i = 0; i < iters; i++) {
		if (math.re(_complex)**2 + math.im(_complex)**2 > 4) {
			return false;
		}
		_complex = math.add(math.multiply(_complex, _complex), z);
	}
	return math.re(_complex)**2 + math.im(_complex)**2 < 4;
}


function isFrac3d(_complex, iters) {
	var z = new Complex3d(-0.74543, 0.11301, 0.11301);
	for (let i = 0; i < iters; i++) {
		if (_complex.length_sq() > 4) {
			return false;
		}
		_complex = Complex3d.add(Complex3d.mult(_complex, _complex), z);
	}
	return _complex.length_sq() < 4;
}



function generatePointCloudGeometry( color, width, height, depth) {
	const geometry = new THREE.BufferGeometry();
	const numPoints = width * height * depth;

	const positions = new Float32Array( numPoints * 3 );
	const colors = new Float32Array( numPoints * 3 );

	let index = 0;

	for (let i = 0; i < width; i++) {
		for (let j = 0; j < height; j++) {
			for (let k = 0; k < depth; k++) {
				const x = i / width - 0.5;
				const y = j / height - 0.5;
				const z = k / depth - 0.5;


				positions[ 3 * index ] = x * 2;
				positions[ 3 * index + 1 ] = y;
				positions[ 3 * index + 2 ] = z;

				var a = new Complex3d(x * 3, y * 3, z * 3);

				const intensity = isFrac3d(a, 50);
				colors[ 3 * index ] = color.r * intensity;
				colors[ 3 * index + 1 ] = color.g * intensity;
				colors[ 3 * index + 2 ] = color.b * intensity;

				index++;
			}			
		}
	}

	geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
	geometry.computeBoundingBox();

	return geometry;

}


function generatePointcloud( color, width, height, depth) {

	const geometry = generatePointCloudGeometry( color, width, height,  depth);
	const material = new THREE.PointsMaterial( { size: 0.05, vertexColors: true } );

	const shaderMaterial = new THREE.ShaderMaterial( {

		uniforms: uniforms,
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
	} );


	return new THREE.Points( geometry, material );

}

window.onload = function() {
	var width = window.innerWidth;
	var height = window.innerHeight;
	var canvas = document.getElementById("canvas");

	canvas.setAttribute('width', width);
	canvas.setAttribute('height', height);

	var ball = {
		rotationY: 0.0,
		rotationX: 0.0,
		rotationZ: 0.0,
		beginX: -0.74543,
		beginY: 0.11301,
		beginZ: 0.11301,
		lightX: 0.8,
		lightY: 0.8,
		lightZ: 0.8
	};

	var gui = new dat.GUI();
	gui.add(ball, 'rotationX').min(-Math.PI).max(Math.PI).step(0.001);
	gui.add(ball, 'rotationY').min(-Math.PI).max(Math.PI).step(0.001);
	gui.add(ball, 'rotationZ').min(-Math.PI).max(Math.PI).step(0.001);
	gui.add(ball, 'beginX').min(-1).max(1).step(0.001);
	gui.add(ball, 'beginY').min(-1).max(1).step(0.001);
	gui.add(ball, 'beginZ').min(-1).max(1).step(0.001);
	gui.add(ball, 'lightX').min(-1).max(1).step(0.001);
	gui.add(ball, 'lightY').min(-1).max(1).step(0.001);
	gui.add(ball, 'lightZ').min(-1).max(1).step(0.001);

	var renderer = new THREE.WebGLRenderer({canvas: canvas})
	renderer.setClearColor(0x000000)

	var scene = new THREE.Scene();

	var camera = new THREE.PerspectiveCamera(60, width/height, 0.1, 5000);

	var light = new THREE.AmbientLight(0xffffff);
	scene.add(light);

	camera.position.set(0, 0, 1);

	const geometry = new THREE.PlaneGeometry( width, height );

	
	
	const plane = new THREE.Mesh( geometry );
	scene.add( plane );

	// const pcBuffer = generatePointcloud( new THREE.Color( 1, 0, 0 ), 30, 30, 30);
	// pcBuffer.scale.set( 5, 10, 10 );
	// pcBuffer.position.set(0, 0, 0 );
	// scene.add( pcBuffer );

	function loop() {
		var seconds = new Date().getTime() % 1000000 / 1000;
		

		const material = new THREE.ShaderMaterial( {
			uniforms: {
				time: { value: seconds },
				width: { value: width},
				height: { value: height },
				angle: { value: [ball.rotationX, ball.rotationY, ball.rotationZ] },
				begin: { value: [ball.beginX, ball.beginY, ball.beginZ]},
				// begin: { value: [0,0,0]},
				light: { value: [ball.lightX, ball.lightY, ball.lightZ]}
			},
			vertexShader: document.getElementById("vertexShader").textContent,
			fragmentShader: document.getElementById("fragmentShader").textContent
		} );
		plane.material = material;

		// plane.rotation.set(ball.rotationX, ball.rotationY, ball.rotationZ);
		renderer.render(scene, camera);	
		requestAnimationFrame(function(){loop();});
	}

	loop();
}

// 