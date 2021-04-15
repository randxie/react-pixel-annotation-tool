
import classnames from 'classnames';
import React, { memo, useState } from 'react';
import SidebarBox from 'react-material-workspace-layout/SidebarBox';
import useEventCallback from 'use-event-callback';

import { grey } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    container: { margin: 8 },
    header: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: 8,
        paddingLeft: 16,
        paddingRight: 16,
    },
    title: {
        fontSize: 14,
        fontWeight: "bold",
        flexGrow: 1,
        paddingLeft: 8,
        color: grey[800],
        "& span": {
            color: grey[600],
            fontSize: 12,
        },
    },
    expandButton: {
        padding: 0,
        width: 30,
        height: 30,
        "& .icon": {
            marginTop: -6,
            width: 20,
            height: 20,
            transition: "500ms transform",
            "&.expanded": {
                transform: "rotate(180deg)",
            },
        },
    },
    expandedContent: {
        maxHeight: 300,
        overflowY: "auto",
        "&.noScroll": {
            overflowY: "visible",
            overflow: "visible",
        },
    },
})

export const SidebarBoxContainer = ({
    icon,
    title,
    children,
}) => {

    return (
        <SidebarBox icon={icon} title={title}>
            {children}
        </SidebarBox>
    )
}

export default memo(
    SidebarBoxContainer,
    (prev, next) => prev.title === next.title && prev.children === next.children
)