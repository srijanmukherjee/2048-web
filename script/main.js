import { Game } from "./Game.js";

(function () {

    function main() {
        console.debug("main loaded");

        const container = document.getElementById("stage");
        const game = new Game(container);
        game.start();
    }

    document.addEventListener('DOMContentLoaded', main);

})();