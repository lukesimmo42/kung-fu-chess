const timeBetweenMoves = 5000;

let connected = false;
let width;
let height;
let selectedX;
let selectedY;
let squareSelected = false;
let positions = new Array(7);
let spritesheet;
let message = "";
let playing = true;
let viewOfWhite;
let playingAsColor;
let AI;
let AI2;
let playingMultiplayer = false;
let recentlyClicked = false;

function preload() {
  spritesheet = loadImage("/static/chessSpriteBordered2.png");
}
const spriteWidth = 2000;
const spriteHeight = 660;

//Creates canvas with board div's height and width
function setup() {
  canvas = createCanvas(0,0);
  canvas.parent("board"); //Places the canvas inside the "board" div
  strokeWeight(1);
  resize();
}

//when window resized, keeps board square and as large as possible
function resize() {
    if(window.innerWidth/window.innerHeight > 4/3){
        document.getElementById("left").style.width = "20%";
        document.getElementById("middle").style.width = document.getElementById("middle").style.height;
        document.getElementById("left").style.visibility = "visible";
        document.getElementById("right").style.visibility = (100 - 20 - document.getElementById("middle").style.height) + "%";
    } else if (window.innerWidth/window.innerHeight > 1){
        document.getElementById("left").style.width = "20%";
        document.getElementById("middle").style.width = "80%";
        document.getElementById("left").style.visibility = "visible";
        document.getElementById("right").style.visibility = "hidden";
    } else{
        document.getElementById("middle").style.width = "100%";
        document.getElementById("left").style.visibility = "hidden";
        document.getElementById("right").style.visibility = "hidden";
    }
  //get height and width of the div the rectangular div that holds the board div
  const holderHeight = document.getElementById("boardHolder").offsetHeight;
  const holderWidth = document.getElementById("boardHolder").offsetWidth;
  //make width & height the smaller value
  if (holderHeight < holderWidth) {
    width = holderHeight;
    height = holderHeight;
  } else {
    width = holderWidth;
    height = holderWidth;
  }
  //make board div a square that fills as much of its container as possible
  document.getElementById("board").style.width = width;
  document.getElementById("board").style.height = height;

  //do the same with the image
  const imgheight = document.getElementById("imageHolder").offsetHeight;
  const imgwidth = document.getElementById("imageHolder").offsetWidth;
  if (imgheight < imgwidth) {
    document.getElementById("yingyang").style.width = imgheight;
  } else {
    document.getElementById("yingyang").style.width = imgwidth;
  }
  resizeCanvas(width, height);
}

//call the resize function whenever the window is resized
window.onresize = resize;

//randomly chooses and executes a legal move for the passed colour
function randomAI(color) {
  if (playing) {
    //all legal moves added here
    const moves = [];
    //used for converting the received moves to a more useful format
    let tempMoves = [];
    //do for all squares
    for (let j = 0; j < 8; j++) {
      for (let i = 0; i < 8; i++) {
        //if piece is the correct color and can move
        let piece = positions[i][j];
        if (typeof piece == "object" && piece.color === color && Date.now() - piece.lastMoved >= timeBetweenMoves) {
          //get it's moves (in the form newX,newY)
          tempMoves = piece.giveMoves();
          for (let a = 0; a < tempMoves.length; a++) {
            //add them to moves array (in the form oldX,oldY,newX,newY)
            moves.push( [i, j, tempMoves[a][0], tempMoves[a][1] ]);
          }
        }
      }
    }
    //each move is a group of 4 elements
    //randomly select from the first of each group and execute then get and execute the move which is stored in those 4 elements
    if (moves.length > 0) {
      let chosenMove = Math.floor(Math.random() * moves.length) ;
      move.call(positions[moves[chosenMove][0]][moves[chosenMove][1]],moves[chosenMove][2],moves[chosenMove][3]); //execute the move
    }
  }
}

