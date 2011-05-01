
/*
* style unit tests
*/
;(function ($) {
    
	if (!$) return arguments.callee
    fly.ui.Style.createStyle('.test-arr{width:100px;height:100%;color:red;}')
    var nodes;
    var arr=[1,2,3],arr2=[2,3,4,5,6]
    $(function()
    {
        $('<div class=test-arr style="display0:hidden" ></div><span class=test-arr style="display0:hidden" ></span>').appendTo(document.body);
        nodes=$(".test-arr")
    });

	module('IList - fly Array: ' + ($ == fly ? "fly" : "jQuery"));
    
    test("Array get,set,num", function () {
       ok(nodes.isIList,"isIList")
       equals(nodes,nodes.getItems(),"nodes.getItems")
       equals(nodes[0],nodes.item(0),"nodes[0],nodes.item(0)")
       equals(nodes.select("this.nodeName")[0],"DIV","select")
       equals(nodes.map("this.nodeName")[0],"DIV","select")
       var i=0
       nodes.each(function()
       {
            i++
       })
       equals(i,nodes.length,"each")

       equals(nodes.select("this.nodeName").uniquelize().length,2,"uniquelize")
       equals([1,1].uniquelize().length,1,"uniquelize")
       equals([nodes[0],nodes[0]].uniquelize().length,1,"uniquelize")

       equals(arr.notIn(arr2).length,1,"notIn")
       equals(arr2.notIn(arr).length,3,"notIn")
       equals(arr.intersect(arr2).length,2,"intersect");
       
       var json=nodes.toJson("this.nodeName")
       var json2=nodes.toJson("this.nodeName","this")
       var json3=nodes.toJson()

       equals(json.DIV,json2.DIV,"toJson")
       equals(json.DIV,json3[0],"toJson")

       var isTrue=true
       nodes.on("keydown",function()
       {
            ok(isTrue,' nodes.on,nodes.fire')
       }).fire("keydown")
       isTrue=false
       nodes.un("keydown").fire("keydown")
       
       equals(nodes.add(document).length,3,"add")
       equals(nodes.remove(2).length,2,"remove")

       equals(nodes.insert(0,document).length,3,"insert")
       equals(nodes.remove(0).length,2,"remove")

       equals(nodes.addRange(document,document.body).length,4,"addRange")
       equals(nodes.indexOf(document),2,"indexOf")
       ok(nodes.contains(document.body),"contains")

       equals(nodes.remove([3,2]).length,2,"remove")

       equals(nodes.copyTo().length,2,"copyTo")
       equals(nodes.copyTo(0,[1]).length,3,"copyTo")

       equals([1].merge([1,2],[3,4]).length,5,"merge")
       

       nodes.data("testP",5)
       equals(nodes.data("testP"),5,"data")

       nodes.attr("testP2",5)
       equals(nodes.attr("testP2"),5,"attr")

       equals(nodes.removeAttr("testP").removeAttr("testP2").attr("testP"),undefined,"removeAttr")

       nodes.addClass("test test1")
       ok(nodes.hasClass("test") && nodes.hasClass("test1") ,"addClass,hasClass")

       nodes.removeClass("test test1")
       ok(!nodes.hasClass("test") && !nodes.hasClass("test1") ,"removeClass,hasClass")

        
        equals(nodes.disable().attr("disabled"),"disabled","disable")
        equals(nodes.enable().attr("disabled"),"","enable")

        equals(nodes.show().display(),"block","show")
        equals(nodes.hide().display(),"none","hide")
        
        ok(arr.any(),"any")
        ok(arr.any("o=>o>1"),"any")
        ok(!arr.any("o=>o>5"),"any")
        
        ok(arr.all(),"all")
        ok(arr.all("this>0"),"all")
        ok(!arr.all("this<0"),"all")

        equals(arr.where("o=>o>1").length,2,"where")
        equals(nodes.where("this.nodeName=='DIV'").length,1,"where")
        
        equals(arr.first("this>1")[0],2,"first")
        equals(nodes.first("this.nodeName=='DIV'")[0].nodeName,"DIV","first")

        equals(arr.last("this>1")[0],3,"last")
        equals(nodes.last("this.nodeName=='DIV'")[0].nodeName,"DIV","last")

        equals(arr.index(1),0,"index")
        equals(arr.index(3),2,"index")
        equals(arr.index(0),-1,"index")
        equals(arr.findIndex("this>1"),1,"findIndex")

        equals(arr.lastIndex(1),0,"lastIndex")
        equals(arr.lastIndex(3),2,"lastIndex")
        equals(arr.lastIndex(0),-1,"lastIndex")
        equals(arr.findLastIndex("this>1"),2,"findLastIndex")
        

        equals([1,2,3,4,5].aggregate(1,"total, next =>total * next"),120,"aggregate: 5的阶乘")
        equals(arr.sum(),6,"sum")
        equals(arr.sum("this+1"),9,"sum")

        equals(arr.compareOne(null,null,2),2,"compareOne")

        equals(arr.max(),3,"max")
        equals(arr.max("o=>o+1"),3,"max")

        equals(arr.min(),1,"min")
        equals(arr.min("o=>o-1"),1,"min")

        equals(arr.avg(),2,"avg")
        equals(arr.average("o=>o-1"),1,"average")

        equals(arr.count(),3,"count")
        equals(arr.count("o=>o>=2"),2,"count")
        
        equals([1,1,2,2].distinct().length,2,"distinct")
        equals([1,1,2,2].distinct("a,b=>a==b").length,2,"distinct")
    });


})(fly);
