const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");


let pause = false;
let player;
let food;
let startingTime= 0;
let lastTime = 0;
let totalElapsedTime = 0;
let elapsedSinceLastLoop = 0;

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

class Snake extends GameObject
{
    constructor(posX, posY)
    {
        super(posX, posY);

        this.speed = 60;
        this.tailDistance = 3;
        this.width = 6;

        this.length = 1;
        this.tails = [[posX, posY]];

        this.AddTails(30);
    }

    Update(dt)
    {
        this.UpdatePosition(dt);
        this.UpdateTails(dt);
    }

    Draw()
    {
        ctx.strokeStyle = '#f13f13';
        ctx.lineWidth = this.width;
        for (let i = 1; i < this.length; ++i)
        {
            if (i % 5 == 0 && ctx.lineWidth > 2)
                ctx.lineWidth--;

            ctx.moveTo(this.tails[i - 1][0], this.tails[i - 1][1]);
            
            ctx.lineTo(this.tails[i][0], this.tails[i][1]);
            ctx.stroke();
        }

    }

    UpdatePosition(dt)
    {
        let updateParam = this.speed * dt;
        this.position[0] = this.position[0] + this.direction[0] * updateParam;
        this.position[1] = this.position[1] + this.direction[1] * updateParam;

        this.tails[0] = this.position;
    }

    UpdateTails(dt)
    {
        for (let i = 0; i < this.length - 1; ++i)
        {
            let thisTail = this.tails[i];
            let nextTail = this.tails[i + 1];
                
            let mag = distance(thisTail, nextTail);

            if (mag < this.tailDistance)
                continue;

            let dir = [thisTail[0] - nextTail[0], thisTail[1] - nextTail[1]];

            nextTail[0] += dir[0] * mag * dt;
            nextTail[1] += dir[1] * mag * dt;
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
        this.tails.splice(this.length - numberOfTails, numberOfTails);
        this.length -= numberOfTails;
    }
}

class Food extends GameObject
{
    constructor()
    {
        super(Math.random() * canvas.width, Math.random() * canvas.height);

        this.size = 10;
        this.value = 5;
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
        ctx.fillStyle = "#12f812";
        ctx.arc(this.position[0], this.position[1], this.size, 0, Math.PI * 2, false);

        ctx.fill();
    }

    Consume()
    {
        player.AddTails(this.value);
        player.speed += this.value * 2;
        this.Destroy();
        food = new Food();
    }
}

function run(currentTime)
{
    gameUpdate();
    gameDraw();

    // Handle timming
    if (!startingTime) { startingTime = currentTime; }
    if (!lastTime) { lastTime = currentTime; }
    totalElapsedTime = (currentTime - startingTime) / 1000.0;
    elapsedSinceLastLoop = (currentTime - lastTime) / 1000.0;
    lastTime = currentTime;
    requestAnimationFrame(run);
}

function gameUpdate()
{
    for (let i = 0; i < GameObject.AllGameObjects.length; ++i)
    {
        let obj = GameObject.AllGameObjects[i];

        obj.Update(elapsedSinceLastLoop);
    }

    if (totalElapsedTime > 3)
        for (let i = 10; i < player.length; ++i)
        {
            let dis = distance(player.position, player.tails[i]);

            if (dis < player.width)
            {
                player.RemoveTails(player.length - i)
                break;
            }
        }
}

function gameDraw()
{
    ctx.fillStyle = "grey";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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
    if (e.defaultPrevented)
        return;

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

    e.preventDefault();
}, true);

main();
function main()
{
    canvas.height = canvas.width = 500;
    var parentStyle = canvas.parentElement.style;
    parentStyle.textAlign = "center";
    parentStyle.width = "100%";

    // Construction
    food = new Food(100, 100);
    player = new Snake(0, 30);

    requestAnimationFrame(run);
}