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
    public fps: number = 2;
    static max_fps: number = 30;

    private frames: Frame[] = [];
    public curr_index: number = 0;
    public length: number = 0;
    public playing: boolean = false;

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
            console.log("frame");
            await new Promise((resolve) => setTimeout(resolve, 1000 / this.fps));
        }
    }
    public pause() {
        this.playing = false;
    }

    public next_frame(): boolean {
        if (this.curr_index + 1 < this.length) {
            this.curr_index++;
            const frame = this.frames[this.curr_index];
            frame.target.updateColour(frame.updated_colour);
            return true;
        }
        return false;
    }
    public prev_frame(): boolean {
        if (this.curr_index > 0) {
            const frame = this.frames[this.curr_index];
            frame.target.updateColour(frame.prev_colour);
            this.curr_index--;
            return true;
        }
        return false;
    }
}

class Algorithms {
    private graph: Graph;

    constructor(graph: Graph) {
        this.graph = graph;
    }

    public DFS(): Animation {
        this.graph.reset_colour();
        const DFS_Animation: Animation = new Animation();

        const DFS_Visit = (node: GraphNode) => {
            DFS_Animation.addFrame(node, "gray");
            for (let out_edge of node.out_edges) {
                const adj = out_edge.destination;
                if (adj.colour === "white") {
                    DFS_Animation.addFrame(out_edge, "black");
                    DFS_Visit(adj);
                }
            }
            DFS_Animation.addFrame(node, "black");
        };

        for (let node of this.graph.nodes) {
            if (node.colour === "white") {
                DFS_Visit(node);
            }
        }

        this.graph.reset_colour();
        return DFS_Animation;
    }

    public BFS(): Animation {
        const BFS_Animation: Animation = new Animation();
        return BFS_Animation;
    }
}

export { Algorithms, Animation };