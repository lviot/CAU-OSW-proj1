import './index.css';

import type {FC} from 'react';
import {observer} from 'mobx-react';
import InfoModal from '@components/info-modal';
import { Button, Title } from '@components/menus/common';
import store from '@stores/game-board';

export interface GameOverMenuProps {
  visible: boolean;
}

const GameOverMenu: FC<GameOverMenuProps> = observer(props => {
  return (
    <InfoModal visible={props.visible}>
      <Title />
      <Title content={`Score: ${store.score}`} />
      <div className="ButtonContainer">
        <Button title="PLAY AGAIN" onClick={store.launchGame} fullWidth />
        <Button title="BACK TO MAIN" onClick={store.stopGame} fullWidth />
      </div>
    </InfoModal>
  );
});

export default GameOverMenu;
