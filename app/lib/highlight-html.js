const Prism = require('prismjs')
require('prismjs/plugins/line-numbers/prism-line-numbers')

/**
 * @param {Node} element
 * @param {Node} root
 */
function nextElement(element, root) {
  if (element == root) {
    return null
  } else if (element.firstChild) {
    return element.firstChild
  } else if (element.nextSibling) {
    return element.nextSibling
  } else {
    do {
      element = element.parentNode
    } while (element && element != root && !element.nextSibling)

    return element ? element.nextSibling : null
  }
}

function getIcon(type) {
  if (type == 'code') {
    return '▲'
  } else if (type == 'deopt') {
    return '▼'
  } else {
    return '☎'
  }
}

function locHasMarker(markers, curLine, curColumn) {
  const nextMarker = markers[0]
  return (
    markers.length > 0 &&
    curLine == nextMarker.line &&
    curColumn >= nextMarker.column
  )
}

function consumeMarkers(element, markers, curLine, curColumn) {
  let refChild = element
  while (locHasMarker(markers, curLine, curColumn)) {
    const marker = markers.shift()

    const lastMark = document.createElement('mark')
    lastMark.textContent = getIcon(marker.type)

    element.parentNode.insertBefore(lastMark, refChild.nextSibling)
    refChild = lastMark
  }

  return refChild
}

const typeOrder = ['code', 'deopt', 'ics']
function sortMarkers(markers) {
  return markers.sort((loc1, loc2) => {
    if (loc1.line != loc2.line) {
      return loc1.line - loc2.line
    } else if (loc1.column != loc2.column) {
      return loc1.column - loc2.column
    } else if (loc1.type != loc2.type) {
      return typeOrder.indexOf(loc1.type) - typeOrder.indexOf(loc2.type)
    } else {
      return 0
    }
  })
}

const markers = sortMarkers([
  { line: 9, column: 27, type: 'code' },
  { line: 11, column: 20, type: 'code' },
  { line: 95, column: 22, type: 'code' },
  { line: 98, column: 33, type: 'deopt' },
  { line: 98, column: 33, type: 'ics' },
  { line: 98, column: 39, type: 'ics' },
  { line: 99, column: 18, type: 'deopt' },
  { line: 109, column: 17, type: 'deopt' },
  { line: 109, column: 17, type: 'ics' },
  { line: 111, column: 21, type: 'ics' },
  { line: 139, column: 26, type: 'code' },
  { line: 142, column: 34, type: 'deopt' },
])

const addMarkersPlugin = (markerResolver) => (env) => {
  /** @type {Node} */
  const root = env.element
  /** @type {Node} */
  let element = root.firstChild
  let lineCount = 1,
    columnCount = 1
  while (element) {
    if (element.nodeType == 3 /* TEXT_NODE */) {
      const text = element.data

      // Handle of text node contains multiple lines
      // TODO - Inserting markers in the middle of a text node doesn't work
      const lines = text.split('\n')
      for (let i = 0; i < lines.length; i++) {
        if (i > 0) {
          lineCount += 1
          columnCount = 1
        }

        const line = lines[i]
        columnCount += line.length

        if (locHasMarker(markers, lineCount, columnCount)) {
          const lastMark = consumeMarkers(
            element,
            markers,
            lineCount,
            columnCount
          )

          element = nextElement(lastMark, root)
        }
      }
    }

    element = nextElement(element, root)
  }
}

function highlightHtml(code, markerResolver) {
  const codeElement = document.createElement('code')
  codeElement.textContent = code

  const preElement = document.createElement('pre')
  preElement.className = 'language-markup line-numbers'
  preElement.style.margin = '0'
  preElement.appendChild(codeElement)

  const hook = addMarkersPlugin(markerResolver)
  Prism.hooks.add('after-highlight', hook)

  Prism.highlightElement(codeElement)

  const index = Prism.hooks.all['after-highlight'].indexOf(hook)
  Prism.hooks.all['after-highlight'].splice(index, 1)

  return preElement.outerHTML
}

module.exports = highlightHtml
