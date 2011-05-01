
fly.simple.Menu = function () {
    var simple = fly.simple;

    function Menu(config) {
        var me = this
        config = config || {};
        config.css = (config.css || '') + ' f-s-menu'
        simple.Tree.apply(this, arguments);

        function h() {
            if (me.isContextMenu)
                me.el.style.display = "none";
            setTimeout(simple.scope(me.root.collapseAll, me.root), 5);
        }

        simple.attachEvent(document, "mouseup", h);

    }

    Menu.Item = function (config) {
        simple.Tree.Node.apply(this, arguments);
    }

    simple.inherit(Menu, simple.BaseList, {
        itemType: Menu.Item,
        showToggle: false,
        renderTo: function () {
            this.base.renderTo.apply(this, arguments);
            this.el = this.root.pad;
        }
    })

    Menu.prototype.selectionMode= simple.selectionMode.none

    var t = 0
    simple.inherit(Menu.Item, simple.BaseItem,
    {
        collapsed: true,
        bindEvents: function () {
            var me = this;
            this.base.bindEvents.apply(this);
            simple.attachEvent(this.wrap, "mousemove", function (evt) {
                evt = { x: evt.x, y: evt.y }
                clearTimeout(me.tree.expandHandle)
                me.tree.expandHandle = setTimeout(function () {
                    if (me.collapsed == false) return;
                    if (!me.isRoot) {
                        var ns = me.parent.items
                        for (var i = 0; i < ns.length; i++)
                            ns[i] != me && ns[i].collapseAll();

                        if (me.pad && me.collapsed) {
                            me.pad.style.marginTop = "-1000px";
                            me.pad.style.marginLeft = "-1000px";
                            me.pad.style.visibility = "hidden"
                        }
                    }
                    me.expand();
                    if (!me.isRoot && me.pad) {
                        setTimeout(function () {
                            me.pad.style.marginLeft = (me.wrap.offsetWidth * (evt.x + me.wrap.offsetWidth + me.pad.offsetWidth > document.body.offsetWidth ? -1 : 1)) + "px"
                            if (evt.y + me.wrap.offsetHeight + me.pad.offsetHeight > document.documentElement.offsetHeight)
                                me.pad.style.marginTop = "-" + me.pad.offsetHeight + "px";
                            else
                                me.pad.style.marginTop = "-" + me.wrap.offsetHeight + "px";

                            me.pad.style.visibility = "visible"
                        }, 50);
                    }
                }, 50);
                return false;
            });
        }
    })



    return Menu;
} ()