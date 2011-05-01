fly.regPlugin(function ($, win) {
    var ui = $.ui;
    if (ui.Pager) {
        var p = ui.Pager.prototype;
        p.infoFormat = "显示 {_start}-{_end} 条，共 {total} 条"
        ui.Pager.buttonNames = { first: "第一页", previous: "上一页", next: "下一页", last: "最后一页", refresh: "刷新" }

        var iItems = ui.Pager.currentTypeBuilder.input.items;
        iItems[3].text = "  第  "
        iItems[5] = "<span class=gray > &nbsp;页，共 <span class=f-pager-pageCount ></span></span> 页&nbsp;"

    }
});