import Graph from "./graph.js";
import { Algorithms, Animation } from "./algorithms.js";

export default class Menu {
    // #region ATTRIBUTES
    private graph: Graph;
    private algorithms: Algorithms;

    private mainSideNav: HTMLDivElement;
    private BFS_Button: HTMLButtonElement;
    private DFS_Button: HTMLButtonElement;
    private HTML_directed_toggle: HTMLInputElement;

    private animationSideNav: HTMLDivElement;
    private prev_frame_button: HTMLButtonElement;
    private next_frame_button: HTMLButtonElement;
    private play_pause_animation_button: HTMLButtonElement;
    private stop_animation_button: HTMLButtonElement;
    private reset_animation_button: HTMLButtonElement;
    private animation_speed_slider: HTMLInputElement;

    public currentAnimation: Animation | null = null;
    // #endregion

    constructor(graph: Graph) {
        this.graph = graph;
        this.algorithms = new Algorithms(this.graph);

        // Animation Menu
        this.animationSideNav = document.createElement("div");
        this.prev_frame_button = document.createElement("button");
        this.next_frame_button = document.createElement("button");
        this.play_pause_animation_button = document.createElement("button");
        this.stop_animation_button = document.createElement("button");
        this.animation_speed_slider = document.createElement("input");
        this.reset_animation_button = document.createElement("button");
        this.buildAnimationMenu();

        // Main Menu
        this.mainSideNav = document.createElement("div");
        this.BFS_Button = document.createElement("button");
        this.DFS_Button = document.createElement("button");
        this.HTML_directed_toggle = document.createElement("input");
        this.buildMainMenu();

        this.focusMainMenu();
    }

    private buildMainMenu() {
        // Navigation menu
        this.mainSideNav.classList.add("graph-sidenav", "pan");
        document.body.append(this.mainSideNav);

        // BFS Button
        this.BFS_Button.textContent = "BFS";
        this.BFS_Button.classList.add("button", "pan");
        this.BFS_Button.addEventListener("click", () => {
            this.animate(this.algorithms.BFS.bind(this.algorithms));
        });
        this.mainSideNav.appendChild(this.BFS_Button);

        // DFS Button
        this.DFS_Button.textContent = "DFS";
        this.DFS_Button.classList.add("button", "pan");
        this.DFS_Button.addEventListener("click", () => {
            this.animate(this.algorithms.DFS.bind(this.algorithms));
        });
        this.mainSideNav.appendChild(this.DFS_Button);

        // Directed toggle & label
        const toggle_div = document.createElement("div");
        this.HTML_directed_toggle.type = "checkbox";
        this.HTML_directed_toggle.classList.add("toggle", "pan");
        this.HTML_directed_toggle.id = "directed-checkbox";
        this.HTML_directed_toggle.addEventListener("click", this.graph.toggle_directed.bind(this.graph));
        this.HTML_directed_toggle.setAttribute("checked", String(this.graph.directed));

        const label = document.createElement("label");
        label.setAttribute("for", "directed-checkbox");
        label.innerText = "Directed";

        toggle_div.appendChild(this.HTML_directed_toggle);
        toggle_div.appendChild(label);
        this.mainSideNav.appendChild(toggle_div);
    }
    private focusMainMenu() {
        this.mainSideNav.style.display = "";
        this.hideAnimationMenu();
    }
    private hideMainMenu() {
        this.mainSideNav.style.display = "none";
    }

    private buildAnimationMenu() {
        // Navigation menu
        this.animationSideNav.classList.add("graph-sidenav", "pan");
        document.body.append(this.animationSideNav);

        // Buttons
        this.prev_frame_button.textContent = "<";
        this.prev_frame_button.addEventListener("click", () => {
            if (this.currentAnimation) this.currentAnimation.prev_frame();
        });

        this.next_frame_button.textContent = ">";
        this.next_frame_button.addEventListener("click", () => {
            if (this.currentAnimation) this.currentAnimation.next_frame();
        });

        this.play_pause_animation_button.textContent = "Play";
        this.play_pause_animation_button.addEventListener("click", async () => {
            // Toggle playing attribute of the current animation
            if (!this.currentAnimation) return;
            if (this.play_pause_animation_button.textContent === "Play") {
                this.play_pause_animation_button.textContent = "Pause";
                await this.currentAnimation.play();
            } else {
                this.play_pause_animation_button.textContent = "Play";
                this.currentAnimation.pause();
            }
        });

        this.stop_animation_button.textContent = "Stop";
        this.stop_animation_button.addEventListener("click", () => {
            // Removes the current animation and resets all nodes
            this.focusMainMenu();
            this.currentAnimation = null;
            this.graph.reset_colour();
            this.graph.traversing = false;
        });

        this.reset_animation_button.textContent = "Reset";
        this.reset_animation_button.addEventListener("click", () => {
            // Resets animation
            if (this.currentAnimation) {
                this.currentAnimation.curr_index = 0;
                this.graph.reset_colour();

                this.play_pause_animation_button.textContent = "Play";
                this.currentAnimation.playing = false;
            }
        });

        // Add classlists to buttons and append the, to nav
        const buttons: HTMLButtonElement[] = [
            this.prev_frame_button,
            this.play_pause_animation_button,
            this.next_frame_button,
            this.stop_animation_button,
            this.reset_animation_button,
        ];
        for (let button of buttons) {
            button.classList.add("button", "pan");
            this.animationSideNav.appendChild(button);
        }

        // Speed slider
        this.animation_speed_slider.type = "number";
        this.animation_speed_slider.min = Animation.min_fps.toString();
        this.animation_speed_slider.max = Animation.max_fps.toString();
        this.animation_speed_slider.setAttribute("orient", "vertical");
        this.animation_speed_slider.classList.add("speed-slider", "pan");
        this.animationSideNav.appendChild(this.animation_speed_slider);
        this.animation_speed_slider.oninput = () => {
            if (this.currentAnimation) {
                this.currentAnimation.fps = parseInt(this.animation_speed_slider.value);
            }
        };
    }
    private focusAnimationMenu() {
        if (!this.currentAnimation) return;
        this.animationSideNav.style.display = "";
        this.animation_speed_slider.value = this.currentAnimation.fps.toString() + " fps";
        this.hideMainMenu();
    }
    private hideAnimationMenu() {
        this.animationSideNav.style.display = "none";
    }

    private animate(algorithm: () => Animation) {
        // Get animation object and focus on the animation menu
        this.currentAnimation = algorithm();
        this.graph.traversing = true;
        console.log("Created animation of " + this.currentAnimation.length + " frames");
        this.focusAnimationMenu();
    }
}
