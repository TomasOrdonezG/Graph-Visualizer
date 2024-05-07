import Graph from "./graph";
import GraphNode from "./graphNode";
import Edge from "./edge";

interface Frame {
    target: GraphNode | Edge;
    prev_colour: string;
    updated_colour: string;
}
export default class Animation {
    static min_fps: number = 0;
    public fps: number = 5;
    static max_fps: number = 30;

    private frames: Frame[] = [];
    public curr_index: number = 0;
    public length: number = 0;
    public playing: boolean = false;

    private slider: HTMLInputElement;

    constructor(slider: HTMLInputElement) {
        this.slider = slider;
    }

    public addFrame(target: Edge | GraphNode, new_colour: string): void {
        const new_frame: Frame = {
            target: target,
            prev_colour: target.colour,
            updated_colour: new_colour,
        };
        target.updateColour(new_colour);
        this.frames.push(new_frame);
        this.length++;
    }

    public async play() {
        this.playing = true;
        while (this.playing && this.next_frame()) {
            await new Promise((resolve) => setTimeout(resolve, 1000 / this.fps));
        }
    }
    public pause() {
        this.playing = false;
    }

    public next_frame(): boolean {
        if (this.curr_index < this.length) {
            const frame = this.frames[this.curr_index];
            frame.target.updateColour(frame.updated_colour);
            this.curr_index++;
            this.updateSlider();
            return true;
        }
        return false;
    }
    public prev_frame(): boolean {
        if (this.curr_index > 0) {
            this.curr_index--;
            const frame = this.frames[this.curr_index];
            frame.target.updateColour(frame.prev_colour);
            this.updateSlider();
            return true;
        }
        return false;
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

    public DFS(): Animation {
        // Initialize graph styles, animation object and time
        this.graph.reset_colour();
        const DFS_Animation: Animation = new Animation(this.slider);
        let time = 0;

        // Show dtime and ftime for every node
        for (let node of this.graph.nodes) {
            node.show_time_interval = true;
            node.updateText();
        }

        const DFS_Visit = (node: GraphNode) => {
            // Increment time, set dtime, change node colour and add frame
            time++;
            DFS_Animation.addFrame(node, "gray");
            node.DFS_dtime = String(time);
            node.time_interval_text.textContent = `[${node.DFS_dtime}, ${node.DFS_ftime}]`;

            // Recurse on undiscovered neighbours
            for (let { edge, adj } of node.getEdges()) {
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

    public BFS(): Animation {
        this.graph.reset_colour();
        let root = this.graph.get_first_selected();

        const Q: GraphNode[] = [];
        Q.push(root);

        const BFS_Animation: Animation = new Animation(this.slider);
        BFS_Animation.addFrame(root, "gray");

        // Main BFS loop
        while (Q.length > 0) {
            // Dequeue next node and search all its neighbours
            const node = Q.shift() as GraphNode;
            for (let { edge, adj } of node.getEdges()) {
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
}

export { Algorithms, Animation };
