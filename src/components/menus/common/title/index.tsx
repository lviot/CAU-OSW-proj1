import './index.css'

import type { FC } from 'react';

export interface TitleProps
{
  content?: string,
  style?: Record<string, any>
}

const Title: FC<TitleProps> = ({
  content = 'Snake',
  style = {},
}) => {
  return <h1 className="Title" style={style}>{content}</h1>
};

export default Title;
