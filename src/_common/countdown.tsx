export const countdown = (countdownSeconds: number, onCount: (n: number) => void): void => {
    onCount(countdownSeconds);

    const startTime = new Date();
    const timer: number = window.setInterval(
        () => {
            const cd = Math.ceil(countdownSeconds -
                (new Date().getTime() - startTime.getTime()) / 1000);
            onCount(cd);
            if (cd <= 0) {
                clearInterval(timer);
            }
        },
        200);
};