import GraphNode from "./graphNode.js";
import Edge from "./edge.js";
import { keyboardState } from "./main.js";
import { waitForClick, delay } from "./utils.js";

// Graph global variable
export default class Graph {
    // #region ATTRIBUTES

    // Global class constants
    static DELAY_TIME = 200;

    // Standardly initializable attributes
    public nodes: GraphNode[] = [];
    public directed: boolean = false;

    // Objects to keep track of
    public initial_node: GraphNode | null = null;
    public final_node: GraphNode | null = null;
    public moving_edge: Edge | null = null;

    public size: number = 0;
    public HTML_Container: HTMLElement | null;
    public next_node_val: number = 0;
    public traversing: boolean = false;
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
    }

    public addNode(event: MouseEvent): void {
        // Prevent adding a node when mouse is on a node div, or edge div
        if (event.button !== 0 || this.traversing || (event.target as HTMLElement).closest(".pan")) {
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
            if (this.directed) {
                // * DIRECTED GRAPH TRAVERSAL
                for (let out_edge of node.out_edges) {
                    const adj_node = out_edge.destination;
                    if (adj_node.colour === "white") {
                        // Explore node if it's white
                        await this.highlightEdge(out_edge);
                        await this.setNodeColour(adj_node, "gray");
                        Q.enqueue(adj_node);
                    }
                }
            } else {
                // * UNDIRECTED GRAPH TRAVERSAL
                for (let adj of node.neighbours) {
                    // Explore node if it's white
                    if (adj.colour === "white") {
                        // Find edge
                        let edge: Edge | null = null;
                        for (let adj_edge of node.out_edges.concat(node.in_edges)) {
                            if (adj_edge.source === adj || adj_edge.destination === adj) {
                                edge = adj_edge;
                            }
                        }

                        // Highligh and enqueue
                        if (edge) await this.highlightEdge(edge);
                        else throw Error("Node is in neighbours array but edge is not in out_edges nor in_edges.");
                        await this.setNodeColour(adj, "gray");
                        Q.enqueue(adj);
                    }
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

            if (this.directed) {
                // * DIRECTED GRAPH TRAVERSAL
                // Run DFS on each neighbour in order
                for (let out_edge of root.out_edges) {
                    const adj_node = out_edge.destination;
                    if (adj_node.colour === "white") {
                        // Explore node if it's white
                        await this.highlightEdge(out_edge);
                        await DFS_Visit(adj_node);
                    }
                }
            } else {
                // * UNDIRECTED GRAPH TRAVERSAL
                for (let adj of root.neighbours) {
                    // Explore node if its white
                    if (adj.colour === "white") {
                        // Find edge
                        let edge: Edge | null = null;
                        for (let adj_edge of root.out_edges.concat(root.in_edges)) {
                            if (adj_edge.source === adj || adj_edge.destination === adj) {
                                edge = adj_edge;
                            }
                        }

                        // Highligh and recurse
                        if (edge) await this.highlightEdge(edge);
                        else throw Error("Node is in neighbours array but edge is not in out_edges nor in_edges.");
                        await DFS_Visit(adj);
                    }
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

    // Update
    public toggle_directed(event: MouseEvent): void {
        // Prevent from changing graph type while traversing
        if (this.traversing) {
            event.preventDefault();
            return;
        }

        // Update each edge to have its arrowhead to invisible
        this.directed = !this.directed;
        for (let node of this.nodes) {
            for (let out_edge of node.out_edges) {
                out_edge.linkNodesPos();
            }
        }
    }

    public reset_colour(): void {
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