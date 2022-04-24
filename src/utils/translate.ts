export function coordinatesToViewPosition(
  { x, y }: Coordinates2D,
  blockSize: number,
): { top: number, left: number }
{
  return { left: (x * blockSize) + 1, top: (y * blockSize) + 1 };
}

