

var canvas = document.getElementById("canvas");
let text = document.getElementById("text");
let movecounter = document.getElementById("movecounter");
let width = canvas.width;
let height = canvas.height;
var ctx = canvas.getContext("2d");
let buffer = 10; // pixels

// Public trackers
let moveCounter = 0;
let mapdata = {};
let url = new URL(window.location.href)
if (url.search.length > 0) {
    let urldata = url.search.slice(3);
    let decoded = decodeURIComponent(urldata)
    mapdatamid = JSON.parse(decoded)
    if (typeof mapdatamid == 'string')
        mapdata = JSON.parse(mapdatamid)
    else {
        mapdata = mapdatamid;
    }

}



if (Object.keys(mapdata).length === 0) {

    console.log("i am overwriting!")
    mapdata = {
        "horizontalWalls": [[3, 0], [2, 2], [1, 3]],
        "verticalWalls": [[2, 1], [2, 3], [3, 2], [1, 2]],
        "minotaurInit": [0, 0],
        "heroInit": [3, 0],
        "exitInit": [0, 1],
        "maxMoves": 13,
        "gridSize": 4
    }

}



// Private trackers
let res;
let turnused;
let canplay = true;

let squareSize = (width - 2 * buffer) / mapdata.gridSize;
let dsquareSize = squareSize * 0.75

/*let grid = new Array(p);
for (let i = 0; i < 3; i++)
    grid[i] = new Array(p);
    */




// add walls on border
// [0, 0] ... [0, p-1], [p-1, 0] ... [p-1, p-1]
for (let i = 0; i < mapdata.gridSize; i++) {
    mapdata.horizontalWalls.push([0, i]);
    mapdata.horizontalWalls.push([mapdata.gridSize, i]);
    mapdata.verticalWalls.push([i, 0]);
    mapdata.verticalWalls.push([i, mapdata.gridSize]);
}



let minotaur = mapdata.minotaurInit.slice();
let hero = mapdata.heroInit.slice();
let exit = mapdata.exitInit.slice();

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
    ctx.lineWidth = 1;
}

function resetPosition() {
    moveCounter = 0;
    movecounter.innerText = "Moves: " + moveCounter + "/" + mapdata.maxMoves;
    canplay = true;
    text.innerText = "";
    minotaur = mapdata.minotaurInit.slice();
    hero = mapdata.heroInit.slice();
    drawBoard();
}



const exit_image = new Image();
exit_image.src = './imgs/exit.png';
exit_image.onload = function () {
    ctx.drawImage(exit_image, ...getInnerRect(...exit));
};

const hero_image = new Image();
hero_image.src = './imgs/hero.png';
hero_image.onload = function () {
    ctx.drawImage(hero_image, ...getInnerRect(...hero));
};

const minotaur_image = new Image();
minotaur_image.src = './imgs/minotaur.png';
minotaur_image.onload = function () {
    ctx.drawImage(minotaur_image, ...getInnerRect(...minotaur));
};



function addImage(row, col, name) {
    if (name == "hero") img = hero_image;
    else if (name == "exit") img = exit_image;
    else if (name == "minotaur") img = minotaur_image;
    else return;
    ctx.drawImage(img, ...getInnerRect(row, col));
}

resetPosition();
function drawBoard() {
    ctx.rect(0, 0, width, height)
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.lineWidth = 1;
    for (let row = 0; row < mapdata.gridSize; row++) {
        for (let col = 0; col < mapdata.gridSize; col++) {
            drawRect(row, col)

        }
    }
    for (wall of mapdata.horizontalWalls) {
        let [x, y, len] = getRect(wall[0], wall[1]);
        drawLine(x, y, 0, len)
    }

    for (wall of mapdata.verticalWalls) {
        let [x, y, len] = getRect(wall[0], wall[1]);
        drawLine(x, y, 1, len)
    }

    //fillRect(...exit, "blue");
    //fillRect(...hero, "green");
    //fillRect(...minotaur, "red");
    addImage(...exit, 'exit')
    addImage(...hero, 'hero')
    addImage(...minotaur, 'minotaur')



}

drawBoard();



function goUp(char) {
    if (searchForCoords(mapdata.horizontalWalls, char))
        return false;
    else
        char[0] = char[0] - 1;
    return true;
}
function goDown(char) {
    charNext = [char[0] + 1, char[1]]
    if (searchForCoords(mapdata.horizontalWalls, charNext))
        return false;
    else
        char[0] = char[0] + 1
    return true
}
function goLeft(char) {
    if (searchForCoords(mapdata.verticalWalls, char))
        return false;
    else
        char[1] = char[1] - 1
    return true;
}
function goRight(char) {
    charNext = [char[0], char[1] + 1]
    if (searchForCoords(mapdata.verticalWalls, charNext))
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

function resolveTurn() {
    minotaurTurn();
    drawBoard();
    moveCounter++;
    movecounter.innerText = "Moves: " + moveCounter + "/" + mapdata.maxMoves;

    if (minotaur[0] == hero[0] && minotaur[1] == hero[1]) {
        text.innerText = "You got eaten! Press R or tap to restart"
        canplay = false;
    }
    else if (exit[0] == hero[0] && exit[1] == hero[1] && moveCounter <= mapdata.maxMoves) {
        text.innerText = "You escaped! Press R or tap to restart"
        canplay = false;
    }
    else if (exit[0] == hero[0] && exit[1] == hero[1] && moveCounter > mapdata.maxMoves) {
        text.innerText = "You made it to the exit, but you used too many moves! Press R or tap to restart"
        canplay = false;
    }
    else if (moveCounter == mapdata.maxMoves) {
        text.innerText = "You ran out of moves, but you may continue playing. Press R or tap to restart"
    }
}

window.onload = function () {
    document.getElementsByTagName('body')[0].onkeydown = function (e) {
        res = false;
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
            resolveTurn();
        }
    }
};

function getCellPosition(canvas, event) {
    [x, y] = getCursorPosition(canvas, event)
    let row = Math.floor((y - buffer) / squareSize);
    let col = Math.floor((x - buffer) / squareSize);
    return [row, col]
}

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    return [x, y]
}


canvas.addEventListener('mousedown', function (e) {

    if (!canplay) {
        resetPosition();
        res = false;
        return;
    }
    cell = getCellPosition(canvas, e)
    if (cell[0] < 0 || cell[0] >= mapdata.gridSize || cell[1] < 0 || cell[1] >= mapdata.gridSize) {
        return;
    }

    res = false;
    if (cell[0] == hero[0]) {
        if (cell[1] == hero[1]) res = true;
        if (cell[1] == hero[1] + 1) res = goRight(hero);
        if (cell[1] == hero[1] - 1) res = goLeft(hero);
    }
    if (cell[1] == hero[1]) {
        if (cell[0] == hero[0] + 1) res = goDown(hero);
        if (cell[0] == hero[0] - 1) res = goUp(hero);
    }
    if (res) {
        resolveTurn();
    }
})