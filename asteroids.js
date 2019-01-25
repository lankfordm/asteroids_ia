window.onload = initAll;
const FPS = 30; 
const size = 30;
const tspeed = 360; //turn speed in degrees per second
const sthrust = 5;
const FRICTION = 0.5;
const roidsize = 100; 
const roidspeed = 50;
const roidnum = 3;
const roidvert = 10; // average number of vertices on each asteroid
const shipinvis = 3;
const show_bounding = false; // shows that circle thingy
const ship_explode_duration = 0.3; //duration of the ship explosion!
const ship_blink_duration = 0.1; //blink duration
const laser_max = 10; //maximum number of lasers on the screen
const laser_speed = 500; // speed of laser in pixels per second
const ldist = 0.6; //max distance laser can travel as fraction of screen width
const text_size = 30; // tdxt font size zin pixels
const text_fade_time = 2.5;
const game_lives = 3; // number of game lives
const roid_pts_large = 20;
const roids_pts_med = 50;
const roids_pts_small = 100;

var turns = 3;

var interval;
var canvas;
var ctx;

var num1, num2, ans;

var answers = [];

num1 = Math.ceil(Math.random() * 15);
num2 = Math.ceil(Math.random() * 20);
ans = ((0)*(num2)) + (0.5*(num1)*Math.pow(num2, 2));

answers[0] = ans;
answers[1] = Math.floor((num1 * num1) / num2);
answers[2] = Math.floor(num1 + (num2 * num1));
answers[3] = Math.floor((num2 + num1) / 2);

function resetNums()
{
    num1 = Math.ceil(Math.random() * 15);
    num2 = Math.ceil(Math.random() * 20);
    ans = ((0)*(num2)) + (0.5*(num1)*Math.pow(num2, 2));


    answers[0] = ans;
    answers[1] = (num1 * num1) / num2;
    answers[2] = Math.ceil(num1 + (num2 * num1));
    answers[3] = Math.ceil((num2 + num1) / 2);
}

var aGuess = false;
var bGuess = false;
var cGuess = false; 
var dGuess = false;
var response;

var randomAnswer1 = Math.floor(Math.random()*4);
var randomAnswer2 = Math.floor(Math.random()*4);
while(randomAnswer2 == randomAnswer1)
{
    randomAnswer2 =  Math.floor(Math.random()*4);
}
var randomAnswer3 = Math.floor(Math.random()*4);
while(randomAnswer3 == randomAnswer2 || randomAnswer3 == randomAnswer1)
{
    randomAnswer3 =  Math.floor(Math.random()*4);
}
var randomAnswer4 = Math.floor(Math.random()*4);
while(randomAnswer4 == randomAnswer3 || randomAnswer4 == randomAnswer2 || randomAnswer4 == randomAnswer1)
{
    randomAnswer4 =  Math.floor(Math.random()*4);
}

var fxLaser, fxExplode, fxBigHit, fxMedHit, fxSmallHit, fxThrust;

//set up game parameters
var level, lives, roids, ship, text, textAlpha, score;

roids = [];

//game loop
interval = setInterval(game, 1000 / FPS);

function initAll()
{
    //event listener
    document.addEventListener("keydown", keyDown, false);
    document.addEventListener("keyup", keyUp,false);
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    fxLaser = new Sound("fire.wav", 5);
    fxExplode = new Sound("Explosion+1.wav");
    fxBigHit = new Sound("bangLarge.wav", 5);
    fxMedHit = new Sound("bangMedium.wav", 5);
    fxSmallHit = new Sound("bangSmall.wav", 5);
    fxThrust = new Sound("thrust.wav");
    newGame();
}

function startScreen()
{
    ctx.fillStyle = "#ffffff";
    ctx.font = "30 px Courier";
    ctx.fillText("Asteroids!", 350, 150);
    ctx.fillText("Press space to coninue", 350, 450);
}

function newGame()
{
    lives = game_lives;
    level = 0;
    score = 0;
    newShip();
    game();
    newLevel();
}

