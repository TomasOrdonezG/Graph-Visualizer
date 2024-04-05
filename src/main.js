var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import GraphNode from "./graphNode.js";
import Edge from "./edge.js";
import { waitForClick, delay } from "./utils.js";
// Graph global variable
class Graph {
    // #endregion
    constructor() {
        // Standardly initializable attributes
        this.nodes = [];
        this.initial_node = null;
        this.size = 0;
        this.next_node_val = 0;
        this.traversing = false;
        // * Create container
        const container = document.createElement("div");
        container.id = "graph";
        document.body.appendChild(container);
        this.HTML_Container = container;
        // * Event Listeners
        // Add node on click
        document.addEventListener("mouseup", this.addNode.bind(this));
        // * Create buttons
        // BFS Button
        this.BFS_Button = document.createElement("button");
        this.BFS_Button.textContent = "BFS";
        this.BFS_Button.className = "button";
        this.BFS_Button.addEventListener("click", this.BFS.bind(this));
        document.body.appendChild(this.BFS_Button);
        // DFS Button
        this.DFS_Button = document.createElement("button");
        this.DFS_Button.textContent = "DFS";
        this.DFS_Button.className = "button";
        this.DFS_Button.addEventListener("click", this.DFS.bind(this));
        document.body.appendChild(this.DFS_Button);
    }
    addNode(event) {
        var _a;
        // Prevent adding a node when mouse is on a node div, or edge div
        if (event.button !== 0)
            return;
        if (this.traversing)
            return;
        if (event.target.closest(".circle"))
            return;
        if (event.target.closest(".hitbox"))
            return;
        if (event.target.closest(".line"))
            return;
        if (event.target.closest(".button"))
            return;
        // Create node
        const circleDiv = document.createElement("div");
        circleDiv.className = "circle";
        // Value and position
        circleDiv.style.left = event.clientX - GraphNode.RADIUS + "px";
        circleDiv.style.top = event.clientY - GraphNode.RADIUS + "px";
        // Append to graph HTML container and nodes array
        (_a = this.HTML_Container) === null || _a === void 0 ? void 0 : _a.appendChild(circleDiv);
        // Create the new node object
        const new_node = new GraphNode(event.clientX, event.clientY, this.next_node_val, circleDiv);
        this.nodes.push(new_node);
        this.next_node_val++;
        this.size++;
    }
    deselect_all() {
        for (let node of this.nodes) {
            node.deselect();
        }
    }
    // TRAVERSAL
    BFS() {
        return __awaiter(this, void 0, void 0, function* () {
            this.traversing = true;
            let root = this.get_first_selected();
            if (!root)
                return;
            this.reset_colour();
            yield delay(Graph.DELAY_TIME);
            // Create queue
            const Q = {
                queue: [],
                is_empty() {
                    return this.queue.length == 0;
                },
                enqueue(node) {
                    this.queue.push(node);
                },
                dequeue() {
                    return this.queue.splice(0, 1)[0];
                },
            };
            root.colour = "gray";
            root.updateColour();
            yield delay(Graph.DELAY_TIME);
            Q.enqueue(root);
            // Main BFS loop
            while (!Q.is_empty()) {
                let node = Q.dequeue();
                for (let out_edge of node.out_edges) {
                    const adj = out_edge.destination;
                    if (adj.colour === "white") {
                        out_edge.updateColour(Edge.HIGHLIGHT_COLOUR);
                        yield delay(Graph.DELAY_TIME);
                        adj.colour = "gray";
                        adj.updateColour();
                        yield delay(Graph.DELAY_TIME);
                        Q.enqueue(adj);
                    }
                }
                node.colour = "black";
                node.text_colour = "white";
                node.updateColour();
                yield delay(Graph.DELAY_TIME);
            }
            yield this.displayTraversalTree();
            this.traversing = false;
        });
    }
    DFS() {
        return __awaiter(this, void 0, void 0, function* () {
            this.traversing = true;
            function DFS_Visit(root) {
                return __awaiter(this, void 0, void 0, function* () {
                    // Visits one node and traverses through with DFS
                    // Mark root as discovered
                    root.colour = "gray";
                    root.updateColour();
                    yield delay(Graph.DELAY_TIME);
                    // Run DFS on each neighbour in order
                    for (let out_edge of root.out_edges) {
                        if (out_edge.destination.colour === "white") {
                            // Highlight edge path
                            out_edge.updateColour(Edge.HIGHLIGHT_COLOUR);
                            yield delay(Graph.DELAY_TIME);
                            // Recurse
                            yield DFS_Visit(out_edge.destination);
                        }
                    }
                    // Mark root as searched
                    root.colour = "black";
                    root.text_colour = "white";
                    root.updateColour();
                    yield delay(Graph.DELAY_TIME);
                });
            }
            // Reset colour
            this.reset_colour();
            yield delay(Graph.DELAY_TIME);
            // Main DFS loop
            for (let node of this.nodes) {
                if (node.colour === "white") {
                    yield DFS_Visit(node);
                }
            }
            yield this.displayTraversalTree();
            this.traversing = false;
        });
    }
    displayTraversalTree() {
        return __awaiter(this, void 0, void 0, function* () {
            // Shows only the edges that were traversed by the traversal method
            for (let node of this.nodes) {
                for (let out_edge of node.out_edges) {
                    if (out_edge.colour !== Edge.HIGHLIGHT_COLOUR) {
                        out_edge.updateColour("transparent");
                    }
                }
            }
            // Waits for click anywhere and the resets the colour of the graph
            yield waitForClick();
            this.reset_colour();
        });
    }
    reset_colour() {
        // Initialize each node to white and egde to gray
        for (let node of this.nodes) {
            node.colour = "white";
            node.text_colour = "black";
            node.updateColour();
            for (let edge of node.out_edges) {
                edge.updateColour(Edge.DEFAULT_COLOUR);
            }
        }
    }
    get_first_selected() {
        for (let node of this.nodes) {
            if (node.selected) {
                return node;
            }
        }
        return null;
    }
}
// #region ATTRIBUTES
// Global class constants
Graph.DELAY_TIME = 500;
const GRAPH = new Graph();
// Disable context menu
window.addEventListener("contextmenu", (event) => {
    event.preventDefault();
});
let keyboardState = {
    CTRL: false,
    A: false,
    SHIFT: false,
};
document.addEventListener("keydown", (event) => {
    // Update keyboard states
    if (event.key === "Control") {
        keyboardState.CTRL = true;
    }
    else if (event.key === "a" || event.key === "A") {
        keyboardState.A = true;
    }
    else if (event.key === "Shift") {
        keyboardState.SHIFT = true;
    }
    // Don't allow shortcuts to happen while the graph is traversing/animating
    if (GRAPH.traversing)
        return;
    // ! SHORTCUTS
    if (keyboardState.CTRL && keyboardState.A) {
        // Select all nodes
        for (let node of GRAPH.nodes) {
            node.select();
        }
    }
    else if (event.key === "Backspace") {
        // Delete selected nodes
        for (let i = GRAPH.nodes.length - 1; i >= 0; i--) {
            if (GRAPH.nodes[i].selected) {
                GRAPH.nodes[i].delete();
            }
        }
        if (GRAPH.size === 0)
            GRAPH.next_node_val = 0;
    }
});
document.addEventListener("keyup", (event) => {
    // Update keyboard states
    if (event.key === "Control") {
        keyboardState.CTRL = false;
    }
    else if (event.key === "a" || event.key === "A") {
        keyboardState.A = false;
    }
    else if (event.key === "Shift") {
        keyboardState.SHIFT = false;
    }
});
export { GRAPH, keyboardState };
