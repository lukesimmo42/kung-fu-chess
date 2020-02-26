const timeBetweenMoves = 5000;

var width;
var height;
var selectedX;
var selectedY;
var squareSelected = false;
var positions = new Array(7);
var spritesheet;
var message = "";
var playing = true;
var viewOfWhite;
var playingAsColor;
var AI;
var AI2;
var playingMultiplayer = false;
var recentlyClicked = false;

function preload() {
  spritesheet = loadImage("/static/chessSpriteBordered2.png");
}
const spriteWidth = 2000;
const spriteHeight = 660;

//Creates canvas with board div's height and width
function setup() {
  canvas = createCanvas();
  canvas.parent("board"); //Places the canvas inside the "board" div
  strokeWeight(1);
  resize();
}

//when window resized, keeps board square and as large as possible
function resize() {
    console.log(window.innerWidth)
    if(window.innerWidth/window.innerHeight > 4/3){
        document.getElementById("left").style.width = "20%"
        document.getElementById("middle").style.width = document.getElementById("middle").style.height
        document.getElementById("left").style.visibility = "visible"
        document.getElementById("right").style.visibility = (100 - 20 - document.getElementById("middle").style.height) + "%"
    } else if (window.innerWidth/window.innerHeight > 1){
        document.getElementById("left").style.width = "20%"
        document.getElementById("middle").style.width = "80%"
        document.getElementById("left").style.visibility = "visible"
        document.getElementById("right").style.visibility = "hidden"
    } else{
        document.getElementById("middle").style.width = "100%"
        document.getElementById("left").style.visibility = "hidden"
        document.getElementById("right").style.visibility = "hidden"
    }
  //get height and width of the div the rectangular div that holds the board div
  var holderHeight = document.getElementById("boardHolder").offsetHeight;
  var holderWidth = document.getElementById("boardHolder").offsetWidth;
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
  var imgheight = document.getElementById("imageHolder").offsetHeight;
  var imgwidth = document.getElementById("imageHolder").offsetWidth;
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
    var moves = [];
    //used for converting the received moves to a more useful format
    var temp = [];
    //do for all squares
    for (var j = 0; j < 8; j++) {
      for (var i = 0; i < 8; i++) {
        //if one of the color's pieces
        if (typeof positions[i][j] == "object" && positions[i][j].color == color && Date.now() - positions[i][j].lastMoved >= timeBetweenMoves) {
          //get it's moves (in the form newX,newY)
          temp=positions[i][j].giveMoves();
          for (var a = 0; a < temp.length; a +=2) {
            //add them to moves array (in the form oldX,oldY,newX,newY)
            moves.push(i,j,temp[a],temp[a+1]);
          }
        }
      }
    }
    //each move is a group of 4 elements
    //randomly select from the first of each group and execute then get and execute the move which is stored in those 4 elements
    if (moves.length > 0) {
      var chosenMove = Math.floor(Math.random() * moves.length / 4) * 4; //only want the start of each group so dvide by 4 then round then * 4 to find te correct position
      move.call(positions[moves[chosenMove]][moves[chosenMove+1]],moves[chosenMove+2],moves[chosenMove+3]); //execute the move
    }
  }
}

