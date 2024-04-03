"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyboardState = exports.GRAPH = void 0;
var graphNode_1 = require("./graphNode");
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
        circleDiv.style.left = event.clientX - graphNode_1.GraphNode.RADIUS + "px";
        circleDiv.style.top = event.clientY - graphNode_1.GraphNode.RADIUS + "px";
        // Append to graph HTML container and nodes array
        (_a = this.HTML_Container) === null || _a === void 0 ? void 0 : _a.appendChild(circleDiv);
        // Create the new node object
        var new_node = new graphNode_1.GraphNode(event.clientX, event.clientY, this.next_node_val, circleDiv);
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
exports.GRAPH = GRAPH;
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
exports.keyboardState = keyboardState;
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
