import * as THREE from 'three';
import { DancePose } from '../types/choreography';

export interface CharacterRig {
  rootGroup: THREE.Group;
  hips: THREE.Group;
  spine: THREE.Group;
  chest: THREE.Group;
  neck: THREE.Group;
  head: THREE.Group;
  hairGroup: THREE.Group;
  hairLeftFront: THREE.Group;
  hairRightFront: THREE.Group;
  hairBack: THREE.Group;

  leftClavicle: THREE.Group;
  leftShoulder: THREE.Group;
  leftElbow: THREE.Group;
  leftWrist: THREE.Group;
  leftHand: THREE.Group;

  rightClavicle: THREE.Group;
  rightShoulder: THREE.Group;
  rightElbow: THREE.Group;
  rightWrist: THREE.Group;
  rightHand: THREE.Group;

  leftHipJoint: THREE.Group;
  leftKneeJoint: THREE.Group;
  leftAnkleJoint: THREE.Group;

  rightHipJoint: THREE.Group;
  rightKneeJoint: THREE.Group;
  rightAnkleJoint: THREE.Group;

  applyPose: (pose: DancePose, mirror?: boolean, bounceVelocity?: number) => void;
  updatePhysics: (delta: number) => void;
}

export function createFemaleDancerModel(variant: 'instructor' | 'partner' = 'instructor'): CharacterRig {
  const rootGroup = new THREE.Group();
  rootGroup.name = variant === 'partner' ? 'Dancer_Partner' : 'Dancer_Idol';

  // Materials based on the exact uploaded reference photo:
  // Radiant fair skin tone with subtle peach warmth
  const skinMaterial = new THREE.MeshStandardMaterial({
    color: 0xfceee7,
    roughness: 0.58,
    metalness: 0.03,
  });

  // Black cropped ribbed tank top fabric
  const blackCropTopMat = new THREE.MeshStandardMaterial({
    color: 0x141416,
    roughness: 0.8,
    metalness: 0.08,
  });

  // Black oversized jacket fabric
  const jacketFabricMat = new THREE.MeshStandardMaterial({
    color: variant === 'partner' ? 0x222228 : 0x18181c,
    roughness: 0.72,
    metalness: 0.12,
  });

  // Washed charcoal black denim for wide-leg cargo pants
  const cargoPantsMat = new THREE.MeshStandardMaterial({
    color: variant === 'partner' ? 0x2e2e36 : 0x232328,
    roughness: 0.82,
    metalness: 0.06,
  });

  // Long flowing dark espresso hair
  const hairMaterial = new THREE.MeshStandardMaterial({
    color: variant === 'partner' ? 0x2b1e1a : 0x181316,
    roughness: 0.48,
    metalness: 0.1,
  });

  // Silver hardware: belt buckle, waist chain, necklace, earrings, strap buckles
  const silverMetalMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.18,
  });

  // Chunky white platform sneakers
  const sneakerWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.38,
    metalness: 0.04,
  });
  const sneakerSoleBlackMat = new THREE.MeshStandardMaterial({
    color: 0x1c1c22,
    roughness: 0.7,
    metalness: 0.1,
  });

  // Facial features
  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const irisMat = new THREE.MeshStandardMaterial({
    color: 0x362018, // Warm dark brown idol eyes
    roughness: 0.25,
    metalness: 0.08,
  });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x0a0608 });
  const lipsMat = new THREE.MeshStandardMaterial({
    color: 0xdf5a6b, // Natural glossy rose-pink gradient
    roughness: 0.25,
    metalness: 0.05,
  });
  const blushMat = new THREE.MeshStandardMaterial({
    color: 0xf89c9e,
    roughness: 0.7,
    transparent: true,
    opacity: 0.45,
  });

  // ========== HIPS & PELVIS ==========
  const hips = new THREE.Group();
  hips.name = 'Hips';
  hips.position.set(0, 0.95, 0);
  rootGroup.add(hips);

  // High-waisted cargo waistband
  const pelvisGeo = new THREE.CylinderGeometry(0.165, 0.145, 0.16, 16);
  const pelvisMesh = new THREE.Mesh(pelvisGeo, cargoPantsMat);
  pelvisMesh.castShadow = true;
  hips.add(pelvisMesh);

  // Black leather belt
  const beltGeo = new THREE.CylinderGeometry(0.168, 0.168, 0.032, 16);
  const beltMesh = new THREE.Mesh(beltGeo, blackCropTopMat);
  beltMesh.position.y = 0.065;
  hips.add(beltMesh);

  // Square silver belt buckle
  const buckleFrameGeo = new THREE.BoxGeometry(0.042, 0.035, 0.015);
  const buckleMesh = new THREE.Mesh(buckleFrameGeo, silverMetalMat);
  buckleMesh.position.set(0, 0.065, 0.17);
  hips.add(buckleMesh);

  // Silver hanging chain on right hip (as in reference photo!)
  const chainCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0.09, 0.065, 0.14),
    new THREE.Vector3(0.18, -0.05, 0.12),
    new THREE.Vector3(0.14, 0.04, -0.02)
  );
  const chainGeo = new THREE.TubeGeometry(chainCurve, 16, 0.005, 8, false);
  const chainMesh = new THREE.Mesh(chainGeo, silverMetalMat);
  hips.add(chainMesh);

  // Small silver carabiner ring on right belt loop
  const ringGeo = new THREE.TorusGeometry(0.012, 0.003, 6, 12);
  const ringMesh = new THREE.Mesh(ringGeo, silverMetalMat);
  ringMesh.position.set(0.09, 0.065, 0.14);
  hips.add(ringMesh);

  // ========== SPINE & TONED MIDRIFF ==========
  const spine = new THREE.Group();
  spine.name = 'Spine';
  spine.position.set(0, 0.08, 0);
  hips.add(spine);

  // Toned exposed midriff (skin with subtle athletic contour)
  const midriffGeo = new THREE.CylinderGeometry(0.13, 0.142, 0.12, 16);
  const midriffMesh = new THREE.Mesh(midriffGeo, skinMaterial);
  midriffMesh.position.y = 0.06;
  midriffMesh.castShadow = true;
  spine.add(midriffMesh);

  // Navel detail
  const navelGeo = new THREE.SphereGeometry(0.005, 8, 8);
  navelGeo.scale(0.8, 1.4, 0.4);
  const navelMat = new THREE.MeshBasicMaterial({ color: 0xcaa093 });
  const navelMesh = new THREE.Mesh(navelGeo, navelMat);
  navelMesh.position.set(0, 0.035, 0.138);
  spine.add(navelMesh);

  // ========== CHEST, CROP TOP & OFF-SHOULDER JACKET ==========
  const chest = new THREE.Group();
  chest.name = 'Chest';
  chest.position.set(0, 0.14, 0);
  spine.add(chest);

  // Black cropped tank top
  const tankTopGeo = new THREE.CylinderGeometry(0.15, 0.135, 0.14, 16);
  const tankTopMesh = new THREE.Mesh(tankTopGeo, blackCropTopMat);
  tankTopMesh.position.y = 0.06;
  tankTopMesh.castShadow = true;
  chest.add(tankTopMesh);

  // Tank top thin black shoulder straps
  const strapLeftGeo = new THREE.BoxGeometry(0.018, 0.12, 0.005);
  const strapLeft = new THREE.Mesh(strapLeftGeo, blackCropTopMat);
  strapLeft.position.set(-0.08, 0.15, 0.04);
  strapLeft.rotation.x = -0.2;
  chest.add(strapLeft);

  const strapRight = new THREE.Mesh(strapLeftGeo.clone(), blackCropTopMat);
  strapRight.position.set(0.08, 0.15, 0.04);
  strapRight.rotation.x = -0.2;
  chest.add(strapRight);

  // Bare clavicles & upper chest skin
  const upperChestGeo = new THREE.CylinderGeometry(0.13, 0.148, 0.08, 16);
  const upperChestMesh = new THREE.Mesh(upperChestGeo, skinMaterial);
  upperChestMesh.position.y = 0.13;
  chest.add(upperChestMesh);

  // Oversized jacket slipped off shoulders (resting around upper back and outer upper arms)
  const droppedJacketBackGeo = new THREE.BoxGeometry(0.34, 0.18, 0.08);
  const droppedJacketBack = new THREE.Mesh(droppedJacketBackGeo, jacketFabricMat);
  droppedJacketBack.position.set(0, 0.04, -0.1);
  droppedJacketBack.castShadow = true;
  chest.add(droppedJacketBack);

  // Dropped jacket collar/folds
  const jacketCollarGeo = new THREE.TorusGeometry(0.16, 0.035, 8, 16, Math.PI);
  const jacketCollar = new THREE.Mesh(jacketCollarGeo, jacketFabricMat);
  jacketCollar.position.set(0, 0.08, -0.04);
  jacketCollar.rotation.x = Math.PI / 2.3;
  chest.add(jacketCollar);

  // Silver chain necklace with small pendant (matching reference photo!)
  const necklaceCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-0.045, 0.165, 0.07),
    new THREE.Vector3(0, 0.115, 0.095),
    new THREE.Vector3(0.045, 0.165, 0.07)
  );
  const necklaceGeo = new THREE.TubeGeometry(necklaceCurve, 12, 0.003, 6, false);
  const necklaceMesh = new THREE.Mesh(necklaceGeo, silverMetalMat);
  chest.add(necklaceMesh);

  const pendantGeo = new THREE.BoxGeometry(0.008, 0.012, 0.003);
  const pendantMesh = new THREE.Mesh(pendantGeo, silverMetalMat);
  pendantMesh.position.set(0, 0.11, 0.096);
  chest.add(pendantMesh);

  // ========== NECK & HEAD ==========
  const neck = new THREE.Group();
  neck.name = 'Neck';
  neck.position.set(0, 0.18, 0);
  chest.add(neck);

  const neckGeo = new THREE.CylinderGeometry(0.042, 0.05, 0.08, 12);
  const neckMesh = new THREE.Mesh(neckGeo, skinMaterial);
  neckMesh.position.y = 0.04;
  neck.add(neckMesh);

  // Head
  const head = new THREE.Group();
  head.name = 'Head';
  head.position.set(0, 0.08, 0);
  neck.add(head);

  // Delicate oval idol face cranium
  const craniumGeo = new THREE.SphereGeometry(0.122, 20, 20);
  craniumGeo.scale(0.88, 1.1, 0.94);
  const headMesh = new THREE.Mesh(craniumGeo, skinMaterial);
  headMesh.position.y = 0.08;
  headMesh.castShadow = true;
  head.add(headMesh);

  // Left Eye
  const leftEyeGroup = new THREE.Group();
  leftEyeGroup.position.set(-0.04, 0.078, 0.106);
  head.add(leftEyeGroup);

  const eyeGeo = new THREE.SphereGeometry(0.02, 12, 12);
  eyeGeo.scale(1, 1.25, 0.4);
  const leftEyeWhite = new THREE.Mesh(eyeGeo, eyeWhiteMat);
  leftEyeGroup.add(leftEyeWhite);

  const irisGeo = new THREE.SphereGeometry(0.013, 12, 12);
  irisGeo.scale(1, 1.2, 0.5);
  const leftIris = new THREE.Mesh(irisGeo, irisMat);
  leftIris.position.z = 0.006;
  leftEyeGroup.add(leftIris);

  const pupilGeo = new THREE.SphereGeometry(0.0065, 8, 8);
  const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
  leftPupil.position.z = 0.011;
  leftEyeGroup.add(leftPupil);

  // Right Eye
  const rightEyeGroup = new THREE.Group();
  rightEyeGroup.position.set(0.04, 0.078, 0.106);
  head.add(rightEyeGroup);

  const rightEyeWhite = new THREE.Mesh(eyeGeo.clone(), eyeWhiteMat);
  rightEyeGroup.add(rightEyeWhite);

  const rightIris = new THREE.Mesh(irisGeo.clone(), irisMat);
  rightIris.position.z = 0.006;
  rightEyeGroup.add(rightIris);

  const rightPupil = new THREE.Mesh(pupilGeo.clone(), pupilMat);
  rightPupil.position.z = 0.011;
  rightEyeGroup.add(rightPupil);

  // Eyeliner & Eyebrows
  const browGeo = new THREE.BoxGeometry(0.038, 0.006, 0.005);
  const leftBrow = new THREE.Mesh(browGeo, hairMaterial);
  leftBrow.position.set(-0.04, 0.108, 0.11);
  leftBrow.rotation.z = 0.07;
  head.add(leftBrow);

  const rightBrow = new THREE.Mesh(browGeo.clone(), hairMaterial);
  rightBrow.position.set(0.04, 0.108, 0.11);
  rightBrow.rotation.z = -0.07;
  head.add(rightBrow);

  // Soft peach cheek blush
  const blushGeo = new THREE.SphereGeometry(0.025, 8, 8);
  blushGeo.scale(1.2, 0.6, 0.2);
  const leftBlush = new THREE.Mesh(blushGeo, blushMat);
  leftBlush.position.set(-0.065, 0.055, 0.095);
  head.add(leftBlush);

  const rightBlush = new THREE.Mesh(blushGeo.clone(), blushMat);
  rightBlush.position.set(0.065, 0.055, 0.095);
  head.add(rightBlush);

  // Natural glossy rose-pink lips
  const lipGeo = new THREE.TorusGeometry(0.016, 0.004, 6, 12, Math.PI);
  const lipMesh = new THREE.Mesh(lipGeo, lipsMat);
  lipMesh.position.set(0, 0.032, 0.112);
  lipMesh.rotation.z = Math.PI;
  head.add(lipMesh);

  // Silver small hoop earrings (on both ears as in photo)
  const earringGeo = new THREE.TorusGeometry(0.012, 0.002, 6, 12);
  const leftEarring = new THREE.Mesh(earringGeo, silverMetalMat);
  leftEarring.position.set(-0.112, 0.05, 0.01);
  leftEarring.rotation.y = Math.PI / 2;
  head.add(leftEarring);

  const rightEarring = new THREE.Mesh(earringGeo.clone(), silverMetalMat);
  rightEarring.position.set(0.112, 0.05, 0.01);
  rightEarring.rotation.y = Math.PI / 2;
  head.add(rightEarring);

  // ========== LONG FLOWING DARK HAIR (Cascading over shoulders & chest) ==========
  const hairGroup = new THREE.Group();
  hairGroup.name = 'LongHair';
  head.add(hairGroup);

  // Hair crown
  const hairCrownGeo = new THREE.SphereGeometry(0.134, 16, 16);
  hairCrownGeo.scale(0.92, 1.05, 0.98);
  const hairCrown = new THREE.Mesh(hairCrownGeo, hairMaterial);
  hairCrown.position.set(0, 0.11, -0.015);
  hairGroup.add(hairCrown);

  // Soft middle-parted bangs
  const bangsLeftGeo = new THREE.BoxGeometry(0.07, 0.09, 0.02);
  const bangsLeft = new THREE.Mesh(bangsLeftGeo, hairMaterial);
  bangsLeft.position.set(-0.045, 0.125, 0.09);
  bangsLeft.rotation.z = -0.15;
  bangsLeft.rotation.x = -0.2;
  hairGroup.add(bangsLeft);

  const bangsRight = new THREE.Mesh(bangsLeftGeo.clone(), hairMaterial);
  bangsRight.position.set(0.045, 0.125, 0.09);
  bangsRight.rotation.z = 0.15;
  bangsRight.rotation.x = -0.2;
  hairGroup.add(bangsRight);

  // Left front wavy hair strand (cascading down left shoulder and chest)
  const hairLeftFront = new THREE.Group();
  hairLeftFront.position.set(-0.095, 0.08, 0.02);
  hairGroup.add(hairLeftFront);

  const frontStrandGeo = new THREE.CylinderGeometry(0.025, 0.015, 0.42, 10);
  frontStrandGeo.translate(0, -0.21, 0);
  const leftStrandMesh = new THREE.Mesh(frontStrandGeo, hairMaterial);
  leftStrandMesh.position.set(0.01, 0, 0.06);
  leftStrandMesh.rotation.z = 0.08;
  leftStrandMesh.rotation.x = 0.15;
  hairLeftFront.add(leftStrandMesh);

  // Right front wavy hair strand (cascading down right shoulder and chest)
  const hairRightFront = new THREE.Group();
  hairRightFront.position.set(0.095, 0.08, 0.02);
  hairGroup.add(hairRightFront);

  const rightStrandMesh = new THREE.Mesh(frontStrandGeo.clone(), hairMaterial);
  rightStrandMesh.position.set(-0.01, 0, 0.06);
  rightStrandMesh.rotation.z = -0.08;
  rightStrandMesh.rotation.x = 0.15;
  hairRightFront.add(rightStrandMesh);

  // Back wavy hair cascading down past mid-back
  const hairBack = new THREE.Group();
  hairBack.position.set(0, 0.08, -0.1);
  hairGroup.add(hairBack);

  const backHairGeo = new THREE.CylinderGeometry(0.12, 0.08, 0.48, 12);
  backHairGeo.translate(0, -0.24, 0);
  const backHairMesh = new THREE.Mesh(backHairGeo, hairMaterial);
  hairBack.add(backHairMesh);

  // ========== LEFT ARM & OFF-SHOULDER JACKET SLEEVE ==========
  const leftClavicle = new THREE.Group();
  leftClavicle.name = 'LeftClavicle';
  leftClavicle.position.set(-0.13, 0.14, 0);
  chest.add(leftClavicle);

  const leftShoulder = new THREE.Group();
  leftShoulder.name = 'LeftShoulder';
  leftShoulder.position.set(-0.06, 0, 0);
  leftClavicle.add(leftShoulder);

  // Bare upper shoulder skin (since jacket is slipped off shoulders!)
  const bareShoulderGeo = new THREE.SphereGeometry(0.045, 12, 12);
  const bareShoulderMesh = new THREE.Mesh(bareShoulderGeo, skinMaterial);
  leftShoulder.add(bareShoulderMesh);

  // Dropped jacket sleeve bunched around mid upper arm
  const droppedSleeveGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.22, 12);
  droppedSleeveGeo.translate(0, -0.11, 0);
  const leftSleeveMesh = new THREE.Mesh(droppedSleeveGeo, jacketFabricMat);
  leftSleeveMesh.castShadow = true;
  leftShoulder.add(leftSleeveMesh);

  // Left Elbow
  const leftElbow = new THREE.Group();
  leftElbow.name = 'LeftElbow';
  leftElbow.position.set(0, -0.22, 0);
  leftShoulder.add(leftElbow);

  // Lower jacket sleeve & cuff
  const forearmSleeveGeo = new THREE.CylinderGeometry(0.055, 0.042, 0.19, 12);
  forearmSleeveGeo.translate(0, -0.095, 0);
  const leftForearmMesh = new THREE.Mesh(forearmSleeveGeo, jacketFabricMat);
  leftForearmMesh.castShadow = true;
  leftElbow.add(leftForearmMesh);

  // Ribbed black cuff
  const cuffGeo = new THREE.CylinderGeometry(0.044, 0.04, 0.035, 12);
  cuffGeo.translate(0, -0.175, 0);
  const leftCuff = new THREE.Mesh(cuffGeo, blackCropTopMat);
  leftElbow.add(leftCuff);

  // Left Wrist & Hand
  const leftWrist = new THREE.Group();
  leftWrist.name = 'LeftWrist';
  leftWrist.position.set(0, -0.19, 0);
  leftElbow.add(leftWrist);

  const leftHand = new THREE.Group();
  leftHand.name = 'LeftHand';
  leftWrist.add(leftHand);

  const palmGeo = new THREE.BoxGeometry(0.042, 0.062, 0.02);
  palmGeo.translate(0, -0.032, 0);
  const leftPalmMesh = new THREE.Mesh(palmGeo, skinMaterial);
  leftPalmMesh.castShadow = true;
  leftHand.add(leftPalmMesh);

  // ========== RIGHT ARM & OFF-SHOULDER JACKET SLEEVE ==========
  const rightClavicle = new THREE.Group();
  rightClavicle.name = 'RightClavicle';
  rightClavicle.position.set(0.13, 0.14, 0);
  chest.add(rightClavicle);

  const rightShoulder = new THREE.Group();
  rightShoulder.name = 'RightShoulder';
  rightShoulder.position.set(0.06, 0, 0);
  rightClavicle.add(rightShoulder);

  // Bare upper shoulder skin
  const rightBareShoulder = new THREE.Mesh(bareShoulderGeo.clone(), skinMaterial);
  rightShoulder.add(rightBareShoulder);

  // Dropped jacket sleeve
  const rightSleeveMesh = new THREE.Mesh(droppedSleeveGeo.clone(), jacketFabricMat);
  rightSleeveMesh.castShadow = true;
  rightShoulder.add(rightSleeveMesh);

  // Right Elbow
  const rightElbow = new THREE.Group();
  rightElbow.name = 'RightElbow';
  rightElbow.position.set(0, -0.22, 0);
  rightShoulder.add(rightElbow);

  // Forearm & Cuff
  const rightForearmMesh = new THREE.Mesh(forearmSleeveGeo.clone(), jacketFabricMat);
  rightForearmMesh.castShadow = true;
  rightElbow.add(rightForearmMesh);

  const rightCuff = new THREE.Mesh(cuffGeo.clone(), blackCropTopMat);
  rightElbow.add(rightCuff);

  // Right Wrist & Hand
  const rightWrist = new THREE.Group();
  rightWrist.name = 'RightWrist';
  rightWrist.position.set(0, -0.19, 0);
  rightElbow.add(rightWrist);

  const rightHand = new THREE.Group();
  rightHand.name = 'RightHand';
  rightWrist.add(rightHand);

  const rightPalmMesh = new THREE.Mesh(palmGeo.clone(), skinMaterial);
  rightPalmMesh.castShadow = true;
  rightHand.add(rightPalmMesh);

  // ========== LEFT LEG: WIDE-LEG CARGO PANTS WITH STRAPS ==========
  const leftHipJoint = new THREE.Group();
  leftHipJoint.name = 'LeftHipJoint';
  leftHipJoint.position.set(-0.1, -0.06, 0);
  hips.add(leftHipJoint);

  // Wide-leg baggy thigh
  const wideThighGeo = new THREE.CylinderGeometry(0.095, 0.088, 0.38, 14);
  wideThighGeo.translate(0, -0.19, 0);
  const leftThighMesh = new THREE.Mesh(wideThighGeo, cargoPantsMat);
  leftThighMesh.castShadow = true;
  leftHipJoint.add(leftThighMesh);

  // 3D Outer Cargo Flap Pocket
  const cargoPocketGeo = new THREE.BoxGeometry(0.045, 0.11, 0.095);
  const leftCargoPocket = new THREE.Mesh(cargoPocketGeo, cargoPantsMat);
  leftCargoPocket.position.set(-0.085, -0.19, 0);
  leftHipJoint.add(leftCargoPocket);

  // Hanging tactical straps (from cargo pocket extending down past knee as in photo!)
  const hangingStrapGeo = new THREE.BoxGeometry(0.015, 0.28, 0.005);
  const leftStrap1 = new THREE.Mesh(hangingStrapGeo, blackCropTopMat);
  leftStrap1.position.set(-0.095, -0.28, 0.025);
  leftHipJoint.add(leftStrap1);

  const leftStrap2 = new THREE.Mesh(hangingStrapGeo, blackCropTopMat);
  leftStrap2.position.set(-0.095, -0.28, -0.025);
  leftHipJoint.add(leftStrap2);

  // Silver buckle tip on strap
  const strapBuckleGeo = new THREE.BoxGeometry(0.018, 0.012, 0.008);
  const leftStrapTip = new THREE.Mesh(strapBuckleGeo, silverMetalMat);
  leftStrapTip.position.set(-0.095, -0.42, 0.025);
  leftHipJoint.add(leftStrapTip);

  // Left Knee
  const leftKneeJoint = new THREE.Group();
  leftKneeJoint.name = 'LeftKneeJoint';
  leftKneeJoint.position.set(0, -0.38, 0);
  leftHipJoint.add(leftKneeJoint);

  // Baggy lower leg (flaring slightly down over sneakers)
  const wideCalfGeo = new THREE.CylinderGeometry(0.088, 0.105, 0.38, 14);
  wideCalfGeo.translate(0, -0.19, 0);
  const leftCalfMesh = new THREE.Mesh(wideCalfGeo, cargoPantsMat);
  leftCalfMesh.castShadow = true;
  leftKneeJoint.add(leftCalfMesh);

  // Left Ankle & Chunky White Platform Sneaker
  const leftAnkleJoint = new THREE.Group();
  leftAnkleJoint.name = 'LeftAnkleJoint';
  leftAnkleJoint.position.set(0, -0.38, 0);
  leftKneeJoint.add(leftAnkleJoint);

  // White Chunky Platform Sneaker
  const leftSneakerGroup = new THREE.Group();
  leftAnkleJoint.add(leftSneakerGroup);

  // Thick white EVA midsole
  const thickSoleGeo = new THREE.BoxGeometry(0.105, 0.055, 0.23);
  const leftMidsole = new THREE.Mesh(thickSoleGeo, sneakerWhiteMat);
  leftMidsole.position.set(0, -0.065, 0.04);
  leftMidsole.castShadow = true;
  leftSneakerGroup.add(leftMidsole);

  // Black bottom tread
  const treadGeo = new THREE.BoxGeometry(0.106, 0.015, 0.232);
  const leftTread = new THREE.Mesh(treadGeo, sneakerSoleBlackMat);
  leftTread.position.set(0, -0.09, 0.04);
  leftSneakerGroup.add(leftTread);

  // White sneaker contoured upper
  const upperSneakerGeo = new THREE.BoxGeometry(0.092, 0.075, 0.19);
  const leftSneakerUpper = new THREE.Mesh(upperSneakerGeo, sneakerWhiteMat);
  leftSneakerUpper.position.set(0, -0.015, 0.03);
  leftSneakerUpper.castShadow = true;
  leftSneakerGroup.add(leftSneakerUpper);

  // Rounded toe cap
  const toeCapGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.07, 12);
  toeCapGeo.rotateX(Math.PI / 2);
  const leftToeCap = new THREE.Mesh(toeCapGeo, sneakerWhiteMat);
  leftToeCap.position.set(0, -0.025, 0.115);
  leftSneakerGroup.add(leftToeCap);

  // ========== RIGHT LEG: WIDE-LEG CARGO PANTS WITH STRAPS ==========
  const rightHipJoint = new THREE.Group();
  rightHipJoint.name = 'RightHipJoint';
  rightHipJoint.position.set(0.1, -0.06, 0);
  hips.add(rightHipJoint);

  // Right Thigh
  const rightThighMesh = new THREE.Mesh(wideThighGeo.clone(), cargoPantsMat);
  rightThighMesh.castShadow = true;
  rightHipJoint.add(rightThighMesh);

  // Right Cargo Flap Pocket
  const rightCargoPocket = new THREE.Mesh(cargoPocketGeo.clone(), cargoPantsMat);
  rightCargoPocket.position.set(0.085, -0.19, 0);
  rightHipJoint.add(rightCargoPocket);

  // Right Hanging Straps
  const rightStrap1 = new THREE.Mesh(hangingStrapGeo.clone(), blackCropTopMat);
  rightStrap1.position.set(0.095, -0.28, 0.025);
  rightHipJoint.add(rightStrap1);

  const rightStrap2 = new THREE.Mesh(hangingStrapGeo.clone(), blackCropTopMat);
  rightStrap2.position.set(0.095, -0.28, -0.025);
  rightHipJoint.add(rightStrap2);

  const rightStrapTip = new THREE.Mesh(strapBuckleGeo.clone(), silverMetalMat);
  rightStrapTip.position.set(0.095, -0.42, 0.025);
  rightHipJoint.add(rightStrapTip);

  // Right Knee
  const rightKneeJoint = new THREE.Group();
  rightKneeJoint.name = 'RightKneeJoint';
  rightKneeJoint.position.set(0, -0.38, 0);
  rightHipJoint.add(rightKneeJoint);

  // Right Calf
  const rightCalfMesh = new THREE.Mesh(wideCalfGeo.clone(), cargoPantsMat);
  rightCalfMesh.castShadow = true;
  rightKneeJoint.add(rightCalfMesh);

  // Right Ankle & Sneaker
  const rightAnkleJoint = new THREE.Group();
  rightAnkleJoint.name = 'RightAnkleJoint';
  rightAnkleJoint.position.set(0, -0.38, 0);
  rightKneeJoint.add(rightAnkleJoint);

  const rightSneakerGroup = new THREE.Group();
  rightAnkleJoint.add(rightSneakerGroup);

  const rightMidsole = new THREE.Mesh(thickSoleGeo.clone(), sneakerWhiteMat);
  rightMidsole.position.set(0, -0.065, 0.04);
  rightMidsole.castShadow = true;
  rightSneakerGroup.add(rightMidsole);

  const rightTread = new THREE.Mesh(treadGeo.clone(), sneakerSoleBlackMat);
  rightTread.position.set(0, -0.09, 0.04);
  rightSneakerGroup.add(rightTread);

  const rightSneakerUpper = new THREE.Mesh(upperSneakerGeo.clone(), sneakerWhiteMat);
  rightSneakerUpper.position.set(0, -0.015, 0.03);
  rightSneakerUpper.castShadow = true;
  rightSneakerGroup.add(rightSneakerUpper);

  const rightToeCap = new THREE.Mesh(toeCapGeo.clone(), sneakerWhiteMat);
  rightToeCap.position.set(0, -0.025, 0.115);
  rightSneakerGroup.add(rightToeCap);

  // Hair sway physics state
  let hairSwayVel = 0;
  let hairSwayAngle = 0;

  function applyPose(pose: DancePose, mirror = false, bounceVelocity = 0) {
    const mirrorMult = mirror ? -1 : 1;

    // Hips
    hips.position.x = pose.hipX * mirrorMult;
    hips.position.y = pose.hipY;
    hips.position.z = pose.hipZ;

    hips.rotation.x = pose.hipRotX;
    hips.rotation.y = pose.hipRotY * mirrorMult;
    hips.rotation.z = pose.hipRotZ * mirrorMult;

    // Spine & Chest
    spine.rotation.x = pose.spineRotX;
    spine.rotation.y = pose.spineRotY * mirrorMult;
    spine.rotation.z = pose.spineRotZ * mirrorMult;

    chest.rotation.x = pose.chestRotX;
    chest.rotation.y = pose.chestRotY * mirrorMult;
    chest.rotation.z = pose.chestRotZ * mirrorMult;

    // Shoulder shrugs
    if (!mirror) {
      leftClavicle.position.y = 0.14 + pose.leftShoulderLift * 0.12;
      rightClavicle.position.y = 0.14 + pose.rightShoulderLift * 0.12;
    } else {
      leftClavicle.position.y = 0.14 + pose.rightShoulderLift * 0.12;
      rightClavicle.position.y = 0.14 + pose.leftShoulderLift * 0.12;
    }

    // Head
    head.rotation.x = pose.headRotX;
    head.rotation.y = pose.headRotY * mirrorMult;
    head.rotation.z = pose.headRotZ * mirrorMult;

    // Hair dynamic response
    hairSwayVel += bounceVelocity * 0.12;
    hairLeftFront.rotation.z = 0.08 + hairSwayAngle * 0.3;
    hairRightFront.rotation.z = -0.08 - hairSwayAngle * 0.3;
    hairBack.rotation.x = 0.05 + hairSwayAngle * 0.4;

    // Arms
    if (!mirror) {
      leftShoulder.rotation.x = pose.leftShoulderRotX;
      leftShoulder.rotation.y = pose.leftShoulderRotY;
      leftShoulder.rotation.z = pose.leftShoulderRotZ;
      leftElbow.rotation.x = -pose.leftElbowFlex;
      leftWrist.rotation.z = pose.leftWristRot;

      rightShoulder.rotation.x = pose.rightShoulderRotX;
      rightShoulder.rotation.y = pose.rightShoulderRotY;
      rightShoulder.rotation.z = pose.rightShoulderRotZ;
      rightElbow.rotation.x = -pose.rightElbowFlex;
      rightWrist.rotation.z = pose.rightWristRot;
    } else {
      leftShoulder.rotation.x = pose.rightShoulderRotX;
      leftShoulder.rotation.y = -pose.rightShoulderRotY;
      leftShoulder.rotation.z = -pose.rightShoulderRotZ;
      leftElbow.rotation.x = -pose.rightElbowFlex;
      leftWrist.rotation.z = -pose.rightWristRot;

      rightShoulder.rotation.x = pose.leftShoulderRotX;
      rightShoulder.rotation.y = -pose.leftShoulderRotY;
      rightShoulder.rotation.z = -pose.leftShoulderRotZ;
      rightElbow.rotation.x = -pose.leftElbowFlex;
      rightWrist.rotation.z = -pose.leftWristRot;
    }

    // Legs
    if (!mirror) {
      leftHipJoint.rotation.x = -pose.leftHipRotX;
      leftHipJoint.rotation.y = pose.leftHipRotY;
      leftHipJoint.rotation.z = pose.leftHipRotZ;
      leftKneeJoint.rotation.x = pose.leftKneeFlex;
      leftAnkleJoint.rotation.x = pose.leftFootRotX;
      leftAnkleJoint.rotation.y = pose.leftFootRotY;

      rightHipJoint.rotation.x = -pose.rightHipRotX;
      rightHipJoint.rotation.y = pose.rightHipRotY;
      rightHipJoint.rotation.z = pose.rightHipRotZ;
      rightKneeJoint.rotation.x = pose.rightKneeFlex;
      rightAnkleJoint.rotation.x = pose.rightFootRotX;
      rightAnkleJoint.rotation.y = pose.rightFootRotY;
    } else {
      leftHipJoint.rotation.x = -pose.rightHipRotX;
      leftHipJoint.rotation.y = -pose.rightHipRotY;
      leftHipJoint.rotation.z = -pose.rightHipRotZ;
      leftKneeJoint.rotation.x = pose.rightKneeFlex;
      leftAnkleJoint.rotation.x = pose.rightFootRotX;
      leftAnkleJoint.rotation.y = -pose.rightFootRotY;

      rightHipJoint.rotation.x = -pose.leftHipRotX;
      rightHipJoint.rotation.y = -pose.leftHipRotY;
      rightHipJoint.rotation.z = -pose.leftHipRotZ;
      rightKneeJoint.rotation.x = pose.leftKneeFlex;
      rightAnkleJoint.rotation.x = pose.leftFootRotX;
      rightAnkleJoint.rotation.y = -pose.leftFootRotY;
    }
  }

  function updatePhysics(delta: number) {
    const springK = 16.0;
    const damping = 4.2;
    const force = -springK * hairSwayAngle - damping * hairSwayVel;
    hairSwayVel += force * delta;
    hairSwayAngle += hairSwayVel * delta;
    hairSwayAngle = Math.max(-0.5, Math.min(0.5, hairSwayAngle));
  }

  return {
    rootGroup,
    hips,
    spine,
    chest,
    neck,
    head,
    hairGroup,
    hairLeftFront,
    hairRightFront,
    hairBack,
    leftClavicle,
    leftShoulder,
    leftElbow,
    leftWrist,
    leftHand,
    rightClavicle,
    rightShoulder,
    rightElbow,
    rightWrist,
    rightHand,
    leftHipJoint,
    leftKneeJoint,
    leftAnkleJoint,
    rightHipJoint,
    rightKneeJoint,
    rightAnkleJoint,
    applyPose,
    updatePhysics,
  };
}
