var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Animation {
    constructor() {
        this.fps = 2;
        this.frames = [];
        this.curr_index = 0;
        this.length = 0;
        this.playing = false;
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
                console.log("frame");
                yield new Promise((resolve) => setTimeout(resolve, 1000 / this.fps));
            }
        });
    }
    pause() {
        this.playing = false;
    }
    next_frame() {
        if (this.curr_index + 1 < this.length) {
            this.curr_index++;
            const frame = this.frames[this.curr_index];
            frame.target.updateColour(frame.updated_colour);
            return true;
        }
        return false;
    }
    prev_frame() {
        if (this.curr_index > 0) {
            const frame = this.frames[this.curr_index];
            frame.target.updateColour(frame.prev_colour);
            this.curr_index--;
            return true;
        }
        return false;
    }
}
Animation.min_fps = 0;
Animation.max_fps = 30;
export default Animation;
class Algorithms {
    constructor(graph) {
        this.graph = graph;
    }
    DFS() {
        this.graph.reset_colour();
        const DFS_Animation = new Animation();
        const DFS_Visit = (node) => {
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
    BFS() {
        const BFS_Animation = new Animation();
        return BFS_Animation;
    }
}
export { Algorithms, Animation };
