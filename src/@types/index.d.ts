/* eslint-disable no-unused-vars */
/*
 * As enum can be used both as type and values,
 * we need to declare type and export values
 */
export enum Direction {
  TOP = 38, // arrow up
  RIGHT = 39, // arrow right
  BOTTOM = 40, // arrow down
  LEFT = 37, // arrow left
}

export enum GameMode {
  'SinglePlayer' = 1,
  'DualPlayer' = 2,
}

declare global {
  type Thunk<T> = T | Promise<T>;

  interface Coordinates2D {
    x: number;
    y: number;
  }

  enum Direction {
    TOP,
    RIGHT,
    BOTTOM,
    LEFT,
  }
}

export {};
