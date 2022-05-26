import './index.css';

import type { FC } from 'react';

import { useCallback } from 'react';
import { observer } from 'mobx-react';
import InfoModal from '@components/info-modal';
import { Button, Title } from '@components/menus/common';
import store from '@stores/game-board';

export interface MainMenuProps {
  visible: boolean;
}

const MainMenu: FC<MainMenuProps> = observer(props => {
  const quitApp = useCallback(() => {
    window.Main.quitApp();
  }, []);

  return (
    <InfoModal visible={props.visible}>
      <Title />
      <div className="ButtonContainer">
        <Button title="SINGLE PLAY" onClick={store.launchGame} fullWidth />
        <Button title="AUTO PLAY " onClick={store.lanchAiGame} fullWidth />
        <Button title="LOAD" onClick={store.loadParty} fullWidth />
        <Button title="RANKING" onClick={store.toggleRanking} fullWidth />
        <Button title="QUIT" onClick={quitApp} fullWidth />
      </div>
    </InfoModal>
  );
});

export default MainMenu;
