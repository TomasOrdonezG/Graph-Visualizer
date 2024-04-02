var Edge = /** @class */ (function () {
    // #endregion
    function Edge(source, destination) {
        var _this = this;
        var _a, _b, _c, _d;
        this.colour = "black";
        this.updateColour = function () { };
        this.updateTipPos = function () {
            // Updates all out_neighbour and in_neighbouring edges' position
            var x2 = _this.destination.x;
            var y2 = _this.destination.y;
            var norm = GraphNode.RADIUS / Math.sqrt(Math.pow((x2 - _this.source.x), 2) + Math.pow((y2 - _this.source.y), 2));
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
        };
        this.source = source;
        this.destination = destination;
        // Create divs
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
    }
    Edge.prototype.delete = function () {
        var _a, _b, _c;
        // Delete edges of out_neighbours
        (_a = GRAPH.HTML_Container) === null || _a === void 0 ? void 0 : _a.removeChild(this.line_div);
        (_b = GRAPH.HTML_Container) === null || _b === void 0 ? void 0 : _b.removeChild(this.left_arrowhead_div);
        (_c = GRAPH.HTML_Container) === null || _c === void 0 ? void 0 : _c.removeChild(this.right_arrowhead_div);
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
    return Edge;
}());
var GraphNode = /** @class */ (function () {
    // #endregion
    // * INITIALIZATION
    function GraphNode(x, y, value, div) {
        var _this = this;
        this.background_colour = "white";
        this.border_colour = "black";
        this.out_edges = [];
        this.in_neighbours = [];
        this.selected = true;
        // Dragging attributes
        this.dragging = false;
        this.initialX_drag = 0;
        this.initialY_drag = 0;
        // Update Methods
        this.updateAll = function () {
            _this.updateValue();
            _this.updateColour();
            _this.updateSize();
        };
        this.updatePos = function (x, y) {
            _this.x = x;
            _this.y = y;
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
            // Update each out_edge
            for (var _i = 0, _a = _this.out_edges; _i < _a.length; _i++) {
                var out_edge = _a[_i];
                out_edge.updateTipPos();
            }
            // Update each in_neighbour
            // Find this in this' in_neighbour's out_neighbours and update it as the neighbour (but in reality it's this)
            for (var _b = 0, _c = _this.in_neighbours; _b < _c.length; _b++) {
                var in_neighbour = _c[_b];
                for (var _d = 0, _e = in_neighbour.out_edges; _d < _e.length; _d++) {
                    var out_edge_of_in_neighbour = _e[_d];
                    if (out_edge_of_in_neighbour.destination == _this) {
                        out_edge_of_in_neighbour.updateTipPos();
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
                _this.updatePos(event.clientX - _this.initialX_drag, event.clientY - _this.initialY_drag);
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
    // Connection
    GraphNode.prototype.connect = function (destination_node) {
        GRAPH.initial_node = null;
        // Don't connect if already connected
        if (this.out_edges.map(function (out_edge) { return out_edge.destination; }).includes(destination_node))
            return;
        // Select the final node
        GRAPH.deselect_all();
        destination_node.select();
        // Add neighbour and calculate position of arrow
        this.out_edges.push(new Edge(this, destination_node));
        destination_node.in_neighbours.push(this);
        this.updateEdgesPos();
    };
    // * PUBLIC METHODS
    GraphNode.prototype.delete = function () {
        var _a;
        // Remove from array
        var i = GRAPH.nodes.indexOf(this);
        if (i == -1)
            throw Error("Error: Attempting to delete node that isn't a part of GRAPH.nodes");
        else
            GRAPH.nodes.splice(i, 1);
        // Delete node HTML element
        (_a = GRAPH.HTML_Container) === null || _a === void 0 ? void 0 : _a.removeChild(this.div);
        // Delete out_edges
        for (var j = this.out_edges.length - 1; j >= 0; j--) {
            this.out_edges[j].delete();
        }
        // Delete in_edges
        for (var l = this.in_neighbours.length - 1; l >= 0; l--) {
            for (var _i = 0, _b = this.in_neighbours[l].out_edges; _i < _b.length; _i++) {
                var out_edge_of_in_neighbour = _b[_i];
                if (out_edge_of_in_neighbour.destination === this) {
                    out_edge_of_in_neighbour.delete();
                }
            }
        }
        GRAPH.size--;
    };
    // Selection
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
                GRAPH.nodes[i].delete();
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
