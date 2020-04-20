const cvs = document.getElementById('tetris');
const ctx = cvs.getContext('2d');
const scoreElement = document.getElementById('score');

const ROW = 20;
const COL = 10;
const SQ = squareSize = 20;
const VACANT = 'White' //color of an empty square

//draw a square 

function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * SQ, y * SQ, SQ, SQ);

    ctx.strokeStyle = `Black`;
    ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
}

// create the board

let board = [];

for (let r = 0; r < ROW; r++) {
    board[r] = [];
    for (let c = 0; c < COL; c++) {
        board[r][c] = VACANT;
    }
}

//draw the board
function drawBoard() {
    for (let r = 0; r < ROW; r++) {
        for (let c = 0; c < COL; c++) {
            drawSquare(c, r, board[r][c]);
        }
    }
};

drawBoard();

//The pieces and their colors

const PIECES = [
    [Z, 'Red'],
    [S, 'Green'],
    [T, 'Yellow'],
    [O, 'Blue'],
    [L, 'Purple'],
    [I, 'Cyan'],
    [J, 'Orange']
];

//Generate random piece

function randomPiece() {
    let r = Math.floor(Math.random() * PIECES.length); // 0 -> 6

    return new Piece(PIECES[r][0], PIECES[r][1]);
}

let p = randomPiece();

//The Object Peice (constructor function)

function Piece(tetromino, color) {
    this.tetromino = tetromino;
    this.color = color;

    this.tetrominoN = 0;
    this.activeTetromino = this.tetromino[this.tetrominoN];

    //to control the pieces we give them coordinates
    this.x = 3;
    this.y = -1;
}

//fill function 
Piece.prototype.fill = function (color) {
    for (let r = 0; r < this.activeTetromino.length; r++) {
        for (let c = 0; c < this.activeTetromino.length; c++) {
            if (this.activeTetromino[r][c]) {
                drawSquare(this.x + c, this.y + r, color);
            }
        }
    }
}

//draw a piece to the board

Piece.prototype.draw = function () {
    this.fill(this.color);
}

//undrow a piece

Piece.prototype.unDraw = function () {
    this.fill(VACANT);
}

//move Down the piece 

Piece.prototype.moveDown = function () {
    if (!this.collision(0, 1, this.activeTetromino)) {
        this.unDraw();
        this.y++;
        this.draw();
    } else {
        //lock the piece and generate a new piece
        this.lock();
        p = randomPiece();
    }

}

//move Right the piece
Piece.prototype.moveRight = function () {
    if (!this.collision(1, 0, this.activeTetromino)) {
        this.unDraw();
        this.x++;
        this.draw();
    }

}

//move Left the piece
Piece.prototype.moveLeft = function () {
    if (!this.collision(-1, 0, this.activeTetromino)) {
        this.unDraw();
        this.x--;
        this.draw();
    }
}

//rotate the piece
Piece.prototype.rotate = function () {
    let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
    let kick = 0;

    if (this.collision(0, 0, nextPattern)) {

        if (this.x > COL / 2) {
            //it's the right wall that makes the collision
            kick = -1; // move the piece to the left
        } else {
            //it's the left wall that makes the collision
            kick = 1 // move the piece to the right
        }
    }
    
    if (!this.collision(kick, 0, nextPattern)) {
        this.unDraw();
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length; // (0 + 1) % 4 => 1
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();
    }
}

//collision function

Piece.prototype.collision = function (x, y, piece) {
    for (let r = 0; r < piece.length; r++) {
        for (let c = 0; c < piece.length; c++) {
            // if the square is empty, we skip it

            if (!piece[r][c]) {
                continue;
            }

            //coordinates of the piece after movement
            let newX = this.x + c + x;
            let newY = this.y + r + y;

            //conditions

            if (newX < 0 || newX >= COL || newY >= ROW) {
                return true;
            }

            if (newY < 0) {
                continue;
            }

            //check if there is a locked piece already in place
            if (board[newY][newX] !== VACANT) {
                return true;
            }
        }
    }
}

//lock piece on place
let score = 0;

Piece.prototype.lock = function () {
    for (let r = 0; r < this.activeTetromino.length; r++) {
        for (let c = 0; c < this.activeTetromino.length; c++) {
            //skip the vacant squares
            if (!this.activeTetromino[r][c]) {
                continue;
            }

            //pieces to lock on top = game over
            if (this.y + r < 0) {
                alert('Game Over');
                //stop request animation frame
                gameOver = true;
                break;
            }

            //lock the piece
            board[this.y + r][this.x + c] = this.color;
        }
    }

    //remove full rows
    for (let r = 0; r < ROW; r++) {
        let isRowFull = true;
        for (let c = 0; c < COL; c++) {
            isRowFull = isRowFull && (board[r][c] !== VACANT);
        }

        if (isRowFull) {
            //if the row is full move down all the rows above it
            for (let y = r; y > 1; y--) {
                for (let c = 0; c < COL; c++) {
                    board[y][c] = board[y - 1][c];
                }
            }

            //the top row board[0][..] has now row above it
            for (let c = 0; c < COL; c++) {
                board[0][c] = VACANT;
            }

            //increment the score
            score += 10;
        }
    }

    //update the board
    drawBoard();

    //update score
    scoreElement.innerHTML = score;
}

//Control the piece

document.addEventListener('keydown', control);

function control(event) {
    if (event.keyCode === 37) {
        p.moveLeft();
        dropStart = Date.now();
    } else if (event.keyCode === 38) {
        p.rotate();
        dropStart = Date.now();
    } else if (event.keyCode === 39) {
        p.moveRight();
        dropStart = Date.now();
    } else if (event.keyCode === 40) {
        p.moveDown();
    }

}

//drop the piece every 1 sec

let dropStart = Date.now();
let gameOver = false;

function drop() {
    let now = Date.now();
    let delta = now - dropStart;

    if (delta > 1000) {
        p.moveDown();
        dropStart = Date.now();
    }

    if (!gameOver) {
        requestAnimationFrame(drop);
    }
}

drop()