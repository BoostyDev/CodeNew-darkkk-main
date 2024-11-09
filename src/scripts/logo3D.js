import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import * as THREE from 'three';

document.addEventListener('astro:page-load', () => {
	const scene = new THREE.Scene();
	const container = document.getElementById('logo3d');

	const aspectRatio = container.clientWidth / container.clientHeight;
	const frustumSize = 10;

	const camera = new THREE.OrthographicCamera(
		(frustumSize * aspectRatio) / -2,
		(frustumSize * aspectRatio) / 2,
		frustumSize / 2,
		frustumSize / -2,
		0.1,
		1000
	);

	camera.position.set(0, 0, 20);
	camera.lookAt(0, 0, 0);

	window.addEventListener('resize', () => {
		const newAspectRatio = container.clientWidth / container.clientHeight;
		camera.left = (frustumSize * newAspectRatio) / -2;
		camera.right = (frustumSize * newAspectRatio) / 2;
		camera.top = frustumSize / 2;
		camera.bottom = frustumSize / -2;
		camera.updateProjectionMatrix();

		renderer.setSize(container.clientWidth, container.clientHeight);
	});

	let logo, logoBackground;
	const loader = new OBJLoader();

	// Cargar el modelo principal
	loader.load(
		'/logo.obj',
		(obj) => {
			logo = obj;

			// Crear un gradiente de tres colores
			const geometry = logo.children[0].geometry;
			const colors = [];

			// Definir los tres colores
			const colorLightBlue = new THREE.Color(0x919ED3);  // Azul cielo claro
			const colorMediumBlue = new THREE.Color(0xBAEBEE0); // Azul acero medio
			const colorDarkBlue = new THREE.Color(0xB8B3DC);   // Azul oscuro

			// Aplicar gradiente en los vértices usando tres colores
			for (let i = 0; i < geometry.attributes.position.count; i++) {
				const t = i / geometry.attributes.position.count; // Factor de interpolación

				// Decidir qué tramo del gradiente usar (de azul claro a medio, o de medio a oscuro)
				let color;
				if (t < 0.5) {
					// Interpolar entre azul claro y azul medio
					const normalizedT = t / 0.5;
					color = colorLightBlue.clone().lerp(colorMediumBlue, normalizedT);
				} else {
					// Interpolar entre azul medio y azul oscuro
					const normalizedT = (t - 0.5) / 0.5;
					color = colorMediumBlue.clone().lerp(colorDarkBlue, normalizedT);
				}

				colors.push(color.r, color.g, color.b);
			}

			// Asignar colores a los vértices
			geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

			// Material que usa vertex colors
			const vertexMaterial = new THREE.MeshStandardMaterial({
				vertexColors: true, // Permitir vertex colors
				metalness: 0.6,
				roughness: 0.3,
			});

			logo.traverse((child) => {
				if (child.isMesh) {
					child.material = vertexMaterial;
				}
			});

			logo.scale.set(15, 15, 15);

			// Inclinación solo para el primer logo
			logo.rotation.x = Math.PI / 8; // Ajustar inclinación inicial
			logo.rotation.z = 0.1;

			scene.add(logo);

			// Cargar el segundo modelo detrás del principal
			loader.load(
				'/logo.obj', // Se puede usar el mismo archivo OBJ
				(largeObj) => {
					logoBackground = largeObj;

					// Material transparente para el fondo
					const transparentMaterial = new THREE.MeshStandardMaterial({
						color: 0xc4c4c4,
						metalness: 0.2,
						roughness: 0.8,
						transparent: true,
						opacity: 0.2, // Ajusta la transparencia
					});

					logoBackground.traverse((child) => {
						if (child.isMesh) {
							child.material = transparentMaterial;
						}
					});

					// Escalar el segundo modelo para que sea más grande
					logoBackground.scale.set(40, 35, 40); // Más grande que el primero

					// Dejar el segundo logo sin inclinación
					// (No se modifica logoBackground.rotation.x ni logoBackground.rotation.z)

					scene.add(logoBackground);
				}
			);
		},
		(xhr) => {
			console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
			document.querySelector('#logo-loader')?.remove();
		},
		(err) => console.error('An error happened')
	);

	const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.setSize(container.clientWidth - 20, container.clientHeight);
	document.querySelector('#logo3d').appendChild(renderer.domElement);

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.enableZoom = false;
	controls.minPolarAngle = Math.PI / 2;
	controls.maxPolarAngle = Math.PI / 2;

	const ambientLight = new THREE.AmbientLight(0xffffff, 4);
	scene.add(ambientLight);

	const pointLight = new THREE.PointLight(0xffffff, 10, 70);
	pointLight.position.set(5, 5, 0);
	scene.add(pointLight);

	const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
	directionalLight.position.set(0, 7, 9);
	scene.add(directionalLight);

	const directionalLight2 = new THREE.DirectionalLight(0xffffff, 3);
	directionalLight2.position.set(0, 7, -9);
	scene.add(directionalLight2);

	let rotationSpeed = 0.0030;
	let fastRotationSpeed = 0.0080; // Velocidad rápida
	let halfwayRotation = false;

	function animate() {
		const rotationThreshold = Math.PI; // 180 grados

		renderer.render(scene, camera);

		if (logo && logoBackground) {
			if (!halfwayRotation && logo.rotation.y >= rotationThreshold) {
				// Cambiar a rotación rápida al alcanzar la mitad (180 grados)
				halfwayRotation = true;
			} else if (halfwayRotation && logo.rotation.y >= rotationThreshold * 2) {
				// Volver a la rotación lenta al completar la vuelta completa (360 grados)
				halfwayRotation = false;
				logo.rotation.y = 0; // Reiniciar la rotación para que no siga acumulando
				logoBackground.rotation.y = 0; // También reinicia la rotación del fondo
			}

			// Ajustar la velocidad de rotación
			const currentSpeed = halfwayRotation ? fastRotationSpeed : rotationSpeed;

			logo.rotation.y += currentSpeed;
			logoBackground.rotation.y += currentSpeed;
		}

		controls.update();
	}

	renderer.setAnimationLoop(animate);
});
