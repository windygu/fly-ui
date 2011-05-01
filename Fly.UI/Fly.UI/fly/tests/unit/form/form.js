
/*
* form unit tests
*/
;(function ($) {
    
	if (!$) return arguments.callee

    var node = document.createElement("div");

	module('form - fly form: ' + ($ == fly ? "fly" : "jQuery"));
    
    $(function()
    {
        $('<div id=formContainer style="display:hidden" >'+
            '<form>'+
            '<input value="text" name="text" />'+
            '<input type="checkbox" name="checkbox" checked />'+
            '<input type="checkbox" name="checkbox" />'+
            '<input type="radio" name="radio" value="1" />'+
            '<input type="radio" name="radio" value="2" />'+
            '<input type="radio" name="radio" value="3" />'+
            '<select id="Select1" multiple="multiple">'+
                '<option value="a">a</option>'+
                '<option>b</option>'+
            '</select></form>'+
       ' </div>').appendTo(document.body);
   });

    test("form value,values", function () {

       $("#Select1").value("b")
       equals($("#Select1").value(),"b",'$("#Select1").value()')

       var vs=$("#formContainer").values()
       ok(vs.checkbox=="on" && vs.Select1[0]=="b" && vs.text=="text",'$("#formContainer").values()')
       
       var str=$("#formContainer").serialize()
       equals(str,'text=text&checkbox=on&Select1=b','$("#formContainer").serialize()')
       var json=fly.lib.Json.urlDecode(str)
       ok(json.checkbox==vs.checkbox&&json.Select1=="b"&&json.text==vs.text,'$("#formContainer").serialize() urlDecode')
    });


})(fly);
