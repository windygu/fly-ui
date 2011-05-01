debugger
; (function ($) {
	
	if(!$)return 
	var modulePart=$ == fly?"fly ":$==jQuery?"jQuery ":""

	function getModuleName(module) {
		return "----------------------------"+modulePart+module+"----------------------------"
	}

	$(function() {
	var start = new Date();
		fireunit.module(getModuleName("selector"));
		var group1Li = $("#group1 li");
		fireunit.compare(5, group1Li.length, '$("#group1 li") : 6');

		var spanLi = $("#group1 span li")
		fireunit.compare(3, spanLi.length, '$("#group1 span li") : 3');

		var group1SpanLi = group1Li.filter("#group1 span li");
		fireunit.compare(3, group1SpanLi.length, '$("#group1 li").filter("#group1 span li") : 3');

		var isgroup1Li = spanLi.is("#group1 li");
		fireunit.compare(isgroup1Li, true, '$("#group1 span li").is("#group1 li")');


		fireunit.module(getModuleName("selector closest"))
		var lis = $("#group1 li")
		fireunit.compare(5, lis.closest().length, '$("#group1 li").closest() 应该为5个 li (返回本身)')
		fireunit.compare(1, lis.closest("span").length, '$("#group1 li").closest("span") 1个span(第一个 li 的上级)')

		fireunit.module(getModuleName("selector parent"))

		fireunit.compare(2, lis.parent().length, '$("#group1 li").parent() 应该为2个 ul')
		fireunit.compare(0, lis.parent("span").length, '$("#group1 li").parent("span") 0(所有li的直接上级都是ul)')

		fireunit.module(getModuleName("selector parents"))
		

		fireunit.compare(6, lis.parents().length, '$("#group1 li").parents() 应该为6')
		fireunit.compare(1, lis.parents("span").length, '$("#group1 li").parents("span") 1')

//		var start=new Date();
//		var i=0
//		while(i++<1000)
//		{
//			lis.parents()
//			lis.parents("span")
//		}
		fireunit.ok(true,new Date()-start)
	});
	return arguments.callee
}(fly))(jQuery)