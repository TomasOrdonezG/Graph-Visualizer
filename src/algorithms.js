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
        this.graph.reset_colour();
        const DFS_Animation = new Animation(this.slider);
        let time = 0;
        for (let node of this.graph.nodes) {
            node.show_time_interval = true;
            node.updateText();
        }
        const DFS_Visit = (node) => {
            time++;
            DFS_Animation.addFrame(node, "gray");
            node.DFS_dtime = String(time);
            node.time_interval_text.textContent = `[${node.DFS_dtime}, ${node.DFS_ftime}]`;
            for (let out_edge of node.out_edges) {
                const adj = out_edge.destination;
                if (adj.colour === "white") {
                    DFS_Animation.addFrame(out_edge, "black");
                    DFS_Visit(adj);
                }
            }
            time++;
            node.DFS_ftime = String(time);
            node.time_interval_text.textContent = `[${node.DFS_dtime}, ${node.DFS_ftime}]`;
            DFS_Animation.addFrame(node, "black");
        };
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
        const BFS_Animation = new Animation(this.slider);
        this.graph.reset_colour();
        const Q = [];
        let root = this.graph.get_first_selected();
        BFS_Animation.addFrame(root, "gray");
        Q.push(root);
        while (Q.length > 0) {
            const node = Q.shift();
            for (let out_edge of node.out_edges) {
                const adj = out_edge.destination;
                if (adj.colour === "white") {
                    BFS_Animation.addFrame(out_edge, "black");
                    BFS_Animation.addFrame(adj, "gray");
                    Q.push(adj);
                }
            }
            BFS_Animation.addFrame(node, "black");
        }
        this.graph.reset_colour();
        BFS_Animation.updateSlider();
        return BFS_Animation;
    }
}
export { Algorithms, Animation };
