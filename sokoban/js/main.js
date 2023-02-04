'use strict'

const FLOOR = 'FLOOR'
const WALL = 'WALL'
const TARGET = 'TARGET'
const GAMER = 'GAMER'
const BOX = 'BOX'
const CLOCK = 'CLOCK'
const GOLD = 'GOLD'
const GLUE = 'GLUE'
const MAGNET = 'MAGNET'

const GAMER_IMG = '🦍'
const BOX_IMG = '📦'
const CLOCK_IMG = '⏱'
const GOLD_IMG = '🥇'
const GLUE_IMG = '🧺'
const MAGNET_IMG = '🧲'

var gWon
var gBoard
var gBoxPos
var gIsGlued
var gGamerPos
var gFreeMoves
var gIntervals
var gCurrScore
var gIsMagnetic
var gHasFreeMoves
var gPrevBoxLocation
var gUpdatedBoxLocation
var gRedoBoxLocation
var gCountingBoxOnTarget
var gPrevGamerLocation
var gUpdatedGamerLocation

function onInitGame() {
    gGamerPos = { i: 2, j: 2 }
    gBoxPos
    gFreeMoves = 10
    gCountingBoxOnTarget = 0
    gIsGlued = false
    gIsMagnetic = false
    gHasFreeMoves = false
    gBoard = createBoard()
    renderBoard(gBoard)
    restartScore()
    gIntervals = setInterval(activateIntervals, 10000)
    document.querySelector('.restart-button').style.display = 'none'
    var welcomeNote = document.querySelector('h2')
    welcomeNote.innerHTML = 'Welcome to the Sokoban Game'
    var nextLevel = document.querySelector('.nextLevel')
    nextLevel.style.display = 'none';
}
function createBoard() {
    var board = createMat(8, 8)
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board[i][j] = {
                type: FLOOR,
                element: null,
            }
            if (i === 0 || i === board.length - 1) {
                board[i][j].type = WALL
            }
            else if (j === 0 || j === board[i].length - 1) {
                board[i][j].type = WALL
            }
        }
    }
    board[gGamerPos.i][gGamerPos.j].element = GAMER
    if (gWon) {
        board[5][4].element = BOX
        board[3][3].element = BOX
        board[1][6].type = TARGET
        board[2][6].type = TARGET
        board[1][3].type = WALL
        board[3][4].type = WALL
        board[5][6].type = WALL
        board[3][6].type = WALL
        board[3][1].type = WALL
        board[5][2].type = WALL
    } else {

        board[5][5].element = BOX
        board[5][3].element = BOX
        board[1][2].type = WALL
        board[4][2].type = WALL
        board[2][5].type = WALL
        board[4][5].type = WALL
        board[1][3].type = TARGET
        board[1][4].type = TARGET

    }

    return board
}
function renderBoard(board) {
    var elBoard = document.querySelector('.board')
    var strHtml = ''

    for (var i = 0; i < board.length; i++) {
        strHtml += `<tr>\n`
        for (var j = 0; j < board[0].length; j++) {
            var cellClass = getClassName({ i, j })
            if (board[i][j].type === FLOOR) cellClass += ' floor'
            else if (board[i][j].type === WALL) cellClass += ' wall'
            else if (board[i][j].type === TARGET) cellClass += ' target'
            strHtml += `\t<td class="cell ${cellClass}" onclick="moveTo(${i}, ${j})">\n`

            if (board[i][j].element === GAMER) {
                strHtml += GAMER_IMG
            } else if (board[i][j].element === BOX) {
                strHtml += BOX_IMG
            }
            strHtml += '\t</td>\n'
        }
        strHtml += `</tr>\n`
    }
    // console.table(strHtml)
    elBoard.innerHTML = strHtml
}
function moveTo(i, j) {

    if (cheackGameOver()) return
    if (gIsGlued) return
    var targetCell = gBoard[i][j]
    if (targetCell.type === WALL) return

    // Calculate the difference between our steps
    var iMoveDifference = Math.abs(i - gGamerPos.i)
    var jMoveDifference = Math.abs(j - gGamerPos.j)

    // Check if the step is an allowed step (advence one cell)
    if ((iMoveDifference === 1 && jMoveDifference === 0) || (jMoveDifference === 1 && iMoveDifference === 0)) {

        gPrevGamerLocation = gGamerPos

        if (targetCell.element === MAGNET_IMG) {
            gIsMagnetic = true
        }
        if (targetCell.element === BOX) {
            gBoxPos = { i, j }

            var nextBoxPos = {
                i: gBoxPos.i,
                j: gBoxPos.j,
            }

            gPrevBoxLocation = gBoxPos

            if (gGamerPos.i + 1 === gBoxPos.i && gGamerPos.j === gBoxPos.j) {
                nextBoxPos.i++
            } else if (gGamerPos.i - 1 === gBoxPos.i && gGamerPos.j === gBoxPos.j) {
                nextBoxPos.i--
            } else if (gGamerPos.i === gBoxPos.i && gGamerPos.j + 1 === gBoxPos.j) {
                nextBoxPos.j++
            } else if (gGamerPos.i === gBoxPos.i && gGamerPos.j - 1 === gBoxPos.j) {
                nextBoxPos.j--
            }

            if (gIsMagnetic && gBoard[nextBoxPos.i][nextBoxPos.j].type === WALL) {

                if (gGamerPos.i + 1 === gBoxPos.i && gGamerPos.j === gBoxPos.j) {
                    nextBoxPos.i -= 2
                    gGamerPos.i++
                } else if (gGamerPos.i - 1 === gBoxPos.i && gGamerPos.j === gBoxPos.j) {
                    nextBoxPos.i += 2
                    gGamerPos.i--
                } else if (gGamerPos.i === gBoxPos.i && gGamerPos.j + 1 === gBoxPos.j) {
                    nextBoxPos.j -= 2
                    gGamerPos.j++
                } else if (gGamerPos.i === gBoxPos.i && gGamerPos.j - 1 === gBoxPos.j) {
                    nextBoxPos.j += 2
                    gGamerPos.j--
                }
            }
            if (gBoard[nextBoxPos.i][nextBoxPos.j].type === TARGET) {
                gCountingBoxOnTarget++
                cheackGameOver()
                // return
            }
            if (gBoard[nextBoxPos.i][nextBoxPos.j].type === WALL) return
            if (gBoard[nextBoxPos.i][nextBoxPos.j].element === BOX) return
            // Update model
            gBoard[nextBoxPos.i][nextBoxPos.j].element = BOX
            // update dom
            renderCell(nextBoxPos, BOX_IMG)
            gIsMagnetic = false
            gUpdatedBoxLocation = nextBoxPos
            gRedoBoxLocation = nextBoxPos

        } else if (targetCell.element === CLOCK_IMG) {
            gHasFreeMoves = true
        } else if (targetCell.element === GOLD_IMG) {
            gCurrScore += 100
        } else if (targetCell.element === GLUE_IMG) {
            gIsGlued = true
            gCurrScore -= 5
            setTimeout(() => gIsGlued = false, 5000)
        }
        if (!gHasFreeMoves) {
            gCurrScore--
        } else {
            gFreeMoves--
            console.log(gFreeMoves);
            if (gFreeMoves === 0) {
                gHasFreeMoves = false
                gFreeMoves = 10
            }
        }
        //Update model
        gBoard[gGamerPos.i][gGamerPos.j].element = null
        // update dom
        renderCell(gGamerPos, '')

        //Update model
        targetCell.element = GAMER
        gGamerPos = { i, j }
        // update dom
        renderCell(gGamerPos, GAMER_IMG)
        var score = document.querySelector('.curr-score')
        score.innerHTML = gCurrScore

        gUpdatedGamerLocation = gGamerPos

    } else console.log('Too far', iMoveDifference, jMoveDifference);
}
function handleKey(event) {
    var i = gGamerPos.i
    var j = gGamerPos.j

    switch (event.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1)
            break
        case 'ArrowRight':
            moveTo(i, j + 1)
            break
        case 'ArrowUp':
            moveTo(i - 1, j)
            break
        case 'ArrowDown':
            moveTo(i + 1, j)
            break
    }
}
function restartScore() {
    gCurrScore = 100
    var score = document.querySelector('.curr-score')
    score.innerHTML = gCurrScore
}
function cheackGameOver() {
    var restartButton = document.querySelector('.restart-button')
    if (gCountingBoxOnTarget === 2) {
        var win = document.querySelector('h2')
        win.innerHTML = `You Won! game over`
        clearInterval(gIntervals)

        restartButton.style.display = 'block'

        var nextLevel = document.querySelector('.nextLevel')
        nextLevel.style.display = 'block'

        gWon = true

        return true, gWon
    }
    if (gCurrScore === 0) {
        var lose = document.querySelector('h2')
        lose.innerHTML = `You lost! 😭 please try again!`

        clearInterval(gIntervals)

        restartButton.style.display = 'block'
        return true
    }
}
function addElements(gameElement) {
    var location = getEmptyCell()
    if (!location) return

    gBoard[location.i][location.j].element = gameElement

    renderCell(location, gameElement)
    return location
}
function timeoutElements(location, gameElement) {
    setTimeout(() => {
        if (gBoard[location.i][location.j].element === gameElement) {
            // Update the model
            gBoard[location.i][location.j].element = null
            // Update the dom
            renderCell(location, '')
        }
    }, 5000)
}
function addClock() {
    var location = addElements(CLOCK_IMG)
    timeoutElements(location, CLOCK_IMG)
}
function addGold() {
    var location = addElements(GOLD_IMG)
    timeoutElements(location, GOLD_IMG)
}
function addGlue() {
    var location = addElements(GLUE_IMG)
    timeoutElements(location, GLUE_IMG)
}
function addMagnet() {
    var location = addElements(MAGNET_IMG)
    timeoutElements(location, MAGNET_IMG)
}
function activateIntervals() {
    addClock()
    addGold()
    addGlue()
    addMagnet()
}
function undo() {
    gBoard[gGamerPos.i][gGamerPos.j].element = null
    renderCell(gGamerPos, '')

    gGamerPos = gPrevGamerLocation

    gBoard[gGamerPos.i][gGamerPos.j].element = GAMER
    renderCell(gGamerPos, GAMER_IMG)

    if (gUpdatedBoxLocation === undefined) return // if the gamer press the undo button before tuching a box it does an error.
    // so to avoid this situation i am chacking if the box location is updated.  

    gBoard[gUpdatedBoxLocation.i][gUpdatedBoxLocation.j].element = null
    renderCell(gUpdatedBoxLocation, '')

    gUpdatedBoxLocation = gPrevBoxLocation

    gBoard[gUpdatedBoxLocation.i][gUpdatedBoxLocation.j].element = BOX
    renderCell(gUpdatedBoxLocation, BOX_IMG)
}
function redo() {
    
    gBoard[gPrevBoxLocation.i][gPrevBoxLocation.j].element = null
    renderCell(gPrevBoxLocation, '')
    
    gPrevBoxLocation = gRedoBoxLocation
    
    gBoard[gPrevBoxLocation.i][gPrevBoxLocation.j].element = BOX
    renderCell(gPrevBoxLocation, BOX_IMG)
    
    gBoard[gGamerPos.i][gGamerPos.j].element = null
    renderCell(gGamerPos, '')
    
    gGamerPos = gUpdatedGamerLocation
    
    gBoard[gGamerPos.i][gGamerPos.j].element = GAMER
    renderCell(gGamerPos, GAMER_IMG)
}
function restartGame() {
    gWon = false
    onInitGame()
}
function renderCell(location, value) {
    var cellSelector = getClassName(location)
    var elCell = document.querySelector('.' + cellSelector)
    elCell.innerHTML = value
}
function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}
function getEmptyCell() {
    var emptyCells = []

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j]
            if ((cell.type !== WALL) && (!cell.element))
                emptyCells.push({ i, j })
        }
    } return emptyCells[getRandomInt(0, emptyCells.length - 1)]
}