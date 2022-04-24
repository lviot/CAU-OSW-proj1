export function randomCoordinatesExceptValues(
  min: number,
  max: number,
  invalidValues: Coordinates2D[],
): Coordinates2D
{
  let random: Coordinates2D;

  do {
    random = {
      x: Math.floor(Math.random() * (max - min + 1)),
      y: Math.floor(Math.random() * (max - min + 1)),
    };
  } while (invalidValues.some(({ x, y }) => x === random.x && y === random.y))

  return random;
}
