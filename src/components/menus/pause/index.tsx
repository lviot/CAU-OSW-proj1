import './index.css';

import type { FC } from 'react';

import { observer } from 'mobx-react';
import InfoModal from '@components/info-modal';
import { Button, Title } from '@components/menus/common';
import store from '@stores/game-board';
import { GameMode } from '@app/@types/index.d';

export interface PauseMenuProps {
  visible: boolean;
}

const PauseMenu: FC<PauseMenuProps> = observer(props => {
  return (
    <InfoModal visible={props.visible}>
      <Title />
      <div className="ButtonContainer">
        <Button title="RESUME" onClick={store.togglePause} fullWidth />
        <Button title="RESTART" onClick={store.launchGame} fullWidth />
        {store.gameMode !== GameMode.DualPlayer && (
          <>
            <Button title="SAVE" onClick={store.saveParty} fullWidth />
            <Button title="LOAD" onClick={store.loadParty} fullWidth />
          </>
        )}
        <Button
          title="BACK TO MAIN"
          onClick={() => {
            store.gameMode = GameMode.SinglePlayer;
            store.stopGame();
          }}
          fullWidth
        />
      </div>
    </InfoModal>
  );
});

export default PauseMenu;