function newLevel()
{
    text = "Level " + (level +1);
    textAlpha = 1.0;
    createAsteroidBelt();
}

function newShip()
{
    ship = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        r: size / 2,
        a: 90 / 180 * Math.PI,  //(converted to radians)
        rot: 0,
        blinkNum: shipinvis / ship_blink_duration,
        blinkTime: ship_blink_duration * FPS,
        explodeTime: 0,
        canShoot: true,
        dead: false,
        lasers: [], 
        thrusting: false,
        thrust: {
                x: 0,
                y: 0
            }
    }
    return ship;
}

function shootLaser()
{
    //create  object
    if(ship.canShoot && ship.lasers.length < laser_max)
    {
        ship.lasers.push({ // from nose of ship
            x: ship.x + 4/3 * ship.r * Math.cos(ship.a),
            y: ship.y - 4/3 * ship.r * Math.sin(ship.a),
            xv: laser_speed * Math.cos(ship.a) / FPS,
            yv: -laser_speed * Math.sin(ship.a) / FPS,
            dist: 0
        })
        fxLaser.play();
    }

    //prevent futher shooting
    ship.canShoot = false;
}

function createAsteroidBelt() 
{
    roids = [];
    var x, y;
    for (var i = 0; i < roidnum + level; i++) 
    {
        do
        {
            x = Math.floor(Math.random() * canvas.width);
            y = Math.floor(Math.random() * canvas.height);
        }while(distanceBetweenPoints(ship.x, ship.y, x, y) < roidsize * 2 + ship.r)
        roids.push(newAsteroid(x, y, Math.ceil(roidsize /2)));
    }
}

