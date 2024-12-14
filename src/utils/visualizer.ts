import * as THREE from 'three';

export function initVisualizer(canvas: HTMLCanvasElement, analyzer: AnalyserNode) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  
  renderer.setSize(canvas.width, canvas.height);
  camera.position.z = 5;

  // Create particles
  const particleGeometry = new THREE.BufferGeometry();
  const particleCount = 128;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

    colors[i * 3] = Math.random();
    colors[i * 3 + 1] = Math.random();
    colors[i * 3 + 2] = Math.random();
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  // Animation
  function animate() {
    requestAnimationFrame(animate);

    const dataArray = new Uint8Array(analyzer.frequencyBinCount);
    analyzer.getByteFrequencyData(dataArray);

    const positions = particles.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const amplitude = dataArray[i] / 255;
      const idx = i * 3;

      positions[idx + 1] = amplitude * 5 * Math.sin(i);
      positions[idx] = amplitude * 5 * Math.cos(i);
    }

    particles.geometry.attributes.position.needsUpdate = true;
    particles.rotation.y += 0.002;

    renderer.render(scene, camera);
  }

  // Handle resize
  function handleResize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height, false);
  }

  window.addEventListener('resize', handleResize);
  handleResize();
  animate();
}