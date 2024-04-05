async function waitForClick(): Promise<void> {
    // Waits for user click
    return new Promise<void>((resolve) => {
        const handleClick = () => {
            document.removeEventListener("click", handleClick);
            resolve();
        };
        document.addEventListener("click", handleClick);
    });
}

async function delay(time: number) {
    // Delays the code
    await new Promise((resolve) => setTimeout(resolve, time));
}

export { waitForClick, delay };
