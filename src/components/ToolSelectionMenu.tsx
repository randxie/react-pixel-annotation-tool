import classnames from 'classnames';
import capitalize from 'lodash/capitalize';
import React, { useEffect } from 'react';

import * as muiColors from '@material-ui/core/colors';
import { styled } from '@material-ui/core/styles';

const LabelContainer = styled('div')({
    display: 'flex',
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 16,
    paddingRight: 16,
    alignItems: 'center',
    cursor: 'pointer',
    opacity: 0.7,
    backgroundColor: '#fff',
    "&:hover": {
        opacity: 1,
    },
    "&.selected": {
        opacity: 1,
        fontWeight: 'bold',
    },
});

const Label = styled('div')({
    fontSize: 11,
});
const DashSep = styled('div')({
    flexGrow: 1,
    borderBottom: `2px dotted ${muiColors.grey[300]}`,
    marginLeft: 8,
    marginRight: 8,
});
const Number = styled('div')({
    fontSize: 11,
    textAlign: 'center',
    minWidth: 14,
    paddingTop: 2,
    paddingBottom: 2,
    fontWeight: 'bold',
    color: muiColors.grey[700],
});
const ToolList = ['pen', 'eraser'];
const ToolKeys = ['a', 's'];

export const ClassSelectionMenu = ({
    selectedTool,
    onSelectTool,
}) => {
  useEffect(() => {
        const keyMapping = {};
        for (let i = 0; i < ToolList.length; i++) {
            keyMapping[ToolKeys[i]] = () => onSelectTool(ToolList[i]);
        }
        const onKeyDown = (e) => {
            if (keyMapping[e.key]) {
                keyMapping[e.key]();
                e.preventDefault();
                e.stopPropagation();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onSelectTool]);

    return (
    <div>
        {
                ToolList.map((label, index) => (
                    <LabelContainer
                        className={classnames({ selected: label === selectedTool })}
                        onClick={() => onSelectTool(label)}
                  >
                        <Label className={classnames({ selected: label === selectedTool })}>
                            {capitalize(label)}
                      </Label>
                        <DashSep />
                        <Number className={classnames({ selected: label === selectedTool })}>
                            {`Key [${ToolKeys[index]}]`}
                      </Number>
                  </LabelContainer>
                ))
            }
      </div>
    );
};

export default ClassSelectionMenu;
