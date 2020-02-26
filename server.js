var http = require('http'),
    path = require('path')
  , express = require('express')
  , app = express()
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

app.use('/static', express.static('client'));
app.use('/', express.static('./web'));

io.set('log level', 1);

// listen for new web clients:
server.listen(8080);
console.log("listening on port 8080");

var boards = [];
var playerQueued;

const timeBetweenMoves = 5000;

//returns a value depending on what the passed square is
function checkSquare(x,y,col,owner) {
  if (x < 8 && x > -1 && y < 8 && y > -1) {
    if (typeof owner.positions[x][y] != "object") { return "empty"; }
    else if (owner.positions[x][y].color != col) { return "enemy"; }
  }
  return false; //square has friendly piece
}

//each match has its own board 
function Board(whitePlayer,blackPlayer) { 
  this.whitePlayer = whitePlayer;
  this.blackPlayer = blackPlayer;
  this.positions;
  this.playing = false;
  this.timer;
  this.start = function(time){
    var parent = this;
    this.resetPieces();
    this.timer = setInterval(function() {
      if (time > 0) {
        parent.whitePlayer.emit("message",time/1000);
        parent.blackPlayer.emit("message",time/1000);
        time = time - 1000;
      } else { 
        parent.playing = true;
        parent.whitePlayer.emit("message","");
        parent.blackPlayer.emit("message","");
        clearInterval(this.timer);
      }
    }, 1000);
    this.whitePlayer.emit("match found","white");
    this.blackPlayer.emit("match found","black");
    console.log("match set up");
    //when a clients sends a move then if valid execute it and send the move to both clients
    this.whitePlayer.on("move",function(oldX,oldY,newX,newY){
      console.log("move received");
      if (parent.playing && typeof parent.positions[oldX][oldY] == "object" && parent.positions[oldX][oldY].color == 0 && parent.positions[oldX][oldY].moveTo(newX,newY)) {
        console.log("move executed");
        parent.whitePlayer.emit("move",oldX,oldY,newX,newY);
        parent.blackPlayer.emit("move",oldX,oldY,newX,newY);
      } else {
        console.log("move not valid");
      }
    });
    this.blackPlayer.on("move",function(oldX,oldY,newX,newY){
      console.log("move received");
      if (parent.playing && parent.positions[oldX][oldY].color == 1 && parent.positions[oldX][oldY].moveTo(newX,newY)) {
        console.log("move executed");
        parent.whitePlayer.emit("move",oldX,oldY,newX,newY);
        parent.blackPlayer.emit("move",oldX,oldY,newX,newY);
      } else {
        console.log("move not valid");
      }
    });
  };
  //puts the pieces in the starting position  piece name(owner,colour white for 0 or black for 1,x coordinate,y coordinate)
  this.resetPieces = function() {
    this.positions = new Array(7);
    for (var i = 0; i < 8; i++) {
      this.positions[i] = new Array(7);
      this.positions[i][1] = new pawn(this,0, i, 1);
      this.positions[i][6] = new pawn(this,1, i, 6);
    }
    for (var j = 0; j < 8; j+=7) {
      this.positions[0][j] = new rook(this,j/7, 0, j);
      this.positions[1][j] = new knight(this,j/7, 1, j);
      this.positions[2][j] = new bishop(this,j/7, 2, j);
      this.positions[3][j] = new queen(this,j/7, 3, j);
      this.positions[4][j] = new king(this,j/7, 4, j);
      this.positions[5][j] = new bishop(this,j/7, 5, j);
      this.positions[6][j] = new knight(this,j/7, 6, j);
      this.positions[7][j] = new rook(this,j/7, 7, j);
    }
  };
  this.endGame = function() {
    clearInterval(this.timer);//stops countdown
    io.sockets.socket(whitePlayer.id).playing = false;//the property of the actual socket, not the copy stored in the board
    io.sockets.socket(blackPlayer.id).playing = false;
    this.whitePlayer.emit("game end");
    this.blackPlayer.emit("game end");
    this.whitePlayer.removeAllListeners("move");
    this.blackPlayer.removeAllListeners("move");
    boards.splice(boards.indexOf(this));//remove game from array of boards
    console.log("game ended");
  };
}

