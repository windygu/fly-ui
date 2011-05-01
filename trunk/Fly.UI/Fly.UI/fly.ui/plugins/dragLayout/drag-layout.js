; (function($) {
	var dragobj = {}
	var getByID = function(obj) {
		return typeof (obj) == "string" ? document.getElementById(obj) : obj
	}


	var oDel = function(obj) {
		if (getByID(obj) != null) {
			getByID(obj).parentNode.removeChild(getByID(obj))
		}
	}


	function on_ini() {
		String.prototype.inc = function(s) {
			return this.indexOf(s) > -1 ? true : false
		}
		var agent = navigator.userAgent
		window.isOpr = agent.inc("Opera")
		window.isIE = agent.inc("IE") && !isOpr
		window.isMoz = agent.inc("Mozilla") && !isOpr && !isIE
		if (isMoz) {
			Event.prototype.__defineGetter__("x", function() {
				return this.clientX + 2
			})
			Event.prototype.__defineGetter__("y", function() {
				return this.clientY + 2
			})
		}
	}
	on_ini()
	var config =
	{
		headerSelecter: ".dl-header",
		contentSelecter: ".dl-content",
		blockSelecter: "dl-block",
		placeSelecter: "dl-place"
	};


	var dragLayout = function(_config) {
		$.extend(config, _config);
		var bs = $(config.headerSelecter);
		bs.each(function() {
			dragLayout.addBlock(this)
		});


		$(window).focus(moduseup).blur(moduseup);
		$(document).mouseup(moduseup).bind("selectstart", function() {
			return false
		});
		document.onmousemove = onmousemove
	}


	$.extend({
		dragLayout: dragLayout
	});


	dragLayout.addBlock = function(block, placeSelecter) {
		block = $(block);
		block[0].onmousedown = function(e) {
			if (dragobj.o != null)
				return false
			e = e || event
			dragobj.o = this.parentNode
			dragobj.xy = getxy(dragobj.o)
			dragobj.xx = { left: e.x - dragobj.xy.left, top: e.y - dragobj.xy.top };
			dragobj.o.style.width = dragobj.xy.width + "px"
			//dragobj.o.style.height = dragobj.xy.height + "px"
			dragobj.o.style.left = (e.x - dragobj.xx.left) + "px"
			dragobj.o.style.top = (e.y - dragobj.xx.top) + "px"
			dragobj.o.style.position = "absolute"
			var om = document.createElement("div")
			om.style.border = "1px solid black"
			dragobj.otemp = om
			om.style.width = dragobj.xy.width + "px"
			om.style.height = (dragobj.o.offsetHeight || dragobj.o.clientHeight) + "px"
			dragobj.o.parentNode.insertBefore(om, dragobj.o)
			return false
		};


		if (placeSelecter) {
			var p = $(placeSelecter)
			if (p[0] && p[0] != block[0].parentNode)
				p[0].appendChild(block[0])
		}
	}

	dragLayout.closeBlock = function(block) {
		block = $(block);
		block.each(function(i, b) {
			b.parentNode.removeChild(b);
		})
	}

	dragLayout.collapseBlock = function(block) {
		block = $(block);
		block.each(function(i, b) {
			$(config.contentSelecter, b).hide()
		})
	}

	dragLayout.extendBlock = function(block) {
		block = $(block);
		block.each(function(i, b) {
			$(config.contentSelecter, b).show()
		})
	}

	var moduseup = function() {
		if (dragobj.o != null) {
			dragobj.o.style.width = "auto"
			//dragobj.o.style.height = "auto"
			dragobj.otemp.parentNode.insertBefore(dragobj.o, dragobj.otemp)
			dragobj.o.style.position = ""
			oDel(dragobj.otemp)
			dragobj = {}
		}
	}
	var onmousemove = function(e) {
		e = e || event
		if (dragobj.o != null) {
			dragobj.o.style.left = (e.x - dragobj.xx.left) + "px"
			dragobj.o.style.top = (e.y - dragobj.xx.top) + "px"
			createtmpl(e)
		}
	}
	function getxy(e) {

		var t = e.offsetTop;
		var l = e.offsetLeft;
		var w = e.offsetWidth;
		var h = e.offsetHeight;
		while (e = e.offsetParent) {
			t += e.offsetTop;
			l += e.offsetLeft;
		}
		return { top: t, left: l, width: w, height: h }
	}
	function inner(o, e) {
		var a = getxy(o)
		if (e.x > a.left && e.x < (a.left + a.width) && e.y > a.top && e.y < (a.top + a.height)) {
			if (e.y < (a.top + a.height / 2))
				return 1;
			else
				return 2;
		}
		else
			return 0;
	}
	function createtmpl(e) {
		var blocks = $(config.blockSelecter);
		var isReturn = false;
		blocks.each(function(i, block) {
			if (block == dragobj.o)
				return
			var b = inner(block, e)
			if (b == 0)
				return
			dragobj.otemp.style.width = block.offsetWidth
			if (b == 1) {
				block.parentNode.insertBefore(dragobj.otemp, block)
			}
			else {
				if (block.nextSibling == null) {
					block.parentNode.appendChild(dragobj.otemp)
				}
				else {
					block.parentNode.insertBefore(dragobj.otemp, block.nextSibling)
				}
			}
			isReturn = true;
		})
		if (isReturn)
			return

		var places = $(config.placeSelecter);
		var appended = false
		places.each(function(i, place) {
			var pos = getxy(place);
			if (e.x < pos.left || e.x > pos.left + pos.width)
				return

			if (place.children.length > 0) {
				var lastXY = getxy(place.children[place.children.length - 1])
				if ((e.y < lastXY.top + lastXY.height ) || e.y > pos.top + pos.height)
					return
			}
			//&& place != dragobj.o.parentNode
			appended = true
			place.appendChild(dragobj.otemp)
			dragobj.otemp.style.width = (pos.width - 10) + "px"
		})


	}
})(jQuery);