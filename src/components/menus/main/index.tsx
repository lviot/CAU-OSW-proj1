import './index.css'

import type { FC } from 'react';

import { useCallback } from 'react';
import { observer } from 'mobx-react';
import InfoModal from '@components/info-modal';
import { Button, Title } from '@components/menus/common';
import store from '@stores/game-board';

export interface MainMenuProps
{
  visible: boolean,
}

const MainMenu: FC<MainMenuProps> = observer((props) => {
  const quitApp = useCallback(() => {
    window.Main.quitApp();
  }, []);

  return (
    <InfoModal visible={props.visible}>
      <Title />
      <div className="ButtonContainer">
        <Button title="Play" onClick={store.launchGame} fullWidth />
        <Button title="Load" fullWidth />
        <Button title="Ranking" fullWidth />
        <Button title="Quit" onClick={quitApp} fullWidth />
      </div>
    </InfoModal>
  )
});

export default MainMenu;
