import './index.css';

import type { FC } from 'react';

import { useCallback, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import store, { GameBoardStore } from '@stores/game-board';
import { coordinatesToViewPosition } from '@utils/translate';
import { Direction, GameMode } from '@app/@types/index.d';
import { GameOverMenu, MainMenu, PauseMenu } from '@components/menus';
import RankingMenu from '@components/menus/ranking';
import { DirectionP2 } from '@app/utils/direction';

const GridHeight = 600;
const BlockSize = GridHeight / GameBoardStore.RowBlocksCount;
const PauseKey = 27; // ESC

const GameBoard: FC = observer(() => {
  const eventListener = useCallback(({ keyCode }: KeyboardEvent) => {
    if (!store.isAI && store.gameMode === GameMode.DualPlayer && Object.values(DirectionP2).includes(keyCode))
      store.setDirectionP2(keyCode);
    if (!store.isAI && Object.values(Direction).includes(keyCode))
      store.setDirection(keyCode);
    else if (keyCode === PauseKey) store.togglePause();
  }, [store.isAI]);

  const gridWidth = useMemo(() => {
    return (GameBoardStore.ColBlocksCount * GridHeight) / GameBoardStore.RowBlocksCount;
  }, [ GameBoardStore.ColBlocksCount ]);
  const containerStyle = useMemo(() => ({
    width: gridWidth,
    transform: `translateY(${GridHeight / 2 * -1}px)`
  }), [ gridWidth ]);
  const gameBoardStyle = useMemo(() => ({
    height: GridHeight,
    backgroundSize: `${gridWidth} ${gridWidth}`,
  }), [ gridWidth ]);

  useEffect(() => {
    document.addEventListener('keydown', eventListener);
    return () => {
      document.removeEventListener('keydown', eventListener);
    };
  }, []);

  return (
    <>
      <div className="Container" style={containerStyle}>
        <div className="GameBoard" style={gameBoardStyle}>
          {store.apple && <div className="AppleBlock" style={coordinatesToViewPosition(store.apple, BlockSize)} />}

          {store.snakeBlocksP1.map(({ coordinates: { x, y } }) => (
            <div key={`${x}-${y}`} className="SnakeBlock" style={coordinatesToViewPosition({ x, y }, BlockSize)} />
          ))}
          {store.gameMode === GameMode.DualPlayer && store.snakeBlocksP2.map(({ coordinates: { x, y } }) => (
            <div
              key={`${x}-${y}`}
              className="SnakeBlock"
              style={{ ...coordinatesToViewPosition({ x, y }, BlockSize), filter: 'invert(1)' }}
            />
          ))}
        </div>
      </div>

      <MainMenu visible={!store.running && !store.ranking} />
      <RankingMenu visible={!store.running && store.ranking} />
      <PauseMenu visible={store.pause} />
      <GameOverMenu visible={store.gameOver} />
    </>
  );
});

export default GameBoard;
