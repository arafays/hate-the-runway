const database = require('./database')

const when = (fn, callback, ms = 50) => {
  const interval = window.setInterval(() => {
    if (fn()) {
      window.clearInterval(interval)
      callback()
    }
  }, ms)
}

const find = (className, el = document) => Array.from(el.getElementsByClassName(className))

class RunwayHater {
  constructor () {
    this.init = this.init.bind(this)

    this.init()
  }

  init() {
    this.pullItems()
    .then(itemIds => {
      this.hatedProducts = itemIds
      this.getProducts()
    })
  }

  getProducts() {
    const grid = find('grid-products')[0]
    const productElements = find('grid-product-card')

    grid.classList.remove('is-ready')

    productElements.forEach((el, i) => {
      const isLoaded = () => !!find('grid-product-card-inner', el)[0]

      const onLoaded = () => {
        grid.classList.add('is-ready')
        this.injectHate(el)

        // Keep an eye on the first one.
        // If it gets pulled out of the DOM, we gotta reset.
        if (i === 0) {
          when(() => !el.parentNode, this.init)
        }
      }

      when(isLoaded, onLoaded)
    })
  }

  injectHate(el) {
    const linkEl = find('grid-product-card-inner', el)[0]
    const parts = linkEl.href.split('/')
    const itemId = parts[parts.length - 1]
    const isHated = this.hatedProducts.includes(itemId)

    if (isHated) {
      el.style.display = 'none'
      return
    }

    const hateButton = document.createElement('BUTTON')
    hateButton.classList.add('hate-it')
    hateButton.innerHTML = 'hate it'

    hateButton.addEventListener('click', () => {
      this.hateIt(itemId)
      el.style.display = 'none'
    })

    el.appendChild(hateButton)
  }

  pullItems() {
    return new Promise(resolve => {
      database.ref('htr/items/').once('value', (snapshot) => {
        const items = snapshot.val()
        const itemIds = Object.keys(items).map((key) => items[key].itemId)
        resolve(itemIds)
      })
    })
  }

  hateIt(itemId) {
    this.pullItems()
    .then(itemIds => {
      const isHated = itemIds.includes(itemId)
      if (!isHated) database.ref('htr/items/').push({ itemId })
    })
  }
}

new RunwayHater()
