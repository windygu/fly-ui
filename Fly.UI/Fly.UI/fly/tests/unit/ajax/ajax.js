/*
* ajax unit tests
*/
; (function($) {
	if (!$) return arguments.callee

	module('ajax - fly AjaxHelper : ' + ($ == fly ? "fly" : "jQuery"));
    var postData={ data: { arg1: 1, arg2: "123"} }
    
	test("ajax - get", function() {
		expect(3);
		stop()
		$.get("../ajax/ajax.html", function() {
			ok(true, "$.get callback(url:../ajax/ajax.html)");
		})
        
		$.get("../ajax/ajax.html", "s", function() {
			ok(true, "$.get callback(url:../ajax/ajax.html?args),带参数");
		})

		if ($.ajax.get)
			$.ajax.get("../ajax/ajax.html", function() {
				ok(true, "$.ajax.get callback(url:../ajax/ajax.html)");
			})

		setTimeout(start, 4000)
	});


	test("ajax - post", function() {
		expect(6);
		stop()

		$.post("../ajax/ajax.html", function() {
			ok(true, "$.post callback (url:../ajax/ajax.html)");
		})

		$.ajax({
			url: "../ajax/ajax.html",
			type: "post",
			success: function() {
				ok(true, "$.post success (url:../ajax/ajax.html)");
			},
			complete: function() {
				ok(true, "$.post complete (url:../ajax/ajax.html)");
			}
		})

		$.post("../common/ajax.aspx", function() {
			ok(true, "$.post callback (url:../common/ajax.aspx)");
		})


		$.post("../common/ajax.aspx",postData, function() {
			ok(true, "$.post callback (url:../common/ajax.aspx?data={arg1:1,arg2:'123'}) 带参数");
		})

		if ($.ajax.post)
			$.ajax.post("../common/ajax.aspx", { sleep: 2000 }, function() {
				ok(true, "$.post callback (url:../common/ajax.aspx?sleep=2000) 服务器端暂停2秒");
			})

		setTimeout(start, 4000)
	});

	test("ajax - $.ajax method chaining", function() {
		expect(5);
		stop()
		$.ajax.onStart(function() {
			ok(true, "$.ajax.onStart ")
		}).onSend(function() {
			ok(true, "$.ajax.onSend ")
		}).onSuccess(function() {
			ok(true, "$.ajax.onSuccess")
		}).onComplete(function() {
			ok(true, "$.ajax.onComplete")
		}).post("../common/ajax.aspx", { sleep: 1000 })


		$.ajax.url("noExists.htm").onError(function() {
			ok(true, "访问不存在的页面,出错")
		}).go()

		setTimeout(start, 4000)
	});
    
	test("ajax - timeout", function() {
		expect(2);
		stop()
		$.ajax.timeout(1000).onError(function() {
			ok(true, "执行超时：服务器端暂停2秒,客户端1秒超时")
		}).onSuccess(function() {
			ok(false, "错误：超时后返回,不应该执行")
		}).post("../common/ajax.aspx", { sleep: 2000 })

        $.ajax(
        {
            timeout:2000,
            error:function() {
			    ok(false, "错误：服务器端暂停1秒,客户端2秒超时")
		    },
            success:function() {
			    ok(true, "正确执行:服务器端暂停1秒,客户端2秒超时")
		    },
            type:"post",
            url:"../common/ajax.aspx",
            data:{ sleep: 100 }
        })
		setTimeout(start, 4000)
	});
    
    test("ajax - get dataType", function() {
		expect(2);
		stop()
        
		$.ajax(
        {
            success:function(result) {
			    ok(result && result.nodeName=="#document", "获取XML格式")
		    },
            dataType:"text/xml",
            url:"../ajax/ajax.html"            
        })
        
        $.ajax(
        {
            success:function(result) {
			    ok(result && result.arg2===postData.data.arg2, "得到Json格式数据")
		    },
            dataType:"json",
            url:"../common/ajax.aspx",
            data:postData,
            type:"post"
        })
		setTimeout(start, 4000)
	});
    
 test("ajax - sync", function() {
		expect(4);
		var r=$.ajax(
        {
            success:function(result) {
			    ok(result && result.nodeName=="#document", "获取XML格式")
		    },
            async:false,
            dataType:"text/xml",
            url:"../ajax/ajax.html"            
        })
        ok(r && r.nodeName=="#document", "直接获取$.ajax方法XML返回值")

        r=$.ajax(
        {
            success:function(result) {
			    ok(result && result.arg2===postData.data.arg2, "得到Json格式数据")
		    },
            async:false,
            dataType:"json",
            url:"../common/ajax.aspx",
            data:postData,
            type:"post"
        })
        ok(r && r.arg2===postData.data.arg2, "直接获取$.ajax方法Json返回值")

	});
    
	return arguments.callee
}
 (window.fly)
)
(window.jQuery);
