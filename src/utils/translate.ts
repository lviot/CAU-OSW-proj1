import { Direction } from '@app/@types/index.d'

export function coordinatesToViewPosition(
  { x, y }: Coordinates2D,
  blockSize: number,
): { top: number, left: number }
{
  return { left: (x * blockSize) + 1, top: (y * blockSize) + 1 };
}

export function translateBlock(
  { x, y }: Coordinates2D,
  direction: Direction,
): Coordinates2D
{
  switch (direction)
  {
    case Direction.TOP:
      return { x, y: y - 1 };
    case Direction.RIGHT:
      return { x: x + 1, y };
    case Direction.BOTTOM:
      return { x, y: y + 1 };
    case Direction.LEFT:
      return { x: x - 1, y };
  }
}