//Draws chess board to fill canvas, will also fill rectangular canvases
function draw() { //for all squares...
  for (var j = 0; j < 8; j++) {//bottom to top
    for (var i = 0; i < 8; i++) {//left to right
      if (i % 2 != j % 2) {
        fill(0, 0, 0);
      } else {
        fill(255, 255, 255);
      }
      stroke(0,0,0);
      rect((width - 1) / 8 * i, (height - 1) / 8 * j, width / 8, height / 8);
      //draw piece at current position in loop
      if (viewOfWhite == true) {
        if (typeof positions[i][7-j] != "undefined") {
          image(spritesheet,width/8*i,height/8*j,width/8,height/8 //position and size of destination
          ,spriteWidth/6*positions[i][7-j].type,spriteHeight/2*positions[i][7-j].color //top left corner of desired piece
          ,spriteWidth/6,spriteHeight/2); //size of section of source image
          //highlight square to show timer
          if (Date.now() - positions[i][7-j].lastMoved < timeBetweenMoves) {
            fill(127, 127, 127, 127);
            var highlightFraction = (1 - ((Date.now() - positions[i][7-j].lastMoved) / timeBetweenMoves));
            rect((width - 1) / 8 * i, (height - 1) / 8 * (j+1-highlightFraction), width / 8, height / 8 * highlightFraction);
          }
        }
      } else {
        if (typeof positions[7-i][j] != "undefined") {
          image(spritesheet,width/8*i,height/8*j,width/8,height/8 //position and size of destination
          ,spriteWidth/6*positions[7-i][j].type,spriteHeight/2*positions[7-i][j].color //top left corner of desired piece
          ,spriteWidth/6,spriteHeight/2); //size of section of source image
          //highlight square to show timer
          if (Date.now() - positions[7-i][j].lastMoved < timeBetweenMoves) {
            fill(127, 127, 127, 127);
            highlightFraction = (1 - ((Date.now() - positions[7-i][j].lastMoved) / timeBetweenMoves));
            rect((width - 1) / 8 * i, (height - 1) / 8 * (j+1-highlightFraction), width / 8, height / 8 * highlightFraction);
          }
        }
      }
    }
  }
  if (squareSelected == true) {
    fill(255, 255, 0, 125);
    if (viewOfWhite == true) {
      rect((width - 1) / 8 * selectedX, (height - 1) / 8 * (7-selectedY), width / 8, height / 8); //highlights selected square
    } else {
      rect((width - 1) / 8 * (7-selectedX), (height - 1) / 8 * selectedY, width / 8, height / 8); //highlights selected square
    }
    if (typeof positions[selectedX][selectedY] != "undefined") {
      var moves = positions[selectedX][selectedY].giveMoves(); //get pieces moves
      for (var i = 0; i < moves.length; i += 2) { //for each move
        mark(moves[i],moves[i+1]); //mark it
      }
    }
  }
  //if theres a message then display it
  if (message != "") {
    displayMessage();
  }
}

