import Graph from "./graph.js";
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
    private HTML_directed_toggle = document.querySelector(".directed-switch") as HTMLInputElement;
    private HTML_weighted_toggle = document.querySelector(".weighted-switch") as HTMLInputElement;

    // Animation menu HTML elements
    private animationSideNav = document.querySelector(".animation-menu") as HTMLDivElement;
    private prev_frame_button = document.querySelector(".prev-frame") as HTMLButtonElement;
    private play_pause_animation_button = document.querySelector(".play-pause") as HTMLButtonElement;
    private next_frame_button = document.querySelector(".next-frame") as HTMLButtonElement;
    private stop_animation_button = document.querySelector(".stop") as HTMLButtonElement;
    private reset_animation_button = document.querySelector(".reset") as HTMLButtonElement;
    // #endregion

    constructor(graph: Graph) {
        this.graph = graph;
        this.algorithms = new Algorithms(this.graph, document.querySelector(".frame-slider") as HTMLInputElement);

        // Add menu event listeners and focus on main menu
        this.animationMenuEventListeners();
        this.mainMenuEventListeners();
        this.focusMainMenu();
    }

    private mainMenuEventListeners() {
        this.BFS_Button.addEventListener("click", () => {
            this.animate(this.algorithms.BFS.bind(this.algorithms));
        });
        this.DFS_Button.addEventListener("click", () => {
            this.animate(this.algorithms.DFS.bind(this.algorithms));
        });
        this.HTML_directed_toggle.addEventListener("click", this.graph.toggle_directed.bind(this.graph));
        this.HTML_weighted_toggle.addEventListener("click", this.graph.toggle_weighted.bind(this.graph));
    }
    private focusMainMenu() {
        this.mainSideNav.style.display = "";
        this.hideAnimationMenu();
    }
    private hideMainMenu() {
        this.mainSideNav.style.display = "none";
    }

    private animationMenuEventListeners() {
        this.prev_frame_button.addEventListener("click", () => {
            if (this.currentAnimation) this.currentAnimation.prev_frame();
        });
        this.next_frame_button.addEventListener("click", () => {
            if (this.currentAnimation) this.currentAnimation.next_frame();
        });
        this.play_pause_animation_button.addEventListener("click", async () => {
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
        });
        this.stop_animation_button.addEventListener("click", () => {
            // Removes the current animation and resets all nodes
            this.focusMainMenu();
            this.currentAnimation?.pause();
            this.currentAnimation = null;
            this.graph.reset_colour();
            this.graph.traversing = false;
            this.play_pause_animation_button.textContent = "▶";

            // Turn off text
            for (let node of this.graph.nodes) {
                node.show_time_interval = false;
                node.updateText();
            }
        });
        this.reset_animation_button.addEventListener("click", () => {
            // Resets animation
            if (this.currentAnimation) {
                this.currentAnimation.curr_index = 0;
                this.graph.reset_colour();
                this.currentAnimation.updateSlider();

                this.play_pause_animation_button.textContent = "▶";
                this.currentAnimation.playing = false;
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

    private animate(algorithm: () => Animation) {
        // Get animation object and focus on the animation menu
        this.currentAnimation = algorithm();
        this.graph.traversing = true;
        this.focusAnimationMenu();
    }
}
