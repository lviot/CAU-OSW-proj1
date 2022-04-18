import './index.css'

import type { FC } from 'react';

import React, { useCallback } from 'react';
import { observer } from 'mobx-react';
import InfoModal from '@components/info-modal';
import { Button, Title } from '@components/menus/common';
import store from '@stores/game-board';

export interface GameOverMenuProps
{
  visible: boolean,
}

const GameOverMenu: FC<GameOverMenuProps> = observer((props) => {
  const quitApp = useCallback(() => {
    window.Main.quitApp();
  }, []);

  return (
    <InfoModal visible={props.visible}>
      <Title />
      <Title content={`Score: ${store.score}`} />
      <div className="ButtonContainer">
        <Button title="Play again" onClick={store.launchGame} fullWidth />
        <Button title="Exit" onClick={quitApp} fullWidth />
      </div>
    </InfoModal>
  )
});

export default GameOverMenu;
