

/* #C path:fly.simple 
Version 1.0 alpha
http://www.flyui.net
Email:flyui&hotmail.com
Copyright (c) 2009 KuiyouLi
2010-12-25
*/
window.fly || (window.fly = {});
fly.simple || (fly.simple = {});

/*	扩展,扩展前检测是否存在
@target	:被扩展的对象
@overrides:包含扩展成员的任意多个参数
@return	:target
*/
fly.simple.extendIf = (fly.simple.extendIf || function (target, overrides) {
    for (var i = 1; i < arguments.length; i++) {
        var a = arguments[i]
        for (var k in a)
            target[k] || (target[k] = a[k])
    }
    return target;
});

var __isIE6 = navigator.userAgent.toLowerCase().indexOf("msie 6") > -1
fly.simple.extendIf(fly.simple, {
    /*	path:fly.simple.$
    通过id获取dom对象
    @id	:String/Dom dom对象id
    @return	:Dom Dom对象
    */
    $: function (id) {
        return id && id.constructor == String ? document.getElementById(id) : id;
    },

    /*	扩展
    @target	:被扩展的对象
    @overrides:包含扩展成员的任意多个参数
    @return :target
    */
    extend: function (target, overrides) {
        for (var i = 1; i < arguments.length; i++) {
            var a = arguments[i]
            for (var k in a) target[k] = a[k]
        }
        return target;
    },
    tempDiv: document.createElement("div"),
    /* String 空图片地址 */
    emptyImg: __isIE6 ? "http://www.flyui.net/s.gif" : "data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
    /* Boolean 是否IE6浏览器 */
    isIE6: __isIE6,
    isType: function (obj, type) {
        return obj instanceof window[type] || Object.prototype.toString.call(obj) == "[object " + type + "]"
    },
    /* 检测对象是否是数组
    @obj	:要检测的对象
    @return :Boolean 
    */
    isArray: function (obj) {
        return this.isType(obj, "Array")
    },
    /* 检测对象是否是字符串
    @obj	:要检测的对象
    @return :Boolean 
    */
    isStr: function (obj) {
        return this.isType(obj, "String")
    },
    /* 检测对象是否是函数
    @obj	:要检测的对象
    @return :Boolean 
    */
    isFun: function (obj) {
        return this.isType(obj, "Function")
    },
    /* 假如对象是函数，则返回执行函数的返回值，否则返回对象本身
    @obj	:要检测的对象
    @return :Boolean 
    */
    ifFun: function (obj) {
        return this.isFun(obj) ? obj.apply(this, Array.prototype.slice.call(arguments, 1)) : obj;
    },
    /* 一个返回false的函数
    @return :Boolean 
    */
    falseFun: function () { return false; },
    /* 执行Ajax请求的方法，fly.simple不提供，如需执行Ajax请求，请自行实现该方法
    @option : 执行Ajax请求的选项
    */
    ajax: window.$ ? window.$.ajax : null,
    /*#C path:fly.simple.ajaxOption
    构造Ajax请求选项
    @option :Object/String/Function 执行Ajax请求的选项或Ajax请求的url或获取选项的函数
    @callback:Function Ajax请求的回调函数
    @sender :option调用或url格式化的参数
    */
    ajaxOption: function (option, callback, sender) {
        var me = this
        option = fly.simple.ifFun(option, sender);
        if (option && option.constructor == String)
            this.url = option
        else
            fly.simple.extend(this, option);

        /*Ajax请求的 url*/
        this.url = fly.simple.ifFun(this.url, sender || this);

        if (this.url && this.url.constructor == String)
            this.url = fly.simple.format(this.url, sender);

        var cb = this.callback;
        var hd = 0;
        /*  #M Ajax请求的 url
        @result :String Ajax请求的返回值
        */
        this.callback = this.success = this.error = this.failure = function (result) {
            if (hd)
                return;
            hd = 1;
            cb && cb.apply(this, arguments)
            callback && callback.apply(this, arguments)
        };
    },
    /* #C path:fly.simple */

    /* 
    格式化
    调用示例：
    var str=fly.simple.format("a{0}c{1}","b","d")
    调用结果 str 等于“abcd”

    var obj={f1:1,f2:2}
    var str=fly.simple.format("{f1}+{f2}={0}",3,obj)
    调用结果 str 等于“1+2=3”

    @data   :String 要格式话的对象，目前仅支持字符串
    @objs   :Object 可变参数
    @return :String 格式化得到的字符串
    */
    format: function (data, objs) {
        switch (typeof (data)) {
            case "string":
                {
                    var args = arguments;
                    var o = arguments[arguments.length - 1] || this;
                    return data.replace(/\{([^\}]{1,50})\}/g, function (m, n) {
                        var v;
                        if (/^\d+$/.test(n))
                            v = args[parseInt(n) + 1]
                        else
                            v = o[n]
                        return v == null ? "" : v;
                    });
                }
        }
    },
    //    load: function (byAjax, callback, data) {
    //        byAjax ? fly.simple.ajax(new fly.simple.ajaxOption(data, callback)) : callback(data)
    //    },

    /* 将dom对象插入指定位置
    @parent :Dom 将dom插入该容器
    @ref    :Dom/null 插入位置参考对象
    @dom    :Dom 要插入的对象
    @where  :String beforeBegin、afterEnd、beforeEnd、afterBegin 要插入的位置
    */
    insertElement: function (parent, ref, dom, where) {
        if (ref) {
            ref.insertAdjacentElement(where, dom);
        }
        else {
            parent.appendChild(dom);
        }
    },
    /* 将dom对象插入指定对象前面
    @parent :Dom 将dom插入该容器
    @ref    :Dom/null 插入位置参考对象
    @dom    :Dom 要插入的对象
    */
    insertBefore: function (parent, ref, dom) {
        this.insertElement(parent, ref, dom, "beforeBegin")
    },
    /* 将dom对象插入指定对象后面
    @parent :Dom 将dom插入该容器
    @ref    :Dom/null 插入位置参考对象
    @dom    :Dom 要插入的对象
    */
    insertAfter: function (parent, ref, dom) {
        this.insertElement(parent, ref, dom, "afterEnd")
    },
    //    fire: function (obj, e) {
    //        return obj[e] == null || obj[e].apply(obj, Array.prototype.slice.call(arguments, 2));
    //    },

    /* 为dom对象绑定事件
    @dom    :Dom 要绑定事件的对象
    @e      :String 要绑定的事件
    @fn     :Function 为事件绑定的回调函数
    */
    attachEvent: function (dom, e, fn) {
        function f(evt) {
            var hasEvent = window.event
            evt = window.event || evt;
            if (!hasEvent)
                window.event = evt

            if (fn.call(dom, evt, dom) === false) {
                evt.cancelBubble = true
                evt.stopPropagation && evt.stopPropagation()
                evt.preventDefault && evt.preventDefault()
            }

            if (!hasEvent)
                window.event = null;
        }
        dom.attachEvent ? dom.attachEvent("on" + e, f) : dom.addEventListener(e, f, false);
    },
    /* 为对象多个成员绑定事件
    调用示例：
            
    var obj={body:document.body,form:document.forms[0]};
    function callback()
    {
    alert('回调')
    }

    fly.simple.bindEvents(obj,{body:"click",form:"keydown"},callback);
    以上代码为document.body绑定click事件，为第一个form绑定 keydown事件

    @obj    : 包含dom成员的对象
    @events :KeyValue key：成员名称，value为成员绑定的事件名称
    @fn     :Function 为事件绑定的回调函数
    */
    bindEvents: function (obj, events, fn) {
        for (var k in events)
            obj[k] && this.attachEvent(obj[k], events[k], fn)
    },
    /* 为a标签在IE6下设置鼠标事件
    @a    :Dom a标签
    */
    ie6aHover: function (a) {
        if (a) {
            a.href = "javascript:";
            a.onclick = this.falseFun
        }
    },

    /* 改变CSS样式
    调用示例：
    var cls=fly.simple.changeCss(document.body,"css-blue css-red","css-yellow")
    给 document.body 移除 css-blue 和 css-red 样式后，追加 css-yellow 样式
        
    var oldCls="css-gray css-blue css-red"
    var cls=fly.simple.changeCss(oldCls,"css-blue css-red","css-yellow")
    给 oldCls 移除 css-blue 和 css-red 样式后，追加 css-yellow 样式
    调用结果 cls 等于“css-gray css-yellow”

    注意：
    该方法执行是先移除后追加，如果同一个样式同时出现在 removeCss 和 addCss 参数中时，该样式最终被追加，如：
    var oldCls="css-gray a b"
    var cls=fly.simple.changeCss(oldCls,"a b","b")
    给 oldCls 移除 a 和 b 样式后，追加 b 样式
    调用结果 cls 等于 “css-gray b”

    @dom    :Dom/String 要改变样式的dom对象或字符串
    @removeCss  :String 要移除的样式,多个样式用空格隔开
    @addCss :String 要追加的样式,多个样式用空格隔开
    @return :String 改变后的样式
    */
    changeCss: function (dom, removeCss, addCss) {
        var isStr = typeof (dom) == "string"
        var old = isStr ? dom : dom.className;
        var c = removeCss ? this.removeCss(old, removeCss) : old;
        c = addCss ? this.addCss(c, addCss) : c;
        !isStr && c != old && (dom.className = c)
        return c;
    },
    /* 追加CSS样式
    @dom    :Dom/String 要追加样式的dom对象或字符串
    @css  :String 要追加的样式,多个样式用空格隔
    @return :String 追加后的样式
    */
    addCss: function (dom, css) {
        var isStr = typeof (dom) == "string"
        var old = (isStr ? dom : dom.className).replace(/^ +| +$/g, "");
        if (old == "") {
            isStr || (dom.className = css)
            return css
        }

        var c = " " + old + " ";
        css.replace(/\S+/g, function (o) {
            if (c.indexOf(' ' + o + ' ') < 0)
                c += " " + o;
        });
        c = c.replace(/ +/g, " ").replace(/^ +| +$/g, "");
        !isStr && c != old && (dom.className = c)
        return c;
    },
    /* 移除CSS样式
    @dom    :Dom/String 要移除样式的dom对象或字符串
    @css  :String 要移除的样式,多个样式用空格隔
    @return :String 移除后的样式
    */
    removeCss: function (dom, css) {
        var isStr = typeof (dom) == "string"
        var old = (isStr ? dom : dom.className).replace(/^ +| +$/g, "");
        if (old == "") return "";

        var c = " " + old.replace(/\s/g, '  ') + " ";
        css.replace(/\S+/g, function (o) {
            c = c.replace(new RegExp("\\s" + o + "\\s", "g"), " ");
        });
        c = c.replace(/ +/g, " ").replace(/^ +| +$/g, "");
        !isStr && c != old && (dom.className = c)
        return c;
    },
    /* 移除dom对象
    @dom    :Dom 要移除的dom对象
    */
    remove: function (dom) {
        this.tempDiv.appendChild(dom);
        this.tempDiv.innerHTML = "";
    },
    /* 改变函数调用中 this 的值
    @fn     :Function 被改变的函数
    @scope  :this的值
    @return :将函数包裹后得到的函数
    */
    scope: function (fn, scope) {
        return function () { return fn.apply(scope, arguments); }
    },
    /* 将类从另一个类继承
    @sun    :Class 子类
    @base   :Class/Object 基类
    @extand :KeyValue(可选) 同时扩展的新成员
    */
    inherit: function (sun, base, extand) {
        var bp = base.prototype || base
        function f() { };
        f.prototype = bp;

        sun.prototype = new f();
        sun.prototype.base = new f();

        sun.baseType = base instanceof Function ? base : f;
        base instanceof Function && this.extendIf(sun, base);
        sun.prototype.constructor = sun
        extand && this.extend(sun.prototype, extand);
    },
    /* 遍历
    @arr    :Array/KeyValue 被遍历的数组或键值对
    @fn     :Function 处理每一项的函数，返回 false 将停止遍历
    @return :Object/undefined 如果遍历过程中途停止，则返回导致遍历过程停止的项，否则没有返回值
    */
    each: function (arr, fn) {
        var isFn = this.isFun(fn);
        if (this.isArray(arr)) {
            for (var i = 0; i < arr.length; i++) {
                var n = arr[i];
                if ((isFn ? fn(n) : n[fn](n)) === false) return n;
            }
        }
        else {
            for (var i in arr) {
                var n = arr[i];
                if ((isFn ? fn(n) : n[fn](n)) === false) return n;
            }
        }
    },
    _eachAll: function (item, children, fn, level, curr) {
        if (curr > level) return;
        if ((this.isFun(fn) ? fn(item, curr) : item[fn](item, curr)) === false) {
            fly.simple.__eachAllStop = item;
            return false;
        }
        curr++;
        if (curr > level) return;
        var ns = this.isFun(children) ? children(item) : item[children]
        if (ns instanceof Array)
            for (var i = 0; i < ns.length; i++)
                if (this._eachAll(ns[i], children, fn, level, curr) === false) return false;
    },
    /* 遍历所有项，通常用来遍历树形结构
    @items  :Array/Object 被遍历的数组或单个节点
    @children:String/Function 获取子节点函数或指向子级节点的属性名
    @fn     :Function 处理每一项的函数，返回 false 将停止遍历
    @level  :Int(可选) 被遍历的层次，
    @return :Object/undefined 如果遍历过程中途停止，则返回导致遍历过程停止的节点，否则没有返回值
    */
    eachAll: function (items, children, fn, level) {
        if (level === false || level < 1) return;
        level === true && (level = 1000000)
        var me = this;
        if (this.isArray(items) ? this.each(items, function (item) {
            return me._eachAll(item, children, fn, level, 1)
        }) : this._eachAll(items, children, fn, level, 1) === false)
            return fly.simple.__eachAllStop;
    },
    /* 查找所有项，通常用来查找树形结构
    @items  :Array/Object 被查找的数组或单个节点
    @children:String/Function 获取子节点函数或指向子级节点的属性名
    @filter :Function/Object 判断每一项是否符合要求的函数或值，返回 false 将停止遍历
    @level  :Int(可选) 被遍历的层次，
    @take   :Int(可选) 获取的节点数
    @return :Array 查找的节点数组
    */
    queryAll: function (items, children, filter, level, take) {
        var list = []
        var fn = filter;
        if (take == null || take > -1000000 == false)
            take = 1000000000;
        var isFn = this.isFun(fn);
        filter = function (i, l) {
            if (take > list.length) {
                if (isFn ? fn(i, l) : fn) list.push(i);
            }
            else
                return false;
        }
        this.eachAll.apply(this, arguments)
        return list;
    },

    /* 遍历树形结构中节点的所有上级节点
    @item   :当前节点
    @fn     :Function 处理节点的函数，返回 false 将停止遍历
    @level  :Int(可选) 被遍历的层次，
    @parent :String/Function(可选) 获取上级节点函数或指向上级节点的属性名,默认“parent属性”
    @return :Object/undefined 如果遍历过程中途停止，则返回导致遍历过程停止的节点，否则没有返回值
    */
    eachParent: function (item, fn, level, parent) {
        (level === true || level == null) && (level = 1000000)
        var l = 1;
        var isFn = this.isFun(fn);
        arguments.length < 4 && (parent = "parentItem")
        var pIsFun = this.isFun(parent);
        while (l <= level && (item = (pIsFun ? parent(item) : item[parent]))) {
            if ((isFn ? fn(item, l) : item[fn](item, l)) === false)
                return item;
            l++;
        }
    },
    /* 查找元素在数组中的位置
    @obj    :元素
    @arr    :Array 数组，在该数组中查找
    @return :Int 如果找到，则返回元素在数组中从0开始的索引，否则返回 -1
    */
    indexOf: function (obj, arr) {
        for (var i = 0; i < arr.length; i++)
            if (arr[i] == obj) return i;
        return -1;
    },

    /* #C path:fly.simple.selectionMode
    元素选择模式
    */
    /* path:fly.simple.selectionMode.none String 禁止选择*/
    /* path:fly.simple.selectionMode.multi String 多选*/
    /* path:fly.simple.selectionMode.single String 单选*/
    /* path:fly.simple.selectionMode.singleByLevel String 同一层内单选*/
    selectionMode: { none: "none", multi: "multi", single: "single", singleByLevel: "singleByLevel" },

    checkModeStyle: { multi: "check", single: "radio", singleByLevel: "radio" },

    /* #C path:fly.simple.checkStyle
    元素Checkbox样式
    */
    /* path:fly.simple.checkStyle.auto String 自动*/
    /* path:fly.simple.checkStyle.check String 复选框*/
    /* path:fly.simple.checkStyle.radio String 单选框*/
    checkStyle: { auto: "auto", check: "check", radio: "radio" }
});

