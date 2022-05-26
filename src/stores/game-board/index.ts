import { action, computed, makeAutoObservable, toJS } from 'mobx';
import { Direction } from '@app/@types/index.d';
import { translateBlock } from '@utils/translate';
import { randomCoordinatesExceptValues } from '@utils/math';
import eventStackStore from '@stores/event-stack';

export interface SnakeBlock {
  coordinates: Coordinates2D;
  direction: Direction;
}

export class GameBoardStore {
  static BlocksCount = 40;
  static Ticks = 1000 / 12;
  static InvalidDirectionChanges = new Map([
    [Direction.TOP, Direction.BOTTOM],
    [Direction.BOTTOM, Direction.TOP],
    [Direction.LEFT, Direction.RIGHT],
    [Direction.RIGHT, Direction.LEFT],
  ]);

  private _snakeBlocks: SnakeBlock[] = [];
  private _previousState: SnakeBlock[] = [];
  private _apple: Coordinates2D = null!;
  private _gameLoopIntervalId: NodeJS.Timeout | null = null;
  private _score: number = 0;
  private _running: boolean = false;
  private _pause: boolean = false;
  private _ranking: boolean = false;
  private _gameOver: boolean = false;
  private _isAI: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Snake blocks coordinates getter
   * @return {SnakeBlock[]}
   */
  public get snakeBlocks(): SnakeBlock[] {
    return this._snakeBlocks;
  }

  /**
   * Apple coordinates getter
   * @return {Coordinates2D}
   */
  public get apple(): Coordinates2D {
    return this._apple;
  }

  /**
   * Pause getter
   * @return {boolean}
   */
  public get pause(): boolean {
    return this._pause;
  }

  /**
   * Running getter
   * @return {boolean}
   */
  public get running(): boolean {
    return this._running;
  }

  /**
   * Ranking getter
   * @return {boolean}
   */
  public get ranking(): boolean {
    return this._ranking;
  }

  /**
   * Game over getter
   * @return {boolean}
   */
  public get gameOver(): boolean {
    return this._gameOver;
  }

  /**
   * Score getter
   * @return {number}
   */
  public get score(): number {
    return this._score;
  }

  /**
   * Score getter
   * @return {number}
   */
  public get isAI(): boolean {
    return this._isAI;
  }

  /**
   * Toggle pause state
   * @return {void}
   */
  @action.bound public togglePause = () => {
    this._pause = !this._pause;
  };

  /**
   * Toggle ranking state
   * @return {number[]}
   */
  @action.bound public toggleRanking = () => {
    this._ranking = !this._ranking;
  };

  /**
   * Save current state in a local file
   * @return {void}
   */
  @action.bound public saveParty = () => {
    window.Main.saveFile({
      apple: toJS(this.apple),
      snakeBlocks: toJS(this.snakeBlocks),
    });
  };

  /**
   * Load local state from a file
   * @return {void}
   */
  @action.bound public loadParty = () => {
    const loadedData = window.Main.loadFile();
    this.launchGame(loadedData.snakeBlocks, loadedData.apple);
  };

  /**
   * Toggle ranking state
   * @return {number[]}
   */
  @action.bound public loadRanking = () => {
    return window.Main.loadRanking();
  };

  /**
   * Load local state from a file
   * @return {void}
   */
  @action.bound public lanchAiGame = () => {
    this._isAI = true;
    this.launchGame();
  };

  /**
   * Change snake direction
   *
   * If new direction is the opposite of te current one, function has no effect
   * @param {Direction} direction
   * @return {void}
   */
  @action public setDirection(direction: Direction): void {
    if (this._pause || GameBoardStore.InvalidDirectionChanges.get(direction) === this._snakeHead.direction) return;
    /*
     * Will be executed on the next tick:
     * This prevent multiple calls to setDirection, and
     * so the ability to move to the opposite direction
     */
    eventStackStore.push(() => {
      this._snakeHead.direction = direction;
    });
  }

  /**
   * Init variables and launch game
   * @param {SnakeBlock[] | undefined} restoredBlocks
   * @return {void}
   */
  @action public launchGame = (restoredBlocks?: SnakeBlock[], restoredApple?: Coordinates2D): void => {
    if (!Array.isArray(restoredBlocks)) {
      this._snakeBlocks = [
        {
          direction: Direction.TOP,
          coordinates: {
            x: Math.ceil(GameBoardStore.BlocksCount / 2),
            y: Math.ceil(GameBoardStore.BlocksCount / 2),
          },
        },
      ];
    } else {
      restoredBlocks.forEach(block => {
        this._snakeBlocks.push(block);
      });
    }

    if (restoredApple) {
      this._apple = restoredApple;
    } else {
      this._spawnApple();
    }

    if (this._gameLoopIntervalId) clearInterval(this._gameLoopIntervalId);
    this._score = 0;
    this._pause = false;
    this._running = true;
    this._gameOver = false;
    this._previousState = [];
    eventStackStore.clear();
    this._run();
  };

