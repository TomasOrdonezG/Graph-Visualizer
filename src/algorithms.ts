import Graph from "./graph";
import GraphNode from "./graphNode.js";
import Edge from "./edge.js";
import { MinPriorityQueue } from "./minPQ.js";

type Change<T> = { before: T; after: T };
type Frame<Target extends GraphNode | Edge> = {
    target: Target;
    colour?: Change<string>;
    chain_to_previous?: boolean;
    script?: {
        do: () => any;
        undo: () => any;
    };
} & (Target extends GraphNode
    ? {
          border_colour?: Change<string>;
          show_text?: Change<boolean>;
          text?: Change<string>;
          text_colour?: Change<string>;
      }
    : { weight?: Change<number> });
type NewFrame<Target extends GraphNode | Edge> = {
    target: Target;
    new_colour?: string;
    chain_to_previous?: boolean;
    script?: {
        do: () => any;
        undo: () => any;
    };
} & (Target extends GraphNode
    ? { new_border_colour?: string; new_show_text?: boolean; new_text?: string; new_text_colour?: string }
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

        // Update chain_to_previous and script
        frame.chain_to_previous = new_frame.chain_to_previous;
        frame.script = new_frame.script;

        // Updates frame and node attributes
        const update = <T extends string | boolean>(
            new_frame_att: Exclude<keyof NewFrame<GraphNode>, "target" | "chain_to_previous" | "script">,
            attribute: Exclude<keyof Frame<GraphNode>, "target" | "chain_to_previous" | "script">,
            updateMethod: (val: T) => void
        ) => {
            // Check if this attribute is being changed
            if (new_frame[new_frame_att] !== undefined) {
                // Create `Change<T>` object and add it to the frame
                const changeAttribute: Change<T> = {
                    before: target[attribute] as T,
                    after: new_frame[new_frame_att] as T,
                };
                (frame[attribute] as Change<T>) = changeAttribute;

                // Update the attribute in the actual node
                updateMethod((frame[attribute] as Change<T>).after as T);
            }
        };

        // Update all attributes
        const update_args: [
            Exclude<keyof Frame<GraphNode>, "target" | "chain_to_previous" | "script">,
            (val: any) => void
        ][] = [
            ["colour", target.updateColour.bind(target)],
            ["border_colour", target.updateBorderColour.bind(target)],
            ["show_text", target.updateShowText.bind(target)],
            ["text", target.updateText.bind(target)],
            ["text_colour", target.updateTextColour.bind(target)],
        ];
        for (let args of update_args) {
            update(`new_${args[0]}` as any, args[0], args[1]);
        }

        // Add frame
        this.frames.push(frame);
        this.length++;
    }

    public addEdgeFrame(new_frame: NewFrame<Edge>): void {
        const { target } = new_frame;
        const frame: Frame<Edge> = { target };

        // Update chain_to_previous
        frame.chain_to_previous = new_frame.chain_to_previous;
        frame.script = new_frame.script;

        // Updates frame and edge attributes
        const update = <T extends string | boolean>(
            new_frame_att: Exclude<keyof NewFrame<Edge>, "target" | "chain_to_previous" | "script">,
            attribute: Exclude<keyof Frame<Edge>, "target" | "chain_to_previous" | "script">,
            updateMethod: (val: T) => void
        ) => {
            // Check if this attribute is being changed
            if (new_frame[new_frame_att] !== undefined) {
                // Create `Change<T>` object and add it to the frame
                const changeAttribute: Change<T> = {
                    before: target[attribute] as T,
                    after: new_frame[new_frame_att] as T,
                };
                (frame[attribute] as Change<T>) = changeAttribute;

                // Update the attribute in the actual edge
                updateMethod((frame[attribute] as Change<T>).after as T);
            }
        };

        // Update all attributes
        const update_args: [
            Exclude<keyof Frame<Edge>, "target" | "chain_to_previous" | "script">,
            (val: any) => void
        ][] = [
            ["colour", target.updateColour.bind(target)],
            ["weight", target.updateWeight.bind(target)],
        ];
        for (let args of update_args) {
            update(`new_${args[0]}` as any, args[0], args[1]);
        }

        // Add frame
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
        if (this.curr_index >= this.length) {
            return false;
        }

        const frame = this.frames[this.curr_index];

        if (frame.script !== undefined) {
            frame.script.do();
        }

        if ((frame.target as GraphNode).value !== undefined) {
            // * GraphNode frame
            const nodeFrame = frame as Frame<GraphNode>;
            const node = nodeFrame.target;

            if (nodeFrame.colour !== undefined) node.updateColour(nodeFrame.colour.after);
            if (nodeFrame.border_colour !== undefined) node.updateBorderColour(nodeFrame.border_colour.after);
            if (nodeFrame.text !== undefined) node.updateText(nodeFrame.text.after);
            if (nodeFrame.show_text !== undefined) node.updateShowText(nodeFrame.show_text.after);
            if (nodeFrame.text_colour !== undefined) node.updateTextColour(nodeFrame.text_colour.after);
        } else {
            // * Edge frame
            const edgeFrame = frame as Frame<Edge>;
            const edge = edgeFrame.target;

            if (edgeFrame.colour !== undefined) edge.updateColour(edgeFrame.colour.after);
            if (edgeFrame.weight !== undefined) edge.updateWeight(edgeFrame.weight.after);
        }

        this.curr_index++;
        if (this.curr_index < this.length && this.frames[this.curr_index].chain_to_previous) {
            this.next_frame();
        }
        this.updateSlider();

        return true;
    }

    public prev_frame(): boolean {
        if (this.curr_index <= 0) {
            return false;
        }

        this.curr_index--;
        const frame = this.frames[this.curr_index];

        if (frame.script !== undefined) {
            frame.script.undo();
        }

        if ((frame.target as GraphNode).value !== undefined) {
            // * GraphNode frame
            const nodeFrame = frame as Frame<GraphNode>;
            const node = nodeFrame.target;

            if (nodeFrame.colour !== undefined) node.updateColour(nodeFrame.colour.before);
            if (nodeFrame.border_colour !== undefined) node.updateBorderColour(nodeFrame.border_colour.before);
            if (nodeFrame.text !== undefined) node.updateText(nodeFrame.text.before);
            if (nodeFrame.show_text !== undefined) node.updateShowText(nodeFrame.show_text.before);
            if (nodeFrame.text_colour !== undefined) node.updateTextColour(nodeFrame.text_colour.before);
        } else {
            // * Edge frame
            const edgeFrame = frame as Frame<Edge>;
            const edge = edgeFrame.target;

            if (edgeFrame.colour !== undefined) edge.updateColour(edgeFrame.colour.before);
            if (edgeFrame.weight !== undefined) edge.updateWeight(edgeFrame.weight.before);
        }

        if (frame.chain_to_previous) {
            this.prev_frame();
        }

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

        BFS_Animation.updateSlider();
        return BFS_Animation;
    }

    public DFS(): Animation | null {
        // Initialize graph styles, animation object and time
        const DFS_Animation: Animation = new Animation(this.slider);
        if (!this.graph.nodes) return null;
        let time = 0;

        // dtime and ftime maps
        const dtime = new WeakMap<GraphNode, number | null>();
        const ftime = new WeakMap<GraphNode, number | null>();
        const interval = (node: GraphNode): string => {
            const dt = dtime.get(node);
            const ft = ftime.get(node);
            return `[${dt ? dt : "_"}, ${ft ? ft : "_"}]`;
        };

        for (let node of this.graph.nodes) {
            // Initialize dtime, ftime
            dtime.set(node, null);
            ftime.set(node, null);

            // Show dtime and ftime text
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
        DFS_Animation.updateSlider();
        return DFS_Animation;
    }

    public Dijkstra(): Animation | null {
        const DijkstraAnimation: Animation = new Animation(this.slider);
        const root = this.graph.get_first_selected();
        if (!root) return null;
        const weight = (edge: Edge): number => (this.graph.weighted ? edge.weight : Math.round(edge.length()));

        // Initialize distance map and root distance of 0
        const distance = new WeakMap<GraphNode, number>();
        for (let node of this.graph.nodes) distance.set(node, Infinity);
        distance.set(root, 0);
        const getDistanceStr = (node: GraphNode): string => {
            const d = distance.get(node) as number;
            return d === Infinity ? "∞" : d.toString();
        };

        // Show all initial distances
        for (let node of this.graph.nodes) {
            DijkstraAnimation.addNodeFrame({
                target: node,
                new_show_text: true,
                new_text: getDistanceStr(node),
                new_border_colour: node === root ? "red" : undefined,
                chain_to_previous: true,
            });
        }

        // Initialize min-priority-queue on all nodes with distance as the key
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
                if ((distance.get(adj) as number) > (distance.get(node) as number) + weight(edge)) {
                    // Update distance of the neighbour node
                    distance.set(adj, (distance.get(node) as number) + weight(edge));
                    Q.decreaseKey(Q.arr.indexOf(adj), distance.get(adj) as number);

                    // Change colour of the edge and update distance text
                    DijkstraAnimation.addEdgeFrame({ target: edge, new_colour: "black" });
                    DijkstraAnimation.addNodeFrame({
                        target: adj,
                        new_text: getDistanceStr(adj),
                        chain_to_previous: true,
                    });

                    // Unhighlight the previously connecting in_edge if it exists
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
            DijkstraAnimation.addNodeFrame({ target: node, new_colour: "black", new_text_colour: "red" });
        }

        return DijkstraAnimation;
    }

    public Kruskal(): Animation | null {
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

        return KruskalAnimation;
    }

    public FindSCCs(): Animation | null {
        const SCCs_Animation = new Animation(this.slider);

        // Initialize node ftime map
        const ftime = new WeakMap<GraphNode, number | null>();
        const get_ftime = (node: GraphNode): number => ftime.get(node) as number;
        for (let node of this.graph.nodes) ftime.set(node, null);

        // * Run DFS in normal order
        let time = 0;
        const DFS_Visit = (node: GraphNode): void => {
            SCCs_Animation.addNodeFrame({ target: node, new_colour: "gray" });
            for (let { outEdge, adj } of node.getOutEdges()) {
                if (adj.colour === "white") {
                    SCCs_Animation.addEdgeFrame({ target: outEdge, new_colour: "black" });
                    DFS_Visit(adj);
                }
            }
            time++;
            ftime.set(node, time);
            SCCs_Animation.addNodeFrame({
                target: node,
                new_colour: "black",
                new_text_colour: "red",
                new_show_text: true,
                new_text: get_ftime(node).toString(),
            });
        };
        for (let node of this.graph.nodes) {
            if (node.colour === "white") {
                DFS_Visit(node);
            }
        }

        // * Compute G^T (by reversing all edges)
        const reverse_all_edges = (): void => {
            // Reverse function
            const reverse = (edge: Edge) => {
                // Update out_edges and in_edges arrays for source and destination
                const source = edge.source;
                source.in_edges.push(edge);
                source.out_edges.splice(source.out_edges.indexOf(edge), 1);

                const destination = edge.destination;
                destination.out_edges.push(edge);
                destination.in_edges.splice(destination.in_edges.indexOf(edge), 1);

                // Swap source and destination nodes
                const temp: GraphNode = edge.source;
                edge.source = edge.destination;
                edge.destination = temp;

                // Update attributes
                edge.linkNodesPos();
                edge.source.sortNeighbours();
                edge.destination.sortNeighbours();
            };

            // Keep track of which edges have already been reversed
            const reversed = new WeakMap<Edge, boolean>();
            for (let node of this.graph.nodes) {
                for (let out_edge of node.out_edges) {
                    reversed.set(out_edge, false);
                }
            }

            // Find all edges
            const all_edges: Edge[] = [];
            for (let node of this.graph.nodes) {
                for (let out_edge of node.out_edges) {
                    all_edges.push(out_edge);
                }
            }

            // Reverse all edges
            for (let i = 0; i < all_edges.length; i++) {
                // Check if edge has already been reversed
                if (reversed.get(all_edges[i]) as boolean) continue;

                // Add script as frames
                SCCs_Animation.addEdgeFrame({
                    target: all_edges[i],
                    script: { do: () => reverse(all_edges[i]), undo: () => reverse(all_edges[i]) },
                    chain_to_previous: i !== 0,
                });
                reverse(all_edges[i]);
                reversed.set(all_edges[i], true);
            }
        };
        reverse_all_edges();

        // * Reset colours
        for (let i = 0; i < this.graph.nodes.length; i++) {
            // Nodes
            SCCs_Animation.addNodeFrame({
                target: this.graph.nodes[i],
                new_colour: "white",
                chain_to_previous: i !== 0,
            });

            for (let out_edge of this.graph.nodes[i].out_edges) {
                // Edges
                SCCs_Animation.addEdgeFrame({
                    target: out_edge,
                    new_colour: Edge.DEFAULT_COLOUR,
                    chain_to_previous: true,
                });
            }
        }

        // * Run DFS on G^T in order ftime decreasing and separate each tree in the DFS forest
        const SCCs: GraphNode[][] = [];
        const DFS_Visit_ftime_desc = (node: GraphNode, SCC: GraphNode[]): void => {
            // Colour node as discovered and add node to current SCC
            SCCs_Animation.addNodeFrame({ target: node, new_colour: "gray" });
            SCC.push(node);

            // get all out edges sorted by ftime descending
            let out_edges = node.getOutEdges();
            out_edges = out_edges.sort(({ adj: adj1 }, { adj: adj2 }) => get_ftime(adj2) - get_ftime(adj1));

            // Recurse on undiscovered neighbours
            for (let { outEdge, adj } of out_edges) {
                if (adj.colour === "white") {
                    SCCs_Animation.addEdgeFrame({ target: outEdge, new_colour: "black" });
                    DFS_Visit_ftime_desc(adj, SCC);
                }
            }
            SCCs_Animation.addNodeFrame({ target: node, new_colour: "black" });
        };
        for (let node of this.graph.nodes.sort((a, b) => get_ftime(b) - get_ftime(a))) {
            if (node.colour === "white") {
                const SCC: GraphNode[] = [];
                DFS_Visit_ftime_desc(node, SCC);
                SCCs.push(SCC);
            }
        }

        // * Compute G^T^T to return the graph to normal and turn off ftime
        reverse_all_edges();
        for (let node of this.graph.nodes) {
            SCCs_Animation.addNodeFrame({
                target: node,
                new_show_text: false,
                chain_to_previous: true,
            });
        }

        // * Separate each tree in the DFS forest into a group by colour
        const hue_interval: number = 360 / SCCs.length;
        let first: boolean = true;
        for (let i = 0; i < SCCs.length; i++) {
            for (let node of SCCs[i]) {
                SCCs_Animation.addNodeFrame({
                    target: node,
                    new_colour: `hsl(${i * hue_interval}, 100%, 65%)`,
                    chain_to_previous: !first,
                });
                first = false;
            }
        }

        this.graph.sortNodes();
        return SCCs_Animation;
    }
}

export { Algorithms, Animation };
