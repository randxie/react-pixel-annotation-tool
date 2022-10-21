import React, { useCallback, useState } from 'react';

import Grid from '@material-ui/core/Grid';

import { ImageCanvas } from './components/ImageCanvas';
import { Toolbar } from './components/Toolbar';
import { usePainter } from './hooks/usePainter';
import { useSelectedClass } from './hooks/useSelectedClass';
import { useImageScale } from './hooks/useImageScale';

const App = () => {
  // States used in multiple components
  const [canvasSize, setCanvasSize] = useState([window.innerWidth * 0.6, window.innerHeight * 0.8]);

  // References shared across components
  const maskRef = React.useRef();
  const imageRef = React.useRef();
  const toolbarGridRef = React.useRef();

  // Component properties
  const [{ ...painterState }, { ...painterApi }] = usePainter();
  const [{ ...selectedClassState }, { ...selectedClassApi }] = useSelectedClass();
  const [{ ...imageScaleState }, { ...imageScaleApi }] = useImageScale();

  const toolbarProps = {
    ...painterState,
    ...selectedClassState,
    ...imageScaleState,
    ...painterApi,
    ...selectedClassApi,
    ...imageScaleApi,
  };
  const imageCanvasProps = {
    ...painterState,
    ...imageScaleState,
    ...selectedClassState,
    ...painterApi,
    ...imageScaleApi,
    canvasSize,
  };

  return (
    <>
      <Grid container spacing={0}>
        <Grid item xs={2}>
          <Toolbar {...toolbarProps} maskRef={maskRef} imageRef={imageRef} toolbarGridRef={toolbarGridRef} />
        </Grid>
        <Grid item xs={10}>
          <ImageCanvas {...imageCanvasProps} maskRef={maskRef} imageRef={imageRef} />
        </Grid>
      </Grid>
    </>
  );
};

export default App;