  /**
   * Spawn an apple anywhere except on snake's blocks position
   * @private
   * @return {void}
   */
  @action private _spawnApple(): void {
    this._apple = randomCoordinatesExceptValues(
      0,
      GameBoardStore.BlocksCount - 1,
      this._snakeBlocks.map(({ coordinates }) => coordinates)
    );
  }

  /**
   * Returns snake head
   * @private
   * @return {SnakeBlock}
   */
  @computed private get _snakeHead(): SnakeBlock {
    return this._snakeBlocks[0];
  }

  /**
   * Returns snake tail
   * @private
   * @return {SnakeBlock}
   */
  @computed private get _snakeTail(): SnakeBlock {
    return this._snakeBlocks[this._snakeBlocks.length - 1];
  }

  /**
   * Check if snake hits the apple
   * @private
   * @returns {boolean}
   */
  @computed private get _isHeadOnApple(): boolean {
    const { coordinates } = this._snakeHead;
    return coordinates.x === this._apple.x && coordinates.y === this._apple.y;
  }

  /**
   * Add a block to the snake
   * @private
   * @return {void}
   */
  @action private _snakeGrowUp(): void {
    const { coordinates, direction } = this._previousState[this._previousState.length - 1];
    let newCoordinates: Coordinates2D;

    switch (direction) {
      case Direction.TOP:
        newCoordinates = { x: coordinates.x, y: coordinates.y + 1 };
        break;
      case Direction.RIGHT:
        newCoordinates = { x: coordinates.x - 1, y: coordinates.y };
        break;
      case Direction.BOTTOM:
        newCoordinates = { x: coordinates.x, y: coordinates.y - 1 };
        break;
      case Direction.LEFT:
        newCoordinates = { x: coordinates.x + 1, y: coordinates.y };
        break;
    }
    this._score++;
    this._snakeBlocks.push({ direction, coordinates: newCoordinates });
  }

  /**
   * Check collisions and returns true if game over
   * @private
   * @return {boolean}
   */
  private _checkCollisions(): boolean {
    const { coordinates, direction } = this._snakeHead;

    const checkWallCollision = () =>
      (coordinates.x === 0 && direction === Direction.LEFT) ||
      (coordinates.x >= GameBoardStore.BlocksCount - 1 && direction === Direction.RIGHT) ||
      (coordinates.y === 0 && direction === Direction.TOP) ||
      (coordinates.y >= GameBoardStore.BlocksCount - 1 && direction === Direction.BOTTOM);

    const checkSelfCollision = () => {
      const nextHeadCoordinates = translateBlock(coordinates, direction);

      if (this._snakeBlocks.length <= 1) return false;
      return this._snakeBlocks
        .slice(1)
        .some(({ coordinates }) => coordinates.x === nextHeadCoordinates.x && coordinates.y === nextHeadCoordinates.y);
    };

    if (this._isHeadOnApple) {
      this._snakeGrowUp();
      this._spawnApple();
    }

    return checkWallCollision() || checkSelfCollision();
  }

  // look in the game baord and find wich move is better to go to the apple lcoation
  private getAINextMove(): void {}

  /**
   * Game loop
   * @private
   * @return {void}
   */
  private _run(): void {
    this._gameLoopIntervalId = setInterval(
      action(() => {
        if (this._pause) return;

        eventStackStore.executeStack().catch(console.warn);
        if (this._isAI) this.getAINextMove();

        this._gameOver = this._checkCollisions();
        if (this._gameOver) {
          this._running = false;
          window.Main.saveRanking(this._score);
          if (this._gameLoopIntervalId) clearInterval(this._gameLoopIntervalId);
          return;
        }

        this._snakeBlocks.forEach((block, index) => {
          const direction = this._previousState?.[index - 1]?.direction ?? this._snakeBlocks[index].direction;
          const coordinates = translateBlock(block.coordinates, direction);

          this._snakeBlocks[index] = { direction, coordinates };
        });

        this._previousState = toJS(this._snakeBlocks);
      }),
      GameBoardStore.Ticks
    );
  }
}

export default new GameBoardStore();
