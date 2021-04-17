import { useCallback, useRef, useState } from 'react';
import colors from '../common/colors';

export const usePainter = () => {
  // Brush settings
  const [currentTool, setCurrentTool] = useState('pen');
  const [currentColor, setCurrentColor] = useState(colors[0]);
  const [currentWidth, setCurrentWidth] = useState(50);

  // For drawing mask
  const [lines, setLines] = useState([]);
  const [currentMaskOpacity, setCurrentMaskOpacity] = useState(0.4);

  const handleColor = (e: any) => {
    setCurrentColor(e);
  };

  const handleWidth = (e: any) => {
    setCurrentWidth(e.currentTarget.value);
  };

  const handleMaskOpacity = (e: any) => {
    setCurrentMaskOpacity(e.currentTarget.value / 100.0);
  };

  const handleTool = (e: string) => {
    setCurrentTool(e);
  };

  const handleClearMask = () => {
    setLines([]);
  };

  return [
    {
      currentWidth,
      currentColor,
      currentTool,
      currentMaskOpacity,
      lines,
    },
    {
      handleColor,
      handleWidth,
      handleTool,
      handleMaskOpacity,
      handleClearMask,
      setLines,
    },
  ] as any;
};
