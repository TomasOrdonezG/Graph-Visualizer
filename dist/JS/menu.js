var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Action } from "./graph.js";
import { Algorithms } from "./algorithms.js";
export default class Menu {
    // #endregion
    constructor(graph) {
        this.currentAnimation = null;
        // Main menu HTML elements (left)
        this.mainSideNav = document.querySelector(".graph-sidenav");
        this.BFS_Button = document.querySelector(".BFS-button");
        this.DFS_Button = document.querySelector(".DFS-button");
        this.DijkstraButton = document.querySelector(".Dijkstra-button");
        this.KruskalButton = document.querySelector(".Kruskal-button");
        this.SCCsButton = document.querySelector(".SCCs-button");
        this.HTMLdirectedToggle = document.querySelector(".directed-switch");
        this.HTMLweightedToggle = document.querySelector(".weighted-switch");
        // Top-Right menu HTML elements
        this.topRightMenu = document.querySelector(".top-right-menu");
        this.importFileInput = document.querySelector(".import-input");
        this.exportButton = document.querySelector(".export-button");
        this.resetGraphButton = document.querySelector(".reset-graph-button");
        // Action menu (right)
        this.actionMenu = document.querySelector(".action-menu");
        this.cursorButton = document.querySelector(".action-cursor");
        this.addButton = document.querySelector(".action-add");
        this.moveButton = document.querySelector(".action-move");
        this.linkButton = document.querySelector(".action-link");
        this.deleteButton = document.querySelector(".action-delete");
        this.actionButtons = [this.cursorButton, this.addButton, this.moveButton, this.linkButton, this.deleteButton];
        // Animation menu HTML elements
        this.animationSideNav = document.querySelector(".animation-menu");
        this.prevFrameButton = document.querySelector(".prev-frame");
        this.playPauseAnimationButton = document.querySelector(".play-pause");
        this.nextFrameButton = document.querySelector(".next-frame");
        this.stopAnimationButton = document.querySelector(".stop");
        this.resetAnimationButton = document.querySelector(".reset");
        this.setWeighted = (on) => {
            if (on) {
                this.HTMLweightedToggle.checked = true;
                if (!this.graph.weighted)
                    this.graph.toggle_weighted();
            }
            else {
                this.HTMLweightedToggle.checked = false;
                if (this.graph.weighted)
                    this.graph.toggle_weighted();
            }
        };
        this.setDirected = (on) => {
            if (on) {
                this.HTMLdirectedToggle.checked = true;
                if (!this.graph.directed)
                    this.graph.toggle_directed();
            }
            else {
                this.HTMLdirectedToggle.checked = false;
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
        this.actionMenuEventListeners();
        this.focusEditingMenus();
    }
    focusEditingMenus() {
        // Show editing menus
        this.mainSideNav.style.display = "";
        this.topRightMenu.style.display = "";
        this.actionMenu.style.display = "";
        // Hide animation menus
        this.animationSideNav.style.display = "none";
    }
    focusAnimationMenus() {
        // Show animation menus
        if (!this.currentAnimation)
            return;
        this.animationSideNav.style.display = "";
        // Hide editing menus
        this.mainSideNav.style.display = "none";
        this.topRightMenu.style.display = "none";
        this.actionMenu.style.display = "none";
    }
    // * ACTION MENU
    actionButtonClick(button) {
        // Unselected all buttons
        for (let button of this.actionButtons) {
            button.classList.remove("selected");
        }
        // Select this button
        button.classList.add("selected");
        // Set the graph action mode based on the button selected
        switch (button) {
            case this.cursorButton:
                this.graph.action = Action.CURSOR;
                break;
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
    actionMenuEventListeners() {
        for (let button of this.actionButtons) {
            button.addEventListener("click", () => {
                this.actionButtonClick(button);
            });
        }
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
        if (this.HTMLdirectedToggle.checked !== this.graph.directed)
            this.graph.toggle_directed();
        if (this.HTMLweightedToggle.checked !== this.graph.weighted)
            this.graph.toggle_weighted();
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
            if (this.playPauseAnimationButton.textContent === "▶") {
                if (this.currentAnimation.curr_index === this.currentAnimation.length) {
                    this.currentAnimation.curr_index = 0;
                    this.graph.reset_all_attributes();
                    this.currentAnimation.updateSlider();
                }
                this.playPauseAnimationButton.textContent = "⏸";
                yield this.currentAnimation.play();
                this.playPauseAnimationButton.textContent = "▶";
            }
            else {
                this.playPauseAnimationButton.textContent = "▶";
                this.currentAnimation.pause();
            }
        });
        const stop_animation = () => {
            var _a;
            if (!this.currentAnimation)
                return;
            // Removes the current animation and resets all nodes
            this.focusEditingMenus();
            (_a = this.currentAnimation) === null || _a === void 0 ? void 0 : _a.pause();
            this.currentAnimation = null;
            this.graph.traversing = false;
            this.graph.reset_all_attributes();
            this.playPauseAnimationButton.textContent = "▶";
            // Turn off text
            for (let node of this.graph.nodes) {
                node.updateShowText(false);
            }
        };
        const reset_animation = () => {
            // Resets animation
            if (!this.currentAnimation)
                return;
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
    animate(algorithm) {
        // Get animation object and focus on the animation menu
        this.currentAnimation = algorithm();
        if (!this.currentAnimation)
            return;
        this.graph.reset_all_attributes();
        this.graph.traversing = true;
        this.actionButtonClick(this.cursorButton);
        this.focusAnimationMenus();
        this.currentAnimation.updateSlider();
    }
    // * TOP-RIGHT MENU
    topRightMenuEventListeners() {
        this.resetGraphButton.addEventListener("click", this.graph.delete_all_nodes.bind(this.graph));
        this.exportButton.addEventListener("click", this.export_graph.bind(this));
        this.importFileInput.addEventListener("change", this.import_graph.bind(this));
    }
    export_graph() {
        if (this.graph.traversing)
            return;
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
        if (this.graph.traversing || !this.importFileInput.files || this.importFileInput.files.length <= 0)
            return;
        const file = this.importFileInput.files[0];
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
