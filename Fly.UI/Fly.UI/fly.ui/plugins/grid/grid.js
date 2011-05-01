/// <reference path="../../../fly/fly-comment.js" />
/// <reference path="../../fly.ui.js" />

fly.regPlugin("gridpanel", function ($) {
    var arrP = Array.prototype, ui = $.ui, lib = $.lib, $e = lib.Event, collection = $.collection, dh = ui.DomHelper, $d = $.data
    function Grid(config) {
        this.initColumns(config);
        arguments.callee.$base.apply(this, arguments)
        if (this.tableOnly)
            this.domFrame = "Table";
        this.cellCss || (this.cellCss = "f-" + this.$ctype + "-c");
        this.rowCss || (this.rowCss = "f-" + this.$ctype + "-r")
        this.onAfterBind([this.initFirstCell, this.initFirstRow]);
        this.onCreateFrame(function () {
            this.ellipsisContent && this.body && this.body.addClass("f-" + this.$ctype + "-" + ui.util.ellipsisCss)
            this.bindEvents()
        });
        if (this.store)
            this.setStore(this.store)
    }

    ui.grid.GridPanel = new $.Class(
    {
        base: ui.Panel,
        inherit: ui.IDataBound,
        constructor: Grid,
        onInit: $e.createEventFn("init"),
        autoLoad: true,
        sortInfo: null, 
        rowEvents: null,
        initColumns: function (config) {
            this.columns = []
            if (config.columns) {
                for (var i = 0; i < config.columns.length; i++) {
                    var c = config.columns[i]
                    if (!(c instanceof ui.grid.Column)) {
                        var ac = new ui.grid.Column(c)
                        if (c instanceof ui.grid.RowSelectionModel) {
                            c.column = ac
                            if (!config.sm) config.sm = c
                            ac.join = ui.grid.Column.prototype.join
                        }
                        c = ac;
                    }
                    c.join(this, i);
                    this.columns.push(c);
                }
                delete config.columns
            }
        },
        hideHeader: false,
        tableOnly: false,
        ellipsisContent: true,
        applyUniqueCss: true,
        baseCss: "f-grid",
        headerCss: "",
        rowCss: "",
        altRowCss: "f-grid-row-alt",
        altRowBy: 2,
        domFrame: { El: { Wrap: ["Tbar", "Header", { Body: "Table" }, "Bbar"]} },
        colFormat: '<COL class="{colCss} f-{$ctype}-col-{dataIndex}" />',
        colTemplate: null,
        createCols: function () {
            var htmls = this.columns.select(function (o, i) {
                return this.colTemplate.format(i, this, o).apply()
            }, this)
            return htmls.join("")
        },
        // headerCellTemplate: null,
        headerCellFormat: '<TD class="f-{grid.$ctype}-hc" ><span class="f-{grid.$ctype}-col-resize"><div></div></span><span _class="f-{grid.$ctype}-col-sort-ico"><div></div></span><span class="f-{grid.$ctype}-hc-text"></span></TD>',

        // headerTemplate: null,
        headerFormat: '<DIV class="f-{$ctype}-h-outer {headerCss}" ><DIV class=f-{$ctype}-h-wrap ><TABLE border=0 cellpadding=0 cellspacing=0  class="f-{$ctype}-h">{createCols}<TBODY><TR></TR></TBODY></TABLE></DIV></DIV>',
        createHeader: function () {
            var outer = new ui.Element(this.headerTemplate.format(this).apply())
            var header = this.header = new ui.Element(outer.dom.firstChild.firstChild)
            header.wrap = new ui.Element(outer.dom.firstChild)
            header.outer = outer;

            this.columns.each(function () {
                this.createHeaderCell(header.dom.rows[0])
            });
            return header;
        },


        cellTemplate: null,
        cellFormat: null,
        createCell: function (column, i, cs, header) {
            var el = new ui.Element(this.headerCellTemplate.format(this, column).apply())
            header.append(el)
            return column.el = el
        },

        rowTemplate: null,
        rowFormat: null,
        rows: null,
        bindRecords: function (records, option) {

            if (!records) return
            var p = this.table.dom.parentNode;
            p.removeChild(this.table.dom)

            this.rows.each(function (r) {
                r.destroy()
            });

            this.rows.clear()

            option = option || {}
            this.columns.each(function (c) {
                if ($.is(c, ui.grid.RowNumberer))
                    c.current = option.start == null ? c.start : option.start
            })
            this.records = records;
            var rows = [];
            for (var i = 0; i < records.length; i++) {
                var row = new ui.grid.Row(this, records[i])
                rows.push(row)
            }

            this.rows.add.apply(this.rows, rows);
            this.altRowCss && this.onAfterBind(this.applyAltRowCss)
            if (!this.store.remoteSort && (this.sortDir || this.sortBy))
                this.sort(this.sortDir, this.sortBy)
            else
                for (var i = 0; i < rows.length; i++)
                    this.rowsContainer.dom.appendChild(rows[i].el.dom);

            this.fire("bindrecords", null, rows);

            p.appendChild(this.table.dom)

            return rows
        },


        //elFormat: '<DIV class="f-panel f-{$ctype} {css}"></DIV>',
        elTemplate: ui.Template.create('<DIV class="f-panel f-{$ctype} {css}"></DIV>'),
        //        createEl: function () {
        //            return new ui.Element(this.elTemplate.format(this).apply())
        //        },

        //        bodyFormat: '<DIV class="f-{$ctype}-body"></DIV>',
        //        bodyTemplate: null,
        //        createBody: function () {
        //            this.body = new ui.Element(this.bodyTemplate.format(this).apply())
        //            if (this.ellipsisContent) this.body.addClass("f-" + this.$ctype + "-" + ui.util.ellipsisCss)
        //            return this.body;
        //        },

        tableFormat: '<TABLE border=0 cellpadding=0 cellspacing=0 class="f-{$ctype}-t {tableCss}" >{createCols}</TABLE>',
        //tableTemplate: null,
        createTable: function () {
            this.table = new ui.Element(this.tableTemplate.format(this).apply())
            this.cols = this.table.find("col");
            this.cols.each(function (c, i) {
                this.columns[i].col = c;
            }, this);
            this.createRowsContainer()
            this.table.on("sizechange", function () {
                if (this.header) {
                    this.header.width(this.table.dom.offsetWidth);
                    var bDom = this.body.dom
                    if (bDom.offsetHeight < bDom.scrollHeight)
                        this.header.wrap.dom.style.marginRight = ui.util.scrollWidth;
                }
            }, this);

            if (this.header) {
                this.body.onScroll(function () {
                    this.header.wrap.dom.scrollLeft = this.body.dom.scrollLeft;
                }, this);
            }

            return this.table
        },
        findOwnerRow: function (el) {
            var id = $(el).closest("['f-row-id']").attr('f-row-id');
            return this.rows.dataMap[id];
        },
        bindEvents: function () {
            var me = this
            var res = me.rowEvents
            for (var k in res) {
                (function (k) {
                    me.table.on(k, function () {
                        var row = me.findOwnerRow($event.target);
                        row && res[k].call(me,row)
                    })
                })(k)
            }
        },
        createRowsContainer: function () {
            this.rowsContainer = new ui.Element(document.createElement("tbody"));
            this.table.dom.appendChild(this.rowsContainer.dom)
            return this.rowsContainer
        },

        wrapFormat: '<DIV  class="f-{$ctype}-wrap" ></DIV>',
        // wrapTemplate: null,
        //        createWrap: function () {
        //            //if (this.tableOnly) return null;
        //            return new ui.Element(this.wrapTemplate.format(this).apply())
        //        },

        createStyle: function () {
            var me = this
            if (this.rowHeight != null && this.rowHeight > 0) {
                var style = "height:" + this.rowHeight + (/^[\d\s]+$/.test(this.rowHeight) ? "px;" : ";")
                ui.Style.createCssRule(this.styleSheet, "." + this.uniqueCss + " .f-grid-body TR", style)
            }

            $.each(this.columns, function (i) {
                this.createRule(me.styleSheet)
                this.setWidth(this.width);
            });

        },
        parseColumns: function () {

        },
        onPreRender: $e.createEventFn("prerender", function () {
            if (this.fire("prerender") !== false) {
                this.rows = new $.collection.MapList();
                if (this.sm)
                    this.sm.join(this);
                //this.elTemplate || (this.elTemplate = new ui.Template(this.elFormat))
                this.wrapTemplate || (this.wrapTemplate = new ui.Template(this.wrapFormat))
                //this.bodyTemplate || (this.bodyTemplate = new ui.Template(this.bodyFormat))
                this.tableTemplate || (this.tableTemplate = new ui.Template(this.tableFormat))

                this.colTemplate || (this.colTemplate = new ui.Template(this.colFormat))
                this.headerTemplate || (this.headerTemplate = new ui.Template(this.headerFormat))
                this.headerCellTemplate || (this.headerCellTemplate = new ui.Template(this.headerCellFormat))

                if (this.rowFormat)
                    this.rowTemplate || (this.rowTemplate = new ui.Template(this.rowFormat))

                if (this.cellFormat)
                    this.cellTemplate || (this.cellTemplate = new ui.Template(this.cellFormat))

                this.styleSheet = ui.Style.defaultSheet()
                this.onCreateFrame(function () {
                    this.createStyle();
                    this.canBind = true;
                }, this);
            }
            else
                return false
        }),
        onRender: function () {
            ui.grid.GridPanel.$base.prototype.onRender()
            if (this.store)
                this.bind()
            //            if (this.height != null && this.height != "auto" && this.height != "")
            //                this.setHeight(this.height)
            //            if (this.width != null && this.width != "auto" && this.width != "")
            //                this.setWidth(this.width);
        },
        setHeight: function (height) {
            this.outer.height(height)
            if (this.body) {
                if (height != "" && height != null && height != "auto") {
                    var nh = parseInt(height);
                    var offset = this.body.offset();
                    this.body.height(Math.max(nh - offset.top - offset.bottom, 0));
                }
                this.applyScroll()
            }
        },
        setWidth: function (width) {
            (this.el || this.outer).width(width)
            //            if (width.toUpperCase() != "AUTO" && this.hasXScroll) {
            //                    widht = parseInt(width) - parseInt(ui.util.scrollWidth)

            //                var nw = parseInt(width);
            //                var offset = this.body.offset();
            //                this.body.height(Math.max(nh - offset.top - offset.bottom, 0));
            //            }

            if (this.body) {
                this.applyScroll()
            }
        },
        applyScroll: function () {
            //var tOffset=this.table.offset(),bOffset=this.body.offset()
            //            var bDom = this.body.dom, tDom = this.table.dom
            //            if (bDom.offsetHeight < bDom.scrollHeight) {
            //                if ($.browser.isIE9)
            //                    this.header.outer.dom.style.marginRight = ui.util.scrollWidth;
            //                this.hasXScroll = true
            //            }
            //            else {
            //                this.hasXScroll = false;
            //            }

        },

        applyAltRowCss: function () {
            var by = this.altRowBy, css = this.altRowCss, rs = this.rows
            var isFun = $.isFun(by)
            for (var i = 0; i < this.rows.length; i++)
                rs[i].tr[(isFun ? this.altRowBy(rs[i], i) : (i + 1) % by) ? "removeClass" : "addClass"](css);
        },

        initFirstCell: function () {
            var cells = this.firstCells || (this.firstCells = [])
            var css = this.firstCellCss || "f-" + this.$ctype + "-c-first";
            if (cells.length && cells[0].colIndex != 0) {
                for (var i = 0, l = cells.length; i < l; i++) {
                    var cell = cells[i]
                    cell.className = cell.className.replace(css, "")
                }
                cells.splice(0, cells.length);
            }
            var rows = this.rows
            for (var i = 0, l = rows.length; i < l; i++) {
                var c = rows[i].cells[0].el.dom;
                cells.push(c);
                c.className += " " + css;
            }
            if (this.header) {
                var hFist = this.header.dom.rows[0].cells[0]
                hFist.className += " " + css;
                cells.push(hFist);
            }
        },

        initFirstRow: function () {
            var dom, css = this.firstRowCss || "f-" + this.$ctype + "-r-first";
            if (this.firstRow && this.firstRow != this.rows[0])
                this.firstRow.tr.removeClass(css);

            if (this.firstRow = this.rows[0])
                this.firstRow.tr.addClass(css);
        },

        sort: function (dir, by) {
            window.d = new Date()
            var rows = this.rows, cont = this.rowsContainer.dom
            this.sortDir = dir
            this.sortBy = by;
            if (!this.store.remoteSort) {
                var compare = by.sortBy;
                if (!$.isFun(compare)) {
                    var p = by.sortBy == null ? by.dataIndex : by.sortBy
                    compare = function (a, b) {
                        var va = a.record[p], vb = b.record[p]
                        va = va === undefined ? null : va
                        vb = vb === undefined ? null : vb
                        return va == vb ? 0 : va > vb ? 1 : -1;
                    }
                }

                collection.IList.sort.call(rows, dir, compare);

                var p = this.table.dom.parentNode;
                p.removeChild(this.table.dom)

                try {
                    for (var i = 0; i < rows.length; i++)
                        cont.removeChild(rows[i].el.dom)
                } catch (e) { }

                for (var i = 0; i < rows.length; i++)
                    cont.appendChild(rows[i].el.dom)

                p.appendChild(this.table.dom)
                this.initFirstRow();
                this.altRowCss && this.applyAltRowCss()
                this.fire("sort");
            }
            else {
                this.bind({
                    sortDir: dir,
                    sortBy: by.sortBy == null || $.isFun(by.sortBy) ? by.dataIndex : by.sortBy
                })
            }
            //alert(new Date() - window.d)
            return this;
        },
        onSort: $e.createEventFn("sort")
    })
    lib.Component.Mgr.regType('grid', ui.grid.GridPanel)



    ui.grid.Row = $.Class({
        constructor: function (grid, record) {
            this.cells = [];
            this.grid = grid
            this.record = record
            this.id = this.record[grid.store.idProperty];
            if (this.id == null || this.id instanceof Function)
                this.id = Math.random().toString().substr(2);
            this.buildUI()
        },
        id: null,
        el: null,
        tr: null,
        buildUI: function () {
            if (this.grid.rowTemplate) {
                this.el = new ui.Element(this.grid.rowTemplate.format(this.grid, this.record).apply())
                this.tr = this.el.dom.nodeName == "TBODY" ? new ui.Element(this.el.dom.firstChild) : this.el;
            }
            else {
                this.el = new ui.Element(document.createElement("tr"));
                this.tr = this.el;
                this.tr.dom.className = this.grid.rowCss
            }

            this.el.dom.setAttribute("f-row-id", this.id)

            var cols = this.grid.columns, rec = this.record
            for (var i = 0; i < cols.length; i++) {
                var c = new ui.grid.Cell(this, cols[i], this.record)
                this.cells[i] = c
            }
        },
        destroy: function () {
            if (this.tr) {
                this.tr.un()
                this.tr && this.tr.remove()
            }
            if (this.el) {
                this.el.un()
                this.el.remove()
            }
        }
    })

    //    $.collection.SortInfo.typeDefaultCompares.push(
    //    {
    //        type: ui.grid.Row,
    //        compare: function (by) {
    //            by = by.dataIndex
    //            return function (a, b) {
    //                var va = a.record.get(by), vb = b.record.get(by)
    //                return va == vb ? 0 : va > vb ? 1 : -1
    //            }
    //        }
    //    })

    ui.grid.Cell = $.Class({
        constructor: function (row, column, record) {
            this.row = row
            this.grid = row.grid
            this.column = column
            this.record = record
            this.buildUI()
            this.render();
            this.row.tr.dom.appendChild(this.el.dom);
        },
        buildUI: function () {
            var temp = this.column.template || this.grid.cellTemplate;
            if (temp)
                this.el = new ui.Element(temp.format(this.grid, this.record).apply())
            else
                this.el = new ui.Element(document.createElement("td"));

            this.el.dom.className += " " + this.grid.cellCss + " " + this.column.cellCss
        },
        render: function () {

            var v, col = this.column
            if (col.dataIndex != null)
                this.value = v = this.record[col.dataIndex]
            if (col.renderer) {
                var c = col.renderer(v, this)
                if (c === undefined)
                    return;
                this.value = v = c;
            }

            if (col.format)
                this.value = v = col.format.$format(v);

            this.el.dom[col.contentProperty] = v == null ? "" : v
        }
    })

    ui.grid.Column = $.Class({
        base: lib.Component,
        constructor: function (config) {
            if (config != null && !$.isObject(config))
                config = { dataIndex: config }

            config && $.extend(this, config)
        },
        join: function (grid, index) {
            this.grid = grid
            this.header == null && (this.header = this.dataIndex);
            this.index = index;
            this.colCss = "f-" + grid.$ctype + "-col-" + index
            this.cellCss = this.colCss + (this.css ? " " + this.css : "")
            this.setWidth(this.width)
        },
        header: null,
        index: 0,
        dataIndex: null,
        css: "",
        sortable: true,
        sortBy: null,
        contentProperty: "innerText",
        createRule: function (sheet) {
            if (this.rule) return this
            this.rule = ui.Style.createCssRule(sheet, "." + this.grid.uniqueCss + " ." + this.colCss, "")
            if (this.style)
                ui.Style.createCssRule(sheet, "." + this.grid.uniqueCss + " .f-grid-body ." + this.colCss, this.style)
        },
        setWidth: function (width) {
            this.width = ui.Style.checkValue("width", width)
            if (this.rule && this.width != null)
                this.rule.style.width = this.width
        },
        addWidth: function (width) {
            if (width) {
                this.setWidth(this.headerCell.dom.offsetWidth + width)
                var tWidth = this.grid.header.dom.offsetWidth + width
                this.grid.table.width(tWidth)
                this.grid.header.width(tWidth)
            }
        },
        createHeaderCell: function (header) {
            var me = this, grid = me.grid
            var el = new ui.Element((this.headerCellTemplate || this.grid.headerCellTemplate).format(this.grid, this).apply())
            el.appendTo(header);
            this.headerTextEl = new ui.Element("[class*='-hc-text']", el.dom);

            this.headerCell = el

            this.resizeEl = new ui.Element("[class*='-col-resize']", el.dom);
            this.resizeHelper = new ui.DragHelper({
                handle: this.resizeEl,
                changeCursor: false,
                mode: "x",
                listeners:
                {
                    start: function () {
                        var mark = $('<div class="f-' + grid.$ctype + '-resize-mark"></div>');

                        var wRect = grid.wrap.rect(), cRect = this.handle.rect()
                        mark.left(cRect.left - wRect.left + cRect.width - 1)
                        mark.height(grid.body.dom.offsetHeight)
                        grid.body.before(mark)
                        this.elements.merge(mark)
                    },
                    stop: function () {
                        this.elements.each(function (o) {
                            o.remove()
                        });
                        this.elements.clear()
                        me.addWidth(this.context.dx)
                    }
                }
            });

            this.sortEl = new ui.Element("[_class*='-col-sort-ico']", el.dom);
            this.sortEl.cssPart = this.sortEl.attr("_class")
            this.sortEl.addClass(this.sortEl.cssPart);

            el.onClick(function () {
                if (ui.DragHelper.started) return;
                if (/input|button/i.test($.$event.target.nodeName)) return;

                me.sortDir = me.sortDir == "ASC" && grid.sortBy == me ? "DESC" : "ASC"

                var css = me.sortEl.cssPart, ascCss = css + "-asc", descCss = css + "-desc"
                me.sortEl.removeClass(me.sortDir == "ASC" ? descCss : ascCss).addClass(me.sortDir == "ASC" ? ascCss : descCss)
                var pBy = grid.sortBy
                if (pBy != me && $.is(pBy, ui.grid.Column))
                    pBy.sortEl.removeClass(ascCss + " " + descCss);
                grid.sort(me.sortDir, me);
            });


            this.headerCss && el.addClass(this.headerCss);
            this.headerStyle && (el.dom.style.cssText += ";" + this.headerStyle)

            if (this.headerRenderer) {
                var c = this.headerRenderer(this.header, this.headerTextEl)
                if (c != null && c != "")
                    this.headerTextEl.dom.innerHTML = c
            }
            else if (this.header != null && this.header !== '') {
                this.headerTextEl.dom.innerHTML = this.header
            }
            el.dom.className += " " + this.colCss
            return this.el = el
        }
    })

    //    $.collection.SortInfo.typeCompares.push(
    //    {
    //        type: ui.grid.Column,
    //        compare: function (by) {
    //            var compare, convert = by.sorttype == "auto" ? false : $d.Converters[by.sorttype]();
    //            if (by.compare) {
    //                if (by.compare.length == 2)
    //                    compare = by.compare
    //                else
    //                    compare = function (a, b) {
    //                        var va = by.compare.call(by, a, a.cells[by.index]), vb = by.compare.call(by, b, b.cells[by.index])
    //                        if (convert) va = convert(va), vb = convert(vb)
    //                        return va == vb ? 0 : va > vb ? 1 : -1;
    //                    }
    //            }
    //            else {
    //                if (by.renderer)
    //                    compare = function (a, b) {
    //                        var va = a.cells[by.index].el.dom.innerText, vb = b.cells[by.index].el.dom.innerText
    //                        if (convert) va = convert(va), vb = convert(vb)
    //                        return va == vb ? 0 : va > vb ? 1 : -1;
    //                    }
    //                else if (by.dataIndex == null)
    //                    compare = function (a, b) {
    //                        var va = a.cells[by.index].value, vb = b.cells[by.index].value
    //                        if (convert) va = convert(va), vb = convert(vb)
    //                        return va == vb ? 0 : va > vb ? 1 : -1;
    //                    }
    //            }
    //            return compare;
    //        }
    //    })

    ui.grid.RowNumberer = $.Class(
    {
        base: ui.grid.Column,
        constructor: function () {
            arguments.callee.$base.apply(this, arguments)
            this.current = this.start
        },
        width: 23,
        sorttype: "number",
        fixed: true,
        hideable: false,
        menuDisabled: true,
        id: 'numberer',
        sortBy: function (a, b) {
            var va = a.rowNumber, vb = b.rowNumber
            return va == vb ? 0 : va > vb ? 1 : -1;
        },
        start: 1,
        seed: 1,
        next: function () {
            this.current += this.seed
        },
        renderer: function (v, cell) {
            var c = this.current;
            this.next();
            return cell.row.rowNumber = c;
        }
    });

    ui.grid.RowSelectionModel = $.Class(
    {
        base: ui.BaseSelectionModel,
        selectedCss: "f-grid-r-selected",
        getItems: function () {
            return this.grid.rows
        },
        setState: function (row, isSelected) {
            ui.grid.RowSelectionModel.$base.prototype.setState.apply(this, arguments)
            row.checkbox && (row.checkbox.dom.checked = isSelected)
        },
        join: function (grid) {
            if (this.grid) return;
            this.grid = grid;
            var me = this
            grid.onCreateFrame(function () {
                grid.table.click(function () {
                    var id = $($event.target).closest("['f-row-id']").attr('f-row-id');
                    if (document.selection && document.selection.createRange().htmlText) return;
                    var row = me.getById(id);
                    row && me.itemEventFire(row, $($event.target).closest("td").find('.f-grid-r-cbox').length > 0 ? true : null);
                });

                function mouseover(getRowOnly) {
                    var id, dom = $event.target
                    while (dom && dom.getAttribute && (id = dom.getAttribute("f-row-id")) == null)
                        dom = dom.parentNode;

                    var row = me.getById(id);
                    if (id == null || row == null) return;
                    if (getRowOnly === true) return row;
                    var range = me.getRange(startRow, row), map = {};

                    for (var i = 0; i < range.length; i++) {
                        var r = range[i]
                        map[r.id] = r;
                        if (r._oldSelected == null) {
                            //r._oldSelected = r.selected==true;
                            rows[r.id] = r;
                        }
                        me.select(r.row || r, true, true);
                    }
                    for (var k in rows) {
                        if (!(k in map))
                            me.select(rows[k], rows[k]._oldSelected == true, true);
                    }
                }


                function stop() {
                    grid.table.un("mouseover", mouseover);
                    $.doc.un("mouseup", stop);
                    startRow = null;
                    for (var k in rows)
                        rows[k]._oldSelected = null;
                    rows = {}
                    _mouseovered = 0
                }

                var startRow, rows = {}, si = 0, ci = 0, _mouseovered

                grid.table.on("selectstart", function () {
                    if (_mouseovered) return;
                    if ($event.ctrlKey)
                        dh.unSelection()
                    rows = {}
                    if (startRow = mouseover(true)) {
                        grid.table.on("mouseover", mouseover);
                        $.doc.on("mouseup", stop);
                        _mouseovered = 1
                    }
                })
            })
        },
        elName: "tr"
    })
    var rsmP = ui.grid.RowSelectionModel.prototype
    ui.grid.RowSelectionModel.$extend(
    {
        onSelect: rsmP.onSelect
    })

    var gcsm = ui.grid.CheckboxSelectionModel = $.Class(
    {
        base: ui.grid.RowSelectionModel,
        width: 25,
        boxCss: "",
        join: function (grid) {
            gcsm.$base.prototype.join.call(this, grid)
            if (this.column)
                this.column.boxCss = 'f-' + this.grid.$ctype + '-r-cbox f-node-cbox'
            return this
        },

        headerRenderer: function (v, el) {
            if (this.grid.sm.singleSelect) return
            el.dom.innerHTML = '<input type=checkbox unselectable="on"  />';
            this.headerBox = new ui.Element(el.dom.firstChild)
            this.headerBox.onClick(this.headerClick, this.grid.sm, this.headerBox);
            this.headerBox.onContextMenu(this.headRightClick, this.grid.sm, this.headerBox);
        },
        renderer: function (v, cell) {
            cell.el.dom.innerHTML = '<input type=checkbox unselectable="on" class="' + this.boxCss + '" />'
            var el = cell.row.checkbox = new ui.Element(cell.el.dom.firstChild);
            el.onClick(this.boxClick, this.grid.sm, el, cell.row)
            return
        },
        boxClick: function (el, row) {
            var me = this, is = el.dom.checked;
            setTimeout(function () {
                me.select(row, is)
                el.dom.blur();
            })
            return false
        },
        headRightClick: function (el) {
            for (var i = 0, len = this.grid.rows.length; i < len; i++)
                this.toggleState(this.grid.rows[i])
            return false
        },
        headerClick: function (el) {
            el.dom.checked ? this.selectAll() : this.clearSelections()
        },
        elName: "tr"
    });


    ui.grid.TreeGridPlugin = $.Class(
    {
        base: lib.Component,
        inherit: ui.IControlPlugin,
        constructor: function () {
            arguments.callee.$base.apply(this, arguments)
            if (!$.is(this.sm, ui.tree.CheckboxSelectionModel) && this.useCheckbox) {
                this.sm = new ui.tree.CheckboxSelectionModel(this.sm)
            }
        },
        listeners:
        {
            join: function () {
                var c = this.ownerControl
                if (!$.is(this.treeColumn, ui.grid.Column))
                    this.treeColumn = c.columns[this.treeColumn]
                if (this.treeColumn.renderer != this.renderer) {
                    this.oldRenderer = this.treeColumn.renderer;
                    this.treeColumn.renderer = this.renderer;
                }
                c.tree = this;
                c.css = c.css || "" + " f-grid-tree"
                this.treeColumn.css = this.treeColumn.css || "" + "f-grid-tree-cell"
                c.rowTemplate = this.rowTemplate = new ui.Template('<tbody><tr ></tr></tbody>');
                c.createRowsContainer = this.createRowsContainer.bind(this);
                c.getParams = this.getParams
                this.ownerNode = c.ownerNode
                this.isRoot = !this.ownerNode
                this.childrenProperty = c.store.childrenProperty
                if (this.isRoot) {
                    this.root = this
                    this.allNodes = new $.collection.MapList()
                    this.nodes = new $.collection.MapList();
                    if (c.sm)
                        c.sm.getItems = c.getAllRows = this.getAllRows.bind(this);
                }
                else {
                    this.nodes = this.ownerNode.nodes;
                    this.root = this.ownerNode.tree.root;
                    if (this.root.sortChildren) {
                        this.root.ownerControl.onSort(function () {
                            var rc = this.root.ownerControl;
                            c.sort(rc.sortDir, rc.sortBy);
                        }, this)
                    }
                }
                c.onPreBind(this.reBuildOption, this);
                c.onSort(this.reSetAllRows, this);

                this.checkBoxHtml = this.useCheckbox ? '<input type=checkbox class="f-node-cbox" />' : ""
                this.contentDomProperty = this.contentIsHtml ? "innerHTML" : "innerText"
            }
        },
        reBuildOption: function (option) {
            var idp = this.ownerControl.store.idProperty
            if (!this.isRoot) {
                if (option[idp] == null)
                    option[idp] = this.ownerNode.id
                if (!option.record)
                    option.record = this.ownerNode.record
            }
        },
        sortChildren: true,
        useCheckbox: true,

        contentProperty: "text",
        contentDomProperty: "innerHTML",
        contentIsHtml: true,
        treeColumn: 0,
        deepIndent: 10,
        rowTemplate: null,
        toggleByIcon: true,
        toggleByContent: false,
        toggleEvent: "click",
        nodes: null,
        getAllRows: function () {
            var t = this.root
            if (t.allRows) return t.allRows;
            var allNodes = this.root.allNodes;
            var rows = t.ownerControl.table.find("tbody['f-row-id']")
            this.allRows = new collection.MapList();
            for (var i = 0; i < rows.length; i++)
                this.allRows.add(allNodes.getById(rows[i].getAttribute("f-row-id")).row)
            return this.allRows
        },
        getAllNodes: function () {
            var t = this.root
            if (t._allNodes) return t._allNodes;

            var rows = this.getAllRows();
            t._allNodes = new collection.MapList();
            for (var i = 0; i < rows.length; i++)
                t._allNodes.add(rows[i].node)

            return t._allNodes
        },
        reSetAllRows: function () {
            this.root.allRows = null
            this.root._allNodes = null
        },
        getParams: function () {
            return { nodeId: this.nodeId }
        },
        createRowsContainer: function () {
            return this.ownerControl.rowsContainer = this.ownerControl.table;
        },
        renderer: function (v, cell) {
            var row = cell.row, tree = cell.grid.tree

            var node = row.node = new ui.grid.TreeGridNode({
                tree: tree,
                parentNode: tree.ownerNode,
                wrap: row.el,
                el: row.tr,
                elBody: cell.el,
                cell: cell,
                row: row,
                record: row.record,
                id: row.id
            });

            row.el.dom.className += " f-node"

            var rowCss = node.leaf ? "f-node-leaf" : "f-node-parent f-node-collapse"
            row.tr.dom.className += " f-node-el " + rowCss

            node.buildUI(v)
            tree.nodes.add(node)
            tree.root.allNodes.add(node)
        },

        getChildGridType: function () {
            return this._childGridType || (this._childGridType = ui.grid.ChildGird.create(this.ownerControl))
        }
    });

    lib.Component.Mgr.regType("treegrid", ui.grid.TreeGridPlugin)

    ui.grid.ChildGird = {
        create: function (grid) {
            return $.Class({
                base: grid.constructor
            }).extend(ui.grid.ChildGird)
        }
    }

    ui.grid.TreeGridNode = $.Class(
    {
        base: ui.tree.Node,

        setText: function (text) {
            if (this.tree.oldRenderer) {
                text = this.tree.oldRenderer.call(this.cell.column, text, this.cell)
                if (text === undefined) {
                    dh.moveContent(this.elBody, this.content);
                    return this;
                }
            }

            if (text != null && text != "" && this.cell.column.format)
                text = this.cell.column.format.$format(text);
            return ui.grid.TreeGridNode.$base.prototype.setText.call(this, text)
        },

        childrenRow: null,

        createChildrenRow: function () {
            var me = this
            var grid = this.tree.ownerControl
            this.childrenRow = new ui.Element('<tr class="f-node-pad"><td colSpan={0} ></td></tr>'.$format(
                grid.columns.length
                ));
            var cols = grid.cols.toHtml()

            this.childGrid = new (this.tree.getChildGridType())(
                $.extend(grid.config,
                {
                    createCols: function () { return cols },
                    hideHeader: true,
                    tableOnly: true,
                    columns: grid.columns.select("this.clone()"),
                    plugins: grid.plugins.select("this.clone()"),
                    store: grid.store,
                    nodeId: this.row.id,
                    height: "auto",
                    ownerNode: this,
                    tableCss: "f-grid-child-table",
                    uniqueNumber: null
                }))

            this.childGrid.render(this.childrenRow.dom.firstChild);
            this.tree.root.reSetAllRows()
            var resize = function () {
                me.childGrid.table.width(grid.table.dom.offsetWidth);
            }
            grid.table.on("sizechange", resize);
            resize();
            return this
        },
        showChildPad: function () {
            if (!this.childrenRow) {
                this.createChildrenRow();
                this.wrap.dom.appendChild(this.childrenRow.dom)
            }
            this.childrenRow.show()
            return this
        }
    })
});