function king(owner,color, x, y) {
  this.color = color;
  this.giveMoves = kingGiveMoves;
  this.moveTo = kingMoveTo;
  this.lastMoved = -10000000000;
  this.type = 0;
  this.locationX = x;
  this.locationY = y;
  this.owner = owner;
}
function kingGiveMoves(){
  var moves = [];
  for (var j = this.locationY-1; j <= this.locationY + 1; j++) {
    for (var i = this.locationX-1; i <= this.locationX + 1; i++) {
      if (checkSquare(i,j,this.color,this.owner)) { moves.push(i,j); }
    }
  }
  return moves;
}
function kingMoveTo(newX,newY) {
  //is new square one away?
  if (Date.now() - this.lastMoved >= timeBetweenMoves && (newX == this.locationX -1 || newX == this.locationX
  || newX == this.locationX + 1) && (newY == this.locationY -1 || newY== this.locationY || newY == this.locationY + 1)) {
    //then move piece
    if (checkSquare(newX,newY,this.color,this.owner)) { move.call(this,newX,newY); return true;}
  }
  return false;
}

function queen(owner, color, x, y) {
  this.color = color;
  this.giveMoves = queenGiveMoves;
  this.moveTo = queenMoveTo;
  this.lastMoved = -10000000000;
  this.type = 1;
  this.locationX = x;
  this.locationY = y;
  this.owner = owner;
}

