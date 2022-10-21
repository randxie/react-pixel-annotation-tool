import React, { Ref, useCallback, useState } from 'react';

import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import * as muiColors from '@material-ui/core/colors';
import Grid from '@material-ui/core/Grid';
import BallotIcon from '@material-ui/icons/Ballot';
import cv, { map } from '@techstark/opencv-js';

import colors from '../common/colors';
import ALL_CLASSES from '../common/config';
import { hexToRgb, rgbToHex } from '../utils/ColorConversion';
import { BrushPreview } from './BrushPreview';
import ClassSelectionMenu from './ClassSelectionMenu';
import SidebarBoxContainer from './SideBarBoxContainer';
import ToolSelectionMenu from './ToolSelectionMenu';

const maskPixelMultiplier: number = 5;

export const Toolbar: React.FC<any> = ({
  currentWidth,
  currentColor,
  currentMaskOpacity,
  currentTool,
  selectedClass,
  imageScale,
  handleColor,
  handleWidth,
  handleTool,
  handleMaskOpacity,
  handleClearMask,
  handleSelectedClass,
  handleImageScale,
  imageRef,
  maskRef,
  toolbarGridRef,
}) => {
  const canvasRef = React.useRef();

  // Change mask for watershed algorithm and return a reset func
  // to go back to previous states. It behaves like context manager.
  const makeMaskMutationResetFn = (mask, changeColor) => {
    const originOpacity = currentMaskOpacity;
    const shouldChangeColor = changeColor;

    mask?.getChildren().each((node) => {
      node.opacity(1);
      if (shouldChangeColor) {
        const maskIdx = ALL_CLASSES.indexOf(node.name()) + 1;
        if (node.name() !== 'eraser') {
          // We can not turn off anti-aliasing in canvas shape. Offset the maskIdx so that
          // it's easier to post-process.
          const pixelValue = maskPixelMultiplier * maskIdx;
          node.stroke(rgbToHex(pixelValue, pixelValue, pixelValue));
        } else {
          node.stroke(rgbToHex(0, 0, 0));
        }
      }
    });

    function resetMask() {
      // Set mask back to original state
      mask?.getChildren().each((node) => {
        if (shouldChangeColor) {
          const index = ALL_CLASSES.indexOf(node.name());
          node.stroke(colors[index % colors.length]);
        }
        node.opacity(originOpacity);
      });
    }
    return resetMask;
  };

  const handleWatershed = () => {
    const currentMask = maskRef?.current;
    if (currentMask === null) {
      return;
    }

    if (imageRef?.current) {
      // Load both image and mask
      const imageMat = cv.imread(imageRef?.current?.toCanvas());
      cv.cvtColor(imageMat, imageMat, cv.COLOR_RGBA2RGB);

      const resetMaskFn = makeMaskMutationResetFn(currentMask, true);
      const maskMat = cv.imread(currentMask?.toCanvas());
      cv.cvtColor(maskMat, maskMat, cv.COLOR_RGBA2RGB);
      resetMaskFn();

      const rgbPlanes = new cv.MatVector();
      maskMat.convertTo(maskMat, cv.CV_32S);
      cv.split(maskMat, rgbPlanes);
      maskMat.delete();

      // Create marker for watershed algorithm by summing all channels
      const marker = new cv.Mat();
      cv.add(rgbPlanes.get(0), rgbPlanes.get(1), marker);
      cv.add(marker, rgbPlanes.get(2), marker);
      rgbPlanes.delete();

      // Use find contour to handle anti-aliasing issue.
      const contours = new cv.MatVector();
      const hierachy = new cv.Mat();
      cv.findContours(marker, contours, hierachy, cv.RETR_CCOMP, cv.CHAIN_APPROX_NONE);
      cv.drawContours(marker, contours, -1, new cv.Scalar(0), 4);
      contours.delete();
      hierachy.delete();

      // Use watershed to fill unknown label in the marker Mat.
      cv.watershed(imageMat, marker);
      imageMat.delete();

      if (canvasRef) {
        marker.convertTo(marker, -1, 1.0 / (maskPixelMultiplier * 3));
        marker.convertTo(marker, cv.CV_8UC1);

        const coloredMask = new cv.Mat();
        const mergedPlanes = new cv.MatVector();
        mergedPlanes.push_back(marker);
        mergedPlanes.push_back(marker);
        mergedPlanes.push_back(marker);
        cv.merge(mergedPlanes, coloredMask);

        marker.delete();
        mergedPlanes.delete();

        // Render the marker into colored mask. The color has been predefined for different classes.
        // let coloredMask = new cv.Mat(marker.rows, marker.cols, cv.CV_8UC3, new cv.Scalar(0, 0, 0));
        const colorMap = ALL_CLASSES.map((cls) => {
          const index = ALL_CLASSES.indexOf(cls);
          return hexToRgb(colors[index % colors.length]);
        });

        // Performance warning!! This part be slow.
        for (let x = 0; x < coloredMask.rows; x++) {
          const row = coloredMask.row(x);
          for (let y = 0; y < coloredMask.cols; y++) {
            const elem = row.col(y);
            const cls = elem.data[0];
            if (cls > 0 && cls <= ALL_CLASSES.length) {
              const colorVec = colorMap[cls - 1];
              if (colorVec) {
                elem.data[0] = colorVec[0];
                elem.data[1] = colorVec[1];
                elem.data[2] = colorVec[2];
              }
            }
          }
        }
        cv.imshow(canvasRef?.current, coloredMask);
        coloredMask.delete();
      }
    }
  };

  const handleClear = () => {
    handleClearMask();
  };

  const handleDownload = (mask, name) => {
    if (mask?.current === null) {
      return;
    }

    const link = Array.from(document.getElementsByTagName('a')).find(
      (a) => a.download === name,
    );

    const resetMaskFn = makeMaskMutationResetFn(mask.current, false);

    if (!link) {
      const link = document.createElement('a');
      link.download = name;
      link.href = mask.current.toDataURL();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    resetMaskFn();
  };

  return (
    <aside>
      <div>
        <SidebarBoxContainer
          title="Mask Preview"
          icon={<BallotIcon style={{ color: muiColors.grey[700] }} />}
        >
          <canvas
            ref={canvasRef}
            width={toolbarGridRef ? toolbarGridRef.current ? toolbarGridRef.current.offsetWidth : 0 : 0}
            height={120}
          />
        </SidebarBoxContainer>

        <Grid direction="column" spacing={4}>
          <Grid>
            <div className="tool-section tool-section--lrg">
              <small>
                <strong>Image Operations</strong>
              </small>
            </div>
            <ButtonGroup
              color="primary"
              aria-label="outlined primary button group"
            >
              <Button
                onClick={handleWatershed}
              >
                Watershed
              </Button>

              <Button
                onClick={() => { handleDownload(maskRef, 'mask.png'); }}
              >
                Save
              </Button>

              <Button
                onClick={handleClear}
              >
                Clear
              </Button>
            </ButtonGroup>

            <div className="tool-section">
              <small>
                <strong>Image Scale</strong>
              </small>
              <input
                value={imageScale}
                defaultValue="1"
                type="range"
                step="0.1"
                min="0.1"
                max="5"
                onChange={handleImageScale}
              />
            </div>
          </Grid>
          <Grid>
            <div className="tool-section tool-section--lrg">
              <small>
                <strong>Brush Preview</strong>
              </small>
              <BrushPreview
                currentWidth={currentWidth}
                currentColor={currentColor}
              />
            </div>
          </Grid>
          <Grid>
            <div className="tool-section tool-section--lrg">
              <div className="tool-section">
                <small>
                  <strong>Brush size</strong>
                </small>
              </div>
              <div className="tool-section">
                <input
                  defaultValue="50"
                  type="range"
                  min="10"
                  max="90"
                  onChange={handleWidth}
                />
              </div>
              <div className="tool-section">
                <small>
                  <strong>Mask Opacity</strong>
                </small>
              </div>
              <div className="tool-section">
                <input
                  defaultValue="40"
                  type="range"
                  step="1"
                  min="20"
                  max="100"
                  onChange={handleMaskOpacity}
                />
              </div>
            </div>
          </Grid>

          <Grid>
            <div className="tool-section tool-section--lrg">
              <div className="tool-section">
                <small>
                  <strong>Drawing Mode</strong>
                </small>
              </div>
              <ToolSelectionMenu
                selectedTool={currentTool}
                onSelectTool={(label: string) => {
                  handleTool(label);
                }}
              />
            </div>
          </Grid>

          <Grid>
            <div className="tool-section tool-section--lrg">
              <div className="tool-section">
                <small>
                  <strong>Class Selection</strong>
                </small>
              </div>
              <ClassSelectionMenu
                selectedCls={selectedClass}
                regionClsList={ALL_CLASSES}
                onSelectCls={(label: string) => {
                  handleSelectedClass(label);
                  handleColor(colors[ALL_CLASSES.indexOf(label) % colors.length]);
                }}
              />
            </div>
          </Grid>
        </Grid>
      </div>

    </aside>
  );
};
