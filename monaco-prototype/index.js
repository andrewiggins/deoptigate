// Check out these source files for help with PeekView:
// 1. ZoneWidget: https://git.io/JfGne
// 2. PeekViewWidget: https://git.io/JfGnJ
// 3. ReferenceWidget: https://git.io/JfGnt

const typeOrder = ['code', 'deopt', 'ics']

/**
 * @typedef {{ line: number; column: number; type: string; }} Marker
 * @param {Marker[]} markers
 */
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

/**
 * @param {Marker} marker
 */
function getMarkerId(marker) {
  return `v8-deopt-marker-${marker.line}:${marker.column}:${marker.type}`
}

const ContentWidgetClassName = 'v8-deopt-marker-content-widget'

class DeoptContentWidget {
  constructor(editor, markerData) {
    this.editor = editor
    this.markerData = markerData
    this.domNode = null
  }
  getId() {
    return getMarkerId(this.markerData) + '-content-widget'
  }
  getDomNode() {
    if (!this.domNode) {
      this.domNode = document.createElement('div')
      this.domNode.className = `${ContentWidgetClassName} ${this.markerData.type}`
      this.domNode.innerHTML = getIcon(this.markerData.type)
      this.editor.applyFontInfo(this.domNode)
    }
    return this.domNode
  }
  getPosition() {
    const lineNumber = this.markerData.line
    const column = this.markerData.column
    return {
      position: {
        lineNumber,
        column,
      },
      preference: [0 /* monaco.editor.ContentWidgetPositionPreference.EXACT */],
    }
  }
}

class DeoptMarker {
  /**
   * @param {import('monaco-editor').editor.IStandaloneCodeEditor} editor
   * @param {Marker} markerData
   * @param {any} DeoptPeekView
   * @param {import('monaco-editor')} monaco
   */
  constructor(editor, markerData, DeoptPeekView, monaco) {
    this.editor = editor
    this.markerData = markerData

    this.markerId = getMarkerId(markerData)
    this.contentWidgetId = null
    this.peekView = new DeoptPeekView(editor, markerData)

    this._addInlineWidgets(editor, markerData, monaco)
  }

  showPeekView() {
    this.peekView.show(
      {
        startLineNumber: this.markerData.line,
        startColumn: this.markerData.column,
        endLineNumber: this.markerData.line,
        endColumn: this.markerData.column,
      },
      18
    )
  }

  /**
   * @param {import('monaco-editor').editor.IStandaloneCodeEditor} editor
   * @param {Marker} markerData
   * @param {import('monaco-editor')} monaco
   */
  _addInlineWidgets(editor, markerData, monaco) {
    this.decorationIds = editor.deltaDecorations(
      [],
      [
        {
          range: new monaco.Range(
            markerData.line,
            markerData.column,
            markerData.line,
            markerData.column
          ),
          options: {
            className: 'v8-deopt-marker',
            beforeContentClassName: 'v8-deopt-marker-inline',
            glyphMarginClassName: 'v8-deopt-marker-margin',
            // inlineClassNameAffectsLetterSpacing: true,
          },
        },
      ]
    )

    const contentWidget = new DeoptContentWidget(editor, markerData)
    this.contentWidgetId = contentWidget.getId()
    this.editor.addContentWidget(contentWidget)
  }
}

/**
 * @param {Require} require
 * @param {import('monaco-editor')} monaco
 * @param {any} peekView
 */
function load(require, monaco, peekView) {
  const html = document.getElementById('code').childNodes[1].textContent

  var editor = monaco.editor.create(document.getElementById('container'), {
    value: html,
    language: 'text/html',
    glyphMargin: true,
    contextmenu: false,
    readOnly: true,
    theme: 'vs-dark',
  })

  class DeoptPeekView extends peekView.PeekViewWidget {
    constructor(editor, markerData) {
      super(editor, {
        className: 'v8-deopt-peek-view',
      })
      this.create()
    }
    _fillBody(container) {
      const title = document.createElement('h1')
      title.textContent = 'Hello World!'
      container.appendChild(title)
    }
  }

  const markerMap = new Map()
  for (const marker of markers) {
    const deoptMarker = new DeoptMarker(editor, marker, DeoptPeekView, monaco)
    markerMap.set(deoptMarker.contentWidgetId, deoptMarker)
  }

  editor.onMouseDown(function (e) {
    const contentWidgetId = e.target.detail
    if (markerMap.has(contentWidgetId)) {
      markerMap.get(contentWidgetId).showPeekView()
    }
  })
}

/**
 * @typedef {(deps: string[], loader: (...args) => void) => void} Require
 * @type {Require}
 */
const amdRequire = window.require
const deps = amdRequire(
  ['require', 'vs/editor/editor.main', 'vs/editor/contrib/peekView/peekView'],
  load
)
