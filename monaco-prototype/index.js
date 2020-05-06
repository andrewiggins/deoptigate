// Check out these source files for help with PeekView:
// 1. ZoneWidget: https://git.io/JfGne
// 2. PeekViewWidget: https://git.io/JfGnJ
// 3. ReferenceWidget: https://git.io/JfGnt

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

function getIcon(type) {
  if (type == 'code') {
    return '▲'
  } else if (type == 'deopt') {
    return '▼'
  } else {
    return '☎'
  }
}

function load(require, monaco, peekView) {
  const html = document.getElementById('code').childNodes[1].textContent

  var editor = monaco.editor.create(document.getElementById('container'), {
    value: html,
    language: 'text/html',
    glyphMargin: true,
    contextmenu: false,
    readOnly: true,
  })

  window.editor = editor

  var decorations = editor.deltaDecorations(
    [],
    [
      {
        range: new monaco.Range(11, 20, 11, 20),
        options: {
          className: 'v8-deopt-marker',
          beforeContentClassName: 'v8-deopt-marker-inline',
          glyphMarginClassName: 'v8-deopt-marker-margin',
          inlineClassNameAffectsLetterSpacing: true,
        },
      },
    ]
  )

  // Add a content widget (scrolls inline with text)
  var contentWidget = {
    // allowEditorOverflow: true,
    domNode: null,
    getId: function () {
      return 'my.content.widget'
    },
    getDomNode: function () {
      if (!this.domNode) {
        this.domNode = document.createElement('div')
        this.domNode.className = 'v8-deopt-marker-content-widget ics'
        this.domNode.innerHTML = '☎'
        editor.applyFontInfo(this.domNode)
      }
      return this.domNode
    },
    getPosition: function () {
      return {
        position: {
          lineNumber: 11,
          column: 20,
        },
        preference: [monaco.editor.ContentWidgetPositionPreference.EXACT],
      }
    },
  }
  editor.addContentWidget(contentWidget)

  class Test extends peekView.PeekViewWidget {
    constructor(editor, options) {
      super(editor, options)
      this.create()
    }
    _fillBody(container) {
      const title = document.createElement('h1')
      title.textContent = 'Hello World!'
      container.appendChild(title)
      console.log(container)
    }
  }

  const options = {
    className: 'test-peek-widget',
    keepEditorSelection: true,
  }

  const t = new Test(editor, options)
  t.show(
    {
      startLineNumber: 11,
      startColumn: 20,
      endLineNumber: 11,
      endColumn: 20,
    },
    18
  )

  editor.onMouseDown(function (e) {
    console.log('mousedown:', e.target.toString())
  })
}

/** @type {(...args: any[]) => any} */
const amdRequire = window.require
const deps = amdRequire(
  ['require', 'vs/editor/editor.main', 'vs/editor/contrib/peekView/peekView'],
  load
)
