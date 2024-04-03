"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphNode = void 0;
var edge_js_1 = require("./edge.js");
var main_js_1 = require("./main.js");
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
                out_edge.updatePos();
            }
            // Update each in_neighbour
            for (var _b = 0, _c = _this.in_neighbours; _b < _c.length; _b++) {
                var in_neighbour = _c[_b];
                for (var _d = 0, _e = in_neighbour.out_edges; _d < _e.length; _d++) {
                    var out_edge_of_in_neighbour = _e[_d];
                    if (out_edge_of_in_neighbour.destination == _this) {
                        out_edge_of_in_neighbour.updatePos();
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
        if (!main_js_1.keyboardState.CTRL)
            main_js_1.GRAPH.deselect_all();
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
                if (!main_js_1.keyboardState.CTRL)
                    main_js_1.GRAPH.deselect_all();
                _this.select();
                // Set dragging to true on ALL selected nodes. Compute the initial position of the cursor
                for (var _i = 0, _a = main_js_1.GRAPH.nodes; _i < _a.length; _i++) {
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
                main_js_1.GRAPH.initial_node = _this;
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
            main_js_1.GRAPH.initial_node = null;
        });
        this.div.addEventListener("mouseup", function (event) {
            if (main_js_1.GRAPH.initial_node && main_js_1.GRAPH.initial_node !== _this) {
                main_js_1.GRAPH.initial_node.connect(_this);
            }
            else {
                main_js_1.GRAPH.initial_node = null;
            }
        });
    };
    // Connection
    GraphNode.prototype.connect = function (destination_node) {
        main_js_1.GRAPH.initial_node = null;
        // Don't connect if already connected
        if (this.out_edges.map(function (out_edge) { return out_edge.destination; }).includes(destination_node))
            return;
        // Select the final node
        main_js_1.GRAPH.deselect_all();
        destination_node.select();
        // Add neighbour and calculate position of arrow
        this.out_edges.push(new edge_js_1.Edge(this, destination_node));
        destination_node.in_neighbours.push(this);
        this.updateEdgesPos();
    };
    // * PUBLIC METHODS
    GraphNode.prototype.delete = function () {
        var _a;
        // Remove from array
        var i = main_js_1.GRAPH.nodes.indexOf(this);
        if (i == -1)
            throw Error("Error: Attempting to delete node that isn't a part of GRAPH.nodes");
        else
            main_js_1.GRAPH.nodes.splice(i, 1);
        // Delete node HTML element
        (_a = main_js_1.GRAPH.HTML_Container) === null || _a === void 0 ? void 0 : _a.removeChild(this.div);
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
        main_js_1.GRAPH.size--;
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
exports.GraphNode = GraphNode;
