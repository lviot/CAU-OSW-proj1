export interface RandomCoordinatesArgs {
  x: { min?: number; max: number };
  y: { min?: number; max: number };
  invalidValues: Coordinates2D[];
  quantity: number;
  targetIndex: number | undefined;
  apples: Coordinates2D[];
}

export function randomCoordinatesExceptValues(args: RandomCoordinatesArgs): Coordinates2D[] {
  const { x, y, invalidValues, quantity, targetIndex, apples } = args;

  if (targetIndex === undefined) {
    // spawn all apples
    const ret: Coordinates2D[] = [];
    while (ret.length < quantity) {
      const newAppleCoords = {
        x: Math.floor(Math.random() * (x.max - (x.min ?? 0) + 1)),
        y: Math.floor(Math.random() * (y.max - (y.min ?? 0) + 1)),
      };
      if (invalidValues.some(({ x, y }) => x === newAppleCoords.x && y === newAppleCoords.y)) continue;
      if (ret.some(({ x, y }) => x === newAppleCoords.x && y === newAppleCoords.y)) continue;
      ret.push(newAppleCoords);
    }
    return ret;
  }

  // spawn apple of target index

  do {
    apples[targetIndex] = {
      x: Math.floor(Math.random() * (x.max - (x.min ?? 0) + 1)),
      y: Math.floor(Math.random() * (y.max - (y.min ?? 0) + 1)),
    };
  } while (
    invalidValues.some(({ x, y }) => x === apples[targetIndex].x && y === apples[targetIndex].y) &&
    apples.some(({ x, y }, index) => {
      if (index === targetIndex) return false;
      return x === apples[targetIndex].x && y === apples[targetIndex].y;
    })
  );

  return apples;
}
