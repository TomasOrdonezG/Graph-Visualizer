import GraphNode from "./graphNode.js";
class Edge {
    // #endregion
    constructor(source, destination, graph) {
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
            double_click: this.handle_double_click.bind(this),
        };
        this.bound_set_edited_weight = this.set_edited_weight.bind(this);
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
                let styles = `width: ${length}px; ` +
                    `-moz-transform: rotate(${angle}rad); ` +
                    `-webkit-transform: rotate(${angle}rad); ` +
                    `-o-transform: rotate(${angle}rad); ` +
                    `-ms-transform: rotate(${angle}rad); ` +
                    `top: ${y}px; ` +
                    `left: ${x}px; `;
                return styles;
            };
            // * LINE
            // Set edge position
            const line_styles = get_line_styles(x1, y1, x2, y2);
            this.lineDiv.setAttribute("style", line_styles);
            // * ARROWHEAD (if the graph is directed)
            if (this.graph.directed) {
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
                    `top: ${y}px;` +
                    `left: ${x}px;`;
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
            // * Weight
            this.weightDiv.style.left = `${(x2 + x1) / 2}px`;
            this.weightDiv.style.top = `${(y2 + y1) / 2}px`;
            // * Update colour
            this.updateColour(this.colour);
        };
        this.graph = graph;
        this.source = source;
        this.destination = destination;
        // * Create Divs
        // Line
        this.lineDiv = document.createElement("div");
        this.lineDiv.classList.add("line", "pan");
        this.graph.HTML_Container.appendChild(this.lineDiv);
        // Arrowheads
        this.left_arrowhead_div = document.createElement("div");
        this.left_arrowhead_div.classList.add("line", "pan");
        this.graph.HTML_Container.appendChild(this.left_arrowhead_div);
        this.right_arrowhead_div = document.createElement("div");
        this.right_arrowhead_div.classList.add("line", "pan");
        this.graph.HTML_Container.appendChild(this.right_arrowhead_div);
        // Hitboxes
        this.hitbox_div_head = document.createElement("div");
        this.hitbox_div_head.classList.add("hitbox", "pan");
        this.graph.HTML_Container.appendChild(this.hitbox_div_head);
        this.hitbox_div_tail = document.createElement("div");
        this.hitbox_div_tail.classList.add("hitbox", "pan");
        this.graph.HTML_Container.appendChild(this.hitbox_div_tail);
        this.updateColour(Edge.DEFAULT_COLOUR);
        // Weight
        this.weightDiv = document.createElement("div");
        this.weightDiv.classList.add("weight", "pan");
        this.graph.HTML_Container.appendChild(this.weightDiv);
        this.updateWeight(this.weight);
        this.HTMLElementDependencies = [
            this.lineDiv,
            this.left_arrowhead_div,
            this.right_arrowhead_div,
            this.hitbox_div_head,
            this.hitbox_div_tail,
            this.weightDiv,
        ];
        // Add mouse event listeners
        this.addAllEventListeners();
    }
    // Event listeners and handlers
    handle_mouse_enter() {
        // Hover starts
        if (!this.graph.traversing) {
            this.updateColour(Edge.HOVER_COLOUR);
            this.hovering = true;
        }
    }
    handle_mouse_leave() {
        // Hover ends
        if (!this.graph.traversing) {
            this.updateColour(Edge.DEFAULT_COLOUR);
            this.hovering = false;
        }
    }
    handle_mouse_down_head_hitbox() {
        // Start moving the tip of the arrow
        if (this.hovering) {
            this.graph.initial_node = this.source;
            this.moving_head = true;
            this.graph.moving_edge = this;
        }
    }
    handle_mouse_down_tail_hitbox() {
        // Start moving the end of the arrow
        if (this.hovering) {
            this.graph.final_node = this.destination;
            this.moving_tail = true;
            this.graph.moving_edge = this;
        }
    }
    handle_mouse_up() {
        // Connection failed, reset attributes
        if (this.moving_head || this.moving_tail) {
            this.delete();
            this.graph.moving_edge = null;
            this.graph.initial_node = null;
            this.graph.final_node = null;
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
    handle_double_click() {
        this.weightDiv.setAttribute("contenteditable", "true");
        this.weightDiv.focus();
        // Select content inside the div
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(this.weightDiv);
        selection === null || selection === void 0 ? void 0 : selection.removeAllRanges();
        selection === null || selection === void 0 ? void 0 : selection.addRange(range);
    }
    set_edited_weight(event) {
        if (this.weightDiv.getAttribute("contenteditable") === "true" &&
            (("key" in event && event.key === "Enter") || "clientX" in event)) {
            // Save editing changes
            this.weightDiv.setAttribute("contenteditable", "false");
            // Validate input and update value
            const new_weight = parseInt(this.weightDiv.innerText);
            if (new_weight) {
                this.weight = new_weight;
            }
            this.weightDiv.innerText = this.weight.toString();
        }
    }
    addAllEventListeners() {
        // Add hover ELs for head and tail hitboxes
        this.hitbox_div_head.addEventListener("mouseenter", this.bound_mouse_handlers.enter);
        this.hitbox_div_head.addEventListener("mouseleave", this.bound_mouse_handlers.leave);
        this.hitbox_div_tail.addEventListener("mouseenter", this.bound_mouse_handlers.enter);
        this.hitbox_div_tail.addEventListener("mouseleave", this.bound_mouse_handlers.leave);
        // Add mouse down ELs for head and tail hitboxes
        this.hitbox_div_head.addEventListener("mousedown", this.bound_mouse_handlers.down_head_hitbox);
        this.hitbox_div_tail.addEventListener("mousedown", this.bound_mouse_handlers.down_tail_hitbox);
        // Double click and enter or click away for changing weight value ELs
        this.weightDiv.addEventListener("dblclick", this.bound_mouse_handlers.double_click);
        document.addEventListener("keydown", this.bound_set_edited_weight);
        document.addEventListener("mousedown", this.bound_set_edited_weight);
        // Add document-wide ELs
        document.addEventListener("mouseup", this.bound_mouse_handlers.up);
        document.addEventListener("mousemove", this.bound_mouse_handlers.move);
    }
    removeAllEventListeners() {
        // Remove hover ELs for head and tail hitboxes
        this.hitbox_div_head.removeEventListener("mouseenter", this.bound_mouse_handlers.enter);
        this.hitbox_div_head.removeEventListener("mouseleave", this.bound_mouse_handlers.leave);
        this.hitbox_div_tail.removeEventListener("mouseenter", this.bound_mouse_handlers.enter);
        this.hitbox_div_tail.removeEventListener("mouseleave", this.bound_mouse_handlers.leave);
        // Remove mouse down ELs for head and tail hitboxes
        this.hitbox_div_head.removeEventListener("mousedown", this.bound_mouse_handlers.down_head_hitbox);
        this.hitbox_div_tail.removeEventListener("mousedown", this.bound_mouse_handlers.down_tail_hitbox);
        // Double click and enter for changing weight value ELs
        this.weightDiv.removeEventListener("dblclick", this.bound_mouse_handlers.double_click);
        document.removeEventListener("keydown", this.bound_set_edited_weight);
        document.removeEventListener("mousedown", this.bound_set_edited_weight);
        // Remove document-wide ELs
        document.removeEventListener("mouseup", this.bound_mouse_handlers.up);
        document.removeEventListener("mousemove", this.bound_mouse_handlers.move);
    }
    updateColour(colour) {
        this.colour = colour;
        // Colour
        this.lineDiv.style.backgroundColor = this.colour;
        this.left_arrowhead_div.style.backgroundColor = this.colour;
        this.right_arrowhead_div.style.backgroundColor = this.colour;
        // Thickness
        this.lineDiv.style.height = `${this.colour === Edge.HIGHLIGHT_COLOUR ? 3 : 1}px`;
        this.left_arrowhead_div.style.height = `${this.colour === Edge.HIGHLIGHT_COLOUR ? 3 : 1}px`;
        this.right_arrowhead_div.style.height = `${this.colour === Edge.HIGHLIGHT_COLOUR ? 3 : 1}px`;
        // Z-Index
        const zi = this.colour === "black" ? "1" : "-1";
        this.lineDiv.style.zIndex = zi;
        this.left_arrowhead_div.style.zIndex = zi;
        this.right_arrowhead_div.style.zIndex = zi;
    }
    updateWeight(weight) {
        this.weight = weight;
        this.weightDiv.textContent = this.weight.toString();
        this.weightDiv.style.display = this.graph.weighted ? "" : "none";
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
        // Remove divs and event listeners
        this.HTMLElementDependencies.forEach((el) => {
            this.graph.HTML_Container.removeChild(el);
        });
        this.removeAllEventListeners();
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
