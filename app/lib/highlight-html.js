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

/**
 * @param {MarkerResolver} markerResolver
 * @param {number} curLine
 * @param {number} curColumn
 */
function locHasMarker(markerResolver, curLine, curColumn) {
  const nextLocation = markerResolver.nextLocation()
  return (
    nextLocation &&
    curLine == nextLocation.line &&
    curColumn >= nextLocation.column
  )
}

/**
 * @typedef {import('../../lib/rendering/marker-resolver')} MarkerResolver
 * @param {Node} element
 * @param {MarkerResolver} markerResolver
 * @param {number} curLine
 * @param {number} curColumn
 */
function consumeMarkers(element, markerResolver, curLine, curColumn) {
  let refChild = element
  while (locHasMarker(markerResolver, curLine, curColumn)) {
    const { insertBefore, insertAfter } = markerResolver.resolve(
      markerResolver.nextLocation()
    )

    const div = document.createElement('div')
    div.innerHTML = insertBefore + insertAfter

    const childNodes = Array.from(div.childNodes);
    for (let i = 0; i < childNodes.length; i++) {
      const child = childNodes[i]

      element.parentNode.insertBefore(child, refChild.nextSibling)
      refChild = child
    }
  }

  return refChild
}

/** @type {(markerResolver: MarkerResolver) => (env: Prism.Environment) => void} */
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

        if (locHasMarker(markerResolver, lineCount, columnCount)) {
          const lastMark = consumeMarkers(
            element,
            markerResolver,
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
