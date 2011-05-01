/// <reference path="../../../fly/fly-comment.js" />
/// <reference path="../../fly.ui.js" />

fly.regPlugin('dialog', function ($) {
    var ui = $.ui;
    ui.Dialog = $.Class({
        base: ui.Panel,
        constructor: function () {
            arguments.callee.$base.apply(this, arguments)
            this.content && $(this.content).hide();
            this.onBuildUI(function () {
                this.content && this.loadContent(this.content)
                this.url && this.loadUrl(this.url, this.byIframe);
            }, this);
        },
        baseCss: "f-dialog",
        domFrame: { El: ["TitleBar", "Body", "BottomBar"] },
        dragable: true,
        dragHandle: "titleBar",
        resizeable: true,
        top: "30%",
        left: '30%',
        showCloseButton: true,
        closeButton: null,
        escClose: true,
        buildTitleBarItems: null,
        titleBarTemplate:new ui.Template( '<div class="{baseCss}-title">{title}<div class="{baseCss}-title-buttons"></div></div>'),
        createTitleBar: function () {
            var tb = this.createElement("TitleBar", true);
            var items = [];
            if (this.showCloseButton) {
                var config = this.closeButton || {
                    css: this.baseCss + "-close",
                    baseCss: '',
                    tagName: 'a',
                    text: '×'
                };
                config.handler || (config.handler = this.close.bind(this))
                this.closeButton = config instanceof ui.Control ? config : new ui.SimpleButton(config);
                items.push(this.closeButton)
            }
            this.buildTitleBarItems && this.buildTitleBarItems(items);

            var buttonDiv = $(tb.dom.lastChild);
            for (var i = 0; i < items.length; i++) {
                var item = items[i]
                item.ctype || (item.ctype = "simplebutton");
                buttonDiv.append($.lib.Component.Mgr.create(item, ui.Control));
            }

            this.closeButton && this.closeButton.el.attr('disabledrag', 1);

            return tb;
        },
        shwoBottomBar: "auto",
        buildBottomBarItems: null,
        bottomBarTemplate: new ui.Template('<div class="{baseCss}-bottom-bar"></div>'),
        createBottomBar: function () {
            if (!(this.shwoBottomBar == true || (this.shwoBottomBar == "auto" && this.bottomItems && this.bottomItems.length)))
                return null;

            this.bottomItems || (this.bottomItems = [])

            var bb = this.createElement("BottomBar", true);

            this.buildBottomBarItems && this.buildBottomBarItems(this.bottomItems);

            for (var i = 0; i < this.bottomItems.length; i++) {
                var item = this.bottomItems[i]
                item.ctype || (item.ctype = "simplebutton");
                bb.append($.lib.Component.Mgr.create(item, ui.Control));
            }
            return bb;
        },
        
        boxControl: "body",
        posControl: "outer",
        buildUI: function () {
            var me = this
            this.$base.buildUI.apply(this, arguments);
            if (this.dragable) {
                var dh = $.isStr(this.dragHandle) ? this[this.dragHandle] || this.titleBar : this.dragHandle
                var dragHelper = new $.ui.DragHelper(
                {
                    elements: this.el,
                    handle: dh,
                    dragAll: false
                });
            }

            if ($.browser.isIE7) {
                function s() {
                    me.titleBar.width(me.body[0].offsetWidth - 10);
                }
                this.body.resize(s);
            }

            if (this.resizeable) {
                this.dragHandle = new ui.Element("<div class='" + this.baseCss + "-resize-handle'></div>")
                this.el.append(this.dragHandle);
                var rh = new ui.DragHelper(
                {
                    isResize: true,
                    elements: this.body,
                    handle: dh,
                    handle: this.dragHandle
                });
            }

            this.escClose && this.el.keyup("$event.keyCode==27 && this.close()", this);
            this.el.click(this.active, this);
            this.body.focus(this.active, this);
        },
        active: function () {
            var ac = ui.Dialog.active
            if (ac && ac != this)
                ac.el.removeClass(ac.baseCss + "-active");
            ui.Dialog.active = this;
            this.el.addClass(this.baseCss + "-active");
        },
        close: function () {
            if (this.fire("closeing") == false) return false;
            if (this.modalPanel) {
                this.modalPanel.destroy();
                this.modalPanel = null;
            }
            this.$base.hide.apply(this, arguments);
        },
        _showModal: function () {
            this.modalPanel || (this.modalPanel = ui.Panel.createModal())
            this.modalPanel.render(document.body);
            this.modalPanel.show();
            if (this.escClose) {
                this.modalPanel.outer.focus(function () {
                    this.body.focus();
                }, this);
            }
        },
        show: function (modal) {
            if (this.fire("showing") == false) return false;
            if (modal) {
                this._showModal()
            }
            this.$base.show.apply(this, arguments);
            this.escClose && this.body.focus()
            this.active();
        },
        url: null,
        byIframe: false,
        loadContent: function (content) {
            this.body.text('')
            $(content).appendTo(this.body).show();
        },
        iframeFormat: '<iframe frameborder="no" border="0"></iframe>',
        loadUrl: function (url, byIframe, callback) {
            var me = this;
            me.setHtml("<div class=" + this.baseCss + "-loading ></div>");
            me.loadLoadUrl = url;
            var loaded = false;

            if (byIframe) {
                this.iframeElement = new ui.Template(this.iframeFormat).format(this).toElement();
                this.iframeElement.hide();
                this.iframeElement.appendTo(document.body);

                this.iframeElement.on("load", function () {
                    if (loaded || me.loadLoadUrl != url) return;
                    loaded = true;
                    callback && callback.call(me, iframeElement);
                    me.setText("");
                    me.body.append(me.iframeElement);
                    me.iframeElement.show()
                });
                this.iframeElement.attr("src", url);

            }
            else {
                function c(xhr, data) {
                    if (loaded || me.loadLoadUrl != url) return;
                    loaded = true;
                    callback && callback.call(me, data);
                    url.isText ? me.setText(data) : me.setHtml(data);
                }

                this.iframeElement && this.iframeElement.remove();
                if ($.isStr(url))
                    $.ajax.url(url).onComplete(c).get()
                else {
                    url.complete = c
                    $.ajax(url)
                }
            }
        }
    });
    $.lib.Component.Mgr.regType("dialog", ui.Dialog);
});