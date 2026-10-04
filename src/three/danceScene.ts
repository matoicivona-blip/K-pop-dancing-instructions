import * as THREE from 'three';
import { CharacterRig, createFemaleDancerModel } from './characterModel';
import { CHOREOGRAPHY_STEPS, READY_POSE, interpolatePoses } from './dancePoses';

export type CameraPreset = 'stage_9_16' | 'front' | 'three_quarter' | 'profile';

export interface DanceSceneController {
  canvas: HTMLCanvasElement;
  dancer: CharacterRig;
  partnerDancer?: CharacterRig;
  setCameraPreset: (preset: CameraPreset) => void;
  setMirrorMode: (mirror: boolean) => void;
  setPartnerDuoMode: (enabled: boolean) => void;
  setPlaybackTime: (timeSeconds: number) => void;
  updateAnimation: (delta: number) => void;
  resize: (width: number, height: number) => void;
  dispose: () => void;
  enableManualOrbit: (enabled: boolean) => void;
}

export function initDanceStudioScene(
  container: HTMLDivElement,
  onContextLost?: () => void,
  onContextRestored?: () => void
): DanceSceneController {
  const width = container.clientWidth || 800;
  const height = container.clientHeight || 600;

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0e0e15);
  scene.fog = new THREE.FogExp2(0x0e0e15, 0.08);

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
    alpha: false,
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const canvas = renderer.domElement;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  canvas.style.touchAction = 'none';
  container.appendChild(canvas);

  // Camera
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);

  // Camera presets
  const CAMERA_PRESETS: Record<CameraPreset, { pos: THREE.Vector3; target: THREE.Vector3; fov: number }> = {
    stage_9_16: {
      // Perfectly calibrated so the dancer from head (y=1.85m) to sneaker soles (y=0.0m) is fully visible
      pos: new THREE.Vector3(0, 0.95, 3.2),
      target: new THREE.Vector3(0, 0.92, 0),
      fov: 38,
    },
    front: {
      pos: new THREE.Vector3(0, 0.95, 3.0),
      target: new THREE.Vector3(0, 0.92, 0),
      fov: 38,
    },
    three_quarter: {
      pos: new THREE.Vector3(1.7, 1.1, 2.6),
      target: new THREE.Vector3(0, 0.92, 0),
      fov: 40,
    },
    profile: {
      pos: new THREE.Vector3(2.6, 0.95, 0.4),
      target: new THREE.Vector3(0, 0.92, 0),
      fov: 40,
    },
  };

  let currentPreset: CameraPreset = 'stage_9_16';
  const targetCamPos = CAMERA_PRESETS.stage_9_16.pos.clone();
  const targetLookAt = CAMERA_PRESETS.stage_9_16.target.clone();
  const currentLookAt = targetLookAt.clone();

  camera.position.copy(targetCamPos);
  camera.lookAt(targetLookAt);

  // Lighting: Professional Three-Point Studio Lighting
  // 1. Ambient Fill Light
  const ambientLight = new THREE.AmbientLight(0x2d1f42, 1.2);
  scene.add(ambientLight);

  // 2. Key Light (warm directional light with crisp soft shadows)
  const keyLight = new THREE.DirectionalLight(0xfff3e3, 2.2);
  keyLight.position.set(2.2, 4.5, 3.5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 12;
  keyLight.shadow.camera.left = -2;
  keyLight.shadow.camera.right = 2;
  keyLight.shadow.camera.top = 3;
  keyLight.shadow.camera.bottom = -0.5;
  keyLight.shadow.bias = -0.0005;
  scene.add(keyLight);

  // 3. Fill Light (soft cool violet)
  const fillLight = new THREE.DirectionalLight(0x9333ea, 1.4);
  fillLight.position.set(-3.0, 2.5, 2.0);
  scene.add(fillLight);

  // 4. Rim / Hair Light (back high rim for crisp silhouette pop)
  const rimLight = new THREE.DirectionalLight(0xc084fc, 2.6);
  rimLight.position.set(0, 3.8, -2.8);
  scene.add(rimLight);

  // 5. Floor Spot Accent
  const stageSpot = new THREE.SpotLight(0xa855f7, 2.5, 10, Math.PI / 4, 0.5, 1.2);
  stageSpot.position.set(0, 4.2, 0.5);
  stageSpot.target.position.set(0, 0, 0);
  scene.add(stageSpot);
  scene.add(stageSpot.target);

  // Studio Environment
  // Floor (Polished dance studio floor with subtle reflections)
  const floorGeo = new THREE.PlaneGeometry(16, 16);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x14141e,
    roughness: 0.35,
    metalness: 0.25,
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  scene.add(floorMesh);

  // Dance floor grid markings (Center cross + alignment guidelines)
  const gridHelper = new THREE.GridHelper(8, 16, 0x9333ea, 0x2e2540);
  gridHelper.position.y = 0.002;
  scene.add(gridHelper);

  // Center mark spotlight circle
  const centerRingGeo = new THREE.RingGeometry(0.7, 0.72, 32);
  const centerRingMat = new THREE.MeshBasicMaterial({
    color: 0xa855f7,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.45,
  });
  const centerRing = new THREE.Mesh(centerRingGeo, centerRingMat);
  centerRing.rotation.x = -Math.PI / 2;
  centerRing.position.y = 0.003;
  scene.add(centerRing);

  // Back wall
  const backWallGeo = new THREE.PlaneGeometry(14, 6);
  const backWallMat = new THREE.MeshStandardMaterial({
    color: 0x111119,
    roughness: 0.85,
    metalness: 0.1,
  });
  const backWall = new THREE.Mesh(backWallGeo, backWallMat);
  backWall.position.set(0, 3, -4.5);
  scene.add(backWall);

  // Vertical LED Neon Light tubes on the back wall
  const tubeLightGeo = new THREE.CylinderGeometry(0.025, 0.025, 3.2, 8);
  const neonPurpleMat = new THREE.MeshStandardMaterial({
    color: 0xc084fc,
    emissive: 0x9333ea,
    emissiveIntensity: 2.2,
    roughness: 0.2,
  });
  const neonWarmWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xffedd5,
    emissive: 0xfde047,
    emissiveIntensity: 1.5,
    roughness: 0.2,
  });

  const neonXPositions = [-3.5, -2.2, -1.0, 1.0, 2.2, 3.5];
  neonXPositions.forEach((posX, idx) => {
    const tubeMesh = new THREE.Mesh(tubeLightGeo, idx % 2 === 0 ? neonPurpleMat : neonWarmWhiteMat);
    tubeMesh.position.set(posX, 2.2, -4.45);
    scene.add(tubeMesh);
  });

  // Load and apply backdrop texture if available
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(
    '/src/assets/images/kpop_studio_backdrop_1791116430271.jpg',
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      const backdropScreenGeo = new THREE.PlaneGeometry(9, 4.5);
      const backdropMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.6,
        metalness: 0.1,
      });
      const backdropMesh = new THREE.Mesh(backdropScreenGeo, backdropMat);
      backdropMesh.position.set(0, 2.6, -4.42);
      scene.add(backdropMesh);
    },
    undefined,
    () => {
      // Graceful fallback if image texture fails: keep procedural neon backwall
    }
  );

  // Female Dancer 3D Character (Instructor)
  const dancer = createFemaleDancerModel('instructor');
  scene.add(dancer.rootGroup);

  // Second Female Dancer 3D Character (Partner / Student Avatar)
  const partnerDancer = createFemaleDancerModel('partner');
  partnerDancer.rootGroup.visible = false;
  scene.add(partnerDancer.rootGroup);

  // Initial ready pose
  dancer.applyPose(READY_POSE);
  partnerDancer.applyPose(READY_POSE);

  // State
  let isMirrored = false;
  let isPartnerDuoMode = false;
  let manualOrbitEnabled = false;
  let isPointerDown = false;
  let prevPointerX = 0;
  let prevPointerY = 0;
  let orbitSpherical = new THREE.Spherical(3.2, Math.PI / 2.05, 0);

  // Mouse / Touch orbit handlers
  const onPointerDown = (e: PointerEvent) => {
    if (!manualOrbitEnabled && currentPreset !== 'stage_9_16') return;
    isPointerDown = true;
    prevPointerX = e.clientX;
    prevPointerY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!isPointerDown) return;
    const deltaX = (e.clientX - prevPointerX) * 0.006;
    const deltaY = (e.clientY - prevPointerY) * 0.006;
    prevPointerX = e.clientX;
    prevPointerY = e.clientY;

    orbitSpherical.theta -= deltaX;
    orbitSpherical.phi = Math.max(0.2, Math.min(Math.PI / 2 + 0.05, orbitSpherical.phi - deltaY));

    targetCamPos.setFromSpherical(orbitSpherical).add(targetLookAt);
  };

  const onPointerUp = (e: PointerEvent) => {
    isPointerDown = false;
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);

  // Wheel zoom
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    orbitSpherical.radius = Math.max(1.8, Math.min(6.0, orbitSpherical.radius + e.deltaY * 0.002));
    targetCamPos.setFromSpherical(orbitSpherical).add(targetLookAt);
  };
  canvas.addEventListener('wheel', onWheel, { passive: false });

  // WebGL Context Lost / Restored
  const handleContextLost = (e: Event) => {
    e.preventDefault();
    if (onContextLost) onContextLost();
  };
  const handleContextRestored = () => {
    if (onContextRestored) onContextRestored();
  };
  canvas.addEventListener('webglcontextlost', handleContextLost);
  canvas.addEventListener('webglcontextrestored', handleContextRestored);

  // Camera preset switcher
  function setCameraPreset(preset: CameraPreset) {
    currentPreset = preset;
    const config = CAMERA_PRESETS[preset];
    targetCamPos.copy(config.pos);
    targetLookAt.copy(config.target);
    camera.fov = config.fov;
    camera.updateProjectionMatrix();

    // Sync spherical coordinates for smooth manual dragging
    const offset = new THREE.Vector3().subVectors(config.pos, config.target);
    orbitSpherical.setFromVector3(offset);
  }

  function setMirrorMode(mirror: boolean) {
    isMirrored = mirror;
  }

  function setPartnerDuoMode(enabled: boolean) {
    isPartnerDuoMode = enabled;
    if (enabled) {
      dancer.rootGroup.position.x = 0.55;
      partnerDancer.rootGroup.position.x = -0.55;
      partnerDancer.rootGroup.visible = true;
    } else {
      dancer.rootGroup.position.x = 0;
      partnerDancer.rootGroup.position.x = 0;
      partnerDancer.rootGroup.visible = false;
    }
  }

  function enableManualOrbit(enabled: boolean) {
    manualOrbitEnabled = enabled;
  }

  // Animation calculation for timeSeconds
  function setPlaybackTime(timeSeconds: number) {
    // 32 counts total.
    // Each count takes duration: default 0.6s per beat (100 BPM).
    // Count 32 has 2.0s holdTime at the end!
    // Total loop duration = 31 * 0.6 + (0.6 + 2.0) = 18.6 + 2.6 = 21.2s
    const BEAT_DURATION = 0.6; // 100 BPM
    const FINAL_HOLD = 2.0;

    // Build timeline markers
    let totalDuration = 0;
    const stepStartTimes: number[] = [];
    const stepDurations: number[] = [];

    for (let i = 0; i < CHOREOGRAPHY_STEPS.length; i++) {
      const step = CHOREOGRAPHY_STEPS[i];
      stepStartTimes.push(totalDuration);
      const dur = (step.holdTime || 0) > 0 ? BEAT_DURATION + FINAL_HOLD : BEAT_DURATION;
      stepDurations.push(dur);
      totalDuration += dur;
    }

    const normalizedTime = Math.max(0, timeSeconds % totalDuration);

    // Find current active step index
    let activeIdx = 0;
    for (let i = 0; i < CHOREOGRAPHY_STEPS.length; i++) {
      if (
        normalizedTime >= stepStartTimes[i] &&
        normalizedTime < stepStartTimes[i] + stepDurations[i]
      ) {
        activeIdx = i;
        break;
      }
    }

    const currentStep = CHOREOGRAPHY_STEPS[activeIdx];
    const prevStep = activeIdx > 0 ? CHOREOGRAPHY_STEPS[activeIdx - 1] : CHOREOGRAPHY_STEPS[CHOREOGRAPHY_STEPS.length - 1];

    const elapsedInStep = normalizedTime - stepStartTimes[activeIdx];
    // 65% transition into pose, 35% clean freeze hold on the beat so beginners can read the pose clearly
    const transDuration = Math.min(BEAT_DURATION * 0.65, stepDurations[activeIdx]);
    const transitionT = Math.min(1.0, elapsedInStep / transDuration);

    // Bounce velocity for secondary ponytail motion
    const bounceVel = currentStep.isAccent ? Math.sin(transitionT * Math.PI) * 2.5 : 0;

    // Interpolate
    const currentPose = interpolatePoses(prevStep.pose, currentStep.pose, transitionT);
    dancer.applyPose(currentPose, isMirrored, bounceVel);
    if (isPartnerDuoMode) {
      partnerDancer.applyPose(currentPose, isMirrored, bounceVel);
    }
  }

  function updateAnimation(delta: number) {
    dancer.updatePhysics(delta);
    if (isPartnerDuoMode) {
      partnerDancer.updatePhysics(delta);
    }

    // Smooth camera damping if moving presets
    camera.position.lerp(targetCamPos, Math.min(1, delta * 6));
    currentLookAt.lerp(targetLookAt, Math.min(1, delta * 6));
    camera.lookAt(currentLookAt);

    renderer.render(scene, camera);
  }

  function resize(newWidth: number, newHeight: number) {
    if (newWidth <= 0 || newHeight <= 0) return;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  }

  function dispose() {
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointercancel', onPointerUp);
    canvas.removeEventListener('wheel', onWheel);
    canvas.removeEventListener('webglcontextlost', handleContextLost);
    canvas.removeEventListener('webglcontextrestored', handleContextRestored);

    renderer.dispose();
    if (canvas.parentElement) {
      canvas.parentElement.removeChild(canvas);
    }
  }

  return {
    canvas,
    dancer,
    partnerDancer,
    setCameraPreset,
    setMirrorMode,
    setPartnerDuoMode,
    setPlaybackTime,
    updateAnimation,
    resize,
    dispose,
    enableManualOrbit,
  };
}