function distanceBetweenPoints(x1, y1, x2, y2) 
{
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function drawShip(x, y, a)
{
        ctx.strokeStyle = "white",
        ctx.lineWidth = size / 20;
        ctx.beginPath();
        ctx.moveTo( //nose of ship
            x + 4/3 * ship.r * Math.cos(a),
            y - 4/3 * ship.r * Math.sin(a),
            );
        ctx.lineTo( //rear left of ship
            x - ship.r * (2/3 * Math.cos(a) + Math.sin(a)),
            y + ship.r * (2/3 * Math.sin(a) - Math.cos(a))
            );
        ctx.lineTo( //rear right of ship
            x - ship.r * (2/3 * Math.cos(a) -  Math.sin(a)),
            y + ship.r * (2/3 * Math.sin(a) + Math.cos(a))
            );
        ctx.closePath();
        ctx.stroke(); 
}

function newAsteroid(x, y, r) 
{
    var lvlMult = 1 + 0.1 * level;
    var cx;
    var cy;
    if((Math.random() < 0.5))
    {
        cx = 1;
        cy = 1;
    } 
    else
    {
        cx = -1;
        cy = -1;
    }

    var roid = {
        a: Math.random() * Math.PI * 2, // in radians
        r: r,
        vert: Math.floor(Math.random() * (roidvert + 1) + roidvert / 2),
        x: x,
        y: y,
        xv: Math.random() * roidspeed * lvlMult / FPS * cx,
        yv: Math.random() * roidspeed * lvlMult / FPS * cy
    }; 
    return roid;
}

function destroyAsteroid(i)
{
    var x = roids[i].x;
    var y = roids[i].y;
    var r = roids[i].r;

    //split asteroid in 2

    if(r == Math.ceil(roidsize /2))
    {
        roids.push(newAsteroid(x, y, Math.ceil(roidsize /4)))
        roids.push(newAsteroid(x, y, Math.ceil(roidsize /4)))
        score += roid_pts_large;
        fxBigHit.play();
    }else if (r == Math.ceil(roidsize /4))
    {
        roids.push(newAsteroid(x, y, Math.ceil(roidsize /8)))
        roids.push(newAsteroid(x, y, Math.ceil(roidsize /8)))
        score += roids_pts_med;
        fxMedHit.play();
    }else{
         score+= roids_pts_small;
         fxSmallHit.play();
    }

    //destroy asteroid

    roids.splice(i,1);
    //new level when no more asteroids

    if(roids.length == 0)
    {
        level++;
        newLevel();
    }
}

function keyDown( /** @type {KeyboardEvent} */ ev)
{
    if(ship.dead)
    {
        return;
    }
    switch(ev.keyCode)
    {
        case 32: //spacebar
            shootLaser();
            break;
        case 65:
            aGuess = true;
            break;
        case 66:
            bGuess = true;
            break;
        case 67:
            cGuess = true;
            break;
        case 68:
            dGuess = true;
            break;
        case 37: //left rotation
            ship.rot = tspeed / 180 * Math.PI / FPS;
            break;
        case 38: // up thrust
            ship.thrusting = true;
            break;
        case 39: // right rotation
            ship.rot = -tspeed / 180 * Math.PI / FPS;
            break;
    }
}

function keyUp(/** @type {KeyboardEvent} */ ev)
{
    if(ship.dead)
    {
        return;
    }
    switch(ev.keyCode)
    {
        case 32: //spacebar (allow shooting again)
        ship.canShoot = true;
        break;
        case 65:
        aGuess = false;
        break;
        case 66:
        bGuess = false;
        break;
        case 67:
        cGuess = false;
        break;
        case 68:
        dGuess = false;
        break;
        case 37: //stop left rotation
            ship.rot = 0;
            break;
        case 38: // stop up thrust
            ship.thrusting = false;
            break;
        case 39: // stop right rotation
            ship.rot = 0;
            break;
    }
}
function game()
{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    update();
}

function Sound(src, maxStreams = 1)
{
    this.streamNum = 0;
    this.streams = [];
    for(var i = 0; i<maxStreams; i++)
    {
        this.streams.push(new Audio(src));
    }
    this.play = function()
    {
        this.streamNum = (this.streamNum + 1) % maxStreams;
        this.streams[this.streamNum].play();
    }
}
function update()
{

    var blinkOn = ship.blinkNum % 2 == 0
    var exploding = ship.explodeTime > 0;
    //ship
    if(!exploding)
    {
        if(blinkOn && !ship.dead)
        {
            drawShip(ship.x, ship.y, ship.a);
        }
        if (ship.blinkNum > 0) 
        {
            // reduce the blink time
            ship.blinkTime--;
            // reduce the blink num
            if (ship.blinkTime == 0) 
            {
                ship.blinkTime = Math.ceil(ship_blink_duration * FPS);
                ship.blinkNum--;
            }
        }
    }else
    {
        //draw explosions
        ctx.fillStyle = "darkred";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.5, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false);
        ctx.fill();
    }
    

    if (show_bounding) 
    {
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
        ctx.stroke();
    }

    //draw lasers

    for(var i = 0; i < ship.lasers.length; i++)
    {
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(ship.lasers[i].x, ship.lasers[i].y, size / 15, 0, Math.PI *2, false,);
        ctx.fill();

    }

    //draw game text

    if(textAlpha>=0)
    {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rbga(255,255,255 " + textAlpha + ")";
        ctx.font = "small-caps " + text_size + "px dejavu sans mono";
        ctx.fillText(text, canvas.width/3.3, canvas.height * 0.055);
        textAlpha += (1.0 / text_fade_time / FPS);
    }

    //draw lives!

    for(var i = 0; i<lives; i++)
    {
        drawShip(size + i * size * 1.2, size, 0.5 * Math.PI);
    }

    //draw score

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.font = text_size + "px dejavu sans mono";
    ctx.fillText(score, canvas.width - size/2, size);

    //detect laser hits on asteroids

    var ax, ay, ar, lx, ly;
    for(var i = roids.length-1; i>=0; i--)
    {
        ax = roids[i].x;
        ar = roids[i].r;
        ay = roids[i].y;

        for(var j = ship.lasers.length-1; j>=0; j--)
        {
            lx = ship.lasers[j].x;
            ly = ship.lasers[j].y;

            if(distanceBetweenPoints(ax, ay, lx, ly)< ar)
            {
                //remove laser
                ship.lasers.splice(j, 1);

                //remove asteroid
                destroyAsteroid(i);

                break;
            }
        }

    }

    // center dot
    if(!ship.dead)
    {
        ctx.fillStyle = "red";
        ctx.fillRect(ship.x-1, ship.y -1, 2, 2);
    }    


    //draw asteroid
    ctx.strokeStyle = "slategrey";
    ctx.lineWidth = ship / 20;
    var a, r, x, y, vert;
    for (var i = 0; i < roids.length; i++) 
    {
        ctx.strokeStyle = "slategrey";
        ctx.lineWidth = ship / 20;
        // get the asteroid properties
        a = roids[i].a;
        r = roids[i].r;
        x = roids[i].x;
        y = roids[i].y;
        vert = roids[i].vert;

        // draw the path
        ctx.beginPath();
        ctx.moveTo(
            x + r * Math.cos(a),
            y + r * Math.sin(a)
            );

        // draw the polygon
            for (var j = 1; j < vert; j++) 
            {
            ctx.lineTo(
                    x + r * Math.cos(a + j * Math.PI * 2 / vert),
                    y + r * Math.sin(a + j * Math.PI * 2 / vert)
                );
            }
            ctx.closePath();
            ctx.stroke();
            if (show_bounding) 
            {
                ctx.strokeStyle = "lime";
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2, false);
                ctx.stroke();
            }
        }
    if (ship.thrusting && !ship.dead) 
    {
        ship.thrust.x += sthrust * Math.cos(ship.a) / FPS;
        ship.thrust.y -= sthrust * Math.sin(ship.a) / FPS;
        fxThrust.play();
    }else
    {
        //apply friction when not thrusting
        ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
        ship.thrust.y -+ FRICTION * ship.thrust.y / FPS;
    }

    if(!exploding)
    {
        //check for collision
        if (ship.blinkNum == 0 && !ship.dead)
        {
            for(var i =0; i<roids.length; i++)
            {
               if(distanceBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y) < ship.r + roids[i].r)
              {
                  explodeShip();
                  destroyAsteroid(i);
                  break;
              }
          }
        }
        // rotate the ship
        ship.a += ship.rot;

        // move the ship
        ship.x += ship.thrust.x;
        ship.y += ship.thrust.y;

    }else{
        ship.explodeTime --;
        
        if(ship.explodeTime == 0)
        {
            lives--;
            if(lives == 0)
            {
                gameOver();
            }else{
                ship = newShip();
            }
        }
    }

    //move the laser

    for(var i = ship.lasers.length-1; i>=0; i--)
    {
        //check distance travelled
        if(ship.lasers[i].dist>ldist * canvas.width)
        {
            ship.lasers.splice(i, 1);
            continue;
        }

        //move the laser
        ship.lasers[i].x += ship.lasers[i].xv;
        ship.lasers[i].y += ship.lasers[i].yv;

        //calculate distance traveled
        ship.lasers[i].dist+= Math.sqrt(Math.pow(ship.lasers[i].xv,2) + Math.pow(ship.lasers[i].yv,2));




        // handle off of screen
        if(ship.lasers[i].x < 0)
        {
            ship.lasers[i].x = canvas.width;
        }else if(ship.lasers[i].x>canvas.width)
        {
            ship.lasers[i].x = 0;
        }
        if(ship.lasers[i].y < 0)
        {
            ship.lasers[i].y = canvas.height;
        }else if(ship.lasers[i].y>canvas.height)
        {
            ship.lasers[i].y = 0;
        }
    }
    
    if (ship.x < 0 - ship.r) 
    {
        ship.x = canvas.width + ship.r;
    } else if (ship.x > canvas.width + ship.r) 
    {
        ship.x = 0 - ship.r;
    }
    if (ship.y < 0 - ship.r) 
    {
        ship.y = canvas.height + ship.r;
    } else if (ship.y > canvas.height + ship.r) 
    {
        ship.y = 0 - ship.r;
    }
    for(var i =0; i<roids.length; i++)
    {
        // move the asteroid
        roids[i].x += roids[i].xv;
        roids[i].y += roids[i].yv;

        // handle asteroid edge of screen
        if (roids[i].x < 0 - roids[i].r) 
        {
        roids[i].x = canvas.width + roids[i].r;
        } else if (roids[i].x > canvas.width + roids[i].r) 
        {
        roids[i].x = 0 - roids[i].r
        }
        if (roids[i].y < 0 - roids[i].r) 
        {
        roids[i].y = canvas.height + roids[i].r;
        } else if (roids[i].y > canvas.height + roids[i].r) 
        {
        roids[i].y = 0 - roids[i].r
        }         
    }
}
function explodeShip()
{
    /*ctx.strokeStyle = "blue";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.stroke();*/
    ship.explodeTime = Math.ceil(ship_explode_duration * FPS);
    fxExplode.play();
    if(turns>=0)
    {
        //question();
        clearInterval(interval);
        interval = setInterval(setQuestion, FPS)
    }
}
function gameOver()
{
    ship.dead = true;
    text = "GAME OVER";
    textAlpha = 1.0;
}
/*function question()
{
    clearInterval(interval);
    interval = setInterval(setQuestion, FPS);
    //setQuestion();
}*/
function setQuestion()
{
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0,0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffffff";
    ctx.font = "2 px Impact";
    generate1();
    generate();
    Guess();
}
function generate1()
{
    
    while(randomAnswer2 == randomAnswer1)
    {
        randomAnswer2 =  Math.floor(Math.random()*4);
    }
    while(randomAnswer3 == randomAnswer2 || randomAnswer3 == randomAnswer1)
    {
        randomAnswer3 =  Math.floor(Math.random()*4);
    }
    while(randomAnswer4 == randomAnswer3 || randomAnswer4 == randomAnswer2 || randomAnswer4 == randomAnswer1)
    {
        randomAnswer4 =  Math.floor(Math.random()*4);
    }
}
function generate()
{
    var question = "An object travels at " + num1 + " m/s^2 for " + num2 + " seconds until it lifts off the ground.";
    ctx.fillStyle = "#ffffff";
    ctx.font = "15px Courier";
    ctx.fillText(question, 675, 100);
    ctx.fillText("Determine the distance traveled before takeoff", 575, 150);
    ctx.fillText("a) " + answers[randomAnswer1], 300, 200);
    ctx.fillText("b) " + answers[randomAnswer2], 300, 220);
    ctx.fillText("c) " + answers[randomAnswer3], 300, 240);
    ctx.fillText("d) " + answers[randomAnswer4], 300, 260);
}
function Guess()
{
    if(aGuess == true)
    {
        if(answers[randomAnswer1] == answers[0])
        {
            response = true;
        }
        else
        {
            response = false;
        }
    }
    if(bGuess == true)
    {
        if(answers[randomAnswer2] == answers[0])
        {
            response = true;
        }
        else
        {
            response = false;
        }
    }
    if(cGuess == true)
    {
        if(answers[randomAnswer3] == answers[0])
        {
            response = true;
        }
        else
        {
            response = false;
        }
    }
    if(dGuess == true)
    {
        if(answers[randomAnswer4] == answers[0])
        {
            response = true;
        }
        else
        {
            response = false;
        }
    }
    if(response == true)
    {
        clearInterval(interval);
        interval = setInterval(game, 1000 / FPS);
        lives++;
        aGuess = false;
        bGuess = false;
        cGuess = false;
        dGuess = false;
        response = null;
        resetNums();
    }
    if(response == false)
    {
        clearInterval(interval);
        interval = setInterval(game, 1000 / FPS);
        aGuess = false;
        bGuess = false;
        cGuess = false;
        dGuess = false;
        response = null;
        resetNums();
    }
}