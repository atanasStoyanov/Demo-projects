import Snake from './snake.js';
import Fruit from './fruit.js';

const canvas = document.querySelector('.canvas');
const startBtn = document.querySelector('.start');
const infoBox = document.querySelector('.infoBox');
const playAgainBox = document.querySelector('.playAgain');

const ctx = canvas.getContext('2d');
const scale = 10;
const rows = canvas.height / scale;
const columns = canvas.width / scale;
let score = 0;
let startGame;

let snake;
let fruit;

startBtn.addEventListener('click', setup);

function setup() {
    startBtn.disabled = true;
    if (playAgainBox.innerText === 'Click "Start" to play again') {
        playAgainBox.innerText = '';
    }

    snake = new Snake(canvas, ctx, scale);
    fruit = new Fruit(ctx, scale, rows, columns);
    fruit.pickLocation();

    startGame = window.setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        fruit.draw();
        snake.update();
        snake.draw();

        if (snake.eat(fruit)) {
            fruit.pickLocation();
            score++;
        };

        infoBox.innerText = `Score: ${score}`;

        if (snake.checkCollision()) {
            startBtn.disabled = false;
            snake.reset();
            window.clearInterval(startGame);
            infoBox.innerText = `Game Over! Your score: ${score}`;
            playAgainBox.innerText = 'Click "Start" to play again';
            score = 0;
        }

    }, 250);

    window.addEventListener('keydown', (evt) => {
        const direction = evt.key.replace('Arrow', '');
        snake.changeDirection(direction);
    });

};


