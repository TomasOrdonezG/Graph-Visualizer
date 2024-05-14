import Graph from "./graph";
import GraphNode from "./graphNode";
import Edge from "./edge";
import { MinPriorityQueue } from "./minPQ.js";

type Change<T> = { before: T; after: T };
type Frame<Target extends GraphNode | Edge> = {
    target: Target;
    colour?: Change<string>;
    chain_to_previous?: boolean;
} & (Target extends GraphNode
    ? { border_colour?: Change<string>; show_text?: Change<boolean>; text?: Change<string> }
    : { weight?: Change<number> });
type NewFrame<Target extends GraphNode | Edge> = {
    target: Target;
    new_colour?: string;
    chain_to_previous?: boolean;
} & (Target extends GraphNode
    ? { new_border_colour?: string; new_show_text?: boolean; new_text?: string }
    : { new_weight?: number });

export default class Animation {
    // #region ATTRIBUTES
    static min_fps: number = 0;
    public fps: number = 5;
    static max_fps: number = 30;

    private frames: Frame<GraphNode | Edge>[] = [];
    public curr_index: number = 0;
    public length: number = 0;
    public playing: boolean = false;

    private slider: HTMLInputElement;
    // #endregion

    constructor(slider: HTMLInputElement) {
        this.slider = slider;
    }

