import { action, computed, makeAutoObservable, observable, toJS } from 'mobx';
import { Direction, GameMode } from '@app/@types/index.d';
import { translateBlock } from '@utils/translate';
import { randomCoordinatesExceptValues } from '@utils/math';
import eventStackStore from '@stores/event-stack';
import { DirectionP2, mapDirectionP2ToDirection } from '@utils/direction';

export interface SnakeBlock {
  coordinates: Coordinates2D;
  direction: Direction;
}

export enum Player {
  Player1,
  Player2,
}

const DefaultColSize = new Map<GameMode, number>([
  [GameMode.SinglePlayer, 40],
  [GameMode.DualPlayer, 80],
]);

export class GameBoardStore {
  static RowBlocksCount = 40;
  @observable static ColBlocksCount: number = DefaultColSize.get(GameMode.SinglePlayer)!;
  static Ticks = 1000 / 12;
  static InvalidDirectionChanges = new Map([
    [Direction.TOP, Direction.BOTTOM],
    [Direction.BOTTOM, Direction.TOP],
    [Direction.LEFT, Direction.RIGHT],
    [Direction.RIGHT, Direction.LEFT],
  ]);

  private _gameMode: GameMode = GameMode.SinglePlayer;
  private _snakeBlocksP1: SnakeBlock[] = [];
  private _snakeBlocksP2: SnakeBlock[] = [];
  private _previousStateP1: SnakeBlock[] = [];
  private _previousStateP2: SnakeBlock[] = [];
  private _scoreP1: number = 0;
  private _scoreP2: number = 0;
  private _apple: Coordinates2D = null!;
  private _gameLoopIntervalId: NodeJS.Timeout | null = null;
  private _running: boolean = false;
  private _pause: boolean = false;
  private _ranking: boolean = false;
  private _gameOver: boolean = false;
  private _playerWon: Player | null = null;
  private _isAI: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Game mode getter
   * @return {GameMode}
   */
  public get gameMode(): GameMode {
    return this._gameMode;
  }

  public get winner() {
    return this._playerWon;
  }

  @action.bound public stopGame = (): void => {
    this._playerWon = null;
    this._previousStateP1 = [];
    this._scoreP1 = 0;
    this._previousStateP2 = [];
    this._scoreP2 = 0;

    if (this._gameLoopIntervalId) clearInterval(this._gameLoopIntervalId);
    this._pause = false;
    this._running = false;
    this._gameOver = false;
    this._ranking = false;
  };

  /**
   * Game mode setter
   * @param mode
   */
  @action public set gameMode(mode: GameMode) {
    GameBoardStore.ColBlocksCount = DefaultColSize.get(mode)!;
    this._gameMode = mode;
  }

  /**
   * Player 1 snake blocks coordinates getter
   * @return {SnakeBlock[]}
   */
  public get snakeBlocksP1(): SnakeBlock[] {
    return this._snakeBlocksP1;
  }

