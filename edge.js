"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Edge = void 0;
var main_js_1 = require("./main.js");
var graphNode_js_1 = require("./graphNode.js");
var Edge = exports.Edge = /** @class */ (function () {
    // #endregion
    function Edge(source, destination) {
        var _this = this;
        var _a, _b, _c, _d;
        this.colour = Edge.DEFAULT_COLOUR;
        this.hovering = false;
        this.moving = false;
        this.updateColour = function (colour) {
            _this.colour = colour;
            _this.line_div.style.border = "1px solid ".concat(_this.colour);
            _this.left_arrowhead_div.style.border = "1px solid ".concat(_this.colour);
            _this.right_arrowhead_div.style.border = "1px solid ".concat(_this.colour);
        };
        this.updatePos = function () {
            // Updates all out_neighbour and in_neighbouring edges' position
            var x2 = _this.destination.x;
            var y2 = _this.destination.y;
            var norm = graphNode_js_1.GraphNode.RADIUS / Math.sqrt(Math.pow((x2 - _this.source.x), 2) + Math.pow((y2 - _this.source.y), 2));
            var edge = {
                x: x2 + norm * (_this.source.x - x2),
                y: y2 + norm * (_this.source.y - y2),
            };
            var get_line_styles = function (x1, y1, x2, y2) {
                // Gets the styles needed to draw a line as a div
                var width = x1 - x2;
                var height = y1 - y2;
                var length = Math.sqrt(width * width + height * height);
                var sx = (x1 + x2) / 2;
                var sy = (y1 + y2) / 2;
                var x = sx - length / 2;
                var y = sy;
                var angle = Math.PI - Math.atan2(-height, width);
                var styles = "width: ".concat(length.toString(), "px; ") +
                    "-moz-transform: rotate(".concat(angle.toString(), "rad); ") +
                    "-webkit-transform: rotate(".concat(angle.toString(), "rad); ") +
                    "-o-transform: rotate(".concat(angle.toString(), "rad); ") +
                    "-ms-transform: rotate(".concat(angle.toString(), "rad); ") +
                    "top: ".concat(y.toString(), "px; ") +
                    "left: ".concat(x.toString(), "px; ");
                return styles;
            };
            // Set edge position
            var line_styles = get_line_styles(_this.source.x, _this.source.y, edge.x, edge.y);
            _this.line_div.setAttribute("style", line_styles);
            // Compute arrowhead sides positions
            var v_angle = Math.atan2(edge.y - _this.source.y, edge.x - _this.source.x);
            var arrow1 = {
                x: edge.x - Edge.ARROWHEAD_LENGTH * Math.cos(v_angle - Edge.ARROHEAD_ANGLE),
                y: edge.y - Edge.ARROWHEAD_LENGTH * Math.sin(v_angle - Edge.ARROHEAD_ANGLE),
            };
            var arrow2 = {
                x: edge.x - Edge.ARROWHEAD_LENGTH * Math.cos(v_angle + Edge.ARROHEAD_ANGLE),
                y: edge.y - Edge.ARROWHEAD_LENGTH * Math.sin(v_angle + Edge.ARROHEAD_ANGLE),
            };
            // Set arrowhead sides positions
            _this.left_arrowhead_div.setAttribute("style", get_line_styles(edge.x, edge.y, arrow1.x, arrow1.y));
            _this.right_arrowhead_div.setAttribute("style", get_line_styles(edge.x, edge.y, arrow2.x, arrow2.y));
            // Set hitbox
            var hitbox_norm = Edge.HITBOX_RADIUS / Math.sqrt(Math.pow((edge.x - _this.source.x), 2) + Math.pow((edge.y - _this.source.y), 2));
            var hx = edge.x - Edge.HITBOX_RADIUS + hitbox_norm * (_this.source.x - edge.x);
            var hy = edge.y - Edge.HITBOX_RADIUS + hitbox_norm * (_this.source.y - edge.y);
            var hitbox_style = "width: ".concat((Edge.HITBOX_RADIUS * 2).toString(), "px;") +
                "height: ".concat((Edge.HITBOX_RADIUS * 2).toString(), "px;") +
                "top: ".concat(hy.toString(), "px;") +
                "left: ".concat(hx.toString(), "px;");
            _this.hitbox_div.setAttribute("style", hitbox_style);
        };
        this.source = source;
        this.destination = destination;
        // Create Divs
        this.line_div = document.createElement("div");
        this.line_div.className = "line";
        (_a = main_js_1.GRAPH.HTML_Container) === null || _a === void 0 ? void 0 : _a.appendChild(this.line_div);
        this.left_arrowhead_div = document.createElement("div");
        this.left_arrowhead_div.className = "line";
        (_b = main_js_1.GRAPH.HTML_Container) === null || _b === void 0 ? void 0 : _b.appendChild(this.left_arrowhead_div);
        this.right_arrowhead_div = document.createElement("div");
        this.right_arrowhead_div.className = "line";
        (_c = main_js_1.GRAPH.HTML_Container) === null || _c === void 0 ? void 0 : _c.appendChild(this.right_arrowhead_div);
        this.hitbox_div = document.createElement("div");
        this.hitbox_div.className = "hitbox";
        (_d = main_js_1.GRAPH.HTML_Container) === null || _d === void 0 ? void 0 : _d.appendChild(this.hitbox_div);
        this.updateColour(Edge.DEFAULT_COLOUR);
        // Add mouse event listeners
        this.addMouseEventListeners();
    }
    Edge.prototype.addMouseEventListeners = function () {
        var _this = this;
        // Hover
        this.hitbox_div.addEventListener("mouseenter", function (event) {
            _this.updateColour(Edge.HOVER_COLOUR);
        });
        this.hitbox_div.addEventListener("mouseleave", function (event) {
            _this.updateColour(Edge.DEFAULT_COLOUR);
        });
        // Mouse down
        this.hitbox_div.addEventListener("mousedown", function (event) {
            if (_this.hovering) {
                _this.moving = true;
            }
        });
        // Mouse up
        this.hitbox_div.addEventListener("mouseup", function (event) {
            if (_this.hovering) {
                _this.moving = false;
            }
        });
        // Mouse drag
        document.addEventListener("mousemove", function (event) {
            if (_this.moving) {
            }
        });
    };
    Edge.prototype.delete = function () {
        var _a, _b, _c, _d;
        // Remove divs
        (_a = main_js_1.GRAPH.HTML_Container) === null || _a === void 0 ? void 0 : _a.removeChild(this.line_div);
        (_b = main_js_1.GRAPH.HTML_Container) === null || _b === void 0 ? void 0 : _b.removeChild(this.left_arrowhead_div);
        (_c = main_js_1.GRAPH.HTML_Container) === null || _c === void 0 ? void 0 : _c.removeChild(this.right_arrowhead_div);
        (_d = main_js_1.GRAPH.HTML_Container) === null || _d === void 0 ? void 0 : _d.removeChild(this.hitbox_div);
        // Remove edge from source's out_edges
        var i = this.source.out_edges.indexOf(this);
        if (i === -1)
            throw Error("Edge does not exist in source's out_edges array");
        else
            this.source.out_edges.splice(i, 1);
        // Remove source from destination's in_neighbours
        var j = this.destination.in_neighbours.indexOf(this.source);
        if (j === -1)
            throw Error("Source does not exist inside destination's in_neighbour's array");
        else
            this.destination.in_neighbours.splice(j, 1);
    };
    // #region ATTRIBUTES
    // Constants
    Edge.ARROWHEAD_LENGTH = 15;
    Edge.ARROHEAD_ANGLE = Math.PI / 6;
    Edge.HITBOX_RADIUS = 10;
    Edge.HOVER_COLOUR = "blue";
    Edge.DEFAULT_COLOUR = "black";
    return Edge;
}());
