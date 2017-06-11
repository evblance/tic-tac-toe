/*
  Additional functionality ideas:
   - wait for a time delta to elapse before the computer's decision loop atually
      proceeds so that there can be a 'thinking time' associated with the computer's turn

  TODO:
    - A.I. fixes: Computer needs to take the middle if not taken after the first move if player is first
    - A.I. fixes: Computer must take a corner if player goes first and chooses middle space as the first move
    - Winning board display logic: The computer should not be allowed to make one more move after the game has ended
  */

(function($){


  $(document).ready(function() {

    // var GAMELOOP_DELAY = undefined;
    // var GAME_DIFFICULTY = 'hard';


    // function that returns the jQuery object for the corresponding tile number
    function tileToDOMObject(prefix, tileNumber) {
      var IDString = prefix + tileNumber;
      var $tile = $(IDString);

      return $tile;
    }

    var Board = function() {
      // if a click is valid, decrement this value
      this.movesLeft = 9,
      this.blankTiles = [0,1,2,3,4,5,6,7,8],
      this.occupiedTiles = [],
      this.gameOver = true,
      this.result = undefined,
      this.score = { 'Computer': 0, 'Human': 0 }
    };

    Board.prototype.drawBoard = function(gamerArr) {
      // function that draws the game's winning board
      var gamerTileArr;
      var gamerPiece;
      gamerArr.forEach(function(gamer) {
        gamerTileArr = gamer.tiles;
        gamerPiece = gamer.gamepiece;

        gamerTileArr.forEach(function(tile) {
          tileToDOMObject('#ms', tile).html(gamerPiece);
        });
      });
    }

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

      if ( board.gameOver ) {
        return;
      }

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
      completion.forEach(function(progressCount) {
        if ( progressCount === 3 ) {
          gameWon = true;
          board.gameOver = true;
        }
      });

      if ( gameWon === true ) {
        this.result = gamer.name + ' won!';
        board.score[gamer.name]++;
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
      this.moveInProgress = false, // TODO: use this property to call a timer in move method when switched to true
                                   //       which only allows the move to be made after a couple of seconds have elapsed
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
        // TODO: >>>
        console.log('Computer is thinking...');
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

    Computer.prototype.interpretBoard = function(blankTiles, playerTiles, computerTiles) {
      // could alternatively take a difficulty paramater as well, and return
      // eg. [[2],[4,6,7],[8]]   instead of  [2, 3, 5]
      //      hard  med   easy        default

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

        // If we did not find a winning choice above, or a player stopping move...
        // is a blank space within 1 (row adjacent) or +/- 3 (col adjacent)?
        for (var i = 0; i < computerTiles.length; i++) {
          for (var j = 0; j < blankTiles.length; j++) {
            // NOTE: could introduce a switch statement here with a random roll deciding which
            //        course to take (horizontal or vertical)
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

      // If no better moves, make sure we have something meaningful to return
      if ( choices.length === 0 ) {
        choices = blankTiles;
      }

      return choices;
    };

    Computer.prototype.makeMove = function(blankTiles, playerTiles, computerTiles) {

      // return an array of choices for making a move
      var choices = this.interpretBoard(blankTiles, playerTiles, computerTiles);
      var numChoices = choices.length;

      // select a move from available choices
      var computerMove;
      var moveIndex;
      if ( numChoices > 1 ) {
        moveIndex = Math.floor(numChoices * Math.random());
        computerMove = choices[moveIndex];
      } else {
        computerMove = choices[0]
      }

      // now mark the space with the chosen move
      board.occupyTile(computerMove);
      this.tiles.push(computerMove);
      var $tile = tileToDOMObject('#s', computerMove);
      $tile.html(computer.gamepiece);

      return;
    }

    function play() {
      if ( board.movesLeft > 0 && player.turn ) {
        // waiting on player input
        return;
      } else if ( board.movesLeft > 0 && computer.turn ) {
        computer.move();
      } else {
        // game is over
        board.gameOver = true;
      }
      return;
    }

    function reset() {
      if ( board.result !== undefined ) {
        // show the winning game board display
        $('.past-game-container').css('display', 'flex');
      }
      // show start screen
      $('.start-menu').addClass('start-menu-active');
      // output game result
      if ( board.result !== null ) {
        $('.game-status-heading').text(board.result);
      } else if ( board.result === null ){
        $('.game-status-heading').text('Tie!');
      }
      // reset winning board display and draw
      $('.mini-square').html('');
      board.drawBoard([computer, player]);
      // reset players
      computer.reset();
      player.reset();
      // update game score
      $('#computer-score').html('Computer: ' + board.score['Computer']);
      $('#player-score').html('Human: ' + board.score['Human']);
      // reset the board
      board.reset();
      return;
    }

    function main() {
      if ( board.gameOver ) {
        reset();
        return;
      }
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
        // interpret the clicks on the modal start screen for choosing gamepiece
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
