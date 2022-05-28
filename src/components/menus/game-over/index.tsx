import './index.css';

import type { FC } from 'react';

import { observer } from 'mobx-react';
import InfoModal from '@components/info-modal';
import { Button, Title } from '@components/menus/common';
import store, { Player } from '@stores/game-board';
import { GameMode } from '@app/@types/index.d';

export interface GameOverMenuProps {
  visible: boolean;
}

const GameOverMenu: FC<GameOverMenuProps> = observer(props => {
  return (
    <InfoModal visible={props.visible}>
      <Title />
      {store.gameMode === GameMode.SinglePlayer
        ? (
          <Title content={`Score: ${store.scoreP1}`} />
        )
        : (
          <Title content={`Player ${store.winner === Player.Player1 ? 1 : 2} won!`} />
        )}
      <div className="ButtonContainer">
        <Button title="PLAY AGAIN" onClick={store.launchGame} fullWidth />
        <Button title="BACK TO MAIN" onClick={store.stopGame} fullWidth />
      </div>
    </InfoModal>
  );
});

export default GameOverMenu;
