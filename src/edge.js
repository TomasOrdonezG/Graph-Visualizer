import GraphNode from "./graphNode.js";
import { GRAPH } from "./main.js";
class Edge {
    // #endregion
    constructor(source, destination) {
        var _a, _b, _c, _d;
        this.colour = Edge.DEFAULT_COLOUR;
        this.hovering = false;
        this.moving = false;
        this.updateColour = (colour) => {
            this.colour = colour;
            this.line_div.style.border = `1px solid ${this.colour}`;
            this.left_arrowhead_div.style.border = `1px solid ${this.colour}`;
            this.right_arrowhead_div.style.border = `1px solid ${this.colour}`;
        };
        this.updatePos = () => {
            // Updates all out_neighbour and in_neighbouring edges' position
            const x2 = this.destination.x;
            const y2 = this.destination.y;
            const norm = GraphNode.RADIUS / Math.sqrt((x2 - this.source.x) ** 2 + (y2 - this.source.y) ** 2);
            const edge = {
                x: x2 + norm * (this.source.x - x2),
                y: y2 + norm * (this.source.y - y2),
            };
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
            // Set edge position
            const line_styles = get_line_styles(this.source.x, this.source.y, edge.x, edge.y);
            this.line_div.setAttribute("style", line_styles);
            // Compute arrowhead sides positions
            const v_angle = Math.atan2(edge.y - this.source.y, edge.x - this.source.x);
            const arrow1 = {
                x: edge.x - Edge.ARROWHEAD_LENGTH * Math.cos(v_angle - Edge.ARROHEAD_ANGLE),
                y: edge.y - Edge.ARROWHEAD_LENGTH * Math.sin(v_angle - Edge.ARROHEAD_ANGLE),
            };
            const arrow2 = {
                x: edge.x - Edge.ARROWHEAD_LENGTH * Math.cos(v_angle + Edge.ARROHEAD_ANGLE),
                y: edge.y - Edge.ARROWHEAD_LENGTH * Math.sin(v_angle + Edge.ARROHEAD_ANGLE),
            };
            // Set arrowhead sides positions
            this.left_arrowhead_div.setAttribute("style", get_line_styles(edge.x, edge.y, arrow1.x, arrow1.y));
            this.right_arrowhead_div.setAttribute("style", get_line_styles(edge.x, edge.y, arrow2.x, arrow2.y));
            // Set hitbox
            const hitbox_norm = Edge.HITBOX_RADIUS / Math.sqrt((edge.x - this.source.x) ** 2 + (edge.y - this.source.y) ** 2);
            const hx = edge.x - Edge.HITBOX_RADIUS + hitbox_norm * (this.source.x - edge.x);
            const hy = edge.y - Edge.HITBOX_RADIUS + hitbox_norm * (this.source.y - edge.y);
            const hitbox_style = `width: ${(Edge.HITBOX_RADIUS * 2).toString()}px;` +
                `height: ${(Edge.HITBOX_RADIUS * 2).toString()}px;` +
                `top: ${hy.toString()}px;` +
                `left: ${hx.toString()}px;`;
            this.hitbox_div.setAttribute("style", hitbox_style);
        };
        this.source = source;
        this.destination = destination;
        // Create Divs
        this.line_div = document.createElement("div");
        this.line_div.className = "line";
        (_a = GRAPH.HTML_Container) === null || _a === void 0 ? void 0 : _a.appendChild(this.line_div);
        this.left_arrowhead_div = document.createElement("div");
        this.left_arrowhead_div.className = "line";
        (_b = GRAPH.HTML_Container) === null || _b === void 0 ? void 0 : _b.appendChild(this.left_arrowhead_div);
        this.right_arrowhead_div = document.createElement("div");
        this.right_arrowhead_div.className = "line";
        (_c = GRAPH.HTML_Container) === null || _c === void 0 ? void 0 : _c.appendChild(this.right_arrowhead_div);
        this.hitbox_div = document.createElement("div");
        this.hitbox_div.className = "hitbox";
        (_d = GRAPH.HTML_Container) === null || _d === void 0 ? void 0 : _d.appendChild(this.hitbox_div);
        this.updateColour(Edge.DEFAULT_COLOUR);
        // Add mouse event listeners
        this.addMouseEventListeners();
    }
    addMouseEventListeners() {
        // Hover
        this.hitbox_div.addEventListener("mouseenter", (event) => {
            this.updateColour(Edge.HOVER_COLOUR);
        });
        this.hitbox_div.addEventListener("mouseleave", (event) => {
            this.updateColour(Edge.DEFAULT_COLOUR);
        });
        // Mouse down
        this.hitbox_div.addEventListener("mousedown", (event) => {
            if (this.hovering) {
                this.moving = true;
            }
        });
        // Mouse up
        this.hitbox_div.addEventListener("mouseup", (event) => {
            if (this.hovering) {
                this.moving = false;
            }
        });
        // Mouse drag
        document.addEventListener("mousemove", (event) => {
            if (this.moving) {
            }
        });
    }
    delete() {
        var _a, _b, _c, _d;
        // Remove divs
        (_a = GRAPH.HTML_Container) === null || _a === void 0 ? void 0 : _a.removeChild(this.line_div);
        (_b = GRAPH.HTML_Container) === null || _b === void 0 ? void 0 : _b.removeChild(this.left_arrowhead_div);
        (_c = GRAPH.HTML_Container) === null || _c === void 0 ? void 0 : _c.removeChild(this.right_arrowhead_div);
        (_d = GRAPH.HTML_Container) === null || _d === void 0 ? void 0 : _d.removeChild(this.hitbox_div);
        // Remove edge from source's out_edges
        let i = this.source.out_edges.indexOf(this);
        if (i === -1)
            throw Error("Edge does not exist in source's out_edges array");
        else
            this.source.out_edges.splice(i, 1);
        // Remove source from destination's in_neighbours
        let j = this.destination.in_neighbours.indexOf(this.source);
        if (j === -1)
            throw Error("Source does not exist inside destination's in_neighbour's array");
        else
            this.destination.in_neighbours.splice(j, 1);
    }
}
// #region ATTRIBUTES
// Constants
Edge.ARROWHEAD_LENGTH = 15;
Edge.ARROHEAD_ANGLE = Math.PI / 6;
Edge.HITBOX_RADIUS = 10;
Edge.HOVER_COLOUR = "blue";
Edge.DEFAULT_COLOUR = "black";
export default Edge;
