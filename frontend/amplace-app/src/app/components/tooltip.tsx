import React from 'react';
import { useTooltip } from './tooltipContext';

const Tooltip: React.FC = () => {
  const { tooltip, mousePosition } = useTooltip();

  return tooltip ? (
    <div
      className="mc-tooltip"
      style={{
        position: 'absolute',
        top: mousePosition.y,
        left: mousePosition.x,
        transform: 'translate(-50%, -100%)',
        backgroundColor: 'white',
        border: '1px solid black',
        padding: '5px',
        zIndex: 1000,
      }}
    >
      <div className="text-xl">{tooltip}</div>
    </div>
  ) : null;
};

export default Tooltip;
