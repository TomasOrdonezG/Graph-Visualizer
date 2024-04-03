class Edge {
    // #region ATTRIBUTES

    // Constants
    static ARROWHEAD_LENGTH = 15;
    static ARROHEAD_ANGLE = Math.PI / 6;
    static HITBOX_RADIUS = 10;
    static HOVER_COLOUR = "blue";
    static DEFAULT_COLOUR = "black";

    public source: GraphNode;
    public destination: GraphNode;

    public colour: string = Edge.DEFAULT_COLOUR;
    public hovering: boolean = false;
    public moving: boolean = false;

    public line_div: HTMLDivElement;
    public left_arrowhead_div: HTMLDivElement;
    public right_arrowhead_div: HTMLDivElement;
    public hitbox_div: HTMLDivElement;
    // #endregion

    constructor(source: GraphNode, destination: GraphNode) {
        this.source = source;
        this.destination = destination;

        // Create Divs
        this.line_div = document.createElement("div");
        this.line_div.className = "line";
        GRAPH.HTML_Container?.appendChild(this.line_div);

        this.left_arrowhead_div = document.createElement("div");
        this.left_arrowhead_div.className = "line";
        GRAPH.HTML_Container?.appendChild(this.left_arrowhead_div);

        this.right_arrowhead_div = document.createElement("div");
        this.right_arrowhead_div.className = "line";
        GRAPH.HTML_Container?.appendChild(this.right_arrowhead_div);

        this.hitbox_div = document.createElement("div");
        this.hitbox_div.className = "hitbox";
        GRAPH.HTML_Container?.appendChild(this.hitbox_div);

        this.updateColour(Edge.DEFAULT_COLOUR);

        // Add mouse event listeners
        this.addMouseEventListeners();
    }

    private addMouseEventListeners() {
        // Hover
        this.hitbox_div.addEventListener("mouseenter", (event: MouseEvent) => {
            this.updateColour(Edge.HOVER_COLOUR);
        });
        this.hitbox_div.addEventListener("mouseleave", (event: MouseEvent) => {
            this.updateColour(Edge.DEFAULT_COLOUR);
        });

        // Mouse down
        this.hitbox_div.addEventListener("mousedown", (event: MouseEvent): void => {
            if (this.hovering) {
                this.moving = true;
            }
        });

        // Mouse up
        this.hitbox_div.addEventListener("mouseup", (event: MouseEvent): void => {
            if (this.hovering) {
                this.moving = false;
            }
        });

        // Mouse drag
        document.addEventListener("mousemove", (event: MouseEvent): void => {
            if (this.moving) {
            }
        });
    }

    public updateColour = (colour: string): void => {
        this.colour = colour;
        this.line_div.style.border = `1px solid ${this.colour}`;
        this.left_arrowhead_div.style.border = `1px solid ${this.colour}`;
        this.right_arrowhead_div.style.border = `1px solid ${this.colour}`;
    };
    public updatePos = (): void => {
        // Updates all out_neighbour and in_neighbouring edges' position
        const x2 = this.destination.x;
        const y2 = this.destination.y;
        const norm = GraphNode.RADIUS / Math.sqrt((x2 - this.source.x) ** 2 + (y2 - this.source.y) ** 2);
        const edge: { x: number; y: number } = {
            x: x2 + norm * (this.source.x - x2),
            y: y2 + norm * (this.source.y - y2),
        };

        const get_line_styles = (x1: number, y1: number, x2: number, y2: number): string => {
            // Gets the styles needed to draw a line as a div
            let width = x1 - x2;
            let height = y1 - y2;
            let length = Math.sqrt(width * width + height * height);

            let sx = (x1 + x2) / 2;
            let sy = (y1 + y2) / 2;

            let x = sx - length / 2;
            let y = sy;

            let angle = Math.PI - Math.atan2(-height, width);

            let styles =
                `width: ${length.toString()}px; ` +
                `-moz-transform: rotate(${angle.toString()}rad); ` +
                `-webkit-transform: rotate(${angle.toString()}rad); ` +
                `-o-transform: rotate(${angle.toString()}rad); ` +
                `-ms-transform: rotate(${angle.toString()}rad); ` +
                `top: ${y.toString()}px; ` +
                `left: ${x.toString()}px; `;
            return styles;
        };

        // Set edge position
        const line_styles = get_line_styles(this.source.x, this.source.y, edge.x, edge.y);
        this.line_div.setAttribute("style", line_styles);

        // Compute arrowhead sides positions
        const v_angle = Math.atan2(edge.y - this.source.y, edge.x - this.source.x);
        const arrow1: { x: number; y: number } = {
            x: edge.x - Edge.ARROWHEAD_LENGTH * Math.cos(v_angle - Edge.ARROHEAD_ANGLE),
            y: edge.y - Edge.ARROWHEAD_LENGTH * Math.sin(v_angle - Edge.ARROHEAD_ANGLE),
        };
        const arrow2: { x: number; y: number } = {
            x: edge.x - Edge.ARROWHEAD_LENGTH * Math.cos(v_angle + Edge.ARROHEAD_ANGLE),
            y: edge.y - Edge.ARROWHEAD_LENGTH * Math.sin(v_angle + Edge.ARROHEAD_ANGLE),
        };

        // Set arrowhead sides positions
        this.left_arrowhead_div.setAttribute("style", get_line_styles(edge.x, edge.y, arrow1.x, arrow1.y));
        this.right_arrowhead_div.setAttribute("style", get_line_styles(edge.x, edge.y, arrow2.x, arrow2.y));

        // Set hitbox
        const hitbox_norm =
            Edge.HITBOX_RADIUS / Math.sqrt((edge.x - this.source.x) ** 2 + (edge.y - this.source.y) ** 2);
        const hx = edge.x - Edge.HITBOX_RADIUS + hitbox_norm * (this.source.x - edge.x);
        const hy = edge.y - Edge.HITBOX_RADIUS + hitbox_norm * (this.source.y - edge.y);
        const hitbox_style =
            `width: ${(Edge.HITBOX_RADIUS * 2).toString()}px;` +
            `height: ${(Edge.HITBOX_RADIUS * 2).toString()}px;` +
            `top: ${hy.toString()}px;` +
            `left: ${hx.toString()}px;`;
        this.hitbox_div.setAttribute("style", hitbox_style);
    };
    public delete(): void {
        // Remove divs
        GRAPH.HTML_Container?.removeChild(this.line_div);
        GRAPH.HTML_Container?.removeChild(this.left_arrowhead_div);
        GRAPH.HTML_Container?.removeChild(this.right_arrowhead_div);
        GRAPH.HTML_Container?.removeChild(this.hitbox_div);

        // Remove edge from source's out_edges
        let i = this.source.out_edges.indexOf(this);
        if (i === -1) throw Error("Edge does not exist in source's out_edges array");
        else this.source.out_edges.splice(i, 1);

        // Remove source from destination's in_neighbours
        let j = this.destination.in_neighbours.indexOf(this.source);
        if (j === -1) throw Error("Source does not exist inside destination's in_neighbour's array");
        else this.destination.in_neighbours.splice(j, 1);
    }
}

