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
import { waitForClick } from "./utils.js";
// Graph global variable
class Graph {
    // private DFS_Button: HTMLButtonElement;
    constructor() {
        this.nodes = [];
        this.initial_node = null;
        this.size = 0;
        this.next_node_val = 0;
        this.traversing = false;
        // Create container
        const container = document.createElement("div");
        container.id = "graph";
        document.body.appendChild(container);
        this.HTML_Container = container;
        // Add node on click
        document.addEventListener("mouseup", this.addNode.bind(this));
        // Create buttons
        this.BFS_Button = document.createElement("button");
        this.BFS_Button.textContent = "BFS";
        this.BFS_Button.addEventListener("click", this.BFS.bind(this));
        this.BFS_Button.className = "button";
        document.body.appendChild(this.BFS_Button);
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
            // Delays the code
            function delay() {
                return __awaiter(this, void 0, void 0, function* () {
                    yield new Promise((resolve) => setTimeout(resolve, Graph.DELAY_TIME));
                });
            }
            // Initialize each node to white and egde to gray
            const reset_colour = () => {
                for (let node of this.nodes) {
                    node.colour = "white";
                    node.text_colour = "black";
                    node.updateColour();
                    for (let edge of node.out_edges) {
                        edge.updateColour(Edge.DEFAULT_COLOUR);
                    }
                }
            };
            reset_colour();
            yield delay();
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
            yield delay();
            Q.enqueue(root);
            // Main BFS loop
            while (!Q.is_empty()) {
                let node = Q.dequeue();
                for (let out_edge of node.out_edges) {
                    const adj = out_edge.destination;
                    if (adj.colour === "white") {
                        out_edge.updateColour(Edge.HIGHLIGHT_COLOUR);
                        yield delay();
                        adj.colour = "gray";
                        adj.updateColour();
                        yield delay();
                        Q.enqueue(adj);
                    }
                }
                node.colour = "black";
                node.text_colour = "white";
                node.updateColour();
                yield delay();
            }
            yield waitForClick();
            reset_colour();
            this.traversing = false;
        });
    }
    DFS() {
        // TODO: Implement
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
Graph.DELAY_TIME = 500;
const GRAPH = new Graph();
// Disable context menu
window.addEventListener("contextmenu", (event) => {
    event.preventDefault();
});
let keyboardState = {
    CTRL: false,
    A: false,
};
document.addEventListener("keydown", (event) => {
    if (event.key === "Control") {
        keyboardState.CTRL = true;
    }
    else if (event.key === "a" || event.key === "A") {
        keyboardState.A = true;
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
    if (event.key === "Control") {
        keyboardState.CTRL = false;
    }
    else if (event.key === "a" || event.key === "A") {
        keyboardState.A = false;
    }
});
export { GRAPH, keyboardState };
