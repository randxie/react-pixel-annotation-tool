import React from 'react';
import { Image, Layer, Line, Stage } from 'react-konva';
import useImage from 'use-image';

import exampleImage from '../common/example.story.jpg';

export const ImageCanvas: React.FC<any> = ({
    currentWidth,
    currentColor,
    currentTool,
    currentMaskOpacity,
    selectedClass,
    imageScale,
    lines,
    handleImageScale,
    setLines,
    imageRef,
    maskRef,
}) => {
    let width = currentWidth
    let widthHalf = currentWidth / 2

    const isDrawing = React.useRef(false);
    const [image, status] = useImage(exampleImage, "Anonymous");

    /* Handle mouse events */
    const handleMouseEnter = (e) => {
        const stage = e.target.getStage();
        stage.container().style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="%23000000" opacity="0.3" height="${width}" viewBox="0 0 ${width} ${width}" width="${width}"><circle cx="${widthHalf}" cy="${widthHalf}" r="${widthHalf}" fill="%23000000" /></svg>') ${widthHalf} ${widthHalf}, auto`;
    }

    const handleMouseLeave = (e) => {
        const stage = e.target.getStage();
        stage.container().style.cursor = "default";
        isDrawing.current = false;
    }

    const handleMouseDown = (e) => {
        if (currentTool !== "none") {
            isDrawing.current = true;
        }

        const pos = e.target.getStage().getPointerPosition();
        let tool = currentTool
        let scale = imageScale
        setLines([...lines, { tool, scale, selectedClass, currentWidth, currentColor, points: [pos.x, pos.y] }]);
    };

    const handleMouseMove = (e) => {
        // no drawing - skipping
        if (!isDrawing.current) {
            return;
        }
        const stage = e.target.getStage();

        const point = stage.getPointerPosition();
        let lastLine = lines[lines.length - 1];

        // add point
        lastLine.points = lastLine.points.concat([point.x, point.y]);

        // replace last
        lines.splice(lines.length - 1, 1, lastLine);
        setLines(lines.concat());
    };

    const handleMouseUp = () => {
        isDrawing.current = false;
    };

    const scaleEachScroll = 1.02;
    const handleWheel = (e) => {
        e.evt.preventDefault();
        const stage = e.target.getStage();
        var newScale =
            e.evt.deltaY > 0 ? imageScale * scaleEachScroll : imageScale / scaleEachScroll;

        handleImageScale(newScale)
        stage.batchDraw();
    };

    return (
        <div
            id="container"
            style={{ backgroundColor: '#E8E8E8', height: window.innerHeight }}
        >
            <Stage
                width={image ? imageScale * image.width : 0}
                height={image ? imageScale * image.height : 0}
                onMouseDown={handleMouseDown}
                onMousemove={handleMouseMove}
                onMouseup={handleMouseUp}
                onWheel={handleWheel}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                draggable={false}
            >
                <Layer
                    ref={imageRef}
                    imageSmoothingEnabled={false}
                >
                    <Image
                        x={0}
                        y={0}
                        width={image ? imageScale * image.width : 0}
                        height={image ? imageScale * image.height : 0}
                        image={image}
                        draggable={false} />
                </Layer>
                <Layer
                    draggable={false}
                    ref={maskRef}
                >
                    {lines.map((line, i) => (
                        <Line
                            name={line.tool === 'eraser' ? 'eraser' : line.selectedClass}
                            key={i}
                            points={line.points}
                            scaleX={imageScale / line.scale}
                            scaleY={imageScale / line.scale}
                            fill={line.currentColor}
                            stroke={line.currentColor}
                            strokeWidth={line.currentWidth}
                            tension={1}
                            lineCap="round"
                            globalCompositeOperation={
                                line.tool === 'eraser' ? 'destination-out' : 'source-over'
                            }
                            opacity={line.tool === 'eraser' ? 1 : currentMaskOpacity}
                            draggable={false}
                        />
                    ))}
                </Layer>
            </Stage>
        </div >
    );
};
