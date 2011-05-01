var _hasFly = window.fly && window.fly.version
var __dragLayout = function($) {
	$.ui = $.ui || {}
	var dragHandle = 0;

	function getRect(box) {
		var pos = { top: box.offsetTop, left: box.offsetLeft, width: box.offsetWidth, height: box.offsetHeight }
		var rect = box.getBoundingClientRect ? box.getBoundingClientRect() : (box.getClientRects ? box.getClientRects() : null)
		if (rect) {
			pos.top = rect.top;
			pos.left = rect.left;
			return pos;
		}

		while (box = box.offsetParent) {
			pos.top += box.offsetTop;
			pos.left += box.offsetLeft;
		}
		return pos
	}

	function getMousePlace(box, e) {
		var pos = getRect(box)
		if (e.clientX > pos.left && e.clientX < (pos.left + pos.width) && e.clientY > pos.top && e.clientY < (pos.top + pos.height)) {
			if (e.clientY < (pos.top + pos.height / 2))
				return 1;
			else
				return 2;
		}
		else
			return 0;
	}

	$.extend($, {
		dragLayout: function(config) {
			return new $.ui.DragLayout(config);
		}
	});

	//## DragLayoutItem
	$.ui.DragLayoutItem = function(dom, owner) {
		var me = this
		this.$dom = $(dom)
		this.dom = this.$dom[0];
		this.dom.ownerClass = this;
		this.ownerClass = owner;
		this.closeButton = this.$dom.find(owner.config.closeSelector)
		this.toggleButton = this.$dom.find(owner.config.toggleSelector)
		this.content = this.$dom.find(owner.config.contentSelector)
		this.header = this.$dom.find(owner.config.headerSelector)
		owner.items.push(this);
		me.config = me.ownerClass.config
		this.close = function() {
			if (_hasFly && me.ownerClass.fire("onCloseItem",null, me) == false) return false;
			me._oldParent = me.dom.parentNode
			if (me.dom.parentNode)
				me.dom.parentNode.removeChild(me.dom)
		}

		this.show = function() {
			if (_hasFly && me.ownerClass.fire("onShowItem",null, me) == false) return false;
			me.$dom.show()
			if (me.dom.contains ? !me.ownerClass.container[0].contains(me.dom) : !(me.ownerClass.container[0].compareDocumentPosition(me.dom) & 16))
				me.ownerClass.addItem(me, me._oldParent)
		}

		this.hide = function() {
			if (_hasFly && me.ownerClass.fire("onHideItem",null, me) == false) return false;
			me.$dom.hide()
		}

		this.toggle = function() {
			me.$dom.hasClass(me.config.collapseCss) ? me.extend() : me.collapse()
		}

		this.collapse = function() {
			if (_hasFly && me.ownerClass.fire("onCollapseItem",null, me) == false) return false;
			me.$dom.addClass(me.config.collapseCss)
			me.content.hide()
		}

		this.extend = function(item) {
			if (_hasFly && me.ownerClass.fire("onExtendItem",null, me) == false) return false;
			me.$dom.removeClass(me.config.collapseCss)
			me.content.show()
		}

		this._mouseDown = function(e) {
			var context = me.ownerClass.context
			//if (me.closeButton.index(e.target) > -1 || me.toggleButton.index(e.target) > -1) return
			if (context.dragingItem != null)
				return false
			if (_hasFly && me.ownerClass.fire("onMoveStart",null, me) == false)
				return false
			var ex = e.clientX;
			var ey = e.clientY;

			dragHandle = window.setTimeout(function() {
				context.dragingItem = me
				context.dragingItem.$dom.addClass(me.config.dragingCss)

				me.ownerClass.places = me.ownerClass.container.find(me.config.placeSelector)

				context.startInfo = getRect(context.dragingItem.dom)
				context.startInfo.x = ex;
				context.startInfo.y = ey;
				
				context.oldPosition = context.dragingItem.dom.style.position;
				context.oldWidth = context.dragingItem.dom.style.width;

				context.dragingItem.$dom.css({
					width: context.startInfo.width,
					left: ex - context.startInfo.x ,
					top: ey - context.startInfo.y,
					position: "absolute",
					zIndex:1000000
				});

				var om = $('<div class="' + me.config.tempItemCss + '" ></div>');
				context.tempBox = om
				om.height(context.dragingItem.$dom.height())
				context.dragingItem.$dom.before(om)
			}, 200)
			return false
		}


	}
	$.extend($.ui.DragLayoutItem.prototype,
	{
		initEvent: function() {
			if (this.initEvented) return
			this.initEvented = true
			this.header.mousedown(this._mouseDown);
			this.closeButton.click(this.close)
			this.toggleButton.click(this.toggle)
		}
	})

	//#end

	//## DragLayout
	$.ui.DragLayout = function(_config) {
		var me = this;
		this.config = $.extend({}, $.ui.DragLayout.DefaultConfig, _config);
		this.context = {}
		this.items = [];
		this.itemMap = {};
		this.container = $(me.config.container);

		this._mouseUp = function() {
			window.clearTimeout(dragHandle);
			if (me.context.dragingItem != null) {
				me.context.dragingItem.$dom.css("position", me.context.oldPosition || "static")
				me.context.dragingItem.$dom.removeClass("f-dl-draging").css(
				{
					width: me.context.oldWidth || "",
					left: "",
					top: "",
					position: "static",
					zIndex:me.context.oldZIndex || 0
				})

				me.context.tempBox.before(me.context.dragingItem.$dom).remove();
				me.context = {}
			}
		}

		this._mouseMove = function(e) {
			var context = me.context
			if (context.dragingItem != null) {
				context.dragingItem.$dom.css(
				{
					left: e.clientX - context.startInfo.x + context.startInfo.left,
					top: e.clientY - context.startInfo.y + context.startInfo.top
				});

				me.moveTempBox(e)
			}
		}


		$(document).mousemove(this._mouseMove).mouseup(this._mouseUp).bind("selectstart", function() {
			return false
		});
		this.container.find(me.config.itemSelector).each(function() {
			me.addItem(this)
		});
	}

	$.ui.DragLayout.DefaultConfig = {
		container: document,
		headerSelector: ".f-dl-header",
		contentSelector: ".f-dl-content",
		itemSelector: ".f-dl-item",
		placeSelector: ".f-dl-place",
		closeSelector: ".f-dl-close",
		toggleSelector: ".f-dl-toggle",
		tempItemCss: "f-dl-item-temp",
		collapseCss: "f-dl-collapse",
		dragingCss: "f-dl-draging"
	};
	//#end

	if (window.fly && window.fly.version) {
		fly.lib.Event.registEvent($.ui.DragLayout, [
		/*  将某一项移动到另一个位置时发生
		@place  :   Element 将要放置的区域
		@ref    :   DragLayoutItem  将要放置到该项附近
		@pos    :   String  要放置的相对@ref的位置（up/down）
		@return :   返回 false 取消移动
		*/
        "onMovingTo",

		/*  某一项开始移动时发生
		@item:   DragLayoutItem 准备移动的项
		@return :   返回 false 取消移动
		*/
        "onMoveStart",

		/*  关闭某一项时发生
		@item:   DragLayoutItem 要关闭的项
		@return :   返回 false 取消
		*/
        "onCloseItem",

		/*  展开某一项时发生
		@item:   DragLayoutItem 要展开的项
		@return :   返回 false 取消
		*/
        "onExtendItem",

		/*  折叠某一项时发生
		@item:   DragLayoutItem 要折叠的项
		@return :   返回 false 取消
		*/
        "onCollapseItem",

		/*  隐藏某一项时发生
		@item:   DragLayoutItem 要隐藏的项
		@return :   返回 false 取消
		*/
        "onHideItem",

		/*  显示某一项时发生
		@item:   DragLayoutItem 要显示的项
		@return :   返回 false 取消
		*/
        "onShowItem"])
	}
	//## DragLayout.extend

	$.extend($.ui.DragLayout.prototype,
	{
		findItem: function(item, create) {
			if (item instanceof $.ui.DragLayoutItem)
				return item
			if (item.ownerClass instanceof $.ui.DragLayoutItem)
				return item.ownerClass

			item = $(item)
			if (item[0] && item[0].ownerClass instanceof $.ui.DragLayoutItem)
				return item[0].ownerClass
			else if (create)
				return new $.ui.DragLayoutItem(item, this);
			else return null;
		},

		addItem: function(item, place) {
			item = this.findItem(item, true);
			item.initEvent()
			if (place) {
				var p = typeof place == "string" ? this.container.find(place) : $(place)
				if (p[0] && p[0] != item.dom.parentNode)
					p[0].appendChild(item.dom)
			}
			else if (item.dom.parentNode == null) {
				this.container.append(item.$dom);
			}
		},
		movingTo: function(place, ref, pos) {
			if (_hasFly && this.fire("onMovingTo",null,place, ref, pos) == false)
				return false
			if (ref) ref.$dom[pos == "up" ? "before" : "after"](this.context.tempBox);
			else $(place).append(this.context.tempBox)
		},
		moveTempBox: function(e) {
			var me = this
			var context = this.context;

			var appended = false
			$.each(this.items, function() {
				if (this == context.dragingItem)
					return
				var pos = getMousePlace(this.dom, e)
				if (pos == 0)
					return

				me.movingTo(this.dom.parentNode, this, pos == 1 ? "up" : "down")
				appended = true;
			})
			if (appended)
				return

			this.places.each(function() {
				if (appended) return;
				var pos = getRect(this);

				if (e.clientX < pos.left || e.clientX > pos.left + pos.width)
					return

				if (this.children.length > 1 || (this.children.length == 1 && this != context.dragingItem.dom.parentNode)) {
					var lastXY = getRect(this.children[this.children.length - 1])
					if ((e.clientY < lastXY.top + lastXY.height))// || e.clientY > pos.top + pos.height)
						return
					var lastItem;
					for (var i = this.children.length - 1; i > -1; i--)
						if (this.children[i].ownerClass instanceof $.ui.DragLayoutItem) {
						lastItem = this.children[i].ownerClass; break;
					}
					me.movingTo(this, lastItem, lastItem ? "down" : null)
				}
				else {
					appended = true
					me.movingTo(this, null, null)
				}
			})
		}
	});
	//#end
};

if (window.jQuery)
    __dragLayout(jQuery)
   if (_hasFly)
    __dragLayout(fly)