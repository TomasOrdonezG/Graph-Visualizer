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
    private toggleButton = document.querySelector(".toggle-button") as HTMLDivElement;
    private HTMLdirectedToggle = document.querySelector(".directed-switch") as HTMLInputElement;
    private HTMLweightedToggle = document.querySelector(".weighted-switch") as HTMLInputElement;

    // Top-Right menu HTML elements
    private topRightMenu = document.querySelector(".top-right-menu") as HTMLDivElement;
    private importFileInput = document.querySelector(".import-input") as HTMLInputElement;
    private exportButton = document.querySelector(".export-button") as HTMLDivElement;
    private browseButton = document.querySelector(".browse-graph-button") as HTMLDivElement;
    private resetGraphButton = document.querySelector(".reset-graph-button") as HTMLDivElement;

    // Browse Graphs PopUp Menu
    private browsePopUp = document.querySelector(".browse-graph-popup") as HTMLDivElement;
    private browsePopUpOverlay = document.querySelector(".browse-graph-overlay") as HTMLDivElement;
    private closePopUpButton = document.querySelector(".popup-close-button") as HTMLButtonElement;

    // Action menu (right)
    private actionMenu = document.querySelector(".action-menu") as HTMLDivElement;
    private addButton = document.querySelector(".action-add") as HTMLButtonElement;
    private linkButton = document.querySelector(".action-link") as HTMLButtonElement;
    private moveButton = document.querySelector(".action-move") as HTMLButtonElement;
    private deleteButton = document.querySelector(".action-delete") as HTMLButtonElement;
    private actionButtons = [this.addButton, this.linkButton, this.moveButton, this.deleteButton];

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
        this.browseGraphPupUpEventListeners();

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
            case this.linkButton:
                this.graph.action = Action.LINK;
                break;
            case this.moveButton:
                this.graph.action = Action.MOVE;
                break;
            case this.deleteButton:
                this.graph.action = Action.DELETE;
                break;
        }
    }
    private actionMenuEventListeners() {
        // Click event listeners
        for (let button of this.actionButtons) {
            button.addEventListener("click", () => {
                this.actionButtonClick(button);
            });
        }

        document.addEventListener("keydown", (event: KeyboardEvent): void => {
            if (this.graph.editingValue) return;

            if (event.key === "1") {
                this.actionButtonClick(this.addButton);
            } else if (event.key === "2") {
                this.actionButtonClick(this.linkButton);
            } else if (event.key === "3") {
                this.actionButtonClick(this.moveButton);
            } else if (event.key === "4") {
                this.actionButtonClick(this.deleteButton);
            }
        });

        document.addEventListener("wheel", (event: WheelEvent): void => {
            let index: number = this.graph.action as number;

            if (event.deltaY < 0) {
                index--;
            } else if (event.deltaY > 0) {
                index++;
            }

            if (index >= this.actionButtons.length) index--;
            if (index < 0) index++;

            this.actionButtonClick(this.actionButtons[index]);
        });
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

        // Collapse
        this.toggleButton.addEventListener("click", () => {
            this.mainSideNav.classList.toggle("collapsed");
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
        this.importFileInput.addEventListener("change", this.import_graph.bind(this));
        this.exportButton.addEventListener("click", this.export_graph.bind(this));
        this.resetGraphButton.addEventListener("click", this.graph.delete_all_nodes.bind(this.graph));

        this.browseButton.addEventListener("click", (): void => {
            // Show the popup
            this.browsePopUp.classList.remove("hidden");
            this.browsePopUpOverlay.classList.remove("hidden");
        });
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

    // * BROWSE GRAPH POPUP MENU
    private browseGraphPupUpEventListeners() {
        this.closePopUpButton.addEventListener("click", (): void => {
            this.browsePopUp.classList.add("hidden");
            this.browsePopUpOverlay.classList.add("hidden");
        });

        interface ExampleGraphs {
            [Key: string]: GraphJSON;
        }

        const rawData =
            '{"BFS":{"adjacency_matrix":[[null,1,1,1,1,null,null,null,null,null,null,null,null,null],[null,null,1,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,1,1,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,1,1,1,null,null],[null,null,1,1,null,1,null,null,1,null,null,null,null,null],[null,null,null,null,null,null,null,1,null,null,null,null,null,null],[null,null,null,null,null,null,null,1,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,1,null,null,null,null,null,1],[null,null,null,null,null,null,null,null,null,null,null,null,1,null],[null,null,null,null,null,null,null,null,1,null,null,null,null,1],[null,null,null,null,null,null,null,null,null,null,null,null,null,1],[null,null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null,null]],"vertices":[{"value":0,"x":0.537109375,"y":0.15725806451612903},{"value":1,"x":0.3795572916666667,"y":0.1478494623655914},{"value":2,"x":0.3541666666666667,"y":0.36155913978494625},{"value":3,"x":0.654296875,"y":0.28091397849462363},{"value":4,"x":0.5247395833333334,"y":0.4327956989247312},{"value":5,"x":0.4140625,"y":0.6008064516129032},{"value":6,"x":0.2682291666666667,"y":0.5282258064516129},{"value":7,"x":0.3333333333333333,"y":0.8225806451612904},{"value":8,"x":0.4934895833333333,"y":0.7473118279569892},{"value":9,"x":0.7721354166666666,"y":0.33198924731182794},{"value":10,"x":0.6145833333333334,"y":0.5604838709677419},{"value":12,"x":0.7376302083333334,"y":0.6303763440860215},{"value":13,"x":0.8522135416666666,"y":0.5887096774193549},{"value":11,"x":0.6451822916666666,"y":0.7768817204301075}],"settings":{"directed":true,"weighted":false}},"DFS":{"adjacency_matrix":[[null,1,null,1,null,null,1,null,null,null,null,null,null],[null,null,1,null,null,1,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,1,1,null,null],[null,null,null,null,1,1,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,1,null,null,null,1],[null,null,null,null,null,null,null,null,null,null,1,1,null],[null,null,null,null,null,null,null,1,null,null,null,null,null],[null,null,null,null,1,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,1],[null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,1,null],[null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null]],"vertices":[{"value":0,"x":0.4563802083333333,"y":0.12634408602150538},{"value":1,"x":0.380859375,"y":0.33198924731182794},{"value":2,"x":0.3111979166666667,"y":0.5981182795698925},{"value":3,"x":0.5384114583333334,"y":0.3387096774193548},{"value":4,"x":0.6595052083333334,"y":0.5887096774193549},{"value":5,"x":0.4928385416666667,"y":0.5887096774193549},{"value":6,"x":0.6451822916666666,"y":0.13844086021505375},{"value":7,"x":0.736328125,"y":0.3172043010752688},{"value":8,"x":0.822265625,"y":0.5793010752688172},{"value":9,"x":0.2819010416666667,"y":0.8131720430107527},{"value":10,"x":0.4127604166666667,"y":0.8575268817204301},{"value":11,"x":0.591796875,"y":0.8494623655913979},{"value":12,"x":0.77734375,"y":0.8185483870967742}],"settings":{"directed":true,"weighted":false}},"Dijkstra":{"adjacency_matrix":[[null,null,null,null,8,null,5,null],[null,null,null,null,null,null,null,6],[2,null,null,null,4,null,null,null],[null,null,6,null,null,null,null,null],[null,3,null,1,null,null,3,null],[null,4,null,null,null,null,null,null],[null,7,null,null,null,5,null,null],[null,null,null,9,null,null,null,null]],"vertices":[{"value":0,"x":0.3639322916666667,"y":0.15994623655913978},{"value":1,"x":0.6907552083333334,"y":0.6263440860215054},{"value":2,"x":0.2955729166666667,"y":0.4771505376344086},{"value":3,"x":0.3678385416666667,"y":0.8467741935483871},{"value":4,"x":0.4635416666666667,"y":0.40591397849462363},{"value":5,"x":0.7936197916666666,"y":0.29435483870967744},{"value":6,"x":0.6178385416666666,"y":0.16129032258064516},{"value":7,"x":0.5279947916666666,"y":0.8306451612903226}],"settings":{"directed":false,"weighted":true}},"Kruskal":{"adjacency_matrix":[[null,1,2,null,null,null,null,null,null,null],[null,null,null,4,null,null,7,null,null,null],[null,null,null,null,2,null,null,null,null,null],[null,null,null,null,null,null,null,3,null,null],[null,null,null,null,null,12,null,null,15,null],[null,null,null,10,null,null,null,null,null,null],[null,null,8,null,null,null,null,null,null,null],[null,null,null,null,1,null,null,null,null,null],[null,null,null,null,null,null,11,null,null,null],[null,8,null,9,null,null,null,5,null,null]],"vertices":[{"value":0,"x":0.2669270833333333,"y":0.5026881720430108},{"value":1,"x":0.400390625,"y":0.19086021505376344},{"value":2,"x":0.4016927083333333,"y":0.8413978494623656},{"value":3,"x":0.65234375,"y":0.18548387096774194},{"value":4,"x":0.6575520833333334,"y":0.8400537634408602},{"value":5,"x":0.7936197916666666,"y":0.4932795698924731},{"value":6,"x":0.4016927083333333,"y":0.49731182795698925},{"value":7,"x":0.654296875,"y":0.5053763440860215},{"value":8,"x":0.525390625,"y":0.6639784946236559},{"value":9,"x":0.525390625,"y":0.34543010752688175}],"settings":{"directed":false,"weighted":true}},"Find SCCs":{"adjacency_matrix":[[null,1,null,1,null,null,null,null,null,null,null,null,null,null],[null,null,1,null,null,null,1,null,null,null,null,null,null,null],[1,null,null,1,1,1,null,null,null,null,null,null,null,null],[null,null,null,null,1,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,1,1,1,null,null,null,null],[null,null,null,null,1,null,null,null,null,1,1,null,null,null],[null,null,1,null,null,1,null,null,null,null,1,null,null,null],[null,null,null,1,null,null,null,null,1,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,1,null],[null,null,null,null,null,null,null,null,1,null,null,null,null,1],[null,null,null,null,null,null,null,null,null,null,null,1,null,null],[null,null,null,null,null,1,null,null,null,1,null,null,null,1],[null,null,null,null,null,null,null,null,null,1,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,1,null]],"vertices":[{"value":0,"x":0.255859375,"y":0.385752688172043},{"value":1,"x":0.330078125,"y":0.15591397849462366},{"value":2,"x":0.4088541666666667,"y":0.38306451612903225},{"value":3,"x":0.3391927083333333,"y":0.6115591397849462},{"value":4,"x":0.490234375,"y":0.6115591397849462},{"value":5,"x":0.5690104166666666,"y":0.3763440860215054},{"value":6,"x":0.4811197916666667,"y":0.15591397849462366},{"value":7,"x":0.4134114583333333,"y":0.831989247311828},{"value":8,"x":0.5716145833333334,"y":0.8252688172043011},{"value":9,"x":0.6451822916666666,"y":0.603494623655914},{"value":10,"x":0.63671875,"y":0.15994623655913978},{"value":11,"x":0.7200520833333334,"y":0.3803763440860215},{"value":12,"x":0.7311197916666666,"y":0.8266129032258065},{"value":13,"x":0.7981770833333334,"y":0.6048387096774194}],"settings":{"directed":true,"weighted":false}}}';
        const exampleGraphs: ExampleGraphs = JSON.parse(rawData);

        document.querySelectorAll(".graph-option-button").forEach((button) => {
            (button as HTMLButtonElement).addEventListener("click", () => {
                const title = button.getAttribute("title") as string;

                if (exampleGraphs[title]) {
                    // Build the graph from the json
                    const graph_content: GraphJSON = exampleGraphs[title];
                    this.graph.build(graph_content);

                    // Set settings
                    const settings = graph_content["settings"];
                    this.setDirected(settings.directed);
                    this.setWeighted(settings.weighted);
                } else {
                    console.error(`'${title}' not found.`);
                }
            });
        });
    }
}
