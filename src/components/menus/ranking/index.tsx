import './index.css';

import type { FC } from 'react';

import { useCallback } from 'react';
import { observer } from 'mobx-react';
import InfoModal from '@components/info-modal';
import { Button, Title } from '@components/menus/common';
import store from '@stores/game-board';

export interface RankingMenuProps {
  visible: boolean;
}

const RankingMenu: FC<RankingMenuProps> = observer(props => {
  const quitApp = useCallback(() => {
    window.Main.quitApp();
  }, []);

  return (
    <InfoModal visible={props.visible}>
      <Title content="Ranking TOP 5" />
      <div className="RankingContainer">
        {store
          .loadRanking()
          .sort((a: number, b: number) => b - a)
          .slice(0, 5)
          .map((item: number, index: number) => (
            <div key={index} className="RankingItem">
              <p>{item}</p>
            </div>
          ))}
      </div>
      <div className="ButtonContainer">
        <Button title="Go back" onClick={store.toggleRanking} fullWidth />
        <Button title="Quit" onClick={quitApp} fullWidth />
      </div>
    </InfoModal>
  );
});

export default RankingMenu;
