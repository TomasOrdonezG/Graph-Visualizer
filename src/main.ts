import GraphNode from "./graphNode.js";
import Edge from "./edge.js";
import { waitForClick, delay } from "./utils.js";

// Graph global variable
class Graph {
    // #region ATTRIBUTES

    // Global class constants
    static DELAY_TIME = 500;

    // Standardly initializable attributes
    public nodes: GraphNode[] = [];
    public initial_node: GraphNode | null = null;
    public size: number = 0;
    public HTML_Container: HTMLElement | null;
    public next_node_val: number = 0;
    public traversing: boolean = false;

    // Buttons
    private BFS_Button: HTMLButtonElement;
    private DFS_Button: HTMLButtonElement;
    // #endregion

    constructor() {
        // * Create container
        const container = document.createElement("div");
        container.id = "graph";
        document.body.appendChild(container);
        this.HTML_Container = container;

        // * Event Listeners
        // Add node on click
        document.addEventListener("mouseup", this.addNode.bind(this));

        // * Create buttons
        // BFS Button
        this.BFS_Button = document.createElement("button");
        this.BFS_Button.textContent = "BFS";
        this.BFS_Button.className = "button";
        this.BFS_Button.addEventListener("click", this.BFS.bind(this));
        document.body.appendChild(this.BFS_Button);

        // DFS Button
        this.DFS_Button = document.createElement("button");
        this.DFS_Button.textContent = "DFS";
        this.DFS_Button.className = "button";
        this.DFS_Button.addEventListener("click", this.DFS.bind(this));
        document.body.appendChild(this.DFS_Button);
    }

    public addNode(event: MouseEvent): void {
        // Prevent adding a node when mouse is on a node div, or edge div
        if (event.button !== 0) return;
        if (this.traversing) return;
        if ((event.target as HTMLElement).closest(".circle")) return;
        if ((event.target as HTMLElement).closest(".hitbox")) return;
        if ((event.target as HTMLElement).closest(".line")) return;
        if ((event.target as HTMLElement).closest(".button")) return;

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
    }

    public deselect_all(): void {
        for (let node of this.nodes) {
            node.deselect();
        }
    }

    // TRAVERSAL
    public async BFS(): Promise<void> {
        this.traversing = true;
        let root = this.get_first_selected();
        if (!root) return;

        this.reset_colour();
        await delay(Graph.DELAY_TIME);

        // Create queue
        const Q: {
            queue: GraphNode[];
            is_empty(): boolean;
            enqueue(node: GraphNode): void;
            dequeue(): GraphNode;
        } = {
            queue: [],
            is_empty() {
                return this.queue.length == 0;
            },
            enqueue(node) {
                this.queue.push(node);
            },
            dequeue() {
                return this.queue.splice(0, 1)[0];
            },
        };
        root.colour = "gray";
        root.updateColour();
        await delay(Graph.DELAY_TIME);
        Q.enqueue(root);

        // Main BFS loop
        while (!Q.is_empty()) {
            let node = Q.dequeue();
            for (let out_edge of node.out_edges) {
                const adj = out_edge.destination;
                if (adj.colour === "white") {
                    out_edge.updateColour(Edge.HIGHLIGHT_COLOUR);
                    await delay(Graph.DELAY_TIME);

                    adj.colour = "gray";
                    adj.updateColour();
                    await delay(Graph.DELAY_TIME);

                    Q.enqueue(adj);
                }
            }
            node.colour = "black";
            node.text_colour = "white";
            node.updateColour();
            await delay(Graph.DELAY_TIME);
        }

        await this.displayTraversalTree();
        this.traversing = false;
    }

    public async DFS(): Promise<void> {
        this.traversing = true;

        async function DFS_Visit(root: GraphNode): Promise<void> {
            // Visits one node and traverses through with DFS

            // Mark root as discovered
            root.colour = "gray";
            root.updateColour();
            await delay(Graph.DELAY_TIME);

            // Run DFS on each neighbour in order
            for (let out_edge of root.out_edges) {
                if (out_edge.destination.colour === "white") {
                    // Highlight edge path
                    out_edge.updateColour(Edge.HIGHLIGHT_COLOUR);
                    await delay(Graph.DELAY_TIME);

                    // Recurse
                    await DFS_Visit(out_edge.destination);
                }
            }

            // Mark root as searched
            root.colour = "black";
            root.text_colour = "white";
            root.updateColour();
            await delay(Graph.DELAY_TIME);
        }

        // Reset colour
        this.reset_colour();
        await delay(Graph.DELAY_TIME);

        // Main DFS loop
        for (let node of this.nodes) {
            if (node.colour === "white") {
                await DFS_Visit(node);
            }
        }

        await this.displayTraversalTree();
        this.traversing = false;
    }

    private async displayTraversalTree() {
        // Shows only the edges that were traversed by the traversal method
        for (let node of this.nodes) {
            for (let out_edge of node.out_edges) {
                if (out_edge.colour !== Edge.HIGHLIGHT_COLOUR) {
                    out_edge.updateColour("transparent");
                }
            }
        }

        // Waits for click anywhere and the resets the colour of the graph
        await waitForClick();
        this.reset_colour();
    }

    private reset_colour(): void {
        // Initialize each node to white and egde to gray
        for (let node of this.nodes) {
            node.colour = "white";
            node.text_colour = "black";
            node.updateColour();

            for (let edge of node.out_edges) {
                edge.updateColour(Edge.DEFAULT_COLOUR);
            }
        }
    }

    private get_first_selected(): GraphNode | null {
        for (let node of this.nodes) {
            if (node.selected) {
                return node;
            }
        }
        return null;
    }
}
const GRAPH = new Graph();

// Disable context menu
window.addEventListener("contextmenu", (event: MouseEvent): void => {
    event.preventDefault();
});

// Global keyboard state and keyboard shortcuts
interface KeyboardState {
    CTRL: boolean;
    A: boolean;
    SHIFT: boolean;
}
let keyboardState: KeyboardState = {
    CTRL: false,
    A: false,
    SHIFT: false,
};
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
            if (GRAPH.nodes[i].selected) {
                GRAPH.nodes[i].delete();
            }
        }
        if (GRAPH.size === 0) GRAPH.next_node_val = 0;
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

export { GRAPH, keyboardState };
