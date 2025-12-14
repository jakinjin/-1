export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface OrnamentData {
  id: number;
  position: [number, number, number];
  color: string;
  type: 'bulb' | 'sphere' | 'star';
  scale: number;
}

export enum TreeTheme {
  CLASSIC = 'Classic',
  MIDNIGHT = 'Midnight',
  ROYAL = 'Royal'
}

export type TreeStatus = 'assembled' | 'scattered';
