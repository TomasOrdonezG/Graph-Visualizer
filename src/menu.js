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
        this.graph = graph;
        this.algorithms = new Algorithms(this.graph, document.querySelector(".frame-slider"));
        // Animation Menu
        this.animationSideNav = document.querySelector(".animation-menu");
        this.prev_frame_button = document.querySelector(".prev-frame");
        this.play_pause_animation_button = document.querySelector(".play-pause");
        this.next_frame_button = document.querySelector(".next-frame");
        this.stop_animation_button = document.querySelector(".stop");
        this.reset_animation_button = document.querySelector(".reset");
        this.buildAnimationMenu();
        // Main Menu
        this.mainSideNav = document.createElement("div");
        this.BFS_Button = document.createElement("button");
        this.DFS_Button = document.createElement("button");
        this.HTML_directed_toggle = document.createElement("input");
        this.buildMainMenu();
        this.focusMainMenu();
    }
    buildMainMenu() {
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
    focusMainMenu() {
        this.mainSideNav.style.display = "";
        this.hideAnimationMenu();
    }
    hideMainMenu() {
        this.mainSideNav.style.display = "none";
    }
    buildAnimationMenu() {
        // Buttons
        this.prev_frame_button.addEventListener("click", () => {
            if (this.currentAnimation)
                this.currentAnimation.prev_frame();
        });
        this.next_frame_button.addEventListener("click", () => {
            if (this.currentAnimation)
                this.currentAnimation.next_frame();
        });
        this.play_pause_animation_button.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
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
        }));
        this.stop_animation_button.addEventListener("click", () => {
            // Removes the current animation and resets all nodes
            this.focusMainMenu();
            this.currentAnimation = null;
            this.graph.reset_colour();
            this.graph.traversing = false;
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
        this.graph.traversing = true;
        console.log("Created animation of " + this.currentAnimation.length + " frames");
        this.focusAnimationMenu();
    }
}
