import Graph, { GraphJSON, Action } from "./graph.js";
import { Algorithms, Animation } from "./algorithms.js";

export default class Menu {
    // #region ATTRIBUTES
    private graph: Graph;
    private algorithms: Algorithms;
    public currentAnimation: Animation | null = null;

    // Main menu HTML elements (left)
    private mainSideNav = document.querySelector(".graph-sidenav") as HTMLDivElement;
    private BFS_Button = document.querySelector(".BFS-button") as HTMLButtonElement;
    private DFS_Button = document.querySelector(".DFS-button") as HTMLButtonElement;
    private DijkstraButton = document.querySelector(".Dijkstra-button") as HTMLButtonElement;
    private KruskalButton = document.querySelector(".Kruskal-button") as HTMLButtonElement;
    private SCCsButton = document.querySelector(".SCCs-button") as HTMLButtonElement;
    private HTMLdirectedToggle = document.querySelector(".directed-switch") as HTMLInputElement;
    private HTMLweightedToggle = document.querySelector(".weighted-switch") as HTMLInputElement;

    // Top-Right menu HTML elements
    private topRightMenu = document.querySelector(".top-right-menu") as HTMLDivElement;
    private importFileInput = document.querySelector(".import-input") as HTMLInputElement;
    private exportButton = document.querySelector(".export-button") as HTMLDivElement;
    private resetGraphButton = document.querySelector(".reset-graph-button") as HTMLDivElement;

    // Action menu (right)
    private actionMenu = document.querySelector(".action-menu") as HTMLDivElement;
    // private cursorButton = document.querySelector(".action-cursor") as HTMLButtonElement;
    private addButton = document.querySelector(".action-add") as HTMLButtonElement;
    private moveButton = document.querySelector(".action-move") as HTMLButtonElement;
    private linkButton = document.querySelector(".action-link") as HTMLButtonElement;
    private deleteButton = document.querySelector(".action-delete") as HTMLButtonElement;
    private actionButtons = [this.addButton, this.moveButton, this.linkButton, this.deleteButton];

    // Animation menu HTML elements
    private animationSideNav = document.querySelector(".animation-menu") as HTMLDivElement;
    private prevFrameButton = document.querySelector(".prev-frame") as HTMLButtonElement;
    private playPauseAnimationButton = document.querySelector(".play-pause") as HTMLButtonElement;
    private nextFrameButton = document.querySelector(".next-frame") as HTMLButtonElement;
    private stopAnimationButton = document.querySelector(".stop") as HTMLButtonElement;
    private resetAnimationButton = document.querySelector(".reset") as HTMLButtonElement;

    // #endregion

    constructor(graph: Graph) {
        this.graph = graph;
        this.algorithms = new Algorithms(this.graph, document.querySelector(".frame-slider") as HTMLInputElement);

        // Add menu event listeners and focus on main menu
        this.animationMenuEventListeners();
        this.mainMenuEventListeners();
        this.topRightMenuEventListeners();
        this.actionMenuEventListeners();

        this.focusEditingMenus();
    }

    private focusEditingMenus() {
        // Show editing menus
        this.mainSideNav.style.display = "";
        this.topRightMenu.style.display = "";
        this.actionMenu.style.display = "";

        // Hide animation menus
        this.animationSideNav.style.display = "none";
    }

    private focusAnimationMenus() {
        // Show animation menus
        if (!this.currentAnimation) return;
        this.animationSideNav.style.display = "";

        // Hide editing menus
        this.mainSideNav.style.display = "none";
        this.topRightMenu.style.display = "none";
        this.actionMenu.style.display = "none";
    }

