import React from 'react';
import styles from './loading-bar.module.scss';

interface LoadingBarProps {
    isLoading: boolean;
}

const LoadingBar: React.FC<LoadingBarProps> = ({ isLoading }) => {

    return (
        <div className={styles.loader}>
            <div className={styles.loaderBar} />
        </div>
    );
};

export default LoadingBar;