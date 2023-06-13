export async function sleep(timings: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, timings);
    });
}