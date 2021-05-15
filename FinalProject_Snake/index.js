const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("game-score");
const startGameBtn = document.getElementById("UI-start-button");
const modalEl = document.getElementById("UI-modal");
const highestScoreEl = document.getElementById("UI-highest-score");

let animationId;
let player;
let food;
let greatFood;

let pause = false;
let gameOver = false;
let startingTime= 0;
let lastTime = 0;
let totalElapsedTime = 0;
let elapsedSinceLastLoop = 0;
let score = 0;
let highestScore = 0;
let initialLength = 29;
let numberOfFoodsEaten = 0;
let greatFoodSpawnRate = 5; // Number of foods eaten to spawn a greate food
const maxBoostSpeedMultiplier = 10;
let boostSpeedMultiplier = 1;

function distance(pointA, pointB)
{
    let dx = pointA[0] - pointB[0];
    let dy = pointA[1] - pointB[1];
    return Math.sqrt(dx * dx + dy * dy);
}

function copy(x)
{
    return JSON.parse(JSON.stringify(x));
}

function updateScore()
{
    score = player.length;

    if (highestScore < score)
        highestScore = score;

    scoreEl.innerHTML = score;
}

function drawRedOverlay()
{
    ctx.fillStyle = "#700a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGreenOverlay()
{
    ctx.fillStyle = "#0a700a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

class GameObject
{
    constructor(posX, posY)
    {
        GameObject.AllGameObjects.push(this);

        this.position = [posX, posY];
        this.direction = [1, 0];
        this.speed = 0;
    }

    Destroy()
    {
        for (let i = 0; i < GameObject.AllGameObjects.length; ++i)
        {
            if (GameObject.AllGameObjects[i] === this)
            {
                GameObject.AllGameObjects.splice(i, 1);
                break;
            }
        }
    }

    Update(dt)
    {

    }

    Draw()
    {

    }
}
GameObject.AllGameObjects = [];

class Snake extends GameObject
{
    constructor(posX, posY)
    {
        super(posX, posY);

        this.speed = 100;
        this.tailDistance = 1;
        this.width = 6;

        this.length = 1;
        this.tails = [[posX, posY]];

        this.AddTails(initialLength);
    }

    Update(dt)
    {
        this.UpdatePosition(dt);
        this.UpdateTails(dt);
    }

    Draw()
    {
        ctx.strokeStyle = '#6997F4';
        ctx.lineWidth = this.width;

        // The head
        ctx.arc(this.tails[0][0], this.tails[0][1], this.width * 0.6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.moveTo(this.tails[0][0], this.tails[0][1]);
        for (let i = 1; i < this.length; ++i)
        {
            if (i % 5 == 0 && ctx.lineWidth > 2)
                ctx.lineWidth--;

            ctx.lineTo(this.tails[i][0], this.tails[i][1]);
            ctx.stroke();
        }

    }

    UpdatePosition(dt)
    {
        let updateParam = this.speed * boostSpeedMultiplier * dt;
        this.position[0] = this.position[0] + this.direction[0] * updateParam;
        this.position[1] = this.position[1] + this.direction[1] * updateParam;

        this.tails[0] = this.position;
    }

    UpdateTails(dt)
    {
        for (let i = 1; i < this.length; ++i)
        {
            let thisTail = this.tails[i];
            let nextTail = this.tails[i - 1];
                
            let mag = distance(thisTail, nextTail);

            if (mag < 0.1)
                continue;

            let dir = [(nextTail[0] - thisTail[0]) / mag, (nextTail[1] - thisTail[1]) / mag];

            if (mag < this.tailDistance)
            {
                continue;
            }
            else
            {
                thisTail[0] = nextTail[0] - dir[0] * this.tailDistance * 2;
                thisTail[1] = nextTail[1] - dir[1] * this.tailDistance * 2;
            }
        }
    }

    AddTail()
    {
        let lastTail = this.tails[this.length - 1];
        this.length++;
        this.tails.push([lastTail[0], lastTail[1]]);
    }

    AddTails(numberOfTails)
    {
        for (let i = 0; i < numberOfTails; ++i)
        {
            this.AddTail();
        }
    }

    RemoveTails(numberOfTails)
    {
        if (numberOfTails > 0)
        {
            this.tails.splice(this.length - numberOfTails, numberOfTails);
            this.length -= numberOfTails;
        }
    }
}

class Food extends GameObject
{
    constructor()
    {
        super(Math.random() * canvas.width, Math.random() * canvas.height);

        this.size = 10;
        this.value = 10;
        this.color = "#12f812";
    }

    Update(dt)
    {
        this.size = 10 + 2 * Math.sin(totalElapsedTime * 4);

        if (distance(player.position, this.position) < this.size + 3)
            this.Consume();
    }

    Draw()
    {
        ctx.lineWidth = 1;
        ctx.fillStyle = this.color;
        ctx.arc(this.position[0], this.position[1], this.size, 0, Math.PI * 2, false);

        ctx.fill();
    }

    Consume()
    {
        numberOfFoodsEaten++;

        if (numberOfFoodsEaten % greatFoodSpawnRate == 0)
            greatFood = new GreatFood();

        player.AddTails(this.value);
        updateScore();
        player.speed += this.value * 0.7;
        this.Destroy();
        food = new Food();
    }
}

class GreatFood extends Food
{
    constructor()
    {
        super(Math.random() * canvas.width, Math.random() * canvas.height);

        this.size = 40;
        this.value = 40;
        this.color = "yellow";
        this.decayTime = 4;
    }

    Update(dt)
    {
        this.decayTime -= dt;
        if (this.decayTime <= 0)
            this.Destroy();

        this.size -= this.size * 0.3 * dt;

        if (distance(player.position, this.position) < this.size + 3)
            this.Consume();
    }

    Consume()
    {
        player.AddTails(this.value);
        updateScore();
        player.speed += this.value * 1;
        this.Destroy();
        drawGreenOverlay();
    }
}

function GameLoop(currentTime)
{
    if (gameOver)
        return;

    animationId = requestAnimationFrame(GameLoop);
    gameUpdate();
    gameDraw();

    // Handle timming
    if (!startingTime) { startingTime = currentTime; }
    if (!lastTime) { lastTime = currentTime; }
    totalElapsedTime = (currentTime - startingTime) / 1000.0;
    elapsedSinceLastLoop = (currentTime - lastTime) / 1000.0;
    lastTime = currentTime;
}

function start()
{
    GameObject.AllGameObjects = [];
    food = new Food(100, 100);
    player = new Snake(0, 30);

    startingTime = 0;
    lastTime = 0;
    totalElapsedTime = 0;
    elapsedSinceLastLoop = 0;
    gameOver = false;

    updateScore();
    animationId = requestAnimationFrame(GameLoop);
}

function end()
{
    drawRedOverlay();
    updateScore();
    cancelAnimationFrame(animationId);

    highestScoreEl.innerHTML = highestScore;

    modalEl.style.display = "flex";
}

function checkEndGame()
{
    for (let i = 10; i < player.length; ++i)
    {
        let dis = distance(player.position, player.tails[i]);

        if (dis < 1.5)
        {
            player.RemoveTails(player.length - i);
            gameOver = true;
            break;
        }
    }

    if (player.position[0] < 0 || player.position[0] > canvas.width - 1
     || player.position[1] < 0 || player.position[1] > canvas.height - 1)
        gameOver = true;

    if (gameOver)
        end();
}

function gameUpdate()
{
    for (let i = 0; i < GameObject.AllGameObjects.length; ++i)
    {
        let obj = GameObject.AllGameObjects[i];

        obj.Update(elapsedSinceLastLoop);
    }

    if (totalElapsedTime > 3)
    {
        checkEndGame();
    }
}

function gameDraw()
{
    // Clear screen
    ctx.fillStyle = "rgba(0.017, 0.017, 0.017, 0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw objects
    for (let i = 0; i < GameObject.AllGameObjects.length; ++i)
    {
        let obj = GameObject.AllGameObjects[i];

        ctx.beginPath();
        obj.Draw();
        ctx.closePath();
    }
}

window.addEventListener("keydown", function (e)
{
    if (e.keyCode === 38 /* up */ || e.keyCode === 87 /* w */)
    {
        if (player.direction[1] != 1)
            player.direction = [0, -1];
    }
    else if (e.keyCode === 39 /* right */ || e.keyCode === 68 /* d */)
    {
        if (player.direction[0] != -1)
            player.direction = [1, 0];
    }
    else if (e.keyCode === 40 /* down */ || e.keyCode === 83 /* s */)
    {
        if (player.direction[1] != -1)
            player.direction = [0, 1];
    }
    else if (e.keyCode === 37 /* left */ || e.keyCode === 65 /* a */)
    {
        if (player.direction[0] != 1)
            player.direction = [-1, 0];
    }
    else if (e.shiftKey)
    {
        boostSpeedMultiplier = maxBoostSpeedMultiplier;
    }
});

window.addEventListener("keyup", function (e)
{
    if (!e.shiftKey)
    {
        boostSpeedMultiplier = 1;
    }
});

onresize = () =>
{
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    drawRedOverlay();
    gameDraw();
}

startGameBtn.addEventListener("click", () =>
{
    modalEl.style.display = "none";
    start();
});

function main()
{
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    var parentStyle = canvas.parentElement.style;
    parentStyle.textAlign = "center";
    parentStyle.width = "100%";

    gameDraw();
}

main();