    // * ACTION MENU
    private actionButtonClick(button: HTMLButtonElement) {
        // Unselected all buttons
        for (let button of this.actionButtons) {
            button.classList.remove("selected");
        }

        // Select this button
        button.classList.add("selected");

        // Set the graph action mode based on the button selected
        switch (button) {
            case this.addButton:
                this.graph.action = Action.ADD;
                break;
            case this.moveButton:
                this.graph.action = Action.MOVE;
                break;
            case this.linkButton:
                this.graph.action = Action.LINK;
                break;
            case this.deleteButton:
                this.graph.action = Action.DELETE;
                break;
        }
    }
    private actionMenuEventListeners() {
        for (let button of this.actionButtons) {
            button.addEventListener("click", () => {
                this.actionButtonClick(button);
            });
        }
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
        this.DijkstraButton.addEventListener("click", () => {
            this.animate(this.algorithms.Dijkstra.bind(this.algorithms));
        });
        this.KruskalButton.addEventListener("click", () => {
            this.setWeighted(true);
            this.animate(this.algorithms.Kruskal.bind(this.algorithms));
        });

        this.SCCsButton.addEventListener("click", () => {
            this.setDirected(true);
            this.animate(this.algorithms.FindSCCs.bind(this.algorithms));
        });

        // * Toggles
        // Toggle events
        this.HTMLdirectedToggle.addEventListener("click", this.graph.toggle_directed.bind(this.graph));
        this.HTMLweightedToggle.addEventListener("click", this.graph.toggle_weighted.bind(this.graph));

        // Check if toggles checks (checkboxes) align with default graph states
        if (this.HTMLdirectedToggle.checked !== this.graph.directed) this.graph.toggle_directed();
        if (this.HTMLweightedToggle.checked !== this.graph.weighted) this.graph.toggle_weighted();
    }
    private setWeighted = (on: boolean): void => {
        if (on) {
            this.HTMLweightedToggle.checked = true;
            if (!this.graph.weighted) this.graph.toggle_weighted();
        } else {
            this.HTMLweightedToggle.checked = false;
            if (this.graph.weighted) this.graph.toggle_weighted();
        }
    };
    private setDirected = (on: boolean): void => {
        if (on) {
            this.HTMLdirectedToggle.checked = true;
            if (!this.graph.directed) this.graph.toggle_directed();
        } else {
            this.HTMLdirectedToggle.checked = false;
            if (this.graph.directed) this.graph.toggle_directed();
        }
    };

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
            if (this.playPauseAnimationButton.textContent === "▶") {
                if (this.currentAnimation.curr_index === this.currentAnimation.length) {
                    this.currentAnimation.curr_index = 0;
                    this.graph.reset_all_attributes();
                    this.currentAnimation.updateSlider();
                }
                this.playPauseAnimationButton.textContent = "⏸";
                await this.currentAnimation.play();
                this.playPauseAnimationButton.textContent = "▶";
            } else {
                this.playPauseAnimationButton.textContent = "▶";
                this.currentAnimation.pause();
            }
        };
        const stop_animation = (): void => {
            if (!this.currentAnimation) return;

            // Removes the current animation and resets all nodes
            this.focusEditingMenus();
            this.currentAnimation?.pause();
            this.currentAnimation = null;
            this.graph.traversing = false;
            this.graph.reset_all_attributes();
            this.playPauseAnimationButton.textContent = "▶";

            // Turn off text
            for (let node of this.graph.nodes) {
                node.updateShowText(false);
            }
        };
        const reset_animation = (): void => {
            // Resets animation
            if (!this.currentAnimation) return;
            this.currentAnimation.curr_index = 0;
            this.graph.reset_all_attributes();
            this.currentAnimation.updateSlider();

            this.playPauseAnimationButton.textContent = "▶";
            this.currentAnimation.playing = false;
        };

        // Animation controls with buttons
        this.prevFrameButton.addEventListener("click", prev_frame);
        this.nextFrameButton.addEventListener("click", next_frame);
        this.playPauseAnimationButton.addEventListener("click", play_pause_animation);
        this.stopAnimationButton.addEventListener("click", stop_animation);
        this.resetAnimationButton.addEventListener("click", reset_animation);

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
    private animate(algorithm: () => Animation | null) {
        // Get animation object and focus on the animation menu
        this.currentAnimation = algorithm();
        if (!this.currentAnimation) return;
        this.graph.reset_all_attributes();
        this.graph.traversing = true;
        this.actionButtonClick(this.addButton);
        this.focusAnimationMenus();
        this.currentAnimation.updateSlider();
    }

    // * TOP-RIGHT MENU
    private topRightMenuEventListeners(): void {
        this.resetGraphButton.addEventListener("click", this.graph.delete_all_nodes.bind(this.graph));
        this.exportButton.addEventListener("click", this.export_graph.bind(this));
        this.importFileInput.addEventListener("change", this.import_graph.bind(this));
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
        if (this.graph.traversing || !this.importFileInput.files || this.importFileInput.files.length <= 0) return;
        const file = this.importFileInput.files[0];
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
