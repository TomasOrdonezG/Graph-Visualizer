import GraphNode from "./graphNode.js";
import Edge from "./edge.js";
import { waitForClick } from "./utils.js";

// Graph global variable
class Graph {
    public nodes: GraphNode[] = [];
    public initial_node: GraphNode | null = null;
    public size: number = 0;
    public HTML_Container: HTMLElement | null;
    public next_node_val: number = 0;
    public traversing: boolean = false;

    static DELAY_TIME = 500;

    // Buttons
    private BFS_Button: HTMLButtonElement;
    // private DFS_Button: HTMLButtonElement;

    constructor() {
        // Create container
        const container = document.createElement("div");
        container.id = "graph";
        document.body.appendChild(container);
        this.HTML_Container = container;

        // Add node on click
        document.addEventListener("mouseup", this.addNode.bind(this));

        // Create buttons
        this.BFS_Button = document.createElement("button");
        this.BFS_Button.textContent = "BFS";
        this.BFS_Button.addEventListener("click", this.BFS.bind(this));
        this.BFS_Button.className = "button";
        document.body.appendChild(this.BFS_Button);
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

        // Delays the code
        async function delay() {
            await new Promise((resolve) => setTimeout(resolve, Graph.DELAY_TIME));
        }

        // Initialize each node to white and egde to gray
        const reset_colour = (): void => {
            for (let node of this.nodes) {
                node.colour = "white";
                node.text_colour = "black";
                node.updateColour();

                for (let edge of node.out_edges) {
                    edge.updateColour(Edge.DEFAULT_COLOUR);
                }
            }
        };
        reset_colour();
        await delay();

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
        await delay();
        Q.enqueue(root);

        // Main BFS loop
        while (!Q.is_empty()) {
            let node = Q.dequeue();
            for (let out_edge of node.out_edges) {
                const adj = out_edge.destination;
                if (adj.colour === "white") {
                    out_edge.updateColour(Edge.HIGHLIGHT_COLOUR);
                    await delay();

                    adj.colour = "gray";
                    adj.updateColour();
                    await delay();

                    Q.enqueue(adj);
                }
            }
            node.colour = "black";
            node.text_colour = "white";
            node.updateColour();
            await delay();
        }

        await waitForClick();
        reset_colour();
        this.traversing = false;
    }

    public DFS(): void {
        // TODO: Implement
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
}
let keyboardState: KeyboardState = {
    CTRL: false,
    A: false,
};
document.addEventListener("keydown", (event): void => {
    if (event.key === "Control") {
        keyboardState.CTRL = true;
    } else if (event.key === "a" || event.key === "A") {
        keyboardState.A = true;
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
    if (event.key === "Control") {
        keyboardState.CTRL = false;
    } else if (event.key === "a" || event.key === "A") {
        keyboardState.A = false;
    }
});

export { GRAPH, keyboardState };