/* #C path:fly.simple.checkMode
元素Checkbox选中模式
*/
/* path:fly.simple.checkMode.none String 禁止选择*/
/* path:fly.simple.checkMode.multi String 多选*/
/* path:fly.simple.checkMode.single String 单选*/
/* path:fly.simple.checkMode.singleByLevel String 同一层内单选*/
fly.simple.checkMode = fly.simple.selectionMode

fly.simple.itemsLayout = { "default": "default", flow: "flow" };

/* #C path:fly.simple.BaseItem
节点基类
*/
fly.simple.BaseItem = function () {
    var simple = fly.simple;
    var BaseItem = function (config) {
        typeof (config) == "string" && (config = { text: config })
        simple.extend(this, config);
        this.items = [];
        var children = config && config.children || config.items || config.nodes;
        if (children && children.length) {
            this.leaf = false
            this.load(children)
        }

    }
    var pItem = {
        /* fly.simple.BaseList 节点所属 List 控件*/
        owner: BaseItem.prototype,
        /* Boolean 节点是否根节点*/
        isRoot: false,
        /* Boolean 节点是否叶节点*/
        leaf: true,
        /* Boolean 节点是否选中*/
        selected: false,
        /* Function 节点单击时的处理函数*/
        handler: null,
        /* Boolean 节点dom对象是否已创建*/
        domCreated: false,
        /* 节点图标*/
        icon: null,
        /* 节点图标样式 */
        iconCss: null,
        /* 加载子节点
        @data :Array/String 数组或通过Ajax请求的url
        */
        load: function (data) {
            if (!data) return false;
            var me = this
            function h(data) {
                me.items.push.apply(me.items, data);
                me.syncItems();
                me.checkLeaf(me.items.length == 0)
            }
            simple.isArray(data) ? h(data) : this.owner.requestData(this, h)
        },
        /* Array 子节点*/
        items: Array.prototype,

        /* 添加子节点
        @items  :要添加的任意多个节点
        */
        add: function (items) {
            this.insert.apply(this, Array.prototype.concat.apply([-1], arguments));
        },
        /* 插入子节点到指定位置
        @index  :插入子节点的位置
        @items  :要插入的任意多个节点
        */
        insert: function (index, items) {
            this.items.splice.apply(this.items, [index < 0 ? this.items.length : Math.min(index, this.items.length), 0].concat(items))
            this.syncItems();
            this.checkLeaf(this.items.length == 0)
        },

        /* 移除子节点
        @items  :要移除的任意多个节点
        */
        remove: function (items) {
            for (var i = 0; i < arguments.length; i++) {
                var item = arguments[i]
                if (typeof item == "number") item = this.items[item];

                item.wrap && simple.remove(item.wrap)
                this.owner.allItems.splice(simple.indexOf(item, this.owner.allItems), 1);
                this.items.splice(simple.indexOf(item, this.items), 1);
                delete this.owner.itemMap[item[this.owner.itemKey]];
            }
        },
        itemsLayout: simple.itemsLayout["default"],

        /* 创建子节点容器
        @return:void
        */
        createPad: function () {
            if (!this.pad || this.pad.parentNode != this.wrap) {
                this.pad || (this.pad = this.owner.createPad(this))
                this.wrap.appendChild(this.pad);
            }
        },
        renderItems: function () {
            this.createPad();

            for (var i = 0; i < this.items.length; i++)
                this.items[i].renderTo(this.owner, this.pad, i);

            if (this.lastItem != this.items[this.items.length - 1]) {
                var lwCss = this.owner.wrapCss + this.owner.lastItemCssPart
                var lnCss = this.owner.itemCss + this.owner.lastItemCssPart
                //var lpCss = this.owner.padCss + this.owner.lastItemCssPart
                if (this.lastItem) {
                    simple.removeCss(this.lastItem.wrap, lwCss)
                    simple.removeCss(this.lastItem.panel, lnCss)
                    //simple.removeCss(this.lastItem.pad, lpCss)
                }
                this.lastItem = this.items[this.items.length - 1]
                simple.addCss(this.lastItem.wrap, lwCss)
                simple.addCss(this.lastItem.panel, lnCss)
                //simple.addCss(this.lastItem.pad, lpCss)
            }
            this.itemsRendered = true
        },
        /* 同步节点
        @return:void
        */
        syncItems: function () {
            if (this.items.length) {
                for (var i = 0; i < this.items.length; i++) {
                    var n = this.items[i];
                    n instanceof this.constructor || (n = this.items[i] = new this.constructor(n));
                    n.parentItem = this;
                    this.owner.join && this.owner.join(n);
                }

                if (this.isRoot && this.owner.rootVisible == false)
                    this.eachItems(function (item) {
                        item.parentItem = null;
                    });

                if (this.domCreated) {
                    if (!this.owner.quickly || this.itemsRendered)
                        this.renderItems()

                    if (this.isRoot) {
                        var ti = this.firstItem;
                        if (!this.owner.rootVisible && ti != this.items[0]) {
                            var fwCss = this.owner.wrapCss + this.owner.firstItemCssPart
                            var fnCss = this.owner.itemCss + this.owner.firstItemCssPart
                            if (ti && ti.wrap) {
                                simple.removeCss(ti.wrap, fwCss)
                                simple.removeCss(ti.panel, fnCss)
                            }
                            ti = this.firstItem = this.items[0]
                            if (ti && ti.wrap) {
                                simple.addCss(ti.wrap, fwCss)
                                simple.addCss(ti.panel, fnCss)
                            }
                        }

                        var swCss = this.owner.wrapCss + '-single'
                        var snCss = this.owner.itemCss + '-single'
                        ti = this.singleItem
                        if (ti && ti.wrap) {
                            simple.removeCss(ti.wrap, swCss)
                            simple.removeCss(ti.panel, snCss)
                        }

                        if (this.items.length == 1) {
                            ti = this.singleItem = this.items[this.items.length - 1]
                            if (ti && ti.wrap) {
                                simple.addCss(ti.wrap, swCss)
                                simple.addCss(ti.panel, snCss)
                            }
                        }
                        else {
                            this.lastItem = null;
                        }
                    }
                }
            }
            else {
                this.firstItem = this.lastItem = null;
            }
        },

        checkLeaf: function (leaf) {
            leaf = leaf == null ? this.leaf : !!leaf
            if (leaf == this.leaf) return;
            this.leaf = leaf;
            if (this.panel) {
                var pc = this.owner.parentItemCss, lc = this.owner.leafItemCss
                this.panel.className = simple.removeCss(this.panel.className, leaf ? pc : lc) + " " + (leaf ? lc : pc)
            }
        },
        parseIcon: function () {
            var o = this.owner;
            if (this.icon) {
                if (o.iconFormat)
                    this.icon = simple.format(o.iconFormat, this.icon, this)
            }
            else if (this.iconCss) {
                this.icon = simple.emptyImg
                this._iconCss = o.iconSizeCss
            }
        },
        checkPosition: function (container, index) {
            if (container.childNodes[index] == this.wrap || container == this.wrap) return true;
            simple.insertBefore(container, container[index], this.wrap);
        },
        /* 设置节点 text
        @text:String text属性
        */
        setText: function (text) {
            this.text = text;
            this.textDom.innerHtml = text;
        },

        markDom: function () {
            var me = this;
            var owner = me.owner;
            var all = this.panel.all || this.panel.getElementsByTagName("*");
            for (var i = 0; i < all.length; i++)
                all[i].name && (this[all[i].name] = all[i])

            if (this.iconDom && !this.icon && !this.iconCss)
                simple.remove(this.iconDom);

            if (this.href)
                this.textDom.target = this.target || owner.navTarget
            else
                this.textDom.removeAttribute("href");

            if (this.checkDom && this.checked)
                this.check(this.checked, false);

            if (this.isRoot) {
                owner.style && (this.wrap.style.cssText += ";" + owner.style);
                var wrapCss = this.wrap.className + " " + (owner.css || '')

                owner.checkMode != simple.checkMode.none && (wrapCss += " " + owner.checkStylePart + owner.checkStyle)
                owner.showToggle && (wrapCss += " " + owner.toggleStyleCssPart + owner.toggleStyle)
                owner.showLine && (wrapCss += " " + owner.lineCss)
                this.wrap.className = wrapCss

                this.createPad();

                this.pad.className += " " + owner.padCss + "-root" + (owner.rootVisible ? "" : " " + owner.padCss + "-root-hide")

                if (!owner.rootVisible)
                    this.panel.parentNode.removeChild(this.panel)
                else
                    this.panel.className += " " + owner.itemCss + "-root";

                if (owner.useEffect)
                    setTimeout(function () {
                        me.wrap.className += " " + me.owner.effectCss;
                        setTimeout(function () {
                            me.owner.applyEffect()
                        }, 10)
                    });
            }
        },

        /* 呈现节点
        @owner  :fly.simple.BaseList 节点所属控件
        @container:Dom 容器，将节点呈现到该容器内
        @index  :Int 位置
        */
        renderTo: function (owner, container, index) {
            owner.join(this);
            if (!this.domCreated) {
                if (owner.onBeforeRender && owner.onBeforeRender(this) == false) return false;
                this.parseIcon();
                this.wrap = owner.createWrap(this)
                this.panel || (this.panel = owner.createPanel(this));
                this.wrap.appendChild(this.panel);
                this.markDom()
                this.bindEvents()
                this.domCreated = true;
                this.syncItems();
                this.expanded ? this.expand() : this.collapse();
            }
            this.checkPosition(container, index);
        },
        /* Boolean 是否展开 */
        expanded: false,
        /* #M 呈现节点 */
        toggle: function (e, t) {
            if (this.owner.onToggle && this.owner.onToggle(this) === false) return false;
            try {
                document.selection && document.selection.empty()
            } catch (ex) { }
            this.expanded ? this.collapse() : this.expand();
            this.owner.onToggled && this.owner.onToggled(this);
            //2011-1-25
            if (t == this.toggleDom) return false
        },
        /* 折叠所有节点
        @ids    :Array 节点数组或节点id数组
        @return :Boolean 全部折叠返回 true,否则返回 false
        */
        collapseAll: function (ids) {
            var same = true;
            this.eachAll(function (n) {
                n.collapse();
                n.expanded && (same = false)
            }, ids == null ? true : ids);
            return same;
        },
        /* #M 折叠节点 */
        collapse: function () {
            if (this.owner.onCollapse && this.owner.onCollapse(this) === false) return false;
            var css = simple.changeCss(this.wrap.className, this.owner.expandCss, this.owner.collapseCss)
            if (this.wrap.className != css) {
                this.items.length && this.owner.applyEffect();
                this.wrap.className = css
            }
            this.expanded = false;
            this.owner.onCollapsed && this.owner.onCollapsed(this);
        },
        /* 展开所有节点
        @ids    :Array 节点数组或节点id数组
        @return :Boolean 全部展开返回 true,否则返回 false
        */
        expandAll: function (ids) {
            var same = true;
            this.eachAll(function (n) {
                n.expand();
                n.expanded || (same = false)
            }, ids == null ? true : ids);
            return same
        },
        /* #M 展开节点 
        @expandParent   :Boolean/Int 同时展开上级节点 ,为Int表示展开的层数
        */
        expand: function (expandParent) {
            if (this.owner.onExpand && this.owner.onExpand(this) === false) return false;
            var css = simple.changeCss(this.wrap.className, this.owner.collapseCss, this.owner.expandCss)
            if (this.wrap.className != css) {
                this.items.length && this.owner.applyEffect();
                this.wrap.className = css
            }
            this.expanded = true;
            if (!this.leaf && this.leaf != null) {
                this.items.length || this.owner.requestData(this, this.load);
                this.items.length && this.owner.quickly && !this.itemsRendered && this.renderItems()
            }
            if (expandParent) {
                simple.eachParent(this, function (p) {
                    p.expand();
                }, expandParent);
            }
            this.owner.onExpanded && this.owner.onExpanded(this);
        },
        /* 获取所有选择节点 
        @selected   :Boolean 选择状态,true获取所有选中节点,false获取所有未选中节点
        @take       :Int(可选) 获取的节点数,默认无限制
        @level      :Int(可选) 变量的层次,默认所有
        @includeSelf:Boolean(可选) 包含当前节点自身,默认不包含
        @return     :Array  复合条件的节点数组
        */
        getSelectItems: function (selected, take, level, includeSelf) {
            selected == null && (selected = true)
            return simple.queryAll(includeSelf ? this : this.items, "items", function (i) {
                return i.selected == selected
            }, level, take)
        },
        /* 选择节点 
        @selected   :Boolean 选择状态
        @allow      :Int(可选) 获取的节点数,默认无限制
        @return     :Boolean/Null 未执行选择返回 false, 否则不返回值
        */
        select: function (selected, allow) {
            var isToggle = typeof (selected) == "object"
            var owner = this.owner;
            selected = isToggle ? !this.selected : (selected == null ? true : !!selected)
            if (owner.selectionMode == simple.selectionMode.none) return false;
            if (owner.onSelect && owner.onSelect(this, selected, isToggle) === false) return false;

            if (selected == false && allow !== true && owner.leastSelectionOne) {
                if (owner.selectionMode == simple.selectionMode.multi) {
                    var ns = owner.selectedItems;
                    if (ns == null || ns.length == 0 || (ns.length == 1 && ns[0] == this))
                        return false
                }
                else
                    return false;
            }

            if (isToggle)
                owner.applyEffect();

            if (selected) {
                if (owner.selectionMode == simple.selectionMode.single)
                    owner.currentItem && owner.currentItem != this && owner.currentItem.select(false, true)
                else if (owner.selectionMode == simple.selectionMode.singleByLevel)
                    this.parentItem && this.parentItem.currentItem && this.parentItem.currentItem != this && this.parentItem.currentItem.select(false, true)
                simple.addCss(this.panel, owner.selectedCss);
                owner.currentItem = this
                this.parentItem && (this.parentItem.currentItem = this)
                simple.indexOf(this, owner.selectedItems) < 0 && owner.selectedItems.push(this)
            }
            else {
                simple.removeCss(this.panel, owner.selectedCss);
                this.parentItem && this.parentItem.currentItem == this && (this.parentItem.currentItem = null)
                owner.currentItem == this && (owner.currentItem = null)
                var i = simple.indexOf(this, owner.selectedItems);
                i > -1 && owner.selectedItems.splice(i, 1)
            }

            this.selected = selected;
            if (owner.keepCheckAndSelectSync && ((this.checked == true) != selected))
                this.check(selected, true)

            owner.onSelected && owner.onSelected(this, isToggle);
        },
        /* #M 绑定事件 */
        bindEvents: function () {
            var me = this
            var owner = this.owner
            var iEvents = this.owner.itemEvents
            if (iEvents) {
                for (var d in iEvents) {
                    var des = iEvents[d]
                    for (var e in des)
                        this[d] && simple.attachEvent(this[d], e, function (f) {
                            return function (e, t) {
                                return f.call(me, me, e, t);
                            }
                        } (des[e]));
                }
            }

            simple.bindEvents(this, owner.toggleEvents, simple.scope(this.toggle, this))
            owner.selectionMode == simple.selectionMode.none || simple.bindEvents(this, owner.selectEvents, simple.scope(this.select, this))

            var h = this.handler || this.owner.itemHandler
            h && simple.attachEvent(this.panel, owner.handlerEvent, function (e, t) {
                h.call(me, me, owner, e, t)
            });

            if (simple.isIE6)
                simple.ie6aHover(this.toggleDom)
        },
        /* 遍历所有项 
        @fn   :Function 处理项的函数
        @ids  :Array(可选) 默认所有节点
        @level:Int(可选) 默认所有
        @return :Object/undefined 如果遍历过程中途停止，则返回导致遍历过程停止的节点，否则没有返回值
        */
        eachAll: function (fn, ids, level) {
            ids == null && (ids = false)
            if (ids === true || ids === false)
                return this.owner.eachAll(ids ? this : this.items, fn, level);

            ids instanceof Array || (ids = ids.split(','))
            return this.eachAll(function (n) {
                for (var i = 0; i < ids.length; i++)
                    if (ids[i] === n || n.id === ids[i])
                        return fn(n)
            });
        },
        /* 遍历子节点,不包含子节点的下级节点
        @fn   :Function 处理项的函数
        @ids  :Array(可选) 默认所有节点
        @return :Object/undefined 如果遍历过程中途停止，则返回导致遍历过程停止的节点，否则没有返回值
        */
        eachItems: function (fn) {
            return simple.each(this.items, fn);
        },
        /* 是否已隐藏 */
        hidden: false,
        /* #M 隐藏节点 */
        hide: function () {
            this.hidden = true;
            this.wrap.style.display = "none"
        },
        /* #M 显示节点 */
        show: function () {
            this.hidden = false;
            this.wrap.style.display = ""
        },
        /* 显示所有节点
        @ids    :Array 节点数组或节点id数组
        @return :Boolean 全部显示返回 true,否则返回 false
        */
        showAll: function (ids) {
            var same = true;
            this.eachAll(function (n) {
                n.show();
                n.hidden && (same = false)
            }, ids == null ? true : ids);
            return same;
        },
        /* 隐藏所有节点
        @ids    :Array 节点数组或节点id数组
        @return :Boolean 全部隐藏返回 true,否则返回 false
        */
        hideAll: function (ids) {
            var same = true;
            this.eachAll(function (n) {
                n.hide();
                n.hidden || (same = false)
            }, ids == null ? true : ids);
            return same;
        }
    }

    simple.extend(BaseItem.prototype, pItem);
    return BaseItem;
} ();

