import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const WINDOW_WIDTH = width;
export const WINDOW_HEIGHT = height;

// Bird
export const BIRD_SIZE = 40;
export const BIRD_X = Math.round(width / 4);
export const BIRD_Y = Math.round(height / 2);

// Pipes
export const PIPE_WIDTH = 64;
export const PIPE_GAP = 220; // vertical gap between top and bottom pipe (wider = easier)
export const PIPE_SPEED = -2; // horizontal speed (pixels per frame)
export const PIPE_SPAWN_X = width + PIPE_WIDTH + width * 0.4; // respawn further right for spacing

// Floor
export const FLOOR_HEIGHT = 80;
export const FLOOR_Y = height - FLOOR_HEIGHT;

// Physics
export const GRAVITY = 0.3;
export const FLAP_VELOCITY = -5;
export const MAX_VELOCITY = 8;

// Difficulty
export const SPEED_INCREMENT = 0.15; // gentle speed increase per interval
export const SCORE_INTERVAL = 10; // increase difficulty every N points

// Colors
export const COLORS = {
  sky: '#4EC0CA',
  skyGradientTop: '#2B8A94',
  skyGradientBottom: '#87CEEB',
  bird: '#F5C842',
  birdInner: '#E8A317',
  birdEye: '#FFFFFF',
  birdPupil: '#2C2C2C',
  birdBeak: '#E85D3A',
  pipeBody: '#5BB33B',
  pipeBorder: '#3D8B2D',
  pipeHighlight: '#7CD65A',
  pipeCap: '#4CA82C',
  pipeCapBorder: '#3D8B2D',
  floor: '#DED895',
  floorDark: '#C7B957',
  floorLine: '#A89D40',
  bgCloud: 'rgba(255, 255, 255, 0.7)',
  bgMountainFar: '#6BA88E',
  bgMountainNear: '#4A8A6A',
  bgBush: '#3D7A4A',
  scoreText: '#FFFFFF',
  scoreStroke: '#333333',
  gameOverBg: 'rgba(0, 0, 0, 0.65)',
  gameOverText: '#FFFFFF',
  buttonBg: '#5BB33B',
  buttonText: '#FFFFFF',
  buttonShadow: '#3D8B2D',
  titleText: '#F5C842',
  titleStroke: '#E8A317',
};
