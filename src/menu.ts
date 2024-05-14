import Graph, { GraphJSON } from "./graph.js";
import { Algorithms, Animation } from "./algorithms.js";

export default class Menu {
    // #region ATTRIBUTES
    private graph: Graph;
    private algorithms: Algorithms;
    public currentAnimation: Animation | null = null;

    // Main menu HTML elements
    private mainSideNav = document.querySelector(".graph-sidenav") as HTMLDivElement;
    private BFS_Button = document.querySelector(".BFS-button") as HTMLButtonElement;
    private DFS_Button = document.querySelector(".DFS-button") as HTMLButtonElement;
    private Dijkstra_Button = document.querySelector(".Dijkstra-button") as HTMLButtonElement;
    private Kruskal_Button = document.querySelector(".Kruskal-button") as HTMLButtonElement;
    private test_button = document.querySelector(".test-button") as HTMLButtonElement;

    private HTML_directed_toggle = document.querySelector(".directed-switch") as HTMLInputElement;
    private HTML_weighted_toggle = document.querySelector(".weighted-switch") as HTMLInputElement;

    // Animation menu HTML elements
    private animationSideNav = document.querySelector(".animation-menu") as HTMLDivElement;
    private prev_frame_button = document.querySelector(".prev-frame") as HTMLButtonElement;
    private play_pause_animation_button = document.querySelector(".play-pause") as HTMLButtonElement;
    private next_frame_button = document.querySelector(".next-frame") as HTMLButtonElement;
    private stop_animation_button = document.querySelector(".stop") as HTMLButtonElement;
    private reset_animation_button = document.querySelector(".reset") as HTMLButtonElement;

    // Top-Right menu HTML elements
    private import_file_input = document.querySelector(".import-input") as HTMLInputElement;
    private export_button = document.querySelector(".export-button") as HTMLDivElement;
    private reset_graph_button = document.querySelector(".reset-graph-button") as HTMLDivElement;

    // #endregion

    constructor(graph: Graph) {
        this.graph = graph;
        this.algorithms = new Algorithms(this.graph, document.querySelector(".frame-slider") as HTMLInputElement);

        // Add menu event listeners and focus on main menu
        this.animationMenuEventListeners();
        this.mainMenuEventListeners();
        this.topRightMenuEventListeners();
        this.focusMainMenu();
    }

    // * MAIN SIDE MENU
    private mainMenuEventListeners() {
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

        this.test_button.addEventListener("click", () => {});

        // * Toggles
        // Toggle events
        this.HTML_directed_toggle.addEventListener("click", this.graph.toggle_directed.bind(this.graph));
        this.HTML_weighted_toggle.addEventListener("click", this.graph.toggle_weighted.bind(this.graph));

        // Check if toggles checks (checkboxes) align with default graph states
        if (this.HTML_directed_toggle.checked !== this.graph.directed) this.graph.toggle_directed();
        if (this.HTML_weighted_toggle.checked !== this.graph.weighted) this.graph.toggle_weighted();
    }
    private setWeighted = (on: boolean): void => {
        if (on) {
            this.HTML_weighted_toggle.checked = true;
            if (!this.graph.weighted) this.graph.toggle_weighted();
        } else {
            this.HTML_weighted_toggle.checked = false;
            if (this.graph.weighted) this.graph.toggle_weighted();
        }
    };
    private setDirected = (on: boolean): void => {
        if (on) {
            this.HTML_directed_toggle.checked = true;
            if (!this.graph.directed) this.graph.toggle_directed();
        } else {
            this.HTML_directed_toggle.checked = false;
            if (this.graph.directed) this.graph.toggle_directed();
        }
    };
    private focusMainMenu() {
        this.mainSideNav.style.display = "";
        this.hideAnimationMenu();
    }
    private hideMainMenu() {
        this.mainSideNav.style.display = "none";
    }

    // * ANIMATION MENU
    private animationMenuEventListeners() {
        const prev_frame = (): void => {
            if (!this.currentAnimation) return;
            this.currentAnimation.prev_frame();
        };
        const next_frame = (): void => {
            if (!this.currentAnimation) return;
            this.currentAnimation.next_frame();
        };
        const play_pause_animation = async (): Promise<void> => {
            // Toggle playing attribute of the current animation
            if (!this.currentAnimation) return;
            if (this.play_pause_animation_button.textContent === "▶") {
                if (this.currentAnimation.curr_index === this.currentAnimation.length) {
                    this.currentAnimation.curr_index = 0;
                    this.graph.reset_colour();
                    this.currentAnimation.updateSlider();
                }
                this.play_pause_animation_button.textContent = "⏸";
                await this.currentAnimation.play();
                this.play_pause_animation_button.textContent = "▶";
            } else {
                this.play_pause_animation_button.textContent = "▶";
                this.currentAnimation.pause();
            }
        };
        const stop_animation = (): void => {
            if (!this.currentAnimation) return;

            // Removes the current animation and resets all nodes
            this.focusMainMenu();
            this.currentAnimation?.pause();
            this.currentAnimation = null;
            this.graph.reset_colour();
            this.graph.traversing = false;
            this.play_pause_animation_button.textContent = "▶";

            // Turn off text
            for (let node of this.graph.nodes) {
                node.updateShowText(false);
            }
        };
        const reset_animation = (): void => {
            // Resets animation
            if (!this.currentAnimation) return;
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
        document.addEventListener("keydown", (event: KeyboardEvent): void => {
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
    private focusAnimationMenu() {
        if (!this.currentAnimation) return;
        this.animationSideNav.style.display = "";
        this.hideMainMenu();
    }
    private hideAnimationMenu() {
        this.animationSideNav.style.display = "none";
    }
    private animate(algorithm: () => Animation | null) {
        // Get animation object and focus on the animation menu
        this.currentAnimation = algorithm();
        if (!this.currentAnimation) return;
        this.graph.traversing = true;
        this.focusAnimationMenu();
        this.currentAnimation.updateSlider();
    }

    // * TOP-RIGHT MENU
    private topRightMenuEventListeners(): void {
        this.reset_graph_button.addEventListener("click", this.graph.delete_all_nodes.bind(this.graph));
        this.export_button.addEventListener("click", this.export_graph.bind(this));
        this.import_file_input.addEventListener("change", this.import_graph.bind(this));
    }

    private export_graph(): void {
        if (this.graph.traversing) return;
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

    private import_graph(): void {
        if (this.graph.traversing || !this.import_file_input.files || this.import_file_input.files.length <= 0) return;
        const file = this.import_file_input.files[0];
        if (!file) return;

        // Read file
        const reader = new FileReader();
        reader.onload = (e) => {
            const contents = e.target?.result as string;
            try {
                const jsonData = JSON.parse(contents);
                if (
                    !Object.keys(jsonData).includes("vertices") ||
                    !Object.keys(jsonData).includes("adjacency_matrix") ||
                    !Object.keys(jsonData).includes("settings")
                ) {
                    console.log(jsonData);
                    window.alert("JSON file is in the wrong format. Unable to load graph");
                    return;
                }
                const graph_content: GraphJSON = jsonData;

                // Create the graph
                this.graph.build(graph_content);

                // Set settings
                const settings = graph_content["settings"];
                this.setDirected(settings.directed);
                this.setWeighted(settings.weighted);
            } catch (error) {
                console.error("Error parsing the JSON file: ", error);
            }
        };
        reader.readAsText(file);
    }
}