/* #C path:fly.simple.BaseList
列表控件基类
*/
fly.simple.BaseList = function () {
    var simple = fly.simple;

    var bTree = function (config) {
        simple.extend(this, config);
        config || (config = {})
        this.itemMap || (this.itemMap = {})
        this.allItems = [];

        this.selectedItems = []
        //this.leastSelectionOne == "auto" && (this.leastSelectionOne = this.selectionMode == simple.selectionMode.multi ? false : true)
        typeof (this.checkCascade) != "object" && (this.checkCascade = bTree.buildCascade(this.checkCascade))
        if (!config || !(config.root instanceof this.itemType)) {
            this.root = new this.itemType(simple.extend({}, this.defaults.root, typeof (config.root) == "object" ? config.root : { text: config.root }))
            this.root.leaf = false;
        }

        if (this.rootVisible == "auto")
            this.rootVisible = !!this.root.text;

        this.root.isRoot = true;
        this.join(this.root);

        (this.items || this.nodes || this.data) && this.load(this.items || this.nodes || this.data);
        this.items = this.root.items;

        this.container && this.autoRender !== false && this.renderTo(this.container)
    }

    bTree.buildCascade = function (level) {
        return {
            check: { parent: level, children: level },
            uncheck: { parent: level, children: level }
        }
    }

    var pTree = {
        /* 默认配置 */
        defaults: {},
        /* Boolean/String 是否显示根节点，默认“auto” */
        rootVisible: "auto",
        /* Boolean 快速显示*/
        quickly: false,
        /* String 节点的key属性，默认“id” */
        itemKey: "id",
        /* KeyValue 以节点key为键的节点列表 */
        itemMap: null,
        /* Array 数所有节点*/
        allItems: null,
        /* 应用效果 
        @isPlay :Boolean 是否播放
        */
        applyEffect: function (isPlay) {
            if (this.useEffect && (this.effectStarted ^ isPlay != true) && this.rendered) {
                var me = this;

                var filters = me.root.wrap.filters;
                if (filters && filters.length) {
                    for (var i = 0; i < filters.length; i++) {
                        try {
                            filters[i][isPlay === true ? "Play" : "Apply"]();
                        } catch (e) {
                            if (isPlay) {
                                me.root.wrap.style.filter = "none"
                            }
                            return;
                        }
                    }
                    if (isPlay != true) {
                        clearTimeout(this.effectHandle)
                        this.effectHandle = setTimeout(function () {
                            me.applyEffect(true);
                        }, 5);
                    }

                    this.effectStarted = isPlay != true;
                }
            }
        },
        /* 呈现 
        @container :Dom 容器
        */
        renderTo: function (container) {
            this.container = simple.$(container || this.container || document.body);
            if (!this.container) return false
            this.root.renderTo(this, this.container);
            this.rendered = true;
        },
        join: function (item) {
            var r = item.tree != this
            item.tree = this;
            item.owner = this;
            item.parent = item.parentItem || item.owner;
            if (this.rootVisible || item != this.root) {
                this.itemMap[item[this.itemKey]] = item;
                this.allItems.push(item);
            }
            return r;
        },
        /* 加载节点数据 
        @data :Array/String 数组或通过Ajax请求的url
        */
        load: function (data) {
            this.root.load(data)
        },
        requestData: function (item, callback) {
            var me = this;
            var process = function (data) {
                try {
                    data && data.constructor == String && (data = eval("(" + data + ")"))
                }
                catch (e) {
                    data = ["ERROR:" + e.message]
                }
                if (me.onRequestData) {
                    var _d = me.onRequestData(data)
                    if (_d !== undefined)
                        data = _d;
                }
                callback.call(item, data);
            }

            if (this.async)
                fly.simple.ajax(new simple.ajaxOption(this.async, process, item))
            else if (this.getItems)
                process(this.getItems(item))
        },
        createWrap: function (item) {
            !item.wrap && (item.wrap = document.createElement("div"))
            item.wrap.className = this.wrapCss + " " + (item.wrapCss || "")
            return item.wrap;
        },
        createPanel: function (item) {
            var d = document.createElement("div");

            var html = simple.format(this.textDomFormat instanceof Function ? (this.textDomFormat(item)) : this.textDomFormat, item);
            if (this.checkMode != "none" && item.checkMode != "none")
                this.checkboxPostion == "left" ? html = this.checkboxHtml + html : html += this.checkboxHtml;
            //2011-1-25
            d.className = this.itemCss + " " + (item.css || "") + " " + (item.leaf === false ? this.parentItemCss : this.leafItemCss)
            d.innerHTML = (this.showToggle ? this.toggleButtonHtml : "") + html;
            return d;
        },
        createPad: function (item) {
            var d = document.createElement("div");
            //d.className = this.padCss + " " + (item.padCss || "")
            d.className = this.padCss + " " + (item.padCss || "") + (this.padCss + "-" + item.itemsLayout)
            return d;
        },
        /* 遍历所有节点 
        @item   :fly.simple.BaseItem(可选) 要遍历的节点对象,默认根节点
        @fn     :Function 处理节点的函数,返回false 停止遍历
        @level  :Int(可选) 要遍历的层,默认所有
        @return :fly.simple.BaseItem/undefined 如果遍历过程中途停止，则返回导致遍历过程停止的节点，否则没有返回值
        */
        eachAll: function (item, fn, level) {
            if (simple.isFun(item)) {
                if (simple.isFun(fn)) {
                    item = item.call(this);
                }
                else {
                    level = fn;
                    fn = item
                    item = null;
                }
            }

            if (item == null)
                item = this.rootVisible ? this.root : this.root.items;

            return simple.eachAll(item, "items", fn, level)
        },

        /* String 创建节点Text的Html模板 */
        textDomFormat: '<a name="textDom" class=f-s-item-text href="{href}" title="{title}" id="{id}" ><img name="iconDom" class="f-s-item-icon {iconCss} {_iconCss}" src="{icon}" />{text}</a>',
        /* String 创建节点checkbox的Html */
        checkboxHtml: '<a unselectable="on" name="checkDom" class="f-s-item-check" ></a>',
        /* String 创建节点展开、折叠按钮的Html */
        toggleButtonHtml: '<a unselectable="on" class=f-s-item-toggle name=toggleDom ></a>',
        /* String checkbox位置,目前仅支持"left"和"right" */
        checkboxPostion: "left",
        /* fly.simple.checkStyle checkbox风格,默认根据checkMode自动识别 */
        checkStyle: simple.checkStyle.auto,
        /* fly.simple.checkMode 节点勾选模式,默认不启用 */
        checkMode: simple.checkMode.none,
        /* 节点勾选关联配置
        示例:
        1. 以下配置表示不关联
        checkCascade=0
        或
        checkCascade=fallse
        或
        checkCascade={
        check: { parent: 0, children: 0 },
        uncheck: { parent: 0, children: 0 }
        }
        

        2. 以下配置表示,勾选时同步上级节点和下级节点
        checkCascade=true
        或
        checkCascade={
        check: { parent: true, children: true },
        uncheck: { parent: true, children: true }
        }

        3. 以下配置表示,选中时同步2级上级节点和所有下级节点,取消选中时不影响上级节点,同步第一层下级节点
        checkCascade={
        check: { parent: 2, children: true },
        uncheck: { parent: false, children: 1 }
        }
        */
        checkCascade: {
            check: { parent: 0, children: 0 },
            uncheck: { parent: 0, children: 0 }
        },
        /* Boolean 是否启用半选状态 */
        useCheckHalf: true,

        /* fly.simple.selectionMode 节点选择模式,默认单选 */
        selectionMode: simple.selectionMode.single,

        /* Boolean/String 至少选中一项,默认根据 selectionMode 自动识别 */
        leastSelectionOne: false,

        /* KeyValue 触发节点选择的事件,key:节点的dom属性,value事件类型 */
        selectEvents: { panel: "click" },

        /* KeyValue 触发节点勾选的事件,key:节点的dom属性,value事件类型 */
        checkEvents: { checkDom: "click" },
        /* KeyValue 触发节点展开和折叠的事件,key:节点的dom属性,value事件类型 */
        toggleEvents: { toggleDom: "click", panel: "dblclick" },
        /* Boolean 保存节点勾选和选择状态一致 */
        keepCheckAndSelectSync: false,
        /* String 节点折叠按钮风格样式的前面部分 */
        toggleStyleCssPart: "f-s-tree-toggle-",
        /* String 节点选中样式 */
        selectedCss: "f-s-item-selected",
        /* String 节点展开样式 */
        expandCss: "f-s-item-expand",
        /* String 节点折叠样式 */
        collapseCss: "f-s-item-collapse",
        /* String 节点样式 */
        itemCss: "f-s-item",
        /* String 包含子节点的节点样式 */
        parentItemCss: "f-s-item-parent",
        /* String 不包含子节点的节点样式 */
        leafItemCss: "f-s-item-leaf",
        /* String 节点最外层容器样式 */
        wrapCss: "f-s-item-wrap",
        /* String 子节点容器样式 */
        padCss: "f-s-item-pad",
        /* String 启用效果的样式 */
        effectCss: "f-s-tree-effect",
        /* String 节点Check状态为勾选的样式 */
        checkedCss: "f-s-item-checked",

        checkedHalfCss: "f-s-item-checked-half",
        uncheckHalfCss: "f-s-item-uncheck-half",
        /* String 节点Checkbox按钮风格样式的前面部分 */
        checkStylePart: "f-s-t-check-",
        /* String 第一个子节点的样式 */
        firstItemCssPart: "-first",
        /* String 最后个子节点的样式 */
        lastItemCssPart: "-last",
        /* String 定义图标大小的样式 */
        iconSizeCss: "f-s-icon-16",
        /* Boolean 是否启用效果 */
        useEffect: true,
        /* String 当给节点配置 href 连接时,打开连接的目标窗口,默认新窗口 */
        navTarget: '_blank',
        /* Boolean 是否显示折叠按钮 */
        showToggle: true,
        /* String 折叠按钮风格*/
        toggleStyle: "arrow",
        /* Boolean 是否显示层次线条 */
        showLine: false,
        /* String 节点线条的样式 */
        lineCss: "f-s-t-line",
        /* String CSS样式 */
        css: '',
        /* String 触发节点回调函数的事件类型 */
        handlerEvent: 'click',
        /* Function 通用的节点回调函数 */
        itemHandler: null
    }
    bTree.cloneItemMethod = function (to, methods) {
        simple.each(methods, function (m) {
            to[m] = function () {
                var fis = arguments[0] instanceof this.itemType
                var arg = Array.prototype.slice.call(arguments, fis ? 1 : 0)
                var i = fis ? arguments[0] : this.root;
                if (!fis && arg[i[m].length - 1] == null)
                    arg[i[m].length - 1] = this.rootVisible
                return i[m].apply(i, arg);
            }
        });
    }

    /* path:fly.simple.BaseList.getSelectItems 获取所有选择节点 
    @item   :fly.simple.BaseItem(可选) 节点,默认根节点
    @selected   :Boolean 选择状态,true获取所有选中节点,false获取所有未选中节点
    @take       :Int(可选) 获取的节点数,默认无限制
    @level      :Int(可选) 变量的层次,默认所有
    @return     :Array  复合条件的节点数组   
    */

    /* path:fly.simple.BaseList.collapseAll 折叠所有节点
    @item   :fly.simple.BaseItem(可选) 节点,默认根节点
    @return :Boolean 全部折叠返回 true,否则返回 false
    */

    /* path:fly.simple.BaseList.expandAll 展开所有节点
    @item   :fly.simple.BaseItem(可选) 节点,默认根节点
    @return :Boolean 全部展开返回 true,否则返回 false
    */

    /* path:fly.simple.BaseList.showAll 显示所有节点
    @item   :fly.simple.BaseItem(可选) 节点,默认根节点
    @return :Boolean 全部显示返回 true,否则返回 false
    */

    /* path:fly.simple.BaseList.hideAll 隐藏所有节点
    @item   :fly.simple.BaseItem(可选) 节点,默认根节点
    @return :Boolean 全部隐藏返回 true,否则返回 false
    */
    bTree.cloneItemMethod(pTree, ["getSelectItems", "collapseAll", "expandAll", "showAll", "hideAll"]);
    simple.extend(bTree.prototype, pTree);

    return bTree;
} ();


