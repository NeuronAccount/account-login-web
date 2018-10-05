const minClickInterval: number = 500;
let lastClickTime: Date = new Date(0);

export const fastClick = (): boolean => {
    const now = new Date();
    if (now.getTime() - lastClickTime.getTime() > minClickInterval) {
        lastClickTime = now;
        return false;
    } else {
        return true;
    }
};