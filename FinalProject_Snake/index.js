var LA = require("linear-algebra")();

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");


let pause = false;
let player;

class GameObject
{
    constructor(posX, posY)
    {
        GameObject.AllGameObjects = [];
        GameObject.AllGameObjects.push(this);

        this.posX = posX;
        this.posY = posY;

        this.forward = LA.Vector;
    }

    Update()
    {
        
    }

    Draw()
    {
        ctx.arc(this.posX, this.posY, 30, 0, Math.PI * 2, false);
        ctx.lineWidth = 10;
        // line color
        ctx.strokeStyle = 'blue';
        ctx.stroke();
    }
}

main();
function main()
{
    canvas.height = canvas.width = 500;
    var parentStyle = canvas.parentElement.style;
    parentStyle.textAlign = "center";
    parentStyle.width = "100%";

    // Construction
    player = new GameObject(30, 30);

    run();
}

function run()
{
    gameUpdate();
    gameDraw();

    requestAnimationFrame(run);
}

function gameUpdate()
{
    for (let i = 0; i < GameObject.AllGameObjects.length; ++i)
    {
        let obj = GameObject.AllGameObjects[i];

        obj.Update();
    }
}

function gameDraw()
{
    ctx.beginPath();
    ctx.fillStyle = "grey";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < GameObject.AllGameObjects.length; ++i)
    {
        let obj = GameObject.AllGameObjects[i];

        obj.Draw();
    }
}

window.addEventListener("keydown", function (e)
{
    if (e.defaultPrevented)
        return;

    if (e.keyCode === 38 /* up */ || e.keyCode === 87 /* w */)
    {
        player.posY -= 1.7;
    }
    else if (e.keyCode === 39 /* right */ || e.keyCode === 68 /* d */)
    {
        player.posX += 1.7;
    }
    else if (e.keyCode === 40 /* down */ || e.keyCode === 83 /* s */)
    {
        player.posY += 1.7;
    }
    else if (e.keyCode === 37 /* left */ || e.keyCode === 65 /* a */)
    {
        player.posX -= 1.7;
    }

    e.preventDefault();
}, true);
