import GraphNode from "./graphNode.js";
import Edge from "./edge.js";
import { keyboardState } from "./main.js";

export enum Action {
    CURSOR,
    ADD,
    MOVE,
    LINK,
    DELETE,
}
export interface GraphJSON {
    vertices: { value: number; x: number; y: number }[];
    adjacency_matrix: (number | null)[][];
    settings: { weighted: boolean; directed: boolean };
}
export default class Graph {
    // #region ATTRIBUTES

    // Global class constants
    static DELAY_TIME = 200;

    public nodes: GraphNode[] = [];
    public weighted: boolean = false;
    public directed: boolean = false;
    public HTML_Container: HTMLDivElement = document.querySelector(".graph-container") as HTMLDivElement;

    // Objects to keep track of
    public initial_node: GraphNode | null = null;
    public final_node: GraphNode | null = null;
    public moving_edge: Edge | null = null;

    public size: number = 0;
    public next_node_val: number = 0;

    // Graph states
    public action: Action = Action.CURSOR;
    public traversing: boolean = false;
    private isLeftMouseDown: boolean = false;
    private isRightMouseDown: boolean = false;
    private rightDown_x1: number = 0;
    private rightDown_y1: number = 0;
    private initial_node_positions: { node: GraphNode; x1: number; y1: number }[] = [];

    // Selection box
    private selection_div: HTMLDivElement = document.querySelector(".selection-box") as HTMLDivElement;
    private selection_x1: number = 0;
    private selection_y1: number = 0;
    // #endregion

    constructor() {
        this.selection_div.style.display = "none";
        this.HTML_Container.addEventListener("mousedown", (event: MouseEvent): void => {
            if (event.button === 0 && !(event.target as HTMLElement).closest(".pan")) {
                // Handle right down state
                this.isLeftMouseDown = true;
                if ([Action.MOVE, Action.DELETE].includes(this.action)) {
                    this.deselect_all();
                }

                if (this.action !== Action.ADD) {
                    this.show_selection_box(event.clientX, event.clientY);
                }
            } else if (event.button === 2) {
                event.preventDefault();
                this.isRightMouseDown = true;

                if (this.action === Action.MOVE) {
                    // Remember the initial click position and all of the initial positions of the nodes
                    this.rightDown_x1 = event.clientX;
                    this.rightDown_y1 = event.clientY;
                    this.initial_node_positions = this.nodes.map((node: GraphNode) => ({
                        node: node,
                        x1: node.x,
                        y1: node.y,
                    }));
                }
            }
        });
        this.HTML_Container.addEventListener("mouseup", (event: MouseEvent): void => {
            if (event.button === 0) {
                this.isLeftMouseDown = false;

                if (this.action !== Action.ADD) {
                    this.select_content_inside_selection_box();
                    this.hide_selection_box();
                }

                if (this.action === Action.CURSOR || this.action === Action.LINK) {
                    // Add node when selection div is small and not clicking another node
                    if (
                        parseInt(this.selection_div.style.width) < GraphNode.RADIUS &&
                        parseInt(this.selection_div.style.height) < GraphNode.RADIUS &&
                        !(event.target as HTMLDivElement).closest(".pan")
                    ) {
                        this.addNode(event.clientX, event.clientY);
                    }
                } else if (this.action === Action.ADD) {
                    if (!(event.target as HTMLDivElement).closest(".pan")) {
                        this.addNode(event.clientX, event.clientY);
                    }
                } else if (this.action === Action.DELETE) {
                    this.delete_all_selected();
                }
            } else if (event.button === 2) {
                event.preventDefault();
                this.isRightMouseDown = false;

                if (this.action === Action.MOVE) {
                    this.initial_node_positions = [];
                }
            }
        });
        this.HTML_Container.addEventListener("mousemove", (event: MouseEvent): void => {
            if (this.isLeftMouseDown) {
                // Handle left click drag
                if (this.action !== Action.ADD) {
                    this.resize_selection_box(event.clientX, event.clientY);
                }
            }
            if (this.isRightMouseDown) {
                event.preventDefault();

                if (this.action === Action.MOVE) {
                    // Move everything
                    this.selection_x1;
                    this.selection_y1;
                    for (let { node, x1, y1 } of this.initial_node_positions) {
                        node.updatePos(x1 + event.clientX - this.rightDown_x1, y1 + event.clientY - this.rightDown_y1);
                    }
                }
            }
        });
        document.addEventListener("keydown", (event: KeyboardEvent) => {
            if (event.key === "Backspace") {
                this.delete_all_selected();
            }
        });
    }

    public addNode(clientX: number, clientY: number): void {
        // Prevent adding a node when mouse is on a node div, or edge div
        if (this.traversing || this.initial_node) return;

        // Create the new node object
        const new_node = new GraphNode(clientX, clientY, this.next_node_val, this);

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

    public delete_all_selected(): void {
        if (this.traversing) return;

        // Delete selected nodes
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            if (this.nodes[i].selected && this.nodes[i].div.getAttribute("contenteditable") === "false") {
                this.nodes[i].delete();
            }
        }
        if (this.size === 0) this.next_node_val = 0;
        this.sortNodes();
    }

