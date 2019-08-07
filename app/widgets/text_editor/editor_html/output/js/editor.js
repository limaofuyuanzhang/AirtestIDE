function confirmDialog(e, t, i, r) {
	e.openConfirm ? e.openConfirm(t, r) : confirm(i) && r[0]()
}
var editor = CodeMirror(document.body),
	imgMarkerList = [],
	doReplaceConfirm = "<div class='confirmInsertDiv'> Poco mode has changed. Do you want to insert poco init code at the current cursor position? <a class='dialogBtn'>Yes</a> <a class='dialogBtn'>No</a> </div>";
$(function() {
	function e(e, t) {
		if(!editor.state.completionActive && 13 != t.keyCode && 27 != t.keyCode) {
			editor.removeLineError();
			var i = editor.getCursor(),
				r = e.getDoc().getLine(i.line),
				o = /((touch|swipe)\(Template\(.*\)\))(,\s*.*)*\)/g,
				n = o.exec(r);
			if(n && n[2]) i.ch > n.index + n[1].length && i.ch < n.index + n[0].length && e.showHint({
				hint: CodeMirror.hint.airtest,
				completeSingle: !1
			});
			else {
				var a = editor.getTokenAt(i),
					d = "";
				a.string.match(/^[.`\w@]\w*$/) && (d = a.string), d.length > 0 && e.showHint("0" != qtbridge.enableAutoComplete ? {
					hint: CodeMirror.hint.jedi,
					completeSingle: !1
				} : {
					hint: CodeMirror.hint.poco,
					completeSingle: !1
				})
			}
		}
	}

	function t(e, t, i) {
		var r = editor.doc.markText(e, t, {
			className: "imgEditor",
			replacedWith: i,
			readonly: !0
		});
		imgMarkerList.push(r)
	}
	CodeMirror.registerHelper("hint", "python", CodeMirror.pythonHint);
	var i, r = 200;
	editor.on("keyup", function(t, o) {
		clearTimeout(i), i = setTimeout(function() {
			e(t, o)
		}, r)
	}), editor.removeLineError = function() {
		globalVariable.running_failed && (editor.getDoc().removeLineClass(globalVariable.active_line, "background", "line-error-MoonLight"), editor.getDoc().removeLineClass(globalVariable.active_line, "background", "line-error-DarkShadow"), globalVariable.running_failed = !1)
	}, editor.removeLineRunning = function() {
		editor.getDoc().removeLineClass(globalVariable.active_line, "background", "line-running-MoonLight"), editor.getDoc().removeLineClass(globalVariable.active_line, "background", "line-running-DarkShadow")
	}, editor.addText = function(e, t, i) {
		editor.removeLineError(), t && (e += "\n"), i || (i = editor.getCursor()), editor.doc.replaceRange(e, i, i), editor.setCursor({
			line: i.line + 1,
			ch: 0
		}), editor.focus()
	}, editor.addTextWithImage = function(e, i, r) {
		var o = editor.getCursor();
		editor.addText(e, i, r);
		for(var n = /Template\(([\u4e00-\u9fa5\w\s\+\:\/\\\._-]*\.png)(.*?[\)|\]]){0,1}\)/g, a = n.exec(e), d = new Array; null !== a && a.length > 1;) {
			var l = document.createElement("img");
			l.setAttribute("class", "imgClass"), d.push(l), l.setAttribute("src", a[1]), l.setAttribute("alt", a[1]), l.setAttribute("title", a[1]);
			var c = editor.findPosH(o, a.index, "char"),
				g = a[0].length,
				s = editor.findPosH(c, g, "char");
			! function(e, i, r) {
				setTimeout(function() {
					t(e, i, r)
				}, 1)
			}(c, s, l), a = n.exec(e)
		}
	}, editor.addTextWithImageTest = function(e, i, r) {
		var o = editor.getCursor();
		editor.addText(e, r, null);
		for(var n = 0; n < i.length; n++) {
			var a = editor.findPosH(o, i[n][1][0], "char"),
				d = editor.findPosH(o, i[n][1][1], "char"),
				l = document.createElement("img");
			l.setAttribute("class", "imgClass"), l.setAttribute("src", i[n][0]), l.setAttribute("alt", i[n][0]), l.setAttribute("title", i[n][0]), l.setAttribute("data-start", a), l.setAttribute("data-end", d),
				function(e, i, r) {
					setTimeout(function() {
						t(e, i, r)
					}, 1)
				}(a, d, l)
		}
	}, editor.addTextWithLink = function(e, t, i) {
		var r = editor.getCursor();
		editor.addText(e, t, i);
		for(var o = /\[([\u4e00-\u9fa5\w\s]*)\]\((http.*)\)/g, n = o.exec(e); null !== n && n.length > 1;) {
			var a = document.createElement("a"),
				d = document.createTextNode(n[1]);
			a.setAttribute("href", n[2]), a.setAttribute("class", "helpinfo"), a.appendChild(d), a.onclick = function() {
				return event.preventDefault(), qtbridge.openLink($(this).attr("href")), !1
			};
			var l = editor.findPosH(r, n.index, "char"),
				c = n[0].length,
				g = editor.findPosH(l, c, "char");
			editor.doc.markText(l, g, {
				className: "link",
				replacedWith: a
			}), n = o.exec(e)
		}
	}, editor.on("copy", function(e) {
		var t = e.getSelection(); - 1 !== t.indexOf("Template") && qtbridge.copy(t)
	}), editor.on("paste", function(e, t) {
		var i = t.clipboardData.getData("Text"); - 1 !== i.indexOf("Template") && (t.preventDefault(), qtbridge.paste(i))
	}), editor.on("change", function(e) {
		var t = e.getDoc().getValue();
		qtbridge.content = t
	}), editor.addKeyMap({
		Tab: function(e) {
			if(e.somethingSelected()) {
				var t = editor.getSelection("\n");
				if(t.length > 0 && (t.indexOf("\n") > -1 || t.length === e.getLine(e.getCursor().line).length)) return void e.indentSelection("add")
			}
			e.execCommand(e.options.indentWithTabs ? "insertTab" : "insertSoftTab")
		},
		"Shift-Tab": function(e) {
			e.indentSelection("subtract")
		},
		"Ctrl-/": function(e) {
			e.execCommand("toggleComment")
		},
		"Cmd-/": function(e) {
			e.execCommand("toggleComment")
		}
	}), CodeMirror.defineSimpleMode("consolelog", {
		start: [{
			regex: /\[\w+\]|\<\w+\>/,
			token: "type"
		}, {
			regex: /"(?:[^\\]|\\.)*?(?:"|$)/,
			token: "string"
		}, {
			regex: /\[(\d|\:)+\]/,
			token: "variable-2"
		}, {
			regex: /(?:Traceback|(\w+)Error)\b/,
			token: "error"
		}, {
			regex: /\b(?:def|var|return|if|for|while|else|do|this|python|exec|not)\b/,
			token: "keyword"
		}, {
			regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i,
			token: "number"
		}, {
			regex: />>>/,
			token: "atom"
		}, {
			regex: /\sin\b/,
			token: "keyword"
		}, {
			regex: /\s*\w+\s+(?=\:)/,
			token: "keyword"
		}, {
			regex: /[\u4e00-\u9fa5]+(?=\:)/,
			token: "variable-3"
		}]
	}), "undefined" != typeof qt && new QWebChannel(qt.webChannelTransport, function(e) {
		window.qtbridge = e.objects.qtbridge, init_editor_options(editor, qtbridge.mode, qtbridge.menuLang);
		var t = qtbridge.fontSize;
		$("body").css("fontSize", t), editor.refresh(), init_editor_bridge(qtbridge.mode), qtbridge.registrationFinished()
	}), editor.on("dblclick", function(e, t) {
		if(t.target) {
			var i = $(t.target);
			if("imgClass" === i.attr("class")) {
				for(var r = e.coordsChar({
						left: t.clientX,
						top: t.clientY
					}), o = e.getLine(r.line), n = {
						line: r.line,
						ch: 0
					}, a = {
						line: r.line,
						ch: o.length
					}, d = imgMarkerList.filter(function(e) {
						return e.replacedWith == i.context
					}), l = 0; l < d.length; l++) {
					var c = d[l].find();
					if(c.from.line == r.line && c.from.ch <= r.ch && c.to.line == r.line && c.to.ch >= r.ch) return o = editor.getRange(c.from, c.to), void qtbridge.modify_img(o, c.from, c.to)
				}
				qtbridge.modify_img(o, n, a)
			}
		}
	})
});