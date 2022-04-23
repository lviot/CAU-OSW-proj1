import './index.css'

import type { FC, PropsWithChildren } from 'react';

import { observer } from 'mobx-react';
import Modal from 'react-modal';

export interface InfoModalProps
{
  visible: boolean,
}

const InfoModal: FC<PropsWithChildren<InfoModalProps>> = observer((props) => {
  return (
    <Modal
      ariaHideApp={false}
      className="Modal"
      overlayClassName="Overlay"
      isOpen={props.visible}
    >
        {props.children}
    </Modal>
  );
});

export default InfoModal;
