import './index.css'

import type { FC } from 'react';

import { useCallback } from 'react';
import { observer } from 'mobx-react';
import InfoModal from '@components/info-modal';
import { Button, Title } from '@components/menus/common';
import store from '@stores/game-board';

export interface PauseMenuProps
{
  visible: boolean,
}

const PauseMenu: FC<PauseMenuProps> = observer((props) => {
  const quitApp = useCallback(() => {
    window.Main.quitApp();
  }, []);

  return (
    <InfoModal visible={props.visible}>
      <Title />
      <div className="ButtonContainer">
        <Button title="Resume" onClick={store.togglePause} fullWidth />
        <Button title="Restart" onClick={store.launchGame} fullWidth />
        <Button title="Save" fullWidth />
        <Button title="Exit" onClick={quitApp} fullWidth />
      </div>
    </InfoModal>
  )
});

export default PauseMenu;
