const common = require('./client/common')
const http = require('http')
// const path = require('path')
const express = require('express')
const app = express()
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use('/static', express.static('client'));
app.use('/', express.static('./web'));

// listen for new web clients:
server.listen(8080);
console.log("listening on port 8080");

var boards = [];
var playerQueued;


//each match has its own board 
function Board(whitePlayer,blackPlayer) {
  this.whitePlayer = whitePlayer;
  this.blackPlayer = blackPlayer;
  this.positions = [];
  this.playing = false;
  this.timer = null;
  this.timeBetweenMoves = 5000;
  this.start = function(timerLength){
    let parent = this;
    this.resetPieces();
    this.timer = setInterval(function() {
      if (timerLength > 0) {
        parent.whitePlayer.emit("message",timerLength/1000);
        parent.blackPlayer.emit("message",timerLength/1000);
        timerLength = timerLength - 1000;
      } else { 
        parent.playing = true;
        parent.whitePlayer.emit("message","");
        parent.blackPlayer.emit("message","");
        clearInterval(parent.timer);
      }
    }, 1000);
    this.whitePlayer.emit("match found","white");
    this.blackPlayer.emit("match found","black");
    console.log("match set up");
    //when a clients sends a move: if move valid execute it and send the move to both clients
    function receiveMove(oldX,oldY,newX,newY,col,parent){
      console.log("move received");
      let piece = parent.positions[oldX][oldY];
      if (parent.playing && typeof piece == "object" && piece.color === col && piece.canMoveTo(newX,newY,parent.timeBetweenMoves)) {
        move.call(piece,newX,newY);
        console.log("move executed");
        parent.whitePlayer.emit("move",oldX,oldY,newX,newY);
        parent.blackPlayer.emit("move",oldX,oldY,newX,newY);
      } else {
        console.log("move not valid");
      }
    }
    this.whitePlayer.on("move",function(oldX,oldY,newX,newY){
      receiveMove(oldX,oldY,newX,newY,0,parent)
    });
    this.blackPlayer.on("move",function(oldX,oldY,newX,newY){
      receiveMove(oldX,oldY,newX,newY,1,parent)
    });
  };

  //resets board to starting position
  this.resetPieces = function() {
    this.positions = new Array(7);
    common.resetPieces(this.positions, this);
  };

  this.endGame = function() {
    clearInterval(this.timer);//stops countdown
    function endGameForPlayer(player){
      if (io.sockets.sockets.get(player.id) != undefined) {
        io.sockets.sockets.get(player.id).playing = false;
        player.emit("game end");
        player.removeAllListeners("move");
      }
    }
    endGameForPlayer(this.whitePlayer)
    endGameForPlayer(this.blackPlayer)
    console.log("game ended");
  };
}

//moves piece to passed coordinates
function move(newX, newY) {
  if (typeof this.owner.positions[newX][newY] == "object" && this.owner.positions[newX][newY].type === 0) {//if king taken, end game
    this.owner.whitePlayer.emit("move",this.location.x,this.location.y,newX,newY);
    this.owner.blackPlayer.emit("move",this.location.x,this.location.y,newX,newY);
    this.owner.endGame();
  }
  this.owner.positions[newX][newY] = this.owner.positions[this.location.x][this.location.y];
  this.owner.positions[this.location.x][this.location.y] = undefined;
  this.location.x = newX;
  this.location.y = newY;
  //if pawn moved to end row, turn into a queen
  if (this.type === 5 && (newY === 0 || newY === 7)) { this.makeQueen(); }
  this.lastMoved = Date.now();
}


io.on("connection", function(socket){
  socket.playing = false;
  console.log("user connected");
  socket.on("quickplay",function(){
    if (socket.playing === false) {
      if (playerQueued !== socket) {
          if (playerQueued) {
              boards.push(new Board(playerQueued,socket)); //create new board
              boards[boards.length-1].start(5000); //make the board start playing in 5000 milliseconds
              io.sockets.sockets.get(playerQueued.id).playing = true;
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
  if (playerQueued === user) {
    playerQueued = undefined;
  } else if (user.playing === true) {
    //find the game the user is playing and end it
    for (var i = 0; i < boards.length; i++) {
      if (user === boards[i].whitePlayer) {
        boards[i].blackPlayer.emit("message","Your opponent left.");
        boards[i].endGame();
      } else if (boards[i].blackPlayer === user) {
        boards[i].whitePlayer.emit("message","Your opponent left.");
        boards[i].endGame();
      }
    }
  }
}