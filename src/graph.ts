import GraphNode from "./graphNode.js";
import Edge from "./edge.js";
import { keyboardState } from "./main.js";

// Graph global variable
export default class Graph {
    // #region ATTRIBUTES

    // Global class constants
    static DELAY_TIME = 200;

    public nodes: GraphNode[] = [];
    public weighted: boolean = false;
    public directed: boolean = false;

    // Objects to keep track of
    public initial_node: GraphNode | null = null;
    public final_node: GraphNode | null = null;
    public moving_edge: Edge | null = null;

    public size: number = 0;
    public next_node_val: number = 0;
    public traversing: boolean = false;
    public HTML_Container: HTMLDivElement = document.querySelector(".graph-container") as HTMLDivElement;
    // #endregion

    constructor() {
        this.HTML_Container.addEventListener("mouseup", this.addNode.bind(this));
    }

    public addNode(event: MouseEvent): void {
        // Prevent adding a node when mouse is on a node div, or edge div
        if (event.button !== 0 || this.traversing || (event.target as HTMLElement).closest(".pan")) {
            return;
        }

        // Create the new node object
        const new_node = new GraphNode(event.clientX, event.clientY, this.next_node_val, this);

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

    public reset_colour(): void {
        // Initialize each node to white and egde to gray
        for (let node of this.nodes) {
            // this.setNodeColour(node, "white");
            node.updateColour("white");
            node.updateBorderColour(GraphNode.DEFAULT_BORDER_COLOUR);
            for (let edge of node.out_edges) {
                edge.updateColour(Edge.DEFAULT_COLOUR);
            }
        }
    }

    public get_first_selected(): GraphNode {
        for (let node of this.nodes) {
            if (node.selected) {
                return node;
            }
        }
        return this.nodes[0];
    }

    public toggle_directed(event: MouseEvent): void {
        // Prevent from changing graph type while traversing
        if (this.traversing) {
            event.preventDefault();
            return;
        }

        // Toggle boolean
        this.directed = !this.directed;

        // Loop through every edge in the graph
        for (let node of this.nodes) {
            for (let edge of node.out_edges) {
                edge.linkNodesPos(); // Update visual of the arrowheads
            }
        }
    }

    public toggle_weighted(event: MouseEvent) {
        // Prevent from changing graph type while traversin
        if (this.traversing) {
            event.preventDefault();
            return;
        }

        // Toggle boolean
        this.weighted = !this.weighted;

        // Loop through every edge in the graph
        for (let node of this.nodes) {
            for (let edge of node.out_edges) {
                edge.updateWeight(edge.weight); // Update weight text
            }
        }
    }

    public sortNodes() {
        this.nodes.sort((a, b) => a.value - b.value);
    }
}