    public delete_all_nodes(): void {
        if (this.traversing) return;
        for (let node of this.nodes) {
            node.select();
        }
        this.delete_all_selected();
    }

    public reset_all_attributes(): void {
        for (let node of this.nodes) {
            node.updateColour("white");
            node.updateBorderColour(GraphNode.DEFAULT_BORDER_COLOUR);
            node.updateTextColour("black");
            node.updateShowText(false);
            node.updateText("");
            node.deselect();

            for (let edge of node.out_edges) {
                edge.updateColour(Edge.DEFAULT_COLOUR);
            }
        }
    }

    public get_first_selected(): GraphNode | null {
        if (!this.nodes) return null;

        for (let node of this.nodes) {
            if (node.selected) {
                return node;
            }
        }
        return this.nodes[0];
    }

    public toggle_directed(event?: MouseEvent): void {
        // Prevent from changing graph type while traversing
        if (this.traversing) {
            event?.preventDefault();
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

    public toggle_weighted(event?: MouseEvent) {
        // Prevent from changing graph type while traversin
        if (this.traversing) {
            event?.preventDefault();
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

    public jsonify() {
        // Construct adjacency matrix
        const adjacency_matrix: GraphJSON["adjacency_matrix"] = [];
        for (let node1 of this.nodes) {
            const row: (number | null)[] = [];
            let next_adj_i = 0; // Keep track of the next adjacent edge index

            for (let node2 of this.nodes) {
                const next_out_edge: Edge = node1.out_edges[next_adj_i];
                if (next_out_edge && next_out_edge.destination === node2) {
                    row.push(next_out_edge.weight); // Push weight when node2 is a neighbour of node1
                    next_adj_i++;
                } else {
                    row.push(null); // Case node2 is not a neighbour of node1
                }
            }
            adjacency_matrix.push(row);
        }

        // Vertices
        const vertices: GraphJSON["vertices"] = this.nodes.map(({ value, x, y }) => ({
            value: value,
            x: x / window.innerWidth,
            y: y / window.innerHeight,
        }));

        // Settings
        const settings: GraphJSON["settings"] = {
            directed: this.directed,
            weighted: this.weighted,
        };

        return { adjacency_matrix, vertices, settings };
    }

    public build(graph_content: GraphJSON): void {
        this.delete_all_nodes();

        // Create nodes
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        for (let node of graph_content.vertices) {
            const new_node = new GraphNode(vw * node.x, vh * node.y, node.value, this);
            this.nodes.push(new_node);
        }

        // Connect nodes
        for (let i = 0; i < graph_content.adjacency_matrix.length; i++) {
            const target_node = this.nodes[i];
            for (let j = 0; j < graph_content.adjacency_matrix[i].length; j++) {
                const adj = this.nodes[j];
                const weight: number | null = graph_content.adjacency_matrix[i][j];
                if (weight) {
                    const new_edge: Edge | null = target_node.connect(adj);
                    if (new_edge) {
                        new_edge.updateWeight(weight);
                    }
                }
            }
        }

        this.deselect_all();
    }

    // Selection box methods
    private hide_selection_box(): void {
        this.selection_div.style.display = "none";
    }

    private show_selection_box(x1: number, y1: number): void {
        this.selection_x1 = x1;
        this.selection_y1 = y1;
        this.selection_div.style.display = "";
        this.selection_div.style.left = `${x1}px`;
        this.selection_div.style.top = `${y1}px`;
        this.selection_div.style.width = `0px`;
        this.selection_div.style.height = `0px`;
    }

    private resize_selection_box(x2: number, y2: number): void {
        this.selection_div.style.left = `${Math.min(this.selection_x1, x2)}px`;
        this.selection_div.style.top = `${Math.min(this.selection_y1, y2)}px`;
        this.selection_div.style.width = `${Math.abs(x2 - this.selection_x1)}px`;
        this.selection_div.style.height = `${Math.abs(y2 - this.selection_y1)}px`;
    }

    private select_content_inside_selection_box(): void {
        if (this.selection_div.style.display === "none") return;

        const selection_left = parseInt(this.selection_div.style.left);
        const selection_top = parseInt(this.selection_div.style.top);
        const selection_right = selection_left + parseInt(this.selection_div.style.width);
        const selection_bottom = selection_top + parseInt(this.selection_div.style.height);

        if (selection_right - selection_left < GraphNode.RADIUS || selection_bottom - selection_top < GraphNode.RADIUS)
            return;
        this.deselect_all();

        for (let node of this.nodes) {
            const node_left = node.x - GraphNode.RADIUS - GraphNode.BORDER_WIDTH;
            const node_right = node.x + GraphNode.RADIUS + GraphNode.BORDER_WIDTH;
            const node_top = node.y - GraphNode.RADIUS - GraphNode.BORDER_WIDTH;
            const node_bottom = node.y + GraphNode.RADIUS + GraphNode.BORDER_WIDTH;

            if (
                selection_top < node_top &&
                selection_left < node_left &&
                selection_right > node_right &&
                selection_bottom > node_bottom
            ) {
                node.select();
            }
        }
    }
}
