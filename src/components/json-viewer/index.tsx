import styles from "./json-viewer.module.scss";
interface Props {
    children: any;
}

export const JsonViewer: React.FC<Props> = ({ children }) => {
    if (children == null) {
        return <div>Null object</div>
    }
    children = JSON.parse(JSON.stringify(children))
    return (
        <div>
            {typeof children === 'object' ? (
                <ul>
                    {Object.entries(children).map(([key, value]) => (
                        <li key={key}>
                            {key}: <JsonViewer>{children}</JsonViewer>
                        </li>
                    ))}
                </ul>
            ) : (
                <span className={styles.span}>{children}</span>
            )}
        </div>
    );
};