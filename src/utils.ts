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

export { waitForClick };
