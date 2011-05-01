//## fly
/* #C path:fly fly javacript library
Version 1.1 
http//:www.flyui.net
Email:flyui&hotmail.com
Copyright (c) 2009 KuiyouLi
2009-11-23
*/
(function () {
    var win = window, doc = win.document, docE = doc.documentElement

    function destroy(obj) { 
        if (arguments.length == 1) {
            if (!obj) return
            if (obj.destroy && obj.destroy != arguments.callee)
                obj.destroy()
        }
        else if (arguments.length == 0) {
            this.destroy = null;
            arguments.callee.call(false, this)
        }
        else {
            for (var i = 0; i < arguments.length; i++)
                arguments.callee.call(false, arguments[i])
        }

        if (this != false)
            win.CollectGarbage && CollectGarbage()
    }

    /*	path:fly.$
    查询Dom对象
    调用方式：
    fly.$("a","div")
    fly.$("a,div")
    fly("a,div")
    fly("a","div")
    $("a","div")
    $("a,div")
    [document].$("a,div")
    [div1,div2].$("a,div")
		
    @selectors:String/Dom 可变参数，任意多个选择器字符串或对象
    @return :Array 符合条件的多个Dom对象数组
    */
    function $(selectors) {
        var a = arguments, c = null;
        if (this._$isWindow || this == $) {
            if (selectors) {
                if (a.length == 1) {
                    if (selectors.isIList)
                        return selectors;
                    if ($.isFun(selectors))
                        return $.onLoad(selectors)
                    else if (!$.isStr(selectors))
                        return $.toArray(selectors)
                } else if (a.length == 2 && a[1] && $.isStr(a[0])) {
                    if ($.isDom(a[1])) {
                        c = [a[1]]
                        a = [a[0]]
                    }
                    else (a[1].$find)
                    {
                        c = a[1]
                        a = [a[0]]
                    }
                }
            }
        }
        else
            c = $.isArray(this) ? this : ($.likeArray(this) ? $.toArray(this) : [doc])
        var r = (new ui.selector.DomQuery(c, a)).find();
        return r;
    }

    var config = win.flyConfig || {}
    $.version = '1.1';

    /*	path:flyConfig.addAlias
    给fly库命别名
    fly库默认别名 $，如果 给fly库指定其它别名，默认别名 $ 将被取消
    可以在 fly 库加载前用如下代码定义别名
    var flyConfig={
    alias:["myFly","jimo"]
    }
    也可以直接调用该函数定义别名
    fly.addAlias("myFly","jimo")
    经过以上定义后，便可以用别名访问fly库
    如：
    myFly.$("a,div")
    myFly("a","div")
    jimo.$("a","div")
    jimo("a,div")
			
    @alias :String 可变参数，任意多个别名
    @return :fly fly库
    */
    config.alias && (window[config.alias] = $);

    /* #M	path:flyConfig.onLoad
    fly加载完成时执行回调函数
    可以在 fly 库加载前用如下代码定义加载完成是的回调函数
    var flyConfig={
    alias:["myFly","jimo"],
    onLoad:function(){
    alert('fly已经加载完成')
    }
    }
    */


    if (win.fly) {
        for (var k in win.fly)
            $[k] = win.fly[k]
    }

    $.destroy = function () {
        //$.destroy = null;
        destroy.apply($, arguments)
        if (arguments.length == 0) {
            try {
                destroy(Array.prototype, String.prototype, Function.prototype)
            } catch (e) { }
            window.$ == $ && (window.$ = null)
            window.fly = $ && (window.fly = null)
            docE = doc = destroy = null
        }
    }

    win.fly = $;
    win.$ || (win.$ = fly)

    fly.context = {
        plugins: []
    }

    win._$isWindow = true

    /* #C path:$=fly */

    //##
    /*	创建命名空间
    @namespace:String 要创建的命名空间，如 fly.ui
    @return	:Namespace 创建的命名空间
    */
    $.ns = function (namespace) {
        if (arguments.length > 1) {
            for (var i = 0; i < arguments.length; i++)
                $.ns(arguments[i])
            return
        }
        var nss = namespace.split('.')
        var root = win
        for (var i = 0; i < nss.length; i++)
            root = root[nss[i]] || (root[nss[i]] = { destroy: destroy })
        return root
    }

    /*	创建类
    @options: 选项
    @return	:Class 创建的类
    */
    $.Class = function (options) {
        var base = options.base
        var _class = options.constructor
        if (_class == Object || _class == null)
            _class = $.isFun(base) ? function () { base.apply(this, arguments) } : function () { }

        var _base = $.isFun(base) ? base.prototype : ($.isObject(base) ? base : Object.prototype)
        function f() { }
        f.prototype = _base
        var cp = _class.prototype = new f()
        cp.$base = _base;

        if ($.isFun(base)) {
            for (var p in base) {
                if (!(p in _class))
                    _class[p] = base[p]
            }
        }

        if (options.inherit) {
            var hs = $.isArray(options.inherit) ? options.inherit : [options.inherit]
            $.each(hs, function (o) {
                $.extendIf(cp, o)
            })
            delete options.inherit
        }

        delete options.constructor
        delete options.base
        for (var k in options)
            cp[k] = options[k]

        _class.$base = $.isFun(base) ? base : Object
        cp.constructor = _class;
        return _class
    }

    $.ns("fly.data", "fly.plugins")

    var lib = $.ns("fly.lib"), ui = $.ns("fly.ui"), collection = $.ns("fly.collection"), browser = $.browser || ($.browser = {})
    var arrP = Array.prototype
    var slice = arrP.slice
    var toStr = Object.prototype.toString
    var qp = null, dh, toFun;
    var camelCase = function (str) {
        str = str.replace(/\-\w/g, function ($1) {
            return $1.charAt(1).toUpperCase()
        })
        return str.charAt(0).toLowerCase() + str.substr(1)
    }

    with (browser) {
        var b = browser, ua = b.userAgent = navigator.userAgent.toLowerCase();
        function c(r) {
            return r.test(ua);
        }

        b.doc = doc
        b.isStrict = doc.compatMode == "CSS1Compat";
        b.isFirefox = c(/firefox/)
        b.isOpera = c(/opera/)
        b.isChrome = c(/chrome/)
        b.isWebKit = c(/webkit/)
        b.isSafari = !isChrome && c(/safari/)
        //        b.isSafari2 = isSafari && c(/applewebkit\/4/)
        //        b.isSafari3 = isSafari && c(/version\/3/)
        //        b.isSafari4 = isSafari && c(/version\/4/)
        b.isIE = !isOpera && c(/msie/)

        if (b.isIE) {
            b.ieVersion = ua.match(/msie (\d+)/)[1]
            b["isIE" + b.ieVersion] = true;
        }
        b.isGecko = !isWebKit && c(/gecko/)
        //b.isGecko2 = isGecko && c(/rv:1\.8/)
        //b.isGecko3 = isGecko && c(/rv:1\.9/)
        //b.isBorderBox = isIE && !isStrict
        //b.isWindows = c(/windows|win32/)
        //b.isMac = c(/macintosh|mac os x/)
        //b.isAir = c(/adobeair/)
        //b.isLinux = c(/linux/)
        //b.isSecure = /^https/i.test(win.location.protocol);
        b.isMoz = c(/mozilla/) && !b.isOpera && !b.isIE

        b.diffAttrs =
		{
		    styleRemoveMethod: docE.style.removeProperty ? 'removeProperty' : 'removeAttribute'
		}

        b.name = isIE ? "IE" + b.ieVersion : isFirefox ? "FF" : isOpera ? "Opera" : isChrome ? "Chrome" : isSafari ? "Safari" : ""

        if (b.isMoz) {
            win.Event.prototype.__defineGetter__("x", function () {
                return this.clientX + 2
            })
            win.Event.prototype.__defineGetter__("y", function () {
                return this.clientY + 2
            })
            var htmlProp = HTMLElement.prototype
            htmlProp.__defineGetter__("innerText", function () {
                return this.textContent;
            });

            htmlProp.__defineSetter__("innerText", function (text) {
                return this.textContent = text;
            });


            htmlProp.__defineGetter__("outerHTML", function () {
                var a = this.attributes, str = "<" + this.tagName, i = 0; for (; i < a.length; i++)
                    if (a[i].specified)
                        str += " " + a[i].name + '="' + a[i].value + '"';
                if (!this.canHaveChildren)
                    return str + " />";
                return str + ">" + this.innerHTML + "</" + this.tagName + ">";
            });
            htmlProp.__defineSetter__("outerHTML", function (s) {
                var r = this.ownerDocument.createRange();
                r.setStartBefore(this);
                var df = r.createContextualFragment(s);
                this.parentNode.replaceChild(df, this);
                return s;
            });
            htmlProp.__defineGetter__("canHaveChildren", function () {
                return !/^(area|base|basefont|col|frame|hr|img|br|input|isindex|link|meta|param)$/.test(this.tagName.toLowerCase());
            });

        }
    }
    //#end


    //## extend
    /*	扩展
    @target	:被扩展的对象
    @overrides:包含扩展成员的任意多个参数
    @return :target
    */
    $.extend = function (target, overrides) {
        if (arguments === 1)
            return $.extend($, target);
        var isSafety = $.isStr(this);
        var prefixLength = isSafety ? this.length : -1
        for (var i = 1; i < arguments.length; i++) {
            var o = arguments[i]
            if (o) {
                for (var key in o) {
                    if (key.charAt(0) === "$") continue;
                    if (isSafety) {
                        if (this != "" && key.substr(0, prefixLength) != this)
                            target[this + key] = o[key]
                        if (!(key in target))
                            target[key] = o[key]
                    }
                    else if (this != false || target[key] == undefined)
                        target[key] = o[key];
                }
            }
        }
        return target;
    }


    var fSetup = arguments.callee;

    $.extend($,
	{
	    /*  注册插件
	    @name   :String 插件名称
	    @fn     :Function 创建插件的函数
	    */
	    regPlugin: function (name, fn) {
	        var p = { name: fn ? name : "", fn: fn || name };
	        p.fn($);
	        $.context.plugins.push(p);
	        return this;
	    },
	    /*  将fly安装到其他窗口
	    @window :Window 要安装的窗口对象
	    @match  :匹配要安装的插件，为空是安装所有插件
	    */
	    setup: function (w, m) {
	        w.eval("(" + fSetup + ")()");
	        $.context.plugins.each(function (p) {
	            if (!m || m.test(p.name))
	                w.eval("fly.regPlugin(" + p.fn + ")")
	        })
	    },
	    /*  停止标识，在用each遍历某对象时，返回fly.BREAK将停止遍历 */
	    BREAK: {},
	    /*	扩展时检测
	    @prefix	:String 前缀
	    @target	:Object 被扩展的对象
	    @overrides	:Object 包含扩展成员的任意多个参数
	    @return	:target
	    */
	    safeExtend: function (prefix, target, overrides) {
	        return $.extend.apply(prefix, slice.call(arguments, 1))
	    },


	    /*	扩展,扩展前检测是否存在
	    @target	:被扩展的对象
	    @overrides:包含扩展成员的任意多个参数
	    @return	:target
	    */
	    extendIf: function (target, overrides) {
	        return $.extend.apply(false, arguments);
	    },
	    /*  复制一个对象
	    @obj    :Object 要复制的对象
	    @return :@obj   的副本
	    */
	    copy: function (obj) {
	        return $.extend({}, obj);
	    },
	    /*	合并一组对象生成新对象
	    例：var all=fly.merge(obj1,obj2,obj3,....,objn)
	    @params	:Object 可变参数，要合并的多个对象
	    @return	:Object 包含多个对象成员的新对象
	    */
	    //	    merge: function (params) {
	    //	        return $.extend.apply(null, [{}].concat(slice(arguments, 0)))
	    //	    },
	    /*  检查对象是否为null，为null时返回另一个对象
	    @chkObj :Object 要检测的对象
	    @replacement    :chkObj 为null时返回的值
	    */
	    //	    nullIf: function (chkObj, replacement) {
	    //	        return chkObj == null ? replacement : chkObj
	    //	    },

	    /*  获取属性
	    @obj:		对象
	    @attribute:	String 属性名
	    @return	:Object 属性值
	    */
	    //	    get: function (obj, attribute) {
	    //	        if ($.isStr(obj)) return lib.ajax.get.apply(this, arguments);

	    //	        if (obj.attributes && !(attribute in obj))
	    //	            return obj.getAttribute(attribute)
	    //	        else
	    //	            return obj[attribute];
	    //	    },


	    /*  设置属性
	    @obj:		对象
	    @attribute:	String/Object 属性名或包属性名和属性值的键值对
	    @value	:	Object(可选) 值
	    @return	:obj
	    */
	    //	    set: function (obj, attribute, value) {
	    //	        arguments.length > 2 ? $._set(obj, attribute, value) : $.setBy(obj, attribute)
	    //	        return obj
	    //	    },
	    //	    _set: function (o, p, v) {
	    //	        o[p] = v;
	    //	        //	        if (o.attributes && p in o.attributes)
	    //	        //	            o.setAttribute(p, v)
	    //	        //	        else o[p] = v;
	    //	    },

	    //	    data: function (obj, prop, value) {
	    //	        var isObj = $.isObject(prop)
	    //	        if (arguments.length < 3 && !isObj)
	    //	            return obj[prop]
	    //	        if (isObj) {
	    //	            for (var k in prop)
	    //	                obj[k] = prop[k]
	    //	        }
	    //	        else
	    //	            obj[prop] = value
	    //	        return this;
	    //	    },
	    foucsableTypeRegs: /(BUTTON|INPUT|OBJECT|SELECT|TEXTAREA)/,
	    clickableTypeRegs: /^(A|AREA)$/,
	    attrGeters: {},
	    /*  获取或设置某对象的属性
	    @obj    :Object 被操作对象
	    @prop   :String/Json    要获取或设置的属性名，或者包含属性名和属性值的Json对象
	    @value  :Object(可选) 对象的属性值
	    @return :Object/fly    当获取是返回属性值，设置时返回 fly
	    */
	    attr: function (obj, prop, value) {
	        var isObj = $.isObject(prop)
	        if (arguments.length < 3 && !isObj) {
	            var lProp = prop.toLowerCase()
	            if (this.isDom(obj) && this.attrGeters[lProp])
	                return this.attrGeters[lProp](obj)
	            return obj.getAttribute && !(prop in obj) ? obj.getAttribute(prop) : obj[prop];
	        }
	        if (isObj) {
	            for (var k in prop)
	                obj.setAttribute && !(k in obj) ? obj.setAttribute(k, prop[k]) : obj[k] = prop[k]
	        }
	        else
	            obj.setAttribute && !(prop in obj) ? obj.setAttribute(prop, value) : obj[prop] = value;
	        return this;
	    },
	    valueGeters: {
	        option: function (box) {
	            return (box.attributes.value || {}).specified ? box.value : box.text
	        },
	        select: function (box) {
	            if (box.type === "select-one")
	                return box.selectedIndex > -1 ? $.valueGeters.option(box.options[box.selectedIndex]) : null
	            var vs = new Array
	            for (var i = 0; i < box.options.length; i++)
	                if (box.options[i].selected)
	                    vs.push($.valueGeters.option(box.options[i]))
	            return vs
	        },
	        input: function (box) {
	            var t = box.type
	            if (t == "radio" || t == "checkbox")
	                return box.value == null ? "on" : box.value
	            else return box.value
	        }
	    },
	    valueSeters: {
	        select: function (box, value) {
	            var isOne = box.type === "select-one"
	            var isArray = $.likeArray(value)
	            for (var i = 0; i < box.options.length; i++) {
	                var o = box.options[i], v = $.valueGeters.option(o)
	                if ((o.selected = v == value || (isArray && $.inArray(v, value))) && isOne) return
	            }
	        }
	    },
	    /*  获取或设置元素的值
	    @el    :Element 被操作对象
	    @value  :Object(可选) 元素的值
	    @return :Object/fly    当获取是返回元素值，设置时返回 fly
	    */
	    value: function (el, value) {
	        if (arguments.length == 1) {
	            var nodeName = el.nodeName.toLowerCase()
	            var f = $.valueGeters[nodeName]
	            return f ? f(el) : f.value
	        }
	        else {
	            var nodeName = el.nodeName.toLowerCase()
	            var f = $.valueSeters[nodeName]
	            var val = $.ifFun.call(el, value, el)
	            f ? f(el, val) : (el.value = val)
	            return this
	        }
	    },

	    //	    firstNotNull: function (params) {
	    //	        var i = -1
	    //	        while (++i < arguments.length)
	    //	            if (arguments[i] != null)
	    //	                return arguments[i]
	    //	        },

	    /*  设置属性
	    @obj:		对象
	    @keyValues:	Object 包含属性名和属性值的键值对
	    @return	:obj
	    */
	    //	        setBy: function (obj, keyValues) {
	    //	            for (var key in keyValues)
	    //	                $._set(obj, key, keyValues[key])
	    //	            return obj
	    //	        },

	    /*  检测对象是否某类的实例或者是否等于某值
	    @obj    :要检测的对象
	    @type   :Function/String/Object 类或者类名称或者用于比较的值
	    @return :Boolean    如果obj是type的实例或者obj==type则返回true，否则返回false
	    */
	    is: function () {
	        var is = function (obj, type) {
	            return typeof (typeName) == 'string' ?
                        toStr.call(obj) == "[object " + type + "]" :
                        (obj == type ||
                            (obj == null || type == null ? false :
                                $.isFun(type) &&
                                    (obj instanceof type ||
                                        (obj.constructor == type || String(obj.constructor) == String(type))
                                    )
                                ))
	        }

	        var types = ["Date", "Number", "Boolean", "String", "Array", "Function", "Object"]
	        for (var i = 0; i < types.length; i++) {
	            (function (t) {
	                var st = "[object " + t + "]", ty = window[t]
	                $["is" + t] = function (obj) {
	                    return obj != null && (obj.constructor === ty || toStr.call(obj) === st)
	                }
	            } (types[i]))
	        }

	        /*	检测一个值是否函数
	        @obj	:要检测的对象
	        @return	:Boolean
	        */
	        $.isFun = $.isFunction

	        /* #M	path:fly.isFunction 检测一个值是否函数
	        @obj	:要检测的对象
	        @return	:Boolean
	        */

	        /* #M	path:fly.isDate 检测一个值是否日期
	        @obj	:要检测的对象
	        @return	:Boolean
	        */

	        /* #M	path:fly.isNumber 检测一个值是否数字
	        @obj	:要检测的对象
	        @return	:Boolean
	        */

	        /* #M	path:fly.isBoolean 检测一个值是否布尔型
	        @obj	:要检测的对象
	        @return	:Boolean
	        */

	        /* #M	path:fly.isArray 检测一个值是否数组
	        @obj	:要检测的对象
	        @return	:Boolean
	        */

	        /* #M	path:fly.isObject 检测一个值是否Object
	        @obj	:要检测的对象
	        @return	:Boolean
	        */

	        /* #M	path:fly.isString 检测一个值是否字符串
	        @obj	:要检测的对象
	        @return	:Boolean
	        */

	        /*	检测一个值是否字符串
	        @obj	:要检测的对象
	        @return	:Boolean
	        */
	        $.isStr = $.isString
	        return is;
	    } (),
	    /*  检测字符串是否html
	    @str    :String 要检测的字符串
	    @return :Boolean    str是html返回true，否则返回false
	    */
	    isHtml: function () {
	        var htmlExp = /<[\w]+[\s\S]+>/
	        return function (str) {
	            return $.isStr(str) && htmlExp.test(str)
	        }
	    } (),

	    /*	检测对象是否类似于数组，如 arguments、document.all
	    @obj:要检测的对象
	    @return	:Boolean 类似与数组返回true，否则返回false
	    */
	    likeArray: function (obj) {
	        return obj && (obj instanceof Array || (typeof (obj.length) == 'number' && !$.isFun(obj) && !$.isStr(obj) && !obj._$isWindow && (!obj.nodeName || !obj.ownerDocument)))
	    },


	    /*	是否Dom对象
	    @obj:要检测的对象
	    @return	:Boolean
	    */
	    isDom: function (obj) {
	        return obj && obj.nodeType === 1 && obj.ownerDocument
	    },


	    /*  将对象转换为数组
	    @obj   :要转换的对象
	    @return	:Array
	    */
	    toArray: function (obj) {
	        if ($.isArray(obj))
	            return obj
	        if (!$.likeArray(obj))
	            return new Array(obj)
	        if ($.isFun(obj.callee))
	            return slice.call(obj, 0)
	        var arr = new Array, i = obj.length
	        while (--i != -1)
	            arr[i] = obj[i]
	        return arr
	    },


	    /*  获取集合的一部分
	    @obj		:集合对象
	    @start	:Int 开始位置
	    @end	:Int(可选) 结束为置
	    @return	:Array
	    */
	    slice: function (obj, start, end) {
	        return slice.call($.toArray(obj), start, end == undefined ? 100000000 : end)
	    },


	    /*	遍历一个对象
	    @obj	:Array 被遍历对象
	    @fn		:Function 处理函数
	    @scope	:Object(可选) 域
	    @return	:@obj
	    */
	    each: function (obj, fn, scope) {
	        if ($.likeArray(obj))
	            for (var i = 0; i < obj.length; i++) {
	                if (fn.call(scope || obj[i], obj[i], i, obj) == $.BREAK)
	                    break;
	            }
	        else {
	            for (var i in obj)
	                if (fn.call(scope || obj[i], obj[i], i, obj) == $.BREAK)
	                    break;
	        }
	        return this
	    },


	    /*	检测对象是否在一组数据中,
	    例	:fly.inArray(3,1,2,3,4,...,n),fly.inArray(3,[1,2,3,4])
	    @value	:要检测的一个值
	    @params	:Object(可选) 可变参数，一组数据
	    @return	:Number 返回在数组中的索引，如不在数组中则返回 null
	    */
	    inArray: function (value, params) {
	        var arr = arguments, i = 1;
	        if (arguments.length == 2 && $.likeArray(params))
	            arr = params, i = 0
	        for (; i < arr.length; i++) {
	            if (arr[i] == value)
	                return new Number(i)
	        }
	        return null
	    },

	    /*	空函数
	    @return	:this
	    */
	    emptyFun: function () {
	        return this
	    },


	    /*	返回 false 的函数
	    @return	:false
	    */
	    falseFun: function () {
	        return false
	    },


	    /*	对传入的对象进行函数封装,封装后的函数返回 @obj
	    @obj	:如果obj是函数，则返回obj，否则放一个新的函数，该函数返回值始终是obj
	    @return	:Function
	    */
	    lambda: function (obj) {
	        return $.isFun(obj) ? obj : function () {
	            return obj
	        }
	    },


	    /*	如果不是函数转换为函数
	    @fun	:Object/String/Functon或字符串
	    @onlyStr:Boolean 只有fun为字符串时转换
	    @format	:String 函数格式化字符串
	    @return	:Function
	    */
	    toFun: toFun = function () {
	        var reg = /\b(if|for|with|while|do|switch|throw|return|var)\b/
	        var cache = {}
	        function attachReturn(expression, format) {
	            if (reg.test(expression) == false && (format == null || reg.test(format) == false))
	                expression = "return " + expression
	            return expression
	        }

	        return function (expression, onlyStr, format) {
	            var isStr = $.isStr(expression)
	            if ((onlyStr == true && isStr == false) || $.isFun(expression))
	                return expression
	            if (isStr == false && format == null)
	                return function () {
	                    return expression
	                }

	            var key = arguments.length < 4 ? expression + (onlyStr || '') + (format || '') : ""
	            var fn;
	            if (key != "" && (fn = cache[key]))
	                return fn
	            var params, ms
	            if ($.isStr(expression) && (ms = expression.match(/^([\s,\w$_]*)=>/))) {
	                params = ms[1]
	                expression = expression.replace(/^([\s,\w$]*)=>/, "")
	                expression = attachReturn(expression, format)
	                if (format) {
	                    var r = /\bfunction\s*\(([\s,\w$_]*)\)/;
	                    ms = r.exec(format)
	                    if (/^\s*$/.test(ms[1]))
	                        format = format.replace(r, " function(" + params + ")")
	                    else {
	                        var pStrs = params.split(',');
	                        for (var i = 0; i < pStrs.length; i++)
	                            expression = "var " + pStrs[i] + "=arguments[" + i + "];" + expression
	                    }
	                }
	                else
	                    format = "function(" + params + "){{0}}"
	            }
	            else
	                expression = attachReturn(expression, format)
	            if (/\bas\b/.test(expression))
	                expression = "var as=arguments; " + expression
	            var args = arguments
	            if (format)
	                fn = eval("____=" + format.$format(expression))
	            else
	                fn = eval("____=function(x,y,z){" + expression + "}")
	            if (key != "")
	                cache[key] = fn
	            return fn
	        }
	    } (),


	    /*	ifFun 假如是函数 则返回函数的执行结果
	    @obj	:Function/Object 函数或其它值
	    @params	:Object(可选) 可变参数，要传递的任意多个参数
	    @return	:Boolean
	    */
	    ifFun: function (obj, params) {
	        if (obj && $.isFun(obj))
	            return arguments.length > 1 ? obj.apply(this, slice.call(arguments, 1)) : obj.call(this)
	        return obj
	    },

	    /*  通过调用对象本身的 $format 方法格式化对象
	    @obj    :String/Date/Function 要格式化的对象
	    @params :Object(可选) 可变参数，要传递的任意多个参数
	    @return :String/Function  格式化后的对象
	    */
	    format: function (obj, params) {
	        return (obj.$format || obj.format).apply(obj, slice.call(arguments, 1))
	    },
	    globalEval: function (script) {
	        if (script == null || /^\s*$/.test(script))
	            return
	        var head = doc.getElementsByTagName("head")[0] || docE
	        var e = doc.createElement("script")
	        e.type = "text/javascript"
	        e.text = script
	        head.appendChild(e, head.firstChild)
	        head.removeChild(e)
	    }
	})

    /*	检测对象是否在一组数据中,功能等同于fly.inArray,
    例	:fly.In(3,1,2,3,4,...,n),fly.In(3,[1,2,3,4])
    @value	:要检测的一个值
    @params	:Object(可选) 可变参数，一组数据
    @return	:Number 返回在数组中的索引，如不在数组中则返回 null
    */
    $.In = $.inArray
    //#end

    //## Function
    /* #C 函数扩展*/
    fly.lib.Function = $.extend(
	{
	    /*	根据条件判断是否执行
	    @predicate:Function/String/Object 用来判断是否执行的表达式、函数或其它对象 
	    @args	:Array(可选) 参数，要传递的任意多个参数
	    @return	:Function
	    */
	    where: function (predicate, params) {
	        predicate = $.toFun(predicate, true)
	        var isFun = $.isFun(predicate)
	        var old = this
	        var args = arguments.length > 1 ? slice.call(arguments, 1) : null;
	        return function () {
	            if (isFun ? predicate.apply(this, arguments) : predicate)
	                return old.apply(this, args || arguments)
	        }
	    },


	    /*	绑定域
	    @scope	:Object(可选) 域
	    @params	:Object(可选) 可变参数，要传递的任意多个参数
	    @return	:Function
	    */
	    bind: function (scope, params) {
	        var old = this;
	        var args = arguments.length > 1 ? slice.call(arguments, 1) : null;
	        return function () {
	            return old.apply(scope || win, args || arguments)
	        }
	    },


	    /*	格式化参数
	    如：fn.$format('@{2}','@{*}',12,"@{1,5}","@{2-6}")
	    @params:String/Object 可变参数，任意多个格式或参数
	    可以是定位参数的字符串"{1}"、"{*}"、"{2-6}"、或者任意对象
	    @return	:Function
	    */
	    format: function (params) {
	        var old = this;
	        var sendArgs = slice.call(arguments, 0)
	        var needFormat = false
	        for (var i = 0; i < arguments.length; i++)
	            if ($.isStr(arguments[i]) && /^@\{([\d\*\-\,]+)\}$/.test(arguments[i])) {
	                needFormat = true;
	                break
	            }


	        if (!needFormat) {
	            return function () {
	                return old.apply(this, sendArgs)
	            }
	        }


	        return function () {
	            var args = [].concat(sendArgs)
	            for (var i = 0; i < args.length; i++) {
	                var arg = args[i], ms;
	                if ($.isStr(arg) && (ms = arg.match(/^@\{([\d\*\-\,]+)\}$/))) {
	                    var str = ms[1]
	                    if (/^\d+$/.test(str)) {
	                        args[i] = arguments[str]
	                    }
	                    else {
	                        var as;
	                        if (str.indexOf(',') > -1) {
	                            as = eval("[arguments[" + str.replace(/^,|,$/g, '').replace(/,+/g, "],arguments[") + "]]")
	                        }
	                        else {
	                            var start = 0, end;
	                            if (str.indexOf('-') > -1) {
	                                var parts = str.split('-')
	                                start = parts[0]
	                                end = parts[1]
	                            }
	                            as = slice.call(arguments, start, (parseInt(end) + 1) || 1000)
	                        }
	                        args.splice.apply(args, [i, 1].concat(as))
	                        i += as.length - 1
	                    }
	                }
	            }
	            return old.apply(this, args)
	        }
	    },

	    /*	继承
	    @base	:基类
	    @overrides:包含扩展成员的任意多个参数
	    @return	:this
	    */
	    inherit: function (base, overrides) {
	        var o = overrides || {}
	        o.constructor = this
	        o.base = base;
	        return $.Class(o);
	    },

	    /*	扩展
	    @overrides:包含扩展成员的任意多个参数
	    @return	:this
	    */
	    extend: function (overrides) {
	        $.extend.apply(this, [this.prototype].concat(slice.call(arguments, 0)))
	        return this
	    },
	    parse: function (obj) {
	        if (obj instanceof this) return obj;
	        return new this(obj);
	    }
	}, lib.Function)
    $.safeExtend("$", Function.prototype, lib.Function)
    //#end


    //## Date
    /*#C Data 扩展*/
    fly.lib.Date = $.extend(
	{
	    /*	格式化日期
	    @format	:String 时间格式，默认 yyyy-MM-dd hh:mm:ss
	    @return	:String 
	    */
	    format: function (format) {
	        format = format || "yyyy-MM-dd HH:mm:ss";
	        var o =
			{
			    //年
			    "y+": this.getFullYear(),
			    //月
			    "M+": this.getMonth() + 1,
			    //日
			    "d+": this.getDate(),
			    //小时24
			    "H+": this.getHours(),
			    //小时12
			    "h+": this.getHours() % 12,
			    //分
			    "m+": this.getMinutes(),
			    //秒
			    "s+": this.getSeconds(),
			    //毫秒
			    "S+": this.getMilliseconds(),
			    //星期大写
			    "W+": fly.lib.Date.W[this.getDay()],
			    //星期小写
			    "w": fly.lib.Date.w[this.getDay()]
			}

	        for (var k in o) {
	            format = format.replace(new RegExp(k, 'g'), function ($0) {
	                return o[k].toString().padLeft($0.length, '0')
	            })
	        }
	        return format;
	    }
	}, lib.Date)
    fly.lib.Date.w = " 123456"
    fly.lib.Date.W = "Sun,Mon,Tues,Wed,Thurs,Fri,Sat".split(',')

    $.safeExtend("$", Date.prototype, lib.Date)
    //#end


    //## String
    /*#C String 扩展*/
    fly.lib.String = $.extend(
	{
	    formatReg: /\{([^{}]+)\}/g,
	    /*	格式化字符串，可以调用用参数的属性或者方法进行格式化
	    例如
	    "a{0}b{1}".format("-",5) 结果等于 "a-b5"
			
	    var option={id:123,name:"fly"};
	    "a{0}b {name}".format("-",5,option) 结果等于 "a-b fly"
			
	    var option={
	    getId:function(){
	    return 123
	    }
	    };
	    "a{0}b {getId()}".format("-",option) 结果等于 "a-b 123"
			
	    @params	:Object 可变参数，用来格式化的任意多个参数
	    @return	:String
	    */
	    format: function (params) {
	        var args = arguments
	        return this.replace(this.formatReg, function ($0, $1) {
	            var v;
	            if ($1.match(/^\d+$/))
	                v = args[$1]
	            else {
	                for (var i = args.length - 1; i > -1; i--) {
	                    if (args[i] == null) continue;
	                    if (/[^\w$]/.test($1))
	                        eval('v=args[i].' + $1)
	                    else
	                        v = args[i][$1]
	                    if (v !== undefined) {
	                        while ($.isFun(v))
	                            v = v.call(args[i])
	                        break;
	                    }
	                }
	            }
	            return v == null ? "" : v;
	        })
	    },


	    /*	字符串是否包含另一个字符串
	    @subStr	:要检查的子串
	    @ignoreCase:Boolean(可选) 忽略大小写,默认区分大小写
	    @separator:String(可选) 分隔符
	    @return	:Boolean
	    */
	    contains: function (subStr, ignoreCase, separator) {
	        return this.IndexOf(subStr, ignoreCase, separator) > -1;
	    },

	    /*	子串出现的位置
	    @subStr	:要检查的子串
	    @ignoreCase:Boolean(可选) 忽略大小写,默认区分大小写
	    @separator:String(可选) 分隔符
	    @return	:Int
	    */
	    IndexOf: function (subStr, ignoreCase, separator) {
	        if (subStr == null)
	            return -1;
	        var ss = separator || ''
	        var s = ss ? ss + this + ss : this, sub = ss ? ss + subStr + ss : subStr;

	        return ignoreCase ? s.toUpperCase().indexOf(sub.toUpperCase()) : s.indexOf(sub);
	    },

	    /*	字符串是否以指定字符串开头
	    @subStr	:要检查的子串
	    @ignoreCase:Boolean(可选) 忽略大小写,默认区分大小写
	    @return	:Boolean
	    */
	    startWith: function (subStr, ignoreCase) {
	        if (subStr == null) return false;
	        var s = this.substr(0, subStr.length)
	        return ignoreCase ? (s.toUpperCase() == subStr.toUpperCase()) : (s == subStr)
	    },

	    /*	字符串是否以指定字符串结尾
	    @subStr	:要检查的子串
	    @ignoreCase:Boolean(可选) 忽略大小写,默认区分大小写
	    @return	:Boolean
	    */
	    endWith: function (subStr, ignoreCase) {
	        if (subStr == null) return false;
	        var s = this.substr(this.length - subStr.length)
	        return ignoreCase ? (s.toUpperCase() == subStr.toUpperCase()) : (s == subStr)
	    },


	    /*	去掉左右空白 
	    @return	:String
	    */
	    trim: function () {
	        return this.replace(/(^\s+)|(\s+$)/g, "");
	    },
	    /*	去掉左空白 
	    @return	:String
	    */
	    trimLeft: function () {
	        return this.replace(/^\s+/g, "");
	    },

	    /*	去掉左空白 
	    @return	:String
	    */
	    trimRight: function () {
	        return this.replace(/\s+$/g, "");
	    },

	    /*	将第一个字母转换为大写
	    @return	:String
	    */
	    firstUpper: function () {
	        return this.charAt(0).toUpperCase() + this.substr(1)
	    },


	    /*	重复指定次数
	    @count	:Int 重复次数
	    @return	:String
	    */
	    repeat: function (count) {
	        var r = '';
	        while (count-- > 0)
	            r += this
	        return r
	    },


	    /*	填充左边到指定长度
	    @minLength:Int 最小长度
	    @_char	:String 用来填充不足的字符
	    @return	:String
	    */
	    padLeft: function (minLength, _char) {
	        return (_char == null ? ' ' : _char.toString()).$repeat(minLength - this.length) + this
	    },


	    /*	填充右边到指定长度
	    @minLength:最小长度
	    @_char	:String 用来填充不足的字符
	    @return	:String
	    */
	    padRight: function (minLength, _char) {
	        return this + (_char == null ? ' ' : _char.toString()).$repeat(minLength - this.length)
	    },
	    /*  将字符串转换为骆驼命名规则
	    @wordSplitChar  :String 字符串中的分隔符
	    @return :String
	    */
	    camelCase: function (wordSplitChar) {
	        var str = this;
	        if (wordSplitChar && $.isStr(wordSplitChar)) {
	            str = str.replace(new RegExp("\\" + wordSplitChar + "\\w", "g"), function ($1) {
	                return $1.charAt(1).toUpperCase()
	            })
	        }
	        return str.charAt(0).toLowerCase() + str.substr(1)
	    }
	}, lib.String)
    $.safeExtend("$", String.prototype, lib.String)
    //#end


    //## fly.lib.Event
    /* #C path:fly.lib.Event
    事件处理器
    */
    fly.lib.EventManager = function () {
        var me = this
        this.event = null
        this.eventHash = {}
        this.stopPropagationReturnValue = false;

        this.btnMap = browser.isIE ?
		{
		    1: 0,
		    4: 1,
		    2: 2
		} : (browser.isWebKit ?
		{
		    1: 0,
		    2: 1,
		    3: 2
		} :
		{
		    0: 0,
		    1: 1,
		    2: 2
		});
        var spliceTypeName = function (eName) {
            var typeStart = eName.indexOf('.')
            var type = "";
            if (typeStart > -1) {
                type = eName.substr(typeStart + 1)
                eName = eName.substr(0, typeStart)
            }
            return { type: type, eName: eName }
        }

        var ps = "type altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" ")
        var ec = this.eventCls = function (e) {
            this.browserEvent = e
            for (var i = 0; i < ps.length; i++)
                this[ps[i]] = e[ps[i]]
        }

        ec.extend({
            pageXY: function () {
                return { x: this.clientX + docE.scrollLeft + doc.body.scrollLeft,
                    y: this.clientY + docE.scrollTop + doc.body.scrollTop
                }
            }
        });

        //设置事件
        this.setEvent = function (e) {
            if (e == me.event || (e && e.browserEvent) || e == me.browserEvent) {
                return e;
            }
            win.$$event = $.$$event = me.browserEvent = e;
            var previous = $.$event
            var evt = $.$event = win.$event = me.$event = new this.eventCls(e)
            if (previous && previous != evt)
                evt.previous = previous

            if (e) {
                // 鼠标键
                evt.button = e.button ? this.btnMap[e.button] : (e.which ? e.which - 1 : -1);
                if (e.type == 'click' && evt.button == -1)
                    evt.button = 0;
                // 是否按下Ctrl键
                evt.ctrlKey = e.ctrlKey || e.metaKey || false;
                //键盘按键
                evt.keyCode = e.keyCode == undefined ? e.which : e.keyCode
                // 事件源
                evt.target = e.srcElement || e.target
            }
            else {
                evt.button = -1;
                evt.shiftKey = false;
                evt.ctrlKey = false;
                evt.altKey = false;
                evt.keyCode = 0;
                evt.charCode = 0;
                evt.target = null;
            }
            return evt;
        }


        this.restoreEvent = function (evt) {
            $.$event = win.$event = me.event = evt
            win.$$event = $.$$event = me.browserEvent = evt ? evt.browserEvent : null;
        }

        var on = function (el, eName, fn, scope, data) {
            var id = ui.DomHelper.getUniqueID(el)
            var eHash = me.eventHash[id]
            eHash || (me.eventHash[id] = eHash = { el: el })

            var parts = spliceTypeName(eName)
            eName = parts.eName

            var hs = eHash[eName]

            if (hs == null) {
                eHash[eName] = hs = []
                function h(e) {
                    e = e || win.event
                    var evt = me.setEvent(e)
                    me.fire(el, eName)
                    try {
                        me.restoreEvent(evt.previous)
                    } catch (ex) { }
                    return e.returnValue
                }

                hs.root = h;

                if (eName == "sizechange" && !browser.isIE) {
                    var ow = el.offsetWidth, oh = el.offsetHeight;
                    setInterval(function () {
                        if (ow != el.offsetWidth || oh != el.offsetHeight) {
                            ow = el.offsetWidth
                            oh = el.offsetHeight
                            h({ type: eName });
                        }
                    }, 300);
                }
                else if (el.attachEvent)
                    el.attachEvent("on" + (eName == "sizechange" ? "resize" : eName), h)

                else if (el.addEventListener)
                    el.addEventListener(eName, h, false)

                else if (!(("on" + eName) in el))
                    el["on" + eName] = h

            }
            hs.unshift(
			        {
			            fn: $.toFun(fn),
			            scope: scope,
			            args: data,
			            type: parts.type
			        })
        }

        /*	绑定事件
        @el	:Object/Array<Object> 一个或多个DOM对象
        @eName	:String/Array<String> 一个或多个事件名
        @fn		:Function/Array<Function> 一个或多个处理函数
        @scope  :域
        @data	:Object(可选) 要传递的数据
        @return	:el
        */
        this.on = function (el, eName, fn, scope, data) {
            var nIsStr = $.isStr(eName), nIsObj = !nIsStr && $.isObject(eName);
            if (arguments.length == 2 && !nIsObj)
                return this.fire(el, eName);
            var eIsArr = $.likeArray(el), fIsArr = $.likeArray(fn)
            nIsObj && (scope = fn)
            var dIndex = nIsObj ? 3 : 4
            data = arguments.length > dIndex ? slice.call(arguments, dIndex) : undefined
            if (!eIsArr && !nIsObj && nIsStr && !fIsArr) {
                on(el, eName, fn, scope, data)
                return this
            }

            function bn(e, n, f) {
                f && (fIsArr = $.likeArray(f))
                fIsArr ? $.each(f, function (_f) {
                    on(e, n, _f, scope, data)
                }) : on(e, n, f, scope, data);
            }

            function be(e) {
                nIsStr ? bn(e, eName, fn) : nIsObj ? $.each(eName, function (f, n) {
                    bn(e, n, f)
                }) : $.each(eName, function (n) { bn(e, n, fn) });
            }
            eIsArr ? $.each(el, be) : be(el);
            return this
        }

        this.bind = this.on

        /*	注销事件
        @el	:Object/Array<Object> 一个或多个DOM对象
        @eName	:String/Array<String> 一个或多个事件名
        @fn		:Function/Array<Function> 一个或多个处理函数
        @return	:el
        */
        this.un = function (el, eName, fn) {
            if ($.likeArray(el)) {
                for (var i = 0; i < el.length; i++)
                    me.un(el[i], eName, fn)
                return el
            }


            if ($.likeArray(eName)) {
                for (var i = 0; i < eName.length; i++)
                    me.un(el, eName[i], fn)
                return el
            }
            var uid = ui.DomHelper.getUniqueID(el)
            var eHash = me.eventHash[uid]
            if (!eHash)
                return el


            function un(hs, fn, name, type) {
                if ($.likeArray(fn)) {
                    for (var i = 0; i < fn.length; i++)
                        un(hs, fn[i], name, type)
                    return
                }

                fn != null && (fn = $.toFun(fn))

                for (var i = hs.length - 1; i > -1; i--) {
                    if ((fn == null || hs[i].fn == fn) && (type === "" || type == hs[i].type))
                        hs.splice(i, 1)
                }

                if (hs.length == 0 && eHash[name]) {
                    var el = eHash.el, root = eHash[name].root
                    if (root) {
                        el.detachEvent && el.detachEvent("on" + name, root)
                        if (el.removeEventListener)
                            try {
                                el.removeEventListener(name, root)
                            } catch (e) { }

                        if (el["on" + name] == root)
                            el["on" + name] = null;
                    }
                    eHash[name] = null;
                    delete eHash[name]
                }
            }

            if (eName == null) {
                for (var en in eHash) {
                    if (en != "el")
                        un(eHash[en], fn, en, '', true)
                }
                eHash.el = null;
                me.eventHash[uid] = null
                delete me.eventHash[uid]
            }
            else {
                var parts = spliceTypeName(eName)
                var hs = eHash[parts.eName]
                if (!hs)
                    return el
                else
                    un(hs, fn, parts.eName, parts.type)
            }

            var i = 0;
            for (var k in eHash)
                i++
            if (i < 2) {
                delete eHash.el
                delete me.eventHash[uid]
            }

            return this
        }


        /*	触发事件
        @el	:Object/Array<Object> 一个或多个DOM对象
        @eName	:String/Array<String> 一个或多个事件名
        @scope  :域
        @args	:Array(可选) 可变参数，要传递的任意多个参数
        @return :el
        */
        this.fire = function (el, eName, scope, args) {
            me.stoped = false
            if ($.likeArray(el)) {
                for (var i = 0; i < el.length; i++)
                    me.fire.apply(me, [el[i]].concat(slice.call(arguments, 1)))
                return el
            }


            if ($.likeArray(eName)) {
                for (var i = 0; i < eName.length; i++)
                    me.fire.apply(me, [el, eName[i]].concat(slice.call(arguments, 2)))
                return el
            }


            var eHash = me.eventHash[ui.DomHelper.getUniqueID(el)]
            if (!eHash)
                return el

            var parts = spliceTypeName(eName)
            eName = parts.eName

            var hs = eHash[eName]
            if (!hs)
                return el
            var ret
            var args = arguments.length > 3 ? slice.call(arguments, 3) : null;
            for (var i = 0; i < hs.length; i++) {
                var h = hs[i]
                if (parts.type === "" || parts.type == h.type) {
                    ret = h.fn.apply(h.scope == null ? (scope == null ? el : scope) : h.scope, args || h.args || [el, me.$event])
                    try {
                        if (el.nodeType) {
                            if (ret == me.stopPropagationReturnValue) {
                                lib.Event.stop()
                                break;
                            }
                            else if (me.stoped || (me.browserEvent && me.browserEvent.cancelBubble))
                                break
                        }
                        else if (ret == me.stopPropagationReturnValue)
                            break
                    } catch (e) { }
                }
            }
            return ret
        }

        /*	停止事件
        @return:Boolean false
        */
        this.stop = function () {
            var e = me.$event, be = me.browserEvent;
            me.stoped = true
            if (e) {
                e.cancelBubble = be.cancelBubble = true
                e.returnValue = be.returnValue = false
                if (be.stopPropagation)
                    be.stopPropagation()
                if (be.preventDefault)
                    be.preventDefault()
            }
            return this == me ? this : false
        }

        /*  创建事件函数
        @eName  :String 事件名称
        @fire   :Function(可选) 事件的响应函数
        @return :Function 附加或响应事件的函数
        */
        this.createEventFn = function (eName, fire) {
            var eName = eName.replace(/^on/i, '')
            eName = eName.charAt(0).toLowerCase() + eName.substr(1)
            return function () {
                if (arguments.length > 0)
                    return this.on.apply(this, [eName].concat(Array.prototype.slice.call(arguments, 0)))
                else if (fire)
                    return fire.call(this)
                else
                    this.fire(eName);
            }
        }

        /*	为对象注册事件
        @obj :要注册事件的对象
        @eventNames	:Array 要注册的任意多个事件名称
        @return	:fly.lib.Event
        */
        this.registEvent = function (obj, eventNames) {
            var target = $.isFun(obj) ? obj.prototype : obj
            this.eventAble(target)
            eventNames = $.isStr(eventNames) ? [eventNames] : eventNames
            for (var i = 0; i < eventNames.length; i++) {
                var e = eventNames[i];
                if (target[e] == null)
                    target[e] = this.createEventFn(e);
            }
            return this
        }

        /*  使对象具有事件管理机制
        @obj    :Object 除值类型的任何对象
        @return :fly.lib.Event
        */
        this.eventAble = function (obj) {
            var target = $.isFun(obj) ? obj.prototype : obj
            if (target.eventAble) return this
            if (!target.fire)
                target.fire = function () {
                    return me.fire.apply(this, [this].$addRange(arguments))
                }
            if (!target.on)
                target.on = function () {
                    return me.on.apply(this, [this].$addRange(arguments))
                }
            if (!target.un)
                target.un = function () {
                    me.un.apply(this, [this].$addRange(arguments))
                    return this
                }
            return this
        }

        this.destroy = function () {
            me.destroy = null;
            for (var k in me.eventHash)
                me.un(me.eventHash[k].el)
            destroy(me)
            me = null;
        }
    } .$inherit(lib.EventManager);

    //事件处理对象
    fly.Event = fly.lib.Event = new lib.EventManager()

    /*	绑定多个函数到 window.onload
    @fu	:Function 可变参数，要绑定的任意多个函数
    @return	:fly
    */
    $.onLoad = function (fn, scope, data) {
        if (doc.readyState == "complete" || doc.readyState == "loaded") {
            var args = slice.call(arguments, 2);
            setTimeout(function () {
                if ($.likeArray(fn)) {
                    $.each(fn, function () {
                        return this.apply(scope, args)
                    });
                }
                else
                    fn.apply(scope, args)
            });
        }
        else
            $.Event.on.apply($.Event, [win, "load"].concat(arguments))
        return this
    }


    /*	绑定多个函数到 window.onload
    @fu	:Function 可变参数，要绑定的任意多个函数
    @return	:fly
    */
    $.ready = function (fn, scope, data) {
        if (doc.readyState == "complete")
            return $.onLoad.call(this, arguments)
        $.initReady()
        $.doc.on.apply($.doc, ["_readycomplete"].concat(arguments))
    }

    $.initReady = function () {
        if ($.initReady.invoked) return;
        $.initReady.invoked = true;
        var eName = browser.isIE ? "readystatechange" : "DOMContentLoaded"
        var isReady = false, t = 0
        var fire = function () {
            if (isReady) return
            isReady = true
            clearInterval(t)
            $.doc.un(eName)
            $.doc.fire("_readycomplete")
            $.doc.un("_readycomplete")
        }
        $.doc.on(eName, function () {
            if ((/loaded|complete/).test(document.readyState))
                fire()
        })
        if (browser.isIE) {
            t = setInterval(function () {
                try {
                    docE.doScroll('left');
                    fire()
                } catch (e) { }
            }, 10);
        }
    }


    /*	绑定多个函数到	window.onunload
    @params	:Function(可选) 可变参数，要绑定的任意多个函数
    @return	:fly
    */
    $.onUnload = function (params) {
        $.Event.on(win, "unload", arguments)
        return $
    }

    /*	绑定多个函数到	window.onBeforeUnload
    @params	:Function 可变参数，要绑定的任意多个函数
    @return	:fly
    */
    $.onBeforeUnload = function (params) {
        $.Event.on(win, "beforeunload", arguments)
        return $
    }
    //#end

    //## fly.lib.Json
    /*#C path:fly.lib.Json
    Json工具
    */
    fly.lib.JsonUtils = function () {
        var me = this, useHasOwn = !!{}.hasOwnProperty;
        var m =
		{
		    "\b": '\\b',
		    "\t": '\\t',
		    "\n": '\\n',
		    "\f": '\\f',
		    "\r": '\\r',
		    '"': '\\"',
		    "\\": '\\\\'
		};
        var needJsonEncode = function (jsonEncode) {
            return jsonEncode === 0 || jsonEncode == null || jsonEncode > 0
        }

        var encodeString = function (s, jsonEncode) {
            s = encodeURIComponent(s)
            if (/["\\\x00-\x1f]/.test(s)) {
                return '"' + s.replace(/([\x00-\x1f\\"])/g, function (a, b) {
                    var c = m[b];
                    if (c) {
                        return c;
                    }
                    c = b.charCodeAt();
                    return "\\u00" + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
                }) + '"';
            }
            if (needJsonEncode(jsonEncode))
                return '"' + s + '"';
            else return s
        };

        var encodeArray =
        /*	对集合进行编码
        @o   :Array 要编码的集合
        @jsonEncode  :Boolean 是否Json格式
        @return	:String
        */
 		this.encodeArray = function (o, jsonEncode) {
 		    var a = ["["], b,
			i,
			l = o.length, v;
 		    for (i = 0; i < l; i += 1) {
 		        v = o[i];
 		        switch (typeof v) {
 		            case "undefined":
 		            case "function":
 		            case "unknown":
 		                break;
 		            default:
 		                if (b) {
 		                    a.push(',');
 		                }
 		                a.push(v === null ? "null" : $.Json.encode(v, jsonEncode));
 		                b = true;
 		        }
 		    }
 		    a.push("]");
 		    return a.join("");
 		};


        /*  对时间进行编码
        @o   :Date 要编码的时间对象
        @jsonEncode  :Boolean 是否Json格式,
        @return	:String
        */
        this.encodeDate = function (o, jsonEncode) {
            var t = o.$format("yyyy-MM-dd hh:mm:ss");
            return needJsonEncode(jsonEncode) ? '"' + t + '"' : t
        };


        /*  将对象编码
        @o   :要编码的对象
        @jsonEncode  :Boolean 是否Json格式,
        @return	:String
        */
        this.encode = function (o, jsonEncode) {
            var nje = $.isNumber(jsonEncode) ? jsonEncode + 1 : jsonEncode
            if (o == null)
                return "null";
            var s = $.likeArray(o) ? encodeArray(o, nje) :
                $.isDate(o) ? $.Json.encodeDate(o, jsonEncode) :
                    $.isStr(o) ? encodeString(o, jsonEncode) :
                        $.isNumber(o) || $.isBoolean(o) ? String(o) : $.BREAK;
            if (s != $.BREAK)
                return s;
            else {
                var a = ["{"], b,
				i,
				v;
                for (i in o) {
                    if (!useHasOwn || (o.hasOwnProperty && o.hasOwnProperty(i))) {
                        v = o[i];
                        switch (typeof v) {
                            case "undefined":
                            case "function":
                            case "unknown":
                                break;
                            default:
                                if (b)
                                    a.push(',');
                                a.push(me.encode(i), ":", v === null ? "null" : this.encode(v, nje));
                                b = true;
                        }
                    }
                }
                a.push("}");
                return a.join("");
            }
        };


        /*  对Json字符串解码
        @json   :要解码的Json对象	    
        @return	:String
        */
        this.decode = function (json) {
            var o = json;
            try {
                if ($.isStr(json))
                    return win.eval("(" + json + ")")
                return json;
            }
            catch (e) {
                if (o == "")
                    return ""
                win.eval(o)
            }
        },
        /*  将Json对象进行Url编码
        @json   :Object 要编码的对象
        @memberToParam :Boolean 是否将成员编码为参数
        @prefix :String 前缀
        @return :String 编码后的字符串
        */
        this.urlEncode = function (json, memberToParam, prefix, buf) {
            var fromSelf = !!buf
            buf = buf || []
            var isArr = $.likeArray(json)
            var prefix = prefix == null || prefix === '' ? '' : prefix
            if (!$.likeArray(json) && !$.isObject(json)) {
                var r = me.encode(json, -1)
                if (fromSelf)
                    buf.push("&", prefix, "=", r)
                return r
            }

            $.each(json, function (val, key) {
                var v = isArr && !fromSelf ? val.value : val
                var k = (prefix === '' ? '' : prefix + '.') + encodeURIComponent(isArr ? (!fromSelf ? val.name || val.id : "") : key)

                if (memberToParam != false) {
                    if ($.likeArray(v))
                        return $.each(v, function () {
                            me.urlEncode(this, memberToParam, k, buf)
                        })
                    else if ($.isObject(v))
                        return $.each(v, function (o, key) {
                            me.urlEncode(o, memberToParam, k + "." + encodeURIComponent(key), buf)
                        })
                }
                buf.push("&", k, "=", me.encode(v, -1))
            })
            if (fromSelf) return
            if (buf.length) {
                buf.shift();
            }
            return buf.join('');
        },

        /*  将字符串进行Url解码*/
        this.urlDecode = function (str, override) {
            if (!str)
                return {};

            var json = {}, kv, k, v, ov, j, ks
            $.each(str.split('&'), function () {
                kv = this.split('=')
                k = decodeURIComponent(kv[0]);
                j = json
                ks = k.split(".");
                while (ks.length > 1) {
                    k = ks.shift()
                    j = j[k] = j[k] == null ? {} : j[k];
                }
                k = ks[0]
                v = kv[1];
                if (override || !j[k])
                    j[k] = v
                else if ($.isArray(ov = j[k]))
                    ov[ov.length] = v
                else
                    j[k] = [ov, v]
            });
            return json;
        }


        /*	遍历每一项
        @json	:要遍历的对象
        @action	:Function 处理函数
        @params	:Object(可选) 可变参数，要传递的任意多个参数
        @return :json
        */
        this.each = function (json, action, params) {
            return qp.each.apply(json, slice.call(arguments, 1))
        }


        /*	将结果转换为数组
        @json	:要转换的数组
        @evaluator:Function/String/Object 计算值的函数
        @params	:Object(可选) 可变参数，要传递的多个参数
        @return	:Array
        */
        this.map = function (json, evaluator, params) {
            return qp.select.apply(json, slice.call(arguments, 1))
        }

        var gAs = {}, sAs = {}, propExpr = /^[\w\$]+$/
        this.getAccessor = function (e) {
            if ($.isFun(e)) return e
            if (gAs[e]) return gAs[e]

            if ($.isStr(e))
                return gAs[e] = propExpr.test(e) ? function (o) { return o[e] } : new Function("__o", "with(__o){return " + e + "}")
            else if ($.isNumber(e))
                return function (o) { return o[e] }
            else return function () { return e }
        }

        this.setAccessor = function (e) {
            if ($.isFun(e)) return e
            if (sAs[e]) return sAs[e]

            if ($.isStr(e))
                return sAs[e] = propExpr.test(e) ? function (o, v) { o[e] = v; } : new Function("__o", "with(__o,__v){" + e + "=__v}")
            else
                return sAs[e] = function (o, v) { o[e] = v }
        }
        this.destroy = destroy;
    } .$inherit(lib.JsonUtils);
    fly.Json = fly.lib.Json = new lib.JsonUtils()
    //#end

    /* #C path:fly.ajax.Helper
    通过 HTTP 请求加载远程数据。
    配置:
    {
    url     :String 请求的地址
    method  :String 请求方式,get或post,默认get
    async   :Boolean    是否异步,默认true
    dataHandler:Function    对请求返回的数据进行处理后返回
    charset :String 编码,默认GB2312
    username:String 用户名,服务端验证用
    password:String 密码,服务端验证用
    timeout :Int    超时时间(毫秒)
    data    :Json/String   向服务器传递的数据
    }

    调用:

    var helper=new fly.ajax.Helper({
    url:'http://www.flyui.net/a.php',
    method:'get',
    success:function(){
    alert('请求成功!')
    }
    })
    helper.go();

    ------------------------------------------
    var helper=new fly.ajax.Helper()
    helper.setup({
    url:'http://www.flyui.net/a.php',
    method:'get',
    success:function(){
    alert('请求成功!')
    }
    })
    helper.go();

    ------------------------------------------
    fly.get('http://www.flyui.net/a.php',function(){
    alert('请求成功!')
    });

    ------------------------------------------
    fly.post('http://www.flyui.net/a.php',function(){
    alert('请求成功!')
    });

    ------------------------------------------
    var helper=fly.ajax.url('http://www.flyui.net/a.php').method('get').onSuccess(function(){
    alert('请求成功!')
    }).go();
            
    ------------------------------------------
    var helper=fly.ajax.url('http://www.flyui.net/a.php').onSuccess(function(){
    alert('请求成功!')
    }).get();

    */

    var ajax = fly.lib.ajax = fly.ajax = function (option) {
        var helper = new ajax.Helper(option)
        if (arguments.length > 0 && $.is(this, lib.ajax) === false && helper.autoLoad != false)
            return helper.go();
        return helper;
    }

    /*#M path:fly.ajax.Helper.url 设置请求的地址
    @url    :String 地址
    @return :this
    */
    /*#M path:fly.ajax.Helper.method 设置请求方式
    @method    :String get或post,默认get
    @return :this
    */

    /*#M path:fly.ajax.Helper.async 设置是否采用异步请求
    @async    :Boolean 是否异步,默认true
    @return :this
    */

    /*#M path:fly.ajax.Helper.dataHandler 设置对请求返回的数据进行处理后返回的函数
    @dataHandler    :Function   处理函数
    @return :this
    */

    /*#M path:fly.ajax.Helper.contentType 设置HTTP头:contentType
    @contentType    :String   默认application/x-www-form-urlencoded
    @return :this
    */

    /*#M path:fly.ajax.Helper.charset 设置HTTP头:charset
    @charset    :String   编码,默认GB2312
    @return :this
    */

    /*#M path:fly.ajax.Helper.username 设置用户名,服务端验证用
    @username    :String   用户名
    @return :this
    */

    /*#M path:fly.ajax.Helper.password 设置密码,服务端验证用
    @password    :String   密码
    @return :this
    */

    /*#M path:fly.ajax.Helper.timeout 设置超时时间(毫秒)
    @timeout    :Int   超时时间(毫秒)
    @return :this
    */

    /*#M path:fly.ajax.Helper.data 设置向服务器传递的数据
    @data    :Json   向服务器传递的数据
    @return :this
    */

    ajax.Option = {
        /*String 请求的地址*/
        url: location.href,
        /*String 请求方式,get或post,默认get*/
        method: null,
        dataType: "",
        /*Boolean    是否异步,默认true*/
        async: true,
        parameterName: "par_{0}",
        /*Function    对请求返回的数据进行处理后返回*/
        dataHandler: undefined,
        /*String    默认application/x-www-form-urlencoded*/
        contentType: "application/x-www-form-urlencoded",
        /*String 编码,默认GB2312*/
        charset: "GB2312",
        /*String 用户名,服务端验证用*/
        username: undefined,
        /*String 密码,服务端验证用*/
        password: undefined,
        /*Int    超时时间(毫秒)*/
        timeout: -1,
        /*Json/String   向服务器传递的数据*/
        data: undefined
    }

    ajax.Helper = function (option) {
        this.option = $.extend({}, ajax.Option)
        this.setup(option)
    }

    ajax.Accepts = {
        xml: "application/xml, text/xml",
        html: "text/html",
        script: "text/javascript, application/javascript",
        json: "application/json, text/javascript",
        text: "text/plain",
        _default: "*/*"
    }
    /* #E path:fly.ajax.Helper.onStart
    在Ajax请求开始之前时执行,返回false取消请求。*/

    /* #E path:fly.ajax.Helper.onError
    在Ajax请求出错时执行。*/

    /* #E path:fly.ajax.Helper.onSuccess
    在Ajax请求成功时执行。*/

    /* #E path:fly.ajax.Helper.onComplete
    在Ajax请求完成时执行。*/

    /* #E path:fly.ajax.Helper.onSend
    在Ajax请发送数据前执行,返回false取消请求。*/

    /* #E path:fly.ajax.Helper.onStop
    在Ajax请求停止时执行。*/

    /* #E path:fly.ajax.Helper.onReadystatechange
    在Ajax请求中,服务端有响应时执行。*/


    ajax.Eevents = ["onStart", "onError", "onSuccess", "onComplete", "onSend", "onStop", "onReadystatechange"]
    lib.Event.registEvent(ajax.Helper, ajax.Eevents);
    ajax.Helper.$extend(
 	{
 	    option: null,
 	    /*重新配置Ajax选项
 	    @option :Json   包含详细配置的Json对象
 	    @return :this
 	    */
 	    setup: function (option) {
 	        if (option) {
 	            for (var i = 0; i < ajax.Eevents.length; i++) {
 	                var e = ajax.Eevents[i]
 	                var le = e.charAt(2).toLowerCase() + e.substr(3)
 	                option[e] && this[e](option[e])
 	                option[le] && this[e](option[le])
 	            }
 	            $.extend(this.option, option)
 	        }
 	        return this;
 	    },
 	    /*  用GET方式对服务器发起请求
 	    @url    :String 请求的地址
 	    @data   :Json(可选) 想服务器发送的数据
 	    @success:Function(可选)   当请求成功时的回调函数
 	    @error  :Function(可选)   当请求失败时的回调函数
 	    @return :Object/this    当同步请求是返回服务器输出内容,异步调用是返回当前的fly.ajax.Helper实例
 	    */
 	    get: function () {
 	        this.option.method = "GET"
 	        return this.go.apply(this, arguments)
 	    },
 	    /*  用POST方式对服务器发起请求
 	    @url    :String 请求的地址
 	    @data   :Json(可选) 想服务器发送的数据
 	    @success:Function(可选)   当请求成功时的回调函数
 	    @error  :Function(可选)   当请求失败时的回调函数
 	    @return :Object/this    当同步请求是返回服务器输出内容,异步调用是返回当前的fly.ajax.Helper实例
 	    */
 	    post: function () {
 	        this.option.method = "POST"
 	        return this.go.apply(this, arguments)
 	    },
 	    /*  对服务器发起请求
 	    @url    :String 请求的地址
 	    @data   :Json(可选) 想服务器发送的数据
 	    @success:Function(可选)   当请求成功时的回调函数
 	    @error  :Function(可选)   当请求失败时的回调函数
 	    @return :Object/this    当同步请求是返回服务器输出内容,异步调用是返回当前的fly.ajax.Helper实例
 	    */
 	    go: function (url, data, success, error) {
 	        var o = this.option
 	        if (arguments.length > 0) {
 	            this.url(url)
 	            if ($.isFun(data)) {
 	                error = success
 	                success = data
 	                data = undefined
 	            }
 	            data !== undefined && (this.data(data))
 	            success && this.onSuccess(success)
 	            error && this.onError(error)
 	        }

 	        var url = o.url.replace(/#.*$/, '')
 	        if (this.fire("start") === false) return this
 	        this.parseSendData()
 	        var isGet = (o.method || o.type || "GET").toUpperCase() == "GET"
 	        if (isGet) {
 	            if (o.dataEncode !== "") url += (url.indexOf('?') > -1 ? "&" : "?") + o.dataEncode
 	            if (o.dataType === "script")
 	                return this.loadScript(url)
 	        }

 	        this.createConnecion();

 	        var conn = this.connection
            var method=isGet?"GET":"POST"
            o.username != undefined ? conn.open(method, url, o.async, o.username, o.password) : conn.open(method, url, o.async);
 	        conn.setRequestHeader("Content-Type", o.contentType)
 	        conn.setRequestHeader("Charset", o.charset)
 	        if (!isGet)
 	            conn.setRequestHeader("Content-Length", o.dataEncode.length);

 	        conn.setRequestHeader("X-Requested-With", "XMLHttpRequest");
 	        conn.setRequestHeader("Accept", o.dataType && ajax.Accepts[o.dataType] ?
				ajax.Accepts[o.dataType] + ", */*" :
				ajax.Accepts._default);
 	        var c = this.createContext()
 	        conn.onreadystatechange = c.stateChange;
 	        if (this.fire("send", this, conn, o) === false) return this
 	        if (o.timeout > 0) {
 	            var startT = new Date()
 	            var h = setInterval(function () {
 	                if (c.isComplete)
 	                    clearInterval(h)
 	                else if ((new Date() - startT) >= o.timeout) {
 	                    clearInterval(h)
 	                    c.isTimeout = "timeout"
 	                    c.conn.abort()
 	                }
 	            }, 60);
 	        }

 	        conn.send(isGet ? null : o.dataEncode);
 	        if (!o.async) {
 	            c.stateChange()
 	            return this.getContent()
 	        }
 	        return this
 	    },
 	    createContext: function () {
 	        var context = { conn: this.connection, option: this.option, data: undefined, errMsg: undefined }
 	        var me = this, c = context;
 	        c.complete = function () {
 	            me.fire("complete", this, c.conn, c.data, c.option.status);
 	            me.fire("stop", this, c.conn, c.option);
 	        }

 	        c.stateChange = function () {
 	            me.fire("readystatechange", this, c.conn)
 	            if (!c.conn || c.conn.readyState === 0 || c.isTimeout === "abort") {
 	                if (!context.isComplete)
 	                    c.complete();

 	                c.isComplete = true;
 	                if (c.conn)
 	                    c.conn.onreadystatechange = $.emptyFun;
 	            }

 	            if (!c.isComplete && c.conn && (c.conn.readyState === 4 || c.isTimeout == "timeout")) {
 	                context.isComplete = true;
 	                c.conn.onreadystatechange = $.emptyFun;
 	                c.option.status = c.isTimeout === "timeout" ?
					    "timeout" :
					    !ajax.isSuccess(c.conn) ? "error" : "success";

 	                if (c.option.status === "success") {
 	                    try {
 	                        c.data = me.getContent();
 	                    } catch (ex) {
 	                        c.option.status = "parsererror";
 	                        errMsg = ex;
 	                    }
 	                }

 	                if (c.option.status === "success" || c.option.status === "notmodified")
 	                    me.fire("success", me, c.data, c.option.status, c.conn)
 	                else
 	                    me.fire("error", me, c.conn, c.option.status, c.errMsg)

 	                c.complete()
 	            }
 	        }
 	        return c;
 	    },
 	    /*  加载js脚本文件
 	    @url    :脚本文件地址
 	    @return :this
 	    */
 	    loadScript: function (url) {
 	        var head = doc.getElementsByTagName("head")[0] || docE;
 	        var e = doc.createElement("script");
 	        e.src = url;
 	        var option = this.option
 	        if (option.charset)
 	            e.charset = option.charset;
 	        var complete = false
 	        e.onload = e.onreadystatechange = function () {
 	            this.fire("readystatechange", this, e)
 	            if (!complete && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
 	                complete = true;
 	                this.fire("success", me, e)
 	                this.fire("complete", me, e, "success");
 	                e.onload = e.onreadystatechange = null;
 	                if (e.parentNode)
 	                    e.parentNode.removeChild(e);
 	            }
 	        };
 	        head.appendChild(e);
 	        return this;
 	    },
 	    /*  获取服务端输出内容
 	    @return :Object
 	    */
 	    getContent: function () {
 	        var conn = this.connection, option = this.option
 	        var dType = option.dataType || conn.getResponseHeader("content-type") || ""
 	        var isXml = /xml/i.test(dType)
 	        var data = isXml ? conn.responseXML : conn.responseText;

 	        if (isXml && data && data.documentElement && data.documentElement.nodeName === "parsererror")
 	            throw (option.status = "parsererror")

 	        if (option.dataHandler)
 	            data = option.dataHandler.call(this, data, option.dataType);

 	        if (typeof data === "string") {
 	            if (/json/i.test(dType))
 	                data = lib.Json.decode(data);
 	            else if (/script/i.test(dType))
 	                $.globalEval(data);
 	        }
 	        return data;
 	    },
 	    createConnecion: function () {
 	        if (win.XMLHttpRequest && (win.location.protocol !== "file:" || !win.ActiveXObject))
 	            this.connection = new XMLHttpRequest()
 	        else if (win.ActiveXObject)
 	            try {
 	                this.connection = new ActiveXObject("Msxml2.XMLHTTP");
 	            }
 	            catch (e) {
 	                this.connection = new ActiveXObject("Microsoft.XMLHTTP");
 	            }
 	    },
 	    parseSendData: function () {
 	        var data = this.option.data
 	        if (data == null) return this.option.dataEncode = "";
 	        var eName = this.option.jsonEncode ? "encode" : "urlEncode" ///POST/i.test(this.option.type)
 	        var buf = [];

 	        if ($.isObject(data)) {
 	            for (var k in data)
 	                buf.push(escape(k) + "=" + escape($.Json[eName](data[k])))
 	        }
 	        else if ($.likeArray(data)) {
 	            for (var i = 0; i < data.length; i++)
 	                buf.push(escape(this.option.parameterName.$format(i)) + "=" + escape($.Json[eName](data[i])))
 	        }

 	        return this.option.dataEncode = buf.join('&')
 	    },
 	    destroy: function () {
 	        this.destroy = null
 	        destroy(this.option)
 	        destroy(this)
 	    }
 	})


    ajax.isSuccess = function (conn) {
        try {
            var s = conn.status
            return !s && location.protocol === "file:" ||
				(s >= 200 && s < 300) ||
				s === 304 || s === 1223 || s === 0;
        } catch (e) { }

        return false;
    }

    $.each(ajax.Option, function (o, k) {
        ajax.Helper.prototype[k] = function (value) {
            this.option[k] = value
            return this;
        }

        ajax[k] = function (value) {
            var helper = $.is(this, ajax.Helper) ? this : new ajax.Helper()
            helper[k].apply(helper, arguments)
            return helper;
        }
    })

    $.each(ajax.Eevents, function (eName) {
        ajax[eName] = function (fn) {
            var helper = $.is(this, ajax.Helper) ? this : new ajax.Helper()
            helper[eName].apply(helper, arguments)
            return helper;
        }
    })

    $.post = ajax.post = function () {
        var helper = new ajax.Helper()
        return helper.post.apply(helper, arguments)
    }

    $.get = ajax.get = function () {
        var helper = new ajax.Helper()
        return helper.get.apply(helper, arguments)
    }
    ajax.destroy = destroy
    //#end


    //## fly.Cookie
    /*#C Cookie 工具类*/
    fly.lib.Cookie = fly.Cookie = $.extend(
	{
	    /*	设置Cookie
	    @name	:String cookie名
	    @value	:String cookie值
	    @expires:Date 过期时间
	    @path	:String 路径
	    @domain	:String 域
	    @secure	:Boolean 
	    @return	:fly.lib.Cookie
	    */
	    set: function (name, value, expires, path, domain, secure) {
	        var path = path == null ? '/' : path
	        doc.cookie = name + "=" + escape(value) + ((expires == null) ? "" : ("; expires=" + expires.toGMTString())) + ((path == null) ? "" : ("; path=" + path)) + ((domain == null) ? "" : ("; domain=" + domain)) + ((secure == true) ? "; secure" : "");
	        return lib.Cookie
	    },


	    /*	获取Cookie
	    @path	:String 路径
	    @name	:String cookie名
	    @return	:String cookie 值
	    */
	    get: function (path, name) {
	        var cookie = doc.cookie
	        if (name != null) {
	            var start = cookie.search(new RegExp(path + "=", "gi"));
	            if (start < 0)
	                return
	            cookie = doc.cookie.substr(start + path.length + 1).replace(/;.*/g, "");
	        }
	        else
	            name = path
	        var start = cookie.search(new RegExp(name + "=", "gi"));
	        if (start < 0)
	            return
	        cookie = cookie.substr(start + name.length + 1).replace(/&.*/g, "");
	        return unescape(cookie);
	    },


	    /*	删除 Cookie
	    @name	:String cookie名
	    @return	:fly.lib.Cookie
	    */
	    remove: function (name) {
	        if (Cookies.get(name))
	            doc.cookie = name + "=" + "; expires=Thu, 01-Jan-70 00:00:01 GMT";
	        return lib.Cookie
	    }
	}, lib.Cookie)
    //#end


    //## fly.ui.Style
    /* #C path:fly.ui.Style
    CSS 工具类
    */
    fly.ui.StyleUtils = function () {
        var me = this
        /*  加载CSS
        @url:String CSS文件地址
        @return:Element link元素
        */
        this.loadCss = function (url) {
            var el = doc.createElement("link");
            el.rel = "stylesheet"
            el.type = "text/css"
            el.href = url;
            (doc.getElementsByTagName("head")[0] || docE).appendChild(el)
            return el
        }

        this.defaultSheet = function () {
            return me.sheet || (me.sheet = me.createStyleSheet())
        }

        /*  创建CSS
        @cssText:String CSS内容
        @return :Element style元素
        */
        this.createStyleSheet = function (cssText) {
            var style
            if (doc.createStyleSheet) {
                (style = doc.createStyleSheet()).cssText = cssText;
                style.cssRules = style.rules
            }
            else {
                style = doc.createElement('style');
                style.type = 'text/css';
                try {
                    style.innerHTML = cssText || "";
                } catch (e) { }
                ; (doc.getElementsByTagName("head")[0] || docE).appendChild(style)
                style = style.sheet
                style.rules = style.cssRules
            }
            return style
        }

        /*  创建CSS类
        @sheet  :StyleSheet(可选) CSS元素
        @name   :String CSS类名
        @cssText:String CSS内容
        @return :StyleSheetRule CSS类
        */
        this.createCssRule = function (sheet, name, cssText) {
            if ($.isStr(sheet)) {
                cssText = name;
                name = sheet;
                sheet = null;
            }

            if (sheet == null) {
                document.styleSheets.length || this.createStyleSheet()
                sheet = document.styleSheets[document.styleSheets.length - 1]
            }

            try {
                sheet.addRule(name, cssText || " ")
            } catch (e) {
                sheet.insertRule("" + name + " { " + cssText + " }", sheet.cssRules.length);
            }
            return sheet.rules[sheet.rules.length - 1];
        }

        /*	获取元素当前样式
        @el		:Element 元素
        @return	:currentStyle
        */
        this.currentStyle = function (el) {
            return el.currentStyle || doc.defaultView.getComputedStyle(el, null)
        }

        /*	检测样式值
        @name	:String 样式名
        @value	:Object 样式值
        @return :Object 经处理过后的属性值
        */
        this.checkValue = function (name, value) {
            if ((value || value === 0) && /width|height|top|left|right|bottom|margin|padding/i.test(name)) {
                value = value.toString();
                if (value.indexOf('px') < 0 && value.indexOf('%') < 0)
                    value = value.replace(/[\d.]+/g, function ($1) {
                        return $1 + 'px'
                    })
            }
            return value
        }


        /*	获取元素样式
        @el		:Element 要获取样式的元素
        @name	:String 要设置的样式名
        @return	:String 属性值
        */
        this.get = function (el, n) {
            var camel = camelCase(n)
            if (me.setters[camel])
                return me.getters[camel](el, n)

            var currentStyle = me.currentStyle(el);
            var ret = currentStyle[camel] || currentStyle[n];
            if (!ret || ret == "auto" || /%$/.test(ret)) {
                ret = n == "width" ? el.offsetWidth :
                    n == "height" ? el.offsetHeight :
                        n == "left" ? el.offsetLeft :
                            n == "top" ? el.offsetTop : ret
            }
            return ret
        }

        /*	获取元素样式值
        @el		:Element 要获取样式的元素
        @name	:String 要设置的样式名
        @return	:Number 属性值
        */
        this.num = function (el, name) {
            return Number((me.get(el, name) + " ").replace(/[^\d-\.]/g, "")) || 0
        }

        /*	设置元素样式
        @el		:Element 被设置样式的元素
        @name	:String 要设置的样式名
        @value	:Object 样式值
        @return	:fly.ui.Style
        */
        this.set = function (el, name, value) {
            var camel = camelCase(name)
            if (me.setters[camel])
                me.setters[camel](el, name, value)
            else if (value == null)
                el.style[$.diffAttrs.styleRemoveMethod](camel)
            else
                el.style[camel] = me.checkValue(camel, value)

            return me
        }

        this.getters =
 		        {
 		            opacity: function (el, name) {
 		                var style = me.currentStyle(el)
 		                var value = 100;
 		                (el.style.filter || "").replace(/alpha\([^)]*(\d+)[^)]*\)/, function ($0, $1) {
 		                    value = parseInt($1)
 		                })
 		                return isNaN(value) ? 100 : value
 		            }
 		        }

        this.setters =
 		        {
 		            opacity: function (el, name, value) {
 		                value = parseInt(value)
 		                el.style.filter = (el.style.filter || "").replace(/alpha\([^)]*\)/, "") +
					        (isNaN(value) || isNaN == 100 ? "" : "alpha(opacity=" + value + ")");
 		            }
 		        }

        if (browser.isFirefox || browser.isOpera) {
            var bgp = "backgroundPosition"
            this.getters.backgroundPositionX = function (el, name, value) {
                return me.get(el, bgp).replace(/\s+.+$/, '')
            }
            this.getters.backgroundPositionY = function (el, name, value) {
                return me.get(el, bgp).replace(/^.+\s+/, '')
            }

            this.setters.backgroundPositionX = function (el, name, value) {
                me.set(el, bgp, value + " " + me.get(el, bgp + "Y"))
            }
            this.setters.backgroundPositionY = function (el, name, value) {
                me.set(el, bgp, me.get(el, bgp + "X") + " " + value)
            }
        }
    } .inherit(ui.StyleUtils);

    //样式处理
    fly.Style = fly.ui.Style = new ui.StyleUtils();
    var styleHelper = fly.ui.Style
    //#end


    //## fly.ui.DomHelper
    /*#C path:fly.ui.DomHelper
    Dom 工具类
    */
    fly.ui.DomUtils = function () {
        var $ab = "afterbegin", $ae = "afterend", $bb = "beforebegin", $be = "beforeend"
        var rTagName = /<([\w:]+)/
        var onlyTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/
        var sTagWraps = {
            option: [1, "<select multiple='multiple'>", "</select>"],
            legend: [1, "<fieldset>", "</fieldset>"],
            thead: [1, "<table>", "</table>"],
            tr: [2, "<table><tbody>", "</tbody></table>"],
            td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
            col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
            area: [1, "<map>", "</map>"],
            _default: [0, "", ""]
        };

        sTagWraps.optgroup = sTagWraps.option;
        sTagWraps.tbody = sTagWraps.tfoot = sTagWraps.colgroup = sTagWraps.caption = sTagWraps.thead;
        sTagWraps.th = sTagWraps.td;


        var me = this
        me.uniqueNumber = 1

        var emptyElement = doc.createElement('div')
        var getDom = this.getDom = function (obj) {
            return obj.dom || obj.single || (obj.$isElement ? obj[0] : obj);
        }


        var getOuter = this.getOuter = function (obj) {
            while (obj.getOuter)
                obj = obj.getOuter()

            while (obj.outer && obj.outer != obj)
                obj = obj.outer

            return getDom(obj);
        }


        var getInner = this.getInner = function (obj) {
            while (obj.getInner)
                obj = obj.getInner()
            while (obj.inner && obj.inner != obj)
                obj = obj.inner
            return getDom(obj);
        }

        /*	获取元素唯一ID
        @el	:Element Dom元素
        @return	:Int 元素ID
        */
        this.getUniqueID = function (el) {
            el = el == doc ? docE : el
            return el.uniqueNumber != undefined ? el.uniqueNumber : (el.uniqueNumber = "$" + me.uniqueNumber++)
        }

        /*	根据Html创建DOM元素
        @html	:String html字符串
        @return	:Element/Array<Element> 创建的DOM元素
        */
        this.create = function (html) {
            if (html === "" || html == null)
                return
            if (!$.isStr(html)) {
                if (!$.isStr(html = $.ifFun(html)))
                    return html
            }
            var tag = onlyTag.exec(html);

            if (tag) {
                return new Array(doc.createElement(tag[1]));
            }
            else if (!$.isHtml(html))
                return new Array(document.createTextNode(html));

            var tw, p = emptyElement, tag = rTagName.exec(html)
            if (tag && (tw = sTagWraps[tag[1].toLowerCase()])) {
                p.innerHTML = tw[1] + html + tw[2]
                var i = 0
                while (i++ < tw[0])
                    p = p.firstChild;
            }
            else {
                p.innerHTML = html;
            }

            var ret = p.childNodes.length > 1 ? $.toArray(p.childNodes) : new Array(p.childNodes[0])
            for (var i = p.childNodes.length - 1; i > -1; i--)
                p.removeChild(p.childNodes[i])
            return ret
        }


        /*	插入对象
        @pos	:String 插入位置(beforeBegin,afterBegin,beforeEnd,afterEnd)
        @parent	:Element 父元素
        @child	:Element/Array<Element> 子元素
        @returnDom:Boolean 是否返回DOM元素
        @return	:Element/Array returnDom等于true返回DOM对象，否则返回包含该元素的集合
        */
        this.doInsert = function (pos, parent, child, returnDom) {
            var res
            if ($.likeArray(parent)) {
                for (var i = 0; i < parent.length; i++)
                    res = arguments.callee(pos, parent[i], child, returnDom)
                return res;
            }

            if ($.likeArray(child)) {
                child = $.toArray(child)
                for (var i = 0; i < child.length; i++)
                    res = arguments.callee(pos, parent, child[i], returnDom)
                return res;
            }

            var p = getInner(parent);
            child = getOuter(child);

            var isHtml = $.isStr(child)

            if (p.insertAdjacentElement) {
                var inserted = false
                if (!isHtml && child.nodeName == '#text') {
                    if (pos == $be) {
                        p.appendChild(child)
                        inserted = true
                    }
                    else if (pos == $ab) {
                        p.insertBefore(child)
                        inserted = true
                    }
                    else {
                        isHtml = true;
                        child = child.nodeValue
                    }
                }
                if (inserted)
                    res = child;
                else
                    res = p[isHtml ? "insertAdjacentHTML" : "insertAdjacentElement"](pos, child)
            }
            else {
                var child = res = isHtml ? me.create(child) : child
                if ($.likeArray(child)) {
                    res = []
                    $.each(child, function (o) {
                        res.push(me.doInsert(pos, p, o))
                    })
                }
                else {
                    pos = pos.toLowerCase();
                    pos == $bb ? p.parentNode.insertBefore(child, p) :
                        pos == $ab ? p[p.firstChild ? "insertBefore" : "appendChild"](child, p.firstChild) :
                            pos == $be ? p.appendChild(child) :
                                p.nextSibling ? p.parentNode.insertBefore(child, p.nextSibling) : p.parentNode.appendChild(child);
                }
            }
            return returnDom == true ? res : $(res)
        }

        /* 在元素前插入对象
        @el	    :Element    在该元素前插入对象
        @child  :Element/Array<Element> 要插入的一个或多个Dom元素
        @returnDom:Boolean 是否返回DOM元素
        @return	:Element/Array returnDom等于true返回DOM对象，否则返回包含该元素的集合
        */
        this.insertBefore = function (el, child, returnDom) {
            return me.doInsert($bb, el, child, returnDom);
        }


        /* 在元素后插入对象
        @el	    :Element    在该元素后插入对象
        @child  :Element/Array<Element> 要插入的一个或多个Dom元素
        @returnDom:Boolean 是否返回DOM元素
        @return	:Element/Array returnDom等于true返回DOM对象，否则返回包含该元素的集合
        */
        this.insertAfter = function (el, child, returnDom) {
            return me.doInsert($ae, el, child, returnDom);
        }


        /* 在元素开始位置插入对象
        @el	    :Element    在该元素开始位置插入对象
        @child  :Element/Array<Element> 要插入的一个或多个Dom元素
        @returnDom:Boolean 是否返回DOM元素
        @return	:Element/Array returnDom等于true返回DOM对象，否则返回包含该元素的集合
        */
        this.insertFirst = function (el, child, returnDom) {
            return me.doInsert($ab, el, child, returnDom);
        }



        /* 将元素附加到一个对象结尾
        @el	    :Element    在该元素结束位置插入对象
        @child  :Element/Array<Element> 要插入的一个或多个Dom元素
        @returnDom:Boolean 是否返回DOM元素
        @return	:Element/Array returnDom等于true返回DOM对象，否则返回包含该元素的集合
        */
        this.append = function (el, child, returnDom) {
            return me.doInsert($be, el, child, returnDom);
        }

        /*	获取该Dom元素的子元素，不含 #text 
        @child	:要获取子元素的Dom元素
        @return	:Array 元素的所有子元素
        */
        this.children = function (child) {
            if (child.children || (e == doc ? (e = docE).children : false))
                return e.children
            return $.toArray(e.childNodes).where("o=>o.nodeType==1")
        }

        /*  将所有内容转移至另一个元素
        @from   :Element    将元素的所有内容移至另一个元素
        @to     :Element    将移至该元素
        @return :fly.ui.DomHelper   
        */
        this.moveContent = function (from, to) {
            if ($.likeArray(to))
                to = to[0]
            $.toArray(from).each(function (f) {
                if (f.childNodes)
                    this.doInsert($be, to, f.childNodes)
            }, this)
            return this;
        }

        /*  清空元素内容
        @el   :Element    将元素的所有内容移至另一个元素
        @return :fly.ui.DomHelper   
        */
        this.empty = function (el) {
            if (el) {
                var c;
                while (c = el.childNodes[0])
                    el.removeChild(c)
            }
            return this;
        }

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

        @el    :Element/String 要改变样式的DOM对象或字符串
        @removeCss  :String 要移除的样式,多个样式用空格隔开
        @addCss :String 要追加的样式,多个样式用空格隔开
        @return :String 改变后的样式
        */
        this.changeClass = function (el, removeCss, addCss) {
            if (el.isIList) {
                $.each(el, function (o) {
                    dh.changeClass(o, removeCss, addCss)
                })
                return;
            }

            var isStr = typeof (el) == "string"
            var old = isStr ? el : el.className;
            var c = removeCss ? this.removeClass(old, removeCss) : old;
            c = addCss ? this.addClass(c, addCss) : c;
            !isStr && c != old && (el.className = c)
            return c;
        }

        /*	添加CSS样式
        @el    :Element DOM 元素
        @css	:String 要添加的CSS名称
        @return	:String 改变后的样式
        */
        this.addClass = function (el, css) {
            if (el.isIList) {
                $.each(el, function (o) {
                    dh.addClass(o, css)
                })
                return;
            }

            var isStr = typeof (el) == "string"
            if (!isStr && el.className == undefined)
                return css

            var old = (isStr ? el : el.className).replace(/^ +| +$/g, "");
            if (old == "") {
                isStr || (el.className = css)
                return css
            }

            var c = " " + old + " ";
            css.replace(/\S+/g, function (o) {
                if (c.indexOf(' ' + o + ' ') < 0)
                    c += " " + o;
            });
            c = c.replace(/ +/g, " ").replace(/^ +| +$/g, "");
            !isStr && c != old && (el.className = c)
            return c;
        }

        /*	移除CSS样式
        @el    :Element DOM 元素
        @css	:String 要移除的CSS名称
        @return	:String 改变后的样式
        */
        this.removeClass = function (el, css) {
            if (el.isIList) {
                $.each(el, function (o) {
                    dh.removeClass(o, css)
                })
                return this;
            }

            var isStr = typeof (el) == "string"
            if (!isStr && el.className == undefined)
                return css
            var old = (isStr ? el : el.className).replace(/^ +| +$/g, "");
            if (old == "") return "";

            var c = " " + old.replace(/\s/g, '  ') + " ";
            css.replace(/\S+/g, function (o) {
                c = c.replace(new RegExp("\\s" + o + "\\s", "g"), " ");
            });
            c = c.replace(/ +/g, " ").replace(/^ +| +$/g, "");
            !isStr && c != old && (el.className = c)
            return c;
        }

        /*	是否包含某一CSS名称
        @el    :Element DOM 元素
        @css	:String 要检测的CSS名称
        @return	:Boolean
        */
        this.hasClass = function (el, css) {
            if (arguments.length == 1)
                css = el, el = this;
            el.isIList && (el = el.item(0))
            return el && el.className.contains(css, false, ' ')
        }

        /*  克隆元素
        @el     :Element    要克隆的元素
        @return :Element    克隆产生的新元素
        */
        this.clone = function (el) {
            return el.cloneNode();
        }

        /*  转换为HTML
        @el :Element    Html元素
        @return :String 元素的HTML
        */
        this.toHtml = function (el) {
            if (el.isIList) {
                return el.select(me.toHtml).join("");
            }
            return el.outerHTML;
        }

        if (doc.compareDocumentPosition)
        /*  检测元素是否包含另一个元素
        @parent :Element   上级元素
        @child  :Element   子元素
        @return :Boolean    当parent包含child时返回true,否则返回false
        */
            this.contains = function (parent, child) {
                return !!(parent.compareDocumentPosition(child) & 16);
            }
        else
            this.contains = function (parent, child) {
                return parent !== child && (parent.contains ? parent.contains(child) : true);
            }

        /*  检测某元素是否可以获取焦点
        @el :Element    要检测的元素
        @return :Boolean    可以获取焦点返回 true,否则返回 false
        */
        this.focusable = function (el) {
            var el2 = el
            if (el2.disabled)
                return false
            var nodeName = el2.nodeName
            var tabIndex = me.tabIndex(el2);
            if (!isNaN(tabIndex) || $.foucsableTypeRegs.test(nodeName) || ($.clickableTypeRegs.test(nodeName) && el2.href)) {
                if ([el]['AREA' == nodeName ? 'parents' : 'closest'](':hidden').length == 0)
                    return true
            }
            return false
        }

        /*  检测元素是否接受Tab键
        @el     :Element    要检测的元素
        @return :Boolean    可以接受Tab键则返回 true,否则返回 false
        */
        this.tabbable = function (el) {
            var tabIndex = me.tabIndex(el);
            return (isNaN(tabIndex) || tabIndex >= 0) && me.focusable(el)
        }

        /*  元素是否可见（visibility）
        @el     :Element    DOM元素
        @return :Boolean
        */
        this.isVisible = function (el) {
            return styleHelper.get(el, 'visibility') !== "hidden"
        }

        /*  元素是否显示（display）
        @el     :Element    DOM元素
        @return :Boolean
        */
        this.isDisplay = function (el) {
            return styleHelper.get(el, 'display') !== 'none'
        }

        /*  元素是否被隐藏（visibility、display）
        @el     :Element    DOM元素
        @return :Boolean
        */
        this.isHidden = function (el) {
            return (el.nodeName === 'INPUT' && el.type === 'hidden') || !me.isDisplay(el) || !me.isVisible(el)
        }

        /*  获取元素的   tabindex
        @el     :Element    DOM元素
        @return :Int
        */
        this.tabIndex = $.attrGeters.tabindex = function (el) {
            var node = el.getAttributeNode("tabindex");
            if (node != null && node.specified)
                return node.value;
            return $.foucsableTypeRegs.test(el.nodeName) || ($.clickableTypeRegs.test(el.nodeName) && el.href) ? 0 : undefined;
        }

        /*  取消页面的选择
        @return :this
        */
        this.unSelection = function () {
            try {
                if (document.selection)
                    document.selection.empty()
                else
                    win.getSelection().removeAllRanges();
            } catch (e) { }
            return this
        }
        /*  获取元素在页面中的位置和大小
        @el     :Element    DOM元素
        @return :Json   包含元素在页面中的位置和大小信息的Json对象
        */
        this.rect = function (el) {
            var pos = { top: el.offsetTop, left: el.offsetLeft, width: el.offsetWidth, height: el.offsetHeight }
            var rect = el.getBoundingClientRect ? el.getBoundingClientRect() : (el.getClientRects ? el.getClientRects() : null)
            if (rect) {
                pos.top = rect.top;
                pos.left = rect.left;
                return pos;
            }

            while (el = el.offsetParent) {
                pos.top += el.offsetTop;
                pos.left += el.offsetLeft;
            }
            return pos
        }
        this.show = function (el) {
            var d = styleHelper.get(el, "display")
            d == "none" && styleHelper.set(el, "display", styleHelper.get(document.createElement(el.nodeName), "display"))

            var d = styleHelper.get(el, "visibility")
            d == "hidden" && styleHelper.set(el, "visibility", "visible")
            return this
        }

    } .inherit(ui.DomUtils)
    fly.DomHelper = fly.ui.DomHelper = new ui.DomUtils()
    dh = fly.ui.DomHelper
    //#end


    //## fly.collection.IList
    /*#C path:fly.collection.IList
    用来扩展 collection 对象
    */
    fly.collection.IList = fly.fn = qp = {
        $: $,
        find: $,
        allTypes: [],
        /* 扩展 fly.collection.IList 成员
        @name   :String/Json 成员名称或包含多个成员的键值对
        @v     :Function/Object 成员
        */
        extend: function (name, v) {
            var i = $.isStr(name)
            i ? this[name] = v : $.extend(this, name)
            if (this == qp)
                $.each(qp.allTypes, function (t) {
                    i ? (t.prototype || t)[name] = v : $.extend(t.prototype || t, name)
                });
            return this
        },

        applyTo: function ($class, overrides) {
            if (this == qp)
                qp.allTypes.push($class)
            var to = $class.prototype || $class
            $.safeExtend("$", to, this)
            for (var i = 1; i < arguments.length; i++)
                $.extend(to, arguments[i])
            to.$ = this.$
            to.$type = $class
            return this
        },

        /*	Class 原始类型*/
        $type: null,

        /*	创建新的实例
        @arr	:Array 初始元素
        @return	:IList IList新对象
        */
        $create: function (arr) {
            return new this.$type(arr)
        },

        /*	Boolean fly.collection.IList标识*/
        isIList: true,

        /*	获取可遍历的对象
        @obj:如果传递该参数，这获取该对象的可遍历对象，否则返回当前对象的可遍历对象
        @return:Array
        */
        getItems: function (obj) {
            if (arguments.length == 1) {
                obj.getItems && (obj = obj.getItems())
                return $.toArray(obj)
            }
            return this.items || this
        },

        /*	更新长度
        @return	:this
        */
        updateLength: function () {
            this.items && (this.length = this.items.length)
            return this
        },

        /*	获取指定位置的项
        @index	:Int 从0开始的索引
        @return :Object
        */
        item: function (index) {
            return this.getItems()[index]
        },

        //##
        /*	生成一个新IList对象,将每一项中的项合并
        @evaluator:计算值的函数
        @scope  :域
        @params	:Object(可选) 可变参数，要传递的任意多个参数,
        @return	:IList
        */
        selectMany: function (evaluator, scope, params) {
            this._select.__collect = function (r, o) {
                o && r.merge(o);
            }
            return this._select.apply(this, arguments)
        },

        /*	生成一个新IList对象,忽略空值
        @evaluator:计算值的函数
        @scope  :域
        @params	:Object(可选) 可变参数，要传递的任意多个参数,
        @return	:IList
        */
        selectNotNull: function (evaluator, scope, params) {
            this._select.__collect = function (r, o) {
                o && r.push(o);
            }
            return this._select.apply(this, arguments)
        },

        /*	生成一个新IList对象
        @evaluator:计算值的函数
        @scope  :域
        @params	:Object(可选) 可变参数，要传递的任意多个参数,
        @return	:IList
        */
        select: function (evaluator, scope, params) {
            this._select.__collect = function (r, o) {
                r.push(o);
            }
            return this._select.apply(this, arguments)
        },
        _select: function (evaluator, scope, params) {
            var col = arguments.callee.__collect, r = [], all = this.getItems ? this.getItems() : this
            var fn = $.toFun(evaluator, true), isFun = $.isFun(fn), as = arguments, hasArg = as.length > 2
            if (as.length > 11)
                var args = arrP.slice.call(as, 2)
            else if (hasArg)
                var p2 = as[2], p3 = as[3], p4 = as[4], p5 = as[5], p6 = as[6], p7 = as[7], p8 = as[8], p9 = as[9], p10 = as[10]
            if ($.likeArray(all)) {
                for (var i = 0, len = all.length; i < len; i++) {
                    var o = all[i]
                    col(r, isFun ? (hasArg ? (args != null ? fn.apply(scope || o, [o, i, all].concat(args)) : fn.call(scope || o, o, i, all, p2, p3, p4, p5, p6, p7, p8, p9, p10)) : fn.call(scope || o, o, i, all)) : fn);
                }
            }
            else {
                for (var i in all) {
                    var o = all[i]
                    col(r, isFun ? (hasArg ? (args != null ? fn.apply(scope || o, [o, i, all].concat(args)) : fn.call(scope || o, o, i, all, p2, p3, p4, p5, p6, p7, p8, p9, p10)) : fn.call(scope || o, o, i, all)) : fn);
                }
            }
            return this.create ? this.create(r) : r
        },



        /*	从序列的开头返回指定数量的连续元素
        @count:int 要获取的数量，可以是负整数。
        isAssending	: Boolean 是否升序
        @predicate	:Function/String/Object 用于测试每个元素是否满足条件的函数。
        @params	:Object(可选) 可变参数，要传递的任意多个参数
        @return	:IList
        */
        take: function (count, isAscending, predicate, params) {
            this.___count = count
            this.___isAsc = isAscending
            return (this.___take || qp.___take).apply(this, arrP.slice.call(arguments, 2))
        },
        ___take: function (predicate, params) {
            var r = [], all = this.getItems ? this.getItems() : this

            if (all.length > 0) {
                var c = this.___count;
                c = c < 0 ? this.length + c : c
                var isAsc = this.___isAsc;
                var isNot = this.___isNot == true
                var as = arguments
                var hasArg = as.length > 1
                if (as.length > 11)
                    var args = arrP.slice.call(as, 1)
                else if (hasArg)
                    var p1 = as[1], p2 = as[2], p3 = as[3], p4 = as[4], p5 = as[5], p6 = as[6], p7 = as[7], p8 = as[8], p9 = as[9], p10 = as[10]
                var fn = $.toFun(predicate, true)
                if (fn === undefined)
                    fn = true
                var isFun = $.isFun(fn)

                var step = isAsc != false ? 1 : -1
                for (var i = (isAsc != false ? 0 : all.length - 1), end = (isAsc != false ? all.length : -1); i != end && (c == null || r.length < c); i += step) {
                    var o = all[i];
                    if (isNot ^ !!(isFun ? (hasArg ? (args != null ? fn.apply(o, [o, i, all].concat(args)) : fn.call(o, o, i, all, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10)) : fn.call(o, o, i, all)) : fn))
                        r.push(o);
                }
            }
            delete this.___count
            delete this.___isAsc
            delete this.___isNot
            return this.create ? this.create(r) : r
        },
        //#end

        //## 遍历所有项
        /*	遍历所有项
        @action	:Function/String/Object 处理每一项的回调函数
        @params	:Object(可选) 可变参数，要传递的任意多个参数
        @return	:this
        */
        each: function (action, scope, params) {
            var fn = $.toFun(action, true)
            if (!$.isFun(fn))
                return this
            var as = arguments
            var hasArg = as.length > 2
            if (as.length > 11)
                var args = arrP.slice.call(as, 2)
            else if (hasArg)
                var p2 = as[2], p3 = as[3], p4 = as[4], p5 = as[5], p6 = as[6], p7 = as[7], p8 = as[8], p9 = as[9], p10 = as[10]

            var all = this.getItems ? this.getItems() : this
            function e(o, i) {
                return !hasArg ? fn.call(scope || o, o, i, all) : args != null ? fn.apply(scope || o, [o, i, all].concat(args)) : fn.call(scope || o, o, i, all, p2, p3, p4, p5, p6, p7, p8, p9, p10)
            }

            if ($.likeArray(all)) {
                for (var i = 0; i < all.length; i++)
                    if (e(all[i], i) == $.BREAK) break;
            }
            else {
                for (var i in all)
                    if (e(all[i], i) == $.BREAK) break;
            }
            return this;
        },
        //#end


        /*	得到一个不重复的集合
        comparer:Function 一个对值进行比较的相等比较器
        @return	:IList
        */
        uniquelize: function (comparer) {
            var r = [];
            this.$each(function (o) {
                r.contains(o, comparer) || r.push(o)
            })
            return this.create ? this.create(r) : r
        },

        /*	返回不在指定集合中的元素
        @list :用来比较的另一个集合
        @comparer:Function 一个对值进行比较的相等比较器
        @return	:IList 
        */
        notIn: function (list, comparer) {
            return this.where(function (o) {
                return list.indexOf(o, 0, comparer) < 0
            })
        },


        /*	返回两个集合的交集
        @list :用来求交集的另一个集合
        @comparer:Function 一个对值进行比较的相等比较器
        @return	:IList 连个集合的交集
        */
        intersect: function (list, comparer) {
            return this.where(function (o) {
                return list.indexOf(o, 0, comparer) > -1
            })
        },

        /*	转换为Json
        @keySelector	:Function 用于从每个元素中提取键的函数。
        @valueSelector	:Function 用于从每个元素产生结果元素值的转换函数。
        return :Json
        */
        toJson: function (keySelector, valueSelector) {
            var j = {};
            keySelector = $.toFun(keySelector, true)
            valueSelector = $.toFun(valueSelector, true)
            if (keySelector == null && valueSelector == null) {
                var all = this.getItems()
                arrP.push.apply({}, all)
                return j
            }
            this.$each(function (o, i, all) {
                var v, k = keySelector == null ? i : keySelector.call(o, o, i, all);
                if (k == $.BREAK || (v = valueSelector == null ? o : valueSelector.call(o, o, i, all) == $.BREAK))
                    return $.BREAK;
                j[k] = v;
            })
            return j
        },

        /*	为每一项添加事件
        @eNames	:Object/Array<Object> 一个或多个事件类型
        @actions	:Function/Array<Function> 一个或多个回调函数
        @data	:要传递的数据
        @return:this
        */
        on: function (eNames, actions, data) {
            $.Event.on.apply($.Event, [this.getItems()].merge(arguments));
            return this;
        },


        /*	为每一项卸载事件
        eNames	:Object/Array<Object> 一个或多个事件类型
        actions	:Function/Array<Function> 一个或多个回调函数
        @return:this
        */
        un: function (eNames, actions) {
            $.Event.un.apply($.Event, [this.getItems()].merge(arguments));
            return this;
        },

        /*	为每一项卸载事件
        eNames	:Object/Array<Object> 一个或多个事件类型
        actions	:Function/Array<Function> 一个或多个回调函数
        @return:this
        */
        fire: function (eNames, params) {
            $.Event.fire.apply($.Event, [this.getItems()].merge(arguments));
            return this;
        },
        /*  排序
        @dir    :Boolean/String 排序方向,false,"DESC" 表示降序,其它标识升序
        @compare:Object/Function 排序比较规则,可以是一个字段名字,可以是一个函数
        */
        sort: function (dir, compare) {
            if (compare != null && !$.isFun(compare)) {
                var by = compare;
                compare = function (a, b) {
                    var va = a[by], vb = b[by]
                    return va == vb ? 0 : va > vb ? 1 : -1;
                }
            }
            arrP.sort.call(this, $.isFun(compare) ? compare : null);
            (dir == false || /desc/i.test(dir)) && arrP.reverse.call(this)
            return this
        },

        //## 其他
        /*	添加到集合后面
        @item	:Object 要添加的新项
        @return:this
        */
        add: function (item) {
            return this.addRange(item)
        },

        //## 其他
        /*	批量添加到集合后
        @items	:Array 要添加的新项
        @return:this
        */
        addRange: function (items) {
            var all = this.getItems()
            arrP.push.apply(all, $.likeArray(items) ? $.toArray(items) : arguments)
            this.updateLength()
            return this;
        },


        /*	插入
        @index	:Int 插入的目标位置(从0开始)
        @items	:Array(可选) 要插入的任意多个项
        @return:this
        */
        insert: function (index, items) {
            if (arguments.length > 1) {
                var all = this.getItems()
                arrP.splice.apply(all, [index < 0 ? all.length + index : index, 0].concat($.likeArray(items) ? $.toArray(items) : arrP.slice.call(arguments, 1)))
                this.updateLength()
            }
            return this;
        },


        /*	删除
        @index	:Int 要删除的目标位置(从0开始)
        @items	:Array(可选) 在该位置插入的任意多个项
        @return:this
        */
        remove: function (index, items) {
            if (arguments.length > 0) {
                if ($.likeArray(index)) {
                    var indexs = $.toArray(index).uniquelize()
                    indexs.sort()
                    for (var i = indexs.length - 1; i > -1; i--)
                        this.remove(indexs[i])
                }
                else {
                    var all = this.getItems()
                    index = index < 0 ? all.length + index : index
                    all[index] = null;
                    arguments.length > 1 ? arrP.splice.apply(all, [index, 1].concat(items)) : arrP.splice.call(all, index, 1)
                }
                this.updateLength()
                return this;
            }
            else {
                this.$each(function (o) {
                    if (o && o.parentNode)
                        o.parentNode.removeChild(o);
                })
            }
            return this;
        },


        /* 搜索第一个匹配项在集合中的索引
        @value	:搜索的值
        @startIndex:Int 开始位置
        @endIndex   :Int 结束位置
        @comparer:Function/String/Object 一个对值进行比较的相等比较器
        @return	:Int 如果找到 item 的第一个匹配项，则为该项的从零开始的索引；否则为 -1。
        */
        indexOf: function (item, startIndex, endIndex, comparer) {
            var all = this.getItems ? this.getItems() : this
            var c = comparer ? $.toFun(comparer) : null
            startIndex = endIndex || 0
            endIndex = endIndex || all.length - 1
            for (var i = startIndex; i <= endIndex; i++)
                if (c == null ? all[i] == item : c.call(all[i], all[i], item, all))
                    return i;
            return -1
        },

        /* 搜索最后一个匹配项在集合中的索引
        @value	:搜索的值
        @startIndex:Int 开始位置
        @comparer:Function/String/Object 一个对值进行比较的相等比较器
        @return	:Int 如果找到 item 的最后一个匹配项，则为该项的从零开始的索引；否则为 -1。
        */
        lastIndexOf: function (item, startIndex, endIndex, comparer) {
            var all = this.getItems ? this.getItems() : this
            var c = comparer ? $.toFun(comparer) : null
            startIndex = endIndex || 0
            endIndex = endIndex || all.length - 1
            for (var i = endIndex; i >= startIndex; i--)
                if (c == null ? all[i] == item : c.call(all[i], all[i], item, all))
                    return i;
            return -1
        },
        /*
        //	    @predicate	:Function/String/Object 用于测试每个元素是否满足条件的函数。
        //	    */
        //	    findIndex: function (predicate, startIndex, endIndex, comparer) {
        //	        var fn = $.toFun(predicate)
        //	        return this.indexOf(null, startIndex, endIndex, function (o1, o2, a) {
        //	            var o = fn.call(o1, o1)
        //	            return comparer ? comparer.call(o1, o1, o, a) : o
        //	        })
        //	    },

        //	    /*
        //	    @predicate	:Function/String/Object 用于测试每个元素是否满足条件的函数。
        //	    */
        //	    findLastIndex: function (predicate, startIndex, endIndex, comparer) {
        //	        var fn = $.toFun(predicate)
        //	        return this.lastIndexOf(null, startIndex, endIndex, function (o1, o2, a) {
        //	            var o = fn.call(o1, o1)
        //	            return comparer ? comparer.call(o1, o1, o, a) : o
        //	        })
        //	    },


        /* 判断值在集合中是否存在
        @value	:搜索的值
        @startIndex:Int 开始位置
        @comparer:Function/String/Object 一个对值进行比较的相等比较器
        @return	:Boolean
        */
        contains: function (value, startIndex, comparer) {
            return this.indexOf(value, startIndex, comparer) > -1
        },


        /*	复制到新的数组
        @index	:Int 插入目标位置(0开始)
        @arr	:Array 复制到该数组,为空将生成新的数组
        @return	:arr
        */
        copyTo: function (index, arr) {
            arrP.splice.apply(arr || (arr = []), [index, 0].concat(this.getItems()))
            return arr;
        },

        /*	复制
        @index	:Int 插入目标位置(0开始)
        @arr	:Array 复制到该数组,为空将生成新的数组
        @return	:arr
        */
        copy: function (start, end) {
            var arr = arrP.slice.apply(this.getItems(), [start || 0, end == null ? this.length : end])
            return this.create ? this.create(arr) : arr
        },


        /*  合并多个对象
        @params  :Object(可选) 可变参数，任意多个对象
        @return:this
        */
        merge: function (params) {
            var all = this.getItems()
            for (var i = 0; i < arguments.length; i++)
                arrP.push.apply(all, qp.getItems(arguments[i]))
            return this
        },


        /*  设置对象属性
        @properties  :Object 包含多个属性和属性值的键值对
        @return:this
        */
        //	    setAttr: function (properties) {
        //	        this.$each(function (o) {
        //	            $.set(o, properties)
        //	        })
        //	        return this
        //	    },
        //#end


        /*	获取或设置对象的Css属性，只传递 name 参数时则，获取该属性值。
        @name	:String 属性名或要应用到对象Css属性的键值对
        @value	:Object(可选) Css属性值
        @return:this
        */
        css: function (name, value) {
            if (this.length == 0)
                return this
            if (arguments.length == 1 && $.isStr(name))
                return styleHelper.get(this.item(0), name)

            if (arguments.length > 1)
                this.$each(function (o) {
                    styleHelper.set(o, name, value)
                })
            else
                this.$each(function (o) {
                    for (var p in name)
                        styleHelper.set(o, p, name[p])
                })
            return this
        },

        numCss: function (name) {
            var v = Number((this.css(name) + " ").replace(/[^\d-\.]/g, ""))
            return isNaN(v) ? v : 0
        },

        /*	获取或设置对象的属性，只传递 name 参数时则，获取该属性值。
        @name	:String 属性名或要应用到对象属性的键值对
        @value	:Object(可选) 属性值
        @return	:this
        */
        data: function (name, value) {
            if (arguments.length == 1 && $.isStr(name))
                return this.length == 0 ? null : this.item(0)[name];


            if (arguments.length > 1)
                this.$each(function (o) {
                    this[name] = value
                })
            else
                this.$each(function (o) {
                    for (var p in name)
                        o[p] = name[p]
                })
            return this
        },

        /*	获取或设置对象的属性，只传递 name 参数时则，获取该属性值。
        @name	:String 属性名或要应用到对象属性的键值对
        @value	:Object(可选) 属性值
        @return	:this
        */
        attr: function (name, value) {
            if (arguments.length == 1 && $.isStr(name))
                return this.length == 0 ? null : $.attr(this.item(0), name);

            if (arguments.length > 1)
                this.$each(function (o) {
                    $.attr(o, name, value)
                })
            else
                this.$each(function (o) {
                    for (var p in name)
                        $.attr(o, p, name[p])
                })
            return this
        },


        /*	移除对象属性
        @name	:String 要移除的属性名
        @return	:this
        */
        removeAttr: function (name) {
            this.each(function () {
                if (this.removeAttribute) {
                    try {
                        this.removeAttribute(name)
                    } catch (e) { }
                }
                try {
                    delete this[name]
                } catch (e) { }
            })
            return this
        },

        /*  获取或设置多个表单元素值
        @values :KeyValue(可选) 设置到多个表单元素的值,为空则是获取表单元素值
        @ignoreDisabled:是否忽略已禁用元素
        */
        values: function (values, ignoreDisabled) {
            var boxs = this.filter(":input").merge(this.find(":input"));
            if (values && !$.isBoolean(values)) {
                boxs.each(function (o) {
                    var k = this.name || this.id
                    if (k in values)
                        $.value(o, values[k]);
                })
                return this;
            }
            else {
                var vs = {}, hasSubmit
                $.isBoolean(values) && (ignoreDisabled = values)
                boxs.each(function () {
                    var k = this.name || this.id
                    var t = this.type
                    if (!k || (ignoreDisabled != false && this.disabled) || /file|undefined|reset|button/i.test(t)) return;
                    if ((/radio|checkbox/i.test(t) && !this.checked) || (t == 'submit' && hasSubmit)) return;
                    hasSubmit = hasSubmit || t == 'submit'
                    var v = $.value(this)
                    //	                if (values === true)
                    //	                    vs[k] = $.likeArray(v) ? v[v.length - 1] : v;
                    //	                else
                    k in vs ? ($.isArray(vs[k]) ? vs[k].push(v) : vs[k] = [vs[k], v]) : vs[k] = v
                })
                return vs;
            }
        },
        /*  获取或设置value，不指定value参数时则获取
        @value  :Object 设置的值
        @return :Object/this    当不指定value参数时返回第一个元素的值，指定value参数时则返回当前对象
        */
        value: function (value) {
            if (arguments.length == 0) {
                var first = this.getItems()[0]
                return first ? $.value(first) : null
            }

            this.each(function (b, i) {
                $.value(this, value)
                return this;
            })
        },

        /*  将所以元素值进行url编码
        @return :String
        */
        serialize: function () {
            return lib.Json.urlEncode(this.values())
        },

        /*  指定元素是否当前元素的子元素
        @child  :Selector/Element   子元素
        @return :Boolean 
        */
        hasChild: function (child) {
            child = $(child)
            return this.first(function (p) {
                return child.first(function (c) {
                    return !ui.DomHelper.contains(p, c);
                }).length != 0;
            }).length == 0;
        },

        /*  指定元素是否当前元素的父元素
        @parent  :Selector/Element   父元素
        @return :Boolean 
        */
        hasParent: function (parent) {
            return $(parent).isChild(this);
        },

        /*  改变每一项的样式
        @removeCss  :String 要移除的样式,多个样式用空格隔开
        @addCss :String 要追加的样式,多个样式用空格隔开
        @return :String 改变后的样式
        */
        changeClass: function (removeCss, addCss) {
            dh.changeClass(this, removeCss, addCss);
            return this
        },


        /*	为每一项添加CSS样式
        @css	:String 要添加的CSS名称
        @return	:this
        */
        addClass: function (css) {
            dh.addClass(this, css);
            return this
        },

        /*	为每一项移除CSS样式
        @css	:String 要移除的CSS名称
        @return	:this
        */
        removeClass: function (css) {
            dh.removeClass(this, css)
            return this
        },

        /*	第一项是否包含某一CSS名称
        @css	:String 要检测的CSS名称
        @return	:this
        */
        hasClass: function (css) {
            var first = this.item(0)
            if (first)
                return dh.hasClass(first, css)
            return false
        },

        /*  转换为HTML
        @return :String 
        */
        toHtml: function () {
            return dh.toHtml(this)
        },

        /*  克隆元素
        @return :Element
        */
        clone: function () {
            var ne = this.create();
            this.each(function () {
                ne.add(this.cloneNode())
            })
            return ne;
        },

        /*  获取第一个元素在页面中的位置和大小
        @return :Json   包含元素在页面中的位置和大小信息的Json对象
        */
        rect: function () {
            return dh.rect(this.item(0))
        },

        /*	获取第一项的偏移量
        @return	:Json   形如{left:123,top:456}
        */
        pos: function () {
            var el=this.item(0),s=ui.Style
            return {
                left: s.num(el, "left") || 0,
                top: s.num(el, "top") || 0,
                bottom: s.num(el, "bottom") || 0,
                right: s.num(el, "right") || 0
            }
        },

        /*	获取第一项的偏移量
        @return	:Json   形如{left:123,top:456}
        */
        offset: function () {
            var i = this.item(0)
            return {
                height: i.offsetHeight,
                width: i.offsetWidth,
                left: parseInt(this.left()) || i.offsetLeft,
                top: parseInt(this.top()) || i.offsetTop,
                bottom: parseInt(this.bottom()) || 0,
                right: parseInt(this.right()) || 0
            }
        },

        /*	获取第一项的大小
        @return	:Json   形如{width:123,height:456}
        */
        size: function () {
            return {
                width: parseInt(this.width()) || this.item(0).offsetWidth,
                height: parseInt(this.height()) || this.item(0).offsetHeight
            }
        },

        /*	移除焦点
        @return	:this
        */
        blur: function (delay, fn) {
            if ($.isNumber(delay) || arguments.length == 0) {
                return this.$each(function () {
                    var o = this
                    if (delay != null) {
                        setTimeout(function () {
                            o.blur && o.blur();
                            fn && fn.call(o, o);
                        }, delay)
                    }
                    else {
                        o.blur && o.blur();
                        fn && fn.call(o, o);
                    }
                })
            }
            else
                return this.on.apply(this, arrP.concat.apply(["blur"], arguments))
        },

        /*	设置焦点
        @return	:this
        */
        focus: function (delay, fn) {
            if ($.isNumber(delay) || arguments.length == 0) {
                return this.$each(function () {
                    var o = this
                    if (delay != null) {
                        setTimeout(function () {
                            o.focus && o.focus();
                            fn && fn.call(o);
                        }, delay)
                    }
                    else {
                        o.focus && o.focus();
                        fn && fn.call(o);
                    }
                })
            }
            else
                return this.on.apply(this, arrP.concat.apply(["focus"], arguments))
        },

        //        zIndex: function (zIndex) {
        //            if (arguments.length > 0)
        //                return this.css('zIndex', zIndex);

        //            var el = this.first(),pos,v = 0;
        //            while (el.length && el[0] !== doc) {
        //                pos = el.css('position');
        //                if (pos == 'absolute' || pos == 'relative' || pos == 'fixed') {
        //                    v = parseInt(el.css('zIndex'));
        //                    if (!isNaN(v) && v != 0)
        //                        return v;
        //                }
        //                el = el.parent();
        //            }
        //            return 0;
        //        },
        /*	检测第一个元素是否可以获取焦点
        @return	:Boolean
        */
        focusable: function () {
            return this.length && dh.focusable(this.item(0))
        },

        /*	检测第一个元素是否可以接受Tab键
        @return	:Boolean
        */
        tabbable: function () {
            return this.length && dh.tabbable(this.item(0))
        },
        /*	为每一个元素追加内容
        @el     :Html/Element   附加的内容
        @return	:this
        */
        append: function (el, returnDom) {
            dh.append(this, el)
            return this
        },
        /*	将所有元素追加到指定元素
        @to     :Element   将附加到该元素下
        @return	:this
        */
        appendTo: function (to, returnDom) {
            dh.append(to, this)
            return this
        },
        /*	将元素开始位置追加内容
        @content     :Element/String   追加的内容
        @return	:this
        */
        prepend: function (content) {
            dh.insertFirst(this, content)
            return this
        },
        /*	将所有元素追加到指定元素开始位置
        @to     :Element   将追加到该元素下
        @return	:this
        */
        prependTo: function (to) {
            dh.insertFirst(to, this)
            return this
        },
        /*	删除每个元素的所有子节点。 
        @return	:this
        */
        empty: function () {
            return this.$each(function (o) {
                dh.empty(o);
            })
        },
        /*  在每个元素之前插入内容。 */
        before: function (el) {
            dh.insertBefore(this, el)
            return this
        },
        /*  在每个元素之后插入内容。 */
        after: function (el) {
            dh.insertAfter(this, el)
            return this
        },
        /*把所有匹配的元素插入到另一个、指定的元素集合的前面。*/
        insertBefore: function (el) {
            dh.insertBefore(el, this)
            return this
        },

        /*把所有匹配的元素插入到另一个、指定的元素集合的后面。*/
        insertAfter: function (el) {
            dh.insertAfter(el, this)
            return this;
        },
        /*结束最近的“破坏性”操作，把匹配的元素列表回复到前一个状态。*/
        end: function () {
            return this.context || []
        },

        destroy: function () {
            var all = this.getItems()
            for (var i = all.length - 1; i > -1; i--) {
                all[i] = null;
                arrP.pop.call(all)
            }
            this.items = this.all = null;
        }
    }
    //#end
    ; (function () {
        var style = docE.style;
        var getCssMethod = function (name) {
            return function (v) {
                return arguments.length > 0 ? this.css(name, v) : this.css(name)
            }
        }

        var style = "border,borderWidth,borderColor,borderStyle,margin,padding,font,fontSize,color".split(',')
        for (var i = 0; i < style.length; i++)
            qp[name] = getCssMethod(name)

        //        if (browser.isSafari || browser.isChrome) {
        //            style = doc.defaultView.getComputedStyle(docE)
        //            for (var i = 0; i < style.length; i++) {
        //                var name = camelCase(style[i])
        //                if (name.charAt(0) != '-' && !qp[name])
        //                    qp[name] = getCssMethod(name)
        //            }

        //            var style = "border,borderWidth,borderColor,borderStyle,margin,padding,font".split(',')
        //            for (var i = 0; i < style.length; i++)
        //                qp[name] = getCssMethod(name)
        //        }
        //        else {
        //            for (var name in style)
        //                if (!qp[name])
        //                    qp[name] = getCssMethod(name)
        //        }


        var num = ui.Style.num
        $.each(["Height", "Width"], function (name) {
            var tl = name == "Width" ? "Left" : "Top", br = name == "Width" ? "Right" : "Bottom";
            qp["inner" + name] = function () {
                return this[name.toLowerCase()]() + num(this, "padding" + tl) + num(this, "padding" + br);
            };

            qp["outer" + name] = function (margin) {
                return this["inner" + name]() + num(this, "border" + tl + "Width") + num(this, "border" + br + "Width") + (margin ? num(this, "margin" + tl) + num(this, "margin" + br) : 0);
            };

            var type = name.toLowerCase();
            qp[type] = function (size) {
                var first = this.item(0);
                if (first == win)
                    return browser.isStrict && docE["client" + name] || doc.body["client" + name]

                if (first == doc)
                    return Math.max(docE["client" + name], doc.body["scroll" + name], docE["scroll" + name], doc.body["offset" + name], docE["offset" + name])

                if (size === undefined)
                    return first ? ui.Style.get(first, type) : null
                else
                    return this.css(type, $.isStr(size) ? size : size + "px");
            };
        });
    })();


    //## fly.collection.IList Extend
    $.extend(qp,
	{
	    ready: $.ready,
	    val: qp.value,
	    /*	禁用每一项
	    @disabled:Boolean(可选) 是否禁用
	    @return	:this
	    */
	    disable: function (disabled) {
	        return this.attr("disabled", disabled != false)
	    },
	    /*	启用每一项
	    @enable:Boolean(可选) 是否启用
	    @return	:this
	    */
	    enable: function (enable) {
	        return this.attr("disabled", enable == false)
	    },

	    /*	隐藏每一项
	    @return	:this
	    */
	    hide: qp.css.$format("display", "none"),

	    /*	显示每一项
	    @return	:this
	    */
	    show: function () {
	        this.each(dh.show)
	        return this;
	    },

	    /*	生成一个新IList对象
	    @evaluator:Function/String/Object 计算值的函数
	    @params	:Object(可选) 可变参数，要传递的任意多个参数
	    @return	:IList
	    */
	    map: qp.select,

	    /*	确定是否有满足条件的元素,如果不指定条件,将返回集合长度。
	    @predicate	:Function/String/Object 用于测试每个元素是否满足条件的函数。
	    @params	:Object(可选) 可变参数，要传递的任意多个参数
	    @return	:Boolean
	    */
	    any: function (predicate, params) {
	        if (arguments.length == 0)
	            return (this.getItems || qp.getItems).call(this).length
	        this.___count = 1
	        return (this.___take || qp.___take).apply(this, arguments).length > 0
	    },

	    /*	确定序列中的所有元素是否都满足条件,如果不指定条件,将返回所有元素。
	    @predicate	:Function/String/Object 用于测试每个元素是否满足条件的函数。
	    @params	:Object(可选) 可变参数，要传递的任意多个参数
	    @return	:Boolean
	    */
	    all: function (predicate, params) {
	        if (arguments.length == 0)
	            return (this.getItems || qp.getItems).call(this)
	        this.___count = 1
	        this.___isNot = true
	        return (this.___take || qp.___take).apply(this, arguments).length == 0
	    },


	    /*	查询
	    @predicate	:Function/String/Object 查询条件
	    @params	:Object(可选) 可变参数，要传递的任意多个参数
	    @return	:IList
	    */
	    where: function (predicate, params) {
	        return (this.___take || qp.___take).apply(this, arguments)
	    },


	    aggregate: function (seed, func) {
	        if (arguments.length == 1)
	            func = seed, seed = null
	        func = $.toFun(func || seed);
	        this.each(function (o, i, a) {
	            seed = func.call(this, seed, o, i, a)
	        })
	        return seed;
	    },
	    /*求和
	    @selector   :Function(可选)   获取元素用于计算的值的函数
	    @filter     :Function(可选)   过滤出参与计算元素的函数
	    @return     :Number/String
	    */
	    sum: function (selector, filter) {
	        var s = 0
	        if (selector != null) selector = $.toFun(selector)
	        var a = filter == null ? this : this.where(filter);
	        a.each(function (o, i, a) {
	            s += selector == null ? o : selector.apply(this, arguments)
	        })
	        return s;
	    },

	    compareOne: function (selector, resultSelector, greaterLessThanOrComparer) {
	        var c, cItem, than = greaterLessThanOrComparer
	        if (selector != null) selector = $.toFun(selector)
	        if (resultSelector != null) resultSelector = $.toFun(resultSelector, true)
	        if (resultSelector != null && !$.isFun(resultSelector))
	            return resultSelector
	        var isFun = $.isFun(than), isBool = $.isBoolean(than), isMax = than === true, isMin = than === false
	        this.each(function (o, i, a) {
	            var v = selector == null ? o : selector.apply(this, arguments)
	            if (isBool) {
	                if (!(c === undefined || (isMax ? v > c : v < c))) return
	            }
	            else {
	                if (!(isFun ? than.apply(this, v, c, cItem) : v == than))
	                    return
	            }
	            c = v, cItem = o
	        })
	        if (c === undefined) return
	        return resultSelector == null ? cItem : resultSelector.apply(cItem, cItem, c, this);
	    },
	    /*最大值
	    @selector   :Function(可选) 获取元素用于计算的值的函数
	    @return :Number
	    */
	    max: function (selector, resultSelector) {
	        return this.compareOne(selector, resultSelector, true)
	    },
	    /*最小值
	    @selector   :Function(可选) 获取元素用于计算的值的函数
	    @return :Number
	    */
	    min: function (selector, resultSelector) {
	        return this.compareOne(selector, resultSelector, false)
	    },
	    /*求平均
	    @selector   :Function(可选) 获取元素用于计算的值的函数
	    @return :Number    
	    */
	    average: function (selector) {
	        return this.sum.apply(this, arguments) / this.length
	    },
	    /*计数
	    @selector   :Function(可选) 获取元素用于计算的值的函数
	    @return     :Int    满足条件的元素数量
	    */
	    count: function (predicate, params) {
	        return this.where.apply(this, arguments).length
	    },
	    /*去掉重复元素
	    @comparer   :Function(可选) 比较元素的函数
	    @return :this
	    */
	    distinct: qp.uniquelize,

	    /*对元素进行分组
	    @keySelector   :Function(可选) 获取元素用于分组的键
	    @itemSelector  :Function(可选) 获取分组内容
	    @return :Json   包含分组的Json对象
	    */
	    groupBy: function (keySelector, itemSelector) {
	        var gs = {}
	        keySelector = $.toFun(keySelector)
	        itemSelector = $.toFun(itemSelector)
	        this.each(function (o, i, a) {
	            var k = keySelector == null ? i : keySelector.apply(this, arguments);
	            (gs[k] || (gs[k] = [])).push(itemSelector == null ? o : itemSelector.apply(this, arguments))
	        })
	        return gs
	    },
	    /*清除所以元素
	    @return :this
	    */
	    clear: function () {
	        var all = this.getItems()
	        arrP.splice.call(all, 0, this.length)
	        this.updateLength();
	        return this
	    },

	    /*	获取第一项
	    @predicate	:Function/String/Object 查询条件
	    @params	:Object(可选) 可变参数，要传递的任意多个参数
	    @return	:Object
	    */
	    first: function (predicate, params) {
	        if (arguments.length == 0) {
	            var r = [], all = (this.getItems || qp.getItems).call(this)

	            if (all.length > 0)
	                r[0] = all[0]
	            return this.create ? this.create(r) : r
	        }
	        this.___count = 1
	        return (this.___take || qp.___take).apply(this, arguments)
	    },

	    /*	获取最后一项
	    @predicate	:Function/String/Object 查询条件
	    @params	:Object(可选) 可变参数，要传递的任意多个参数
	    @return	:Object
	    */
	    last: function (predicate, params) {
	        if (arguments.length == 0) {
	            var r = [], all = (this.getItems || qp.getItems).call(this)

	            if (all.length > 0)
	                r[0] = all[all.length - 1]
	            return this.create ? this.create(r) : r
	        }

	        this.___count = 1
	        this.___isAsc = false
	        return (this.___take || qp.___take).apply(this, arguments)
	    },

	    index: qp.indexOf,
	    lastIndex: qp.lastIndexOf,


	    /*	匹配所有元素的上级元素，对应选择器 “<”			
	    @layersOrSelector	:Int/Selector(可选) 往上的级数,或者特定的选择器，默认 1
	    @return :Array<Element>
	    */
	    parent: function (ls) {
	        if (ls == null || $.isNumber(ls))
	            return this.$("<" + (ls || 1))
	        var q = new ui.selector.DomQuery(this.context, arguments)
	        return q.parent(this);
	    },

	    /*	匹配所有元素的子级元素，对应选择器 “>”			
	    @layers	:Int(可选) 往下的级数，默认 1
	    @return :Array<Element>
	    */
	    children: function (layers) {
	        return this.$(">" + (layers || 1))
	    },

	    /*	匹配所有元素的之后的元素，对应选择器 “+”
	    @offset	:Int(可选) 往后的偏移量，默认 1
	    @return :Array<Element>
	    */
	    next: function (offset) {
	        return this.$("+" + (layers || 1))
	    },

	    /*	匹配所有元素的之前的元素，对应选择器 “-”
	    @offset	:Int(可选) 往前的偏移量，默认 1
	    @return :Array<Element>
	    */
	    previous: function (offset) {
	        return this.$("-" + (layers || 1))
	    },

	    /*	匹配所有元素的兄弟元素，对应选择器 “~”
	    @return :Array<Element>
	    */
	    sibling: function () {
	        return this.$("~" + (layers || 1))
	    },
	    /*为元素添加鼠标事件
	    @over   :Function  鼠标进入时执行
	    @out    :Function  鼠标移开时执行
	    @return :this
	    */
	    hover: function (over, out, data) {
	        if (over)
	            this.mouseenter.apply(this, [over].concat(slice.call(arguments, 1)))
	        if (out)
	            this.mouseout.apply(this, slice.call(arguments, 1))
	        return this
	    }
	});
    ; (function () {
        qp.avg = qp.average

        qp.slideUp = qp.hide
        qp.sildeDown = qp.show

        var m2m = {
            minWidth: 'width',
            minHeight: 'height'
        };
        for (var m in m2m) {
            if (!qp[m])
                qp[m] = qp[m2m[m]]
        }
        /* #M path:fly.collection.IList.disabled 获取或设置元素disabled属性*/
        /* #M path:fly.collection.IList.id 获取或设置元素id属性*/
        /* #M path:fly.collection.IList.name 获取或设置元素name属性*/
        /* #M path:fly.collection.IList.title 获取或设置元素title属性*/
        /* #M path:fly.collection.IList.className 获取或设置元素className属性*/
        /* #M path:fly.collection.IList.text 获取或设置元素innerText属性*/
        /* #M path:fly.collection.IList.html 获取或设置元素innerHTML属性*/
        var props = ["disabled", "id", "name", "title", "className", "text:innerText", "html:innerHTML"]
        for (var i = 0; i < props.length; i++) {
            var att = props[i].replace(/.*:/g, '')
            qp[props[i].replace(/:.*/g, '')] = function (att) {
                return function (v) {
                    return arguments.length > 0 ? this.attr(att, v) : this.attr(att)
                }
            } (att)
        }

        /* #M path:fly.collection.IList.onBlur 为元素绑定 onblur 事件*/
        /* #M path:fly.collection.IList.onFocus 为元素绑定 onfocus 事件*/
        /* #M path:fly.collection.IList.onLoad 为元素绑定 onload 事件*/
        /* #M path:fly.collection.IList.onResize 为元素绑定 onresize 事件*/
        /* #M path:fly.collection.IList.onScroll 为元素绑定 onscroll 事件*/
        /* #M path:fly.collection.IList.onUnload 为元素绑定 onunload 事件*/
        /* #M path:fly.collection.IList.onDblClick 为元素绑定 ondblclick 事件*/
        /* #M path:fly.collection.IList.onContextMenu 为元素绑定 oncontextmenu 事件*/
        /* #M path:fly.collection.IList.onMouseDown 为元素绑定 onmouseDown 事件*/
        /* #M path:fly.collection.IList.onMouseUp 为元素绑定 onmouseup 事件*/
        /* #M path:fly.collection.IList.onMouseMove 为元素绑定 onmousemove 事件*/
        /* #M path:fly.collection.IList.onMouseOver 为元素绑定 onmouseover 事件*/
        /* #M path:fly.collection.IList.onMouseOut 为元素绑定 onmouseout 事件*/
        /* #M path:fly.collection.IList.onMouseEnter 为元素绑定 onmouseenter 事件*/
        /* #M path:fly.collection.IList.onMouseLeave 为元素绑定 onmouseleave 事件*/
        /* #M path:fly.collection.IList.onChange 为元素绑定 onchange 事件*/
        /* #M path:fly.collection.IList.onSelect 为元素绑定 onselect 事件*/
        /* #M path:fly.collection.IList.onSelectStart 为元素绑定 onselectstart 事件*/
        /* #M path:fly.collection.IList.onSubmit 为元素绑定 onsubmit 事件*/
        /* #M path:fly.collection.IList.onKeyDown 为元素绑定 onkeydown 事件*/
        /* #M path:fly.collection.IList.onKeyPress 为元素绑定 onkeypress 事件*/
        /* #M path:fly.collection.IList.onKeyUp 为元素绑定 onkeyup 事件*/
        /* #M path:fly.collection.IList.onError 为元素绑定 onerror 事件*/

        qp.bind = qp.on
        $.Event.events = ("Blur,Focus,Load,Resize,Scroll,Unload,Click,DblClick,ContextMenu," +
		"MouseDown,MouseUp,MouseMove,MouseOver,MouseOut,MouseEnter,MouseLeave," +
		"Change,Select,SelectStart,Submit,KeyDown,KeyPress,KeyUp,Error").split(',')
        for (var i = 0; i < $.Event.events.length; i++) {
            var e = $.Event.events[i]
            var le = e.toLowerCase()
            var h = qp["on" + e] = function (e) {
                return function () {
                    return this.on.apply(this, arrP.concat.apply([e], arguments))
                }
            } (le)
            if (!qp[le])
                qp[le] = h;
        }
    })();
    //#end

    qp.applyTo(Array, {
        item: function (index) {
            return this[index]
        },
        filter: qp.filter,
        $type: Array,
        $create: $.toArray,
        getItems: $.emptyFun,
        updateLength: $.emptyFun
    })

    //    lib.Single = function (single) {
    //        this.single = this[0] = $.likeArray(single) ? single[0] : single;
    //    }

    //    qp.applyTo(lib.Single, {
    //        length: 1,
    //        single: null,
    //        item: function (index) {
    //            return single
    //        },
    //        getItems: function () {
    //            return new Array(this.single)
    //        },
    //        updateLength: $.emptyFun,
    //        destroy: function () {
    //            this.single = null;
    //            this[0] = null;
    //        }
    //    });


    $.safeExtend("$", qp, qp);


    //## fly.ui.Animate
    fly.ui.Animate = $.Class({
        base: lib.Component,
        _handle: 0,
        /*	speed,step,start,end,achieve,target
        */
        constructor: function (config) {
            $.extend(this, config)
            this.config = config
            lib.Animate.baseClass.constructor.apply(this, arguments);
        },
        current: 0,
        play: function () {
            if (this.running)
                return false;
            var speed = this.speed || this.config.speed, speed = parseInt((lib.Animate.Speed[speed] || speed || lib.Animate.Speed.normal) / 20)
            var start = parseInt(this.start || this.config.start || (this.getter || this.config.getter || this.achieve || this.config.achieve)(this.target, this.attr))
            this._step = this.step || this.config.step || ((this.end || this.config.end - start) / 20)
            this.current = start

            if ($.Event.fire(this, "play") == false)
                return false
            win.clearTimeout(this._handle)
            this.running = true
            if (this.attr == "opacity") {
                var zoom = ui.Style.get(this.target, "zoom")
                if (zoom == null || zoom == "normal")
                    ui.Style.set(this.target, "zoom", 1);
            }
            var me = this;
            this._handle = win.setInterval(function () { me.go() }, speed)
        },
        go: function () {
            //alert(this.current)
            win.status = this.current
            this.achieve.call(this, this.target, this.attr, this.current, this.data || this.config.data)
            var end = this.end || this.config.end;
            if (this._step > 0 ? this.current >= end : this.current <= end) {
                $.Event.fire(this, "end");
                this.stop()
                return
            }

            if ($.Event.fire(this, "go") == false)
                return false
            this.current += this._step;
            if (this._step > 0 ? this.current > end : this.current < end)
                this.current = end
        },
        stop: function () {
            //this.go.clearTimeout()
            win.clearTimeout(this._handle)
            $.Event.fire(this, "stop")
            this.running = false
            if (this.callback)
                this.callback.call(this)
        }
    })

    fly.ui.Animate.Speed = {
        slow: 300,
        normal: 200,
        fast: 100
    }
    //#end

    fly.ui.Effect = {
        style: styleHelper.set
    }
    var animates = {}
    qp.extend({
        animate: function (prop, speed, callback) {
            var attr, to;
            for (var p in prop)
                attr = p, to = parseInt(prop[attr]);

            return qp.$each.call(this, function (o) {
                var key = "animate " + attr + ":" + to
                var animate = animates[key] || (animates[key] = new ui.Animate(
				        {
				            target: o,
				            achieve: ui.Effect.style,
				            attr: attr,
				            getter: styleHelper.num
				        }));
                animate.speed = speed
                animate.end = to;
                animate.callback = callback;
                animate.play()
            })
        },
        parseFadeArgs: function (speed, callback) {
            return $.isObject(speed) ? speed : { speed: speed, callback: callback }
        },
        fadeOut: function (speed, callback) {
            var config = this.$parseFadeArgs.apply(this, arguments);
            return qp.$each.call(this, function (o) {
                var animate = new ui.Animate(o, ui.Effect.style, $.extend(
				{
				    start: 100,
				    end: 0
				}, config))

                if ($.isFun(callback))
                    animate.on("end", callback)
                animate.on("end", function (a) {
                    this.hide()
                    this.css("opacity", 100);
                } .bind(this))

                animate.play()
            })
        },

        fadeIn: function (speed, callback) {
            var config = this.$parseFadeArgs.apply(this, arguments);
            return qp.$each.call(this, function (o) {
                this.show()
                var animate = new ui.Animate(o, ui.Effect.style, $.extend(
				{
				    start: 0,
				    end: 100
				}, config))
                if ($.isFun(callback))
                    animate.on("end", callback)
                animate.play()
            })
        },

        fadeTo: function (speed, to, callback) {
            //		var length=arguments.length;
            //		if(fly.isFun(arguments[length-1]))
            //		{
            //			callback=arguments[length-1]
            //			length--;
            //		}
            //		if(length === 1)
            //		{
            //			to = speed;
            //			speed=undefined;
            //		}
            var config = this.$parseFadeArgs(speed, callback);
            config.end = to < 1 ? to * 100 : to
            return qp.$each.call(this, function (o) {
                var old = parseInt(ui.Style.get(this[0], "opacity"));
                var animate = new ui.Animate(o, ui.Effect.style, $.extend(
				{
				    start: old == 0 ? 0 : old || 100
				}, config));

                if ($.isFun(callback))
                    animate.on("end", callback)

                if (config.end === 0)
                    animate.on("end", function () {
                        this.hide();
                        this.css("opacity", 100);
                    })
                animate.play()
            })
        }
    });


    //## fly.ui.selector
    ; (function () {
        var eFunsCache = {}
        var nsSelector = $.ns("fly.ui.selector")
        var hasQueryMethod = !!doc.querySelector
        var checkDiv = doc.createElement('div')
        var engine, rSelectors;
        var utils =
		{
		    propMap: { "class": "className" },
		    trimCommaReg: /^[\s\,]*\,+|\,+[\s\,]*$/g,
		    expressionInnerReg: /^\s*([\w$]+)\s*([=><*!\^\$]+)([\s\S]+)*/,
		    expressionOuterReg: /\s*(\[[^\[\]]+\])/g,
		    trimQuotationReg: /^\s*['"]?|['"]?\s*$/g,
		    trimMiddleBrackets: /^\s*\[|\]\s*$/g,
		    verySimpleReg: /[\[\]\(\)\s><+]/,
		    containsReg: /:contains\(\s*(\'[^\']*\'|\"[^\"]*\")\s*\)/g,
		    headerTags: ["h1", "h2", "h3", "h4", "h5", "h6"],
		    inputTags: ["input", "textarea", "select", "button"],
		    inputTypes: ["text", "checkbox", "radio", "image", "file", "submit", "reset", "password", "button", "hidden"],
		    relationSelectorReg: /[+\-<>~]/,
		    relationSelectorRegReplace: /([+\&<>~]+)(\d*)/g,
		    getByTagPropFilter: function (tagName, prop, value) {
		        return function (context, collector, selector) {
		            var s =
					{
					    selector: tagName, onlyFilterContext: selector.onlyFilterContext
					}
		            if (prop == null)
		                return executors.byTagName(context, collector, s)
		            var c = new nsSelector.Collector()
		            executors.byTagName(context, c, s)
		            $.each(c.result, function (o) {
		                if (o[prop] == value)
		                    collector.result.push(o)
		            })
		        }
		    },
		    getCommonFilter: function (each) {
		        each = $.toFun(each)
		        return function (context, collector, selector, isDesc) {
		            if (!selector.onlyFilterContext) {
		                var newCollector = new nsSelector.Collector()
		                executors.all(context, newCollector,
						{
						    onlyFilterContext: false
						})
		                context = newCollector.result
		            }
		            each(context, collector, selector)
		        }
		    },
		    getSimpleOperator: function (operator) {
		        return $.toFun("o,left, right=>o[left] " + operator + " right")
		    }
		}

        //## Collector
        nsSelector.Collector = function (r, unique) {
            this.result = r || []
            this.unique = unique;
            if (unique && this.result.length > 0)
                this.result = this.uniquelize();
        } .extend(
		{
		    allID: ",",
		    uniquelize: function (start, end) {
		        //return
		        if (this.result.length < 2)
		            return;
		        var all = this.result
		        var i = -1, len = all.length
		        this.allID = ","
		        start = start || 0
		        end = end == null ? len : end;
		        while (++i < len) {
		            var id = all[i].uniqueNumber || ui.DomHelper.getUniqueID(all[i])
		            if (i >= start && i < end && this.allID.indexOf(',' + id + ",") > -1) {
		                all.splice(i, 1);
		                i--, len--;
		                continue
		            }
		            this.allID += id + ","
		        }

		    },
		    merge: function (arr) {
		        if (arr.length == 0)
		            return
		        this.result.length == 0 ? this.result = $.toArray(arr) : this.result.merge(arr)
		        if (this.unique)
		            this.uniquelize();
		    },
		    push: function (el) {
		        if (this.unique) {
		            var id = el.uniqueNumber || ui.DomHelper.getUniqueID(el)
		            if (this.allID.$contains(',' + id + ','))
		                return false;
		            this.allID += id + ",";
		        }
		        this.result.push(el)
		        return true
		    },
		    contains: function (el) {
		        if (this.unique)
		            return this.allID.$contains(',' + el.uniqueNumber || ui.DomHelper.getUniqueID(el) + ',')
		        return this.result.$contains(el)
		    },
		    clear: function () {
		        this.result = []
		        this.allID = ','
		    }
		}).extend(nsSelector.Collector)
        //#end

        //## Executors
        var executors =
		{
		    _all: function (el) {
		        if (el.all)
		            return el.all
		        else if (el.getElementsByTagName)
		            return el.getElementsByTagName('*')
		        else {
		            var r = [];
		            (function (o, allChild) {
		                var cs = ui.DomHelper.children(o)
		                if (cs != null)
		                    for (var i = 0; i < cs.length; i++)
		                        arguments.callee(allChild.push(cs[i]), allChild)
		            })(el, r)
		            return r
		        }
		    },
		    all: function (context, collector, selector) {
		        if (selector.onlyFilterContext)
		            return collector.merge(context)
		        for (var i = 0; i < context.length; i++)
		            collector.merge(executors._all(context[i]))
		    },
		    byId: function (context, collector, selector) {
		        var s = selector.selector
		        for (var i = 0; i < context.length; i++) {
		            var c = context[i]
		            if (selector.onlyFilterContext) {
		                if (c.id == s)
		                    collector.result.push(c)
		            }
		            else if (c.getElementById) {
		                var node = c.getElementById(s)
		                if (node)
		                    collector.result.push(node)
		            }
		            else {
		                var childs = executors._all(c)
		                var ci = -1
		                while (++ci < childs.length)
		                    if (childs[ci].id == s)
		                        return collector.result.push(childs[ci])
		            }
		        }
		    },
		    byCss: function (context, collector, selector) {
		        var s = new RegExp("\\s" + selector.selector + "\\s")
		        for (var i = 0; i < context.length; i++) {
		            var c = context[i]
		            if (selector.onlyFilterContext) {
		                if (s.test(' ' + c.className + ' '))
		                    collector.result.push(c)
		            }
		            else {
		                var childs = executors._all(c)
		                var ci = -1
		                while (++ci < childs.length)
		                    if (s.test(' ' + childs[ci].className + ' '))
		                        collector.result.push(childs[ci])
		            }
		        }
		    },
		    byName: function (context, collector, selector) {
		        var s = selector.selector
		        for (var i = 0; i < context.length; i++) {
		            var c = context[i]

		            if (selector.onlyFilterContext) {
		                if (c.name == s)
		                    collector.result.push(c)
		            }
		            else if (c.getElementsByName)
		                collector.merge(c.getElementsByName(s))
		            else {
		                var childs = executors._all(c)
		                var ci = -1
		                while (++ci < childs.length)
		                    if (childs[ci].name == s)
		                        collector.result.push(childs[ci])
		            }
		        }
		    },
		    byTagName: function (context, collector, selector) {
		        var s = selector.selector
		        if ($.isArray(s)) {
		            for (var i = 0; i < s.length; i++)
		                arguments.callee(context, collector,
						{
						    selector: s[i], onlyFilterContext: selector.onlyFilterContext
						})
		            return
		        }

		        var s = s.toUpperCase()
		        for (var i = 0; i < context.length; i++) {
		            var c = context[i]
		            if (selector.onlyFilterContext) {
		                if (c.nodeName == s)
		                    collector.result.push(c)
		            }
		            else if (c.getElementsByTagName)
		                collector.merge(c.getElementsByTagName(s))
		            else {
		                s = s.toUpperCase()
		                var childs = executors._all(c)
		                var ci = -1
		                while (++ci < childs.length)
		                    if (childs[ci].nodeName == s)
		                        collector.result.push(childs[ci])
		            }
		        }
		    },
		    clear: function (context, collector, selector) {
		        collector.clear()
		    },
		    expression: function (context, collector, selector) {
		        var all
		        if (selector.onlyFilterContext)
		            all = context
		        else {
		            var ac = new nsSelector.Collector()
		            executors.all(context, ac, { onlyFilterContext: false })
		            all = ac.result
		        }

		        var exp = selector.selector.replace(utils.trimMiddleBrackets, '').$trim();
		        //索引
		        if (/^\d+$/.test(exp)) {
		            var node = all[exp]
		            if (node)
		                collector.result.push(node)
		            return
		        }
		        //属性
		        else if (/^[\w$][\w\d$]*$/.test(exp))
		            exp = "o.getAttribute('" + exp + "')!=undefined"
		        else if (/^('[^']+')|("[^"]+")$/.test(exp))
		            exp = "o.getAttribute(" + exp + ")!=undefined"


		        var option = eFunsCache[exp];
		        if (option == null) {
		            var fun
		            var match = exp.match(utils.expressionInnerReg)
		            if (match != null) {
		                var operator = match[2]
		                if (operator && (fun = nsSelector.Selectors.operators[operator])) {
		                    var left = match[1].replace(utils.trimQuotationReg, '')
		                    utils.propMap[left] && (left = utils.propMap[left])
		                    var right = match[3]
		                    try {
		                        right = eval(right)
		                    } catch (e) { }
		                }
		            }
		            if (!$.isFun(fun))
		                fun = $.toFun(fun || (exp.indexOf('=>') > -1 ? exp : "o=>with(o){ return " + exp + "}"))
		            option = eFunsCache[exp] =
					{
					    fun: fun, left: left,
					    right: right
					}
		        }

		        var i = -1, len = all.length;
		        while (++i < len)
		            if (option.fun(all[i], option.left, option.right, i, all))
		                collector.result.push(all[i])
		    },
		    filter: function (context, collector, selector) {
		        var fType = selector.selector.replace(/\(.*/, ''), typeFilter
		        if (fType && (typeFilter = nsSelector.Selectors.filters[fType]) != null)
		            typeFilter(context, collector, selector)
		        else throw new Error("不支持过滤器“" + selector.selectorStr + "”")
		    },
		    children: function (context, collector, selector) {
		        var s = selector.selectorStr;
		        var deep = parseInt(selector.selector)
		        function find(el, d) {
		            var childs = ui.DomHelper.children(el)
		            if (d == deep)
		                collector.merge(childs)
		            else
		                for (var i = 0; i < childs.length; i++)
		                    find(childs[i], d + 1)
		        }

		        for (var i = 0; i < context.length; i++)
		            find(context[i], 1)
		    },
		    sibling: function (context, collector, selector) {
		        var s = selector.selectorStr;
		        for (var i = 0; i < context.length; i++)
		            collector.merge(ui.DomHelper.children(context[i].parentNode))
		    },
		    getCommonRelationFun: function (relation) {
		        return function (context, collector, selector) {
		            var s = selector.selectorStr;
		            var deep = parseInt(selector.selector)
		            function find(el, d) {
		                var o = el[relation]
		                if (o == null)
		                    return
		                if (o.nodeType != 1)
		                    find(o, d)
		                else if (d == deep)
		                    collector.result.push(o)
		                else
		                    find(o, d + 1)
		            }

		            for (var i = 0; i < context.length; i++)
		                find(context[i], 1)
		        }
		    }
		}
        //#end

        //## Selectors
        /*#C path:fly.ui.selector
        选择器
        */
        nsSelector.Selectors =
		{
		    executors: executors,
		    sTypes: new Array,
		    splitRegFormat: "\\s*([{0}]+| |[α]|[><+\\&~]+)\\s*",
		    splitReg: /\s*( )\s*/g,
		    needFollows: {},

		    //## Operators
		    operators:
			{
			    '!=': utils.getSimpleOperator("!="),
			    '^=': $.toFun("o,left, right=>var v = o[left] ; return v && v.substr(0, right.length) == right"),
			    '$=': $.toFun("o,left, right=>var v = o[left] ; return v && v.substr(v.length - (right.length)) == right"),
			    '*=': $.toFun("o, left, right=>var v = o[left] ;return v && v.indexOf(right) > -1"),
			    '=': utils.getSimpleOperator("=="),
			    '==': utils.getSimpleOperator("=="),
			    '>': utils.getSimpleOperator(">"),
			    '<': utils.getSimpleOperator("<"),
			    '>=': utils.getSimpleOperator(">="),
			    '<=': utils.getSimpleOperator("<=")
			},
		    //#end

		    //## filters
		    filters:
			{
			    empty: utils.getCommonFilter("c,cr,s=>for(var i = 0; i < c.length; i ++ )if(c[i].firstChild==null)cr.result.push(c[i])"),
			    parent: utils.getCommonFilter("c,cr,s=>for(var i = 0; i < c.length; i ++ )if(c[i].firstChild!=null)cr.result.push(c[i])"),
			    enabled: utils.getCommonFilter("c,cr,s=>for(var i = 0; i < c.length; i ++ )if(c[i].disabled!=true)cr.result.push(c[i])"),
			    disabled: utils.getCommonFilter("c,cr,s=>for(var i = 0; i < c.length; i ++ )if(c[i].disabled==true)cr.result.push(c[i])"),
			    undisplay: utils.getCommonFilter("c,cr,s=>for(var i = 0; i < c.length; i ++ )if(!dh.isIsDisplay(c[i]))cr.result.push(c[i])"),
			    display: utils.getCommonFilter("c,cr,s=>for(var i = 0; i < c.length; i ++ )if(dh.isIsDisplay(c[i]))cr.result.push(c[i])"),
			    unvisible: utils.getCommonFilter("c,cr,s=>for(var i = 0; i < c.length; i ++ )if(!dh.isVisible(c[i]))cr.result.push(c[i])"),
			    visible: utils.getCommonFilter("c,cr,s=>for(var i = 0; i < c.length; i ++ )if(dh.isVisible(c[i]))cr.result.push(c[i])"),
			    hidden: utils.getCommonFilter("c,cr,s=>for(var i = 0; i < c.length; i ++ )if(dh.isHidden(c[i]))cr.result.push(c[i])"),
			    first: utils.getCommonFilter("c,cr,s=>if(c[0]!=null){cr.result.push(c[0]) ;return true}"),
			    last: utils.getCommonFilter("c,cr,s=>if(c[c.length-1]!=null){cr.result.push(c[c.length-1]);return true}", true),
			    even: utils.getCommonFilter("c,cr,s=>for(var i = 0; i < c.length; i ++ )if(i%2===0)cr.result.push(c[i])"),
			    odd: utils.getCommonFilter("c,cr,s=>for(var i = 0; i < c.length; i ++ )if(i%2!==0)cr.result.push(c[i])"),
			    "eq()": utils.getCommonFilter("c,cr,s=>var o=c[s.follow.selector]; if(o)cr.result.push(o)"),
			    "gt()": utils.getCommonFilter("c,cr,s=>for(var i = parseInt(s.follow.selector)+1; i < c.length; i ++ )cr.result.push(c[i])"),
			    "lt()": utils.getCommonFilter("c,cr,s=>for(var i = 0,end=Math.min(parseInt(s.follow.selector),c.length); i < end; i ++ )cr.result.push(c[i])"),
			    "not()": function (context, collector, selector) {
			        selector.follow.onlyFilterContext = selector.onlyFilterContext
			        var followCollector = new nsSelector.Collector()
			        selector.follow.find(context, followCollector)
			        var uids = ","
			        $.each(followCollector.result, function (o) { uids += ui.DomHelper.getUniqueID(o) + "," })
			        utils.getCommonFilter(function (c, cr, s) {
			            for (var i = 0; i < c.length; i++)
			                if (uids.indexOf("," + ui.DomHelper.getUniqueID(c[i]) + ",") < 0) cr.result.push(c[i])
			        })(context, collector, selector)
			    },
			    "has()": function (context, collector, selector) {
			        var childC = new nsSelector.Collector()
			        executors.children(context, childC, { selector: 1 })

			        selector.follow.onlyFilterContext = selector.onlyFilterContext
			        var followCollector = new nsSelector.Collector()
			        selector.follow.find(childC.result, followCollector)

			        executors.parentNode(followCollector.result, collector, { selector: 1 })
			    },
			    "data()": utils.getCommonFilter("c,cr,s=>for(var i = 0; i < c.length; i ++ )if(fly.data(c[i],s.follow.selector)) cr.result.push(c[i])"),
			    header: utils.getByTagPropFilter(utils.headerTags),
			    input: utils.getByTagPropFilter(utils.inputTags),
			    checked: utils.getByTagPropFilter("input", "checked", true),
			    unchecked: utils.getByTagPropFilter("input", "checked", false),
			    selected: utils.getByTagPropFilter("option", "selected", true),
			    unselected: utils.getByTagPropFilter("option", "selected", false),
			    focusable: utils.getCommonFilter("c,cr,s=>for(var i = 0; i < c.length; i ++ )if(dh.focusable(c[i]))cr.result.push(c[i])"),
			    tabbable: utils.getCommonFilter("c,cr,s=>for(var i = 0; i < c.length; i ++ )if(dh.tabbable(c[i]))cr.result.push(c[i])")
			},
		    //#end

		    /*	扩展选择器
		    @selectors	:多个选择器
		    @return	:无
		    */
		    extendSelector: function (selectors) {
		        for (var s in selectors)
		            this.executors[s] = selectors[s], this.sTypes.push(s)
		        var reg = this.sTypes.join("").replace(/\s/g, "").replace(utils.relationSelectorRegReplace, '').replace('α', '')
		        this.splitReg = new RegExp(this.splitRegFormat.$format(reg), 'g')
		    },

		    /*	扩展过滤选择器
		    @filters	:多个选择器
		    @return	:无
		    */
		    extendFilter: function (filters) {
		        $.extendIf(this.filters, filters)
		        for (var k in this.filters)
		            if (k.substr(k.length - 2) == "()") {
		                var n = k.substr(0, k.length - 2)
		                this.filters[n] = this.filters[k]
		                delete this.filters[k]
		                this.needFollows[":" + n] = this.needFollows[" :" + n] = true
		            }
		    },

		    /*	扩展表达式运算符
		    @operators:{String} 多个运算符
		    @return	:无
		    */
		    extendOperator: function (operators) {
		        $.extend(this.operators, operators)
		    }
		}


        with (executors) {
            nsSelector.Selectors.extendSelector(
			{
			    '*': all,
			    '#': byId,
			    '.': byCss,
			    '$': byName,
			    'α': expression,
			    " ": byTagName,
			    ">": children,
			    "<": getCommonRelationFun("parentNode"),
			    "+": getCommonRelationFun("nextSibling"),
			    "&": getCommonRelationFun("previousSibling"),
			    "~": sibling,
			    ":": filter,
			    "θ": $.emptyFun
			})
        }
        var inputFilters = {}, ti = -1, iType;
        while (iType = utils.inputTypes[++ti]) {
            inputFilters[iType] = utils.getCommonFilter("c,cr,s=>for(var i = 0; i < c.length; i ++ )if(c[i].type==='" + iType + "')cr.result.push(c[i])")
        }
        nsSelector.Selectors.extendFilter(inputFilters)

        //#end

        //## Engine
        nsSelector.Engine = engine = function (selector, parent) {
            this.parent = parent
            if (parent)
                this.root = parent.root, this.onlyFilterContext = parent.onlyFilterContext
            else
                this.root = this
            this.init(selector)
        } .extend(
		{
		    isSimple: true,
		    onlyFilterContext: false,
		    init: function (selector) {
		        if ($.isStr(selector)) {
		            this.selectorStr = this.selector = selector
		            this.setIsSimple(this.onlyFilterContext == false && engine.isSimple(this.selectorStr))
		            if (!this.isSimple) {
		                if (this.selector.indexOf(":") > -1) {
		                    if (this.selector.indexOf(":contains(") > -1)
		                        this.selector = this.selector.replace(utils.containsReg, function ($0, $1) {
		                            return '[innerText*="' + $1 + '"]'
		                        })
		                }
		                if (!this.parent)
		                    this.extractExpression().extractGroups()
		                this.parse()
		            }
		        }
		        else {
		            for (var k in selector)
		                this[k] = selector[k]
		            if (this.type == 'α')
		                this.selector = this.selectorStr = this.root.expressions[this.selector]
		            else if (this.type == "θ")
		                return this.init(this.root.groups[this.selector])

		            if (this.follow)
		                this.follow = new nsSelector.Engine(this.follow, this)

		            this.setIsSimple(this.onlyFilterContext == false && engine.isSimple(this.selectorStr))
		            if (!this.isSimple)
		                this.achieve = executors[this.type]
		        }
		    },
		    setIsSimple: function (isSimple) {
		        this.isSimple = isSimple
		    },
		    isVerySimple: function () {
		        if (this.verySimple != undefined)
		            return this.verySimple

		        if ((this.sequence && this.sequence.length > 0) || (this.childs && this.childs.length > 0))
		            return this.verySimple = false;
		        if (this.verySimple = !utils.verySimpleReg.test(this.selector)) {
		            this.parse()
		            this.achieve = executors[this.type]
		        }
		        return this.verySimple
		    },
		    extractExpression: function (selector) {
		        var es = this.expressions = new Array
		        this.selector = this.selector.replace(utils.expressionOuterReg, function ($0, $1) {
		            es.push($1)
		            return ($0.indexOf('[') > 0 ? ' α' : 'α') + (es.length - 1)
		        })
		        return this
		    },
		    extractGroups: function () {
		        var gs = this.groups = new Array
		        this.selector = this.selector.replace(/\(([^\)]+)\)/g, function ($0, $1) {
		            gs.push($1.$trim())
		            return 'θ' + (gs.length - 1)
		        })
		        return this
		    },
		    makeChilds: function () {
		        this.childs = new Array;
		        var ss = this.selector.split(',')
		        for (var i = 0; i < ss.length; i++)
		            if (ss[i] != "")
		                this.childs.push(new engine(ss[i], this))
		    },
		    makePath: function () {
		        var ss = new Array
		        var hasRelation;
		        if (hasRelation = utils.relationSelectorReg.test(this.selector)) {
		            this.selector = this.selector.replace(utils.relationSelectorRegReplace, function ($0, $1, $2) {
		                return $1.charAt(0) + ($2 == "" ? $1.length : parseInt($2) + $1.length - 1) + " "
		            })
		        }
		        this.selector = this.selector.$trim()
		        var contentStr = (" " + this.selector).replace(nsSelector.Selectors.splitReg, function ($0, $1) {
		            ss.push(
				    {
				        selectorStr: $0,
				        onlyFilterContext: !/^\s/.test($0),
				        type: $1
				    })
		            return "ξ"
		        })
		        ss[0].onlyFilterContext = this.onlyFilterContext
		        var contents = contentStr.substr(1).split("ξ")
		        for (var i = 0; i < contents.length; i++) {
		            var s = ss[i]
		            s.selectorStr += (s.selector = contents[i])
		            if (hasRelation && ss.length > i + 1 && utils.relationSelectorReg.test(s.type))	//w3c css规则
		                ss[i + 1].onlyFilterContext = true
		            else if (s.type == "θ" && i > 0 && s.onlyFilterContext) {
		                var prev = ss[i - 1]
		                if (nsSelector.Selectors.needFollows[prev.selectorStr] == true && prev.follow == null) {
		                    prev.follow = s
		                    ss.splice(i, 1)
		                    contents.splice(i, 1)
		                    i--
		                }
		            }
		        }

		        if (ss.length == 1)
		            this.init(ss[0]), ss = null
		        else
		            for (var i = 0; i < ss.length; i++)
		                ss[i] = new engine(ss[i], this)
		        this.sequence = ss;
		        return this
		    },
		    parse: function (selector) {
		        return this.selector.indexOf(',') > -1 ? this.makeChilds() : this.makePath()
		    },
		    findChilds: function () {
		        var sStr = ""
		        for (var i = 0; i < this.childs.length; i++) {
		            var s = this.childs[i]
		            if (hasQueryMethod && s.isSimple && this.context.isDom != false)
		                sStr += "," + s.selectorStr

		            else {
		                var subResult = new nsSelector.Collector()
		                s.find(this.context, subResult)
		                this.collector.merge(subResult.result)
		            }
		        }
		        if (sStr != "") {
		            var subResult = new nsSelector.Collector()
		            engine.queryByProtogenic(this.context, subResult, sStr.substr(1))
		            this.collector.merge(subResult.result)
		        }
		    },
		    isChilds: function (el) {
		        for (var i = 0; i < this.childs.length; i++)
		            if (this.childs[i].is(el, this.context))
		                return true;
		        return false
		    },
		    findPath: function () {
		        var sStr = ""
		        var subResult = new nsSelector.Collector()
		        var newContext = this.context
		        function flush() {
		            if (sStr != "") {
		                engine.queryByProtogenic(newContext, subResult, sStr.substr(1))
		                newContext = subResult.result
		                subResult.clear()
		                sStr = ""
		            }
		        }
		        for (var i = 0; i < this.sequence.length; i++) {
		            var s = this.sequence[i]
		            if (hasQueryMethod && s.isSimple && this.context.isDom != false)
		                sStr += (this.onlyFilterContext ? "" : ' ') + s.selectorStr
		            else {
		                flush()
		                s.find(newContext, subResult)
		                newContext = subResult.result
		                subResult.clear()
		            }
		        }
		        flush()
		        this.collector.merge(newContext)
		    },
		    isPath: function (el) {
		        var e = el;
		        for (var i = this.sequence.length - 1; i > -1; i--) {
		            var s = this.sequence[i]
		            while (true) {
		                if (e == null || e.nodeType !== 1)
		                    return false
		                var is = s.is(e, this.context)
		                if (!is) {
		                    if (e == el)
		                        return false
		                    else
		                        e = e.parentNode;
		                }
		                else {
		                    e = e.parentNode;
		                    break;
		                }
		            }
		        }
		        return true
		    },
		    find: function (context, collector) {
		        if (this.selectorStr == "")
		            return
		        this.context = context
		        this.collector = collector
		        if (this.isSimple && context.isDom != false)
		            engine.queryByProtogenic(context, collector, this.selectorStr)
		        else if (this.childs != null && this.childs.length > 0)
		            this.findChilds()
		        else if (this.sequence != null && this.sequence.length > 0)
		            this.findPath()
		        else
		            this.achieve(context, collector, this)
		    },
		    filter: function (all, context, collector) {
		        for (var i = 0; i < all.length; i++) {
		            var e = all[i]
		            if (this.is(e, context))
		                collector.push(e)
		        }
		    },
		    is: function (el, context) {
		        this.context = context
		        if (this.childs != null && this.childs.length > 0)
		            return this.isChilds(el)
		        else if (this.sequence != null && this.sequence.length > 0)
		            return this.isPath(el);
		        else if (this.isSimple && this.isVerySimple() == false) {
		            var id = el.id;
		            var newID = el.id = "fly_" + Math.random();
		            var newSelector = this.selectorStr + "[id='" + newID + "']"
		            context = context || [doc]
		            var is = false;
		            for (var i = 0; i < context.length; i++) {
		                if (is = !!context[i].querySelector(newSelector))
		                    break;
		            }
		            el.id = id;
		            return is;
		        }
		        else {
		            var _context = [{ all: [el]}]
		            _context.isDom = false;
		            var collector = new nsSelector.Collector();
		            this.achieve(_context, collector, this)
		            return collector.result.length > 0
		        }
		    }

		}).extend(nsSelector.Engine)
        engine.utils = utils
        engine.isSimple = function (selector) {
            try {
                return hasQueryMethod && checkDiv.querySelector(selector) != false
            }
            catch (e) {
                return false
            }
        }

        engine.queryByProtogenic = function (context, collector, selector) {
            for (var i = 0; i < context.length; i++)
                collector.merge(context[i].querySelectorAll(selector))
            return collector.result
        }

        engine.cache = {}
        engine.create = function (selector) {
            return engine.cache[selector] || (engine.cache[selector] = new engine(selector))
        }


        //#end

        //## DomQuery
        /*#C path:fly.ui.selector.DomQuery
        Dom对象查询类
        */
        nsSelector.DomQuery = function (context, selectors) {
            this.context = context
            this.selectors = selectors
        } .extend(
		{
		    createResult: function (arr, context) {
		        arr.context = context;
		        arr.isDomArray = true
		        return arr
		    },
		    extractSelectorStr: function () {
		        var s = this.selectorStr = ""
		        for (var i = 0; i < this.selectors.length; i++) {
		            if ($.isFun(s = this.selectors[i]))
		                $.onLoad(s)
		            //s = s.call(this, this)
		            if (s == null)
		                continue
		            if (!$.isStr(s))
		                this.collector.push(s)
		            else {
		                if ($.isHtml(s))
		                    this.collector.merge(dh.create(s))
		                else
		                    this.selectorStr += (this.selectorStr == "" ? '' : ',') + s.replace(utils.trimCommaReg, '')
		            }
		        }
		        return this
		    },
		    /*	查找Dom对象
		    @return	:Array 查找到的Dom对象
		    */
		    find: function () {
		        if (this.selectors.length == 1 && this.selectors[0] && this.selectors[0].$isIList == true)
		            return this.selectors[0]
		        this.collector = new nsSelector.Collector()
		        this.extractSelectorStr()
		        if (/^\s*$/g.test(this.selectorStr) == false) {
		            this.selector = engine.create(this.selectorStr)
		            this.selector.find(this.context || [doc], this.collector)
		        }

		        this.collector.uniquelize()
		        return this.createResult(this.collector.result, this.context)
		    },
		    filter: function (all) {
		        this.extractSelectorStr()
		        this.selector = engine.create(this.selectorStr)
		        var col = new nsSelector.Collector()
		        this.selector.filter(all, all.context, col);
		        return this.createResult(col.result, this.context)
		    },
		    is: function (all) {
		        this.extractSelectorStr()
		        this.selector = engine.create(this.selectorStr)
		        for (var i = 0; i < all.length; i++)
		            if (this.selector.is(all[i], all.context))
		                return true
		            return false;
		        },

		        /*	匹配所有元素的第一个与表达式匹配的上级元素，
		        @selectors	:String(可选) 选择器
		        @return :Array<Element>
		        */
		        closest: function (all) {
		            var context = all.context, col = new nsSelector.Collector()
		            this.extractSelectorStr()
		            var uCol = new nsSelector.Collector(null, true)
		            if (this.selectors.length == 0)
		                return all;
		            this.selector = engine.create(this.selectorStr)
		            for (var i = 0; i < all.length; i++) {
		                var el = all[i]
		                while (el && el.nodeType === 1 && uCol.push(el))
		                    if (this.selector.is(el, context)) {
		                        col.push(el)
		                        break;
		                    }
		                    else {
		                        el = el.parentNode;
		                    }
		            }
		            uCol = null;
		            return this.createResult(col.result, context);
		        },

		        /*	匹配所有元素的第一个与表达式匹配的上级元素，
		        @selectors	:String(可选) 选择器
		        @return :Array<Element>
		        */
		        parent: function (all) {
		            var context = all.context, col = new nsSelector.Collector()
		            this.extractSelectorStr()
		            var uCol = new nsSelector.Collector(null, true)
		            this.selector = this.selectors.length == 0 ? null : engine.create(this.selectorStr)
		            for (var i = 0; i < all.length; i++) {
		                var e = all[i].parentNode;
		                if (e && e.nodeType === 1 && uCol.push(e) && (!this.selector || this.selector.is(e, context)))
		                    col.push(e)
		            }
		            uCol = null
		            return this.createResult(col.result, context);
		        },


		        /*	匹配所有元素的第一个与表达式匹配的上级元素，
		        @selectors	:String(可选) 选择器
		        @return :Array<Element>
		        */
		        parents: function (all) {
		            var context = all.context, col = new nsSelector.Collector()
		            this.extractSelectorStr()
		            var uCol = new nsSelector.Collector(null, true)
		            this.selector = this.selectors.length == 0 ? null : engine.create(this.selectorStr)
		            for (var i = 0; i < all.length; i++) {
		                var e = all[i]
		                while ((e = e.parentNode) && e.nodeType === 1 && uCol.push(e))
		                    if (this.selector == null || this.selector.is(e, context))
		                        col.push(e)
		            }
		            uCol = null;
		            return this.createResult(col.result, context);
		        }

		    }).extend(nsSelector.DomQuery)

        //#end		

        function extendSelectorMethod(method) {
            method = $.isStr(this) ? this : method;
            qp.extend(method, function (selectors) {
                var q = new ui.selector.DomQuery(this.context, arguments)
                return q[method](this);
            })
        }
        $.each(["filter", "is", "closest", "parents"], extendSelectorMethod)

    })();
    //#end

    if (config.onLoad)
        $.onLoad(config.onLoad, $, $)

    /*	document 对象*/
    $.doc = $(docE)
    $.getBody = function () {
        /*	document.body 对象*/
        if ($.body)
            return $.body
        if (!doc.body)
            return null
        return $.body = $(doc.body)
    }
})(this);


// alert(new Date()-sTime)
