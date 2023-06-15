'use client';
import 'react-json-view-lite/dist/index.css';
import { JsonView, darkStyles, defaultStyles } from 'react-json-view-lite';
import styles from "./json-viewer.module.scss";
interface Props {
    children: any;
}

export const JsonViewer: React.FC<Props> = ({ children }) => {
    const newStyle = { ...darkStyles };
    newStyle.container = `${newStyle.container} ${styles.container}`;
    return (
        <JsonView data={children} shouldInitiallyExpand={(_level, _value) => false} style={newStyle} />
    );
};