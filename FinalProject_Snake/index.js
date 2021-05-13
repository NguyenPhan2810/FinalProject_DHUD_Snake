const canvas = document.querySelector("canvas");
const cxt = canvas.getContext("2d");

main();
function main()
{
    fitCanvas();

    // Construction
    var Player = new GameObject(30, 30);

    // Main loop
    while (true)
    {
        gameUpdate();
    }
}

function fitCanvas() 
{
    canvas.height = canvas.width = innerHeight;
}

function gameUpdate(){

    for (obj in GameObject.AllGameObjects)
    {
        obj.Update();
    }
}

window.addEventListener("keydown", function (e)
{
    if (e.defaultPrevented)
        return;

    if (e.keyCode === 38 /* up */ || e.keyCode === 87 /* w */)
    {
        console.log("up");
    }
    else if (e.keyCode === 39 /* right */ || e.keyCode === 68 /* d */)
    {
        console.log("right");
    }
    else if (e.keyCode === 40 /* down */ || e.keyCode === 83 /* s */)
    {
        console.log("down");
    }
    else if (e.keyCode === 37 /* left */ || e.keyCode === 65 /* a */)
    {
        console.log("left");
    }

    e.preventDefault();
}, true);


class GameObject
{
    constructor(posX, posY)
    {
        this.posX = posX;
        this.posy = posY;

        GameObject.AllGameObjects = [];
        AllGameObjects.push(this);
    }

    Update()
    {
        console.log(posX);
    }
}