var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Algorithms } from "./algorithms.js";
export default class Menu {
    // #endregion
    constructor(graph) {
        this.currentAnimation = null;
        // Main menu HTML elements
        this.mainSideNav = document.querySelector(".graph-sidenav");
        this.BFS_Button = document.querySelector(".BFS-button");
        this.DFS_Button = document.querySelector(".DFS-button");
        this.Dijkstra_Button = document.querySelector(".Dijkstra-button");
        this.Kruskal_Button = document.querySelector(".Kruskal-button");
        this.HTML_directed_toggle = document.querySelector(".directed-switch");
        this.HTML_weighted_toggle = document.querySelector(".weighted-switch");
        // Animation menu HTML elements
        this.animationSideNav = document.querySelector(".animation-menu");
        this.prev_frame_button = document.querySelector(".prev-frame");
        this.play_pause_animation_button = document.querySelector(".play-pause");
        this.next_frame_button = document.querySelector(".next-frame");
        this.stop_animation_button = document.querySelector(".stop");
        this.reset_animation_button = document.querySelector(".reset");
        // Top-Right menu HTML elements
        this.import_file_input = document.querySelector(".import-input");
        this.export_button = document.querySelector(".export-button");
        this.reset_graph_button = document.querySelector(".reset-graph-button");
        this.setWeighted = (on) => {
            if (on) {
                this.HTML_weighted_toggle.checked = true;
                if (!this.graph.weighted)
                    this.graph.toggle_weighted();
            }
            else {
                this.HTML_weighted_toggle.checked = false;
                if (this.graph.weighted)
                    this.graph.toggle_weighted();
            }
        };
        this.setDirected = (on) => {
            if (on) {
                this.HTML_directed_toggle.checked = true;
                if (!this.graph.directed)
                    this.graph.toggle_directed();
            }
            else {
                this.HTML_directed_toggle.checked = false;
                if (this.graph.directed)
                    this.graph.toggle_directed();
            }
        };
        this.graph = graph;
        this.algorithms = new Algorithms(this.graph, document.querySelector(".frame-slider"));
        // Add menu event listeners and focus on main menu
        this.animationMenuEventListeners();
        this.mainMenuEventListeners();
        this.topRightMenuEventListeners();
        this.focusMainMenu();
    }
    // * MAIN SIDE MENU
    mainMenuEventListeners() {
        // * Animation buttons
        this.BFS_Button.addEventListener("click", () => {
            this.animate(this.algorithms.BFS.bind(this.algorithms));
        });
        this.DFS_Button.addEventListener("click", () => {
            this.animate(this.algorithms.DFS.bind(this.algorithms));
        });
        this.Dijkstra_Button.addEventListener("click", () => {
            this.setWeighted(true);
            this.animate(this.algorithms.Dijkstra.bind(this.algorithms));
        });
        this.Kruskal_Button.addEventListener("click", () => {
            this.setWeighted(true);
            this.animate(this.algorithms.Kruskal.bind(this.algorithms));
        });
        // * Toggles
        // Toggle events
        this.HTML_directed_toggle.addEventListener("click", this.graph.toggle_directed.bind(this.graph));
        this.HTML_weighted_toggle.addEventListener("click", this.graph.toggle_weighted.bind(this.graph));
        // Check if toggles checks (checkboxes) align with default graph states
        if (this.HTML_directed_toggle.checked !== this.graph.directed)
            this.graph.toggle_directed();
        if (this.HTML_weighted_toggle.checked !== this.graph.weighted)
            this.graph.toggle_weighted();
    }
    focusMainMenu() {
        this.mainSideNav.style.display = "";
        this.hideAnimationMenu();
    }
    hideMainMenu() {
        this.mainSideNav.style.display = "none";
    }
    // * ANIMATION MENU
    animationMenuEventListeners() {
        const prev_frame = () => {
            if (!this.currentAnimation)
                return;
            this.currentAnimation.prev_frame();
        };
        const next_frame = () => {
            if (!this.currentAnimation)
                return;
            this.currentAnimation.next_frame();
        };
        const play_pause_animation = () => __awaiter(this, void 0, void 0, function* () {
            // Toggle playing attribute of the current animation
            if (!this.currentAnimation)
                return;
            if (this.play_pause_animation_button.textContent === "▶") {
                if (this.currentAnimation.curr_index === this.currentAnimation.length) {
                    this.currentAnimation.curr_index = 0;
                    this.graph.reset_colour();
                    this.currentAnimation.updateSlider();
                }
                this.play_pause_animation_button.textContent = "⏸";
                yield this.currentAnimation.play();
                this.play_pause_animation_button.textContent = "▶";
            }
            else {
                this.play_pause_animation_button.textContent = "▶";
                this.currentAnimation.pause();
            }
        });
        const stop_animation = () => {
            var _a;
            if (!this.currentAnimation)
                return;
            // Removes the current animation and resets all nodes
            this.focusMainMenu();
            (_a = this.currentAnimation) === null || _a === void 0 ? void 0 : _a.pause();
            this.currentAnimation = null;
            this.graph.reset_colour();
            this.graph.traversing = false;
            this.play_pause_animation_button.textContent = "▶";
            // Turn off text
            for (let node of this.graph.nodes) {
                node.show_time_interval = false;
                node.updateText();
            }
        };
        const reset_animation = () => {
            // Resets animation
            if (!this.currentAnimation)
                return;
            this.currentAnimation.curr_index = 0;
            this.graph.reset_colour();
            this.currentAnimation.updateSlider();
            this.play_pause_animation_button.textContent = "▶";
            this.currentAnimation.playing = false;
        };
        // Animation controls with buttons
        this.prev_frame_button.addEventListener("click", prev_frame);
        this.next_frame_button.addEventListener("click", next_frame);
        this.play_pause_animation_button.addEventListener("click", play_pause_animation);
        this.stop_animation_button.addEventListener("click", stop_animation);
        this.reset_animation_button.addEventListener("click", reset_animation);
        // Animation controls with keyboard
        document.addEventListener("keydown", (event) => {
            const keyControls = [
                { key: "ArrowLeft", action: prev_frame },
                { key: "ArrowRight", action: next_frame },
                { key: " ", action: play_pause_animation },
                { key: "Escape", action: stop_animation },
                { key: "r", action: reset_animation },
            ];
            for (let keyControl of keyControls) {
                if (event.key === keyControl.key) {
                    event.preventDefault();
                    keyControl.action();
                    return;
                }
            }
        });
    }
    focusAnimationMenu() {
        if (!this.currentAnimation)
            return;
        this.animationSideNav.style.display = "";
        this.hideMainMenu();
    }
    hideAnimationMenu() {
        this.animationSideNav.style.display = "none";
    }
    animate(algorithm) {
        // Get animation object and focus on the animation menu
        this.currentAnimation = algorithm();
        if (!this.currentAnimation)
            return;
        this.graph.traversing = true;
        this.focusAnimationMenu();
    }
    // * TOP-RIGHT MENU
    topRightMenuEventListeners() {
        this.reset_graph_button.addEventListener("click", this.graph.delete_all_nodes.bind(this.graph));
        this.export_button.addEventListener("click", this.export_graph.bind(this));
        this.import_file_input.addEventListener("change", this.import_graph.bind(this));
    }
    export_graph() {
        const json_graph = this.graph.jsonify();
        // Download the JSON for the user
        const json_string = JSON.stringify(json_graph, null, 2);
        const blob = new Blob([json_string], { type: "application/json" });
        const download_link = document.createElement("a");
        download_link.href = URL.createObjectURL(blob);
        download_link.download = "graph.json";
        document.body.appendChild(download_link);
        download_link.click();
        document.body.removeChild(download_link);
    }
    import_graph() {
        if (!this.import_file_input.files || this.import_file_input.files.length <= 0)
            return;
        const file = this.import_file_input.files[0];
        if (!file)
            return;
        // Read file
        const reader = new FileReader();
        reader.onload = (e) => {
            var _a;
            const contents = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
            try {
                const jsonData = JSON.parse(contents);
                if (!Object.keys(jsonData).includes("vertices") ||
                    !Object.keys(jsonData).includes("adjacency_matrix") ||
                    !Object.keys(jsonData).includes("settings")) {
                    console.log(jsonData);
                    window.alert("JSON file is in the wrong format. Unable to load graph");
                    return;
                }
                const graph_content = jsonData;
                // Create the graph
                this.graph.build(graph_content);
                // Set settings
                const settings = graph_content["settings"];
                this.setDirected(settings.directed);
                this.setWeighted(settings.weighted);
            }
            catch (error) {
                console.error("Error parsing the JSON file: ", error);
            }
        };
        reader.readAsText(file);
    }
}
