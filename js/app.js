var WALL = 'WALL';
var FLOOR = 'FLOOR';
var BALL = 'BALL';
var GAMER = 'GAMER';

var GAMER_IMG = '<img src="img/gamer.png" />';
var BALL_IMG = '<img src="img/ball.png" />';

var gBoard;
var gGamerPos;
var gBallsCollected = 0;
var gTotalBalls = 2;

function initGame() {
	gGamerPos = { i: 2, j: 9 };
	gBoard = buildBoard();
	renderBoard(gBoard);

	updateScore();
	setInterval(addRandomBall, 5000);

}

function buildBoard() {
	// Create the Matrix
	// var board = createMat(10, 12)
	var board = new Array(10);
	for (var i = 0; i < board.length; i++) {
		board[i] = new Array(12);
	}

	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR in a regular cell
			var cell = { type: FLOOR, gameElement: null };

			// Place Walls at edges
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				cell.type = WALL;
			}

			// Add created cell to The game board
			board[i][j] = cell;
		}
	}

	// Place the gamer at selected position
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

	// Place the Balls (currently randomly chosen positions)
	board[3][8].gameElement = BALL;
	board[7][4].gameElement = BALL;

	board[5][0].type = FLOOR;
	board[5][11].type = FLOOR;

	board[0][6].type = FLOOR;
	board[9][6].type = FLOOR;

	console.log(board);
	return board;
}

// Render the board to an HTML table
function renderBoard(board) {

	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j })

			// TODO - change to short if statement
			if (currCell.type === FLOOR) cellClass += ' floor';
			else if (currCell.type === WALL) cellClass += ' wall';

			//TODO - Change To ES6 template string
			strHTML += '\t<td class="cell ' + cellClass + '"  onclick="moveTo(' + i + ',' + j + ')" >\n';

			// TODO - change to switch case statement
			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG;
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG;
			}

			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}

	console.log('strHTML is:');
	console.log(strHTML);
	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}

function addRandomBall() {
	var emptyCells = [];

	//Search all free cells (only floor without other elements)
	for (var i = 1; i < gBoard.length - 1; i++) {
		for (var j = 1; j < gBoard[0].length - 1; j++) {
			if (gBoard[i][j].type === FLOOR && !gBoard[i][j].gameElement) {
				emptyCells.push({ i: i, j: j });
			}
		}
	}

	// If there are free cells, pick a random one and add a ball
	if (emptyCells.length) {
		var randIdx = Math.floor(Math.random() * emptyCells.length);
		var emptyCell = emptyCells[randIdx];
		gBoard[emptyCell.i][emptyCell.j].gameElement = BALL;
		renderCell(emptyCell, BALL_IMG);
		gTotalBalls++;
	}
}

// Move the player to a specific location
function moveTo(i, j) {
	if (i === 5 && j === 0) {
		j = 11;
	} else if (i === 5 && j === 11) {
		j = 0;
	}
	if (i === 0 && j === 6) {
		i = 9;
	} else if (i === 9 && j === 6) {
		i = 0;
	}

	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;

	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	// If the clicked Cell is one of the four allowed
    if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0) || (i === 5 && (j === 0 || j === 11)) || (j === 6 && (i === 0 || i === 9))) {

		if (targetCell.gameElement === BALL) {
			gBallsCollected++;
			gTotalBalls--;
			console.log('Collected! Total balls:', gBallsCollected);
			updateScore();
			if (gTotalBalls === 0) {
				victory();
			}
		}


		// MOVING from current position
		// Model:
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		// Dom:
		renderCell(gGamerPos, '');

		// MOVING to selected position
		// Model:
		gGamerPos.i = i;
		gGamerPos.j = j;
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// DOM:
		renderCell(gGamerPos, GAMER_IMG);

	} // else console.log('TOO FAR', iAbsDiff, jAbsDiff);

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {

	var i = gGamerPos.i;
	var j = gGamerPos.j;


	switch (event.key) {
		case 'ArrowLeft':
			moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			moveTo(i + 1, j);
			break;

	}

}

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	console.log('cellClass:', cellClass);
	return cellClass;
}

function updateScore() {
	var elScore = document.querySelector('.score');
	elScore.innerHTML = 'Balls Collected: ' + gBallsCollected;
}

function victory() {
	alert('Congratulations! You collected all the balls!');
	showRestartButton();
}

function showRestartButton() {
	var elRestartBtn = document.querySelector('.restart-btn');
	elRestartBtn.style.display = 'block';
}

function restartGame() {
	gBallsCollected = 0;
	gTotalBalls = 2;
	updateScore();

	gGamerPos = { i: 2, j: 9 };
	gBoard = buildBoard();
	renderBoard(gBoard);

	var elRestartBtn = document.querySelector('.restart-btn');
	elRestartBtn.style.display = 'none';
}