class GraphNode {
    // #region * ATTRIBUTES

    // Constants
    static RADIUS = 25;
    static BORDER_WIDTH = 2;
    static SELECTED_BORDER_COLOUR = "green";

    // Attributes
    private value: number;
    public y: number;
    public x: number;
    public div: HTMLElement;

    private background_colour: string = "white";
    private border_colour: string = "black";
    public out_edges: Edge[] = [];
    public in_neighbours: GraphNode[] = [];
    public selected: boolean = true;

    // Dragging attributes
    private dragging: boolean = false;
    private initialX_drag: number = 0;
    private initialY_drag: number = 0;
    // #endregion

    // * INITIALIZATION
    constructor(x: number, y: number, value: number, div: HTMLElement) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.div = div;
        this.updateAll();
        this.mouseEventListeners();

        if (!keyboardState.CTRL) GRAPH.deselect_all();
        this.select();
    }

    // * PRIVATE METHODS

    private mouseEventListeners(): void {
        // Mouse down
        this.div.addEventListener("mousedown", (event: MouseEvent): void => {
            event.preventDefault();
            if (event.button === 0) {
                // * LEFT CLICK

                // Select
                if (!keyboardState.CTRL) GRAPH.deselect_all();
                this.select();

                // Set dragging to true on ALL selected nodes. Compute the initial position of the cursor
                for (let node of GRAPH.nodes) {
                    if (node.selected) {
                        node.dragging = true;
                        node.initialX_drag = event.clientX - node.x;
                        node.initialY_drag = event.clientY - node.y;
                    }
                }
            } else if (event.button === 2) {
                // * RIGHT CLICK
                GRAPH.initial_node = this;
            }
        });

        // Mouse move
        document.addEventListener("mousemove", (event: MouseEvent): void => {
            event.preventDefault();
            if (this.dragging) {
                this.updatePos(event.clientX - this.initialX_drag, event.clientY - this.initialY_drag);
            }
        });

        // Mouse up
        document.addEventListener("mouseup", (event: MouseEvent): void => {
            event.preventDefault();
            this.dragging = false;
            GRAPH.initial_node = null;
        });
        this.div.addEventListener("mouseup", (event: MouseEvent): void => {
            if (GRAPH.initial_node && GRAPH.initial_node !== this) {
                GRAPH.initial_node.connect(this);
            } else {
                GRAPH.initial_node = null;
            }
        });
    }

    // Connection
    private connect(destination_node: GraphNode): void {
        GRAPH.initial_node = null;

        // Don't connect if already connected
        if (this.out_edges.map((out_edge) => out_edge.destination).includes(destination_node)) return;

        // Select the final node
        GRAPH.deselect_all();
        destination_node.select();

        // Add neighbour and calculate position of arrow
        this.out_edges.push(new Edge(this, destination_node));
        destination_node.in_neighbours.push(this);
        this.updateEdgesPos();
    }

    // * PUBLIC METHODS
    public delete(): void {
        // Remove from array
        let i = GRAPH.nodes.indexOf(this);
        if (i == -1) throw Error("Error: Attempting to delete node that isn't a part of GRAPH.nodes");
        else GRAPH.nodes.splice(i, 1);

        // Delete node HTML element
        GRAPH.HTML_Container?.removeChild(this.div);

        // Delete out_edges
        for (let j = this.out_edges.length - 1; j >= 0; j--) {
            this.out_edges[j].delete();
        }

        // Delete in_edges
        for (let l = this.in_neighbours.length - 1; l >= 0; l--) {
            for (let out_edge_of_in_neighbour of this.in_neighbours[l].out_edges) {
                if (out_edge_of_in_neighbour.destination === this) {
                    out_edge_of_in_neighbour.delete();
                }
            }
        }

        GRAPH.size--;
    }

    // Selection
    public select(): void {
        this.border_colour = GraphNode.SELECTED_BORDER_COLOUR;
        this.updateColour();
        this.selected = true;
    }
    public deselect(): void {
        this.border_colour = "black";
        this.updateColour();
        this.selected = false;
    }
    public toggle_select(): void {
        if (this.selected) this.deselect();
        else this.select();
    }

    // Update Methods
    public updateAll = (): void => {
        this.updateValue();
        this.updateColour();
        this.updateSize();
    };
    public updatePos = (x: number, y: number): void => {
        this.x = x;
        this.y = y;
        this.div.style.left = this.x - GraphNode.RADIUS + "px";
        this.div.style.top = this.y - GraphNode.RADIUS + "px";
        this.updateEdgesPos();
    };
    public updateValue = (): void => {
        this.div.textContent = this.value.toString();
    };
    public updateColour = (): void => {
        this.div.style.backgroundColor = this.background_colour;
        this.div.style.border = GraphNode.BORDER_WIDTH + "px" + " solid " + this.border_colour;
    };
    public updateSize = (): void => {
        this.div.style.width = 2 * GraphNode.RADIUS + "px";
        this.div.style.height = 2 * GraphNode.RADIUS + "px";
    };
    public updateEdgesPos = (): void => {
        // Update each out_edge
        for (let out_edge of this.out_edges) {
            out_edge.updatePos();
        }

        // Update each in_neighbour
        for (let in_neighbour of this.in_neighbours) {
            for (let out_edge_of_in_neighbour of in_neighbour.out_edges) {
                if (out_edge_of_in_neighbour.destination == this) {
                    out_edge_of_in_neighbour.updatePos();
                }
            }
        }
    };
}

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
