import Graph from "./graph.js";
import Menu from "./menu.js";

// Global variables
const GRAPH = new Graph();
const MENU = new Menu();
let keyboardState: {
    CTRL: boolean;
    A: boolean;
    SHIFT: boolean;
} = {
    CTRL: false,
    A: false,
    SHIFT: false,
};

function main(): void {
    // Disable context menu
    window.addEventListener("contextmenu", (event: MouseEvent): void => {
        event.preventDefault();
    });

    // Keyboard events
    document.addEventListener("keydown", (event): void => {
        // Update keyboard states
        if (event.key === "Control") {
            keyboardState.CTRL = true;
        } else if (event.key === "a" || event.key === "A") {
            keyboardState.A = true;
        } else if (event.key === "Shift") {
            keyboardState.SHIFT = true;
        }

        // Don't allow shortcuts to happen while the graph is traversing/animating
        if (GRAPH.traversing) return;

        // ! SHORTCUTS
        if (keyboardState.CTRL && keyboardState.A) {
            // Select all nodes
            for (let node of GRAPH.nodes) {
                node.select();
            }
        } else if (event.key === "Backspace") {
            // Delete selected nodes
            for (let i = GRAPH.nodes.length - 1; i >= 0; i--) {
                if (GRAPH.nodes[i].selected && GRAPH.nodes[i].div.getAttribute("contenteditable") === "false") {
                    GRAPH.nodes[i].delete();
                }
            }
            if (GRAPH.size === 0) GRAPH.next_node_val = 0;
            GRAPH.sortNodes();
        }
    });
    document.addEventListener("keyup", (event) => {
        // Update keyboard states
        if (event.key === "Control") {
            keyboardState.CTRL = false;
        } else if (event.key === "a" || event.key === "A") {
            keyboardState.A = false;
        } else if (event.key === "Shift") {
            keyboardState.SHIFT = false;
        }
    });
}
main();

export { GRAPH, MENU, keyboardState };
