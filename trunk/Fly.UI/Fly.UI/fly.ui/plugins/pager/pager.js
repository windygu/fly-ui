/// <reference path="../../fly-comment.js" />,
/// <reference path="../../fly.ui.js" />

fly.regPlugin('pager', function ($) {
    var ui = $.ui, $e = $.lib.Event;
    var pbns = "first,previous,next,last,refresh"
    ui.Pager = $.Class({
        base: ui.Toolbar,
        inherit: ui.IControlPlugin,
        constructor: function () {
            arguments.callee.$base.apply(this, arguments)
            this.onRender(this.updateState);
            this.onJoin(this.joinControl)
            this.currentTypeBuilder = ui.Pager.currentTypeBuilder[this.currentType];
            this.items || (this.items = this.currentTypeBuilder.items);
            this.css = (this.css || '') + " " + this.baseCss + "-" + this.currentType
        },
        initClass: function () {
            this.css = (this.css || '') + " f-toolbar"
            this.$base.initClass.apply(this, arguments);
        },
        baseCss: "f-pager",
        showButtonText: false,
        showButtonIcon: true,
        pageIndex: 1,
        pageCount: 0,
        start: 0,
        end: 0,
        total: 0,
        pageSize: 20,
        currentType: 'input',
        pageListCount: 7,
        onPage: $e.createEventFn("page"),
        onStateChange: $e.createEventFn("statechange"),
        go: function (index, fire) {
            if (index != null) {
                index = index == "first" ? 1 : (index == "previous" ? this.pageIndex - 1 : (index == "next" ? this.pageIndex + 1 : (index == "last" ? this.pageCount : index)));
                index == "refresh" || (index = Math.max(Math.min(index, this.pageCount), 1))
            }

            if (index != this.pageIndex) {
                index != "refresh" && index!=null && (this.pageIndex = index);
                this.start = (this.pageIndex - 1) * this.pageSize;
                this.end = Math.min(this.total, this.start + this.pageSize - 1);
                this.requestOption = { pageIndex: this.pageIndex, pageSize: this.pageSize, start: this.start, limit: this.pageSize }
                fire != false && this.fire("page",this, this.requestOption)
            }
            this.updateState(fire);
        },

        infoFormat: "Displaying topics {start+1}-{end} of {total}",
        itemBuilders: {
            "current": function () {
                return this.currentTypeBuilder.current.call(this);
            },
            info: function () {
                if (this.showInfo == false) return null;
                this.infoBox = new ui.HtmlNode({ css: this.baseCss + "-info" });
                this.on("statechange", function () {
                    this.infoBox.el.html(this.infoFormat.format(this));
                });
                return this.infoBox;
            }
        },
        parseItem: function (item) {
            var oi = item;
            if ($.isStr(item)) {
                if (pbns.contains(item)) {
                    var uName = item.firstUpper()
                    if (this["show" + uName + "Button"] == false) return null;

                    var text = this.showButtonText ? ui.Pager.buttonNames[item] || uName : null;
                    if (this.showButtonIcon) {
                        item = new $.ui.BaseButton({
                            //css: "f-btn-rect",
                            iconCss: "f-btn-" + item,
                            text: text,
                            handler: this.go.format(item).bind(this)
                        })
                    }
                    else {
                        item = new $.ui.SimpleButton({
                            text: text,
                            handler: this.go.format(item).bind(this)
                        })
                    }
                    this[oi + "Button"] = item;
                }
                else {
                    var b = this.itemBuilders[item]
                    item = b ? b.call(this) : item.format(this);
                }
            }
            return this.$base.parseItem.apply(this, arguments);
        },
        updateState: function (fire) {
            this.pageCount = Math.ceil(this.total / this.pageSize);
            //this._start = this.start + 1;
           // this._end = this.end + 1;
            this.firstButton && this.firstButton.disable(this.pageIndex == 1)
            this.previousButton && this.previousButton.disable(this.pageIndex == 1)

            this.nextButton && this.nextButton.disable(this.pageIndex == this.pageCount)
            this.lastButton && this.lastButton.disable(this.pageIndex == this.pageCount)

            this.pageCountBoxs = this.el.find("." + this.baseCss + "f-pager-pageCount");
            this.pageCountBoxs.text(this.pageCount);
            fire != false && this.fire("statechange");
        },
        syncState: function () {
            var s = this.ownerControl.store
            this.total = s.total
            this.start = s.start
            this.end=s.end
            if (this.pageSize < 1)
                this.pageSize = s.pageSize
            else
                s.pageSize = this.pageSize
            this.updateState()
        },
        joinControl: function (control) {
            control.store.onGetRecords(this.syncState, this)
            if (control.onPreBind)
                control.onPreBind(function (option) {
                    this.go(null, false)
                    $.extendIf(option, this.requestOption);
                }, this);

            this.onPage(function (o) {
                this.ownerControl.bind(o);
            }, this)
            this.syncState()
        }
    });
    ui.Pager.currentTypes = { input: "input", pageList: "pageList" }
    ui.Pager.currentTypeBuilder = {
        input:
        {
            items: ["first", "previous", "|", { text: "  Page  ", ctype: "htmlnode", css: 'gray' }, "current", "<span class=gray > &nbsp;of&nbsp; <span class={baseCss}-pageCount ></span></span>&nbsp;", "|", "next", "last", "refresh", "->", "info"],
            current: function () {
                var box = new ui.Element("<input class=" + this.baseCss + "-current-input />");
                box.focus("this.select()");
                box.keypress(function () {
                    $event.keyCode==13 && this.blur()
                })

                box.change(function () {
                    var v = $event.target.value.replace(/\s/g, '')
                    if (v.match(/[^\d]/)) {
                        $event.target.value = this.pageIndex;
                        return;
                    }
                    this.go(v);
                }, this);
                this.on("statechange", function () {
                    box.val(this.pageIndex);
                });
                return box;
            }
        }, pageList: {
            items: ["first", "previous", "current", "next", "last", "refresh", "->", "info"],
            current: function () {
                var html = "<a></a>".repeat(this.pageListCount);
                var box = new ui.Element("<div class=" + this.baseCss + "-current-pageList >" + html + "</div>");
                var as = box.find("a");
                box.click(function () {
                    if ($event.target.nodeName != "A") return false;
                    this.go($event.target.pageIndex);
                }, this);
                this.on("statechange", function () {
                    var me = this;
                    var c = this.baseCss + "-current"
                    box.current && box.current.removeClass(c);
                    var start = this.pageIndex + 1 - Math.ceil(this.pageListCount / 2)
                    start < 1 && (start = 1);
                    (start + this.pageListCount > this.pageCount) && (start = Math.max(this.pageCount - this.pageListCount + 1, 1))
                    as.each(function (a, i) {
                        var ii = start + i
                        a.style.display = ii > me.pageCount ? "none" : "";
                        a.pageIndex = a.innerText = ii;
                        ii == me.pageIndex && (box.current = $(a).addClass(c));
                    });
                });
                return box;
            }
        }
    };
    ui.Pager.buttonNames = {}

})