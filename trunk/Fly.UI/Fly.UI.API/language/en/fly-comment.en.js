//## fly
/* 
 * #C path:fly fly javacript library
 *
 * Copyright (c) 2009 KuiyouLi
 *
 * WebSite: http//:www.flyui.net
 *
 * Email:   flyui&hotmail.com
 * Version: 1.1 
 * Date:    2011-05-1
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
    Dom Query
    Call way：
    fly.$("a","div")
    fly.$("a,div")
    fly("a,div")
    fly("a","div")
    $("a","div")
    $("a,div")
    [document].$("a,div")
    [div1,div2].$("a,div")
		
    @selectors:String/Dom Any number of selectors(strings or elements)
    @return :Array Return eligible Dom object array 
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
    Named to the fly library that you can use the named variable to access fly library
    you can use the default variable $ like jquery or other variable
    you can named the variable to the fly library before loading fly library

    Example:

    flyConfig={
    alias:["myFly","jimo"]
    }

    Or call the addAlias function add a new name named for fly

    Example:

    fly.addAlias("myFly","jimo")
    now you can access fly library

    Usage：
    myFly.$("a,div")
    myFly("a","div")
    jimo.$("a","div")
    jimo("a,div")
			
    @alias :String Variable parameters，any number of alias name
    @return :fly
    */
    config.alias && (window[config.alias] = $);

    /* #M	path:flyConfig.onLoad
    Trigger callback function When fly library loaded 

    Example:

    flyConfig={
    alias:["myFly","jimo"],
    onLoad:function(){
    alert('fly has been loaded')
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
    /*	Create namespace
    @namespace:String namespace name，such as： fly.ui
    @return	:Namespace
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

    /*	Create Class
    @options: Options
    @return	:Class
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


    //## Extend
    /*	Extend
    @target	:Extended object
    @overrides:Contains parameters of any number of extended members
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
	    /* Register plugin
	    @name   :String plugin name
	    @fn     :Function plugin function
	    */
	    regPlugin: function (name, fn) {
	        var p = { name: fn ? name : "", fn: fn || name };
	        p.fn($);
	        $.context.plugins.push(p);
	        return this;
	    },
	    /* Install fly to other window
	    @window :Window The target window to be installing
	    @match  :match The plugin which to install,if empty install all plugins
	    */
	    setup: function (w, m) {
	        w.eval("(" + fSetup + ")()");
	        $.context.plugins.each(function (p) {
	            if (!m || m.test(p.name))
	                w.eval("fly.regPlugin(" + p.fn + ")")
	        })
	    },
	    /* Stop symbol:Stop to loop when break appear */
	    BREAK: {},
	    /* Verify
	    @prefix	:String The string used to be Prefix
	    @target	:Object The Object to be extended
	    @overrides	:Object Contains parameters of any number of extended members
	    @return	:target
	    */
	    safeExtend: function (prefix, target, overrides) {
	        return $.extend.apply(prefix, slice.call(arguments, 1))
	    },


	    /*  Check if exists before extend
	    @target	:Object to be extended
	    @overrides:Object Contains parameters of any number of extended members
	    @return	:target
	    */
	    extendIf: function (target, overrides) {
	        return $.extend.apply(false, arguments);
	    },
	    /*  Copy object
	    @obj    :Object the original object
	    @return :@obj   the new target from the original object
	    */
	    copy: function (obj) {
	        return $.extend({}, obj);
	    },
	    /*	Combine a group of objects to a new array object
	    Example：var all=fly.merge(obj1,obj2,obj3,....,objn)
	    @params	:Object Varible objects which be combind
	    @return	:Object A new array object which contains a group of objects 
	    */
	    //	    merge: function (params) {
	    //	        return $.extend.apply(null, [{}].concat(slice(arguments, 0)))
	    //	    },
	    /*  check object is null,if it's null,return the appointed object
	    @chkObj :Object the object to be detected
	    @replacement    :returned replacement when the chkObj is null
	    */
	    //	    nullIf: function (chkObj, replacement) {
	    //	        return chkObj == null ? replacement : chkObj
	    //	    },

	    /*  Get property
	    @obj:		object
	    @attribute:	String Property name
	    @return	:Object Property value
	    */
	    //	    get: function (obj, attribute) {
	    //	        if ($.isStr(obj)) return lib.ajax.get.apply(this, arguments);

	    //	        if (obj.attributes && !(attribute in obj))
	    //	            return obj.getAttribute(attribute)
	    //	        else
	    //	            return obj[attribute];
	    //	    },


	    /*  Set property
	    @obj:		Object
	    @attribute:	String/Object Contains property name or keyValue that contains property name and property value
	    @value	:	Object(not required) value
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
	    /*  Get or set property of the objects
	    @obj    :The objects which need to get or set attribute
	    @prop   :The property name or a json object
	    @value  :The value of the property
	    @return :Return the property value when value is empty or return fly object when value is not empty
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
	    /*  Get or set value of elements
	    @el    :The elements which need to get property value or set property value
	    @value  :If it is null to get the value, otherwise set the new value
	    @return :If it is null to return the value,otherwise return fly object
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

	    /*  Set property
	    @obj:		Object
	    @keyValues:	Object Contains property name or keyValue that contains property name and property value
	    @return	:obj
	    */
	    //	        setBy: function (obj, keyValues) {
	    //	            for (var key in keyValues)
	    //	                $._set(obj, key, keyValues[key])
	    //	            return obj
	    //	        },

	    /*  check object is instance of class or not
	    @obj    :The object of detection
	    @type   :Class name or value
	    @return :If obj is the instance of type or obj equal type to return true,othorwise return false
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

	        /*	Detect whether a value function
	        @obj	:The object of detection
	        @return	:Boolean
	        */
	        $.isFun = $.isFunction

	        /* #M	path:fly.isFunction detect whether a value Function
	        @obj	:The object of detection
	        @return	:Boolean
	        */

	        /* #M	path:fly.isDate detect whether a value Date
	        @obj	:The object of detection
	        @return	:Boolean
	        */

	        /* #M	path:fly.isNumber detect whether a value Number
	        @obj	:The object of detection
	        @return	:Boolean
	        */

	        /* #M	path:fly.isBoolean detect whether a value Boolean
	        @obj	:The object of detection
	        @return	:Boolean
	        */

	        /* #M	path:fly.isArray detect whether a value Array
	        @obj	:The object of detection
	        @return	:Boolean
	        */

	        /* #M	path:fly.isObject detect whether a value Object
	        @obj	:The object of detection
	        @return	:Boolean
	        */

	        /* #M	path:fly.isString detect whether a value String
	        @obj	:The object of detection
	        @return	:Boolean
	        */

	        /*	detect whether a value String
	        @obj	:The object of detection
	        @return	:Boolean
	        */
	        $.isStr = $.isString
	        return is;
	    } (),
	    /*      Detect whether a value is html
	    @str    :Detect whether a value is string
	    @return :Whether the string is html,return true or false
	    */
	    isHtml: function () {
	        var htmlExp = /<[\w]+[\s\S]+>/
	        return function (str) {
	            return $.isStr(str) && htmlExp.test(str)
	        }
	    } (),

	    /*	Detect if obj is Array
	    @obj:The object of detection
	    @return	:if obj is Array to return true,otherwise return false
	    */
	    likeArray: function (obj) {
	        return obj && (obj instanceof Array || (typeof (obj.length) == 'number' && !$.isFun(obj) && !$.isStr(obj) && !obj._$isWindow && (!obj.nodeName || !obj.ownerDocument)))
	    },


	    /*	Detect if obj is Dom 
	    @obj:The object of detection
	    @return	:Boolean
	    */
	    isDom: function (obj) {
	        return obj && obj.nodeType === 1 && obj.ownerDocument
	    },


	    /*  Convert obj to Array
	    @obj   :The object of detection
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


	    /*  Get a part of collection
	    @obj	:collection object
	    @start	:start position
	    @end	:end position
	    @return	:Array
	    */
	    slice: function (obj, start, end) {
	        return slice.call($.toArray(obj), start, end == undefined ? 100000000 : end)
	    },


	    /*	Traverse an object
	    @obj	:A array object
	    @fn		:Function 
	    @scope	:scope
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


	    /*	Detect whether an object in Array
	    例	:fly.inArray(3,1,2,3,4,...,n),fly.inArray(3,[1,2,3,4])
	    @value	:The detected value
	    @params	:Variable parameters,a group of object
	    @return	:return the index of the detected value in params
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

	    /*	Empty Function
	    @return	:this
	    */
	    emptyFun: function () {
	        return this
	    },


	    /*	return flaseFun
	    @return	:false
	    */
	    falseFun: function () {
	        return false
	    },


	    /*Package the object base on afferent parameters
	    @obj	:if obj is function to return obj，otherwise return a new function always return obj
	    @return	:Function
	    */
	    lambda: function (obj) {
	        return $.isFun(obj) ? obj : function () {
	            return obj
	        }
	    },


	    /*	if it's not function,then convert to function
	    @fun	:Object/String/Functon or string
	    @onlyStr:Boolean only function is string then convert
	    @format	:String
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


	    /*If function return result
	    @obj	:Function/Object 
	    @params	:Object any number of variable parameters
	    @return	:Boolean
	    */
	    ifFun: function (obj, params) {
	        if (obj && $.isFun(obj))
	            return arguments.length > 1 ? obj.apply(this, slice.call(arguments, 1)) : obj.call(this)
	        return obj
	    },

	    /* $format which extend to selector object
	    @obj    :String/Date/Function 
	    @params :any number of variable parameters
	    @return :String/Function  formated result
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

    /*	Detect whether an object in Array which the same as fly.inArray,
    Example	:fly.In(3,1,2,3,4,...,n),fly.In(3,[1,2,3,4])
    @value	:detected value
    @params	:any number of variable parameters
    @return	:return the index of value in Array
    */
    $.In = $.inArray
    //#end

    //## Function
    /* #C function extend*/
    fly.lib.Function = $.extend(
	{
	    /*	Whether execute base on the condition
	    @predicate:determine whether to implement the expression, function or other objects
	    @args	:any number of variable parameters
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


	    /*	Bind scope
	    @scope	:scope
	    @params	:any number of variable parameters
	    @return	:Function
	    */
	    bind: function (scope, params) {
	        var old = this;
	        var args = arguments.length > 1 ? slice.call(arguments, 1) : null;
	        return function () {
	            return old.apply(scope || win, args || arguments)
	        }
	    },


	    /*	Formate parameters
	    如：fn.$format('@{2}','@{*}',12,"@{1,5}","@{2-6}") or "{1}"、"{*}"、"{2-6}"
	    @params:String/Object 
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

	    /*	Inherit
	    @base	:Base class
	    @overrides:Contains any number of extended members
	    @return	:this
	    */
	    inherit: function (base, overrides) {
	        var o = overrides || {}
	        o.constructor = this
	        o.base = base;
	        return $.Class(o);
	    },

	    /*	Extend
	    @overrides:Contains any number of extended members
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
    /*#C Data extend*/
    fly.lib.Date = $.extend(
	{
	    /*	formate date
	    @format	:String date formate default: yyyy-MM-dd hh:mm:ss
	    @return	:String 
	    */
	    format: function (format) {
	        format = format || "yyyy-MM-dd HH:mm:ss";
	        var o =
			{
			    //year
			    "y+": this.getFullYear(),
			    //month 
			    "M+": this.getMonth() + 1,
			    //day
			    "d+": this.getDate(),
			    //24 hour
			    "H+": this.getHours(),
			    //12 hour
			    "h+": this.getHours() % 12,
			    //minute
			    "m+": this.getMinutes(),
			    //second
			    "s+": this.getSeconds(),
			    //millisecond
			    "S+": this.getMilliseconds(),
			    //week upper case
			    "W+": fly.lib.Date.W[this.getDay()],
			    //week lower case
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
    /*#C String Extend*/
    fly.lib.String = $.extend(
	{
	    formatReg: /\{([^{}]+)\}/g,
	    /*	format string
	    Example:
	    the result of "a{0}b{1}".format("-",5) is "a-b5"
			
	    var option={id:123,name:"fly"};
	    the result of "a{0}b {name}".format("-",option) is "a-b fly"
			
	    var option={
	    getId:function(){
	    return 123
	    }
	    };
	    the result of "a{0}b {getId()}".format("-",option) is "a-b 123"
			
	    @params	:Object Any number of variable parameters
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


	    /*	If a string contains another string
	    @subStr	:string to be checked
	    @ignoreCase:ignoreCase
	    @separator:separator
	    @return	:Boolean
	    */
	    contains: function (subStr, ignoreCase, separator) {
	        return this.IndexOf(subStr, ignoreCase, separator) > -1;
	    },

	    /*	Get The index of substring
	    @subStr	:The substring 
	    @ignoreCase:Ignore case
	    @separator:Separator
	    @return	:Int
	    */
	    IndexOf: function (subStr, ignoreCase, separator) {
	        if (subStr == null)
	            return -1;
	        var ss = separator || ''
	        var s = ss ? ss + this + ss : this, sub = ss ? ss + subStr + ss : subStr;

	        return ignoreCase ? s.toUpperCase().indexOf(sub.toUpperCase()) : s.indexOf(sub);
	    },

	    /*	Whether the specified string at the beginning of the string
	    @subStr	:The specified string
	    @ignoreCase:ignore case
	    @return	:Boolean
	    */
	    startWith: function (subStr, ignoreCase) {
	        if (subStr == null) return false;
	        var s = this.substr(0, subStr.length)
	        return ignoreCase ? (s.toUpperCase() == subStr.toUpperCase()) : (s == subStr)
	    },

	    /*	Whether the specified string at the end of the string
	    @subStr	:The specified string
	    @ignoreCase:ignore case
	    @return	:Boolean
	    */
	    endWith: function (subStr, ignoreCase) {
	        if (subStr == null) return false;
	        var s = this.substr(this.length - subStr.length)
	        return ignoreCase ? (s.toUpperCase() == subStr.toUpperCase()) : (s == subStr)
	    },


	    /*	Trim empty string in string's left and right
	    @return	:String
	    */
	    trim: function () {
	        return this.replace(/(^\s+)|(\s+$)/g, "");
	    },
	    /*	Trim left empty string 
	    @return	:String
	    */
	    trimLeft: function () {
	        return this.replace(/^\s+/g, "");
	    },

	    /*	Trim right empty string 
	    @return	:String
	    */
	    trimRight: function () {
	        return this.replace(/\s+$/g, "");
	    },

	    /*	Uppercase first letter
	    @return	:String
	    */
	    firstUpper: function () {
	        return this.charAt(0).toUpperCase() + this.substr(1)
	    },


	    /*	Repeat the specified number of times
	    @count	:the number of times
	    @return	:String
	    */
	    repeat: function (count) {
	        var r = '';
	        while (count-- > 0)
	            r += this
	        return r
	    },


	    /*	Fill the specified number of times of char to string's left
	    @minLength:Int Mininum length
	    @_char	:String The char will be filled in
	    @return	:String
	    */
	    padLeft: function (minLength, _char) {
	        return (_char == null ? ' ' : _char.toString()).$repeat(minLength - this.length) + this
	    },


	    /*	Fill the specified number of times of char to string's right
	    @minLength:Int Mininum length
	    @_char	:String The char will be filled in
	    @return	:String
	    */
	    padRight: function (minLength, _char) {
	        return this + (_char == null ? ' ' : _char.toString()).$repeat(minLength - this.length)
	    },
	    /*  Convert a string to camel naming
	    @wordSplitChar  :String The separator of string
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
    Event disposer
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

        //Set event
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
                // mouse key
                evt.button = e.button ? this.btnMap[e.button] : (e.which ? e.which - 1 : -1);
                if (e.type == 'click' && evt.button == -1)
                    evt.button = 0;
                // check press the Ctrl key
                evt.ctrlKey = e.ctrlKey || e.metaKey || false;
                //Keyboard keycode
                evt.keyCode = e.keyCode == undefined ? e.which : e.keyCode
                // event source
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

        //Restore event
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

        /*	Bind the event for the elements
        @el	:Object/Array<Object> Any number of DOM object
        @eName	:String/Array<String> Any number of Event Name
        @fn		:Function/Array<Function> One or more Event handler
        @scope  :scope 
        @data	:Object parameters
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

        /*	Cancel the Event for the elements
        @el	:Object/Array<Object> Any number of DOM object
        @eName	:String/Array<String> Any number of Event Name
        @fn		:Function/Array<Function> One or more Event handler
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


        /*	Trigger Event
        @el	:Object/Array<Object> Any number of DOM object
        @eName	:String/Array<String> Any number of Event Name
        @scope  :scope
        @args	:parameters
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

        /*	Stop the propagation of event and prevent the default event of the elements
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

        /* Create custom event
        @eName  :String Event Name
        @fire   :Function  Event handler
        @return :Function Additional functions or respond to events
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

        /*	Register events for Dom object
        @obj :Object which be waitting to register events
        @eventNames	:Array Any number of registered event's names
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

        /*  Make the object with the event management mechanism
        @obj    :Object In addition to any value type object
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

    //Event handler object
    fly.Event = fly.lib.Event = new lib.EventManager()

    /*	
     * Bind multiple objects to  window.onload
     * @fu	:Function Any number of varible parameters
     * @return	:fly
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


    /*	Bind multiple objects to  window.onload
    @fu	:Function Any number of varible parameters
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


    /* Bind multiple functions to window.onunload
    @params	:Any number of variable parameters
    @return	:fly
    */
    $.onUnload = function (params) {
        $.Event.on(win, "unload", arguments)
        return $
    }

    /* Bind multiple functions window.onBeforeUnload
    @params	:Function Any number of variable parameters
    @return	:fly
    */
    $.onBeforeUnload = function (params) {
        $.Event.on(win, "beforeunload", arguments)
        return $
    }
    //#end

    //## fly.lib.Json
    /*#C path:fly.lib.Json
    Json tool
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
        /*	Encode array
        @o   :Array array
        @jsonEncode  :Boolean Whether json format or not
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


        /*  Encode datetime
        @o   :Date datetime object
        @jsonEncode  :Boolean Whether json format or not
        @return	:String
        */
        this.encodeDate = function (o, jsonEncode) {
            var t = o.$format("yyyy-MM-dd hh:mm:ss");
            return needJsonEncode(jsonEncode) ? '"' + t + '"' : t
        };


        /*  Encode object
        @o   :object Which need to be encode
        @jsonEncode  :Boolean Whether json format or not
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


        /*  Eecode string
        @json   :json Object which need to be decode   
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
        /*  Encode the Json object to string that after url encoded
        @json   :Object The object to be encode
        @memberToParam :Boolean Whether encoding members to parameters
        @prefix :String prefix
        @return :String encoded string
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

        /*  Decode the string that after url encoded to Json object */
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


        /*	Traverse object 
        @json	:object
        @action	:Function Handler function
        @params	:Object Any number of variable parameters
        @return :json
        */
        this.each = function (json, action, params) {
            return qp.each.apply(json, slice.call(arguments, 1))
        }


        /*	Convert result to array
        @json	:array
        @evaluator:Function/String/Object Eval handler
        @params	:Object(not Required) any number of variable parameters
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

    HTTP request to load remote data
    usage:
    {
    url     :String requst url
    method  :String request method(get or post) default get
    async   :Boolean    Whether asynchronous(default true)
    dataHandler:Function    handle the return data then return handled data
    charset :String encode,default:GB2312
    username:String username,verify for server 
    password:String pwd,verify for server 
    timeout :Int    Timeout(millisecond)
    data    :Json/String   the data send to server
    }

    call:

    var helper=new fly.ajax.Helper({
    url:'http://www.flyui.net/a.php',
    method:'get',
    success:function(){
    alert('Request successful!')
    }
    })
    helper.go();

    ------------------------------------------
    var helper=new fly.ajax.Helper()
    helper.setup({
    url:'http://www.flyui.net/a.php',
    method:'get',
    success:function(){
    alert('Request successful!')
    }
    })
    helper.go();

    ------------------------------------------
    fly.get('http://www.flyui.net/a.php',function(){
    alert('Request successful!')
    });

    ------------------------------------------
    fly.post('http://www.flyui.net/a.php',function(){
    alert('Request successful!')
    });

    ------------------------------------------
    var helper=fly.ajax.url('http://www.flyui.net/a.php').method('get').onSuccess(function(){
    alert('Request successful!')
    }).go();
            
    ------------------------------------------
    var helper=fly.ajax.url('http://www.flyui.net/a.php').onSuccess(function(){
    alert('Request successful!')
    }).get();

    */

    var ajax = fly.lib.ajax = fly.ajax = function (option) {
        var helper = new ajax.Helper(option)
        if (arguments.length > 0 && $.is(this, lib.ajax) === false && helper.autoLoad != false)
            return helper.go();
        return helper;
    }

    /*#M path:fly.ajax.Helper.url set request url
    @url    :String address
    @return :this
    */
    /*#M path:fly.ajax.Helper.method Set request method
    @method    :String Get or post,default:get
    @return :this
    */

    /*#M path:fly.ajax.Helper.async set whether async request
    @async    :Boolean Whether async,default:true
    @return :this
    */

    /*#M path:fly.ajax.Helper.dataHandler set the return function when requst the server data
    @dataHandler    :Function   handler function
    @return :this
    */

    /*#M path:fly.ajax.Helper.contentType set HTTP header:contentType
    @contentType    :String   default:application/x-www-form-urlencoded
    @return :this
    */

    /*#M path:fly.ajax.Helper.charset set HTTP header:charset
    @charset    :String   encode,default:GB2312
    @return :this
    */

    /*#M path:fly.ajax.Helper.username set username verify in server
    @username    :String   username
    @return :this
    */

    /*#M path:fly.ajax.Helper.password set password verify in server
    @password    :String   password
    @return :this
    */

    /*#M path:fly.ajax.Helper.timeout set Timeout(millisecond)
    @timeout    :Int   Timeout(millisecond)
    @return :this
    */

    /*#M path:fly.ajax.Helper.data set the data send to server
    @data    :Json   the data send to server
    @return :this
    */

    ajax.Option = {
        url: location.href,
        method: null,
        dataType: "",
        async: true,
        parameterName: "par_{0}",
        dataHandler: undefined, /*Function    handler the data of the server'response to create a new data*/
        /*String    default:application/x-www-form-urlencoded*/
        contentType: "application/x-www-form-urlencoded",
        charset: "GB2312",
        username: undefined,/*String username verify in server*/
        /*String password,verify in server*/
        password: undefined,
        /*Int    Timeout(millisecond)*/
        timeout: -1,
        /*Json/String   the data send to server*/
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
    Execute before the beginning of Ajax request, return false to cancel the request*/

    /* #E path:fly.ajax.Helper.onError
    Execute when Ajax request error*/

    /* #E path:fly.ajax.Helper.onSuccess
    Execute when Ajax request success。*/

    /* #E path:fly.ajax.Helper.onComplete
    Execute when Ajax request complete*/

    /* #E path:fly.ajax.Helper.onSend
    Execute before Ajax request send data,return false cancel the request*/

    /* #E path:fly.ajax.Helper.onStop
    Execute when Ajax request stop*/

    /* #E path:fly.ajax.Helper.onReadystatechange
    Execute when Ajax is requesting and server has respond*/


    ajax.Eevents = ["onStart", "onError", "onSuccess", "onComplete", "onSend", "onStop", "onReadystatechange"]
    lib.Event.registEvent(ajax.Helper, ajax.Eevents);
    ajax.Helper.$extend(
 	{
 	    option: null,
 	    /*Re-config ajax option
 	    @option :Json Contain detailed configuration of Json object
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
 	    /*  Send a request to server using “get” method
 	    @url    :String request url
 	    @data   :Json(not required) the data send to server
 	    @success:Function(not required)   the callback function when request success
 	    @error  :Function(not required)   the callback function when failed 
 	    @return :Object/this  When the synchronization request is to return the server output, asynchronous call is to return an instance of the current fly.ajax.Helper instance
 	    */
 	    get: function () {
 	        this.option.method = "GET"
 	        return this.go.apply(this, arguments)
 	    },
 	    /*  Send a request to server using “post” method
 	    @url    :String request url
 	    @data   :Json(not required) the data send to server
 	    @success:Function(not required)   the callback function when request success
 	    @error  :Function(not required)   the callback function when failed 
 	    @return :Object/this   When the synchronization request is to return the server output, asynchronous call is to return an instance of the current fly.ajax.Helper instance
 	    */
 	    post: function () {
 	        this.option.method = "POST"
 	        return this.go.apply(this, arguments)
 	    },
 	    /*  Send request to server
 	    @url    :String request url
 	    @data   :Json(not required) the data send to server
 	    @success:Function(not required)   the callback function when request success
 	    @error  :Function(not required)   the callback function when failed 
 	    @return :Object/this    When the synchronization request is to return the server output, asynchronous call is to return an instance of the current fly.ajax.Helper instance
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
 	        o.username != undefined ? conn.open(o.method, url, o.async, o.username, o.password) : conn.open(o.method, url, o.async);
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
 	    /*  Dynamic loading js file
 	    @url    :file url
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
 	    /*  Output from the server
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
    /*#C Cookie Tools*/
    fly.lib.Cookie = fly.Cookie = $.extend(
	{
	    /*	Set Cookie
	    @name	:String cookie name
	    @value	:String cookie value
	    @expires:Date expiry date 
	    @path	:String path
	    @domain	:String scope
	    @secure	:Boolean 
	    @return	:fly.lib.Cookie
	    */
	    set: function (name, value, expires, path, domain, secure) {
	        var path = path == null ? '/' : path
	        doc.cookie = name + "=" + escape(value) + ((expires == null) ? "" : ("; expires=" + expires.toGMTString())) + ((path == null) ? "" : ("; path=" + path)) + ((domain == null) ? "" : ("; domain=" + domain)) + ((secure == true) ? "; secure" : "");
	        return lib.Cookie
	    },


	    /*	Get Cookie
	    @path	:String path
	    @name	:String cookie name
	    @return	:String cookie value
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


	    /*	Delete Cookie
	    @name	:String cookie name
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
    CSS tools
    */
    fly.ui.StyleUtils = function () {
        var me = this
        /*  Load CSS
        @url:String CSS filepath
        @return:Element link element
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

        /*  Create CSS
        @cssText:String CSS content
        @return :Element style element
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

        /*  Create CSS class
        @sheet  :StyleSheet(not required) CSS element
        @name   :String CSS class name
        @cssText:String CSS content
        @return :StyleSheetRule CSS class
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

        /*	Get the current style of elements
        @el		:Element 
        @return	:currentStyle
        */
        this.currentStyle = function (el) {
            return el.currentStyle || doc.defaultView.getComputedStyle(el, null)
        }

        /*	Detect style value
        @name	:String style name
        @value	:Object style value
        @return :Object the treated property value
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


        /*	Get element style
        @el		:Element The element need to get css
        @name	:String css name
        @return	:String css value
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

        /*	Get the number of the elements which name is the value of the paratemter 'name'
        @el		:Element The element need to get style
        @name	:String Style name
        @return	:Number Style value
        */
        this.num = function (el, name) {
            return Number((me.get(el, name) + " ").replace(/[^\d-\.]/g, "")) || 0
        }

        /*	set element style
        @el		:Element The element need to get style
        @name	:String Style name
        @value	:Object Style value
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

    //Style processing
    fly.Style = fly.ui.Style = new ui.StyleUtils();
    var styleHelper = fly.ui.Style
    //#end


    //## fly.ui.DomHelper
    /*#C path:fly.ui.DomHelper
    Dom tools
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

        /*	Get unique ID for element
        @el	:Element Dom element
        @return	:Int Element ID
        */
        this.getUniqueID = function (el) {
            el = el == doc ? docE : el
            return el.uniqueNumber != undefined ? el.uniqueNumber : (el.uniqueNumber = "$" + me.uniqueNumber++)
        }

        /*	Create a DOM element according to Html
        @html	:String html content
        @return	:Element/Array<Element> DOM elements are created
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


        /*	Insert object
        @pos	:String insert position(beforeBegin,afterBegin,beforeEnd,afterEnd)
        @parent	:Element parent element
        @child	:Element/Array<Element> child element
        @returnDom:Boolean Whether to return DOM element
        @return	:Element/Array if returnDom equal true to return DOM element,otherwise return the element's collection
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

        /* Inserted before the element object
        @el	    :Element    Inserted before the element object
        @child  :Element/Array<Element> To insert one or more of Dom elements
        @returnDom:Boolean Whether to return DOM elements
        @return	:Element/Array returnDom  is equal to true to return DOM object, otherwise returns a collection containing the elements
        */
        this.insertBefore = function (el, child, returnDom) {
            return me.doInsert($bb, el, child, returnDom);
        }


        /* Inserted after the element object
        @el	    :Element    Inserted after the element object
        @child  :Element/Array<Element> To insert one or more of Dom elements
        @returnDom:Boolean Whether to return DOM elements
        @return	:Element/Array returnDom  is equal to true to return DOM object, otherwise returns a collection containing the elements
        */
        this.insertAfter = function (el, child, returnDom) {
            return me.doInsert($ae, el, child, returnDom);
        }


        /* Insert the object in the element start
        @el	    :Element   Insert the object in the element start
        @child  :Element/Array<Element> To insert one or more of Dom elements
        @returnDom:Boolean Whether to return DOM elements
        @return	:Element/Array returnDom  is equal to true to return DOM object, otherwise returns a collection containing the elements
        */
        this.insertFirst = function (el, child, returnDom) {
            return me.doInsert($ab, el, child, returnDom);
        }



        /* An element attached to the end of an object
        @el	    :Element   An element attached to the end of an object
        @child  :Element/Array<Element>  To insert one or more of Dom elements
        @returnDom:Boolean Whether to return DOM elements
        @return	:Element/Array returnDom  is equal to true to return DOM object, otherwise returns a collection containing the elements
        */
        this.append = function (el, child, returnDom) {
            return me.doInsert($be, el, child, returnDom);
        }

        /*	Get child elements of the Dom，not contains #text 
        @child	:To obtain the child elements of the Dom element
        @return	:Array  All child elements of the element
        */
        this.children = function (child) {
            if (child.children || (e == doc ? (e = docE).children : false))
                return e.children
            return $.toArray(e.childNodes).where("o=>o.nodeType==1")
        }

        /* Move content to another element
        @from   :Element    Move all content to another element
        @to     :Element    Element is to be moved
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

        /*  clear element content
        @el   :Element     clear element content
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

        /* Change CSS style
        Call Example：
        var cls=fly.simple.changeCss(document.body,"css-blue css-red","css-yellow")
        Remove document.body the css-blue and css-red style，add css-yellow style to document.body
                
        var oldCls="css-gray css-blue css-red"
        var cls=fly.simple.changeCss(oldCls,"css-blue css-red","css-yellow")
        Remove oldCls,css-blue and css-red style，add css-yellow style
        Call result cls equal“css-gray css-yellow”

        Note：
        The method is to add after the implementation of remove, if the same patterns appear in both removeCss and addCss parameters, the style was eventually added, 
        such as:
        var oldCls="css-gray a b"
        var cls=fly.simple.changeCss(oldCls,"a b","b")
        To remove the a and b in oldCls style, then add b style
        Call result cls equal “css-gray b”

        @el    :Element/String To change the style of the DOM object or string
        @removeCss  :String To remove a style, a number of styles are separated by spaces
        @addCss :String To additional style, a number of styles are separated by spaces
        @return :String After the change of style
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

        /*	Add CSS style
        @el    :Element DOM element
        @css	:String additional style
        @return	:String After the change of style
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

        /*	Remove CSS style
        @el    :Element DOM element
        @css	:String To remove the name of style
        @return	:String After the change of style
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

        /*	Whether to include the name of a CSS
        @el    :Element DOM Element
        @css	:String To detect the CSS name
        @return	:Boolean
        */
        this.hasClass = function (el, css) {
            if (arguments.length == 1)
                css = el, el = this;
            el.isIList && (el = el.item(0))
            return el && el.className.contains(css, false, ' ')
        }

        /*  clone elements
        @el     :Element    To clone the element
        @return :Element    The new element to be cloned
        */
        this.clone = function (el) {
            return el.cloneNode();
        }

        /*  Converted to HTML
        @el :Element    Html Element
        @return :String HTML elements
        */
        this.toHtml = function (el) {
            if (el.isIList) {
                return el.select(me.toHtml).join("");
            }
            return el.outerHTML;
        }

        if (doc.compareDocumentPosition)
        /* Detect whether the element contains another element
        @parent :Element   parent element
        @child  :Element   child element
        @return :Boolean   When the parent contains the child returns true, otherwise returns false
        */
            this.contains = function (parent, child) {
                return !!(parent.compareDocumentPosition(child) & 16);
            }
        else
            this.contains = function (parent, child) {
                return parent !== child && (parent.contains ? parent.contains(child) : true);
            }

        /*  Detect whether an element can get the focus
        @el :Element    To detect the elements
        @return :Boolean    Can get the focus returns true, otherwise returns false
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

        /*  Detect the element whether to accept the Tab key  
        @el     :Element   To detect the elements
        @return :Boolean   Can get the focus returns true,otherwise returns false
        */
        this.tabbable = function (el) {
            var tabIndex = me.tabIndex(el);
            return (isNaN(tabIndex) || tabIndex >= 0) && me.focusable(el)
        }

        /*  Detect element is visible
        @el     :Element    DOM Element
        @return :Boolean
        */
        this.isVisible = function (el) {
            return styleHelper.get(el, 'visibility') !== "hidden"
        }

        /*  Detect element is display
        @el     :Element    DOM element
        @return :Boolean
        */
        this.isDisplay = function (el) {
            return styleHelper.get(el, 'display') !== 'none'
        }

        /*  Detect element is hidden
        @el     :Element    DOM element
        @return :Boolean
        */
        this.isHidden = function (el) {
            return (el.nodeName === 'INPUT' && el.type === 'hidden') || !me.isDisplay(el) || !me.isVisible(el)
        }

        /*  Get the tabindex of element
        @el     :Element    DOM element
        @return :Int
        */
        this.tabIndex = $.attrGeters.tabindex = function (el) {
            var node = el.getAttributeNode("tabindex");
            if (node != null && node.specified)
                return node.value;
            return $.foucsableTypeRegs.test(el.nodeName) || ($.clickableTypeRegs.test(el.nodeName) && el.href) ? 0 : undefined;
        }

        /* Cancel the selection of the page
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
        /*  Get element's location and size in the page
        @el     :Element    DOM element
        @return :Json   Json object that element in the page  contains the location and size information 
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
    Extend collection object
    */
    fly.collection.IList = fly.fn = qp = {
        $: $,
        find: $,
        allTypes: [],
        /* extend fly.collection.IList member
        @name   :String/Json member name or contains keyValue several members
        @v     :Function/Object member
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

        /*	Class original type*/
        $type: null,

        /*	Create new instance
        @arr	:Array The initial element
        @return	:IList IList new object
        */
        $create: function (arr) {
            return new this.$type(arr)
        },

        /*	Boolean fly.collection.IList symbol*/
        isIList: true,

        /*	Get the object can traverse
        @obj:If you pass the parameters to obtain the object can be traversed, otherwise return the current object can traverse
        @return:Array
        */
        getItems: function (obj) {
            if (arguments.length == 1) {
                obj.getItems && (obj = obj.getItems())
                return $.toArray(obj)
            }
            return this.items || this
        },

        /*	Update length
        @return	:this
        */
        updateLength: function () {
            this.items && (this.length = this.items.length)
            return this
        },

        /*	Get the specified item's location
        @index	:Int index starts at 0
        @return :Object
        */
        item: function (index) {
            return this.getItems()[index]
        },

        //##
        /*	Generate a new IList object,each of the items will be combined
        @evaluator:evaluator
        @scope  :scope
        @params	:Object(not required) any number of variable parameters
        @return	:IList
        */
        selectMany: function (evaluator, scope, params) {
            this._select.__collect = function (r, o) {
                o && r.merge(o);
            }
            return this._select.apply(this, arguments)
        },

        /*	Generate a new IList object,null values ​​ignored
        @evaluator:evaluator
        @scope  :scope
        @params	:Object(not required) any number of variable parameters
        @return	:IList
        */
        selectNotNull: function (evaluator, scope, params) {
            this._select.__collect = function (r, o) {
                o && r.push(o);
            }
            return this._select.apply(this, arguments)
        },

        /*	Generate a new IList object
        @evaluator:evaluator
        @scope  :scope
        @params	:Object(not required) any number of variable parameters
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



        /*	Return a specified number of consecutive elements from the beginning of the sequence
        @count:int get the number can be negative integers
        isAssending	: Boolean Is ascending
        @predicate	:Function/String/Object Each element is used to test the function satisfy the condition
        @params	:Object(not required) any number of variable parameters
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

        //## Traversal all items
        /*	Traversal all items
        @action	:Function/String/Object Processing a callback function for each
        @params	:Object(not required) any number of variable parameters
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


        /*	Get a collection of non-repetition
        comparer:Function A comparer that compare the value
        @return	:IList
        */
        uniquelize: function (comparer) {
            var r = [];
            this.$each(function (o) {
                r.contains(o, comparer) || r.push(o)
            })
            return this.create ? this.create(r) : r
        },

        /*	Get the elements not in the specified collection
        @list :Another element used to compare
        @comparer:Function a comparer that used to compare value
        @return	:IList 
        */
        notIn: function (list, comparer) {
            return this.where(function (o) {
                return list.indexOf(o, 0, comparer) < 0
            })
        },


        /*	  Get the intersection of two collection
        @list :Another collection is used to find intersection
        @comparer:Function a comparer that used to compare value
        @return	:IList the intersection of two collection
        */
        intersect: function (list, comparer) {
            return this.where(function (o) {
                return list.indexOf(o, 0, comparer) > -1
            })
        },

        /*	Convert to json
        @keySelector	:Function Function that get key from each element
        @valueSelector	:Function Convered function that produce result from each element
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

        /*	Add an event for each item
        @eNames	:Object/Array<Object>  One or more event type
        @actions	:Function/Array<Function> One or more callback functions
        @data	:The data to be passed
        @return:this
        */
        on: function (eNames, actions, data) {
            $.Event.on.apply($.Event, [this.getItems()].merge(arguments));
            return this;
        },


        /*	Unload events for each
        eNames	:Object/Array<Object>  One or more event type
        actions	:Function/Array<Function> One or more callback functions
        @return:this
        */
        un: function (eNames, actions) {
            $.Event.un.apply($.Event, [this.getItems()].merge(arguments));
            return this;
        },

        /*	Unload events for each
        eNames	:Object/Array<Object> One or more event type
        actions	:Function/Array<Function>  One or more callback functions
        @return:this
        */
        fire: function (eNames, params) {
            $.Event.fire.apply($.Event, [this.getItems()].merge(arguments));
            return this;
        },
        /*  Sort 
        @dir    :Boolean/String Sort direction,false,"DESC" indicate descending,others indicate ascending
        @compare:Object/Function Sort comparison rules, can be a field name, can be a function
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

        //## Other
        /*	Add after the collection 
        @item	:Object To add a new item
        @return:this
        */
        add: function (item) {
            return this.addRange(item)
        },

        //## Other
        /*	Batch add after the collection 
        @items	:Array Object To add a new item
        @return:this
        */
        addRange: function (items) {
            var all = this.getItems()
            arrP.push.apply(all, $.likeArray(items) ? $.toArray(items) : arguments)
            this.updateLength()
            return this;
        },


        /*	Insert
        @index	:Int Insert the target position (from 0)
        @items	:Array(not required) To insert any number of items
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


        /*	Delete
        @index	:Int Delete the target position (from 0)
        @items	:Array(not required) To delete any number of items
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


        /* Search the index of the first match in the collection
        @value	:Search value
        @startIndex:Int Start position
        @endIndex   :Int End position
        @comparer:Function/String/Object A comparer that used to compare value
        @return	:Int If you find the item of the first match, compared to the zero-based index,otherwise -1
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

        /* Search for the index of the last match in the collection
        @value	:The value of search
        @startIndex:Int Start postion
        @comparer:Function/String/Object A comparer that used to compare to value
        @return	:Int If you find an item's final match, compared to the zero-based index,otherwise -1
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
        //	    @predicate	:Function/String/Object Each element is used to test the function satisfy the condition
        //	    */
        //	    findIndex: function (predicate, startIndex, endIndex, comparer) {
        //	        var fn = $.toFun(predicate)
        //	        return this.indexOf(null, startIndex, endIndex, function (o1, o2, a) {
        //	            var o = fn.call(o1, o1)
        //	            return comparer ? comparer.call(o1, o1, o, a) : o
        //	        })
        //	    },

        //	    /*
        //	    @predicate	:Function/String/Object Each element is used to test the function satisfy the condition
        //	    */
        //	    findLastIndex: function (predicate, startIndex, endIndex, comparer) {
        //	        var fn = $.toFun(predicate)
        //	        return this.lastIndexOf(null, startIndex, endIndex, function (o1, o2, a) {
        //	            var o = fn.call(o1, o1)
        //	            return comparer ? comparer.call(o1, o1, o, a) : o
        //	        })
        //	    },


        /* Detect value exists in collection
        @value	:The value of search
        @startIndex:Int Start position
        @comparer:Function/String/Object A comparer that used to compare to value
        @return	:Boolean
        */
        contains: function (value, startIndex, comparer) {
            return this.indexOf(value, startIndex, comparer) > -1
        },


        /*	Copied to the new array
        @index	:Int Insert the target position (from 0)
        @arr	:Array Copied to the array, empty array will generate a new array
        @return	:arr
        */
        copyTo: function (index, arr) {
            arrP.splice.apply(arr || (arr = []), [index, 0].concat(this.getItems()))
            return arr;
        },

        /*	Copy
        @index	:Int Insert the target position (from 0)
        @arr	:Array Copied to the array, empty array will generate a new array
        @return	:arr
        */
        copy: function (start, end) {
            var arr = arrP.slice.apply(this.getItems(), [start || 0, end == null ? this.length : end])
            return this.create ? this.create(arr) : arr
        },


        /*  Combine multiple objects
        @params  :Any number of variable parameters
        @return:this
        */
        merge: function (params) {
            var all = this.getItems()
            for (var i = 0; i < arguments.length; i++)
                arrP.push.apply(all, qp.getItems(arguments[i]))
            return this
        },


        /*  Set object properties
        @properties  :Object Contains serveral properties and keyValue
        @return:this
        */
        //	    setAttr: function (properties) {
        //	        this.$each(function (o) {
        //	            $.set(o, properties)
        //	        })
        //	        return this
        //	    },
        //#end


        /*	Get or set property of the object, only the name parameter is to get the property value
        @name	:String Property name or property to be applied to the object keys and values ​
        @value	:Object(not required) Css property value
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

        /*	Get or set the object's attribute, only the name parameter is passed, to get the property value
        @name	:String Property name or to apply to the key and value object property
        @value	:Object(not required) Property value
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

        /*	Get or set the object's attribute, only the name parameter is passed, to get the property value.
        @name	:String Property name or to apply to the key and value object property
        @value	:Object(not required) Property value
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


        /*	Remove the object property
        @name	:String To remove the attribute name
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

        /*  Get or set multiple element value
        @values :KeyValue(not required) Set the value to more than one element, empty to get the element's value
        @ignoreDisabled:Disabled elements are ignored
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
        /* Get or set value
        @value  :Object The new value
        @return :Object/this   When you do not specify value parameter,then return value of the first element, specify the value parameter returns the current object
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

        /*  Values ​​of all elements set url encoding
        @return :String
        */
        serialize: function () {
            return lib.Json.urlEncode(this.values())
        },

        /*  Whether the specified element is child elements of the current element
        @child  :Selector/Element   child element
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

        /*  The specified element is the parent element of the current
        @parent  :Selector/Element   parent element
        @return :Boolean 
        */
        hasParent: function (parent) {
            return $(parent).isChild(this);
        },

        /*  To change the style of each
        @removeCss  :String To remove a style, a number of styles are separated by spaces
        @addCss :String To append the style, many styles are separated by spaces
        @return :String After the change of style
        */
        changeClass: function (removeCss, addCss) {
            dh.changeClass(this, removeCss, addCss);
            return this
        },


        /*	Add a CSS style for each
        @css	:String Add the new css
        @return	:this
        */
        addClass: function (css) {
            dh.addClass(this, css);
            return this
        },

        /*	Remove the CSS styles for each
        @css	:String To remove the name of style
        @return	:this
        */
        removeClass: function (css) {
            dh.removeClass(this, css)
            return this
        },

        /*	Whether to include an style name of the first item
        @css	:String The CSS name is to be detected
        @return	:this
        */
        hasClass: function (css) {
            var first = this.item(0)
            if (first)
                return dh.hasClass(first, css)
            return false
        },

        /*  Convert to HTML
        @return :String 
        */
        toHtml: function () {
            return dh.toHtml(this)
        },

        /*  Clone element
        @return :Element
        */
        clone: function () {
            var ne = this.create();
            this.each(function () {
                ne.add(this.cloneNode())
            })
            return ne;
        },

        /*  Get the first element in the location and size of the page
        @return :Json   Elements in the page that contains the location and size information Json object
        */
        rect: function () {
            return dh.rect(this.item(0))
        },

        /*	Get the position of the first
        @return	:Json   such as:{left:123,top:456}
        */
        pos: function () {
            return {
                left: parseInt(this.left()) || 0,
                top: parseInt(this.top()) || 0,
                bottom: parseInt(this.bottom()) || 0,
                right: parseInt(this.right()) || 0
            }
        },

        /*	Get the offset of the first
        @return	:Json   such as:{left:123,top:456}
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

        /*	Get the size of the first
        @return	:Json   such as:{width:123,height:456}
        */
        size: function () {
            return {
                width: parseInt(this.width()) || this.item(0).offsetWidth,
                height: parseInt(this.height()) || this.item(0).offsetHeight
            }
        },

        /*	Remove the focus
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

        /*	Set the focus 
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
        /*	Detect whether the first element can get focus
        @return	:Boolean
        */
        focusable: function () {
            return this.length && dh.focusable(this.item(0))
        },

        /* Detect whether the first element can accept Tab key
        @return	:Boolean
        */
        tabbable: function () {
            return this.length && dh.tabbable(this.item(0))
        },
        /*	Add content for each element
        @el     :Html/Element   The additional concent
        @return	:this
        */
        append: function (el, returnDom) {
            dh.append(this, el)
            return this
        },
        /*	Add all the element to the specifield element
        @to     :Element   
        @return	:this
        */
        appendTo: function (to, returnDom) {
            dh.append(to, this)
            return this
        },
        /*	Start position will add additional content
        @content     :Element/String   Additional content
        @return	:this
        */
        prepend: function (content) {
            dh.insertFirst(this, content)
            return this
        },
        /*	All elements will be appended to the beginning of the specified element
        @to     :Element   The specified element
        @return	:this
        */
        prependTo: function (to) {
            dh.insertFirst(to, this)
            return this
        },
        /*	Delete all the child nodes of each element. 
        @return	:this
        */
        empty: function () {
            return this.$each(function (o) {
                dh.empty(o);
            })
        },
        /*  Insert content before each element */
        before: function (el) {
            dh.insertBefore(this, el)
            return this
        },
        /*  Insert content after each element */
        after: function (el) {
            dh.insertAfter(this, el)
            return this
        },
        /*Insert all of the matched elements to another specified collection of elements*/
        insertBefore: function (el) {
            dh.insertBefore(el, this)
            return this
        },

        /*Insert all of the matched elements to another specified element*/
        insertAfter: function (el) {
            dh.insertAfter(el, this)
            return this;
        },
        /*End of the recent "destructive"operation, to return to the list of elements that match a previous state*/
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

        if (browser.isSafari || browser.isChrome) {
            style = doc.defaultView.getComputedStyle(docE)
            for (var i = 0; i < style.length; i++) {
                var name = camelCase(style[i])
                if (name.charAt(0) != '-' && !qp[name])
                    qp[name] = getCssMethod(name)
            }

            var style = "border,borderWidth,borderColor,borderStyle,margin,padding,font".split(',')
            for (var i = 0; i < style.length; i++)
                qp[name] = getCssMethod(name)
        }
        else {
            for (var name in style)
                if (!qp[name])
                    qp[name] = getCssMethod(name)
        }


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
	    /*	Each disabled element
	    @disabled:Boolean(not required) Are disabled
	    @return	:this
	    */
	    disable: function (disabled) {
	        return this.attr("disabled", disabled != false)
	    },
	    /*	Enable each element
	    @enable:Boolean(not required) Are enabled
	    @return	:this
	    */
	    enable: function (enable) {
	        return this.attr("disabled", enable == false)
	    },

	    /*	Hide each element
	    @return	:this
	    */
	    hide: qp.css.$format("display", "none"),

	    /*	Show each element
	    @return	:this
	    */
	    show: function () {
	        this.each(dh.show)
	        return this;
	    },

	    /*	Generate a new IList object
	    @evaluator:Function/String/Object evaluator
	    @params	:Object(not required) Any number of variable parameters
	    @return	:IList
	    */
	    map: qp.select,

	    /*	Determine whether there is an element to fit the conditions, if you do not specify the conditions, will return the collection length
	    @predicate	:Function/String/Object A function that determine each item of the collection fit the conditions
	    @params	:Object(not required) Any number of variable parameters
	    @return	:Boolean
	    */
	    any: function (predicate, params) {
	        if (arguments.length == 0)
	            return (this.getItems || qp.getItems).call(this).length
	        this.___count = 1
	        return (this.___take || qp.___take).apply(this, arguments).length > 0
	    },

	    /*	Determine whether all elements of the sequence satisfies the condition, if collection do not specify the conditions, will return all elements.
	    @predicate	:Function/String/Object Each element is used to detect the function satisfy the condition
	    @params	:Object(not required) Any number of variable parameters
	    @return	:Boolean
	    */
	    all: function (predicate, params) {
	        if (arguments.length == 0)
	            return (this.getItems || qp.getItems).call(this)
	        this.___count = 1
	        this.___isNot = true
	        return (this.___take || qp.___take).apply(this, arguments).length == 0
	    },


	    /*	Query
	    @predicate	:Function/String/Object search condition
	    @params	:Object(not required) Any number of variable parameters
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
	    /*Sum
	    @selector   :Function(not required)   Get used to calculate the value of the element functions
	    @filter     :Function(not required)   Filter out the function of elements involved in the calculation
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
	    /*maximum
	    @selector   :Function(not required) Get used to calculate the value of the element functions
	    @return :Number
	    */
	    max: function (selector, resultSelector) {
	        return this.compareOne(selector, resultSelector, true)
	    },
	    /*minimum
	    @selector   :Function(not required) Get used to calculate the value of the element functions
	    @return :Number
	    */
	    min: function (selector, resultSelector) {
	        return this.compareOne(selector, resultSelector, false)
	    },
	    /*Averaging
	    @selector   :Function(not required) Get used to calculate the value of the element functions
	    @return :Number    
	    */
	    average: function (selector) {
	        return this.sum.apply(this, arguments) / this.length
	    },
	    /* Count
	    @selector   :Function(not required) Get used to calculate the value of the element functions
	    @return     :Int    The number of elements to satisfy the conditions
	    */
	    count: function (predicate, params) {
	        return this.where.apply(this, arguments).length
	    },
	    /*Removing repetitive elements
	    @comparer   :Function(not required) The function to compare elements
	    @return :this
	    */
	    distinct: qp.uniquelize,

	    /*Grouping of elements
	    @keySelector   :Function(not required) Get the key element for the group
	    @itemSelector  :Function(not required) Get the content of group
	    @return :Json   Json object  that contains group
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
	    /* clear all the elements
	    @return :this
	    */
	    clear: function () {
	        var all = this.getItems()
	        arrP.splice.call(all, 0, this.length)
	        this.updateLength();
	        return this
	    },

	    /*	Get the first item
	    @predicate	:Function/String/Object Query condition
	    @params	:Object(not required) Any number of variable parameters
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

	    /*  Get the last item
	    @predicate	:Function/String/Object Query condition
	    @params	:Object(not required) Any number of variable parameters
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


	    /*	Matches all elements of the parent element, corresponding to the selector “<”			
	    @layersOrSelector	:Int/Selector(not required) Up the series, or a particular selector，default 1
	    @return :Array<Element>
	    */
	    parent: function (ls) {
	        if (ls == null || $.isNumber(ls))
	            return this.$("<" + (ls || 1))
	        var q = new ui.selector.DomQuery(this.context, arguments)
	        return q.parent(this);
	    },

	    /*	Matches all elements's child elements, corresponding to the selector “>”			
	    @layers	:Int(not required) Down the series，default 1
	    @return :Array<Element>
	    */
	    children: function (layers) {
	        return this.$(">" + (layers || 1))
	    },

	    /* Match the elements after all the elements, corresponding to the selector “+”
	    @offset	:Int(not required) Subsequent offset，default 1
	    @return :Array<Element>
	    */
	    next: function (offset) {
	        return this.$("+" + (layers || 1))
	    },

	    /* Match the elements before all the elements, corresponding to the selector “-”
	    @offset	:Int(not required) Forward offset，default 1
	    @return :Array<Element>
	    */
	    previous: function (offset) {
	        return this.$("-" + (layers || 1))
	    },

	    /*	Matches all sibling elements，corresponding to the selector “~”
	    @return :Array<Element>
	    */
	    sibling: function () {
	        return this.$("~" + (layers || 1))
	    },
	    /*Add a mouse event for the element
	    @over   :Function  Performed when the mouse entered
	    @out    :Function  Performed when the mouse move out
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
        /* #M path:fly.collection.IList.disabled Get or set the 'disabled' property of the element*/
        /* #M path:fly.collection.IList.id Get or set the 'id' property of the element*/
        /* #M path:fly.collection.IList.name Get or set the 'name' property of the element*/
        /* #M path:fly.collection.IList.title Get or set the 'title' property of the element*/
        /* #M path:fly.collection.IList.className Get or set the 'className' property of the element*/
        /* #M path:fly.collection.IList.text Get or set the 'innerText' property of the element*/
        /* #M path:fly.collection.IList.html Get or set the 'innerHTML' property of the element*/
        var props = ["disabled", "id", "name", "title", "className", "text:innerText", "html:innerHTML"]
        for (var i = 0; i < props.length; i++) {
            var att = props[i].replace(/.*:/g, '')
            qp[props[i].replace(/:.*/g, '')] = function (att) {
                return function (v) {
                    return arguments.length > 0 ? this.attr(att, v) : this.attr(att)
                }
            } (att)
        }

        /* #M path:fly.collection.IList.onBlur Binding Onblur event for the element */
        /* #M path:fly.collection.IList.onFocus Binding onfocus event for the element*/
        /* #M path:fly.collection.IList.onLoad Binding onload event for the element*/
        /* #M path:fly.collection.IList.onResize Binding onresize event for the element*/
        /* #M path:fly.collection.IList.onScroll Binding onscroll event for the element*/
        /* #M path:fly.collection.IList.onUnload Binding onunload event for the element*/
        /* #M path:fly.collection.IList.onDblClick Binding ondblclick event for the element*/
        /* #M path:fly.collection.IList.onContextMenu Binding oncontextmenu event for the element*/
        /* #M path:fly.collection.IList.onMouseDown Binding onmouseDown event for the element*/
        /* #M path:fly.collection.IList.onMouseUp Binding onmouseup event for the element*/
        /* #M path:fly.collection.IList.onMouseMove Binding onmousemove event for the element*/
        /* #M path:fly.collection.IList.onMouseOver Binding onmouseover event for the element*/
        /* #M path:fly.collection.IList.onMouseOut Binding onmouseout event for the element*/
        /* #M path:fly.collection.IList.onMouseEnter Binding onmouseenter event for the element*/
        /* #M path:fly.collection.IList.onMouseLeave Binding onmouseleave event for the element*/
        /* #M path:fly.collection.IList.onChange Binding onchange event for the element*/
        /* #M path:fly.collection.IList.onSelect Binding onselect event for the element*/
        /* #M path:fly.collection.IList.onSelectStart Binding onselectstart event for the element*/
        /* #M path:fly.collection.IList.onSubmit Binding onsubmit event for the element*/
        /* #M path:fly.collection.IList.onKeyDown Binding onkeydown event for the element*/
        /* #M path:fly.collection.IList.onKeyPress Binding onkeypress event for the element*/
        /* #M path:fly.collection.IList.onKeyUp Binding onkeyup event for the element*/
        /* #M path:fly.collection.IList.onError Binding onerror event for the element*/

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
		        //Index
		        if (/^\d+$/.test(exp)) {
		            var node = all[exp]
		            if (node)
		                collector.result.push(node)
		            return
		        }
		        //Property
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
        Selector
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

		    /*	Extend Selector
		    @selectors	:Multiple Selector
		    @return	:None
		    */
		    extendSelector: function (selectors) {
		        for (var s in selectors)
		            this.executors[s] = selectors[s], this.sTypes.push(s)
		        var reg = this.sTypes.join("").replace(/\s/g, "").replace(utils.relationSelectorRegReplace, '').replace('α', '')
		        this.splitReg = new RegExp(this.splitRegFormat.$format(reg), 'g')
		    },

		    /*	Extend filter selector
		    @filters	:Multiple Selector
		    @return	:None
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

		    /*	Extend expression and operator
		    @operators:{String} Multiple operator
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
        Dom  object query class
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
		    /*	Query Dom object
		    @return	:Array Dom object to find
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

		        /*	Matches all elements that match the first parent element with the expression
		        @selectors	:String(not required) Selector
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

		        /*	Matches all elements that match the first parent element with the expression
		        @selectors	:String(not required) Selector
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


		        /*	Matches all elements that match the first parent element with the expression
		        @selectors	:String(not required) Selector
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

    /*	document object*/
    $.doc = $(docE)
    $.getBody = function () {
        /*	document.body object*/
        if ($.body)
            return $.body
        if (!doc.body)
            return null
        return $.body = $(doc.body)
    }
})(this);


// alert(new Date()-sTime)
