import './index.css';

import type { FC } from 'react';

import React from 'react';

export interface ButtonProps
{
  title: string,
  onClick?(): void,
  fullWidth?: boolean,
}

const Button: FC<ButtonProps> = (props) => {
  return (
    <button
      type="button"
      className="Button"
      onClick={props.onClick}
      style={{ ...props.fullWidth && { width: '100%' } }}
    >
      {props.title}
    </button>
  )
};

export default Button;
