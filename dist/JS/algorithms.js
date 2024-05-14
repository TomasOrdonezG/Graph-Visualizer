var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { MinPriorityQueue } from "./minPQ.js";
class Animation {
    // #endregion
    constructor(slider) {
        this.fps = 5;
        this.frames = [];
        this.curr_index = 0;
        this.length = 0;
        this.playing = false;
        this.slider = slider;
    }
    addNodeFrame(new_frame) {
        const { target } = new_frame;
        const frame = { target };
        // * Update chain_to_previous
        frame.chain_to_previous = new_frame.chain_to_previous;
        // * Update colour
        if (new_frame.new_colour) {
            frame.colour = { before: target.colour, after: new_frame.new_colour };
            target.updateColour(frame.colour.after);
        }
        // * Update border_colour
        if (new_frame.new_border_colour) {
            frame.border_colour = { before: target.border_colour, after: new_frame.new_border_colour };
            target.updateBorderColour(frame.border_colour.after);
        }
        // * Update show_text
        if (new_frame.new_show_text) {
            frame.show_text = { before: target.show_text, after: new_frame.new_show_text };
            target.updateShowText(frame.show_text.after);
        }
        // * Update text
        if (new_frame.new_text) {
            frame.text = { before: target.text, after: new_frame.new_text };
            target.updateText(frame.text.after);
        }
        // Add frame
        this.frames.push(frame);
        this.length++;
    }
    addEdgeFrame(new_frame) {
        const { target } = new_frame;
        const frame = { target };
        // * Update chain_to_previous
        frame.chain_to_previous = new_frame.chain_to_previous;
        // * Update colour
        if (new_frame.new_colour) {
            frame.colour = { before: target.colour, after: new_frame.new_colour };
            target.updateColour(frame.colour.after);
        }
        // * Update weight
        if (new_frame.new_weight) {
            frame.weight = { before: target.weight, after: new_frame.new_weight };
            target.updateWeight(frame.weight.after);
        }
        this.frames.push(frame);
        this.length++;
    }
    play() {
        return __awaiter(this, void 0, void 0, function* () {
            this.playing = true;
            do {
                yield new Promise((resolve) => setTimeout(resolve, 1000 / this.fps));
            } while (this.playing && this.next_frame());
        });
    }
    pause() {
        this.playing = false;
    }
    next_frame() {
        if (this.curr_index >= this.length)
            return false;
        const frame = this.frames[this.curr_index];
        if (frame.target.value !== undefined) {
            // * GraphNode frame
            const nodeFrame = frame;
            const node = nodeFrame.target;
            if (nodeFrame.colour)
                node.updateColour(nodeFrame.colour.after);
            if (nodeFrame.border_colour)
                node.updateBorderColour(nodeFrame.border_colour.after);
            if (nodeFrame.text)
                node.updateText(nodeFrame.text.after);
            if (nodeFrame.show_text)
                node.updateShowText(nodeFrame.show_text.after);
        }
        else {
            // * Edge frame
            const edgeFrame = frame;
            const edge = edgeFrame.target;
            if (edgeFrame.colour)
                edge.updateColour(edgeFrame.colour.after);
            if (edgeFrame.weight)
                edge.updateWeight(edgeFrame.weight.after);
        }
        this.curr_index++;
        if (this.curr_index < this.length && this.frames[this.curr_index].chain_to_previous) {
            this.next_frame();
        }
        // if (frame.chain_to_previous) this.next_frame();
        this.updateSlider();
        return true;
    }
    prev_frame() {
        if (this.curr_index <= 0)
            return false;
        this.curr_index--;
        const frame = this.frames[this.curr_index];
        if (frame.target.value !== undefined) {
            // * GraphNode frame
            const nodeFrame = frame;
            const node = nodeFrame.target;
            if (nodeFrame.colour)
                node.updateColour(nodeFrame.colour.before);
            if (nodeFrame.border_colour)
                node.updateBorderColour(nodeFrame.border_colour.before);
            if (nodeFrame.text)
                node.updateText(nodeFrame.text.before);
            if (nodeFrame.show_text)
                node.updateShowText(nodeFrame.show_text.before);
        }
        else {
            // * Edge frame
            const edgeFrame = frame;
            const edge = edgeFrame.target;
            if (edgeFrame.colour)
                edge.updateColour(edgeFrame.colour.before);
            if (edgeFrame.weight)
                edge.updateWeight(edgeFrame.weight.before);
        }
        if (frame.chain_to_previous)
            this.prev_frame();
        this.updateSlider();
        return true;
    }
    updateSlider() {
        this.slider.min = "0";
        this.slider.max = String(this.length);
        this.slider.value = String(this.curr_index);
    }
}
// #region ATTRIBUTES
Animation.min_fps = 0;
Animation.max_fps = 30;
export default Animation;
class Algorithms {
    constructor(graph, slider) {
        this.graph = graph;
        this.slider = slider;
    }
    BFS() {
        this.graph.reset_colour();
        let root = this.graph.get_first_selected();
        if (!root)
            return null;
        const Q = [];
        Q.push(root);
        const BFS_Animation = new Animation(this.slider);
        BFS_Animation.addNodeFrame({ target: root, new_colour: "gray" });
        // Main BFS loop
        while (Q.length > 0) {
            // Dequeue next node and search all its neighbours
            const node = Q.shift();
            for (let { outEdge: edge, adj } of node.getOutEdges()) {
                if (adj.colour === "white") {
                    // Add frame to connecting endge and newly discovered node. Then enqueue
                    BFS_Animation.addEdgeFrame({ target: edge, new_colour: "black" });
                    BFS_Animation.addNodeFrame({ target: adj, new_colour: "gray" });
                    Q.push(adj);
                }
            }
            // Mark node as fully searched
            BFS_Animation.addNodeFrame({ target: node, new_colour: "black" });
        }
        this.graph.reset_colour();
        BFS_Animation.updateSlider();
        return BFS_Animation;
    }
    DFS() {
        // Initialize graph styles, animation object and time
        this.graph.reset_colour();
        const DFS_Animation = new Animation(this.slider);
        if (!this.graph.nodes)
            return null;
        let time = 0;
        const DFS_Visit = (node) => {
            // Increment time, set dtime, change node colour and add frame
            time++;
            DFS_Animation.addNodeFrame({ target: node, new_colour: "gray" });
            // node.DFS_dtime = String(time);
            // node.time_interval_text.textContent = `[${node.DFS_dtime}, ${node.DFS_ftime}]`;
            // Recurse on undiscovered neighbours
            for (let { outEdge: edge, adj } of node.getOutEdges()) {
                if (adj.colour === "white") {
                    // Change colour of connecting edge and add frame
                    DFS_Animation.addEdgeFrame({ target: edge, new_colour: "black" });
                    DFS_Visit(adj);
                }
            }
            // Increment time, set ftime, change node colour and add frame
            time++;
            // node.DFS_ftime = String(time);
            // node.time_interval_text.textContent = `[${node.DFS_dtime}, ${node.DFS_ftime}]`;
            DFS_Animation.addNodeFrame({ target: node, new_colour: "black" });
        };
        // Run DFS on every undiscovered node
        for (let node of this.graph.nodes) {
            if (node.colour === "white") {
                DFS_Visit(node);
            }
        }
        this.graph.reset_colour();
        DFS_Animation.updateSlider();
        return DFS_Animation;
    }
    Dijkstra() {
        const DijkstraAnimation = new Animation(this.slider);
        // Initialize graph
        this.graph.reset_colour();
        const root = this.graph.get_first_selected();
        if (!root)
            return null;
        // Initialize distance map
        const distance = new WeakMap();
        for (let node of this.graph.nodes)
            distance.set(node, Infinity);
        distance.set(root, 0);
        // Initialize min-priority-queue
        const Q = new MinPriorityQueue((item, key) => distance.set(item, key), (item) => distance.get(item));
        Q.buildPriorityQueueOnArray(this.graph.nodes);
        // Main Dijsktra loop
        while (!Q.isEmpty()) {
            // Extract node with least distance that hasn't been search and colour gray
            const node = Q.extractMin();
            DijkstraAnimation.addNodeFrame({ target: node, new_colour: "gray" });
            // Relax every adjacent edge
            for (let { outEdge: edge, adj } of node.getOutEdges()) {
                if (distance.get(adj) > distance.get(node) + edge.weight) {
                    // Update distance of the neighbour node and change colour of the edge
                    DijkstraAnimation.addEdgeFrame({ target: edge, new_colour: "black" });
                    distance.set(adj, distance.get(node) + edge.weight);
                    Q.decreaseKey(Q.arr.indexOf(adj), distance.get(adj));
                    // Unhighlight other in edge if exists
                    for (let { inEdge } of adj.getInEdges()) {
                        if (edge !== inEdge && inEdge.colour === "black") {
                            DijkstraAnimation.addEdgeFrame({
                                target: inEdge,
                                new_colour: "gray",
                                chain_to_previous: true,
                            });
                        }
                    }
                }
            }
            DijkstraAnimation.addNodeFrame({ target: node, new_colour: "black" });
        }
        this.graph.reset_colour();
        return DijkstraAnimation;
    }
    Kruskal() {
        this.graph.reset_colour();
        this.graph.deselect_all();
        if (!this.graph.nodes)
            return null;
        const KruskalAnimation = new Animation(this.slider);
        const sortAllEdges = () => {
            // Get all edges from the graph sorted by weight ascending
            const edges = [];
            for (let node of this.graph.nodes) {
                edges.push(...node.out_edges);
            }
            return edges.sort((a, b) => a.weight - b.weight);
        };
        const edges = sortAllEdges();
        // Create clusters for each node
        const clusters = {
            cMap: new WeakMap(),
            init(allNodes) {
                allNodes.map((node) => this.cMap.set(node, node));
            },
            getHead(node) {
                const parent = this.cMap.get(node);
                if (!parent || parent === node)
                    return parent;
                return this.getHead(parent);
            },
            merge(node1, node2) {
                const head1 = this.getHead(node1);
                if (!head1)
                    return;
                this.cMap.set(head1, node2);
            },
            equal(node1, node2) {
                const head1 = this.getHead(node1);
                const head2 = this.getHead(node2);
                if (!head1 || !head2)
                    return false;
                return head1 === head2;
            },
        };
        clusters.init(this.graph.nodes);
        // Main Kruskal loop
        for (let edge of edges) {
            KruskalAnimation.addEdgeFrame({ target: edge, new_colour: "orange" });
            if (!clusters.equal(edge.source, edge.destination)) {
                // Merge clusters and select edge
                clusters.merge(edge.source, edge.destination);
                KruskalAnimation.addEdgeFrame({ target: edge, new_colour: "black" });
            }
            else {
                KruskalAnimation.addEdgeFrame({ target: edge, new_colour: "gray" });
            }
        }
        this.graph.reset_colour();
        return KruskalAnimation;
    }
}
export { Algorithms, Animation };
