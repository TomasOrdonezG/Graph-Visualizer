import GraphNode from "./graphNode";
import Edge from "./edge";

// Graph global variable
interface Graph {
    nodes: GraphNode[];
    initial_node: GraphNode | null;
    size: number;
    HTML_Container: HTMLElement | null;
    next_node_val: number;
    init(): void;
    addNode(event: MouseEvent): void;
    deselect_all(): void;
}
const GRAPH: Graph = {
    nodes: [],
    initial_node: null,
    size: 0,
    next_node_val: 0,
    HTML_Container: null,
    init() {
        // Create container
        const container = document.createElement("div");
        container.id = "graph";
        document.body.appendChild(container);
        this.HTML_Container = container;
    },
    addNode(event) {
        // Prevent adding a node when mouse is on a node div
        if (event.button !== 0) return;
        if ((event.target as HTMLElement).closest(".circle")) return;

        // Create node
        const circleDiv = document.createElement("div");
        circleDiv.className = "circle";

        // Value and position
        circleDiv.style.left = event.clientX - GraphNode.RADIUS + "px";
        circleDiv.style.top = event.clientY - GraphNode.RADIUS + "px";

        // Append to graph HTML container and nodes array
        this.HTML_Container?.appendChild(circleDiv);

        // Create the new node object
        const new_node = new GraphNode(event.clientX, event.clientY, this.next_node_val, circleDiv);
        this.nodes.push(new_node);
        this.next_node_val++;
        this.size++;
    },
    deselect_all() {
        for (let node of this.nodes) {
            node.deselect();
        }
    },
};
GRAPH.init();

// Add node on click
document.addEventListener("click", GRAPH.addNode.bind(GRAPH));

// Disable context menu
window.addEventListener("contextmenu", (event: MouseEvent): void => {
    event.preventDefault();
});

// Global keyboard state and keyboard shortcuts
interface KeyboardState {
    CTRL: boolean;
    A: boolean;
}
let keyboardState: KeyboardState = {
    CTRL: false,
    A: false,
};
document.addEventListener("keydown", (event) => {
    if (event.key === "Control") {
        keyboardState.CTRL = true;
    } else if (event.key === "a" || event.key === "A") {
        keyboardState.A = true;
    }

    // ! SHORTCUTS
    if (keyboardState.CTRL && keyboardState.A) {
        // Select all nodes
        for (let node of GRAPH.nodes) {
            node.select();
        }
    } else if (event.key === "Backspace") {
        // Delete selected nodes
        for (let i = GRAPH.nodes.length - 1; i >= 0; i--) {
            if (GRAPH.nodes[i].selected) {
                GRAPH.nodes[i].delete();
            }
        }
        if (GRAPH.size === 0) GRAPH.next_node_val = 0;
    }
});
document.addEventListener("keyup", (event) => {
    if (event.key === "Control") {
        keyboardState.CTRL = false;
    } else if (event.key === "a" || event.key === "A") {
        keyboardState.A = false;
    }
});

export { GRAPH, keyboardState };
