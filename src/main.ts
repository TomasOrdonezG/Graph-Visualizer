import GraphNode from "./graphNode.js";
import Edge from "./edge.js";
import { waitForClick, delay } from "./utils.js";

// Graph global variable
class Graph {
    // #region ATTRIBUTES

    // Global class constants
    static DELAY_TIME = 100;

    // Standardly initializable attributes
    public nodes: GraphNode[] = [];

    // Objects to keep track of
    public initial_node: GraphNode | null = null;
    public final_node: GraphNode | null = null;
    public moving_edge: Edge | null = null;

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
        if (
            event.button !== 0 ||
            this.traversing ||
            (event.target as HTMLElement).closest(".circle") ||
            (event.target as HTMLElement).closest(".hitbox") ||
            (event.target as HTMLElement).closest(".line") ||
            (event.target as HTMLElement).closest(".button")
        ) {
            return;
        }

        // Create the new node object
        const new_node = new GraphNode(event.clientX, event.clientY, this.next_node_val);

        // Connect all selected nodes to the new node if SHIFT is down
        if (keyboardState.SHIFT && !keyboardState.CTRL) {
            for (let node of this.nodes) {
                if (node.selected) {
                    node.connect(new_node);
                }
            }
        }

        // Select only new node
        if (!keyboardState.CTRL) this.deselect_all();
        new_node.select();

        // Update GRAPH attributes
        this.nodes.push(new_node);
        this.next_node_val++;
        this.size++;
        this.sortNodes();
    }

    public deselect_all(): void {
        for (let node of this.nodes) {
            node.deselect();
        }
    }

    // TRAVERSAL
    public async BFS(): Promise<void> {
        if (this.traversing || this.size === 0) return;
        this.traversing = true;

        // Reset the colour of all nodes and edges in the graph
        this.reset_colour();
        await delay(Graph.DELAY_TIME);

        // Get root as the first selected node then mark as discovered
        let root = this.get_first_selected();
        if (!root) root = this.nodes[0];
        await this.setNodeColour(root, "gray");

        // Create queue and enqueue root
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
        Q.enqueue(root);

        // Main BFS loop
        while (!Q.is_empty()) {
            let node = Q.dequeue();
            for (let out_edge of node.out_edges) {
                const adj_node = out_edge.destination;
                if (adj_node.colour === "white") {
                    await this.highlightEdge(out_edge);
                    await this.setNodeColour(adj_node, "gray");
                    Q.enqueue(adj_node);
                }
            }
            await this.setNodeColour(node, "black");
        }

        await this.displayTraversalTree();
        this.traversing = false;
    }

    public async DFS(): Promise<void> {
        if (this.traversing || this.size === 0) return;
        this.traversing = true;
        this.deselect_all();

        // Visits one node and traverses through with DFS
        const DFS_Visit = async (root: GraphNode): Promise<void> => {
            // Mark root as discovered
            await this.setNodeColour(root, "gray");

            // Run DFS on each neighbour in order
            for (let out_edge of root.out_edges) {
                const adj_node = out_edge.destination;
                if (adj_node.colour === "white") {
                    await this.highlightEdge(out_edge);
                    await DFS_Visit(adj_node);
                }
            }

            // Mark root as searched
            await this.setNodeColour(root, "black");
        };

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

    private async setNodeColour(node: GraphNode, colour: string): Promise<void> {
        // Updates the node and text colour of a node and sets a delay
        // Should only be called from inside animation methods or reset_colour method
        const text_colour = colour === "black" ? "white" : "black";
        node.colour = colour;
        node.text_colour = text_colour;
        node.updateColour();
        await delay(Graph.DELAY_TIME);
    }

    private async highlightEdge(edge: Edge) {
        // Highlights an edge and sets a delay
        // Should only be called from inside animation methods
        edge.updateColour(Edge.HIGHLIGHT_COLOUR);
        await delay(Graph.DELAY_TIME);
    }

    private reset_colour(): void {
        // Initialize each node to white and egde to gray
        for (let node of this.nodes) {
            this.setNodeColour(node, "white");
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

    public sortNodes() {
        this.nodes.sort((a, b) => a.value - b.value);
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

export { GRAPH, keyboardState };
