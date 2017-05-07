/*
  Additional functionality ideas: 
  - Implement display of the last winning board below the win statement:
    "
    winning board was:
    O |     | X
    ------------
      |  O  | X
    -----------
      |     | O
    "

   - wait for a time difference to elapse before the computer's decision loop atually
      proceeds so that there can be a 'thinking time' associated with the computer's turn

   - Implement a scoreboard to keep track of the games won for each player

  */

(function($){

  $(document).ready(function() {


    var GAMELOOP_DELAY = undefined;
    var GAME_DIFFICULTY = 'hard';

    var Board = function() {
      // if a click is valid, decrement this value
      this.movesLeft = 9,
      this.blankTiles = [0,1,2,3,4,5,6,7,8],
      this.occupiedTiles = [],
      this.gameOver = true,
      this.result = undefined
    };

    Board.prototype.occupyTile = function(tileNumber) {
      // this function needs to remove a tile from the blank array
      // and add it to the list of occupied tiles, based on the ID.
      for ( var i = 0; i < this.blankTiles.length; i++ ) {
        if ( tileNumber === this.blankTiles[i] ) {
          this.blankTiles.splice(i,1);
          break;
        }
      }
      this.occupiedTiles.push(tileNumber);
      return;
    };

    Board.prototype.checkForWinner = function(gamer) {
      // this function checks if the game is over (all tiles filled, no winner)
      // or whether it is won by the player or computer. If so, it sets this.gameOver to true
      // this must grid to see if there is a winner

      var winningSets = [ [0,1,2],
                          [3,4,5],
                          [6,7,8],
                          [0,3,6],
                          [1,4,7],
                          [2,5,8],
                          [0,4,8],
                          [2,4,6]];

      // check which arrays the owned tiles are part of and record the index - if any of them are all
      // a match for the owned tiles by player/computer, declare the game over and winner.

      var gamerTiles = gamer.tiles;
      var completion = [];
      var count;
      for ( var i = 0; i < winningSets.length; i++ ) {
        count = 0;
        for ( var j = 0; j < gamerTiles.length; j++ ) {
          for ( var k = 0; k < 3; k++ ) {
            if ( gamerTiles[j] === winningSets[i][k] )
              count++;
          }
        }
        completion.push(count);
      }

      var gameWon = false;
      completion.forEach(function(status) {
        if ( status === 3 ) {
          gameWon = true;
          board.gameOver = true;
          return;
        }
      });
      // console.log(completion);

      if ( gameWon === true ) {
        this.result = gamer.name + ' won!';
        // console.log(this.result);
      }

      return;
    };

    Board.prototype.reset = function() {
      $('.gameboard-container').find('.square').text('');
      this.movesLeft = 9;
      this.blankTiles = [0,1,2,3,4,5,6,7,8];
      this.occupiedTiles = [];
      this.result = null;
    };

    var Player = function() {
      this.name = 'Human',
      this.tiles = [],
      this.turn = false,
      this.gamepiece = undefined;
    };

    Player.prototype.reset = function() {
      player.turn = false;
      player.tiles = [];
    }

    Player.prototype.setGamePiece = function(gamepiece) {
      this.gamepiece = gamepiece;
    };

    Player.prototype.move = function($tile) {
      // this function processes player input and performs the move
      $tile.html(player.gamepiece);
      var tileNumber = Number($tile[0].id.slice(-1));
      board.occupyTile(tileNumber);
      this.tiles.push(tileNumber);
      $tile.html(player.gamepiece);
      board.movesLeft--;
      this.turn = false;
      computer.turn = true;
    };

    var Computer = function() {
      this.name = 'Computer',
      this.tiles = [],
      this.moveInProgress = false,
      this.turn = false,
      this.gamepiece = undefined,
      this.tempPoints = [];
    };

    Computer.prototype.reset = function() {
      computer.turn = false;
      computer.tiles = [];
    };

    Computer.prototype.setGamePiece = function(gamepiece) {
      this.gamepiece = gamepiece;
    };

    // the function where the computer decides what to do
    Computer.prototype.move = function() {
      if ( this.moveInProgress ) {
        return;
      } else {
        this.moveInProgress = true;
        // gather information
        var blankTiles = this.parseFreeSpaces();
        var playerTiles = this.parsePlayerTiles();
        // decide the best move and mark tile
        this.makeMove(blankTiles, playerTiles, this.tiles);
        board.movesLeft--;
        this.moveInProgress = false;
        this.turn = false;
        player.turn = true;
        console.log("Your turn, player!");
      }
    };

    Computer.prototype.parseFreeSpaces = function() {
      return board.blankTiles;
    };

    Computer.prototype.parsePlayerTiles = function() {
      return player.tiles;
    };

    //
    // if ( tileNumber >= 6 ) {
    //   colIndex = 2;
    // } else if ( tileNumber >= 3 ) {
    //   rowIndex = 1;
    // } else {
    //   rowIndex = 0;
    // }
    // colIndex = tileNumber % 3;


    Computer.prototype.interpretBoard = function(blankTiles, playerTiles, computerTiles) {
      // grid the tiles, perform math to derive an array of (best) positions available for move
      // TODO: write the proper logic here, currently returning only the blank tiles

      var choices = [];

      // go for middle if it is the first move of the game
      if ( blankTiles.length === 9 ) {
        choices = [4];
      } else if ( computerTiles.length === 1 && computer.gamepiece === 'O' ) {
        // console.log('player tiles are', playerTiles);
        playerTiles.forEach(function(tile) {
          if ( tile === 0 || tile === 2 || tile === 6 || tile === 8 ) {
            choices = [1,3,5,7];
          } else if ( tile === 1 || tile === 3 || tile === 5 || tile === 7 ) {
            choices = [0,2,6,8];
          }
        });
      } else if ( computerTiles.length >= 1 ) {
        // first write some code to see which tiles computer needs to win (ie. would need to get 2, if has 0,1) and
        // priorities that, otherwise a player could win if the computer randomly picks from the remaining tiles

        // TODO: >>>
        // now first get the indices of the arrays with 2 counts for the computer
        // and compare computerOwned tiles and blanks to find a tile that should be proirities for move

        // if none of these, then use the same approach on playerCompletion to twart the player from completing a set

        // do a check for if the computer can win with one last tile
        var targetSets = [[0,1,2],
                          [3,4,5],
                          [6,7,8],
                          [0,3,6],
                          [1,4,7],
                          [2,5,8],
                          [0,4,8],
                          [2,4,6]];

        // check which arrays the owned tiles are part of and record the index, the isolate arrays
        // where there have been 2 hits, go through them, checking if the remaining number (the one that is not in them
        // owned list) is blank tiles, if so then choose that number
        var count;
        var computerCompletion = []
        for ( var i = 0; i < targetSets.length; i++ ) {
          count = 0;
          for ( var j = 0; j < computerTiles.length; j++ ) {
            for ( var k = 0; k < 3; k++ ) {
              if ( computerTiles[j] === targetSets[i][k] )
              count++;
            }
          }
          computerCompletion.push(count);
        }

        var setsOfInterest = [];
        for ( var i = 0; i < computerCompletion.length; i++ ) {
          if ( computerCompletion[i] === 2 ) {
            setsOfInterest.push(targetSets[i]);
          }
        }

        // TODO: DRY setsOfInterest.forEach code into a function call
        setsOfInterest.forEach(function(set) {
          for (var i = 0; i < 3; i++) {
            for (var j = 0; j < blankTiles.length; j++) {
              if ( blankTiles[j] === set[i] ) {
                // found a match for achieving win condition
                choices.push(blankTiles[j]);
              }
            }
          }
        });

        // no need to keep looking if we have a winning choice
        if ( choices.length > 0 ) {
          console.log('gotcha fool!');
          return choices;
        } else {
          var playerCompletion = [];
          for ( var i = 0; i < targetSets.length; i++ ) {
            count = 0;
            for ( var j = 0; j < playerTiles.length; j++ ) {
              for ( var k = 0; k < 3; k++ ) {
                if ( playerTiles[j] === targetSets[i][k] )
                count++;
              }
            }
            playerCompletion.push(count);
          }

          for ( var i = 0; i < playerCompletion.length; i++ ) {
            if ( playerCompletion[i] === 2 ) {
              setsOfInterest.push(targetSets[i]);
            }
          }

          setsOfInterest.forEach(function(set) {
            for (var i = 0; i < 3; i++) {
              for (var j = 0; j < blankTiles.length; j++) {
                if ( blankTiles[j] === set[i] ) {
                  // found a match for achieving win condition
                  choices.push(blankTiles[j]);
                }
              }
            }
          });

          if ( choices.length > 0 ) {
            return choices;
          }
        }



        // else (indent), finally...
        // is a blank space within 1 (row adjacent) or +/- 3 (col adjacent)?
        for (var i = 0; i < computerTiles.length; i++) {
          for (var j = 0; j < blankTiles.length; j++) {
            if ( blankTiles[j] === computerTiles[i] + 1 || blankTiles[j] === computerTiles[i] - 1 ) {
              choices.push(blankTiles[j]);
            } else if ( blankTiles[j] === computerTiles[i] + 3 || blankTiles[j] === computerTiles[i] - 3 ) {
              choices.push(blankTiles[j]);
            }
          }
        }
      }

      // cull duplicates from the choices array
      for (var w = 0; w < choices.length-1; w++ ) {
        for (var v = choices.length-1; v > w; v-- ) {
          if ( choices[w] === choices[v] ) {
            choices.splice(v,1);
          }
        }
      }

      // make sure we have something meaningful to return
      if ( choices.length === 0 ) {
        choices = blankTiles;
      }

      return choices;
    };

    Computer.prototype.tileToDOMObject = function(tileNumber) {
      // function that returns the jQuery object for the tile
      // takes the tile number as an argument
      // may also be called in interpretBoard...
      var IDString = '#s' + tileNumber;
      var $tile = $(IDString);

      return $tile;
    }

    Computer.prototype.makeMove = function(blankTiles, playerTiles, computerTiles) {

      // grid and interpret the board, returning an array of ranked choices (in an an array):
      // eg. [[2],[4,6,7],[8]]
      // interpret the board to get choices
      var choices = this.interpretBoard(blankTiles, playerTiles, computerTiles);
      // console.log(choices);
      var choiceArrLength = choices.length;

      // make a choice depending on the difficulty level of the game; default (hard) picks the best,
      // or random of best array.
      var computerMove;
      var moveIndex;
      if ( GAME_DIFFICULTY === 'hard' ) {
        moveIndex = Math.floor(choiceArrLength * Math.random());
        // computerMove = choices[moveIndex].length > 1 ? choices[moveIndex][0] : choices[moveIndex];
        // console.log('choices are ', choices);
        computerMove = choices[moveIndex];
        // console.log('computer moves to ', computerMove);
      }
      // now mark the space with the chosen move
      board.occupyTile(computerMove);
      this.tiles.push(computerMove);
      var $tile = this.tileToDOMObject(computerMove);
      $tile.html(computer.gamepiece);

      return;
    }

    function play() {
      if ( board.movesLeft > 0 && player.turn ) {
        // waiting on player input
        return;
      } else if ( board.movesLeft > 0 && computer.turn ) {
        // console.log('waiting for computer move');
        computer.move();
      } else {
        // game is over
        board.gameOver = true;
        // board.result = null;
         // NOTE: This state will be caught and interacted with using a different view
                              // sprung by main()
      }
      return;
    }

    function reset() {
      // clear the game board
      computer.reset();
      player.reset();
      $('.start-menu').addClass('start-menu-active');
      if ( board.result !== null ) {
        $('.game-status').text(board.result);
      } else if ( board.result === null ){
        $('.game-status').text('Tie!');
      }
      board.reset();
      return;
    }

    function main() {
      if ( board.gameOver ) {
        reset();
        return;
      }
      // console.log('Board moves left:', board.movesLeft);
      play();
      board.checkForWinner(computer);
      board.checkForWinner(player);
      requestAnimationFrame(main);
    }

    function init() {
      main();
    }

    function handleClicks(e) {
      // console.log('a click event was detected');
      var $eventTarget = $(e.target);

      if ( board.gameOver ) {
        /* TODO: Additional functionality that handles clicks on other views */
        // interpret the clicks on the other view for choosing gamepiece
        // console.log('the game is over');
        if ( $eventTarget.hasClass('gamepiece-btn') ) {
            if( !($eventTarget.hasClass('gamepiece-btn-active')) ) {
              $('.gamepiece-btn').removeClass('gamepiece-btn-active');
              $eventTarget.addClass('gamepiece-btn-active');
            }
            player.setGamePiece($eventTarget.text());
        } else if ( $eventTarget.hasClass('start-btn') ) {
          board.gameOver = false;
          if ( player.gamepiece === 'O' ) {
            computer.setGamePiece('X');
            player.turn = true;
            computer.turn = false;
          } else {
            computer.setGamePiece('O');
            if ( player.gamepiece === undefined ) {
              player.setGamePiece('X');
            }
            player.turn = false;
            computer.turn = true;
          }

          $('.start-menu').removeClass('start-menu-active');
          $('.gamepiece-btn').removeClass('gamepiece-btn-active');
          // console.log('the game is now', board);
          init();
        }
        return;
      }

      if ( computer.turn ) {
        console.log('Wait, computer playing...');
        return;
      } else if ( player.turn && $eventTarget.hasClass('square') ) {
        // as long as the tile is blank...
        if ( $eventTarget.html() === '' ) {
          // ...pass the input onto the move method for the player
          player.move($eventTarget);
        } else {
          alert('That space is already taken.');
        }
      }

      return;
    }

    var board = new Board();
    var player = new Player();
    var computer = new Computer();
    window.addEventListener('click', handleClicks);

    init();

  });
})(jQuery);
