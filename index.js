import { Puzzle } from "./assets/modules/Puzzle.js"

// create puzzle
const puzzle = new Puzzle()

// keys with their direction
const keys = [
  { direction: "left", keys: ["a", "ArrowLeft"] },
  { direction: "right", keys: ["d", "ArrowRight"] },
  { direction: "up", keys: ["w", "ArrowUp"] },
  { direction: "down", keys: ["s", "ArrowDown"] }
]

new Vue({
  el: "#app",
  data: {
    // ready state
    ready: false,
    // current screen
    screen: "options",
    // puzzle images
    images: [],
    // selected image
    image: null,
    // paying time
    time: { start: 0, current: 0 },
    // size of puzzle
    size: 4,
    // puzzle data
    data: [],
    // original data
    original: { display: false, data: [] },
    // loading state
    loading: true,
    // paying state
    playing: false,
    // puzzle locked state
    locked: false,
    // puzzle complete state
    complete: false
  },
  methods: {
    // preload images
    preload(src, select = true) {
      return new Promise(resolve => {
        // append loading item to images
        this.images.push({ loading: true, src })
        // get image index
        const index = this.images.length - 1
        // create image
        const image = new Image()
        // image load listener
        image.addEventListener("load", () => {
          // set as selected image
          if (select) { this.image = src }
          // set loaded flag
          setTimeout(() => {
            // stop loading
            this.images[index].loading = false
            // resolve as completed
            resolve()
          }, 100)
        })
        // image error listener
        image.addEventListener("error", () => {
          // set error flag on array
          this.images[index].error = true
        })
        // load image
        image.src = src
      })
    },
    // upload external image
    upload() {
      // create file input
      const input = document.createElement("input")
      // set input options
      input.type = "file"
      input.multiple = false
      input.accept = "image/*"
      // input select listener
      input.addEventListener("input", () => {
        // set image file
        const blob = input.files[0]
        // set image url
        this.image = URL.createObjectURL(blob)
      })
      // trigger file input
      input.click()
    },
    // resize puzzle
    resize(event) {
      // get size
      const size = parseInt(event.target.value)
      // initiate puzzle to resize
      puzzle.init(size, false)
      // clone original data
      this.original.data = JSON.parse(JSON.stringify(puzzle.data))
      // update puzzle
      this.update()
      // update size
      this.size = size
    },
    // start puzzle
    start() {
      // switch screen
      this.screen = "game"
      // init puzzle
      puzzle.init(this.size)
      // update puzzle
      this.update()
      // start playing flags
      this.playing = true
      this.complete = false
      this.locked = false
      this.original.display = false
      // reset time
      this.time.start = Date.now()
      this.time.current = Date.now()
    },
    // stop puzzle
    stop() {
      // reset playing flags
      this.locked = true
      this.playing = false
      this.complete = false
      this.original.display = false
      // switch screen
      this.screen = "options"
      // reset puzzle
      puzzle.init(this.size, false)
      // update puzzle
      this.update()
    },
    // generate timer string
    timer() {
      // get time difference
      const time = this.time.current - this.time.start
      // calculate values
      let hours = Math.floor(time / (1000 * 60 * 60))
      let minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60))
      let seconds = Math.floor((time % (1000 * 60)) / 1000)
      // add pad stats
      hours = String(hours).padStart(2, '0')
      minutes = String(minutes).padStart(2, '0')
      seconds = String(seconds).padStart(2, '0')
      // return time string
      return `${hours}:${minutes}:${seconds}`
    },
    // calculate tile style
    style(tile) {
      // return hidden variable for free tile
      if (tile === null) { return { '--visibility': "hidden" } }
      // calculate coordinates
      const x = (tile - 1) % this.size
      const y = Math.floor((tile - 1) / this.size)
      // return position variables
      return { '--x': x, '--y': y, backgroundImage: `url(${this.image})` }
    },
    // move puzzle tiles
    move(direction) {
      // return if not paying
      if (!this.playing) { return }
      // return if displaying original
      if (this.original.display) { return }
      // return if locked
      if (this.locked) { return }
      // set locked state
      this.locked = true
      // move puzzle by direction
      const tile = puzzle.move(direction)
      // get element by title
      const element = document.querySelector(`[data-tile="${tile}"]`)
      // check element
      if (element) {
        // set animation by direction
        element.setAttribute("data-animate", direction)
        // delay for animation
        setTimeout(() => {
          // remove animation attribute
          element.removeAttribute("data-animate")
          // update puzzle
          this.update()
          // reset lock state
          this.locked = false
          // check puzzle state
          this.check()
        }, 100)
      } else {
        // immediate update puzzle
        this.update()
        // reset lock state
        this.locked = false
        // check puzzle state
        this.check()
      }
    },
    // check puzzle completion
    check() {
      // check done state
      if (puzzle.done()) {
        // set completion
        this.complete = true
        // lock controls
        this.locked = true
      }
    },
    // update puzzle data
    update() {
      // clone puzzle data
      this.data = [...puzzle.data]
    }
  },
  mounted() {
    // delay to ready
    setTimeout(() => {
      // set ready state
      this.ready = true
      // preload first images
      this.preload("assets/images/puzzles/puzzle_1.png").then(() => {
        // stop loading
        this.loading = false
      })
      // load rest of images
      this.preload("assets/images/puzzles/puzzle_2.png", false)
      this.preload("assets/images/puzzles/puzzle_3.png", false)
      // initiate puzzle preview
      puzzle.init(this.size, false)
      // clone original data
      this.original.data = JSON.parse(JSON.stringify(puzzle.data))
      // update puzzle
      this.update()
      // keyboard event listener
      window.addEventListener("keydown", event => {
        // find direction item by key
        const item = keys.find(item => item.keys.includes(event.key))
        // move in matched direction
        if (item) { this.move(item.direction) }
      })
      // touch events origin data
      const origin = { coords: {}, moved: false }
      // set origin data on touch start
      window.addEventListener("touchstart", event => {
        // reset moved flag
        origin.moved = false
        // store origin coords
        origin.coords = event.changedTouches[0]
      })
      // apply direction on touch move
      window.addEventListener("touchmove", event => {
        // return if moved
        if (origin.moved) { return }
        // set moved flag
        origin.moved = true
        // get current coords
        const change = event.changedTouches[0]
        // get coords differences
        const xDef = change.clientX - origin.coords.clientX
        const yDef = change.clientY - origin.coords.clientY
        // check larger difference
        if (Math.abs(xDef) > Math.abs(yDef)) {
          // move in x direction
          this.move(xDef > 0 ? "right" : "left")
        } else {
          // move in y direction
          this.move(yDef > 0 ? "down" : "up")
        }
      })
    }, 400)
    // current time update with interval
    setInterval(() => {
      // update time while complete
      if (!this.complete) { this.time.current = Date.now() }
    }, 1000)
  }
})
