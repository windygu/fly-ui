
/*
* event unit tests
*/
;(function ($) {
    
	if (!$) return arguments.callee
    var node = document.createElement("div");

	module('event - fly EventManage:fly ' );
    
	  test("Event 常规", function () {
        expect(6);
        var is=true
        var flag=0;
        function f()
        {
            ok(is,"执行事件"+flag);
            return false
        }
        function f2()
        {
            ok(false,"不应被执行"+flag);
        }
        

        $.Event.on(node, "click", f2) 
        $.Event.on(node, "click", f)    //1
        $.Event.fire(node, "click") //f阻止事件继续执行,f2不应被执行

        $.Event.un(node, "click", f)
        $.Event.un(node, "click", f2)
        is=false
        $.Event.fire(node, "click")
         
        is=true
        $.Event.on(node, "click", [f2,f])   //2
        $.Event.fire(node, "click")  //f阻止事件继续执行,f2不应被执行
        
        $.Event.un(node, "click", [,f,f2])
        is=false
        $.Event.fire(node, "click")
        
        
        is=true
        $.Event.on(node, "click", [f2,function()
        {
            $.Event.stop()
            ok(is,"取消事件冒泡")
        }])                             //3
        $.Event.fire(node, "click")
        $.Event.un(node, "click")   
        is=false
        $.Event.fire(node, "click")
        
        
        is=true
        var $node=$(node)
        $node.on("click", f2)
        $node.on( "click", f)           //4
        $node.fire( "click")
        
        $node.un( "click", f)
        $node.un( "click", f2)
        is=false
        $node.fire( "click")
        is=true
        $node.on( "click", [f2,f])
        $node.fire( "click")
        $node.un( "click", [,f,f2])
        is=false
        $node.fire( "click")
        is=true
        
        $node.on( "click", [f2,function()
        {
            $.Event.stop()
            ok(is,"取消事件冒泡")
        }])
        
        flag=1
        $node.fire( "click")
        
        $node.un( "click")
        is=false
        $node.fire( "click")
        is=true
    });
})(fly);
