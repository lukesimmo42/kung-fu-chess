# Kung-Fu Chess
## What is Kung-Fu Chess?
Kung-Fu Chess is a turnless chess variant implemented that can be played in browser. There is an online multiplayer feature which allows users to play against each other. The back-end of the multiplayer component is written in Node.js. There is not currently a server running the game so you cannot play multiplayer, however, if you click the following link you can play versus an AI that makes random moves: https://lukesimmo42.github.io/kung-fu-chess-offline/

## Rules
The rules are as in chess, apart from three exceptions:

   * No turns! Each player can make a move at anytime.
   * Each piece has a "cool-down": Once a piece has been moved, it cannot move again for five seconds.
   * Castling and En Passant are not allowed (but pawns can move two spaces forward on their first move).
   
## Fun fact about the implementation
This project features a module called common.js containing the chess move logic. This module is special because I used a [trick](https://stackoverflow.com/questions/3225251/how-can-i-share-code-between-node-js-and-the-browser?answertab=oldest#tab-top) to allow it's functions to be used by both Node and the browser. This meant I didn't need to write the chess move logic twice.
