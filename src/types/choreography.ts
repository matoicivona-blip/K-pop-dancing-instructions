export interface DancePose {
  // Root / Pelvis
  hipX: number;
  hipY: number;
  hipZ: number;
  hipRotX: number;
  hipRotY: number;
  hipRotZ: number;

  // Spine & Torso
  spineRotX: number;
  spineRotY: number;
  spineRotZ: number;
  chestRotX: number;
  chestRotY: number;
  chestRotZ: number;

  // Shoulder shrugs (elevation)
  leftShoulderLift: number;
  rightShoulderLift: number;

  // Head
  headRotX: number;
  headRotY: number;
  headRotZ: number;

  // Left Arm (Clavicle / Shoulder / Elbow / Wrist)
  leftShoulderRotX: number;
  leftShoulderRotY: number;
  leftShoulderRotZ: number;
  leftElbowFlex: number;
  leftWristRot: number;
  leftHandShape?: 'open' | 'fist' | 'point' | 'waist' | 'frame';

  // Right Arm
  rightShoulderRotX: number;
  rightShoulderRotY: number;
  rightShoulderRotZ: number;
  rightElbowFlex: number;
  rightWristRot: number;
  rightHandShape?: 'open' | 'fist' | 'point' | 'waist' | 'frame';

  // Left Leg (Hip / Knee / Foot)
  leftHipRotX: number;
  leftHipRotY: number;
  leftHipRotZ: number;
  leftKneeFlex: number;
  leftFootRotX: number;
  leftFootRotY: number;

  // Right Leg
  rightHipRotX: number;
  rightHipRotY: number;
  rightHipRotZ: number;
  rightKneeFlex: number;
  rightFootRotX: number;
  rightFootRotY: number;
}

export interface ChoreographyStep {
  count: number;
  setNumber: 1 | 2 | 3 | 4; // 1: 1-8, 2: 9-16, 3: 17-24, 4: 25-32
  title: string;
  actionSummary: string;
  officialCue: string;
  footwork: string;
  armStyling: string;
  coachingTip: string;
  isAccent?: boolean;
  holdTime?: number; // extra pause in seconds (e.g. count 32 has 2s hold)
  pose: DancePose;
}

export interface ChoreographySection {
  id: number;
  name: string;
  countRange: [number, number];
  theme: string;
  accentCounts: number[];
}

export const CHOREOGRAPHY_SECTIONS: ChoreographySection[] = [
  {
    id: 1,
    name: 'Part 1: The Intro Groove',
    countRange: [1, 8],
    theme: 'Shoulder isolations, chest cross, chest pull, and overhead bounce into strong pose.',
    accentCounts: [3, 7, 8],
  },
  {
    id: 2,
    name: 'Part 2: Upward Reach & Body Roll',
    countRange: [9, 16],
    theme: 'Diagonal high reach, chest push, smooth body roll, and looking over the shoulder.',
    accentCounts: [12, 13, 16],
  },
  {
    id: 3,
    name: 'Part 3: Arm Circles & Low Hit',
    countRange: [17, 24],
    theme: 'Fluid arm circles, crisp arm pop, deep roll, waist hit, and camera reach.',
    accentCounts: [19, 20, 24],
  },
  {
    id: 4,
    name: 'Part 4: The Climax & Ending Pose',
    countRange: [25, 32],
    theme: 'High reach, level change, forward punches, turn flare, and 2-second iconic final pose.',
    accentCounts: [25, 28, 32],
  },
];
