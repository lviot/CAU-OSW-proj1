export interface RandomCoordinatesArgs {
  x: { min?: number, max: number },
  y: { min?: number, max: number },
  invalidValues: Coordinates2D[],
}

export function randomCoordinatesExceptValues(args: RandomCoordinatesArgs): Coordinates2D {
  const { x, y, invalidValues } = args;
  let random: Coordinates2D;

  do {
    random = {
      x: Math.floor(Math.random() * (x.max - (x.min ?? 0) + 1)),
      y: Math.floor(Math.random() * (y.max - (y.min ?? 0) + 1)),
    };
  } while (invalidValues.some(({ x, y }) => x === random.x && y === random.y));

  return random;
}