  /**
   * Player 2 snake blocks coordinates getter
   * @return {SnakeBlock[]}
   */
  public get snakeBlocksP2(): SnakeBlock[] {
    return this._snakeBlocksP2;
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
   * Player 1 score getter
   * @return {number}
   */
  public get scoreP1(): number {
    return this._scoreP1;
  }

  /**
   * Player 2 score getter
   * @return {number}
   */
  public get scoreP2(): number {
    return this._scoreP1;
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
      snakeBlocksP1: toJS(this.snakeBlocksP1),
    });
  };

  /**
   * Load local state from a file
   * @return {void}
   */
  @action.bound public loadParty = () => {
    const loadedData = window.Main.loadFile();
    this.launchGame(loadedData.snakeBlocksP1, loadedData.apple);
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
    if (this._pause || GameBoardStore.InvalidDirectionChanges.get(direction) === this._snakeBlocksP1[0].direction)
      return;
    /*
     * Will be executed on the next tick:
     * This prevent multiple calls to setDirection, and
     * so the ability to move to the opposite direction
     */

    if (this._isAI) this._snakeBlocksP1[0].direction = direction;
    else {
      eventStackStore.push(() => {
        this._snakeBlocksP1[0].direction = direction;
      });
    }
  }

  @action public setDirectionP2(directionP2: DirectionP2): void {
    const direction = mapDirectionP2ToDirection(directionP2);
    if (this._pause || GameBoardStore.InvalidDirectionChanges.get(direction) === this._snakeBlocksP2[0].direction)
      return;
    eventStackStore.push(() => {
      this._snakeBlocksP2[0].direction = direction;
    });
  }

  @action private _initSinglePlayerGame(restoredBlocks?: SnakeBlock[], restoredApple?: Coordinates2D) {
    if (!Array.isArray(restoredBlocks)) {
      this._snakeBlocksP1 = [
        {
          direction: Direction.TOP,
          coordinates: {
            x: Math.ceil(GameBoardStore.ColBlocksCount / 2),
            y: Math.ceil(GameBoardStore.RowBlocksCount / 2),
          },
        },
      ];
    } else {
      restoredBlocks.forEach(block => {
        this._snakeBlocksP1.push(block);
      });
    }
    if (restoredApple) {
      this._apple = restoredApple;
    } else {
      this._spawnApple();
    }

    this._previousStateP1 = [];
    this._scoreP1 = 0;
  }

  @action private _initDualPlayerGame() {
    this._snakeBlocksP1 = [
      {
        direction: Direction.TOP,
        coordinates: { x: GameBoardStore.ColBlocksCount - 1, y: GameBoardStore.RowBlocksCount - 1 },
      },
    ];
    this._snakeBlocksP2 = [
      {
        direction: Direction.BOTTOM,
        coordinates: { x: 0, y: 0 },
      },
    ];

    this._spawnApple();

    this._playerWon = null;
    this._previousStateP1 = [];
    this._scoreP1 = 0;
    this._previousStateP2 = [];
    this._scoreP2 = 0;
  }

  /**
   * Init variables and launch game
   * @param {SnakeBlock[] | undefined} restoredBlocks
   * @param {Coordinates2D | undefined} restoredApple
   * @return {void}
   */
  @action public launchGame = (restoredBlocks?: SnakeBlock[], restoredApple?: Coordinates2D): void => {
    switch (this._gameMode) {
      case GameMode.SinglePlayer:
        this._initSinglePlayerGame(restoredBlocks, restoredApple);
        break;
      case GameMode.DualPlayer:
        this._initDualPlayerGame();
        break;
    }

    if (this._gameLoopIntervalId) clearInterval(this._gameLoopIntervalId);
    this._pause = false;
    this._running = true;
    this._gameOver = false;
    eventStackStore.clear();
    this._run();
  };

  /**
   * Spawn an apple anywhere except on snake's blocks position
   * @private
   * @return {void}
   */
  @action private _spawnApple(): void {
    let invalidValues = this._snakeBlocksP1.map(({ coordinates }) => coordinates);

    if (this.gameMode === GameMode.DualPlayer) {
      invalidValues = [...invalidValues, ...this._snakeBlocksP2.map(({ coordinates }) => coordinates)];
    }

    this._apple = randomCoordinatesExceptValues({
      x: { max: GameBoardStore.ColBlocksCount - 1 },
      y: { max: GameBoardStore.RowBlocksCount - 1 },
      invalidValues,
    });
  }

  /**
   * Check if snake hits the apple
   * @private
   * @param {Player | undefined} player
   * @returns {boolean}
   */
  @computed private _isHeadOnApple(player: Player = Player.Player1): boolean {
    const { coordinates } = (player === Player.Player1 ? this._snakeBlocksP1 : this._snakeBlocksP2)[0];
    return coordinates.x === this._apple.x && coordinates.y === this._apple.y;
  }

  /**
   * Add a block to the snake
   * @private
   * @return {void}
   */
  @action private _snakeGrowUp(player: Player = Player.Player1): void {
    const previousState = player === Player.Player1 ? this._previousStateP1 : this._previousStateP2;
    const snakeBlocks = player === Player.Player1 ? this._snakeBlocksP1 : this._snakeBlocksP2;
    const { coordinates, direction } = previousState[previousState.length - 1];
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
    if (player === Player.Player1) this._scoreP1++;
    else this._scoreP2++;
    snakeBlocks.push({ direction, coordinates: newCoordinates });
  }

  /**
   * Check collisions and returns true if game over
   * @private
   * @return {boolean}
   */
  private _checkCollisions(player: Player = Player.Player1): boolean {
    const snakeBlocks = player === Player.Player1 ? this._snakeBlocksP1 : this._snakeBlocksP2;
    const { coordinates, direction } = snakeBlocks[0];

    const checkWallCollision = () =>
      (coordinates.x === 0 && direction === Direction.LEFT) ||
      (coordinates.x >= GameBoardStore.ColBlocksCount - 1 && direction === Direction.RIGHT) ||
      (coordinates.y === 0 && direction === Direction.TOP) ||
      (coordinates.y >= GameBoardStore.RowBlocksCount - 1 && direction === Direction.BOTTOM);

    const checkSelfCollision = () => {
      const nextHeadCoordinates = translateBlock(coordinates, direction);

      if (snakeBlocks.length <= 1) return false;
      return snakeBlocks
        .slice(1)
        .some(({ coordinates }) => coordinates.x === nextHeadCoordinates.x && coordinates.y === nextHeadCoordinates.y);
    };

    const checkPlayersCollision = () => {
      const { coordinates: headCoordinates } = snakeBlocks[0];
      const enemySnakeBlocks = player === Player.Player1 ? this._snakeBlocksP2 : this._snakeBlocksP1;
      return enemySnakeBlocks.some(({ coordinates: { x, y } }) => headCoordinates.x === x && headCoordinates.y === y);
    };

    if (this._isHeadOnApple(player)) {
      this._snakeGrowUp(player);
      this._spawnApple();
    }

    if (this.gameMode === GameMode.DualPlayer && checkPlayersCollision()) {
      this._playerWon = player === Player.Player1 ? Player.Player2 : Player.Player1;
      return true;
    }

    if (checkWallCollision() || checkSelfCollision()) {
      this._playerWon = player === Player.Player1 ? Player.Player2 : Player.Player1;
      return true;
    }

    return false;
  }

  // look in the game baord and find wich move is better to go to the apple lcoation
  private getAINextMove(): void {
    const { coordinates, direction } = this._snakeBlocksP1[0];
    const appleCoordinates = this._apple;

    if (
      (coordinates.x === 0 && direction === Direction.LEFT) ||
      (coordinates.x === 39 && direction === Direction.RIGHT)
    ) {
      // if going straight toward a wall (left/right)
      this.setDirection(coordinates.y > appleCoordinates.y ? Direction.BOTTOM : Direction.TOP);
      return;
    }

    if (
      (coordinates.y === 0 && direction === Direction.TOP) ||
      (coordinates.y === 39 && direction === Direction.BOTTOM)
    ) {
      // if going straight toward a wall (top/bottom)
      this.setDirection(coordinates.x > appleCoordinates.x ? Direction.LEFT : Direction.RIGHT);
      return;
    }

    if (coordinates.y === appleCoordinates.y) {
      // on the same line
      this.setDirection(coordinates.x > appleCoordinates.x ? Direction.LEFT : Direction.RIGHT);
    } else if (coordinates.x === appleCoordinates.x) {
      // on the same column
      this.setDirection(coordinates.y > appleCoordinates.y ? Direction.TOP : Direction.BOTTOM);
    } else {
      // on a diagonal
      if (coordinates.y > appleCoordinates.y) {
        // apple is on the top
        if (direction === Direction.BOTTOM)
          this.setDirection(coordinates.x > appleCoordinates.x ? Direction.LEFT : Direction.RIGHT);
        else this.setDirection(Direction.TOP);
      } else {
        // apple is on the bottom
        if (direction === Direction.TOP)
          this.setDirection(coordinates.x > appleCoordinates.x ? Direction.LEFT : Direction.RIGHT);
        else this.setDirection(Direction.BOTTOM);
      }
    }
  }

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

        if (this.gameMode === GameMode.DualPlayer) {
          if (this._checkCollisions(Player.Player2) || this._checkCollisions(Player.Player1)) this._gameOver = true;
        } else this._gameOver = this._checkCollisions();

        if (this._gameOver) {
          this._running = false;

          if (this.gameMode === GameMode.SinglePlayer && !this._isAI) window.Main.saveRanking(this._scoreP1);
          if (this._gameLoopIntervalId) clearInterval(this._gameLoopIntervalId);

          return;
        }

        this._snakeBlocksP1.forEach((block, index) => {
          const direction = this._previousStateP1?.[index - 1]?.direction ?? this._snakeBlocksP1[index].direction;
          const coordinates = translateBlock(block.coordinates, direction);

          this._snakeBlocksP1[index] = { direction, coordinates };
        });

        this._snakeBlocksP2.forEach((block, index) => {
          const direction = this._previousStateP2?.[index - 1]?.direction ?? this._snakeBlocksP2[index].direction;
          const coordinates = translateBlock(block.coordinates, direction);

          this._snakeBlocksP2[index] = { direction, coordinates };
        });

        this._previousStateP1 = toJS(this._snakeBlocksP1);
        if (this.gameMode === GameMode.DualPlayer) this._previousStateP2 = toJS(this._snakeBlocksP2);
        if (this._isAI) this.getAINextMove();
      }),
      GameBoardStore.Ticks / (this._isAI ? 2 : 1)
    );
  }
}

export default new GameBoardStore();
