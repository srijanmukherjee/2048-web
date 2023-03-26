const CLASS_PREFIX = "game";
const DEFAULT_GRID_SIZE = 4;

const GameState = Object.freeze({
    HOME: 'home',
    PLAY: 'play',
    RESULT: 'result'
});

const cellColors = {
    2: "#22162B",
    4: '#451F55',
    8: '#F8C630',
    16: "#F4D35E",
    32: '#DF2A4E',
    64: "#DA4167",
    128: "#2F2963",
    256: "#3E3681",
    512: "#FF715B",
    1024: "#1EA896",
    2048: "#5BC0EB"
}

export class Game {
    /**
     * 
     * @param {HTMLDivElement} container 
     * @param {number} gridSize 
     */
    constructor(container, gridSize = DEFAULT_GRID_SIZE) {
        if (gridSize < 2)
            throw new Error("Grid size cannot be less than 2");
        
        this.container  = container;
        this.state      = GameState.HOME;
        this.gridSize   = gridSize;
        this.cells      = new Array(gridSize * gridSize).fill(null);
        this.maxScore   = 2;

        this.touch = {
            x: null,
            y: null
        }

        this.lastTouch = { x: null, y: null }

        initialize(this);
    }

    /**
     * start the game
     */
    start() {
        document.addEventListener("keyup", (event) => {
            this.onKeyUp(event);
        });

        document.addEventListener("touchstart", (event) => {
            const [ touch ] = event.touches;
            this.touch.x = touch.clientX;
            this.touch.y = touch.clientY;
            this.lastTouch = {
                x: this.touch.x,
                y: this.touch.y
            };
        });

        this.container.addEventListener("mousedown", ({clientX, clientY}) => {
            this.touch.x = clientX;
            this.touch.y = clientY;
        });

        this.container.addEventListener("mouseup", ({clientX: x, clientY: y}) => {
            if (!this.touch.x || !this.touch.y) return;

            this.swipeTo(x, y);
        })

        document.addEventListener("touchmove", (event) => {
            const [ touch ] = event.touches;
            const { clientX: x, clientY: y } = touch;

            this.lastTouch.x = x;
            this.lastTouch.y = y;
        })

        document.addEventListener("touchend", (event) => {
            if (this.lastTouch.x === null || this.lastTouch.y === null) return;

            this.swipeTo(this.lastTouch.x, this.lastTouch.y);

            this.lastTouch.x = null;
            this.lastTouch.y = null;
            this.touch = {
                x: null,
                y: null
            };
        });
    }

