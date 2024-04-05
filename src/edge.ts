import GraphNode from "./graphNode.js";
import { GRAPH, keyboardState } from "./main.js";

export default class Edge {
    // #region ATTRIBUTES

    // Constants
    static ARROWHEAD_LENGTH = 15;
    static ARROHEAD_ANGLE = Math.PI / 6;
    static HITBOX_RADIUS = 10;
    static HOVER_COLOUR = "blue";
    static DEFAULT_COLOUR = "gray";
    static HIGHLIGHT_COLOUR = "black";

    public source: GraphNode;
    public destination: GraphNode;
    // public weight: number = 0;
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

        // this.updateColour(Edge.DEFAULT_COLOUR);

        // Add mouse event listeners
        this.addMouseEventListeners();
    }

    private addMouseEventListeners() {
        // Hover
        this.hitbox_div.addEventListener("mouseenter", (event: MouseEvent) => {
            if (!GRAPH.traversing) {
                this.updateColour(Edge.HOVER_COLOUR);
                this.hovering = true;
            }
        });
        this.hitbox_div.addEventListener("mouseleave", (event: MouseEvent) => {
            if (!GRAPH.traversing) {
                this.updateColour(Edge.DEFAULT_COLOUR);
                this.hovering = false;
            }
        });

        // Mouse down
        this.hitbox_div.addEventListener("mousedown", (event: MouseEvent): void => {
            if (this.hovering) {
                GRAPH.initial_node = this.source;
                this.moving = true;
            }
        });

        // Mouse up
        document.addEventListener("mouseup", (event: MouseEvent): void => {
            if (this.moving) {
                this.delete();
                this.moving = false;
            }
        });

        // Mouse drag
        document.addEventListener("mousemove", (event: MouseEvent): void => {
            if (this.moving) {
                this.linkCursorPos(event);
            }
        });
    }

    public updateColour = (colour: string): void => {
        this.colour = colour;
        this.line_div.style.border = `1px solid ${this.colour}`;
        this.left_arrowhead_div.style.border = `1px solid ${this.colour}`;
        this.right_arrowhead_div.style.border = `1px solid ${this.colour}`;

        // Thickness
        const bg = this.colour === "black" ? this.colour : "transparent";
        this.line_div.style.backgroundColor = this.colour;
        this.left_arrowhead_div.style.backgroundColor = this.colour;
        this.right_arrowhead_div.style.backgroundColor = this.colour;
    };

    public updatePos = (x2: number, y2: number): void => {
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
        const line_styles = get_line_styles(this.source.x, this.source.y, x2, y2);
        this.line_div.setAttribute("style", line_styles);

        // Compute arrowhead sides positions
        const v_angle = Math.atan2(y2 - this.source.y, x2 - this.source.x);
        const arrow1: { x: number; y: number } = {
            x: x2 - Edge.ARROWHEAD_LENGTH * Math.cos(v_angle - Edge.ARROHEAD_ANGLE),
            y: y2 - Edge.ARROWHEAD_LENGTH * Math.sin(v_angle - Edge.ARROHEAD_ANGLE),
        };
        const arrow2: { x: number; y: number } = {
            x: x2 - Edge.ARROWHEAD_LENGTH * Math.cos(v_angle + Edge.ARROHEAD_ANGLE),
            y: y2 - Edge.ARROWHEAD_LENGTH * Math.sin(v_angle + Edge.ARROHEAD_ANGLE),
        };

        // Set arrowhead sides positions
        this.left_arrowhead_div.setAttribute("style", get_line_styles(x2, y2, arrow1.x, arrow1.y));
        this.right_arrowhead_div.setAttribute("style", get_line_styles(x2, y2, arrow2.x, arrow2.y));

        // Set hitbox
        const hitbox_norm = Edge.HITBOX_RADIUS / Math.sqrt((x2 - this.source.x) ** 2 + (y2 - this.source.y) ** 2);
        const hx = x2 - Edge.HITBOX_RADIUS + hitbox_norm * (this.source.x - x2);
        const hy = y2 - Edge.HITBOX_RADIUS + hitbox_norm * (this.source.y - y2);
        const hitbox_style =
            `width: ${(Edge.HITBOX_RADIUS * 2).toString()}px;` +
            `height: ${(Edge.HITBOX_RADIUS * 2).toString()}px;` +
            `top: ${hy.toString()}px;` +
            `left: ${hx.toString()}px;`;
        this.hitbox_div.setAttribute("style", hitbox_style);

        // Update colour
        this.updateColour(this.colour);
    };
    public linkNodePos(): void {
        const x2 = this.destination.x;
        const y2 = this.destination.y;
        const norm = GraphNode.RADIUS / Math.sqrt((x2 - this.source.x) ** 2 + (y2 - this.source.y) ** 2);
        this.updatePos(x2 + norm * (this.source.x - x2), y2 + norm * (this.source.y - y2));
    }
    public linkCursorPos(event: MouseEvent) {
        const x2 = event.clientX;
        const y2 = event.clientY;
        const norm = Edge.HITBOX_RADIUS / Math.sqrt((x2 - this.source.x) ** 2 + (y2 - this.source.y) ** 2);
        this.updatePos(x2 - norm * (this.source.x - x2), y2 - norm * (this.source.y - y2));
    }

    public delete(): void {
        // Remove divs
        GRAPH.HTML_Container?.removeChild(this.line_div);
        GRAPH.HTML_Container?.removeChild(this.left_arrowhead_div);
        GRAPH.HTML_Container?.removeChild(this.right_arrowhead_div);
        GRAPH.HTML_Container?.removeChild(this.hitbox_div);

        // Remove edge from source's out_edges
        let i = this.source.out_edges.indexOf(this);
        if (i === -1) throw Error("Edge does not exist in source's out_edges array, cannot delete");
        else this.source.out_edges.splice(i, 1);

        // Remove source from destination's in_neighbours
        let j = this.destination.in_neighbours.indexOf(this.source);
        if (j === -1) throw Error("Source does not exist inside destination's in_neighbour's array, cannot delete");
        else this.destination.in_neighbours.splice(j, 1);
    }
}
