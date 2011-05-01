/*
 * core unit tests
 */
(function ($) {

    module('core - jQuery extensions');
    var node
    var init=function () {
        node=$("<style> .css{color:red;width:100px}</style>" +
        "<div class=css ></div>").appendTo(document.body).last()[0]
    }

    function isType(obj, method) {
        function is() {
            ok(fly[method](this), "$." + method)
        }
        is.call(obj)
    }

    test("method- extend", function () {
        init()
        var a = {}, b = { f: 123 }
        $.extend(a, b)
        equals(a.f, b.f, 'extend：a.f===b.f ');

        var a = { f: 456 }, b = { f: 123 }
        $.safeExtend("p_", a, b)
        ok(a.f != b.f, 'safeExtend：a.f!=b.f ');
        equals(a.p_f, b.f, 'safeExtend：a.p_f===b.f ');

        var a = { f: 456 }, b = { f: 123, f2: "abc" }
        $.extendIf(a, b)
        ok(a.f != b.f && a.f2 == b.f2, 'extendIf：a.f != b.f && a.f2==b.f2 ');


        var a = { f: 456 }, b = { f: 123, f2: "abc" }

//        var m = $.merge(a, b)
//        ok(a.f != b.f && a.f2 != b.f2 && m.f == b.f, 'merge：a.f != b.f && a.f2 != b.f2 && m.f==b.f');
    });

//    test("method - get,set", function () {
//        var obj = {}
//        $.set(obj, 'p', '123')
//        equals($.get(obj, 'p'), '123', '$.set,$.get ');

//        $.set(obj, { p1: 123, p2: "abc" })
//        equals($.get(obj, 'p1'), '123', '$.set,$.get ');

//        $.set(node, 'p', '123')
//        equals($.get(node, 'p'), '123', '$.set,$.get ');

//        $.set(node, { p1: 123, p2: "abc" })
//        equals($.get(node, 'p1'), '123', '$.set,$.get ');

//        obj = {}
//        $.setBy(obj, { p1: 456, p2: "abc" })
//        equals($.get(obj, 'p1'), '456', '$.set,$.get ');

//    });

//    test("method - data", function () {
//        var obj = {}
//        $.data(obj, 'p', '123')
//        equals($.data(obj, 'p'), '123', '$.data');

//        $.data(obj, { p1: 123, p2: "abc" })
//        equals($.data(obj, 'p1'), '123', '$.data');

//        $.data(node, 'p', '123')
//        equals($.data(node, 'p'), '123', '$.data');

//        $.data(node, { p1: 123, p2: "abc" })
//        equals($.data(node, 'p1'), '123', '$.data');

//    });


    test("method - attr", function () {
        var obj = {}
        $.attr(obj, 'p', '123')
        equals($.attr(obj, 'p'), '123', '$.attr');

        $.attr(obj, { p1: 123, p2: "abc" })
        equals($.attr(obj, 'p1'), '123', '$.attr');

        $.attr(node, 'p', '123')
        equals($.attr(node, 'p'), '123', '$.attr');

        $.attr(node, { p1: 123, p2: "abc" })
        equals($.attr(node, 'p1'), '123', '$.attr');

    });

    test("method - isNumber", function () {
        ok($.isNumber(3), "5 is isNumber")
        ok(!$.isNumber("abc"), "'abc' is not Number")
        ok(!$.isNumber(null), "null is not Number")
        isType(2, "isNumber")
    });

    test("method - isString", function () {
        ok($.isStr("abc"), "‘abc’ is String")
        ok(!$.isStr(5), "5 is not String")
        ok(!$.isStr(null), "null is not String")
        isType("abc", "isString")
    });

    test("method - isDate", function () {
        ok($.isDate(new Date()), "date is date")
        ok(!$.isDate(1), "1 is not date")
        ok(!$.isDate(null), "null is not date")
        isType(new Date(), "isDate")
    });

    test("method - isObject", function () {
        ok($.isObject({}), "{} is Object")
        ok(!$.isObject(1), "1 is not Object")
        ok(!$.isObject(null), "null is not Object")
        isType({}, "isObject")
    });

    test("method - isFun", function () {
        ok($.isFun($.isFun), "true is Function")
        ok(!$.isFun(1), "1 is not Function ")
        ok(!$.isFun(null), "null is not Function")
        isType($.isFun, "isFun")
    });

    test("method - isArray,likeArray", function () {
        ok($.isArray(new Array()), "new Array() is Array")
        ok($.isArray([]), "[] is Array")
        ok(!$.isArray({}), "{} is not Array")
        ok(!$.isArray(null), "null is not Array")
        ok(!$.isArray(arguments), "arguments is not Array")

        ok($.likeArray(new Array()), "new Array() is like Array")
        ok($.likeArray([]), "[] is like Array")

        ok($.likeArray(arguments), "arguments is like Array")
        ok($.likeArray(node.children), "node.children is like Array")
        ok(!$.likeArray(window), "window is not like Array")
        ok(!$.likeArray("string"), "string is not like Array")
    });

    test("method - isIList", function () {
        ok([].isIList, "[] is IList")
        ok($('body').isIList, "$('body') is IList")
        ok(!node.children.isIList, "node.children is not IList")
    });

    test("method - isDom", function () {
        ok($.isDom(node), "div is dom")
        ok($.isDom(document.documentElement), "document.documentElement is dom")
        ok($.isDom(document.body), "document.body is dom")
        ok(!$.isDom(document), "document is not dom")
        ok(!$.isDom(window), "window is not dom")
        ok(!$.isDom($('body')), "$('body') is not dom")
    });

    test("method - toArray", function () {
        var arr = $.toArray(new Array());
        ok($.isArray(arr) && arr.length == 0, "$.toArray(new Array()) is Array")

        arr = $.toArray(new Object())
        ok($.isArray(arr) && arr.length == 1, "$.toArray(new Object()) is Array")

        arr = $.toArray([])
        ok($.isArray(arr) && arr.length == 0, "$.toArray(new Object()) is Array")

        arr = $.toArray(arguments)
        ok($.isArray(arr) && arr.length == 0, "$.toArray(arguments) is Array")

        arr = $.toArray(node.children)
        ok($.isArray(arr) && arr.length == node.children.length, "$.toArray(node.children) is Array")
    });

    test("method - slice", function () {
        var all = [1, 2, 3]
        var arr = $.slice(all, 0);
        ok($.isArray(arr) && arr.length == 3, "slice(arr,0)")

        arr = $.slice(all, 0, 2);
        ok($.isArray(arr) && arr.length == 2, "slice(arr,0,2)")

        arr = $.slice(all, -2);
        ok($.isArray(arr) && arr.length == 2, "slice(arr,-1)")

        arr = $.slice(arguments, 0);
        ok($.isArray(arr) && arr.length == 0, "slice(arguments,0)")
    });

    test("method - pick", function () {
        var all = [1, 2, 3]
        var arr = $.slice(all, 0);
        ok($.isArray(arr) && arr.length == 3, "slice(arr,0)")

        arr = $.slice(all, 0, 2);
        ok($.isArray(arr) && arr.length == 2, "slice(arr,0,2)")

        arr = $.slice(all, -2);
        ok($.isArray(arr) && arr.length == 2, "slice(arr,-1)")

        arr = $.slice(arguments, 0);
        ok($.isArray(arr) && arr.length == 0, "slice(arguments,0)")
    });

    test("method - each", function () {
        var arr = [1, 2, 3]
        var sum = 0
        $.each(arr, function () {
            sum += this
        })
        equals(sum, 6, "each arrary")

        var json = { a: 1, b: 2, c: 3 }
        var sum = 0
        $.each(json, function () {
            sum += this
        })
        equals(sum, 6, "each json")
    });

    test("method - In", function () {
        var arr = [1, 2, 3]
        ok($.In(2, arr), "in array")
        ok($.In(1, 0, 1, 2, 3), "in arguments")
    });

    test("method - function", function () {
        ok($.isFun($), "$ is function")
        var a = { f: $.emptyFun }
        ok(a.f() === a, "emptyFun return this")
        ok($.falseFun() === false, "falseFun return false")
        ok($.lambda(1)() === 1, "lambda return parameter1")
        ok($.toFun("a=>return a")(1) === 1, "toFun is right")
        ok($.ifFun(1) === 1, "ifFun is right")
        ok($.ifFun(function () { return 1 }) === 1, "ifFun is right")
    });

    test("extend Function ", function () {
        function f(exec) { ok(exec, "Function.where " + exec) }
        f.where("=>true", true)()
        f.where("=>false", false)();

        (function () { ok(this == true, "Function bind") }).bind(true)();
        (function (arg1) { ok(this == 1 && arg1 == 2, "Function bind") }).bind(1)(2);

        var fn = function (a1, a2, a3) {
            ok(a1 == 1 && a2 == 2, "Function args")
        }
        fn.format("@{1}", 2)(0, 1, 2);
        fn.format("@{1-2}")(0, 1, 2);
        fn.format("@{1,2}")(0, 1, 2);
        fn.format(1, 2)();

        stop();
//        (function () { ok(true, "Function timeout") }).timeout(100);
//        (function () { ok(true, "Function defer"); start() }).defer(100)()

//        $.emptyFun.onBefore(function (a1) {
//            ok(a1 == 0, "Function onBefore")
//        }, 0)()

//        $.emptyFun.onBefore(function (a1) {
//            ok(a1 == 0, "Function onBefore")
//        }, 0)()

//        var obj = { f: $.emptyFun };
//        (function (a1) { ok(a1 == 1, "Function attachBefore") }).attachBefore(obj, "f", 1);
//        (function (a1) { ok(a1 == 1, "Function attachAfter") }).attachAfter(obj, "f", 1);
//        obj.f();

        var cls = function () { }
        var base = function () { }
        base.prototype.f = 123

        cls.inherit(base, { f1: 456 })
        var instance = new cls();
        ok(instance instanceof cls && instance instanceof base, "Function inherit")
        ok(instance.f == 123 && instance.f1 == 456, "Function inherit")

        cls.extend({ f2: 789 });
        var instance = new cls()
        ok(instance.f2 == 789, "Function extend")
    });

    test("extend Date ", function () {
        var d = new Date('2010/05/17 13:30:2')
        equals(d.format(), '2010-05-17 13:30:02', "默认的时间格式")
        equals(d.format("yyyy/MM/dd"), '2010/05/17', "yyyy/MM/dd")
        equals(d.format("yy/M/d"), '2010/5/17', "yy/M/d")
        equals(d.format("HH:m:s"), '13:30:2', "yy/M/d")
        equals(d.format("W"), '一', "W")
        equals(d.format("w"), '1', "w")
    })


    test("extend String ", function () {

        equals('a{0}b{1}c{2}'.format(0, 1, 2, 3), 'a0b1c2', "'a{0}b{1}c{2}'.format(0,1,2,3)")
        equals('a{1}b{f}'.format(0, 1, 2, { f: 'abc' }), 'a1babc', "'a{1}b{f}'.format(0, 1, 2, {f:'abc'})")
        equals('a{f.f1}'.format({ f: { f1: '123'} }), 'a123', "'a{f.f1}'.format({ f: {f1:'123'}})")

        ok("abc".contains("b"), '"abc".contains("b")')
        ok(!"abc".contains("B"), '!"abc".contains("B")')
        ok("abc".contains("B", true), '"abc".contains("B",true)')

        equals(" abc ".trim(), "abc", '" abc ".trim()')
        equals(" abc ".trimLeft(), "abc ", '" abc ".trimLeft()')
        equals(" abc ".trimRight(), " abc", '" abc ".trimRight()')

        equals("abc".firstUpper(), "Abc", '"abc".firstUpper()')

        equals("abc".repeat(), "", '"abc".repeat()')
        equals("abc".repeat(1), "abc", '"abc".repeat(1)')
        equals("abc".repeat(2), "abcabc", '"abc".repeat(2)')

        equals("123".padLeft(5), "  123", '"123".padLeft(5)')
        equals("123".padLeft(5, '-'), "--123", '"123".padLeft(5,"-")')
        equals("123".padLeft(5, '0'), "00123", '"123".padLeft(5,"0")')

        equals("123".padRight(5), "123  ", '"123".padRight(5)')
        equals("123".padRight(5, '-'), "123--", '"123".padRight(5,"-")')
        equals("123".padRight(5, 0), "12300", '"123".padRight(5,0)')
    })


    test("StyleUtils", function () {

    })

})(fly);