function mousePressed() {
  if (recentlyClicked == false) {//needed to stop multiple mouse clicks being detected when the user clicks once
    //if there is a message, remove it
    if (message) {
      message = "";
    } else if (playing && mouseButton == LEFT && mouseX <= width && mouseX >= 0 && mouseY <= height && mouseY >= 0) {
      //otherwise if the user is playing and the click occured inside the board...
      if (viewOfWhite == true) {
        var newX = parseInt(mouseX/width*8);
        var newY = 7-parseInt(mouseY/height*8);
      } else {
        newX = 7-parseInt(mouseX/width*8);
        newY = parseInt(mouseY/height*8);
      }
      if (squareSelected == false) { //if no square selected, select new square
        selectedX = newX;
        selectedY = newY;
        squareSelected = true;
      } else if (newX == selectedX && newY == selectedY) { //else if selected square clicked, unselect it
        squareSelected = false;
      } else if (typeof positions[selectedX][selectedY] == "undefined") { //if square selected is empty, select new square
        selectedX = newX;
        selectedY = newY;
        squareSelected = true;
      } else if(positions[selectedX][selectedY].color == playingAsColor && positions[selectedX][selectedY].moveTo(newX,newY) == true) {
        //so square must have a piece, try moving that piece to new square
        squareSelected = false;
        if (playingMultiplayer == true) { socket.emit("move",selectedX,selectedY,newX,newY) }//if playing online, send move to server
        else { move.call(positions[selectedX][selectedY],newX,newY); }//otherwise, execute the move
      } else { //move not legal so select clicked on square
        selectedX = newX;
        selectedY = newY;
        squareSelected = true;
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

//places pieces in the starting position
function resetPieces() {
  positions = new Array(7);
  for (var i = 0; i < 8; i++) {
    positions[i] = new Array(7);
    positions[i][1] = new pawn(0, i, 1);
    positions[i][6] = new pawn(1, i, 6);
  }
  for (var j = 0; j < 8; j+=7) {
    positions[0][j] = new rook(j/7, 0, j); //j/7 is 0 or 1
    positions[1][j] = new knight(j/7, 1, j);
    positions[2][j] = new bishop(j/7, 2, j);
    positions[3][j] = new queen(j/7, 3, j);
    positions[4][j] = new king(j/7, 4, j);
    positions[5][j] = new bishop(j/7, 5, j);
    positions[6][j] = new knight(j/7, 6, j);
    positions[7][j] = new rook(j/7, 7, j);
  }
}

//returns a value depending on what the passed square is
function checkSquare(x,y,col) {
  if (x < 8 && x > -1 && y < 8 && y > -1) {
    if (typeof positions[x][y] != "object") { return "empty"; }
    else if (positions[x][y].color != col) { return "enemy"; }
  }
  return false; //square has friendly piece
}

function king(color, x, y) {
  this.color = color;
  this.giveMoves = kingGiveMoves;
  this.moveTo = kingMoveTo;
  this.lastMoved = -10000000000;
  this.type = 0;
  this.locationX = x;
  this.locationY = y;
}
function kingGiveMoves(){
  var moves = [];
  //check 9 by 9 grid around king, add legal moves to the array
  for (var j = this.locationY-1; j <= this.locationY + 1; j++) {
    for (var i = this.locationX-1; i <= this.locationX + 1; i++) {
      if (checkSquare(i,j,this.color)) { moves.push(i,j); }
    }
  }
  return moves;
}
function kingMoveTo(newX,newY) {
  //is new square one away?
  if (Date.now() - this.lastMoved >= timeBetweenMoves && (newX == this.locationX -1 || newX == this.locationX || newX == this.locationX + 1) && (newY == this.locationY -1 || newY== this.locationY || newY == this.locationY + 1)) {
    //then move piece
    if (checkSquare(newX,newY,this.color)) { return true;}
  }
  return false;
}

function queen(color, x, y) {
  this.color = color;
  this.giveMoves = queenGiveMoves;
  this.moveTo = queenMoveTo;
  this.lastMoved = -10000000000;
  this.type = 1;
  this.locationX = x;
  this.locationY = y;
}
function queenGiveMoves(){
  var moves = [];
  //diagonal
  //up-right
  var i = this.locationX+1;
  var j = this.locationY+1;
  while (i <= 7 && j <= 7) {
    if (checkSquare(i,j,this.color) == "empty") {
      moves.push(i,j);
      i++;
      j++;
    } else {
      if (checkSquare(i,j,this.color) == "enemy") {
        moves.push(i,j);
      }
      i = 100;
      j = 100;
    }
  }
  //down-right
  i = this.locationX+1;
  j = this.locationY-1;
  while (i <= 7 && j >= 0) {
    if (checkSquare(i,j,this.color) == "empty") {
      moves.push(i,j);
      i++;
      j--;
    } else {
      if (checkSquare(i,j,this.color) == "enemy") {
        moves.push(i,j);
      }
      i = 100;
      j = -100;
    }
  }
  //down-left
  i = this.locationX-1;
  j = this.locationY-1;
  while (i >= 0 && j >= 0) {
    if (checkSquare(i,j,this.color) == "empty") {
      moves.push(i,j);
      i--;
      j--;
    } else {
      if (checkSquare(i,j,this.color) == "enemy") {
        moves.push(i,j);
      }
      i = -100;
      j = -100;
    }
  }
  //up-left
  i = this.locationX-1;
  j = this.locationY+1;
  while (i >= 0 && j <= 7) {
    if (checkSquare(i,j,this.color) == "empty") {
      moves.push(i,j);
      i--;
      j++;
    } else {
      if (checkSquare(i,j,this.color) == "enemy") {
        moves.push(i,j);
      }
      i = -100;
      j = 100;
    }
  }
  //horizontal/vertical
  //left
  i = this.locationX-1;
  while (i >= 0) {
    if (checkSquare(i,this.locationY,this.color) == "empty") {
      moves.push(i,this.locationY);
      i--;
    } else {
      if (checkSquare(i,this.locationY,this.color) == "enemy") {
        moves.push(i,this.locationY);
      }
      i = -100;
    }
  }
  //right
  i = this.locationX+1;
  while (i <= 7) {
    if (checkSquare(i,this.locationY,this.color) == "empty") {
      moves.push(i,this.locationY);
      i++;
    } else {
      if (checkSquare(i,this.locationY,this.color) == "enemy") {
        moves.push(i,this.locationY);
      }
      i = 100;
    }
  }
  //down
  i = this.locationY-1;
  while (i >= 0) {
    if (checkSquare(this.locationX,i,this.color) == "empty") {
      moves.push(this.locationX,i);
      i--;
    } else {
      if (checkSquare(this.locationX,i,this.color) == "enemy") {
        moves.push(this.locationX,i);
      }
      i = -100;
    }
  }
  //up
  i = this.locationY+1;
  while (i <= 7) {
    if (checkSquare(this.locationX,i,this.color) == "empty") {
      moves.push(this.locationX,i);
      i++;
    } else {
      if (checkSquare(this.locationX,i,this.color) == "enemy") {
        moves.push(this.locationX,i);
      }
      i = 100;
    }
  }
  return moves;
}
function queenMoveTo(newX,newY) {
  if (Date.now() - this.lastMoved >= timeBetweenMoves && checkSquare(newX,newY,this.color)) {
    var x = (newX > this.locationX) ? 1:-1;
    if (newX-this.locationX == newY-this.locationY) {
      for (var i = x; i != newX-this.locationX; i+=x) {
        if (checkSquare(this.locationX+i,this.locationY+i,this.color) != "empty") { return false}
      }
      return true;
    } else if (this.locationX-newX == newY-this.locationY) {
      for (var i = x; i != newX-this.locationX; i+=x) {
        if (checkSquare(this.locationX+i,this.locationY-i,this.color) != "empty") { return false}
      }
      return true;
    }
    if (checkSquare(newX,newY,this.color)) {
      if (newX == this.locationX) {
        //up
        if (newY > this.locationY) {
          for (var i = this.locationY + 1; i <= newY; i++) {
            if (i == newY) { return true; }
            else if (checkSquare(newX,i,this.color) != "empty") {i = 100}
          }
        //down
        } else {
          for (var i = this.locationY - 1; i >= newY; i--) {
            if (i == newY) { return true; }
            else if (checkSquare(newX,i,this.color) != "empty") {i = -100}
          }
        }
      } else if (newY == this.locationY) {
        //right
        if (newX > this.locationX) {
          for (var i = this.locationX + 1; i <= newX; i++) {
            if (i == newX) { return true; }
            else if (checkSquare(i,newY,this.color) != "empty") {i = 100}
          }
        //left
        } else {
          for (var i = this.locationX - 1; i >= newX; i--) {
            if (i == newX) { return true; }
            else if (checkSquare(i,newY,this.color) != "empty") {i = -100}
          }
        }
      }
    }
  }
  return false;
}

function bishop(color, x, y) {
  this.color = color;
  this.giveMoves = bishopGiveMoves;
  this.moveTo = bishopMoveTo;
  this.lastMoved = -10000000000;
  this.type = 2;
  this.locationX = x;
  this.locationY = y;
}
function bishopGiveMoves(){
  var moves = []
  //up-right
  var i = this.locationX+1;
  var j = this.locationY+1;
  while (i <= 7 && j <= 7) {
    if (checkSquare(i,j,this.color) == "empty") {
      moves.push(i,j);
      i++;
      j++;
    } else {
      if (checkSquare(i,j,this.color) == "enemy") {
        moves.push(i,j);
      }
      i = 100;
      j = 100;
    }
  }
  //down-right
  i = this.locationX+1;
  j = this.locationY-1;
  while (i <= 7 && j >= 0) {
    if (checkSquare(i,j,this.color) == "empty") {
      moves.push(i,j);
      i++;
      j--;
    } else {
      if (checkSquare(i,j,this.color) == "enemy") {
        moves.push(i,j);
      }
      i = 100;
      j = -100;
    }
  }
  //down-left
  i = this.locationX-1;
  j = this.locationY-1;
  while (i >= 0 && j >= 0) {
    if (checkSquare(i,j,this.color) == "empty") {
      moves.push(i,j);
      i--;
      j--;
    } else {
      if (checkSquare(i,j,this.color) == "enemy") {
        moves.push(i,j);
      }
      i = -100;
      j = -100;
    }
  }
  //up-left
  i = this.locationX-1;
  j = this.locationY+1;
  while (i >= 0 && j <= 7) {
    if (checkSquare(i,j,this.color) == "empty") {
      moves.push(i,j);
      i--;
      j++;
    } else {
      if (checkSquare(i,j,this.color) == "enemy") {
        moves.push(i,j);
      }
      i = -100;
      j = 100;
    }
  }
  return moves;
}
function bishopMoveTo(newX,newY) {
  if (Date.now() - this.lastMoved >= timeBetweenMoves && checkSquare(newX,newY,this.color)) {
    var x = (newX > this.locationX) ? 1:-1;
    if (newX-this.locationX == newY-this.locationY) { //if on diagonal line from bottom left to top right
      for (var i = x; i != newX-this.locationX; i+=x) {
        if (checkSquare(this.locationX+i,this.locationY+i,this.color) != "empty") { return false}
      }
      return true;
    } else if (this.locationX-newX == newY-this.locationY) {
      for (var i = x; i != newX-this.locationX; i+=x) {
        if (checkSquare(this.locationX+i,this.locationY-i,this.color) != "empty") { return false}
      }
      return true;
    }
  }
  return false;
}

function knight(color, x, y) {
  this.color = color;
  this.giveMoves = knightGiveMoves;
  this.moveTo = knightMoveTo;
  this.lastMoved = -10000000000;
  this.type = 3;
  this.locationX = x;
  this.locationY = y;
}
function knightGiveMoves(){
  var moves = [];
  if (checkSquare(this.locationX-1,this.locationY+2,this.color)) { moves.push(this.locationX-1,this.locationY+2); }
  if (checkSquare(this.locationX+1,this.locationY+2,this.color)) { moves.push(this.locationX+1,this.locationY+2); }
  if (checkSquare(this.locationX-1,this.locationY-2,this.color)) { moves.push(this.locationX-1,this.locationY-2); }
  if (checkSquare(this.locationX+1,this.locationY-2,this.color)) { moves.push(this.locationX+1,this.locationY-2); }
  if (checkSquare(this.locationX-2,this.locationY+1,this.color)) { moves.push(this.locationX-2,this.locationY+1); }
  if (checkSquare(this.locationX+2,this.locationY+1,this.color)) { moves.push(this.locationX+2,this.locationY+1); }
  if (checkSquare(this.locationX-2,this.locationY-1,this.color)) { moves.push(this.locationX-2,this.locationY-1); }
  if (checkSquare(this.locationX+2,this.locationY-1,this.color)) { moves.push(this.locationX+2,this.locationY-1); }
  return moves;
}
function knightMoveTo(newX,newY) {
  if (Date.now() - this.lastMoved >= timeBetweenMoves && (Math.abs(newX - this.locationX) == 1 || Math.abs(newX - this.locationX) == 2) && (Math.abs(newX - this.locationX) + Math.abs(newY - this.locationY) == 3)) {
    if (checkSquare(newX,newY,this.color)) { return true;}
  }
  return false;
}

function rook(color, x, y) {
  this.color = color;
  this.giveMoves = rookGiveMoves;
  this.moveTo = rookMoveTo;
  this.lastMoved = -10000000000;
  this.type = 4;
  this.locationX = x;
  this.locationY = y;
}
function rookGiveMoves(){
  var moves = [];
  //left
  var i = this.locationX-1;
  while (i >= 0) {
    if (checkSquare(i,this.locationY,this.color) == "empty") {
      moves.push(i,this.locationY);
      i--;
    } else {
      if (checkSquare(i,this.locationY,this.color) == "enemy") {
        moves.push(i,this.locationY);
      }
      i = -100;
    }
  }
  //right
  i = this.locationX+1;
  while (i <= 7) {
    if (checkSquare(i,this.locationY,this.color) == "empty") {
      moves.push(i,this.locationY);
      i++;
    } else {
      if (checkSquare(i,this.locationY,this.color) == "enemy") {
        moves.push(i,this.locationY);
      }
      i = 100;
    }
  }
  //down
  i = this.locationY-1;
  while (i >= 0) {
    if (checkSquare(this.locationX,i,this.color) == "empty") {
      moves.push(this.locationX,i);
      i--;
    } else {
      if (checkSquare(this.locationX,i,this.color) == "enemy") {
        moves.push(this.locationX,i);
      }
      i = -100;
    }
  }
  //up
  i = this.locationY+1;
  while (i <= 7) {
    if (checkSquare(this.locationX,i,this.color) == "empty") {
      moves.push(this.locationX,i);
      i++;
    } else {
      if (checkSquare(this.locationX,i,this.color) == "enemy") {
        moves.push(this.locationX,i);
      }
      i = 100;
    }
  }
  return moves;
}
function rookMoveTo(newX,newY) {
  if (Date.now() - this.lastMoved >= timeBetweenMoves && checkSquare(newX,newY,this.color)) {
    if (newX == this.locationX) {
      //up
      if (newY > this.locationY) {
        for (var i = this.locationY + 1; i <= newY; i++) {
          if (i == newY) { return true; }
          else if (checkSquare(newX,i,this.color) != "empty") {i = 100}
        }
      //down
      } else {
        for (var i = this.locationY - 1; i >= newY; i--) {
          if (i == newY) { return true; }
          else if (checkSquare(newX,i,this.color) != "empty") {i = -100}
        }
      }
    } else if (newY == this.locationY) {
      //right
      if (newX > this.locationX) {
        for (var i = this.locationX + 1; i <= newX; i++) {
          if (i == newX) { return true; }
          else if (checkSquare(i,newY,this.color) != "empty") {i = 100}
        }
      //left
      } else {
        for (var i = this.locationX - 1; i >= newX; i--) {
          if (i == newX) { return true; }
          else if (checkSquare(i,newY,this.color) != "empty") {i = -100}
        }
      }
    }
  }
  return false;
}

function pawn(color, x, y) {
  this.color = color;
  this.giveMoves = pawnGiveMoves;
  this.moveTo = pawnMoveTo;
  this.lastMoved = -10000000000;
  this.type = 5;
  this.locationX = x;
  this.locationY = y;
}
function pawnGiveMoves(){
  var moves = [];
  var direction = (this.color) ? -1:1;
  if (typeof positions[this.locationX][this.locationY+direction] == "undefined") {
    //if space in front of piece is empty
    moves.push(this.locationX, this.locationY+direction);//add move to the array
    if (this.locationY == 3.5-(2.5*direction) && typeof positions[this.locationX][this.locationY+(2*direction)] == "undefined") {
      //if two spaces in front of piece is empty
      moves.push(this.locationX, this.locationY+(2*direction));
    }
  }
  //check if squares diagonally in front are occupied by enemy pieces, if so then add that square to the array
  if (this.locationX+1<=7 && typeof positions[this.locationX+1][this.locationY+direction] != "undefined"
  && positions[this.locationX+1][this.locationY+direction].color != this.color) {
    moves.push(this.locationX+1, this.locationY+direction);
  }
  if (this.locationX-1>=0 && typeof positions[this.locationX-1][this.locationY+direction] != "undefined"
  && positions[this.locationX-1][this.locationY+direction].color != this.color) {
    moves.push(this.locationX-1, this.locationY+direction);
  }
  return moves;
}
function pawnMoveTo(newX,newY) {
  if (Date.now() - this.lastMoved >= timeBetweenMoves) {
    //sets which way the pawns moves
    var direction = (this.color) ? -1:1;
    if (newX==this.locationX) {
      if (typeof positions[this.locationX][this.locationY+direction] == "undefined") {
        if (newY==this.locationY + direction) {
          return true;
        } else if (this.locationY == 3.5 - (2.5 * direction) && newY == this.locationY + (2 * direction) && typeof positions[this.locationX][this.locationY + (2 * direction)] == "undefined") {
          //if piece is on second row and two spaces in front is empty
          return true;
        }
      }
    } else if (newY == this.locationY + direction) {
      if (newX==this.locationX+1 && typeof positions[this.locationX+1][this.locationY+direction] != "undefined" && positions[this.locationX+1][this.locationY+direction].color != this.color) {
        return true;
      } else if (newX==this.locationX-1 && typeof positions[this.locationX-1][this.locationY+direction] != "undefined" && positions[this.locationX-1][this.locationY+direction].color != this.color) {
        return true;
      }
    }
  }
  return false;
}

//moves piece to passed coordinates
function move(newX,newY) {
  //if king taken, end game
  if (typeof positions[newX][newY] == "object" && positions[newX][newY].type == 0) {
    playing = false;
    if (positions[newX][newY].color == 1) { message = "White wins"; }
    else { message = "Black wins"; }
    //stop AI from playing
    clearInterval(AI);
    clearInterval(AI2);
  }
  positions[newX][newY] = positions[this.locationX][this.locationY];
  positions[this.locationX][this.locationY] = undefined;
  this.locationX = newX;
  this.locationY = newY;
  //if pawn moved to end row, turn into a queen
  if (this.type == 5 && (newY == 0 || newY == 7)) { this.type = 1; this.giveMoves = queenGiveMoves; this.moveTo = queenMoveTo; }
  this.lastMoved = Date.now();
}

//draws a box and writes whatever message contains inside it
function displayMessage() {
  noStroke
  fill(255,255,255,127)
  rect(width/8*1.5,height/8*2.5,width/8*5,height/8*3)
  fill(0,0,0,127)
  textSize(32);
  text(message,width/8*1.5,height/8*2.5,width/8*5,height/8*3)
}

//io object is declared in the socket.io.js library referenced in header
//connect to the website
var  socket  =  io.connect("https://coursework-sausageman.c9users.io");

socket.on('message', function(text){
  message = text;
  console.log(message);
});

socket.on("match found", function(side){
    console.log("match found");
    restart(side, "multiplayer");
});

//resets the the game
function restart(side,mode) {
  console.log("restart");
  //removes socket listener so if not playing multiplayer then client won't receive moves from server
  //stops AI
  clearInterval(AI);
  clearInterval(AI2);
  resetPieces();//reset board
  if (playingMultiplayer == true) {
    playingMultiplayer = false;
    if (playing == true) {
      socket.emit("quit");
      playing == false;
    }
  }
  squareSelected = false;
  playing = true;
  message = "";
  if (mode == "random AI") {
    if (side == "white") {
      viewOfWhite = true;
      playingAsColor = 0;
      AI = setInterval(function(){randomAI(1)},500);//every 0.5 seconds a random black piece is moved
    } else if (side == "black") {
      viewOfWhite = false;
      playingAsColor = 1;
      AI = setInterval(function(){randomAI(0)},500);//every 0.5 seconds a random white piece is moved
    }
  } else if (mode == "random AI versus random AI") {
    AI = setInterval(function(){randomAI(0)},500);//every 0.5 seconds a random white piece is moved
    setTimeout(function () {
        AI2 = setInterval(function(){randomAI(1)},500);//every 0.5 seconds a random black piece is moved
    }, 250);
    if (side == "black") { viewOfWhite = false; }
    else { viewOfWhite = true; }//if no side passed then it is assumed that white was desired
    playingAsColor = -1;
  } else if (mode == "multiplayer") {
    if (side == "white") {
      viewOfWhite = true;
      playingAsColor = 0;
    } else if (side == "black") {
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
//when the web page is loaded, the user is put into a versus random AI game as white
restart("white","random AI");
