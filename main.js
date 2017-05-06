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
      this.result = null
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
      console.log(board);
      return;
    };

    Board.prototype.checkForWinner = function() {
      // this function checks if the game is over (all tiles filled, no winner)
      // or whether it is won by the player or computer. If so, it sets this.gameOver to true
      // this must grid to see if there is a winner
      return;
    };

    Board.prototype.reset = function() {
      $('.gameboard-container').find('.square').text('');
      this.movesLeft = 9;
      this.blankTiles = [0,1,2,3,4,5,6,7,8];
      this.occupiedTiles = [];
    };

    var Player = function() {
      this.tiles = [],
      this.turn = false,
      this.gamepiece = undefined;
    };

    Player.prototype.setGamePiece = function(gamepiece) {
      this.gamepiece = gamepiece;
    };

    Player.prototype.move = function($tile) {
      // this function processes player input and performs the move
      console.log('detected a valid move on ', $tile);
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
      this.tiles = [],
      this.moveInProgress = false,
      this.turn = false,
      this.gamepiece = undefined;
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

    Computer.prototype.interpretBoard = function() {
      // grid the tiles, perform math to derive an array of (best) positions available for move
      // TODO: write the proper logic here, currently returning only the blank tiles

      function Point(x, y) {
        this.x = x,
        this.y = y
      }

      console.log(Point(2,3));




      return this.parseFreeSpaces();
      //
      // var theColumn;
      // var theRow;
      // if ( tileNumber >= 6 ) {
      //   theRow = 2;
      // } else if ( tileNumber >= 3 ) {
      //   theRow = 1;
      // } else {
      //   theRow = 0;
      // }
      // theColumn = tileNumber % 3;
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
      var choices;
      // if first move go for center regardless
      if ( blankTiles.length === 9 ) {
        choices = [4];
      } else {
        // interpret the board to get choices
        choices = this.interpretBoard();
      }
      console.log(choices);
      var choiceArrLength = choices.length;

      // make a choice depending on the difficulty level of the game; default (hard) picks the best,
      // or random of best array.
      var computerMove;
      var moveIndex;
      if ( GAME_DIFFICULTY === 'hard' ) {
        moveIndex = Math.floor(choiceArrLength * Math.random());
        computerMove = choices[moveIndex].length > 1 ? choices[moveIndex][0] : choices[moveIndex];
        console.log('computer moves to ', computerMove);
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
        console.log('waiting for computer move');
        computer.move();
      } else {
        // game is over
        board.gameOver = true; // NOTE: This state will be caught and interacted with using a different view
                              // sprung by main()
      }
      return;
    }

    function reset() {
      // clear the game board
      board.reset();
      $('.start-menu').show();
      return;
    }

    function main() {
      if ( board.gameOver ) {
        reset();
        return;
      }
      // console.log('Board moves left:', board.movesLeft);
      play();
      board.checkForWinner();
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
        console.log('the game is over');
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

          $('.start-menu').hide();
          $('.gamepiece-btn').removeClass('gamepiece-btn-active');
          console.log('the game is now', board);
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
