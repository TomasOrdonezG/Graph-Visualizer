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
    public moving_head: boolean = false;
    public moving_tail: boolean = false;

    public line_div: HTMLDivElement;
    public left_arrowhead_div: HTMLDivElement;
    public right_arrowhead_div: HTMLDivElement;
    public hitbox_div_head: HTMLDivElement;
    public hitbox_div_tail: HTMLDivElement;
    // #endregion

    constructor(source: GraphNode, destination: GraphNode) {
        this.source = source;
        this.destination = destination;

        // * Create Divs
        // Line
        this.line_div = document.createElement("div");
        this.line_div.className = "line";
        GRAPH.HTML_Container?.appendChild(this.line_div);

        // Arrowheads
        this.left_arrowhead_div = document.createElement("div");
        this.left_arrowhead_div.className = "line";
        GRAPH.HTML_Container?.appendChild(this.left_arrowhead_div);

        this.right_arrowhead_div = document.createElement("div");
        this.right_arrowhead_div.className = "line";
        GRAPH.HTML_Container?.appendChild(this.right_arrowhead_div);

        // Hitboxes
        this.hitbox_div_head = document.createElement("div");
        this.hitbox_div_head.className = "hitbox";
        GRAPH.HTML_Container?.appendChild(this.hitbox_div_head);

        this.hitbox_div_tail = document.createElement("div");
        this.hitbox_div_tail.className = "hitbox";
        GRAPH.HTML_Container?.appendChild(this.hitbox_div_tail);

        this.updateColour(Edge.DEFAULT_COLOUR);

        // Add mouse event listeners
        this.addMouseEventListeners();
    }

    private addMouseEventListeners() {
        // Hover
        const handle_mouse_enter = (event: MouseEvent) => {
            if (!GRAPH.traversing) {
                this.updateColour(Edge.HOVER_COLOUR);
                this.hovering = true;
            }
        };
        const handle_mouse_leave = (event: MouseEvent) => {
            if (!GRAPH.traversing) {
                this.updateColour(Edge.DEFAULT_COLOUR);
                this.hovering = false;
            }
        };
        this.hitbox_div_head.addEventListener("mouseenter", handle_mouse_enter);
        this.hitbox_div_head.addEventListener("mouseleave", handle_mouse_leave);
        this.hitbox_div_tail.addEventListener("mouseenter", handle_mouse_enter);
        this.hitbox_div_tail.addEventListener("mouseleave", handle_mouse_leave);

        // Mouse down
        this.hitbox_div_head.addEventListener("mousedown", (event: MouseEvent): void => {
            if (this.hovering) {
                GRAPH.initial_node = this.source;
                this.moving_head = true;
            }
        });
        this.hitbox_div_tail.addEventListener("mousedown", (event: MouseEvent) => {
            if (this.hovering) {
                GRAPH.final_node = this.destination;
                this.moving_tail = true;
            }
        });

        // Mouse up
        document.addEventListener("mouseup", (event: MouseEvent): void => {
            if (this.moving_head || this.moving_tail) {
                this.moving_head = false;
                this.moving_tail = false;
                this.delete();
            }
        });

        // Mouse drag
        document.addEventListener("mousemove", (event: MouseEvent): void => {
            if (this.moving_head) {
                this.linkCursorToHeadPos(event);
            }
            if (this.moving_tail) {
                this.linkCursorToTailPos(event);
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

    public updatePos = (x1: number, y1: number, x2: number, y2: number): void => {
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

        // * LINE
        // Set edge position
        const line_styles = get_line_styles(x1, y1, x2, y2);
        this.line_div.setAttribute("style", line_styles);

        // * ARROWHEAD
        // Compute arrowhead sides positions
        const v_angle = Math.atan2(y2 - y1, x2 - x1);
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

        // * HITBOXES
        const hb_rnorm = Edge.HITBOX_RADIUS / Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const get_hitbox_style = (x: number, y: number) => {
            const hitbox_style =
                `width: ${(Edge.HITBOX_RADIUS * 2).toString()}px;` +
                `height: ${(Edge.HITBOX_RADIUS * 2).toString()}px;` +
                `top: ${y.toString()}px;` +
                `left: ${x.toString()}px;`;
            return hitbox_style;
        };

        // Set arrow head hitbox
        const hb_xh = x2 - Edge.HITBOX_RADIUS + hb_rnorm * (x1 - x2);
        const hb_yh = y2 - Edge.HITBOX_RADIUS + hb_rnorm * (y1 - y2);
        const hitbox_style_head = get_hitbox_style(hb_xh, hb_yh);
        this.hitbox_div_head.setAttribute("style", hitbox_style_head);

        // Set arrow tail hitbox
        const hb_xt = x1 - Edge.HITBOX_RADIUS - hb_rnorm * (x1 - x2);
        const hb_yt = y1 - Edge.HITBOX_RADIUS - hb_rnorm * (y1 - y2);
        const hitbox_style_tail = get_hitbox_style(hb_xt, hb_yt);
        this.hitbox_div_tail.setAttribute("style", hitbox_style_tail);

        // * Update colour
        this.updateColour(this.colour);
    };
    public linkNodesPos(): void {
        const rnorm =
            GraphNode.RADIUS /
            Math.sqrt((this.destination.x - this.source.x) ** 2 + (this.destination.y - this.source.y) ** 2);
        const x1 = this.source.x - rnorm * (this.source.x - this.destination.x);
        const y1 = this.source.y - rnorm * (this.source.y - this.destination.y);
        const x2 = this.destination.x + rnorm * (this.source.x - this.destination.x);
        const y2 = this.destination.y + rnorm * (this.source.y - this.destination.y);

        this.updatePos(x1, y1, x2, y2);
    }
    public linkCursorToHeadPos(event: MouseEvent) {
        const hb_rnorm =
            Edge.HITBOX_RADIUS / Math.sqrt((event.clientX - this.source.x) ** 2 + (event.clientY - this.source.y) ** 2);

        // Arrow tail pos
        const x1 = this.source.x - hb_rnorm * (this.source.x - event.clientX);
        const y1 = this.source.y - hb_rnorm * (this.source.y - event.clientY);

        // Arrow head pos (linked to cursor)
        const x2 = event.clientX - hb_rnorm * (this.source.x - event.clientX);
        const y2 = event.clientY - hb_rnorm * (this.source.y - event.clientY);

        this.updatePos(x1, y1, x2, y2);
    }
    public linkCursorToTailPos(event: MouseEvent) {
        // TODO: TEST
        const hb_rnorm =
            Edge.HITBOX_RADIUS /
            Math.sqrt((this.destination.x - event.clientX) ** 2 + (this.destination.y - event.clientY) ** 2);

        // Arrow tail pos
        const x1 = event.clientX - hb_rnorm * (this.destination.x - event.clientX);
        const y1 = event.clientY - hb_rnorm * (this.destination.y - event.clientY);

        // Arrow head pos
        const x2 = this.destination.x - hb_rnorm * (this.destination.x - event.clientX);
        const y2 = this.destination.y - hb_rnorm * (this.destination.y - event.clientY);

        this.updatePos(x1, y1, x2, y2);
    }

    public delete(): void {
        // Remove divs
        GRAPH.HTML_Container?.removeChild(this.line_div);
        GRAPH.HTML_Container?.removeChild(this.left_arrowhead_div);
        GRAPH.HTML_Container?.removeChild(this.right_arrowhead_div);
        GRAPH.HTML_Container?.removeChild(this.hitbox_div_head);
        GRAPH.HTML_Container?.removeChild(this.hitbox_div_tail);

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
