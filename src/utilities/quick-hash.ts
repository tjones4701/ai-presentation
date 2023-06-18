import { isString } from "./is-string";

export const quickHash = (str: any): number | null => {
    if (!isString(str)) {
        try {
            str = JSON.stringify(str);
        } catch (e) {
            return null;
        }
    }
    let hash = 0;
    if (str == null) {
        return 0;
    }
    if (str.length === 0) {
        return hash;
    }
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};

export const hashCheck = (obj1: any, obj2: any): boolean => {
    const hash1 = quickHash(obj1);
    const hash2 = quickHash(obj2);
    return hash1 != hash2;
};
