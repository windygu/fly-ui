
/*
* style unit tests
*/
;(function ($) {

	if (!$) return arguments.callee
    fly.ui.Style.createStyle('.test-style{width:100px;height:100%;color:red;}')
    fly.ui.Style.loadCss('../style/css.css')
    var $node;
    $(function()
    {
        $('<div class=test-style style="display0:hidden" ></div>').appendTo(document.body);
        $node=$(".test-style")
   });

	module('style - fly style: ' + ($ == fly ? "fly" : "jQuery"));
    
    test("style get,set,num", function () {
       equals(fly.ui.Style.get($node[0],"width"),"100px",'fly.ui.Style.get($node[0],"width")')
       equals($node.width(),"100px",'node.width()')

       equals(fly.ui.Style.num($node[0],"width"),100,'fly.ui.Style.num($node[0],"width")')
       equals($node.css("width"),"100px",'$node.css("width")')

       fly.ui.Style.set($node[0],"width",200)
       equals(fly.ui.Style.get($node[0],"width"),"200px",'fly.ui.Style.get($node[0],"width")')

       
       equals(fly.ui.Style.get($node[0],"border-top-style"),"solid",'fly.ui.Style.get($node[0],"border-top-style")')
       equals($node.borderTopWidth(),"1px",'$node.borderWidth()')

    });


})(fly);
