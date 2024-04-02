var GraphNode = /** @class */ (function () {
    // #endregion
    // * INITIALIZATION
    function GraphNode(x, y, value, div) {
        var _this = this;
        this.background_colour = "white";
        this.border_colour = "black";
        this.out_neighbours = [];
        this.in_neighbours = [];
        this.selected = true;
        // Dragging attributes
        this.dragging = false;
        this.initialX_drag = 0;
        this.initialY_drag = 0;
        // Update Methods
        this.updateAll = function () {
            _this.updatePos();
            _this.updateValue();
            _this.updateColour();
            _this.updateSize();
        };
        this.updatePos = function () {
            _this.div.style.left = _this.x - GraphNode.RADIUS + "px";
            _this.div.style.top = _this.y - GraphNode.RADIUS + "px";
            _this.updateEdgesPos();
        };
        this.updateValue = function () {
            _this.div.textContent = _this.value.toString();
        };
        this.updateColour = function () {
            _this.div.style.backgroundColor = _this.background_colour;
            _this.div.style.border = GraphNode.BORDER_WIDTH + "px" + " solid " + _this.border_colour;
        };
        this.updateSize = function () {
            _this.div.style.width = 2 * GraphNode.RADIUS + "px";
            _this.div.style.height = 2 * GraphNode.RADIUS + "px";
        };
        this.updateEdgesPos = function () {
            // Updates all out_neighbour and in_neighbouring edges' position
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
            var update_arrow = function (source_node, out_edge) {
                // * Updates the position of an arrow based on a source and a neighbour
                // Compute the edge position. This will end at the edge of the neighbour node (not at its center)
                var x2 = out_edge.out_neighbour.x;
                var y2 = out_edge.out_neighbour.y;
                var norm = GraphNode.RADIUS / Math.sqrt(Math.pow((x2 - source_node.x), 2) + Math.pow((y2 - source_node.y), 2));
                var edge = {
                    x: x2 + norm * (source_node.x - x2),
                    y: y2 + norm * (source_node.y - y2),
                };
                // Set edge position
                var edge_styles = get_line_styles(source_node.x, source_node.y, edge.x, edge.y);
                out_edge.edge_div.setAttribute("style", edge_styles);
                // Compute arrowhead sides positions
                var v_angle = Math.atan2(edge.y - source_node.y, edge.x - source_node.x);
                var arrow1 = {
                    x: edge.x - GraphNode.ARROWHEAD_LENGTH * Math.cos(v_angle - GraphNode.ARROHEAD_ANGLE),
                    y: edge.y - GraphNode.ARROWHEAD_LENGTH * Math.sin(v_angle - GraphNode.ARROHEAD_ANGLE),
                };
                var arrow2 = {
                    x: edge.x - GraphNode.ARROWHEAD_LENGTH * Math.cos(v_angle + GraphNode.ARROHEAD_ANGLE),
                    y: edge.y - GraphNode.ARROWHEAD_LENGTH * Math.sin(v_angle + GraphNode.ARROHEAD_ANGLE),
                };
                // Set arrowhead sides positions
                out_edge.left_arrowhead_div.setAttribute("style", get_line_styles(edge.x, edge.y, arrow1.x, arrow1.y));
                out_edge.right_arrowhead_div.setAttribute("style", get_line_styles(edge.x, edge.y, arrow2.x, arrow2.y));
            };
            // Update each out_neighbour
            for (var _i = 0, _a = _this.out_neighbours; _i < _a.length; _i++) {
                var out_neighbour = _a[_i];
                update_arrow(_this, out_neighbour);
            }
            // Update each in_neighbour
            // Find this in this' in_neighbour's out_neighbours and update it as the neighbour (but in reality it's this)
            for (var _b = 0, _c = _this.in_neighbours; _b < _c.length; _b++) {
                var in_neighbour = _c[_b];
                for (var _d = 0, _e = in_neighbour.out_neighbours; _d < _e.length; _d++) {
                    var out_neighbour_of_in_neighbour = _e[_d];
                    if (out_neighbour_of_in_neighbour.out_neighbour == _this) {
                        update_arrow(in_neighbour, out_neighbour_of_in_neighbour);
                    }
                }
            }
        };
        this.value = value;
        this.x = x;
        this.y = y;
        this.div = div;
        this.updateAll();
        this.mouseEventListeners();
        if (!keyboardState.CTRL)
            GRAPH.deselect_all();
        this.select();
    }
    // * PRIVATE METHODS
    GraphNode.prototype.mouseEventListeners = function () {
        var _this = this;
        // Mouse down
        this.div.addEventListener("mousedown", function (event) {
            event.preventDefault();
            if (event.button === 0) {
                // * LEFT CLICK
                // Select
                if (!keyboardState.CTRL)
                    GRAPH.deselect_all();
                _this.select();
                // Set dragging to true on ALL selected nodes. Compute the initial position of the cursor
                for (var _i = 0, _a = GRAPH.nodes; _i < _a.length; _i++) {
                    var node = _a[_i];
                    if (node.selected) {
                        node.dragging = true;
                        node.initialX_drag = event.clientX - node.x;
                        node.initialY_drag = event.clientY - node.y;
                    }
                }
            }
            else if (event.button === 2) {
                // * RIGHT CLICK
                GRAPH.initial_node = _this;
            }
        });
        // Mouse move
        document.addEventListener("mousemove", function (event) {
            event.preventDefault();
            if (_this.dragging) {
                _this.x = event.clientX - _this.initialX_drag;
                _this.y = event.clientY - _this.initialY_drag;
                _this.updatePos();
            }
        });
        // Mouse up
        document.addEventListener("mouseup", function (event) {
            event.preventDefault();
            _this.dragging = false;
            GRAPH.initial_node = null;
        });
        this.div.addEventListener("mouseup", function (event) {
            if (GRAPH.initial_node && GRAPH.initial_node !== _this) {
                GRAPH.initial_node.connect(_this);
            }
            else {
                GRAPH.initial_node = null;
            }
        });
    };
    GraphNode.prototype.connect = function (final_node) {
        var _a, _b, _c;
        GRAPH.initial_node = null;
        // Don't connect if already connected
        if (this.out_neighbours.map(function (neighbour) { return neighbour.out_neighbour; }).includes(final_node))
            return;
        // Select the final node
        GRAPH.deselect_all();
        final_node.select();
        // Create arrow divs
        var line = document.createElement("div");
        var left_arrowhead = document.createElement("div");
        var right_arrowhead = document.createElement("div");
        line.className = "line";
        left_arrowhead.className = "line";
        right_arrowhead.className = "line";
        (_a = GRAPH.HTML_Container) === null || _a === void 0 ? void 0 : _a.appendChild(line);
        (_b = GRAPH.HTML_Container) === null || _b === void 0 ? void 0 : _b.appendChild(left_arrowhead);
        (_c = GRAPH.HTML_Container) === null || _c === void 0 ? void 0 : _c.appendChild(right_arrowhead);
        // Add neighbour and calculate position of arrow
        this.out_neighbours.push({
            out_neighbour: final_node,
            edge_div: line,
            left_arrowhead_div: left_arrowhead,
            right_arrowhead_div: right_arrowhead,
            edge_colour: "black",
        });
        final_node.in_neighbours.push(this);
        this.updateEdgesPos();
    };
    // * PUBLIC METHODS
    GraphNode.prototype.select = function () {
        this.border_colour = GraphNode.SELECTED_BORDER_COLOUR;
        this.updateColour();
        this.selected = true;
    };
    GraphNode.prototype.deselect = function () {
        this.border_colour = "black";
        this.updateColour();
        this.selected = false;
    };
    GraphNode.prototype.toggle_select = function () {
        if (this.selected)
            this.deselect();
        else
            this.select();
    };
    // #region * ATTRIBUTES
    // Constants
    GraphNode.RADIUS = 25;
    GraphNode.BORDER_WIDTH = 2;
    GraphNode.ARROWHEAD_LENGTH = 15;
    GraphNode.ARROHEAD_ANGLE = Math.PI / 6;
    GraphNode.SELECTED_BORDER_COLOUR = "green";
    return GraphNode;
}());
var GRAPH = {
    nodes: [],
    initial_node: null,
    size: 0,
    next_node_val: 0,
    HTML_Container: null,
    init: function () {
        // Create container
        var container = document.createElement("div");
        container.id = "graph";
        document.body.appendChild(container);
        this.HTML_Container = container;
    },
    addNode: function (event) {
        var _a;
        // Prevent adding a node when mouse is on a node div
        if (event.button !== 0)
            return;
        if (event.target.closest(".circle"))
            return;
        // Create node
        var circleDiv = document.createElement("div");
        circleDiv.className = "circle";
        // Value and position
        circleDiv.style.left = event.clientX - GraphNode.RADIUS + "px";
        circleDiv.style.top = event.clientY - GraphNode.RADIUS + "px";
        // Append to graph HTML container and nodes array
        (_a = this.HTML_Container) === null || _a === void 0 ? void 0 : _a.appendChild(circleDiv);
        // Create the new node object
        var new_node = new GraphNode(event.clientX, event.clientY, this.next_node_val, circleDiv);
        this.nodes.push(new_node);
        this.next_node_val++;
        this.size++;
    },
    deselect_all: function () {
        for (var _i = 0, _a = this.nodes; _i < _a.length; _i++) {
            var node = _a[_i];
            node.deselect();
        }
    },
    delete_node: function (node) {
        var _a, _b, _c, _d, _e, _f, _g;
        // Remove from array
        var i = this.nodes.indexOf(node);
        if (i == -1)
            throw Error("Cannot delete node that isn't a part of GRAPH.nodes");
        else
            this.nodes.splice(i, 1);
        // Delete node HTML element
        (_a = this.HTML_Container) === null || _a === void 0 ? void 0 : _a.removeChild(node.div);
        // Delete edges of out_neighbours
        for (var _i = 0, _h = node.out_neighbours; _i < _h.length; _i++) {
            var out_edge = _h[_i];
            (_b = GRAPH.HTML_Container) === null || _b === void 0 ? void 0 : _b.removeChild(out_edge.edge_div);
            (_c = GRAPH.HTML_Container) === null || _c === void 0 ? void 0 : _c.removeChild(out_edge.left_arrowhead_div);
            (_d = GRAPH.HTML_Container) === null || _d === void 0 ? void 0 : _d.removeChild(out_edge.right_arrowhead_div);
            // Remove from out_neighbours' in_neighbours list
            var i_1 = out_edge.out_neighbour.in_neighbours.indexOf(node);
            out_edge.out_neighbour.in_neighbours.splice(i_1, 1);
        }
        // Find node to be deleted in its in_neighbours' out_neighbours list
        for (var _j = 0, _k = node.in_neighbours; _j < _k.length; _j++) {
            var in_neighbour = _k[_j];
            for (var i_2 = 0; i_2 < in_neighbour.out_neighbours.length; i_2++) {
                if (in_neighbour.out_neighbours[i_2].out_neighbour == node) {
                    // Delete edge HTML elements
                    var node_as_n = in_neighbour.out_neighbours[i_2];
                    (_e = GRAPH.HTML_Container) === null || _e === void 0 ? void 0 : _e.removeChild(node_as_n.edge_div);
                    (_f = GRAPH.HTML_Container) === null || _f === void 0 ? void 0 : _f.removeChild(node_as_n.left_arrowhead_div);
                    (_g = GRAPH.HTML_Container) === null || _g === void 0 ? void 0 : _g.removeChild(node_as_n.right_arrowhead_div);
                    // Remove from in_neighbours' out_neighbours list
                    in_neighbour.out_neighbours.splice(i_2, 1);
                    break;
                }
            }
        }
        this.size--;
    },
};
GRAPH.init();
// Add node on click
document.addEventListener("click", GRAPH.addNode.bind(GRAPH));
// Disable context menu
window.addEventListener("contextmenu", function (event) {
    event.preventDefault();
});
var keyboardState = {
    CTRL: false,
    A: false,
};
document.addEventListener("keydown", function (event) {
    if (event.key === "Control") {
        keyboardState.CTRL = true;
    }
    else if (event.key === "a" || event.key === "A") {
        keyboardState.A = true;
    }
    // ! SHORTCUTS
    if (keyboardState.CTRL && keyboardState.A) {
        // Select all nodes
        for (var _i = 0, _a = GRAPH.nodes; _i < _a.length; _i++) {
            var node = _a[_i];
            node.select();
        }
    }
    else if (event.key === "Backspace") {
        // Delete selected nodes
        for (var i = GRAPH.nodes.length - 1; i >= 0; i--) {
            if (GRAPH.nodes[i].selected) {
                GRAPH.delete_node(GRAPH.nodes[i]);
            }
        }
        if (GRAPH.size === 0)
            GRAPH.next_node_val = 0;
    }
});
document.addEventListener("keyup", function (event) {
    if (event.key === "Control") {
        keyboardState.CTRL = false;
    }
    else if (event.key === "a" || event.key === "A") {
        keyboardState.A = false;
    }
});