function queenGiveMoves(){
  var moves = [];
  //diagonal
  //up-right
  var i = this.locationX+1;
  var j = this.locationY+1;
  while (i <= 7 && j <= 7) {
    if (checkSquare(i,j,this.color,this.owner) == "empty") {
      moves.push(i,j);
      i++;
      j++;
    } else {
      if (checkSquare(i,j,this.color,this.owner) == "enemy") {
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
    if (checkSquare(i,j,this.color,this.owner) == "empty") {
      moves.push(i,j);
      i++;
      j--;
    } else {
      if (checkSquare(i,j,this.color,this.owner) == "enemy") {
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
    if (checkSquare(i,j,this.color,this.owner) == "empty") {
      moves.push(i,j);
      i--;
      j--;
    } else {
      if (checkSquare(i,j,this.color,this.owner) == "enemy") {
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
    if (checkSquare(i,j,this.color,this.owner) == "empty") {
      moves.push(i,j);
      i--;
      j++;
    } else {
      if (checkSquare(i,j,this.color,this.owner) == "enemy") {
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
    if (checkSquare(i,this.locationY,this.color,this.owner) == "empty") {
      moves.push(i,this.locationY);
      i--;
    } else {
      if (checkSquare(i,this.locationY,this.color,this.owner) == "enemy") {
        moves.push(i,this.locationY);
      }
      i = -100;
    }
  }
  //right
  i = this.locationX+1;
  while (i <= 7) {
    if (checkSquare(i,this.locationY,this.color,this.owner) == "empty") {
      moves.push(i,this.locationY);
      i++;
    } else {
      if (checkSquare(i,this.locationY,this.color,this.owner) == "enemy") {
        moves.push(i,this.locationY);
      }
      i = 100;
    }
  }
  //down
  i = this.locationY-1;
  while (i >= 0) {
    if (checkSquare(this.locationX,i,this.color,this.owner) == "empty") {
      moves.push(this.locationX,i);
      i--;
    } else {
      if (checkSquare(this.locationX,i,this.color,this.owner) == "enemy") {
        moves.push(this.locationX,i);
      }
      i = -100;
    }
  }
  //up
  i = this.locationY+1;
  while (i <= 7) {
    if (checkSquare(this.locationX,i,this.color,this.owner) == "empty") {
      moves.push(this.locationX,i);
      i++;
    } else {
      if (checkSquare(this.locationX,i,this.color,this.owner) == "enemy") {
        moves.push(this.locationX,i);
      }
      i = 100;
    }
  }
  return moves;
}
function queenMoveTo(newX,newY) {
  if (Date.now() - this.lastMoved >= timeBetweenMoves && checkSquare(newX,newY,this.color,this.owner)) {
    var x = (newX > this.locationX) ? 1:-1;
    if (newX-this.locationX == newY-this.locationY) {
      for (var i = x; i != newX-this.locationX; i+=x) {
        if (checkSquare(this.locationX+i,this.locationY+i,this.color,this.owner) != "empty") { return false}
      }
      move.call(this,newX,newY); return true;
    } else if (this.locationX-newX == newY-this.locationY) {
      for (var i = x; i != newX-this.locationX; i+=x) {
        if (checkSquare(this.locationX+i,this.locationY-i,this.color,this.owner) != "empty") { return false}
      }
      move.call(this,newX,newY); return true;
    }
    if (checkSquare(newX,newY,this.color,this.owner,this.owner)) {
      if (newX == this.locationX) {
        //up
        if (newY > this.locationY) {
          for (var i = this.locationY + 1; i <= newY; i++) {
            if (i == newY) { move.call(this,newX,newY); return true; } 
            else if (checkSquare(newX,i,this.color,this.owner) != "empty") {i = 100}
          } 
        //down
        } else {
          for (var i = this.locationY - 1; i >= newY; i--) {
            if (i == newY) { move.call(this,newX,newY); return true; } 
            else if (checkSquare(newX,i,this.color,this.owner) != "empty") {i = -100}
          } 
        }
      } else if (newY == this.locationY) {
        //right
        if (newX > this.locationX) {
          for (var i = this.locationX + 1; i <= newX; i++) {
            if (i == newX) { move.call(this,newX,newY); return true; } 
            else if (checkSquare(i,newY,this.color,this.owner) != "empty") {i = 100}
          } 
        //left
        } else {
          for (var i = this.locationX - 1; i >= newX; i--) {
            if (i == newX) { move.call(this,newX,newY); return true; } 
            else if (checkSquare(i,newY,this.color,this.owner) != "empty") {i = -100}
          } 
        }
      }
    }
  }
  return false;
}

function bishop(owner, color, x, y) {
  this.color = color;
  this.giveMoves = bishopGiveMoves;
  this.moveTo = bishopMoveTo;
  this.lastMoved = -10000000000;
  this.type = 2;
  this.locationX = x;
  this.locationY = y;
  this.owner = owner;
}
function bishopGiveMoves(){
  var moves = [];
  //up-right  
  var i = this.locationX+1;
  var j = this.locationY+1;
  while (i <= 7 && j <= 7) {
    if (checkSquare(i,j,this.color,this.owner) == "empty") {
      moves.push(i,j);
      i++;
      j++;
    } else {
      if (checkSquare(i,j,this.color,this.owner) == "enemy") {
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
    if (checkSquare(i,j,this.color,this.owner) == "empty") {
      moves.push(i,j);
      i++;
      j--;
    } else {
      if (checkSquare(i,j,this.color,this.owner) == "enemy") {
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
    if (checkSquare(i,j,this.color,this.owner) == "empty") {
      moves.push(i,j);
      i--;
      j--;
    } else {
      if (checkSquare(i,j,this.color,this.owner) == "enemy") {
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
    if (checkSquare(i,j,this.color,this.owner) == "empty") {
      moves.push(i,j);
      i--;
      j++;
    } else {
      if (checkSquare(i,j,this.color,this.owner) == "enemy") {
        moves.push(i,j);
      }
      i = -100;
      j = 100;
    }
  }
  return moves;
}
function bishopMoveTo(newX,newY) {
  if (Date.now() - this.lastMoved >= timeBetweenMoves && checkSquare(newX,newY,this.color,this.owner)) {
    var x = (newX > this.locationX) ? 1:-1;
    if (newX-this.locationX == newY-this.locationY) { //if on diagonal line from bottom left to top right
      for (var i = x; i != newX-this.locationX; i+=x) {
        if (checkSquare(this.locationX+i,this.locationY+i,this.color,this.owner) != "empty") { return false}
      }
      move.call(this,newX,newY); return true;
    } else if (this.locationX-newX == newY-this.locationY) {
      for (var i = x; i != newX-this.locationX; i+=x) {
        if (checkSquare(this.locationX+i,this.locationY-i,this.color,this.owner) != "empty") { return false}
      }
      move.call(this,newX,newY); return true;
    }
  }
  return false;
}

function knight(owner, color, x, y) {
  this.color = color;
  this.giveMoves = knightGiveMoves;
  this.moveTo = knightMoveTo;
  this.lastMoved = -10000000000;
  this.type = 3;
  this.locationX = x;
  this.locationY = y;
  this.owner = owner;
}
function knightGiveMoves(){
  var moves = [];
  if (checkSquare(this.locationX-1,this.locationY+2,this.color,this.owner)) { moves.push(this.locationX-1,this.locationY+2); }
  if (checkSquare(this.locationX+1,this.locationY+2,this.color,this.owner)) { moves.push(this.locationX+1,this.locationY+2); }
  if (checkSquare(this.locationX-1,this.locationY-2,this.color,this.owner)) { moves.push(this.locationX-1,this.locationY-2); }
  if (checkSquare(this.locationX+1,this.locationY-2,this.color,this.owner)) { moves.push(this.locationX+1,this.locationY-2); }
  if (checkSquare(this.locationX-2,this.locationY+1,this.color,this.owner)) { moves.push(this.locationX-2,this.locationY+1); }
  if (checkSquare(this.locationX+2,this.locationY+1,this.color,this.owner)) { moves.push(this.locationX+2,this.locationY+1); }
  if (checkSquare(this.locationX-2,this.locationY-1,this.color,this.owner)) { moves.push(this.locationX-2,this.locationY-1); }
  if (checkSquare(this.locationX+2,this.locationY-1,this.color,this.owner)) { moves.push(this.locationX+2,this.locationY-1); }
  return moves;
}
function knightMoveTo(newX,newY) {
  if (Date.now() - this.lastMoved >= timeBetweenMoves && (Math.abs(newX - this.locationX) == 1 || Math.abs(newX - this.locationX) == 2) && (Math.abs(newX - this.locationX) + Math.abs(newY - this.locationY) == 3)) {
    if (checkSquare(newX,newY,this.color,this.owner)) { move.call(this,newX,newY); return true;} 
  }
  return false;
}

function rook(owner, color, x, y) {
  this.color = color;
  this.giveMoves = rookGiveMoves;
  this.moveTo = rookMoveTo;
  this.lastMoved = -10000000000;
  this.type = 4;
  this.locationX = x;
  this.locationY = y;
  this.owner = owner;
}
function rookGiveMoves(){
  var moves = [];
  //left
  var i = this.locationX-1;
  while (i >= 0) {
    if (checkSquare(i,this.locationY,this.color,this.owner) == "empty") {
      moves.push(i,this.locationY);
      i--;
    } else {
      if (checkSquare(i,this.locationY,this.color,this.owner) == "enemy") {
        moves.push(i,this.locationY,this.owner);
      }
      i = -100;
    }
  }
  //right
  i = this.locationX+1;
  while (i <= 7) {
    if (checkSquare(i,this.locationY,this.color,this.owner) == "empty") {
      moves.push(i,this.locationY);
      i++;
    } else {
      if (checkSquare(i,this.locationY,this.color,this.owner) == "enemy") {
        moves.push(i,this.locationY);
      }
      i = 100;
    }
  }
  //down
  i = this.locationY-1;
  while (i >= 0) {
    if (checkSquare(this.locationX,i,this.color,this.owner) == "empty") {
      moves.push(this.locationX,i);
      i--;
    } else {
      if (checkSquare(this.locationX,i,this.color,this.owner) == "enemy") {
        moves.push(this.locationX,i);
      }
      i = -100;
    }
  }
  //up
  i = this.locationY+1;
  while (i <= 7) {
    if (checkSquare(this.locationX,i,this.color,this.owner) == "empty") {
      moves.push(this.locationX,i);
      i++;
    } else {
      if (checkSquare(this.locationX,i,this.color,this.owner) == "enemy") {
        moves.push(this.locationX,i);
      }
      i = 100;
    }
  }
  return moves;
}
function rookMoveTo(newX,newY) {
  if (Date.now() - this.lastMoved >= timeBetweenMoves && checkSquare(newX,newY,this.color,this.owner)) {
    if (newX == this.locationX) {
      //up
      if (newY > this.locationY) {
        for (var i = this.locationY + 1; i <= newY; i++) {
          if (i == newY) { move.call(this,newX,newY); return true; } 
          else if (checkSquare(newX,i,this.color,this.owner) != "empty") {i = 100}
        } 
      //down
      } else {
        for (var i = this.locationY - 1; i >= newY; i--) {
          if (i == newY) { move.call(this,newX,newY); return true; } 
          else if (checkSquare(newX,i,this.color,this.owner) != "empty") {i = -100}
        } 
      }
    } else if (newY == this.locationY) {
      //right
      if (newX > this.locationX) {
        for (var i = this.locationX + 1; i <= newX; i++) {
          if (i == newX) { move.call(this,newX,newY); return true; } 
          else if (checkSquare(i,newY,this.color,this.owner) != "empty") {i = 100}
        } 
      //left
      } else {
        for (var i = this.locationX - 1; i >= newX; i--) {
          if (i == newX) { move.call(this,newX,newY); return true; } 
          else if (checkSquare(i,newY,this.color,this.owner) != "empty") {i = -100}
        } 
      }
    }
  }
  return false;
}

function pawn(owner, color, x, y) {
  this.color = color;
  this.giveMoves = pawnGiveMoves;
  this.moveTo = pawnMoveTo;
  this.lastMoved = -10000000000;
  this.type = 5;
  this.locationX = x;
  this.locationY = y;
  this.owner = owner;
}

function pawnGiveMoves(){
  var moves = [];
  var direction = (this.color) ? -1:1;
  if (typeof this.owner.positions[this.locationX][this.locationY+direction] == "undefined") { 
    moves.push(this.locationX, this.locationY+direction);
    if (this.locationY == 3.5-(2.5*direction) && typeof this.owner.positions[this.locationX][this.locationY+(2*direction)] == "undefined") {
      moves.push(this.locationX, this.locationY+(2*direction));
    }
  }
  if (this.locationX+1<=7 && typeof this.owner.positions[this.locationX+1][this.locationY+direction] != "undefined"
  && this.owner.positions[this.locationX+1][this.locationY+direction].color != this.color) {
    moves.push(this.locationX+1, this.locationY+direction);
  }
  if (this.locationX-1>=0 && typeof this.owner.positions[this.locationX-1][this.locationY+direction] != "undefined" 
  && this.owner.positions[this.locationX-1][this.locationY+direction].color != this.color) {
    moves.push(this.locationX-1, this.locationY+direction);
  }
  return moves;
}
function pawnMoveTo(newX,newY) {
  if (Date.now() - this.lastMoved >= timeBetweenMoves) {
    //sets which way the pawns moves
    var direction = (this.color) ? -1:1;
    if (newX==this.locationX) {
      if (typeof this.owner.positions[this.locationX][this.locationY+direction] == "undefined") {
        if (newY==this.locationY + direction) {
          move.call(this,newX,newY);
          return true;
        } else if (this.locationY == 3.5 - (2.5 * direction) && newY == this.locationY + (2 * direction) && typeof this.owner.positions[this.locationX][this.locationY + (2 * direction)] == "undefined") {
          move.call(this,newX,newY);
          return true;
        }
      }
    } else if (newY == this.locationY + direction) {
      if (newX==this.locationX+1 && typeof this.owner.positions[this.locationX+1][this.locationY+direction] != "undefined" && this.owner.positions[this.locationX+1][this.locationY+direction].color != this.color) {
        move.call(this,newX,newY);
        return true;
      } else if (newX==this.locationX-1 && typeof this.owner.positions[this.locationX-1][this.locationY+direction] != "undefined" && this.owner.positions[this.locationX-1][this.locationY+direction].color != this.color) {
        move.call(this,newX,newY);
        return true;
      }
    }
  }
  return false;
}

//moves piece to passed coordinates
function move(newX,newY) {
  if (typeof this.owner.positions[newX][newY] == "object" && this.owner.positions[newX][newY].type == 0) {//if king taken, end game
    this.owner.whitePlayer.emit("move",this.locationX,this.locationY,newX,newY);
    this.owner.blackPlayer.emit("move",this.locationX,this.locationY,newX,newY);
    this.owner.endGame();
  }
  this.owner.positions[newX][newY] = this.owner.positions[this.locationX][this.locationY];
  this.owner.positions[this.locationX][this.locationY] = undefined;
  this.locationX = newX;
  this.locationY = newY;
  //if pawn moved to end row, turn into a queen
  if (this.type == 5 && (newY == 0 || newY == 7)) { this.type = 1; this.giveMoves = queenGiveMoves; this.moveTo = queenMoveTo; }
  this.lastMoved = Date.now();
}


io.on("connection", function(socket){
  socket.playing = false;
  console.log("user connected");
  socket.on("quickplay",function(){
    if (socket.playing == false) {
      if (playerQueued != socket) {
          if (playerQueued) {
              boards.push(new Board(playerQueued,socket)); //create new board
              boards[boards.length-1].start(5000); //make the board start playing in 5000 milliseconds
              io.sockets.socket(playerQueued.id).playing = true;
              socket.playing = true;
              playerQueued = undefined;
          } else {
              playerQueued = socket;
              console.log("added guy to queue");
              socket.emit("message","Waiting for an opponent.");
          }
      } else { 
        socket.emit("message","You're already queueing!");
      }
    } else {
      socket.emit("message","You're already in a game!");
    }
  });
  socket.on("disconnect", function(){
    console.log("disconnect");
    quit(socket);
  });
  socket.on("quit", function(){
    console.log("quit");
    quit(socket);
  });
});

//remove user from games/queue
function quit(user) {
  if (playerQueued == user) {
    playerQueued = undefined;
  } else if (user.playing == true) {
    //find the game the user is playing and end it
    for (var i = 0; i < boards.length; i++) {
      if (boards[i].whitePlayer == user) {
        boards[i].blackPlayer.emit("message","Your opponent left.");
        boards[i].endGame();
      } else if (boards[i].blackPlayer == user) {
        boards[i].whitePlayer.emit("message","Your opponent left.");
        boards[i].endGame();
      }
    }
  }
}