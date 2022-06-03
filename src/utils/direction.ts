import { Direction } from '@app/@types/index.d';

export enum DirectionP2 {
  TOP = 87,
  RIGHT = 68,
  BOTTOM = 83,
  LEFT = 65,
}

export const MappedDirection = new Map<DirectionP2, Direction>([
  [DirectionP2.TOP, Direction.TOP],
  [DirectionP2.RIGHT, Direction.RIGHT],
  [DirectionP2.BOTTOM, Direction.BOTTOM],
  [DirectionP2.LEFT, Direction.LEFT],
]);

export function mapDirectionP2ToDirection(directionP2: DirectionP2): Direction {
  return MappedDirection.get(directionP2)!;
}
