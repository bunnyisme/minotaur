

var canvas = document.getElementById("canvas");
let text = document.getElementById("text");
let movecounter = document.getElementById("movecounter");
let width = canvas.width;
let height = canvas.height;
var ctx = canvas.getContext("2d");
let buffer = 10; // pixels

/* 
* THIS IS THE LEVEL 0 MAP SETUP
* let p = 3; // squares per side
* // Format [cell thats below it], [row,col]
* let horizontalWalls = [[1, 1], [2, 1]];
* //Format [cell thats right of it]. [row,col]
* let verticalWalls = [[1, 2]];
* 
* let minotaurInit = [0, 2];
* let heroInit = [2, 0];
* let exitInit = [1, 2];
*/


// config
let horizontalWalls = [[3, 0], [2, 2], [1, 3]];
let verticalWalls = [[2, 1], [2, 3], [3, 2], [1, 2]];
let minotaurInit = [0, 0];
let heroInit = [3, 0];
let exitInit = [0, 1];
let maxMoves = 13;

let p = 4;

// Public trackers
let moveCounter = 0;


// Private trackers
let res;
let turnused;
let canplay = true;

let squareSize = (width - 2 * buffer) / p;
let dsquareSize = squareSize * 0.75

/*let grid = new Array(p);
for (let i = 0; i < 3; i++)
    grid[i] = new Array(p);
    */




// add walls on border
// [0, 0] ... [0, p-1], [p-1, 0] ... [p-1, p-1]
for (let i = 0; i < p; i++) {
    horizontalWalls.push([0, i]);
    horizontalWalls.push([p, i]);
    verticalWalls.push([i, 0]);
    verticalWalls.push([i, p]);
}



let minotaur = minotaurInit.slice();
let hero = heroInit.slice();
let exit = exitInit.slice();

function searchForCoords(list, arr) {
    for (a of list) {
        if (a[0] == arr[0] && a[1] == arr[1]) return true
    }
    return false;
}

function getRect(row, col) {
    return [buffer + squareSize * col, buffer + squareSize * row, squareSize, squareSize];
}

function getInnerRect(row, col) {
    // A mathmatician told me to do this idk why it works
    return [buffer + squareSize * (col + 1 / 8), buffer + squareSize * (row + 1 / 8), 0.75 * squareSize, 0.75 * squareSize];
}

function drawRect(row, col) {
    ctx.beginPath();
    ctx.rect(...getRect(row, col));
    ctx.stroke();
}

function fillRect(row, col, color) {
    ctx.beginPath();
    ctx.rect(...getInnerRect(row, col));
    ctx.fillStyle = color;
    ctx.fill();
}

function drawLine(x, y, direction, len) {
    ctx.beginPath();
    ctx.moveTo(x, y);

    if (direction == 0) {
        ctx.lineTo(x + len, y);
    }
    if (direction == 1) {
        ctx.lineTo(x, y + len);
    }
    ctx.lineWidth = 6;
    ctx.stroke();
}

function resetPosition() {
    moveCounter = 0;
    canplay = true;
    text.innerText = "";
    minotaur = minotaurInit.slice();
    hero = heroInit.slice();
    drawBoard();
}


function drawBoard() {
    ctx.rect(0, 0, width, height)
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.lineWidth = 1;
    for (let row = 0; row < p; row++) {
        for (let col = 0; col < p; col++) {
            drawRect(row, col)
        }
    }
    for (wall of horizontalWalls) {
        let [x, y, len] = getRect(wall[0], wall[1]);
        drawLine(x, y, 0, len)
    }

    for (wall of verticalWalls) {
        let [x, y, len] = getRect(wall[0], wall[1]);
        drawLine(x, y, 1, len)
    }

    fillRect(...exit, "blue");
    fillRect(...hero, "green");
    fillRect(...minotaur, "red");



}

drawBoard();



function goUp(char) {
    if (searchForCoords(horizontalWalls, char))
        return false;
    else
        char[0] = char[0] - 1;
    return true;
}
function goDown(char) {
    charNext = [char[0] + 1, char[1]]
    if (searchForCoords(horizontalWalls, charNext))
        return false;
    else
        char[0] = char[0] + 1
    return true
}
function goLeft(char) {
    if (searchForCoords(verticalWalls, char))
        return false;
    else
        char[1] = char[1] - 1
    return true;
}
function goRight(char) {
    charNext = [char[0], char[1] + 1]
    if (searchForCoords(verticalWalls, charNext))
        return false;
    else
        char[1] = char[1] + 1;
    return true;
}

function minotaurColumn() {
    // Get correct column
    if (minotaur[1] > hero[1]) {
        res = goLeft(minotaur)
    }
    else if (minotaur[1] < hero[1]) {
        res = goRight(minotaur)
    } else {
        res = false;
    }
    return res;
}
function minotaurRow() {
    // Get correct column
    if (minotaur[0] > hero[0]) {
        res = goUp(minotaur)
    }
    else if (minotaur[0] < hero[0]) {
        res = goDown(minotaur)
    } else {
        res = false;
    }
    return res;
}

function minotaurTurn() {
    let moves = 0;
    // Col, Col, Row, Col, Row is the minotaurs checks (i think)
    if (minotaurColumn()) moves++;
    if (minotaurColumn()) moves++;
    if (moves !== 2 && minotaurRow()) moves++;
    if (moves !== 2 && minotaurColumn()) moves++;
    if (moves !== 2 && minotaurRow()) moves++;
}

window.onload = function () {
    document.getElementsByTagName('body')[0].onkeydown = function (e) {
        if (e.key == "r") {
            resetPosition();
            res = false;
        }
        if (!canplay) return;
        if (e.key == "w") {
            res = goUp(hero);
        }
        if (e.key == "a") {
            res = goLeft(hero);
        }
        if (e.key == "s") {
            res = goDown(hero);
        }
        if (e.key == "d") {
            res = goRight(hero);
        }
        if (e.key == "q") {
            res = true;
        }

        if (res) {
            minotaurTurn();
            drawBoard();
            moveCounter++;
            movecounter.innerText = "Moves: " + moveCounter + "/" + maxMoves;

            if (minotaur[0] == hero[0] && minotaur[1] == hero[1]) {
                text.innerText = "You got eaten! Press R to restart"
                canplay = false;
            }
            else if (exit[0] == hero[0] && exit[1] == hero[1]) {
                text.innerText = "You win! Press R to restart"
                canplay = false;
            }
            else if (moveCounter == maxMoves) {
                text.innerText = "You ran out of moves! Press R to restart"
                canplay = false;
            }
        }
    }
};