import GraphNode from "./graphNode.js";
import { GRAPH } from "./main.js";
class Edge {
    // #endregion
    constructor(source, destination) {
        var _a, _b, _c, _d, _e;
        this.colour = Edge.DEFAULT_COLOUR;
        this.weight = 1;
        this.hovering = false;
        this.moving_head = false;
        this.moving_tail = false;
        this.bound_mouse_handlers = {
            leave: this.handle_mouse_leave.bind(this),
            enter: this.handle_mouse_enter.bind(this),
            down_head_hitbox: this.handle_mouse_down_head_hitbox.bind(this),
            down_tail_hitbox: this.handle_mouse_down_tail_hitbox.bind(this),
            up: this.handle_mouse_up.bind(this),
            move: this.handle_mouse_move.bind(this),
        };
        this.updateColour = (colour) => {
            this.colour = colour;
            // border
            this.line_div.style.border = `1px solid ${this.colour}`;
            this.left_arrowhead_div.style.border = `1px solid ${this.colour}`;
            this.right_arrowhead_div.style.border = `1px solid ${this.colour}`;
            // Thickness
            const bg = this.colour === "black" ? this.colour : "transparent";
            this.line_div.style.backgroundColor = bg;
            this.left_arrowhead_div.style.backgroundColor = bg;
            this.right_arrowhead_div.style.backgroundColor = bg;
            // Z-Index
            const zi = this.colour === "black" ? "1" : "-1";
            this.line_div.style.zIndex = zi;
            this.left_arrowhead_div.style.zIndex = zi;
            this.right_arrowhead_div.style.zIndex = zi;
        };
        this.updatePos = (x1, y1, x2, y2) => {
            const get_line_styles = (x1, y1, x2, y2) => {
                // Gets the styles needed to draw a line as a div
                let width = x1 - x2;
                let height = y1 - y2;
                let length = Math.sqrt(width * width + height * height);
                let sx = (x1 + x2) / 2;
                let sy = (y1 + y2) / 2;
                let x = sx - length / 2;
                let y = sy;
                let angle = Math.PI - Math.atan2(-height, width);
                let styles = `width: ${length.toString()}px; ` +
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
            // * ARROWHEAD (if the graph is directed)
            if (GRAPH.directed) {
                // Compute arrowhead sides positions
                const v_angle = Math.atan2(y2 - y1, x2 - x1);
                const arrow1 = {
                    x: x2 - Edge.ARROWHEAD_LENGTH * Math.cos(v_angle - Edge.ARROHEAD_ANGLE),
                    y: y2 - Edge.ARROWHEAD_LENGTH * Math.sin(v_angle - Edge.ARROHEAD_ANGLE),
                };
                const arrow2 = {
                    x: x2 - Edge.ARROWHEAD_LENGTH * Math.cos(v_angle + Edge.ARROHEAD_ANGLE),
                    y: y2 - Edge.ARROWHEAD_LENGTH * Math.sin(v_angle + Edge.ARROHEAD_ANGLE),
                };
                // Set arrowhead sides positions
                this.left_arrowhead_div.setAttribute("style", get_line_styles(x2, y2, arrow1.x, arrow1.y));
                this.right_arrowhead_div.setAttribute("style", get_line_styles(x2, y2, arrow2.x, arrow2.y));
            }
            else {
                this.left_arrowhead_div.style.visibility = "hidden";
                this.right_arrowhead_div.style.visibility = "hidden";
            }
            // * HITBOXES
            const hb_rnorm = Edge.HITBOX_RADIUS / Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            const get_hitbox_style = (x, y) => {
                const hitbox_style = `width: ${(Edge.HITBOX_RADIUS * 2).toString()}px;` +
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
        this.source = source;
        this.destination = destination;
        // * Create Divs
        // Line
        this.line_div = document.createElement("div");
        this.line_div.className = "line";
        (_a = GRAPH.HTML_Container) === null || _a === void 0 ? void 0 : _a.appendChild(this.line_div);
        // Arrowheads
        this.left_arrowhead_div = document.createElement("div");
        this.left_arrowhead_div.className = "line";
        (_b = GRAPH.HTML_Container) === null || _b === void 0 ? void 0 : _b.appendChild(this.left_arrowhead_div);
        this.right_arrowhead_div = document.createElement("div");
        this.right_arrowhead_div.className = "line";
        (_c = GRAPH.HTML_Container) === null || _c === void 0 ? void 0 : _c.appendChild(this.right_arrowhead_div);
        // Hitboxes
        this.hitbox_div_head = document.createElement("div");
        this.hitbox_div_head.className = "hitbox";
        (_d = GRAPH.HTML_Container) === null || _d === void 0 ? void 0 : _d.appendChild(this.hitbox_div_head);
        this.hitbox_div_tail = document.createElement("div");
        this.hitbox_div_tail.className = "hitbox";
        (_e = GRAPH.HTML_Container) === null || _e === void 0 ? void 0 : _e.appendChild(this.hitbox_div_tail);
        this.updateColour(Edge.DEFAULT_COLOUR);
        // Add mouse event listeners
        this.addMouseEventListeners();
    }
    // Event listeners and handlers
    handle_mouse_enter() {
        // Hover starts
        if (!GRAPH.traversing) {
            this.updateColour(Edge.HOVER_COLOUR);
            this.hovering = true;
        }
    }
    handle_mouse_leave() {
        // Hover ends
        if (!GRAPH.traversing) {
            this.updateColour(Edge.DEFAULT_COLOUR);
            this.hovering = false;
        }
    }
    handle_mouse_down_head_hitbox() {
        // Start moving the tip of the arrow
        if (this.hovering) {
            GRAPH.initial_node = this.source;
            this.moving_head = true;
            GRAPH.moving_edge = this;
        }
    }
    handle_mouse_down_tail_hitbox() {
        // Start moving the end of the arrow
        if (this.hovering) {
            GRAPH.final_node = this.destination;
            this.moving_tail = true;
            GRAPH.moving_edge = this;
        }
    }
    handle_mouse_up() {
        // Connection failed, reset attributes
        if (this.moving_head || this.moving_tail) {
            this.delete();
            GRAPH.moving_edge = null;
            GRAPH.initial_node = null;
            GRAPH.final_node = null;
        }
    }
    handle_mouse_move(event) {
        // When the tail or head is moving, link them to the cursor positio
        if (this.moving_head) {
            this.linkCursorToHeadPos(event);
        }
        if (this.moving_tail) {
            this.linkCursorToTailPos(event);
        }
    }
    addMouseEventListeners() {
        // Add hover ELs for head and tail hitboxes
        this.hitbox_div_head.addEventListener("mouseenter", this.bound_mouse_handlers.enter);
        this.hitbox_div_head.addEventListener("mouseleave", this.bound_mouse_handlers.leave);
        this.hitbox_div_tail.addEventListener("mouseenter", this.bound_mouse_handlers.enter);
        this.hitbox_div_tail.addEventListener("mouseleave", this.bound_mouse_handlers.leave);
        // Add mouse down ELs for head and tail hitboxes
        this.hitbox_div_head.addEventListener("mousedown", this.bound_mouse_handlers.down_head_hitbox);
        this.hitbox_div_tail.addEventListener("mousedown", this.bound_mouse_handlers.down_tail_hitbox);
        // Add document-wide ELs
        document.addEventListener("mouseup", this.bound_mouse_handlers.up);
        document.addEventListener("mousemove", this.bound_mouse_handlers.move);
    }
    removeMouseEventListeners() {
        // Remove hover ELs for head and tail hitboxes
        this.hitbox_div_head.removeEventListener("mouseenter", this.bound_mouse_handlers.enter);
        this.hitbox_div_head.removeEventListener("mouseleave", this.bound_mouse_handlers.leave);
        this.hitbox_div_tail.removeEventListener("mouseenter", this.bound_mouse_handlers.enter);
        this.hitbox_div_tail.removeEventListener("mouseleave", this.bound_mouse_handlers.leave);
        // Remove mouse down ELs for head and tail hitboxes
        this.hitbox_div_head.removeEventListener("mousedown", this.bound_mouse_handlers.down_head_hitbox);
        this.hitbox_div_tail.removeEventListener("mousedown", this.bound_mouse_handlers.down_tail_hitbox);
        // Remove document-wide ELs
        document.removeEventListener("mouseup", this.bound_mouse_handlers.up);
        document.removeEventListener("mousemove", this.bound_mouse_handlers.move);
    }
    linkNodesPos() {
        const rnorm = GraphNode.RADIUS /
            Math.sqrt((this.destination.x - this.source.x) ** 2 + (this.destination.y - this.source.y) ** 2);
        const x1 = this.source.x - rnorm * (this.source.x - this.destination.x);
        const y1 = this.source.y - rnorm * (this.source.y - this.destination.y);
        const x2 = this.destination.x + rnorm * (this.source.x - this.destination.x);
        const y2 = this.destination.y + rnorm * (this.source.y - this.destination.y);
        this.updatePos(x1, y1, x2, y2);
    }
    linkCursorToHeadPos(event) {
        const hb_rnorm = Edge.HITBOX_RADIUS / Math.sqrt((event.clientX - this.source.x) ** 2 + (event.clientY - this.source.y) ** 2);
        // Arrow tail pos
        const x1 = this.source.x - hb_rnorm * (this.source.x - event.clientX);
        const y1 = this.source.y - hb_rnorm * (this.source.y - event.clientY);
        // Arrow head pos (linked to cursor)
        const x2 = event.clientX - hb_rnorm * (this.source.x - event.clientX);
        const y2 = event.clientY - hb_rnorm * (this.source.y - event.clientY);
        this.updatePos(x1, y1, x2, y2);
    }
    linkCursorToTailPos(event) {
        // Arrow tail pos
        const hb_rnorm = Edge.HITBOX_RADIUS /
            Math.sqrt((this.destination.x - event.clientX) ** 2 + (this.destination.y - event.clientY) ** 2);
        const x1 = event.clientX - hb_rnorm * (this.destination.x - event.clientX);
        const y1 = event.clientY - hb_rnorm * (this.destination.y - event.clientY);
        // Arrow head pos
        const node_rnorm = GraphNode.RADIUS /
            Math.sqrt((this.destination.x - event.clientX) ** 2 + (this.destination.y - event.clientY) ** 2);
        const x2 = this.destination.x - node_rnorm * (this.destination.x - event.clientX);
        const y2 = this.destination.y - node_rnorm * (this.destination.y - event.clientY);
        this.updatePos(x1, y1, x2, y2);
    }
    delete() {
        var _a, _b, _c, _d, _e;
        // Remove divs and event listeners
        (_a = GRAPH.HTML_Container) === null || _a === void 0 ? void 0 : _a.removeChild(this.line_div);
        (_b = GRAPH.HTML_Container) === null || _b === void 0 ? void 0 : _b.removeChild(this.left_arrowhead_div);
        (_c = GRAPH.HTML_Container) === null || _c === void 0 ? void 0 : _c.removeChild(this.right_arrowhead_div);
        (_d = GRAPH.HTML_Container) === null || _d === void 0 ? void 0 : _d.removeChild(this.hitbox_div_head);
        (_e = GRAPH.HTML_Container) === null || _e === void 0 ? void 0 : _e.removeChild(this.hitbox_div_tail);
        this.removeMouseEventListeners();
        // Remove edge from source's out_edges
        let i = this.source.out_edges.indexOf(this);
        if (i === -1)
            throw Error("Edge does not exist in source's out_edges array, cannot delete");
        else
            this.source.out_edges.splice(i, 1);
        // Remove edge from destination's in_edges
        let j = this.destination.in_edges.indexOf(this);
        if (j === -1)
            throw Error("Edge does not exist inside destination's in_edges's array, cannot delete");
        else
            this.destination.in_edges.splice(j, 1);
    }
}
// #region ATTRIBUTES
// Constants
Edge.ARROWHEAD_LENGTH = 15;
Edge.ARROHEAD_ANGLE = Math.PI / 6;
Edge.HITBOX_RADIUS = 10;
Edge.HOVER_COLOUR = "lightsalmon";
Edge.DEFAULT_COLOUR = "gray";
Edge.HIGHLIGHT_COLOUR = "black";
Edge.READY_COLOUR = "lightseagreen";
export default Edge;
