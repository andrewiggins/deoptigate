var jsCode = [
	'"use strict";',
	'function Person(age) {',
	'	if (age) {',
	'		this.age = age;',
	'	}',
	'}',
	'Person.prototype.getAge = function () {',
	'	return this.age;',
	'};'
].join('\n');

var editor = monaco.editor.create(document.getElementById("container"), {
	value: jsCode,
	language: "javascript",
	glyphMargin: true,
	contextmenu: false,
    readOnly: true
});

window.editor = editor;

var decorations = editor.deltaDecorations([], [
	{
		range: new monaco.Range(3,1,3,1),
		options: {
			isWholeLine: true,
			className: 'myDecorClass',
			glyphMarginClassName: 'myGlyphMarginClass'
		}
	},
    {
		range: new monaco.Range(7,7,7,7),
		options: {
			className: 'phone-decor',
            beforeContentClassName: 'phone-decor-before',
            // inlineClassName: 'phone-decor-inline',
            inlineClassNameAffectsLetterSpacing: true,
		}
	}
]);

// Add a zone to make hit testing more interesting
var viewZoneId = null;
editor.changeViewZones(function(changeAccessor) {
		var domNode = document.createElement('div');
		domNode.style.background = 'lightgreen';
		viewZoneId = changeAccessor.addZone({
					afterLineNumber: 3,
					heightInLines: 3,
					domNode: domNode
		});
        console.log(viewZoneId)
});

// Add a content widget (scrolls inline with text)
var contentWidget = {
    allowEditorOverflow: true,
	domNode: null,
	getId: function() {
		return 'my.content.widget';
	},
	getDomNode: function() {
		if (!this.domNode) {
			this.domNode = document.createElement('div');
            this.domNode.className = 'ics-content-widget';
			this.domNode.innerHTML = '☎';
			// this.domNode.innerHTML = '&nbsp;';

            // Copy Editor font styles
            // this.domNode.style.fontSize = '14px';
            // this.domNode.style.fontFamily = 'Consolas, "Courier New", monospace';
            // this.domNode.style.fontFeatureSettings = '"liga" 0, "calt" 0';
            // this.domNode.lineHeight = '19px';
            // this.domNode.letterSpacing = '0px';
            editor.applyFontInfo(this.domNode);
		}
		return this.domNode;
	},
	getPosition: function() {
		return {
			position: {
				lineNumber: 7,
				column: 7
			},
			preference: [monaco.editor.ContentWidgetPositionPreference.EXACT]
		};
	}
};
editor.addContentWidget(contentWidget);

// Add an overlay widget
// var overlayWidget = {
//     // allowEditorOverflow: true,
// 	domNode: null,
// 	getId: function() {
// 		return 'my.overlay.widget';
// 	},
// 	getDomNode: function() {
// 		if (!this.domNode) {
// 			this.domNode = document.createElement('div');
// 			this.domNode.innerHTML = 'My overlay widget';
// 			this.domNode.style.background = 'grey';
// 			this.domNode.style.right = '30px';
// 			this.domNode.style.top = '50px';
// 		}
// 		return this.domNode;
// 	},
// 	getPosition: function() {
// 		return null;
// 	}
// };
// editor.addOverlayWidget(overlayWidget);

var output = document.getElementById('output');
function showEvent(str) {
	while(output.childNodes.length > 6) {
		output.removeChild(output.firstChild.nextSibling.nextSibling);
	}
	output.appendChild(document.createTextNode(str));
	output.appendChild(document.createElement('br'));
}



editor.onMouseMove(function (e) {
	showEvent('mousemove - ' + e.target.toString());
});
editor.onMouseDown(function (e) {
	showEvent('mousedown - ' + e.target.toString());
    console.log(e.target);
    console.log(e.target.toString());
});
editor.onContextMenu(function (e) {
	showEvent('contextmenu - ' + e.target.toString());
});
editor.onMouseLeave(function (e) {
	showEvent('mouseleave');
});


