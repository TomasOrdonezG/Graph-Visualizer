import Graph from "./graph.js";
import Menu from "./menu.js";
// Global variables
const GRAPH = new Graph();
const MENU = new Menu(GRAPH);
let keyboardState = {
    CTRL: false,
    A: false,
    SHIFT: false,
};
function main() {
    // Disable context menu
    window.addEventListener("contextmenu", (event) => {
        event.preventDefault();
    });
    // Keyboard events
    document.addEventListener("keydown", (event) => {
        // Update keyboard states
        if (event.key === "Control") {
            keyboardState.CTRL = true;
        }
        else if (event.key === "a" || event.key === "A") {
            keyboardState.A = true;
        }
        else if (event.key === "Shift") {
            keyboardState.SHIFT = true;
        }
        // Don't allow shortcuts to happen while the graph is traversing/animating
        if (GRAPH.traversing)
            return;
        // ! SHORTCUTS
        if (keyboardState.CTRL && keyboardState.A) {
            // Select all nodes
            for (let node of GRAPH.nodes) {
                node.select();
            }
        }
    });
    document.addEventListener("keyup", (event) => {
        // Update keyboard states
        if (event.key === "Control") {
            keyboardState.CTRL = false;
        }
        else if (event.key === "a" || event.key === "A") {
            keyboardState.A = false;
        }
        else if (event.key === "Shift") {
            keyboardState.SHIFT = false;
        }
    });
}
main();
export { keyboardState };
