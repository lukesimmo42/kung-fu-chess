# Kung-Fu Chess

## What is Kung-Fu Chess?

Kung-Fu Chess is a turnless chess variant implemented in JavaScript that can be [played in browser](https://kung-fu-chess.glitch.me/). There is an online multiplayer feature which allows users to play against each other. The back-end of the multiplayer component is written in Node.js.

## Rules

The rules are as in chess, apart from three exceptions:

* No turns! Each player can make a move at anytime.
* Each piece has a "cool-down": Once a piece has been moved, it cannot move again for five seconds.
* Castling and En Passant are not allowed (but pawns can move two spaces forward on their first move).
   * No turns! Each player can make a move at anytime.
   * Each piece has a "cool-down": Once a piece has been moved, it cannot move again for five seconds.
   * Castling and En Passant are not allowed (but pawns can move two spaces forward on their first move).
  
## Why did I make Kung-Fu chess?

Kung-Fu chess was made for high school coursework over a few months in 2015-2016. There were already a couple turn-less chess games when I started development but neither had online multiplayer which was an important feature for me.

Since 2016, two other turn-less chess games have been released that have multiplayer. However, my game is unique in that it has instantaneous moves, while in these games the pieces have a travel time.

## How did I make Kung-Fu chess?

With this project I followed the waterfall development methedology which is linear development aproach involving five phases executed in linear order.

### Phase 1: Analysis

In this phase I created a list of features and then classified them in terms of importance in order to prioritise which ones to start with. I used the classifications: Must, Should, Could, and Won't. Below is a table containing my (classified) feature list.
Req # | Description | Further Notes | Completed
--- | --- | --- | ---
M1 | The game must have a GUI | GUI will consist of pieces that can selected by clicking as well as buttons to restart, change settings etc. Must be easy to use. | &check;
M2 | Users must be able to move pieces | Only legal moves will be allowed (validated client side). | &check;
M3 | Users must be able to play against the computer which makes random moves. | | &check;
M4 | Pieces must have a cool-down between moves | Will be about 5 seconds; other pieces will be able to move in this time. | &check;
S1 | Clicking on a piece should show its possible moves | Useful feature that helps those new to chess. | &check;
S2 | Players should be able to play against each other online | Players should be able to play against random people as well as be able to challenge their friends. | -
S3 | Players should be able to play against an “intelligent” AI | AI should protect its king and try to capture the player’s king. | x
S4 | Options menu | User can change settings such as the length of the movement cool-down. | x
S5 | Players can “plan” moves | Players should be able to plan for a piece to move so when its cooldown runs out, it moves to a specified square. | x
S6 | Server validates moves | This is to stop people cheating by modifying their clients to make invalid moves. Only needed for multiplayer. | &check;
C1 | Multiple game mode variants | This should take little effort although changing the board size may complicate move validation. | x
C2 | Ranked mode | For a ranked mode to work I would need a way for players to create and sign-in to accounts as well as a system to match players of similar skill. I would most likely store accounts with SQL. | x
C3 | Spectate feature | Players could request/invite people to watch their games. | x
C4 | Players can re-join a game if they close their browser/lose connection | This feature would probably use user accounts, another option could be to use the user’s IP address to identify them. | x
C5 | Users can switch the view of the board | If I keep data separate from the display this should just be a matter of flipping the way squares/pieces are drawn. | &check;
C6 | Users can customise the appearance of the board and pieces | Would be a matter of changing the sprite sheet used and how the board is drawn. | x
C7 | Users can see their statistics such as win percentage | Would probably use user accounts, statistics would be stored with their account. | x
C8 | Players can pause a match | Would only be available for matches with friends and against AI. | x
W1 | Past game archive | Players would be able to see a list of past games with information such as whom they played against. They could even watch the games back. I will not work on this feature as it would take a long time and would not be used much. | x
W2 | User can design their own chess pieces inside my program and play with them instead of the normal pieces. | Users will only see their designs (opponent’s pieces will use your design, not theirs), but an option to show the opponents designs could be implemented. | x

### Phase 2 & 3: Design & Implementation

I used p5.js to draw the board and pieces. All chess logic was written from scratch. If I were to do this project again I would use the chess.js and chessboard.js libraries to do these for me.

I used Node.js for the back-end so I didn't need to rewrite the chess logic code (Node.js is a Javascript runtime environment that kets developers to run Javascript on a server). I used express to serve the web files and used socket.io to communicate the game moves between the server and client.

To avoid having copies of the same chess logic functions, I put all the logic into a file called common.js and used a [trick](https://stackoverflow.com/questions/3225251/how-can-i-share-code-between-node-js-and-the-browser?answertab=oldest#tab-top) to allow the file to be used by both the server and browser.

For this project I used prototypes instead of classes. Whereas classes are templates used to create objects, prototypes are objects used to create other objects. To achieve this we create the prototype object, and attach methods and properties to it. Then objects created from it inherit it's methods and properties.
For this project, instead of using classes I used prototypes. Whereas classes are templates used to create objects, prototypes are objects used to create other objects.

### Phase 4: Testing

To test my project I looked at each feature I implemented and created a list of tests for them. Below is a list of tests for the GUI.

Test # | Description | Expected Outcome | Test Result
---|---|---|---
M1.1 | Click a square occupied by a piece while no square selected. | Square is selected (whenever a square is selected it is shown by highlighting it yellow). | Success
M1.2 | Click a square not occupied by a piece while no square selected. | Square is selected. | Success
M1.3 | Click a square occupied by a piece while an empty square is selected. | Square is selected. | Success
M1.4 | Click a square occupied by a friendly piece while a piece is selected when new square can be moved to (follows movement rules) and selected piece has no timer. | Selected piece moves to clicked on square and has its timer set. No square is selected. | Success
M1.5 | Click a square occupied by a friendly piece while a piece is selected when new square cannot be moved to (does not follow movement rules) and selected piece has active timer. | Square unselected | Success
M1.6 | Click a square occupied by a friendly piece, while a piece is selected when new square cannot be moved to (does not follow movement rules). | Square unselected | Success
M1.7 | Click a square occupied by a friendly piece, while a piece is selected when selected piece has active timer. | Square unselected | Success
M1.8 | Click selected square. | Square unselected | Success
M1.9 | Click any square other than selected square when enemy piece selected. | Square selected | Success
M1.10 | Resize the browser to be really wide and then really tall. | The webpage scales to fill the available space and board squares can still be selected. | Success

In future I plan to learn to write unit tests for my projects, although this project was simple enough to get away with not using them.

### Phase 5: Deployment

I intially hosted my project on an AWS EC2 instance, but then I discovered [glitch.com](https://glitch.com), a website that offers free Node project hosting. So, I moved [my project there](https://kung-fu-chess.glitch.me).
