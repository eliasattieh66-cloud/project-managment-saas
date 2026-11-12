import { useEffect, useRef } from "react";
import * as THREE from "three";

const CARD_COLORS = [0x4f46e5, 0x7c3aed, 0x0ea5e9];
const CARD_COUNT = 6;
const PARTICLE_COUNT = 1500;

function HeroScene() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Scene, camera, renderer
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(2, 4, 6);
    scene.add(keyLight);

    const indigoLight = new THREE.PointLight(0x6366f1, 40);
    indigoLight.position.set(-4, 3, 4);
    scene.add(indigoLight);

    const violetLight = new THREE.PointLight(0x8b5cf6, 40);
    violetLight.position.set(4, -2, 4);
    scene.add(violetLight);

    // Center: a solid gem inside a wireframe shell
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const gemGeometry = new THREE.IcosahedronGeometry(1.3, 0);
    const gemMaterial = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      metalness: 0.4,
      roughness: 0.25,
      flatShading: true,
    });
    coreGroup.add(new THREE.Mesh(gemGeometry, gemMaterial));

    const shellGeometry = new THREE.IcosahedronGeometry(2.2, 1);
    const shellMaterial = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const shell = new THREE.Mesh(shellGeometry, shellMaterial);
    coreGroup.add(shell);

    // Floating "task cards" orbiting the center
    const cardGeometry = new THREE.BoxGeometry(1.2, 0.75, 0.08);
    const cardMaterials = CARD_COLORS.map(
      (color) =>
        new THREE.MeshStandardMaterial({
          color,
          metalness: 0.3,
          roughness: 0.35,
        })
    );

    const cards = [];
    for (let i = 0; i < CARD_COUNT; i++) {
      const card = new THREE.Mesh(
        cardGeometry,
        cardMaterials[i % cardMaterials.length]
      );
      card.userData.angle = (i / CARD_COUNT) * Math.PI * 2;
      card.userData.radius = 3.6 + (i % 2) * 0.8;
      card.userData.offset = i;
      scene.add(card);
      cards.push(card);
    }

    // Background particles
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const radius = 6 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xa5b4fc,
      size: 0.04,
      transparent: true,
      opacity: 0.8,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Mouse parallax
    const mouse = { x: 0, y: 0 };

    function handleMouseMove(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (event.clientY / window.innerHeight) * 2 - 1;
    }

    window.addEventListener("mousemove", handleMouseMove);

    // Keep the canvas sized to its container
    const resizeObserver = new ResizeObserver(() => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.render(scene, camera);
    });
    resizeObserver.observe(container);

    // Only animate while the hero is on screen
    let isVisible = true;
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    intersectionObserver.observe(container);

    // Animation loop
    let frameId = null;
    const startTime = performance.now();

    function update(elapsed) {
      coreGroup.rotation.y = elapsed * 0.25;
      coreGroup.rotation.x = elapsed * 0.1;
      shell.rotation.y = -elapsed * 0.15;

      cards.forEach((card) => {
        const angle = card.userData.angle + elapsed * 0.15;
        card.position.x = Math.cos(angle) * card.userData.radius;
        card.position.z = Math.sin(angle) * card.userData.radius * 0.5;
        card.position.y = Math.sin(elapsed + card.userData.offset) * 0.6;
        card.rotation.y = elapsed * 0.4 + card.userData.offset;
        card.rotation.x = Math.sin(elapsed * 0.5 + card.userData.offset) * 0.3;
      });

      particles.rotation.y = elapsed * 0.02;

      camera.position.x += (mouse.x * 1.2 - camera.position.x) * 0.04;
      camera.position.y += (-mouse.y * 0.8 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);
    }

    function animate() {
      frameId = requestAnimationFrame(animate);

      if (!isVisible) {
        return;
      }

      const elapsed = (performance.now() - startTime) / 1000;
      update(elapsed);
      renderer.render(scene, camera);
    }

    if (reducedMotion) {
      update(0);
      renderer.render(scene, camera);
    } else {
      animate();
    }

    // Cleanup when the component leaves the page
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      gemGeometry.dispose();
      gemMaterial.dispose();
      shellGeometry.dispose();
      shellMaterial.dispose();
      cardGeometry.dispose();
      cardMaterials.forEach((material) => material.dispose());
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();

      container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}

export default HeroScene;
