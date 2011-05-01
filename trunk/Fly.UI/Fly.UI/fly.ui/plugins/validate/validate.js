/* #C fly.plugins.validate fly验证插件
Version 1.0 
http//:www.flyui.net
Email:flyui@hotmail.com
Copyright (c) 2011 KuiyouLi
2011-4-1
*/
fly.regPlugin('validate', function ($) {
    var $v = $.plugins.validate = function (config) {
        $.extend(this, config);
        this.init();
    }


    $v.$extend({
        ruleAttr: "rule",
        selector: ":input[{ruleAttr}]",
        isValidate: null,
        init: function () {
            var me = this
            if (!this.items) {
                var container = $(this.container || document);
                this.items = container.find(this.selector.format(this));
            }
            this.items = $(this.items).select(function (o) {
                return new $v.item(me, o)
            });
            this.bindEvent();
        },
        validate: function (getMsgOnly, handler, ruleErrorHandler) {
            var me = this;
            var msgs = this.items.selectMany(function (o) {
                return o.validate(getMsgOnly ? null : (handler || me.handler), getMsgOnly ? null : (ruleErrorHandler || me.ruleErrorHandler))
            });
            this.isValidate = !msgs.length
            return this.isValidate ? null : msgs
        },
        bindEvent: function () {
            this.items.each(function (item) {
                if (this.events) {
                    $.each(this.events, function (fn, e) {
                        if (item.events[e] == "") return;

                        item.element.on(item.events[e] || e, function () {
                            var msg = item.validate();
                            fn.call(item, msg, item.element)
                        });
                    })
                }
            }, this)
        }
    })
    $v.defaultErrMsg = '输入有误'
    $v.rule = function (expr, vItem) {
        var me = this
        this.owner = vItem;
        this.expr = expr;
        this.extractMsg()
        this.reg || (this.reg = $v.rule.regs[this.expr])
        if (this.reg == null) {
            expr = expr.replace(/^(\d*)-(\d*)$/, function ($0, min, max) {
                me.minLen = Number(min)
                me.maxLen = Number(max)
                return ""
            });

            expr = expr.replace(/^([><=!]+)(.+)$/g, function ($0, o, v) {
                me.value = Number(v)
                isNaN(me.value) && (me.value = v);
                me.operator = o;
                return ""
            });

            expr = expr.replace(/^(.+)->(.+)$/, function ($0, min, max) {
                me.min = Number(min)
                isNaN(me.min) && (me.min = min)
                me.max = Number(max)
                isNaN(me.max) && (me.max = max)
                return ""
            });

            expr && (this.values = expr)
        }
        else {
            this.reg.init && this.reg.init(this.owner.element);
            this.reg.change && this.owner.element.change(this.reg.change);
        }
    }

    $v.rule.extend({
        extractMsg: function () {
            var me = this;
            this.expr = this.expr.replace(/::(.*)$/, function ($0, $1) {
                me.msg = $1;
                return "";
            }).replace(/:.*/, function ($0) {
                me.option = $0.substr(1).trim();
                return ""
            }).trim();
        },
        validate: function (v, errMsg) {
            v == null && (v = "")
            var reg = this.reg

            if (v.length < this.minLen || v.length > this.maxLen)
                return this.minLen && this.maxLen ? this.minLen + "-" + this.maxLen + "个字符"
                    : ('最' + (v.length > this.maxLen ? "多" : "少") + this.minLen + "个字符");

            if (this.expr == "*" || v != "") {
                if (reg && reg.reg && !reg.reg.test(v))
                    return errMsg || this.msg || this.reg.msg || $v.defaultErrMsg;

                if (this.min != null) {
                    if (!$v.compareValue(v, ">=", this.min) || !$v.compareValue(v, "<=", this.max))
                        return "只能在" + this.min + "到" + this.max + "之间";
                }
                else if (this.operator) {
                    if (!$v.compareValue(v, this.operator, this.value))
                        return "必须" + ($v.operatorName[this.operator] || this.operator) + this.value
                }
                else if (this.values) {
                    if (!(',' + this.values + ",").contains("," + v + ",", true))
                        return "只能是:" + this.values
                }
            }

            if (reg && reg.check) {
                var m = reg.check(v, this);
                if (m === true)
                    return null
                if (m === false)
                    return errMsg || this.msg || this.reg.msg || $v.defaultErrMsg;
                return m;
            }

        }
    })

    $v.operatorName = { ">": "大于", "<": "小于", ">=": "大于等于", "<=": "小于等于", "==": "等于", "!=": "不等于" }

    $v.disabledIme = function (el) {
        $(el).css("ime-mode", "disabled");
    }

    $v.compareValue = function (l, o, r) {
        $.isNumber(r) && (l = Number(l))
        return eval("l" + o + "r");
    }

    $v.rule.regs =
{
    "*": {
        reg: /.+/,
        msg: "不能为空"
    },
    "int": {
        reg: /^[-+]?\d+$/,
        msg: "只能为整数"
    },
    "+int": {
        reg: /^\+?\d+$/,
        msg: "只能为正整数"
    },
    "-int":
    {
        reg: /^-\d+$/,
        msg: "只能为负整数"
    },
    "float":
    {
        reg: /^[-+]?\d+.?\d*$/,
        msg: "只能为数值"
    },
    "+float":
    {
        reg: /^\+?\d+.?\d*$/,
        msg: "只能为正数"
    },
    "-float":
    {
        reg: /^-\d+.?\d*$/,
        msg: "只能为负数"
    },
    mail:
    {
        reg: /^([0-9a-z]+[-._+&])*[0-9a-z]+@([-0-9a-z]+[.])+[a-z]{2,6}$/i,
        msg: '邮箱格式不正确'
    },
    phone:
    {
        reg: /^(\d{3,4}-)?\d{7,20}$/,
        msg: '电话号码有误'
    },
    same:
    {
        check: function (val, rule) {
            return val == $(rule.option).value() ? null : "两次输入不一致";
        }
    },
    reg:
    {
        check: function (val, rule) {
            try {
                if (rule.option.charAt(0) == '/')
                    return eval(rule.option).test(val);
            } catch (e) { }
            return new RegExp(rule.option).test(val);
        }
    },
    fun:
    {
        check: function (val, rule) {
            return eval(rule.option + "(val,rule)");
        }
    },
    "a-z":
    {
        reg: /^[a-z]$/,
        msg: "只能是小写字母"
    },
    "A-Z":
    {
        reg: /^[A-Z]$/,
        msg: "只能是大写字母"
    },
    "a-Z":
    {
        reg: /^[A-Z]$/i,
        msg: "只能是字母"
    },
    trim:
    {
        change: function (el) {
            var v = (el = $(el)).value();
            var rv = v.replace(/^\s+|\s+$/g, '')
            rv != v && el.value(rv);
        }
    }
};
    "int,+int,-int,float,+float,-float,mail,phone,a-z,A-Z,a-Z".split(',').each(function (o) {
        $v.rule.regs[o].init = $v.disabledIme
    });

    $v.item = function (owner, el) {
        this.owner = owner;
        this.element = $(el);
        this.init();
    }

    $v.item.extend({
        events: {},
        isValidate: null,
        init: function () {
            this.ruleExpr = this.element.attr(this.owner.ruleAttr);
            this.rules = this.ruleExpr.split('|').selectNotNull(function (o) {
                if (o.startWith("events:"))
                    this.events = o.substr(7, '').split(',').toJson("o=>o.replace(/:.*/g,'')", "o=>o.replace(/.*:/g,'')")
                else if (o.startWith("with:")) {
                    var s = o.substr(5)
                    this.valueElement = $(s)
                    if (!this.valueElement.length)
                        alert("根据表达式\"" + this.ruleExpr + "\"中的选择器\"" + s + "\"没有找到任何元素");
                }
                else if (o.startWith("tips:"))
                    this.tips = o.substr(5)
                else
                    return new $v.rule(o, this)
            }, this);
            this.valueElement || (this.valueElement = this.element);
            if (this.tips) {
                this.element.focus(function () {
                    this.owner.handler(this.tips, this.element, true);
                }, this);
            }
        },
        validate: function (handler, ruleErrorHandler) {
            var me = this, el = this.element;
            var val = this.valueElement.val();
            var msgs = this.rules.selectNotNull(function (o) {
                var m = o.validate(val)
                m && ruleErrorHandler && ruleErrorHandler.call(me, m, el, o, val)
                return m;
            });
            handler && handler.call(me, msgs, el)
            return (this.isValidate = !msgs.length) ? null : msgs;
        }
    })


    $v.defaultHandlers =
    {
        alert: function (msgs, el, isTips) {
            isTips != true && msgs.length && alert(msgs);
        },
        cssAndTitle: function (css, changeTitle, msgTo) {

            return function (msgs, el, isTips) {
                if (msgs && msgs.length) {
                    if (!isTips) {
                        css && el.addClass(css)
                        if (changeTitle != false) {
                            el.oldTitle == null && (el.oldTitle = el.attr("title") || '');
                            el.attr("title", msgs)
                        }
                    }

                    if (msgTo) {
                        if (!el.errorMsgBox) {
                            if ($.isFun(msgTo))
                                el.errorMsgBox = $(msgTo.call(this, el));
                            else if (msgTo == true)
                                el.errorMsgBox = $("<span class=f-v-msgBox ></span>").appendTo(el.parent())
                            else
                                el.errorMsgBox = $(msgTo)
                        }
                        el.errorMsgBox.html(msgs);
                        el.errorMsgBox.changeClass(isTips ? "f-v-msgBox-error f-v-msgBox-right" : "f-v-msgBox-tips f-v-msgBox-right", isTips ? "f-v-msgBox-tips" : "f-v-msgBox-error")
                    }
                } else {
                    css && el.removeClass(css)
                    changeTitle != false && el.oldTitle != null && el.attr("title", el.oldTitle);
                    if (el.errorMsgBox)
                        el.errorMsgBox.html('&nbsp;').changeClass("f-v-msgBox-tips f-v-msgBox-error", el.value() == "" ? "" : "f-v-msgBox-right")
                }
            }
        }
    }
})