//Draws chess board to fill canvas, will fill any rectangular canvas
function draw() { //for all squares...
  for (let j = 0; j < 8; j++) {//bottom to top
    for (let i = 0; i < 8; i++) {//left to right
      if (i % 2 !== j % 2) {
        fill(0, 0, 0);
      } else {
        fill(255, 255, 255);
      }
      stroke(0,0,0);
      rect((width - 1) / 8 * i, (height - 1) / 8 * j, width / 8, height / 8);
      //draw piece at current position in loop
      if (viewOfWhite === true) {
        let piece = positions[i][7-j];
        if (typeof piece != "undefined") {
          image(spritesheet,width/8*i,height/8*j,width/8,height/8 //position and size of destination
          ,spriteWidth/6*piece.type,spriteHeight/2*piece.color //top left corner of desired piece
          ,spriteWidth/6,spriteHeight/2); //size of section of source image
          //highlight square to show timer
          if (Date.now() - piece.lastMoved < timeBetweenMoves) {
            fill(127, 127, 127, 127);
            let highlightFraction = (1 - ((Date.now() - piece.lastMoved) / timeBetweenMoves));
            rect((width - 1) / 8 * i, (height - 1) / 8 * (j+1-highlightFraction), width / 8, height / 8 * highlightFraction);
          }
        }
      } else {
        let piece = positions[7-i][j];
        if (typeof piece != "undefined") {
          image(spritesheet,width/8*i,height/8*j,width/8,height/8 //position and size of destination
          ,spriteWidth/6*piece.type,spriteHeight/2*piece.color //top left corner of desired piece
          ,spriteWidth/6,spriteHeight/2); //size of section of source image
          //highlight square to show timer
          if (Date.now() - piece.lastMoved < timeBetweenMoves) {
            fill(127, 127, 127, 127);
            highlightFraction = (1 - ((Date.now() - piece.lastMoved) / timeBetweenMoves));
            rect((width - 1) / 8 * i, (height - 1) / 8 * (j+1-highlightFraction), width / 8, height / 8 * highlightFraction);
          }
        }
      }
    }
  }
  if (squareSelected === true) {
    fill(255, 255, 0, 125);
    if (viewOfWhite === true) {
      rect((width - 1) / 8 * selectedX, (height - 1) / 8 * (7-selectedY), width / 8, height / 8); //highlights selected square
    } else {
      rect((width - 1) / 8 * (7-selectedX), (height - 1) / 8 * selectedY, width / 8, height / 8); //highlights selected square
    }
    let piece = positions[selectedX][selectedY];
    if (typeof piece != "undefined" && playingAsColor === piece.color) {
      const moves = piece.giveMoves(); //get pieces moves
      for (let i = 0; i < moves.length; i ++) { //for each move
        mark(moves[i][0],moves[i][1]); //mark it
      }
    }
  }
  //if there's a message then display it
  if (message !== "") {
    displayMessage();
  }
}

function mousePressed() {
  if (recentlyClicked === false) {//needed to stop multiple mouse clicks being detected when the user clicks once
    if (message) {//if there is a message, remove it
      message = "";
    } else if (playing && mouseButton == LEFT && mouseX <= width && mouseX >= 0 && mouseY <= height && mouseY >= 0) {
      //otherwise if the user is playing and the click occured inside the board...
      let newX;
      let newY;
      if (viewOfWhite === true) {
        newX = parseInt(mouseX/width*8);
        newY = 7-parseInt(mouseY/height*8);
      } else {
        newX = 7-parseInt(mouseX/width*8);
        newY = parseInt(mouseY/height*8);
      }
      if (squareSelected === false) { //if no square selected, select new square
        selectedX = newX;
        selectedY = newY;
        squareSelected = true;
      } else if (newX === selectedX && newY === selectedY) { //else if selected square clicked, unselect it
        squareSelected = false;
      } else {
        let piece = positions[selectedX][selectedY];
        console.log(piece);
        if (typeof piece == 'undefined') { //if square selected is empty, select new square
          selectedX = newX;
          selectedY = newY;
          squareSelected = true;
        } else if (piece.color === playingAsColor && piece.canMoveTo(newX, newY, timeBetweenMoves)) {
          //so square must have a piece, if it can move to square do:
          console.log("move valid");
          squareSelected = false;
          if (playingMultiplayer === true) {
            socket.emit("move", selectedX, selectedY, newX, newY) //if playing online, send move to server
          } else {
            move.call(piece, newX, newY);
          }//otherwise, execute the move
        } else { //move not valid so select clicked on square
          console.log("move not valid");
          selectedX = newX;
          selectedY = newY;
          squareSelected = true;
        }
      }
    }
    //needed to only detect one click when the user clicks
    recentlyClicked = true;
    setTimeout(function(){recentlyClicked = false;},50);
  }
}

