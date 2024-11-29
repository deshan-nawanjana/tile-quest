/** Puzzle Module */
export const Puzzle = class {
  // module constructor
  constructor() {
    /** Piece count per side of puzzle */
    this.size = 0
    /** Puzzle data two dimensional array */
    this.data = []
  }
  /**
   * Initiate puzzle data
   * @param {number} size Piece count per side of puzzle
   * @param {boolean} size Shuffle puzzle tiles automatically
   */
  init(size, shuffle = true) {
    // store size
    this.size = size
    // generate puzzle array by size
    this.data = Array(size).fill(null).map((_x, i) => (
      Array(size).fill(null).map((_y, j) => (
        (j + 1) + (size * i)
      ))
    ))
    // clear last cell as free tile
    this.data[size - 1][size - 1] = null
    // return if should not shuffle
    if (!shuffle) { return }
    // move directions array
    const directions = ["right", "left", "down", "up"]
    // for each move
    for (let i = 0; i < Math.pow(size, 5); i++) {
      // get random direction
      const direction = directions[Math.floor(Math.random() * 4)]
      // move puzzle to shuffle
      this.move(direction)
    }
  }
  /**
   * Check if the puzzle is solved
   * @returns {boolean} Returns true if the puzzle is solved
   */
  done() {
    // for each row
    for (let i = 0; i < this.size; i++) {
      // for each col
      for (let j = 0; j < this.size; j++) {
        // check current cell data
        if (i === this.size - 1 && j === this.size - 1) {
          // loop reach final cell in order
          return true
        } else if (this.data[i][j] !== (j + 1) + (this.size * i)) {
          // cell found out if correct order
          return false
        }
      }
    }
  }
  /**
   * Move tiles by direction
   * @param {'left' | 'right' | 'up' | 'down'} direction Direction to move puzzle pieces
   * @returns {number | false} Returns tile index if moving succeeded
   */
  move(direction) {
    // find free cell coordinates
    const y = this.data.findIndex(row => row.includes(null))
    const x = this.data[y].findIndex(col => col === null)
    // method to slide
    const slide = (a, b, p, q) => {
      // switch free cell and tile
      this.data[a][b] = this.data[p][q]
      this.data[p][q] = null
      // return switched tile value
      return this.data[a][b]
    }
    // switch by direction
    if (direction === "right") {
      // free cell is at left edge
      if (x === 0) { return false }
      // switch tile to right
      return slide(y, x, y, x - 1)
    } else if (direction === "left") {
      // free cell is at right edge
      if (x === this.size - 1) { return false }
      // switch tile to left
      return slide(y, x, y, x + 1)
    } else if (direction === "down") {
      // free cell is at top edge
      if (y === 0) { return false }
      // switch tile to down
      return slide(y, x, y - 1, x)
    } else if (direction === "up") {
      // free cell is at bottom edge
      if (y === this.size - 1) { return false }
      // switch tile to up
      return slide(y, x, y + 1, x)
    }
  }
}