/* #C path:fly.simple.Tree
树控件
@base:fly.simple.BaseList
*/
fly.simple.Tree = function () {
    var simple = fly.simple;
    var Tree = function (config) {
        simple.BaseList.apply(this, arguments);
        this.checkMode || (this.checkMode = simple.checkMode.multi);
        !this.checkMode || this.checkStyle == "auto" && (this.checkStyle = simple.checkModeStyle[this.checkMode] || simple.checkModeStyle.multi);
        simple.selectionMode[this.selectionMode] || (this.selectionMode = simple.selectionMode.single)
    }

    Tree.defaults = {
        root: { expanded: true, wrapCss: 'f-s-tree' }
    }

    pTree = {
        defaults: Tree.defaults
    }


    var pbi = simple.BaseItem.prototype;
    /* #C path:fly.simple.Tree.Node
    树节点对象
    @base:fly.simple.BaseItem
    */
    Tree.Node = function (config) {
        simple.BaseItem.apply(this, arguments);
        this.checkCascade != null && typeof (this.checkCascade) != "object" && (this.checkCascade = simple.BaseList.buildCascade(this.checkCascade))
    }

    var pNode = {
        owner: Tree.prototype,
        checked: false,
        isCheckHalf: false,
        getCheckCascade: function (check, isChildren) {
            var c = check ? "check" : "uncheck"
            var pc = isChildren ? "children" : "parent"
            cascade = this.checkCascade && this.checkCascade[c] && this.checkCascade[c][pc]
            cascade == null && (cascade = this.owner.checkCascade[c] && this.owner.checkCascade[c][pc])
            return cascade > 0 ? (cascade === true ? 1000000 : cascade) : -1
        },

        /* 设置所有节点的勾选状态
        @checked:Boolean 勾选状态,true:选中,false未选中
        @ids    :Array 节点数组或节点id数组
        @return :Boolean 全部设置为指定状态返回 true,否则返回 false
        */
        checkAll: function (checked, ids) {
            var same = true;
            this.eachAll(function (n) {
                n.check(checked, false);
                n.checked != checked && (same = false)
            }, ids == null ? true : ids);
            if (this.owner.useCheckHalf) {
                this.cascadeCheckChildren(null, true, true)
                this.setHalf();
                this.cascadeCheckParent(null, true, true)
            }
            return same;
        },
        /* 设置节点的勾选状态
        @checked:Boolean 勾选状态,true:选中,false未选中
        @return :Boolean/Null 设置被取消则返回false,否则没有返回值
        */
        check: function (checked, cascade) {
            var me = this
            var e = checked;
            var isToggle = typeof (checked) == "object"
            var o = this.owner;
            isToggle && (checked = this.checked != true)
            if (o.onCheck && o.onCheck(this, checked, isToggle) === false) return false;

            if (isToggle)
                o.applyEffect();

            this.checked = checked;
            if (cascade !== false) {
                if (o.checkMode == simple.checkMode.single) {
                    if (checked) {
                        var li = o.lastCheckItem
                        if (li && li != this) {
                            li.check(false, false)
                            if (li.parentItem != this.parentItem)
                                li.cascadeCheckParent(null, true, true)
                        }
                    }
                    this.cascadeCheckParent(null, true, true)
                }
                else if (o.checkMode == simple.checkMode.singleByLevel) {
                    if (this.parentItem && checked) {
                        simple.each(this.parentItem.items, function (n) {
                            n == me || n.check(false, false)
                        });
                    }
                    o.useCheckHalf && this.setHalf();
                    this.cascadeCheckParent(null, true, true)
                }
                else {
                    this.cascadeCheckChildren(checked, this.getCheckCascade(checked, true))
                    o.useCheckHalf && this.setHalf();
                    this.cascadeCheckParent(checked, this.getCheckCascade(checked, false))
                }
            }
            this.checked = checked
            if (checked)
                o.lastCheckItem = this

            if (this.panel) {
                simple.changeCss(this.panel,
                o.checkedCss + " " + o.checkHalfCss,
                checked == 0.5 ? o.checkHalfCss : (checked ? o.checkedCss : ""));
            }

            if (o.keepCheckAndSelectSync && (this.selected != (checked == true)))
                this.select(!!checked, true)

            o.onChecked && o.onChecked(this, isToggle);

            if (isToggle) return false
        },
        decideHalf: function (onlySun, check) {
            if (!this.items.length) return false
            check == null && (check = this.checked)
            var has = this.eachItems(function (n) {
                return n.checked == check && n.isCheckHalf != true;
            })
            return has ? (this.checked ? 1 : -1) : 0;
        },
        setHalf: function (half) {
            half == null && (half = this.decideHalf())
            if (half == true)
                half = this.checked ? 1 : -1;
            else if (half == false)
                half = 0;

            if (this.isCheckHalf == half) return half;
            this.isCheckHalf = half;

            var addCss = "", o = this.owner
            if (half)
                addCss = o[this.checked ? "checkedHalfCss" : "uncheckHalfCss"]
            simple.changeCss(this.panel, o.checkedHalfCss + " " + o.uncheckHalfCss, addCss);
            return half;
        },
        cascadeCheckParent: function (check, level, refreshCheckHalf) {
            var half = null;
            var o = this.owner;
            simple.eachParent(this, function (p, l) {
                if (check != null && l <= level) {
                    if (p.checked != check) {
                        if (check)
                            p.check(check, false);
                        else {
                            if (!p.decideHalf(true, check)) {
                                p.check(check, false)
                            }
                            else
                                check = true;
                        }
                    }
                }
                if (refreshCheckHalf != false && o.useCheckHalf) {
                    if (p.setHalf(half))
                        half = true;
                }
                else if (l > level) return false;
            });
        },
        cascadeCheckChildren: function (check, level, refreshCheckHalf) {
            if (!this.items.length) return
            if (check != null) {
                this.eachAll(function (item) {
                    item.check(check, false);
                }, false, level);
            }

            if (refreshCheckHalf != false && this.owner.useCheckHalf)
                this.eachAll(function (item) {
                    item.setHalf();
                }, false, level);
        },

        /* 获取所有勾选节点 
        @checked    :Boolean 勾选状态,true获取所有已勾选节点,false获取所有未勾选节点
        @take       :Int(可选) 获取的节点数,默认无限制
        @level      :Int(可选) 变量的层次,默认所有
        @includeSelf:Boolean(可选) 包含当前节点自身,默认不包含
        @return     :Array  复合条件的节点数组
        */
        getCheckItems: function (checked, take, level, includeSelf) {
            return simple.queryAll(includeSelf ? this : this.items, "items", function (i) {
                return i.checked == checked
            }, level, take)
        },
        bindEvents: function () {
            pbi.bindEvents.apply(this, arguments);
            var owner = this.owner
            simple.bindEvents(this, owner.checkEvents, simple.scope(this.check, this))
            if (simple.isIE6)
                simple.ie6aHover(this.checkDom)
        }
    }
    /* #C path:fly.simple.Tree */
    /* path:fly.simple.Tree.getCheckItems 获取所有勾选节点
    @item       :fly.simple.Tree.Node(可选) 节点,默认根节点
    @checked    :Boolean 勾选状态,true获取所有已勾选节点,false获取所有未勾选节点
    @take       :Int(可选) 获取的节点数,默认无限制
    @level      :Int(可选) 变量的层次,默认所有
    @return     :Array  复合条件的节点数组
    */

    /* path:fly.simple.Tree.checkAll 设置所有节点的勾选状态
    @item       :fly.simple.Tree.Node(可选) 节点,默认根节点
    @checked:Boolean 勾选状态,true:选中,false未选中
    @return :Boolean 全部设置为指定状态返回 true,否则返回 false
    */
    simple.BaseList.cloneItemMethod(pTree, ["getCheckItems", "checkAll"]);
    simple.inherit(Tree.Node, simple.BaseItem, pNode);

    /* path:fly.simple.Tree.root fly.simple.Tree.Node 根节点*/
    pTree.root = Tree.Node.prototype;

    /* path:fly.simple.Tree.itemType Function 节点类型,默认:fly.simple.Tree.Node*/
    pTree.itemType = Tree.Node;
    simple.inherit(Tree, simple.BaseList, pTree);
    return Tree;
} ();
