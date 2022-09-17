(function(exports){

//returns a value depending on what the passed square is
exports.checkSquare = function (positions, col, x, y) {
  if (x < 8 && x >= 0 && y < 8 && y >= 0) {
    if (typeof positions[x][y] != "object") { return "empty"; }
    else if (positions[x][y].color !== col) { return "enemy"; }
  }
  return false; //square has friendly Piece
};

//places pieces in the starting position
exports.resetPieces = function(positions, owner) {
  for (let i = 0; i < 8; i++) {
    positions[i] = new Array(7);
    positions[i][1] = new exports.Pawn(positions, 0, i, 1, owner);
    positions[i][6] = new exports.Pawn(positions, 1, i, 6, owner);
  }
  for (let j = 0; j <= 7; j+=7) {
    positions[0][j] = new exports.Rook(positions, j/7, 0, j, owner); //j/7 is either 0 or 1
    positions[1][j] = new exports.Knight(positions, j/7, 1, j, owner);
    positions[2][j] = new exports.Bishop(positions, j/7, 2, j, owner);
    positions[3][j] = new exports.Queen(positions, j/7, 3, j, owner);
    positions[4][j] = new exports.King(positions, j/7, 4, j, owner);
    positions[5][j] = new exports.Bishop(positions, j/7, 5, j, owner);
    positions[6][j] = new exports.Knight(positions, j/7, 6, j, owner);
    positions[7][j] = new exports.Rook(positions, j/7, 7, j, owner);
  }
};

//Checks squares in a line adding them to moves until the function hits a piece
function giveLine(piece, moves, xDirection, yDirection){
  let x = piece.location.x;
  let y = piece.location.y;
  let square = false; //false means their is a friendly piece in that square (not a good clear way of doing things really, but oh well)
  while (x >= 0 && x <= 7 && y >= 0 && y <= 7) {
    x += xDirection;
    y += yDirection;
    square = exports.checkSquare(piece.positions, piece.color, x, y);
    if (square === "empty") {
      moves.push([x,y]);
    } else if (square === "enemy") {
      moves.push([x,y]);
      break;
    }
  }
}
//returns all the moves of a piece if it were a bishop (used for bishop and queen)
function giveAllDiagonals(piece, moves){
  giveLine(piece, moves, 1, 1);
  giveLine(piece, moves, 1, -1);
  giveLine(piece, moves, -1, 1);
  giveLine(piece, moves, -1, -1);
}
//returns all the moves of a piece if it were a rook (used for rook and queen)
function giveAllSideways(piece, moves){
  giveLine(piece, moves, 1, 0);
  giveLine(piece, moves, -1, 0);
  giveLine(piece, moves, 0, 1);
  giveLine(piece, moves, 0, -1);
}

function Piece(positions,color, x, y, type, giveMoves, owner){
  this.owner = owner;
  this.color = color;
  this.lastMoved = -10000000000;
  this.location = {x: x, y: y};
  this.type = type;
  this.giveMoves = giveMoves;
  this.positions = positions;
  this.canMoveTo = function(newX, newY, time = 0){
    if (Date.now() - this.lastMoved >= time) {
      console.log("date ok");
      let moves = this.giveMoves();
      for (let i = 0; i < moves.length; i++) {
        if (moves[i][0] === newX && moves[i][1] === newY) {
          console.log("can move");
          return true
        }
      }
    }
    console.log("cannot move");
    return false
  };
  this.makeQueen = function(){
    this.giveMoves = queenGiveMoves;
    this.type = 1;
  }
}

exports.King = function(positions,color, x, y, owner) {
  let obj = new Piece(positions, color, x, y,  0, kingGiveMoves, owner);
  return(obj)
};
function kingGiveMoves(){
  const moves = [];
  for (let j = this.location.y - 1; j <= this.location.y + 1; j++) {
    for (let i = this.location.x-1; i <= this.location.x + 1; i++) {
      if (exports.checkSquare(this.positions, this.color, i, j)) { moves.push([i,j]); }
    }
  }
  return moves;
}

exports.Queen = function(positions,color, x, y, owner) {
  let obj = new Piece(positions, color, x, y, 1, queenGiveMoves, owner);
  return(obj)
};
function queenGiveMoves(){
  const moves = [];
  giveAllDiagonals(this, moves);
  giveAllSideways(this, moves);
  return moves;
}

exports.Bishop = function(positions,color, x, y, owner) {
  let obj = new Piece(positions, color, x, y, 2 , bishopGiveMoves, owner);
  return(obj)
};
function bishopGiveMoves(){
  const moves = [];
  giveAllDiagonals(this, moves);
  return moves;
}

exports.Knight = function(positions,color, x, y, owner) {
  let obj = new Piece(positions, color, x, y, 3, knightGiveMoves, owner);
  return(obj)
};
function knightGiveMoves(){
  const moves = [];
  const [positions, color, x, y] = [this.positions, this.color, this.location.x, this.location.y] 
  if (exports.checkSquare(positions, color, x - 1, y + 2)) { moves.push([x-1,y+2]); }
  if (exports.checkSquare(positions, color, x + 1, y + 2)) { moves.push([x+1,y+2]); }
  if (exports.checkSquare(positions, color, x - 1, y - 2)) { moves.push([x-1,y-2]); }
  if (exports.checkSquare(positions, color, x + 1, y - 2)) { moves.push([x+1,y-2]); }
  if (exports.checkSquare(positions, color, x - 2, y + 1)) { moves.push([x-2,y+1]); }
  if (exports.checkSquare(positions, color, x + 2, y + 1)) { moves.push([x+2,y+1]); }
  if (exports.checkSquare(positions, color, x - 2, y - 1)) { moves.push([x-2,y-1]); }
  if (exports.checkSquare(positions, color, x + 2, y - 1)) { moves.push([x+2,y-1]); }
  return moves;
}

exports.Rook = function(positions, color, x, y, owner) {
  let obj = new Piece(positions, color, x, y, 4, rookGiveMoves, owner);
  return(obj)
};
function rookGiveMoves(){
  const moves = [];
  giveAllSideways(this, moves);
  return moves;
}

exports.Pawn = function(positions, color, x, y, owner) {
  let obj = new Piece(positions, color, x, y, 5, pawnGiveMoves, owner);
  return(obj)
};
function pawnGiveMoves(){
  const moves = [];
  const direction = (this.color) ? -1 : 1;
  const [positions, x, y] = [this.positions, this.location.x, this.location.y]
  //forward
  if (typeof positions[x][y+direction] == "undefined") {
    moves.push([x, y+direction]);
    //en passant
    if (y === 3.5-(2.5*direction) && typeof positions[x][y+(2*direction)] == "undefined") {
      moves.push([x, y+(2*direction)]);
    }
  }
  //diagonal attack
  if (x+1<=7 && typeof positions[x+1][y+direction] != "undefined"
      && positions[x+1][y+direction].color !== this.color) {
    moves.push([x+1, y+direction]);
  }
  if (x-1>=0 && typeof positions[x-1][y+direction] != "undefined"
      && positions[x-1][y+direction].color !== this.color) {
    moves.push([x-1, y+direction]);
  }
  return moves;
}

})(typeof exports === 'undefined'? this['common']={}: exports);