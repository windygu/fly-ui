
/*
* event unit tests
*/
;(function ($) {
    
	if (!$) return arguments.callee

    var node = document.createElement("div");
    var date=new Date("2010/05/17 00:00:00")

	module('event - fly JsonUtils: ' + ($ == fly ? "fly" : "jQuery"));
    debugger
	  test("Json encode", function () {
      debugger
//        equals($.lib.Json.encodeArray([1,"abc",true,date]),'[1,"abc",true,"2010-05-17 00:00:00"]','编码数组')

//        equals($.lib.Json.encodeDate(date),"2010-05-17 00:00:00","编码日期")

//        equals($.lib.Json.encode(date),'"2010-05-17 00:00:00"',"编码日期")

//        equals($.lib.Json.encode(123),"123","编码数字")
//        
//        equals($.lib.Json.encode(-123),"-123","编码数字")

//        equals($.lib.Json.encode(false),"false","编码数字")

//        equals($.lib.Json.encode(null),"null","编码 null")

//        equals($.lib.Json.encode(undefined),"null","编码 undefined")

//        equals($.lib.Json.encode({n:123,d:date,b:true,s:"abc",j:{a:1,b:2}}),'{"n":123,"d":"2010-05-17 00:00:00","b":true,"s":"abc","j":{"a":1,"b":2}}',"编码 undefined")
    });


////    test("Json decode", function () {
////        var obj=$.lib.Json.decode($.lib.Json.encode({n:123,d:date,b:true,s:"abc",j:{a:1,b:2}}))
////        ok(obj.n==123 && obj.b==true&& obj.j.b==2,"解码")
////    })

////    test("Json each",function()
////    {
////        var j={a:1,b:2,c:3}
////        var k="",sum=0
////        $.lib.Json.each(j,function(v,i)
////        {
////            k+=i,sum+=this
////        })

////        equals(k, "abc","Json 所有键")
////        equals(sum, 6,"Json 所有值")
////        k="",sum=""
////        $.lib.Json.each(j,function(v,i,json,split)
////        {
////            k+=i,sum+=split+v
////        },",")
////        equals(k, "abc","Json 所有键")
////        equals(sum, ",1,2,3","Json 所有值")
////    });

test("wwwww", function () {
      debugger
      });

     test("Json map",function()
    {
        debugger
        var j={a:1,b:2,c:3}
        var k="",sum=0
        var arr=$.lib.Json.map(j,function(v,i)
        {
            return v
        })

        equals(arr[2], 3,"Json 所有值")
    });


})(fly);
