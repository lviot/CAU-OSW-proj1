import './index.css';

import type { FC } from 'react';

import { useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import store, { GameBoardStore } from '@stores/game-board';
import { coordinatesToViewPosition } from '@utils/translate';
import { Direction } from '@app/@types/index.d';
import { MainMenu, PauseMenu, GameOverMenu } from '@components/menus';
import RankingMenu from '../menus/ranking';

const GridSize = 600;
const BlockSize = GridSize / GameBoardStore.BlocksCount;
const PauseKey = 32; // Space bar

const GameBoard: FC = observer(() => {
  const eventListener = useCallback(({ keyCode, ...e }: KeyboardEvent) => {
    if (Object.values(Direction).includes(keyCode)) store.setDirection(keyCode);
    else if (keyCode === PauseKey) store.togglePause();
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', eventListener);
    return () => {
      document.removeEventListener('keydown', eventListener);
    };
  }, []);

  return (
    <>
      <div className="Container">
        <div className="GameBoard">
          {store.apple && <div className="AppleBlock" style={coordinatesToViewPosition(store.apple, BlockSize)} />}

          {store.snakeBlocks.map(({ coordinates: { x, y } }) => (
            <div key={`${x}-${y}`} className="SnakeBlock" style={coordinatesToViewPosition({ x, y }, BlockSize)} />
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
