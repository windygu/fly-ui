/// <reference path="fly-comment.js" />

fly.regPlugin('ui', function ($) {
    var arrP = Array.prototype, ui = $.ui, lib = $.lib, $e = lib.Event, collection = $.collection, dh = ui.DomHelper, $d = $.data, idNumber = 0, docE = document.documentElement;
    $.ns("fly.ui.grid")
    $.ns("fly.ui.tree")
    $.ns("fly.ui.layout")
    $.extend($,
    {
        id: function (el, prefix) {
            if (el.id) return el.id
            if (el = $.getDom(el))
                return el.id = (prefix || "fly-") + (el.$ctype || '') + idNumber++
        },
        createConfig: function (type, constructor, defaults, inherit) {
            if (inherit == true && type.$base)
                inherit = type.$base.Config

            constructor = new $.Class({
                base: inherit,
                constructor: constructor,
                id: function (id) {
                    if (id) return this.id = id
                    this.id = null
                    return this.id = $.id(this)
                }
            })
            defaults && constructor.$extend(defaults);
            constructor.prototype.$ctype || (constructor.prototype.$ctype = type.prototype.$ctype);
            return type.Config = constructor;
        },
        getDom: function (el) { 
            return !el ? null : (el.isIList ? el[0] : ($.isStr(el) ? doc.getElementById(el) : el));
        },
        getInner: function (el) {
            while (el) {
                if (el.nodeType)
                    return new ui.Element(el)
                else if (el.inner)
                    el = el.inner
                else if ($.is(el, ui.Element))
                    return el;
                else if (el.isIList)
                    el = el[0]
                else
                    return new ui.Element(el)
            }
            return el
        },
        getOuter: function (el) {
            while (el) {
                if (el.nodeType)
                    return new ui.Element(el)
                else if (el.outer)
                    el = el.outer
                else if ($.is(el, ui.Element))
                    return el;
                else if (el.isIList)
                    el = el[0]
                else
                    return new ui.Element(el)
            }
            return el
        }
    });

    ui.util =
    {
        ellipsisCss: "ellipsis", scrollWidth: "17px", scrollHeight: "17px",
        typicalSize: {
            small: { width: 16, height: 16 },
            medium: { width: 24, height: 24 },
            large: { width: 32, height: 32 }
        },
        upBlurs: [],
        emptyImg: $.browser.isIE6 ? "http://www.flyui.net/s.gif" : "data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
        destroy: $.destroy
    }
    var isIE67 = $.browser.isIE6 || $.browser.isIE7
    if ($.browser.isIE) {
        var upBlurs = ui.util.upBlurs;
        $.doc.onMouseUp(function () {
            while (upBlurs.length) {
                var box = upBlurs.pop()
                if (isIE67) {
                    try {
                        box.blur()
                    } catch (e) { }
                } else {
                    dh.removeClass(box.el, box.css);
                }
            }
            if (isIE67 && box && box.firstChild)
                try {
                    box.firstChild.focus()
                } catch (e) { }
        })
    }

    $.extend(dh,
    {
        addHoverIfIE6: function (el, css) {
            if (!$.browser.isIE6) {
                $e.on(el, "mouseenter", function () {
                    this.className += " " + css
                })

                $e.on(el, "mouseleave", function () {
                    dh.removeClass(this, css);
                })
            }
            return this;
        },
        addActiveIfIE8: function (el, css) {
            if ($.browser.isIE8) {
                $e.on(el, "mousedown", function () {
                    this.className += " " + css
                    ui.util.upBlurs.push({ el: this, css: css })
                })
            }
            return this;
        },
        downFocusIfIE67: function (el) {
            if (isIE67) {
                $e.on(el, "mousedown", function () {
                    this.focus()
                    ui.util.upBlurs.push(this)
                })
            }
            return this;
        }
    })

    var dCss = " F-" + $.browser.name
    if ($.browser.isWebKit)
        dCss += " F-WebKit"

    docE.className += dCss;

    ui.Element = new $.Class(
	{
	    constructor: function (el, context) {

	        while (el != null && el.nodeType !== 1) {
	            if (el.$isElement) return el

	            if ($.isStr(el))
	                $.isHtml(el) ? el = dh.create(el) :
                                    el = (context ? $(context).find(el) : $(el))[0]
	            else if (typeof el.length == "number" && el[0] !== undefined)
	                el = el[0]
	            else if ($.isFun(el))
	                el = el(context)
	            else
	                break;
	        }
	        this.dom = this[0] = el;
	    },

	    id: function () {
	        return $.id(this.dom)
	    },
	    $isElement: true
	})

    collection.IList.applyTo(ui.Element,
    {
        length: 1,
        dom: null,
        id: null,
        item: function (index) {
            return this.dom;
        },
        getItems: function () {
            return this
        },
        updateLength: fly.emptyFun,
        destroy: function () {
            if (!this.dom) return;
            this.un();
            this.remove();
            this.dom = null;
            this[0] = null;

        }
    });

    collection.MapList = function (config) {
        if (config) {
            var all = config.items;
            delete config.items;
            $.extend(this, config)
            this.idSelectorIsProperty = !$.isFun(this.idSelector);
            if (all) {
                arrP.push.apply(this, all);
                this.reMap();
            }
        }
        else {
            config = {}
            this.dataMap = {}
        }
    }

    collection.IList.applyTo(collection.MapList,
    {
        $type: collection.MapList,
        $create: function (a) {
            return new collection.MapList({
                idSelector: this.idSelector,
                items: a
            });
        },

        length: 0,
        dataMap: null,
        idSelectorIsProperty: true,
        idSelector: "id",
        getById: function (id) {
            return this.dataMap[id];
        },
        addToMap: function (item) {
            this.dataMap[this.idSelectorIsProperty ? item[this.idSelector] : this.idSelector(item)] = item;
            return item;
        },
        reMap: function () {
            this.dataMap = {}
            for (var i = 0, l = this.length; i < l; i++)
                this.addToMap(this[i])
        },
        add: function (items) {
            for (var i = 0; i < arguments.length; i++)
                arguments[i] = this.addToMap(arguments[i]);
            arrP.push.apply(this, arguments);
            return this
        },
        addRange: function (items) {
            return this.add.apply(this, items)
        },
        addAt: function (index, item) {
            item = this.addToMap(item);
            arrP.splice.apply(this, [index, 0, item])
            return this;
        }
    });


    //## fly.lib.Component
    var comp = lib.Component = new $.Class(
 	{
 	    constructor: function (config) {
 	        var es
 	        if (config) {
 	            if (this.config)
 	                $.extend(this.config, config)
 	            else
 	                this.config = config
 	        }

 	        if (this.config) {
 	            es = this.config.listeners
 	            delete this.config.listeners
 	            delete this.config.config
 	            $.extend(this, this.config)
 	        }
 	        else
 	            this.config = {}

 	        cMgr.reg(this)

 	        this.listeners && this.on(this.listeners)
 	        es && this.on(es)
 	        this.onInit && this.onInit()
 	        this.joinPlugins()
 	    },
 	    joinPlugins: function () {
 	        if (this.plugins) {
 	            (this.plugins = $.toArray(this.plugins)).each(function (p) {
 	                p.join(this);
 	            }, this);
 	        }
 	    },
 	    isComponent: true,
 	    getId: function () {
 	        return this.id || 'c' + cMgr.all.length
 	    },
 	    getCompType: function () {
 	        return this.$ctype
 	    },
 	    clone: function (override) {
 	        override || (override = {})
 	        override.base = this;
 	        return new ($.Class(override));
 	    }
 	})
    $e.eventAble(comp)

    $.createConfig(comp, function (comp) {
        this.ctype || (this.comp = comp.ctype);
    })


    comp.Mgr =
	{
	    all: [],
	    typeInstanceCount: {},
	    reg: function (comp) {
	        this.all.push(comp)
	        this.typeInstanceCount[comp.$ctype] = (this.typeInstanceCount[comp.$ctype] || 0) + 1;
	        comp.instanceIndex = this.typeInstanceCount[comp.$ctype]
	    },
	    typeMap: {},
	    regType: function (ctype, _class) {
	        this.typeMap[ctype] = _class;
	        _class.prototype.$ctype = ctype
	    },
	    getType: function (ctype) {
	        var t = this.typeMap[ctype]
	        if (t == null)
	            t = /layout\:/.test(ctype) ? ui.layout.Layout : ui.Panel
	        return t
	    },
	    create: function (config, type) {
	        if (type && config instanceof type) return config
	        if (config instanceof ui.Element)
	            return new ui.Control({ el: config })

	        if ($.isDom(config)) {
	            return new ui.Control(
		        {
		            id: config.id,
		            name: config.name,
		            el: new ui.Element(config)
		        })
	        }

	        var _class = this.getType(config.ctype)
	        delete config.ctype
	        return new _class(config)
	    }
	}
    var cMgr = comp.Mgr
    cMgr.regType('comp', comp)
    //#end

    ui.DragHelper = $.Class(
    {
        base: comp,
        constructor: function (config) {
            $.isStr(config) && (config = { elements: config })
            arguments.callee.$base.apply(this, arguments)
            this.elements = $(this.elements).copy()
            this.handle && (this.dragAll = true)
            this.handle = this.handle ? $(this.handle) : this.elements

            this.onlyResizeOther = this.onlyResizeOther || false
            this.stopEvents || (this.stopEvents = ['mouseup'])

            this.dragX = (this.isResize ? /w/i : /x/i).test(this.mode)
            this.dragY = (this.isResize ? /h/i : /y/i).test(this.mode)

            this.xMethod = this.isResize ? 'width' : 'left'
            this.yMethod = this.isResize ? 'height' : 'top'
            this.styleMethod = this.isResize ? 'size' : 'pos'
            this.context = {};
            if (this.changeCursor && !this.isResize)
                this.handle.css("cursor", "move");
            this.handle.onMouseDown(this.start, this)
        },
        dragAll: true,
        mode: "xywh",
        isResize: false,
        onlyResizeOther: false,
        changeCursor: true,
        onStart: $e.createEventFn("start"),
        onDrag: $e.createEventFn("drag"),
        onStop: $e.createEventFn("stop"),
        onStoped: $e.createEventFn("stoped"),
        start: function (handle) {
            var target = $.$event.target;
            if (target && target != handle) {
                while (target != handle) {
                    if (target.getAttribute("disabledrag") == 1)
                        return;
                    target = target.parentNode;
                }
            }

            var c = this.context, me = this
            if (this.draging || this.onStart() == false)
                return false
            dh.unSelection();
            ui.DragHelper.started = this.started = true
            this.draged = false
            c.startXY = $.$event.pageXY()
            $.doc.onMouseMove(this.drag, this)
            $.doc.onSelectStart($e.stop, this)
            var dStyle = docE.style
            if (dStyle.MozUserSelect != "none") {
                me.dStyleSelect = dStyle.MozUserSelect
                dStyle.MozUserSelect = "none"
            }

            $.doc.on(this.stopEvents, this.stop, this)

            c.elements = this.dragAll ? this.elements : new ui.Element(handle);
            this.isOne = c.elements.length == 1
            c.elements.each(function (el, i, all) {
                if (!el.isIList)
                    el = all[i] = new ui.Element(el);

                el._startStyle = el[me.styleMethod]()
            })
            $e.stop()
        },
        changeX: function (el) {
            try {
                el.dom.style[this.xMethod] = this.context.dx + el._startStyle[this.xMethod] + "px"
            } catch (e) { }
        },
        changeY: function (el) {
            try {
                el.dom.style[this.yMethod] = this.context.dy + el._startStyle[this.yMethod] + "px"
            } catch (e) { }
        },
        drag: function () {
            var me = this, c = me.context
            if (me.onDrag() == false)
                return false
            me.draging = true
            c.currentXY = $.$event.pageXY();
            //  document.title = c.currentXY.x + " - " + c.currentXY.y
            if (me.dragX) {
                c.dx = $.$event.ctrlKey ? 0 : (c.currentXY.x - c.startXY.x)
                if (c.dx)
                    me.isOne ? me.changeX(c.elements[0]) : c.elements.each(me.changeX, me)
            }

            if (me.dragY) {
                c.dy = $.$event.shiftKey ? 0 : (c.currentXY.y - c.startXY.y)
                if (c.dy)
                    me.isOne ? me.changeY(c.elements[0]) : c.elements.each(me.changeY, me)
            }
        },
        cancel: function () {
            var me = this
            if (me.dragX) {
                me.context.dx = 0
                me.isOne ? me.changeX(c.elements[0]) : c.elements.each(me.changeX, me)
            }

            if (me.dragY) {
                me.context.dy = 0
                me.isOne ? me.changeY(c.elements[0]) : c.elements.each(me.changeY, me)
            }
            me.draged = false
        },
        stop: function () {
            var me = this
            if (me.onStop() == false)
                return false
            $.doc.un("mousemove", me.drag)
            $.doc.un("selectstart", $e.stop)
            docE.style.MozUserSelect = me.dStyleSelect || ''
            me.draged = true
            me.started = false
            setTimeout(function () {
                ui.DragHelper.started = false
            })

            me.draging = false
            if (me.min)
                if ((me.dragX && Math.abs(me.context.dx) < me.min.x) && (me.dragY && Math.abs(me.context.dy) < me.min.y))
                    me.cancel()

            $.doc.un(me.stopEvents, me.stop)

            if (me.onStoped() == false)
                return false
        },
        destroy: $.destroy
    });

    //    fly.ui.drag = function (elements, option) {
    //        if (elements.isIQueryable && elements.length > 1)
    //            return elements.each(fly.ui.DragHelper, option)
    //        elements = fly(elements)
    //        return elements.DragHelper = new fly.ui.DragHelper(elements, option)
    //    }

    //    fly.linq.extend('drag', function (option) {
    //        fly.linq.IList.each.call(this, function (o) {
    //            fly.ui.drag(o, option)
    //        })
    //        return this
    //    })


    //    $d.IStore = {
    //        records: null,
    //        getRecords: function (start, pageSize, orderBy, orderDir) {}
    //    }

    $d.Store = $.Class({
        base: lib.Component,
        inherit: $d.IStore,
        constructor: function (config) {
            if ($.likeArray(config))
                this.records = config
            else
                arguments.callee.$base.apply(this, arguments)

            this.sortInfos = {};
            if (this.data)
                this.setData(this.data)
            else {
                if (this.total < 0 && this.records)
                    this.total = this.records.length;
            }
        },
        data: null,
        total: -1,
        pageSize: -1,
        start: 0,
        end: -1,
        totalProperty: 'total',
        recordsProperty: 'records',
        records: null,
        remoteSort: false,
        idProperty: "id",
        childrenProperty: "children",
        sortInfos: null,
        sortInfo: function (id, option) {
            var info = this.sortInfos[id == null ? "" : id] || {};
            if (!option)
                return info;

            if (info.sortDir == option.sortDir && info.sortBy == option.sortBy)
                return false
            this.sortInfos[id] = { sortDir: option.sortDir, sortBy: option.sortBy }
            return true;
        },
        getChildren: function (record, option) {
            return record[this.childrenProperty]
        },
        onDataChange: $e.createEventFn("datachange"),
        setData: function (data) {
            this.data = data;
            this.records = data[this.recordsProperty]
            this.total = data[this.totalProperty];
            if (this.total == null)
                this.total = this.records.length;
            this.onDataChange();
        },
        onGetRecords: $e.createEventFn("getRecords"),
        getRecords: function (option, cb) {
            var rs = this.records
            if (!rs) return;
            option || (option = {})

            if (option.record)
                rs = this.getChildren(option.record, option);

            var sort = option.sortDir != null
            sort && this.sortInfo(option.id, option);

            if (sort && this.remoteSort)
                collection.IList.sort.call(rs, option.sortDir, option.sortBy)

            if (option.start != null)
                this.start = option.start
            if (option.pageSize != null)
                this.pageSize = option.pageSize

            rs = rs.slice(this.start, this.pageSize < 0 ? rs.length : this.start + this.pageSize);
            this.end = this.start + rs.length;
            this.fire('getRecords', this, rs);
            if (sort && !this.remoteSort)
                collection.IList.sort.call(rs, option.sortDir, option.sortBy)
            cb && cb(rs, option)
            option.callback && option.callback(rs, option);
            return rs;
        }
    });

    $d.AjaxStore = $.Class({
        base: $d.Store,
        buildOption: function (option) {
            option = $.extend(option);

            var o = {
                url: (option.url || this.url || '').format(option.id, option.record, option),
                method: option.method || this.method,
                data: option
            }
            $.extend(option, this.params)
            for (var k in option) {
                if ($.isStr(option[k]))
                    option[k] = option[k].format(option.id, option.record, option)
            }
            delete option.url
            delete option.method
            delete option.record
            return o;
        },

        onPreRequest: $e.createEventFn("preRequest"),
        onRequested: $e.createEventFn("requested"),
        request: function (option, cb) {
            var o = this.buildOption(option || {})
            if (this.onPreRequest(o, option) === false)
                return null;
            new $.ajax(o).onComplete(cb).go();
        },
        processRequest: function (result) {
            return $.Json.decode(result.responseText)
        },
        getRecords: function (option, cb) {
            var me = this
            var sort = option.sortDir != null
            sort && this.sortInfo(option.id, option);

            this.request(option, function (result) {
                me.start = option.start || 0;
                result = me.processRequest(result);
                me.fire("requested", me, result, option)
                me.setData(result);
                me.end = me.start + me.records.length
                me.fire('getRecords', me, me.records);
                if (sort && !me.remoteSort)
                    collection.IList.sort.call(me.records, option.sortDir, option.sortBy)
                cb && cb(me.records, option)
                option.callback && option.callback(me.records, option);
            });
        }
    });

    ui.IControlPlugin = {
        isPlugin: true,
        ownerControl: null,
        onJoin: $e.createEventFn("join"),
        join: function (control) {
            this.ownerControl = control;
            this.fire("join", this, control);
        }
    }

    ui.Template = $.Class({
        constructor: function (template) {
            var as = arguments, h = ""
            if (as.length == 1 && $.isStr(template))
                this.template = template;
            else {
                buf = []
                buf.merge.apply(buf, arguments)
                this.template = buf.join('')
            }
        },
        format: function (args) {
            this.args = { length: 0 }
            Array.prototype.push.apply(this.args, arguments)
            return this;
        },

        apply: function () {
            var buf = []
            var args = this.args, lastArg
            for (var i = 0, len = args.length; i < len; i++) {
                if ($.isObject(args[i])) {
                    lastArg = args[i]
                    buf.push("with(args[" + i + "]){")
                }
            }

            var l = buf.length, html
            var ___ = function ($0, $1) {
                var v = args[$1]
                if (v == undefined) {
                    if (l > 1 || /[^\w$]/.test($1)) {
                        try {
                            v = eval('(' + $1 + ")")
                        } catch (e) { }
                    }
                    else if (lastArg != null)
                        v = lastArg[$1]
                }
                if (v == undefined)
                    return '';
                while (fly.isFun(v))
                    v = v.call(lastArg)
                return v
            }
            if (l > 1) {
                eval(buf.join('') +
                    "this.html=this.template.replace(this.template.formatReg," + ___.toString() + ")" +
                    "}".$repeat(buf.length))
            } else {
                this.html = this.template.replace(this.template.formatReg, ___)
            }

            return this.html;
        },
        toString: function () {
            return this.apply();
        },
        toElement: function () {
            return new ui.Element(this.apply());
        },
        toElements: function () {
            return $(this.apply());
        }

    });
    ui.Template.all = {}
    ui.Template.create = function (format) {
        return this.all["template" + format] || (this.all["template" + format] = new ui.Template(format))
    }


    ui.IDataBound =
    {
        isDataBindControl: true,
        //needBind: false,
        canBind: false,
        getParams: function () {
            return null;
        },
        createStore: function (config) {
            return new $d.Store(config);
            //            var proxy = config.proxy
            //            if (!$.is(proxy, $d.Proxy)) {
            //                var p = $.extend({
            //                    url: config.url,
            //                    remoteSort: config.remoteSort,
            //                    baseParams: config.baseParams,
            //                    reader: config.reader,
            //                    data: config.data,
            //                    autoLoad: config.autoLoad
            //                }, proxy);

            //                if (!$.is(p.reader, $d.DataReader)) {
            //                    var r = $.extend({
            //                        total: config.total,
            //                        root: config.root == null ? ($.likeArray(config.data) ? "" : "root") : config.root
            //                    }, p.reader);
            //                    p.reader = new $d.JsonReader(r);
            //                }

            //                if (config.url)
            //                    proxy = new $d.HttpProxy(p)
            //                else
            //                    proxy = new $d.Proxy(p);
            //            }
            //            return new $d.Store({
            //                proxy: proxy
            //            });
        },
        setStore: function (store) {
            $.is(store, $d.Store) || (store = this.createStore(store))

            //            this.store = store;
            //            this.store.on("load." + (this.nodeId == null ? '' : this.nodeId), this.bind, this)
            //            var records = this.store.getRecords(this)
            //            if (records)
            //                this.bind()
            //            else if (this.autoLoad)
            //                this.store.load(this.getParams())

            //            this.store.onUpdate(this.onUpdate, this)
            //            this.store.onLoad(this.bind, this)
        },

        getStore: function () {
            return this.store
        },

        onDataChange: $e.createEventFn("datachange", function () {
            this.bind()
        }),

        onUpdate: $e.createEventFn("update", function () {
            this.bind()
        }),

        onPreBind: $e.createEventFn("prebind"),
        onAfterBind: $e.createEventFn("afterbind"),
        onBinding: $e.createEventFn("binding"),
        doBind: function (records, option) {
            //if (!this.needBind) return
            if (!this.canBind) return;
            if (this.fire("binding", this, records) === false) return;
            this.bindRecords(records, option);
            //this.needBind = false;
            this.fire("afterbind", this, this.records)
        },

        bind: function (option) {
            //this.needBind = true
            var o = option || {}
            if (this.fire("prebind", this, o, option) === false) return;
            var me = this
            if ($.likeArray(o)) {
                this.doBind(o)
            }
            else {
                this.store.getRecords(o, function (records, op) {
                    me.doBind(records, op);
                })
            }
        },
        bindRecords: $.emptyFun
    }



    ui.Control = new $.Class(
	{
	    base: lib.Component,
	    constructor: function (config) {
	        var me = this;
	        this.defaults = {}
	        if (config) {
	            if (config.defaults != null) {
	                $.extend(this.defaults, config.defaults);
	                delete config.defaults
	            }

	            if (config.items != null) {
	                this.add.apply(this, $.toArray(config.items))
	                delete config.items;
	            }

	            if (config.renderTo != null) {
	                var renderTo = config.renderTo
	                $.ready(function () {
	                    setTimeout(me.render.bind(me), 1)
	                })
	            }
	        }
	        arguments.callee.$base.apply(this, arguments)
	        this.buildCss();
	    },
	    buildCss: function () {
	        if (this.applyUniqueCss)
	            this.css = (this.css || "") + " " + (this.uniqueCss = this.baseCss + "-" + this.instanceIndex)
	    },
	    //	            defaultConfig:function()
	    //	            {
	    //	                return new this.constructor.Config(this)
	    //	            },
	    applyUniqueCss: false,
	    baseCss: "f-control",
	    isControl: true,
	    rendered: false,
	    getInner: function () {
	        return $.getInner(this.inner || this.body)
	    },

	    getHtml: function () {
	        return this.getContent(true)
	    },

	    getText: function () {
	        return this.getContent()
	    },

	    setHtml: function (html) {
	        return this.setContent(html, true)
	    },
	    setText: function (text) {
	        return this.setContent(text, false)
	    },
	    formatContent: null,
	    setContent: function (content, isHtml) {
	        var inner = this.getInner()
	        inner.inner && (inner = inner)
	        content == null && (content = "")
	        this.formatContent && (conent = this.formatContent(content))
	        if (isHtml == true)
	            inner.html(content)
	        else
	            inner.text(content)
	        return this;
	    },
	    getContent: function (isHtml) {
	        var inner = this.getInner()
	        inner.inner && (inner = inner)
	        if (isHtml == true)
	            return inner.html(html)
	        else
	            return inner.text(text)
	    },
	    getOuter: function () {
	        if (!this.outer) this.render(false);
	        return this.outer;
	    },
	    getInner: function () {
	        if (!this.inner) this.render(false);
	        return this.inner;
	    },

	    render: function (to) {
	        if (this.rendered) {
	            this.doLayout && this.doLayout()
	        } else {
	            if (this.onPreRender() === false)
	                return this
	            this.initClass()
	            this.initTemplate()
	            //if (!this.dom)
	            this.buildUI()
	            this.onBuildUI();
	            if (to !== false) {
	                this.container = to || this.renderTo || new ui.Element(document.body);
	                if (this.container) {
	                    if (this.container instanceof ui.Control) {
	                        this.isPlugin && !this.ownerControl && this.join(this.container)
	                        this.container = this.container.outer
	                    }
	                    else
	                        this.container = $(this.container)
	                }

	                this.container.append ? this.container.append(this.outer) : dh.append(this.container, this.outer);
	            }

	            this.applyBox();
	            this.onRender()
	            if (this.id) {
	                var el = this.el || this.outer
	                el && (el.dom.id = this.id);
	            }
	        }
	        this.rendered = true
	        return this
	    },
	    setWidth: function (width) {
	        this.boxControl.width(width);
	        return this
	    },
	    setHeight: function (height) {
	        this.boxControl.height(height);
	        return this;
	    },
	    setBoxCss: function (name, value) {
	        if (value)
	            this.boxControl.css(name, value);
	        return this
	    },
	    setControlCssBy: function (control, from, names) {
	        names = names.split(',')
	        for (var i = 0; i < names.length; i++) {
	            if (from[names[i]])
	                control.css(names[i], from[names[i]]);
	        }
	        return this
	    },
	    applyBox: function () {
	        this.boxControl && $.isStr(this.boxControl) && (this.boxControl = this[this.boxControl])
	        this.boxControl || (this.boxControl = this.el);
	        this.posControl && $.isStr(this.posControl) && (this.posControl = this[this.posControl])
	        this.posControl || (this.posControl = this.outer || this.el)

	        var h = this.height, w = this.width;
	        if (this.size != null && this.size !== "") {
	            var s = this.size.toString().toLowerCase().trim()
	            if (ui.util.typicalSize[s]) {
	                (this.boxControl || this.el).addClass(this.baseCss + "-" + s);
	            }
	            else {
	                var ss = s.indexOf(',') > -1 ? s.split(',') : s.split(/[,\s]/);
	                w = ss[0]
	                h = ss[1]
	            }
	        }
	        if (h != null && h !== "")
	            this.setHeight(h)
	        if (w != null && w !== "")
	            this.setWidth(w)

	        this.setControlCssBy(this.posControl, this, "left,top,right,bottom");
	        return this;
	    },
	    initClass: function () {
	    },
	    initTemplate: function (types) {
	        //	        this.eachFrame(this.domFrame, function (f) {
	        //	            f = f.camelCase()
	        //	            this[f + "Format"] && (this[f + "Template"] = new ui.Template.create(this[f + "Format"]))
	        //	        });

	        //	        if (types) {
	        //	            for (var i = 0; i < types.length; i++) {
	        //	                var eName = types[i]
	        //	                cName = eName.camelCase()
	        //	                this[cName + "Format"] && (this[cName + "Template"] = new ui.Template.create(this[cName + "Format"]))
	        //	            }
	        //	        }
	        //	        else {
	        //	            this.domFrame && arguments.callee.call(this, this.domFrame)
	        //	            this.templates && arguments.callee.call(this, this.templates)
	        //	        }
	        return this
	    },
	    onPreRender: $e.createEventFn('preRender'),
	    onRender: $e.createEventFn('render'),
	    onBuildUI: $e.createEventFn('buildUI'),
	    buildUI: function () {
	        this.createFrame()
	        this.createInnerContent()
	        this.initContent();
	        if (this.items && this.items.length) {
	            this.createLayout()
	            if (this.layout) {
	                this.layout.join(this);
	                this.layout.render(this);
	            }
	        }
	        return this;
	    },
	    createLayout: $.emptyFun,
	    processItem: function (item) {
	    },

	    //	    createItems: function () {
	    //	        for (var i = 0; i < this.items; i++) {
	    //	            var item = this.items[i]
	    //	            if ($.is(item, ui.Control)) continue;
	    //	            item = cMgr.create(item);
	    //	            this.items[i] = item;
	    //	        }
	    //	        return this;
	    //	    },
	    //	    renderItems: function () {
	    //	        for (var i = 0; i < this.items; i++) {
	    //	            var item = this.items[i]
	    //	            item.render(this.inner)
	    //	        }
	    //	        return this;
	    //	    },
	    createInnerContent: function () {
	        return this
	    },

	    initContent: function () {
	        if (this.config.text)
	            this.setText(this.config.text)
	        else if (this.config.html)
	            this.setHtml(this.config.html)
	    },

	    createElement: function (type, fire) {
	        var c = type.camelCase()
	        if (fire != false)
	            this.fire('preCreate' + type)

	        var temp = this[c + "Template"]
	        var el
	        temp || this[c + "Format"] && (temp = new ui.Template(this[c + "Format"]))
	        if (temp) {
	            el = temp.format(this).toElement()//this[c] = 
	            if (fire != false) this.fire('create' + type)
	        }
	        return el
	    },

	    elTemplate: ui.Template.create('<div id="{id}" class="{baseCss} {css}" style="{style}" ></div>'),
	    elFormat: null,
	    createEl: function () {
	        return this.createElement('El', true)
	    },

	    wrapTemplate: null,
	    wrapFormat: '',
	    createWrap: function () {
	        return this.createElement('Wrap', true)
	    },
	    inner: "body",
	    bodyTemplate: ui.Template.create('<DIV class="{baseCss}-body"></DIV>'),
	    bodyFormat: null,
	    createBody: function () {
	        return this.createElement('Body', true)
	    },
	    onCreateFrame: $e.createEventFn("createFrame"),
	    domFrame: "El",
	    eachFrame: function (f, c, p) {
	        var me = this
	        if ($.isStr(f))
	            c.call(me, f, p);
	        else if ($.isArray(f))
	            f.each(function (fi) {
	                me.eachFrame(fi, c, p);
	            });
	        else
	            $.each(f, function (fi, k) {
	                var pi = c.call(me, k, p)
	                me.eachFrame(fi, c, pi);
	            });
	    },
	    createFrame: function () {
	        if (this.fire('preCreateFrame') === false)
	            return false;
	        this.eachFrame(this.domFrame, this.createFrameEl);

	        this.outer = this.outer ? ($.isStr(this.outer) ? this[this.outer] : this.outer) : this.firstChild;
	        this.inner = this.inner ? ($.isStr(this.inner) ? this[this.inner] : this.inner) : this.lastChild;
	        this.onCreateFrame();
	    },
	    createFrameEl: function (el, parent) {
	        var cName = el.camelCase(), e = this[cName], step = "create" + el
	        e = e || (this[step] ? this[step]() : this.createElement(el))

	        if (e) {
	            this[cName + "InnerSelector"] && (e.inner = e.find(this[cName + "InnerSelector"]))
	            if (parent) {
	                e.parentNode = parent.inner || parent
	                if (e instanceof ui.Control)
	                    e.render(e.parentNode)
	                else
	                    dh.append(dh.getInner(e.parentNode), dh.getOuter(e))
	                //dh.getOuter(e).appendTo();
	            }
	            else
	                this.firstChild || (this.firstChild = e)

	            this.lastChild = e

	            this[cName] = e
	        }
	        e && e.isPlugin && !e.ownerControl && e.join(this)
	        return e;
	    },
	    defaults: null,
	    items: null,
	    add: function () {
	        this.items || (this.items = new collection.MapList())
	        this.items.add.apply(this.items, arguments)
	    },
	    show: function () {
	        if (!this.el)
	            this.render();
	        this.el.show()
	    },
	    hide: function () {
	        this.el.hide()
	    },
	    disable: function (disabled) {
	        this.el.disabled(disabled);
	        this.disabled = disabled
	        this.el[disabled ? "addClass" : "removeClass"](this.baseCss + "-disabled f-disabled");
	    },
	    enable: function (enable) {
	        this.disable(enable == false);
	    },
	    destroy: function () {
	        this.eachFrame(this.domFrame, function (f) {
	            f = this[f.camelCase()]
	            f && $.destroy(f.inner, f.outer, f);
	        });
	    }
	})
    cMgr.regType('control', ui.Control)
    $.createConfig(ui.Control)

    ui.Panel = new $.Class(
    {
        base: ui.Control,
        inherit: new Array(ui.IContainer),
        constructor: function (config) {
            arguments.callee.$base.apply(this, arguments)
            this.delayRenders = []
        },

        append: function (controls) {
            var me = this
            function f(control) {
                me.items.push(control)
                if (me.inner) {
                    //                    if (control.isControl) {
                    //                        if (!control.wrap)
                    //                            return control.render(this)
                    //                        control = control.wrap.el
                    //                    }
                    me.inner.append(control)
                }
                else
                    me.delayRenders.push(control)
            }
            var arr = arguments.length > 1 ? arguments : ($.likeArray(controls) ? controls : null)
            arr ? $.each(arr, f) : f(controls)
            return this
        },
        doLayout: function () {
            if (this.layout instanceof layout.Layout)
                this.layout.doLayout()
            else
                this.layout = layout.Layout.New(this, this.layout).render();
            return this
        }
    });
    cMgr.regType('panel', ui.Panel)
    $.createConfig(ui.Panel)

    ui.Panel.createModal = function (config) {
        config || (config = {})
        config.height = "100%"
        config.width = "100%"
        config.css = "f-panel-modal"
        return new ui.Panel(config);
    }

    ui.BaseSelectionModel = $.Class(
    {
        base: lib.Component,
        constructor: function () {
            arguments.callee.$base.apply(this, arguments)
            if (!this.sortBy) {
                var p = this.selectedProperty
                this.sortBy = function (a, b) {
                    var va = a[p], vb = b[p]
                    va = va === undefined ? null : va
                    vb = vb === undefined ? null : vb
                    return va == vb ? 1 : va > vb ? 1 : -1;
                }
            }
        },
        selectEvent: "mousedown",
        selectedCss: "f-selected",
        selectedProperty: "selected",
        elName: "el",
        locked: false,
        singleSelect: false,
        compare: function (item) {
            return item[this.selectedProperty] == true
        },
        selectedItems: [],
        getItems: function () {
            return this.items;
        },
        getById: function (id) {
            return this.getItems().dataMap[id];
        },
        getRange: function (item1, item2) {
            var all = this.getItems(), i1 = all.indexOf(item1), i2 = all.indexOf(item2);
            return arrP.slice.call(all, Math.min(i1, i2), Math.max(i1, i2) + 1);
        },
        getItem: function (index) {
            return this.getItems()[index];
        },
        isItem: function (index) {
            return $.isNumber(index) ? this.getItem(index) : index
        },
        getSelections: function () {
            return this.getItems().$where("this." + [this.selectedProperty])
        },
        isSelected: function (index) {
            var item = this.isItem(index);
            return item[this.selectedProperty] ? item : undefined;
        },

        selectAll: function () {
            var all = this.getItems();
            for (var i = 0, len = all.length; i < len; i++)
                this.select(all[i], true)
            this.onSelectionChange();
            return this
        },
        clearSelections: function (exceptItem) {
            var all = this.singleSelect ? (this.lastSelectedItem ? [this.lastSelectedItem] : []) : this.getItems();
            for (var i = 0, len = all.length; i < len; i++) {
                if (!exceptItem || exceptItem != all[i])
                    this.select(all[i], false, true, false)
            }
            this.onSelectionChange();
            return this
        },
        setState: function (item, isSelected) {
            dh[isSelected ? "addClass" : "removeClass"](item[this.elName], this.selectedCss);
            if (isSelected)
                this.lastSelectedItem = item;
            else if (this.lastSelectedItem == item)
                this.lastSelectedItem = null;
            item[this.selectedProperty] = isSelected
            return this;
        },
        toggleState: function (item, keep, fire) {
            this.select(item, !item[this.selectedProperty], keep, fire)
        },

        lastSelectedItem: null,
        select: function (index, selected, keep, fire) {
            var item = this.isItem(index);
            if (selected == null) selected = true;

            if (keep === false || (selected && this.singleSelect))
                this.clearSelections(item);

            if (selected == !!this.isSelected(item))
                return;

            if (fire != false && this.onSelect(item, selected) === false) return;

            this.setState(item, selected);

            if (fire !== false)
                this.onSelectionChange()

            return this
        },
        onSelectionChange: $e.createEventFn("selectionchange"),
        onSelect: $e.createEventFn("selectitem"),
        itemEventFire: function (item, keep) {
            var lItem = this.lastSelectedItem
            if ($event.shiftKey && lItem) {
                this.clearSelections();
                var range = this.getRange(lItem, item)
                for (var i = 0; i < range.length; i++)
                    this.select(range[i], true, true);
                this.lastSelectedItem = lItem
            }
            else
                this.toggleState(item, keep == true || $event.ctrlKey);

            if ($event.ctrlKey || $event.shiftKey)
                dh.unSelection();
        }
    });

    ui.tree.CheckboxSelectionModel = $.Class(
    {
        base: ui.BaseSelectionModel,
        constructor: function () {
            arguments.callee.$base.apply(this, arguments)
        },
        join: function (tree) {
            this.tree = tree
            this.getItems = function () {
                return tree.allNodes
            }
        },
        selectedCss: "f-node-checked",
        selectedProperty: "checked",
        parentCascade: true,
        childCascade: true,
        fireByText: true,
        fireByCheckbox: true,
        fireByIcon: false,
        applyNode: function (node) {
            if (this.fireByText && node.content)
                node.content.onClick(node.toggleCheck, node, true)

            if (this.fireByCheckbox && node.checkbox)
                node.checkbox.onClick(function (box) {
                    this.check(box.checked, true)
                }, node);

            if (this.fireByIcon && node.icon)
                node.icon.onClick(node.toggleCheck, node, true)
        }
    })

    ui.tree.Node = $.Class(
    {
        base: comp,
        constructor: function () {
            arguments.callee.$base.apply(this, arguments)
            this.deep = this.tree.ownerNode ? this.tree.ownerNode.deep + 1 : 0
            this.nodes = new $.collection.MapList();
            this.leaf = this.record.leaf
            if (this.leaf == null) {
                var c = this.record[this.tree.childrenProperty]
                this.leaf = c == null || !$.likeArray(c) || c.length == 0
            }
        },
        leaf: true,
        el: null,
        content: null,
        icon: null,
        toggleButton: null,

        nodes: null,
        expanded: false,
        checked: false,
        check: function (checked, cascade) {
            var lItem = this.tree.root.lastCheckedNode
            if (cascade === true && $.$event.shiftKey && lItem) {
                var sm = this.tree.sm
                var range = sm.getRange(lItem, this)
                for (var i = 0; i < range.length; i++)
                    range[i].check(checked, false);
            }
            else if (cascade)
                this.tree.root.lastCheckedNode = this;

            this.checked = checked;
            this.checkbox && (this.checkbox.dom.checked = checked);
            if (cascade == true && !this.tree.singleSelect) {
                if ($.$event == null || !$.$event.shiftKey && !$.$event.ctrlKey) {
                    this.tree.sm.childCascade && this.cascadeChild()
                    this.tree.sm.parentCascade && this.cascadeParent()
                }
            }
            this.el[this.checked ? "addClass" : "removeClass"](this.tree.sm.selectedCss)
            return this;
        },
        toggleCheck: function (cascade) {
            return this.check(!this.checked, cascade)
        },
        cascadeParent: function () {
            var p = this.parentNode
            if (p) {
                p.check(this.checked ? true : p.nodes.any("this.checked"))
                p.cascadeParent()
            }
        },

        cascadeChild: function () {
            return this.checkAll(this.checked)
        },

        checkAll: function (checked) {
            if (!this.leaf)
                this.nodes.each(function (n) {
                    n.check(this.checked)
                    n.checkAll()
                }, this)
            return this
        },

        toggleFire: function () {
            var target = $.$event.target
            if (this.leaf != true) {
                if (target == this.toggleButton.dom ||
                    (this.tree.toggleByIcon && target == this.icon.dom) ||
                    (this.tree.toggleByContent && target == this.content.dom)) {
                    this.toggle();
                    return false;
                }
            }
        },
        toggle: function () {
            return this.expanded ? this.collapse() : this.expand();
        },
        collapse: function () {
            this.el.removeClass("f-node-expand")
            this.el.dom.className += " f-node-collapse"
            this.expanded = false;
            if (this.childrenRow)
                this.childrenRow.hide()
            return this
        },
        expand: function () {
            this.el.removeClass("f-node-collapse")
            this.el.dom.className += " f-node-expand"
            this.expanded = true
            this.showChildPad();
            return this
        },
        buildUI: function (text) {

            this.items = new $('<img src="{0}" class="f-1618 f-toggle" /><img src="{0}" class="f-1618 f-icon" />{1}<a class="f-content"></a>'.format(ui.util.emptyImg, this.tree.checkBoxHtml));
            var i = 0;
            this.toggleButton = new ui.Element(this.items[i++]);
            this.icon = new ui.Element(this.items[i++]);

            if (this.tree.useCheckbox)
                this.checkbox = new ui.Element(this.items[i++]);

            this.content = new ui.Element(this.items[i++]);

            dh.addHoverIfIE6(this.toggleButton, "f-toggle-over");

            this.toggleButton.css("margin-left", this.deep * this.tree.deepIndent);

            this.setText(text)

            this.elBody.append(this.items)

            this.elBody.on(this.tree.toggleEvent, this.toggleFire, this)

            if (this.expanded) this.expand();

            this.tree.root.sm && this.tree.root.sm.applyNode(this)

        },

        setText: function (text) {
            if (text === undefined)
                text = this.record.get(this.tree.contentProperty)
            this.content.dom[this.tree.contentDomProperty] = text;
            return this;
        },
        showChildPad: function () { }
    })

    //    $.collection.SortInfo.typeDefaultCompares.push(
    //    {
    //        type: ui.tree.Node,
    //        compare: function (by) {
    //            return function (a, b) {
    //                var va = a.record.get(a), vb = b.record.get(b)
    //                return va == vb ? 0 : va > vb ? 1 : -1
    //            }
    //        }
    //    })

    ui.SimpleButton = $.Class(
    {
        base: ui.Control,
        baseCss: "f-sbtn",
        domFrame: ["El"],
        tagName: 'auto',
        elFormat: '<{tagName} class="{baseCss} {css}" style="{style}" ></{tagName}>',
        createEl: function () {
            var me = this
            this.tagName == 'auto' && (this.tagName = this.href ? "a" : 'button')
            var el = this.createElement('El', true)
            if (this.href)
                el[0].href = this.href;

            if (this.handler)
                el.click(function () {
                    return me.handler.apply(arguments) != false;
                });

            el.focus(function () {
                el.addClass(me.baseCss + "-focus");
            });

            el.blur(function () {
                el.removeClass(me.baseCss + "-focus");
            });

            return el;
        },
        href: null,
        handler: null
    });
    cMgr.regType("simplebutton", ui.SimpleButton);

    ui.TextNode = $.Class(
    {
        constructor: function (config) {
            if ($.isStr(config))
                this.text = config;
            else {
                arguments.callee.$base.apply(this, arguments);
            }
        },
        base: ui.Control,
        render: function (to) {

            if (!this.el)
                this.el = new ui.Element(document.createTextNode(this.text));
            if (to !== false) {
                this.container = to || this.renderTo ? $.getInner(to || this.renderTo) : new ui.Element(document.body);
                this.container.append(this.el);
            }

            this.rendered = true
            return this
        }
    });
    cMgr.regType("textnode", ui.TextNode);

    ui.HtmlNode = $.Class(
    {
        constructor: function (config) {
            if ($.isStr(config))
                this.html = config;
            else {
                arguments.callee.$base.apply(this, arguments);
            }
        },
        tag: 'span',
        elTemplate: ui.Template.create('<{tag} id="{id}" class="{css}" style="{style}" ></{tag}>'),
        base: ui.Control
    });
    cMgr.regType("htmlnode", ui.HtmlNode);

    ui.BaseButton = $.Class(
    {
        base: ui.Control,
        constructor: function () {
            this.onCreateFrame(this.initMouseEvent)
            arguments.callee.$base.apply(this, arguments);
        },

        initClass: function () {
            this._wrapCss = this.wrapCss || '';
            if (this.iconCss)
                this._wrapCss += " f-hasIcon"

            this._iconCss = this.iconCss || ''

            if (this.iconPos == "right") {
                this._iconCss += " f-icon-right"
                if ($.browser.isFirefox || $.browser.isOpera)
                    this.onRender(function () {
                        this.button.css("background-position-x", "right")
                    }, this);
            }
        },
        baseCss: "f-bbtn",
        elFormat: '<a class="{baseCss} {css}" style="{style}" unselectable=on ></a>',
        wrapFormat: '<span class="{baseCss}-wrap {_wrapCss}" ></span>',
        buttonFormat: '<span class="f-b-btn {_iconCss}" style="{iconStyle}"></span>',
        domFrame: { El: { Wrap: "Button"} },
        enableToggle: false,
        toggleOn: false,
        toggle: function (isOn) {
            this.toggleOn = isOn;
            dh[isOn ? "addClass" : "removeClass"](this.el.dom.firstChild, this.baseCss + "-active");
            this.onToggle()
        },
        onToggle: $e.createEventFn("toggle"),
        initMouseEvent: function () {
            this.el.onClick(function () {
                if (this.disabled) return false;
                $.Event.stop()
                if (this.enableToggle) {
                    this.toggle(!this.toggleOn)
                }
                if (this.handler)
                    this.handler.call(this.scope || this);
            }, this)
            dh.downFocusIfIE67(this.el.dom).addActiveIfIE8(this.wrap.dom, this.baseCss + "-active");
        },
        setText: function (text) {
            if (text == null || text == "")
                this.button.dom.innerHTML = ""
            else {
                this.button.dom.innerHTML = "<span class=f-b-btn-text ></span>"
                this.button.dom.firstChild.innerText = text
            }
            return this
        },
        setHtml: function (html) {
            if (html == null || html == "")
                this.button.dom.innerHTML = ""
            else
                this.button.dom.innerHTML = "<a class=f-b-btn-text >" + html + "</a>"
            return this
        }
    })
    cMgr.regType("basebutton", ui.BaseButton);

    ui.Button = $.Class(
    {
        base: ui.BaseButton,
        baseCss: "f-btn",
        wrapFormat: '<table cellpadding=0 cellspacing=0 border=0 class="{baseCss}-wrap {_wrapCss}" >'
            + '<tr><td class=f-b-t-l ></td><td class=f-b-t-c ></td><td class=f-b-t-r ></td></tr>'
            + '<tr><td class=f-b-m-l ></td><td class=f-b-m-c ></td><td class=f-b-m-r ></td></tr>'
            + '<tr><td class=f-b-b-l ></td><td class=f-b-b-c ></td><td class=f-b-b-r ></td></tr>'
            + '</table>',
        createWrap: function () {
            var e = ui.Button.$base.prototype.createElement.call(this, "Wrap")
            e.inner = this.buttonCell = new ui.Element(e.dom.rows[1].cells[1])
            return e;
        },
        setWidth: function (width) {
            this.wrap.width(width);
        }
    })
    cMgr.regType("button", ui.Button);

    ui.XSplit = $.Class({
        base: ui.Control,
        domFrame: ["El"],
        baseCss: "f-xsplit",
        elTemplate: ui.Template.create('<span class="{baseCss}" ></span>')
    })
    cMgr.regType("xsplit", ui.XSplit);

    ui.layout.Layout = $.Class({
        base: ui.Control,
        baseCss: "f-layout",
        buildUI: function () {
            this.createFrame()
            this.renderItems();
            return this;
        },
        renderItems: function () {
            for (var i = 0; i < this.items.length; i++)
                this.createBlock(i, this.items[i]);
            return this
        },
        doLayout: function () {
            return this;
        },
        setBlocksConfig: function (blockConfigs) {
            this.blockConfigs = blockConfigs;
        },
        join: function (control) {
            this.control = control;
            this.items = new collection.MapList();
            this.blockConfigs || (this.blockConfigs = control.items)
            return this
        },

        domFrame: ["Root", "Blocks"],
        templates: ["Block"],
        rootFormat: null,
        rootTemplate: ui.Template.create("<div ></div>"),
        createRoot: function () {
            var e = this.createElement("Root", true);
            e.addClass(this.control.baseCss + "-layout")
            return e
        },
        createBlocks: function () {
            this.blocks = []
            for (var i = 0; i < this.blockConfigs.length; i++) {
                var el = this.createBlock(i, this.blockConfigs[i]);
                if (el) {
                    if (el.style)
                        el.el.css(el.style)
                    this.blocks[i] = el;
                }
            }
        },
        blockFormat: null,
        blockTemplate: null,
        createBlock: function (index, item) { }
    });

    ui.layout.Layout.create = function (type, config) {
        return typeof (type) == "function" ? new type(config) : new (cMgr.getType("layout:" + type))(config);
    }

    cMgr.regType("layout:layout", ui.layout.Layout)


    ui.layout.Column = $.Class({
        base: ui.layout.Layout,
        baseCss: "f-l-column",
        rootTemplate: ui.Template.create('<table class="{baseCss}" border=0 cellpadding=0 cellspacing=0 ><tr></tr></table>'),
        blockTemplate: ui.Template.create('<td class="{baseCss}-{0}" nowrap ></td>'),

        createBlock: function (index, item) {
            var el = this.blockTemplate.format(index, this, item).toElement()
            el.appendTo(this.root.dom.rows[0])
            item.el = el
            return item;
        },
        renderItems: function () {
            for (var i = 0; i < this.blocks.length; i++) {
                var block = this.blocks[i]
                for (var ii = 0; ii < block.items.length; ii++) {
                    var control = block.items[ii] = cMgr.create(block.items[ii], ui.Control)
                    this.control.processItem(control);
                    control.render(block.el)
                    control.el.addClass(this.baseCss + "-item");
                }
            }
            return this;
        }
    });
    cMgr.regType("layout:column", ui.layout.Column)

    ui.Toolbar = $.Class({
        base: ui.Panel,
        layout: "column",
        baseCss: "f-toolbar",
        inner: 'el',
        processItem: function (item) {
            var css = item.baseCss + "-nobg-normal"
            if ($.is(item.el, ui.Control))
                item.el.addClass(css)
            else
                item.css = (item.css || '') + ' ' + css
        },
        parseItem: function (item) { return item },
        createLayout: function () {
            if (!$.is(this.layout, ui.layout.Layout))
                this.layout = ui.layout.Layout.create(this.layout)
            var config = []
            for (var i = 0; i < this.items.length; i++) {
                var block = {}, item = this.items[i];
                this.parseItem && (item = this.parseItem(item))
                if (item == null) continue;
                if (item == "->") {
                    block.style = { width: "100%" };
                    item = { ctype: "textnode", text: '' }
                }
                else if (item == "|") {
                    item = { ctype: "xsplit" }
                }
                else if ($.isStr(item)) {
                    item = { ctype: "htmlnode", html: item }
                }

                $.isObject(item) || (item = { text: item })

                item.ctype || (item.ctype = "button")

                block.items = [item]

                config.push(block);
            }
            this.layout.setBlocksConfig(config)
            return this
        }
    });

    cMgr.regType("toolbar", ui.Toolbar);

});

//alert(new Date()-ddd)