    public addNodeFrame(new_frame: NewFrame<GraphNode>): void {
        const { target } = new_frame;
        const frame: Frame<GraphNode> = { target };

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

    public addEdgeFrame(new_frame: NewFrame<Edge>): void {
        const { target } = new_frame;
        const frame: Frame<Edge> = { target };

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

    public async play() {
        this.playing = true;
        do {
            await new Promise((resolve) => setTimeout(resolve, 1000 / this.fps));
        } while (this.playing && this.next_frame());
    }
    public pause() {
        this.playing = false;
    }

    public next_frame(): boolean {
        if (this.curr_index >= this.length) return false;
        const frame = this.frames[this.curr_index];

        if ((frame.target as GraphNode).value !== undefined) {
            // * GraphNode frame
            const nodeFrame = frame as Frame<GraphNode>;
            const node = nodeFrame.target;

            if (nodeFrame.colour) node.updateColour(nodeFrame.colour.after);
            if (nodeFrame.border_colour) node.updateBorderColour(nodeFrame.border_colour.after);
            if (nodeFrame.text) node.updateText(nodeFrame.text.after);
            if (nodeFrame.show_text) node.updateShowText(nodeFrame.show_text.after);
        } else {
            // * Edge frame
            const edgeFrame = frame as Frame<Edge>;
            const edge = edgeFrame.target;

            if (edgeFrame.colour) edge.updateColour(edgeFrame.colour.after);
            if (edgeFrame.weight) edge.updateWeight(edgeFrame.weight.after);
        }

        this.curr_index++;
        if (this.curr_index < this.length && this.frames[this.curr_index].chain_to_previous) {
            this.next_frame();
        }
        // if (frame.chain_to_previous) this.next_frame();
        this.updateSlider();
        return true;
    }
    public prev_frame(): boolean {
        if (this.curr_index <= 0) return false;
        this.curr_index--;
        const frame = this.frames[this.curr_index];

        if ((frame.target as GraphNode).value !== undefined) {
            // * GraphNode frame
            const nodeFrame = frame as Frame<GraphNode>;
            const node = nodeFrame.target;

            if (nodeFrame.colour) node.updateColour(nodeFrame.colour.before);
            if (nodeFrame.border_colour) node.updateBorderColour(nodeFrame.border_colour.before);
            if (nodeFrame.text) node.updateText(nodeFrame.text.before);
            if (nodeFrame.show_text) node.updateShowText(nodeFrame.show_text.before);
        } else {
            // * Edge frame
            const edgeFrame = frame as Frame<Edge>;
            const edge = edgeFrame.target;

            if (edgeFrame.colour) edge.updateColour(edgeFrame.colour.before);
            if (edgeFrame.weight) edge.updateWeight(edgeFrame.weight.before);
        }

        if (frame.chain_to_previous) this.prev_frame();
        this.updateSlider();
        return true;
    }

    public updateSlider() {
        this.slider.min = "0";
        this.slider.max = String(this.length);
        this.slider.value = String(this.curr_index);
    }
}

class Algorithms {
    private graph: Graph;
    private slider: HTMLInputElement;

    constructor(graph: Graph, slider: HTMLInputElement) {
        this.graph = graph;
        this.slider = slider;
    }

    public BFS(): Animation | null {
        this.graph.reset_colour();
        let root = this.graph.get_first_selected();
        if (!root) return null;

        const Q: GraphNode[] = [];
        Q.push(root);

        const BFS_Animation: Animation = new Animation(this.slider);
        BFS_Animation.addNodeFrame({ target: root, new_colour: "gray" });

        // Main BFS loop
        while (Q.length > 0) {
            // Dequeue next node and search all its neighbours
            const node = Q.shift() as GraphNode;
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

    public DFS(): Animation | null {
        // Initialize graph styles, animation object and time
        this.graph.reset_colour();
        const DFS_Animation: Animation = new Animation(this.slider);
        if (!this.graph.nodes) return null;
        let time = 0;

        // dtime and ftime maps
        const dtime = new WeakMap<GraphNode, number | null>();
        const ftime = new WeakMap<GraphNode, number | null>();
        for (let node of this.graph.nodes) dtime.set(node, null);
        for (let node of this.graph.nodes) ftime.set(node, null);

        // Show dtime and ftime text
        const interval = (node: GraphNode): string => {
            const dt = dtime.get(node);
            const ft = ftime.get(node);
            return `[${dt ? dt : "_"}, ${ft ? ft : "_"}]`;
        };
        for (let node of this.graph.nodes) {
            DFS_Animation.addNodeFrame({
                target: node,
                new_show_text: true,
                new_text: interval(node),
                chain_to_previous: true,
            });
        }

        const DFS_Visit = (node: GraphNode) => {
            // Increment time, set dtime, change node colour and add frame
            time++;
            dtime.set(node, time);
            DFS_Animation.addNodeFrame({
                target: node,
                new_colour: "gray",
                new_text: interval(node),
            });

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
            ftime.set(node, time);
            DFS_Animation.addNodeFrame({
                target: node,
                new_colour: "black",
                new_text: interval(node),
            });
        };

        // Run DFS on every undiscovered node
        for (let node of this.graph.nodes) {
            if (node.colour === "white") {
                DFS_Visit(node);
            }
        }

        for (let node of this.graph.nodes) node.updateShowText(false);
        this.graph.reset_colour();
        DFS_Animation.updateSlider();
        return DFS_Animation;
    }

    public Dijkstra(): Animation | null {
        const DijkstraAnimation: Animation = new Animation(this.slider);

        // Initialize graph
        this.graph.reset_colour();
        const root = this.graph.get_first_selected();
        if (!root) return null;

        // Initialize distance map
        const distance = new WeakMap<GraphNode, number>();
        for (let node of this.graph.nodes) distance.set(node, Infinity);
        distance.set(root, 0);

        // Initialize min-priority-queue
        const Q = new MinPriorityQueue<GraphNode>(
            (item, key) => distance.set(item, key),
            (item): number => distance.get(item) as number
        );
        Q.buildPriorityQueueOnArray(this.graph.nodes);

        // Main Dijsktra loop
        while (!Q.isEmpty()) {
            // Extract node with least distance that hasn't been search and colour gray
            const node = Q.extractMin();
            DijkstraAnimation.addNodeFrame({ target: node, new_colour: "gray" });

            // Relax every adjacent edge
            for (let { outEdge: edge, adj } of node.getOutEdges()) {
                if ((distance.get(adj) as number) > (distance.get(node) as number) + edge.weight) {
                    // Update distance of the neighbour node and change colour of the edge
                    DijkstraAnimation.addEdgeFrame({ target: edge, new_colour: "black" });
                    distance.set(adj, (distance.get(node) as number) + edge.weight);
                    Q.decreaseKey(Q.arr.indexOf(adj), distance.get(adj) as number);

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

    public Kruskal(): Animation | null {
        this.graph.reset_colour();
        this.graph.deselect_all();
        if (!this.graph.nodes) return null;
        const KruskalAnimation = new Animation(this.slider);

        const sortAllEdges = (): Edge[] => {
            // Get all edges from the graph sorted by weight ascending
            const edges: Edge[] = [];
            for (let node of this.graph.nodes) {
                edges.push(...node.out_edges);
            }
            return edges.sort((a, b) => a.weight - b.weight);
        };
        const edges = sortAllEdges();

        // Create clusters for each node
        const clusters = {
            cMap: new WeakMap<GraphNode, GraphNode>(),

            init(allNodes: GraphNode[]): void {
                allNodes.map((node) => this.cMap.set(node, node));
            },

            getHead(node: GraphNode): GraphNode | undefined {
                const parent = this.cMap.get(node);
                if (!parent || parent === node) return parent;
                return this.getHead(parent);
            },

            merge(node1: GraphNode, node2: GraphNode): void {
                const head1 = this.getHead(node1);
                if (!head1) return;
                this.cMap.set(head1, node2);
            },

            equal(node1: GraphNode, node2: GraphNode): boolean {
                const head1 = this.getHead(node1);
                const head2 = this.getHead(node2);
                if (!head1 || !head2) return false;
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
            } else {
                KruskalAnimation.addEdgeFrame({ target: edge, new_colour: "gray" });
            }
        }

        this.graph.reset_colour();
        return KruskalAnimation;
    }
}

export { Algorithms, Animation };
