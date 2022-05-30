

var canvas = document.getElementById("canvas");
let text = document.getElementById("text");
let width = canvas.width;
let height = canvas.height;
var ctx = canvas.getContext("2d");
let buffer = 10; // pixels
let dbuffer = buffer * 2;
let res;
let turnused;

let p = 3; // number of squares per side

let grid = new Array(p);
for (let i = 0; i < 3; i++)
    grid[i] = new Array(p);
let squareSize = (width - 2 * buffer) / p;
let dsquareSize = (width - 4 * dbuffer) / p;

// Format [cell thats below it], r,c
let horizontalWalls = [[1, 1], [2, 1]];
//Format [cell thats right of it]. r,c
let verticalWalls = [[1, 2]];

// add walls on border
// [0, 0] ... [0, p-1], [p-1, 0] ... [p-1, p-1]
for (let i = 0; i < p; i++) {
    horizontalWalls.push([0, i]);
    horizontalWalls.push([p, i]);
    verticalWalls.push([i, 0]);
    verticalWalls.push([i, p]);
}

let minotaurInit = [0, 2];
let heroInit = [2, 0];
let exitInit = [1, 2];

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

    return [dbuffer + squareSize * col, dbuffer + squareSize * row, dsquareSize, dsquareSize];
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
    ctx.lineWidth = 10;
    ctx.stroke();
}

function resetPosition() {
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
        if (e.key == "r") {
            resetPosition();
            res = false;
        }
        if (res) {
            minotaurTurn();
            if (minotaur[0] == hero[0] && minotaur[1] == hero[1]) {
                text.innerText = "You lost! Press R to restart"
            }
            drawBoard();
            if (exit[0] == hero[0] && exit[1] == hero[1]) {
                text.innerText = "You win! Press R to restart"
            }
        }
    }
};