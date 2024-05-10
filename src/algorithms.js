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
    constructor(slider) {
        this.fps = 5;
        this.frames = [];
        this.curr_index = 0;
        this.length = 0;
        this.playing = false;
        this.slider = slider;
    }
    addFrame(target, new_colour) {
        const new_frame = {
            target: target,
            prev_colour: target.colour,
            updated_colour: new_colour,
        };
        target.updateColour(new_colour);
        this.frames.push(new_frame);
        this.length++;
    }
    play() {
        return __awaiter(this, void 0, void 0, function* () {
            this.playing = true;
            while (this.playing && this.next_frame()) {
                yield new Promise((resolve) => setTimeout(resolve, 1000 / this.fps));
            }
        });
    }
    pause() {
        this.playing = false;
    }
    next_frame() {
        if (this.curr_index < this.length) {
            const frame = this.frames[this.curr_index];
            frame.target.updateColour(frame.updated_colour);
            this.curr_index++;
            this.updateSlider();
            return true;
        }
        return false;
    }
    prev_frame() {
        if (this.curr_index > 0) {
            this.curr_index--;
            const frame = this.frames[this.curr_index];
            frame.target.updateColour(frame.prev_colour);
            this.updateSlider();
            return true;
        }
        return false;
    }
    updateSlider() {
        this.slider.min = "0";
        this.slider.max = String(this.length);
        this.slider.value = String(this.curr_index);
    }
}
Animation.min_fps = 0;
Animation.max_fps = 30;
export default Animation;
class Algorithms {
    constructor(graph, slider) {
        this.graph = graph;
        this.slider = slider;
    }
    DFS() {
        // Initialize graph styles, animation object and time
        this.graph.reset_colour();
        const DFS_Animation = new Animation(this.slider);
        let time = 0;
        // // Show dtime and ftime for every node
        // for (let node of this.graph.nodes) {
        //     node.show_time_interval = true;
        //     node.updateText();
        // }
        const DFS_Visit = (node) => {
            // Increment time, set dtime, change node colour and add frame
            time++;
            DFS_Animation.addFrame(node, "gray");
            node.DFS_dtime = String(time);
            node.time_interval_text.textContent = `[${node.DFS_dtime}, ${node.DFS_ftime}]`;
            // Recurse on undiscovered neighbours
            for (let { outEdge: edge, adj } of node.getOutEdges()) {
                if (adj.colour === "white") {
                    // Change colour of connecting edge and add frame
                    DFS_Animation.addFrame(edge, "black");
                    DFS_Visit(adj);
                }
            }
            // Increment time, set ftime, change node colour and add frame
            time++;
            node.DFS_ftime = String(time);
            node.time_interval_text.textContent = `[${node.DFS_dtime}, ${node.DFS_ftime}]`;
            DFS_Animation.addFrame(node, "black");
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
    BFS() {
        this.graph.reset_colour();
        let root = this.graph.get_first_selected();
        if (!root)
            return null;
        const Q = [];
        Q.push(root);
        const BFS_Animation = new Animation(this.slider);
        BFS_Animation.addFrame(root, "gray");
        // Main BFS loop
        while (Q.length > 0) {
            // Dequeue next node and search all its neighbours
            const node = Q.shift();
            for (let { outEdge: edge, adj } of node.getOutEdges()) {
                if (adj.colour === "white") {
                    // Add frame to connecting endge and newly discovered node. Then enqueue
                    BFS_Animation.addFrame(edge, "black");
                    BFS_Animation.addFrame(adj, "gray");
                    Q.push(adj);
                }
            }
            // Mark node as fully searched
            BFS_Animation.addFrame(node, "black");
        }
        this.graph.reset_colour();
        BFS_Animation.updateSlider();
        return BFS_Animation;
    }
    Dijkstra() {
        const DijkstraAnimation = new Animation(this.slider);
        // Initialize graph
        this.graph.reset_colour();
        this.graph.reset_distances();
        const root = this.graph.get_first_selected();
        if (!root)
            return null;
        root.distance = 0;
        // Initialize min-priority-queue
        const Q = new MinPriorityQueue((item, key) => (item.distance = key), (item) => item.distance);
        Q.buildPriorityQueueOnArray(this.graph.nodes);
        // Main Dijsktra loop
        while (!Q.isEmpty()) {
            // Extract node with least distance that hasn't been search and colour gray
            const node = Q.extractMin();
            DijkstraAnimation.addFrame(node, "gray");
            // Relax every adjacent edge
            for (let { outEdge: edge, adj } of node.getOutEdges()) {
                if (adj.distance > node.distance + edge.weight) {
                    // Update distance of the neighbour node and change colour of the edge
                    DijkstraAnimation.addFrame(edge, "black");
                    adj.distance = node.distance + edge.weight;
                    Q.decreaseKey(Q.arr.indexOf(adj), adj.distance);
                    // Unhighlight every other in edge
                    for (let { inEdge } of adj.getInEdges()) {
                        if (edge !== inEdge && inEdge.colour === "black") {
                            DijkstraAnimation.addFrame(inEdge, "gray");
                        }
                    }
                }
            }
            DijkstraAnimation.addFrame(node, "black");
        }
        this.graph.reset_colour();
        this.graph.reset_distances();
        return DijkstraAnimation;
    }
    Kruskal() {
        this.graph.reset_colour();
        this.graph.deselect_all();
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
            KruskalAnimation.addFrame(edge, "orange");
            if (!clusters.equal(edge.source, edge.destination)) {
                // Merge clusters and select edge
                clusters.merge(edge.source, edge.destination);
                KruskalAnimation.addFrame(edge, "black");
            }
            else {
                KruskalAnimation.addFrame(edge, "gray");
            }
        }
        this.graph.reset_colour();
        return KruskalAnimation;
    }
}
export { Algorithms, Animation };