    swipeTo(x, y, threshold = 50) {
        const dx = x - this.touch.x;
        const dy = y - this.touch.y;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (Math.abs(dx) < threshold) return;
            if (dx > 0) this.moveRight();
            else        this.moveLeft();
        } else {
            if (Math.abs(dy) < threshold) return;
            if (dy > 0) this.moveDown();
            else        this.moveUp();
        }
    }

    onKeyUp({ key }) {
        switch (key) {
            case "ArrowLeft": this.moveLeft(); break;

            case "ArrowRight": this.moveRight(); break;

            case "ArrowDown": this.moveDown(); break;

            case "ArrowUp": this.moveUp(); break;
        }
    }

    version() {
        console.log("2048-web v1.0")
    }

    moveLeft() {
        let moved = false;
        const n = this.gridSize;
        for (let x = 1; x < n; x++) {
            for (let y = 0; y < n; y++) {
                const index = x + y * n;
                const cell = this.cells[index];
                if (cell == null) continue;
                let newX = x;
 
                while (newX > 0 && this.cell(newX - 1, y) == null)
                    newX--;

                // merge
                if (this.isMergeble(newX - 1, y, cell.val)) {
                    moved = true;
                    this.merge(x, y, newX - 1, y);
                }

                else if (newX == x) continue;

                else {
                    moved = true;
                    this.cells[this.index(newX, y)] = cell;
                    this.cells[index] = null;
                }
            }
        }

        this.update(moved);
    }

    moveRight() {
        let moved = false;
        const n = this.gridSize;
        for (let x = n - 2; x >= 0; x--) {
            for (let y = 0; y < n; y++) {
                const index = x + y * n;
                const cell = this.cells[index];
                if (cell == null) continue;
                let newX = x;
 
                while (newX + 1 < n && this.cell(newX + 1, y) == null) {
                    newX++;
                }

                // merge
                if (this.isMergeble(newX + 1, y, cell.val)) {
                    moved = true;
                    this.merge(x, y, newX + 1, y);
                }

                else if (newX == x) continue;

                else {
                    moved = true;
                    this.cells[this.index(newX, y)] = cell;
                    this.cells[index] = null;
                }
            }
        }
        
        this.update(moved);
    }

    moveUp() {
        let moved = false;
        const n = this.gridSize;
        for (let y = 1; y < n; y++) {
            for (let x = 0; x < n; x++) {
                const index = x + y * n;
                const cell = this.cells[index];
                if (cell == null) continue;
                let newY = y;
 
                while (newY > 0 && this.cell(x, newY - 1) == null)
                    newY--;

                // merge
                if (this.isMergeble(x, newY - 1, cell.val)) {
                    moved = true;
                    this.merge(x, y, x, newY - 1);
                }

                else if (newY == y) continue;

                else {
                    moved = true;
                    this.cells[this.index(x, newY)] = cell;
                    this.cells[index] = null;
                }
            }
        }

        this.update(moved);
    }

    moveDown() {
        let moved = false;
        const n = this.gridSize;
        for (let y = n - 2; y >= 0; y--) {
            for (let x = 0; x < n; x++) {
                const index = x + y * n;
                const cell = this.cells[index];
                if (cell == null) continue;
                let newY = y;
 
                while (newY + 1 < n && this.cell(x, newY + 1) == null)
                    newY++;

                // merge
                if (this.isMergeble(x, newY + 1, cell.val)) {
                    moved = true;
                    this.merge(x, y, x, newY + 1);
                }

                else if (newY == y) continue;

                else {
                    moved = true;
                    this.cells[this.index(x, newY)] = cell;
                    this.cells[index] = null;
                }
            }
        }

        this.update(moved);        
    }

    update(moved) {
        if (moved) {
            for (const cell of this.cells) {
                if (cell) cell.updated = false;
            }
        }
        
        if (moved) setTimeout(() => this.insertRandom(), 100);
        this.render();
    }

    isMergeble(x, y, value) {
        const n = this.gridSize;

        if (x >= n || x < 0 || y < 0 || y >= n) return false;

        const cell = this.cell(x, y);
        return cell !== null && cell.val === value && cell.updated === false;   
    }

    merge(fromX, fromY, toX, toY) {
        const fromIndex = this.index(fromX, fromY);

        if (fromIndex < 0 || fromIndex >= this.cells.length)
            throw new Error("Invalid 'from' index");

        const fromCell = this.cell(fromX, fromY);

        if (!this.isMergeble(toX, toY, fromCell.val))
            throw new Error("cells not mergeble");

        
        const mergedCell = this.cell(toX, toY);
        mergedCell.val *= 2;
        mergedCell.el.innerHTML = mergedCell.val;
        mergedCell.el.setAttribute("data-val", mergedCell.val);
        mergedCell.updated = true;
        fromCell.el.remove();
        this.cells[fromIndex] = null;
        this.maxScore = Math.max(mergedCell.val, this.maxScore);        
    }

    insertRandom(val = 2) {
        const n = this.gridSize * this.gridSize;
        const emptyIndices = this.cells.map((cell, index) => cell === null ? index : -1).filter(index => index > -1);

        if (emptyIndices.length === 0) return false;

        let index = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];

        this.insertCell(Math.floor(index % this.gridSize), Math.floor(index / this.gridSize), val)
    }

    index(x, y) {
        return x + this.gridSize * y;
    }

    cell(x, y) {
        return this.cells[this.index(x, y)];
    }

    render() {
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                const index = x + y * this.gridSize;
                if (this.cells[index] === null) continue;
                const el = this.cells[index].el;
                el.style.transform = `translate(${x * 100}%, ${y * 100}%)`
            }
        }
    }

    insertCell(x, y, val) {
        this.validateIndex(x);
        this.validateIndex(y);

        const index = x + y * this.gridSize;

        if (this.cells[index] !== null)
            throw new Error("cell is not empty");

        this.lastInsertIndex = index;

        this.cells[index] = {
            val,
            el: createCell(val),
            updated: false
        };

        this.container.appendChild(this.cells[index].el);
        this.render()
    }

    validateIndex(x) {
        if (x < 0 || x >= this.gridSize) {
            throw new Error("index out of range: " + x);
        }
    }
}

function addClass(element, className) {
    element.classList.add(`${CLASS_PREFIX}-${className}`);
}

/**
 * create game cell
 * @param {number} index 
 * @returns {HTMLDivElement} cell
 */
function createCell(val) {
    const div = document.createElement("div");
    
    addClass(div, "cell");
    div.setAttribute("data-val", val);
    div.innerHTML = val;

    return div;
}

function injectStyleSheet() {
    const style = document.createElement("style");
    style.setAttribute('type', 'text/css');

    for (let i = 1; i <= 2048; i *= 2) {
        style.innerHTML += `
            .${CLASS_PREFIX}-cell[data-val='${i}'] {
                background-color: ${cellColors[i]}
            }
            // make grid
            const n = game.gridSize * game.gridSize;
            // for (let i = 0; i < n; i++) {
            //     game.container.appendChild(createCell(i));
            // }
        `
    }

    document.head.appendChild(style);
}

/**
 * initialize the game
 * 
 * @param {Game} game 
 */
function initialize(game) {
    injectStyleSheet();

    addClass(game.container, "stage");

    const x = Math.floor(Math.random() * game.gridSize);
    const y = Math.floor(Math.random() * game.gridSize);
    game.insertCell(x, y, 2);
}