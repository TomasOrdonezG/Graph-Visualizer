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
        this.HTML_directed_toggle = document.querySelector(".directed-switch");
        // Animation menu HTML elements
        this.animationSideNav = document.querySelector(".animation-menu");
        this.prev_frame_button = document.querySelector(".prev-frame");
        this.play_pause_animation_button = document.querySelector(".play-pause");
        this.next_frame_button = document.querySelector(".next-frame");
        this.stop_animation_button = document.querySelector(".stop");
        this.reset_animation_button = document.querySelector(".reset");
        this.graph = graph;
        this.algorithms = new Algorithms(this.graph, document.querySelector(".frame-slider"));
        // Add menu event listeners and focus on main menu
        this.animationMenuEventListeners();
        this.mainMenuEventListeners();
        this.focusMainMenu();
    }
    mainMenuEventListeners() {
        this.BFS_Button.addEventListener("click", () => {
            this.animate(this.algorithms.BFS.bind(this.algorithms));
        });
        this.DFS_Button.addEventListener("click", () => {
            this.animate(this.algorithms.DFS.bind(this.algorithms));
        });
        this.HTML_directed_toggle.addEventListener("click", this.graph.toggle_directed.bind(this.graph));
    }
    focusMainMenu() {
        this.mainSideNav.style.display = "";
        this.hideAnimationMenu();
    }
    hideMainMenu() {
        this.mainSideNav.style.display = "none";
    }
    animationMenuEventListeners() {
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
        this.focusAnimationMenu();
    }
}