//draws a dot at the desired board coordinates dependant on the users view
function mark(x,y) {
  noStroke();
  fill(127, 127, 127, 150);
  if (viewOfWhite) {
    ellipse(width / 8 * x + width/16, height / 8 * (7-y) + height/16, width / 8 / 3, height / 8 / 3);
  } else {
    ellipse(width / 8 * (7-x) + width/16, height / 8 * y + height/16, width / 8 / 3, height / 8 / 3);
  }
}

//moves piece to passed coordinates
function move(newX, newY) {
  console.log("move",newX,newY);
  //if king taken, end game
  if (typeof positions[newX][newY] === "object" && positions[newX][newY].type === 0) {
    endGame(1-positions[newX][newY].color);
  }
  positions[newX][newY] = positions[this.location.x][this.location.y];
  positions[this.location.x][this.location.y] = undefined;
  this.location.x = newX;
  this.location.y = newY;
  //if pawn moved to end row, turn into a queen
  if (this.type === 5 && (newY === 0 || newY === 7)) { this.makeQueen(); }
  this.lastMoved = Date.now();
}

function endGame(color){
  playing = false;
  if (color === 0) { message = "White wins"; }
  else { message = "Black wins"; }
  //stop AI from playing
  clearInterval(AI);
  clearInterval(AI2);
}

//draws a box and writes whatever message contains inside it
function displayMessage() {
  noStroke;
  fill(255,255,255,127);
  rect(width/8*1.5,height/8*2.5,width/8*5,height/8*3);
  fill(0,0,0,127);
  textSize(32);
  text(message,width/8*1.5,height/8*2.5,width/8*5,height/8*3)
}

//io object is declared in the socket.io.js library referenced in header
//connect to the website
let socket = null;
try {
  socket = io.connect("http://127.0.0.1:8080/");

  socket.on('message', function (text) {
    message = text;
    console.log(message);
  });

  socket.on("match found", function (side) {
    console.log("match found");
    restart(side, "multiplayer");
  });
  connected = true;
} catch(err){
  console.log("can't connect")
}

//resets the game
function restart(side = "white",mode = "random AI versus random AI") {
  console.log("restart");
  //stops AI
  clearInterval(AI);
  clearInterval(AI2);
  //reset board
  positions = new Array(7);
  common.resetPieces(positions);

  if (playingMultiplayer === true) {
    playingMultiplayer = false;
    if (playing === true) {
      socket.emit("quit");
      playing = false;
    }
  }
  squareSelected = false;
  playing = true;
  message = "";
  if (mode === "random AI") {
    if (side === "white") {
      viewOfWhite = true;
      playingAsColor = 0;
      AI = setInterval(function(){randomAI(1)},500);//every 0.5 seconds a random black piece is moved
    } else if (side === "black") {
      viewOfWhite = false;
      playingAsColor = 1;
      AI = setInterval(function(){randomAI(0)},500);//every 0.5 seconds a random white piece is moved
    }
  } else if (mode === "random AI versus random AI") {
    AI = setInterval(function(){randomAI(0)},500);//every 0.5 seconds a random white piece is moved
    setTimeout(function () {
      AI2 = setInterval(function(){randomAI(1)},500);//every 0.5 seconds a random black piece is moved
    }, 250);
    viewOfWhite = (side !== "black");//if no side passed then it is assumed that white was desired
    playingAsColor = -1;
  } else if (mode === "multiplayer") {
    if (side === "white") {
      viewOfWhite = true;
      playingAsColor = 0;
    } else if (side === "black") {
      viewOfWhite = false;
      playingAsColor = 1;
    }
    socket.on("move", function(oldX,oldY,newX,newY){
      move.call(positions[oldX][oldY],newX,newY);
    });
    socket.on("game end", function(){
      playing = false;
      socket.removeAllListeners("game end");
      socket.removeAllListeners("move");
      console.log("game end");
    });
    playingMultiplayer = true;
  }
}

restart("white","random AI versus random AI");
