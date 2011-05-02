/// <reference path="fly/fly-comment.js" />
/// <reference path="fly.simple/fly.simple-all-comment.js" />
function toggleDisplay(el, always) {
    el = el && el.style == null ? el.nextSibling : el
    if (el && el.style) {
        if ($.DomHelper.isHidden(el))
            $.DomHelper.show(el)
        else if (always != true)
            el.style.display = 'none'
    }
}

function encodeHtml(str) {
    if (!str) return str;
    return str.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/ /g, '&nbsp;').replace(/(\n|\r)+/g, '<br/>');
}

function showType() {
}

function API() {
    var me = this;
    this.rightRoot = $('#rightRoot');
    
    $.ajax.get("API.js", function (ms) {
        me.apiData = $.Json.decode(ms);
        
    });
}

API.extend({
    apply: function () {
        document.title=this.apiData
        me.createTree();
    },
    createTree: function () {
        var me = this
        function ms(m) {
            return { text: m.name, tag: m, type: this }
        }

        function s(cls) {
            var node = { text: cls.name, tag: cls, type: 'class' }
            node.children = []
            var propsNode = { text: '属性', type: 'propertys', tag: cls.propertys }
            node.children.push(propsNode);
            propsNode.children = cls.propertys.select(ms, "property")

            var methodsNode = { text: '方法', type: 'methods', tag: cls.methods }
            node.children.push(methodsNode);

            cls.methods.each(function (m) {
                if (m.ret)
                    m.type = m.ret.type;
            });

            methodsNode.children = cls.methods.select(ms, "method")

            var eventsNode = { text: '事件', type: 'events', tag: cls.events }
            node.children.push(eventsNode);
            eventsNode.children = cls.events.select(ms, "event")

            return node;
        }

        var nodes = this.apiData.classs.select(s)
        var tree = new fly.simple.Tree({ items: nodes, useEffect: false, showLine: true, onSelected: function (node) {
            me["show" + node.type.firstUpper()](node, node.tag);
        }
        });
        tree.renderTo($("#left-cell")[0]);
        if ($.browser.isChrome)
            setTimeout(function () {
                rootTable.hide()
                rootTable.show()
            }, 30);
    },
    showInRight: function (el) {
        this.rightRoot.empty().append(el);
    },
    processRemark: function (obj) {
        if (obj.remark && !obj.shortRemark) {
            obj.shortRemark = obj.remark.match(/[^\n]*/)[0]
            obj.detailRemark = obj.remark == obj.shortRemark ? '' : obj.remark
        }
    },
    createMemberDom: function (member, showName, showType, showShortRemark, showDetailRemark) {
        this.processRemark(member);
        var html = '';
        if (showName)
            html += '<a class="m-name">{name}</a> :&nbsp; &nbsp;';
        if (showType)
            html += '<a class=m-type onclick="showType(this.innerText)">{type}</a>'
        if (showShortRemark)
            html += '&nbsp; <span class=m-shortRemark >{shortRemark}</span>'
        if (showDetailRemark)
            html += '&nbsp; <span class=m-detailRemark >' + encodeHtml(member.detailRemark) + '</span>'
        return html.format(member);
    },
    createPropertyDom: function (prop, getHtmlOnly) {
        var html = '<div class="m-property m-member">'
                    + '<div onclick="toggleDisplay(this.nextSibling)" class="m-toggle" >'
                        + '{0}'
                    + '<div class="remark">{1}</div>'
                + '</div>';
        this.processRemark(prop);
        html = html.format(this.createMemberDom(prop, true, true, true), encodeHtml(prop.detailRemark), prop);
        if (getHtmlOnly)
            return html;
        return prop.dom = $(html);
    },

    showProperty: function (node, prop) {
        if (!prop.dom)
            this.createPropertyDom(prop)
        this.showInRight(prop.dom);
    },
    createMethodDom: function (method, getHtmlOnly) {
        var me = this
        var html = '<div class="m-method m-member">'
                    + '<div onclick="toggleDisplay(this.nextSibling)" class="m-toggle">'
                        + '<a class="m-name">{name}</a>( <a class=gray >{0}</a> )&nbsp;: <a class=type onclick="showType(this.innerText)">{type}</a>'
                        + '&nbsp; <span>{shortRemark}</span></div>'
                    + '<div class="m-detail">'
                        + '<div class="m-title">参数 : </div>'
                        + '<ul class="m-parameters">'
                        + '{1}</ul>'
                        + '<div class="m-return"><a class="m-title">返回值 :</a> {2}</div>'
                        + '<div class="m-detailRemark">{3}</div>'
                    + '</div>'
                + '</div>';

        this.processRemark(method);
        var args = method.args.select("o=>o.type +' '+ o.name").join(', ')
        var argList = method.args.select(function (o) {
            return '<li>' + me.createMemberDom(o, true, true, true, false) + '</li>';
        });
        var ret = me.createMemberDom(method.ret, false, true, false, true);
        html = html.format(args, argList, ret, encodeHtml(method.detailRemark), method)
        if (getHtmlOnly)
            return html;
        return method.dom = $(html);

    },

    showMethod: function (node, method) {
        if (!method.dom)
            this.createMethodDom(method)
        this.showInRight(method.dom);
    },
    showEvent: function (node, evt) {
        this.showMethod(node, evt);
    },
    createMethodsDom: function (methods, getHtmlOnly) {
        var mHtml = methods.select(function (o) {
            return '<li >' + this.createMethodDom(o, true) + '</li>';
        }, this);

        var html = '<ul class="m-methods m-members">' + mHtml.join('') + '</ul>'
        if (getHtmlOnly)
            return html;
        return methods.dom = $(html);
    },
    showMethods: function (node, methods) {
        if (!methods.dom)
            this.createMethodsDom(methods);

        this.showInRight(methods.dom);
    },
    createPropertysDom: function (propertys, getHtmlOnly) {
        var mHtml = propertys.select(function (o) {
            return '<li >' + this.createPropertyDom(o, true) + '</li>';
        }, this);

        var html = '<ul class="m-propertys m-members" >' + mHtml.join('') + '</ul>'
        if (getHtmlOnly)
            return html;
        return propertys.dom = $(html);
    },
    showPropertys: function (node, propertys) {
        if (!propertys.dom)
            this.createPropertysDom(propertys);

        this.showInRight(propertys.dom);
    },
    showEvents: function (node, events) {
        this.showMethods(node, events);
    },
    createClassDom: function (cls) {
        var html = '<div class="m-class">'
                        + '<div class=m-name >{name}</div><br/>'
                        + '<div class=m-detailRemark >{0}</div><br/>'
                        + '<div class=m-class-members >'
                                + '<div class=m-class-propertys ><div class="m-title m-toggle" onclick="toggleDisplay(this.nextSibling)" >属性 <span class="gray font-light" >({1})</span>：</div></div><br/>'
                                + '<div class=m-class-methods ><div class="m-title m-toggle" onclick="toggleDisplay(this.nextSibling)" >方法 <span class="gray font-light" >({2})</span>：</div></div><br/>'
                                + '<div class=m-class-events><div class="m-title m-toggle" onclick="toggleDisplay(this.nextSibling)" >事件 <span class="gray font-light" >({3})</span>：</div></div></div><br/>'
                    + '</div>';
        return cls.dom = $(html.format(encodeHtml(cls.remark), cls.propertys.length, cls.methods.length, cls.events.length, cls));
    },
    appendClassMembers: function (cls) {
        if (!cls.propertys.dom)
            this.createPropertysDom(cls.propertys)

        if (!cls.methods.dom)
            this.createMethodsDom(cls.methods)

        if (!cls.events.dom)
            this.createMethodsDom(cls.events)

        cls.dom.find(".m-class-propertys").append(cls.propertys.dom);
        cls.dom.find(".m-class-methods").append(cls.methods.dom);
        cls.dom.find(".m-class-events").append(cls.events.dom);
    },
    showClass: function (node, cls) {
        if (!cls.dom)
            this.createClassDom(cls);
        else if (cls.dom[0].parentNode)
            return;
        this.appendClassMembers(cls);

        this.showInRight(cls.dom);
    }
});

$(function () {
    window.rootTable = $("#rootTable");
    var topDiv = $('#top-div');

    var right = $("#right-cell");

    function resize() {
        var height = $.doc.height();
        rootTable.height(parseInt(height) - parseInt(topDiv.height()));
    }

    $.getBody().on('sizechange',resize);
    resize();
    setTimeout(resize, 300);
    API.current = new API();
})