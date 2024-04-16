import { GRAPH } from "./main.js";
export default class Menu {
    // #endregion
    constructor() {
        this.sidenav = document.createElement("div");
        this.BFS_Button = document.createElement("button");
        this.DFS_Button = document.createElement("button");
        this.HTML_directed_toggle = document.createElement("input");
        this.createHTML();
    }
    createHTML() {
        // Navigation menu
        this.sidenav.classList.add("graph-sidenav", "pan");
        document.body.append(this.sidenav);
        // BFS Button
        this.BFS_Button.textContent = "BFS";
        this.BFS_Button.classList.add("button", "pan");
        this.BFS_Button.addEventListener("click", GRAPH.BFS.bind(GRAPH));
        this.sidenav.appendChild(this.BFS_Button);
        // DFS Button
        this.DFS_Button.textContent = "DFS";
        this.DFS_Button.classList.add("button", "pan");
        this.DFS_Button.addEventListener("click", GRAPH.DFS.bind(GRAPH));
        this.sidenav.appendChild(this.DFS_Button);
        // Directed toggle & label
        const toggle_div = document.createElement("div");
        this.HTML_directed_toggle.type = "checkbox";
        this.HTML_directed_toggle.classList.add("toggle", "pan");
        this.HTML_directed_toggle.id = "directed-checkbox";
        this.HTML_directed_toggle.addEventListener("click", GRAPH.toggle_directed.bind(GRAPH));
        const label = document.createElement("label");
        label.setAttribute("for", "directed-checkbox");
        label.innerText = "Directed";
        toggle_div.appendChild(this.HTML_directed_toggle);
        toggle_div.appendChild(label);
        this.sidenav.appendChild(toggle_div);
    }
}
