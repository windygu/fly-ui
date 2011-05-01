/// <reference path="fly.js" />
var ddd = new Date();
if (window) { ddd = 5 


function a(win,$) {
   

    $d.Record.create=function(fields,idProperty)
    {
        var fs=new Array();
        var r=$.Class(
        {
            base:$d.Record,
            modified:{},fields:a,getId:idProperty})
        
       
        r.prototype.initAccessor()
        return r;
    }
    $d.Record.parse=function(record)
    {
        return $.is(record,$d.Record)?record:new this(record,id)
    }


    $d.DataReader =$.Class(
    {
        constructor: function(meta, recordType){
            this.meta = meta;
            recordType||(recordType=meta.fields)
            this.recordType = $.like.likeArray(recordType) ? $d.Record.create(recordType,this.meta.id) : recordType;
        }
    })

    $d.JsonReader =$.Class(
    {    
        read : function(response){
            var json=lib.Json.decode(response==null?null:(response.responseText==null?response:response.responseText))
            if(!json)
                throw {message: "JsonReader.read: Json object not found"};
            return this.readRecords(json);
        },
        onMetaChange : function(meta, recordType, o){
            
        },
        simpleAccess: function(obj, subsc) {
    	    return obj[subsc];
        },
        getJsonAccessor: function(){
            var re = /[\[\.]/;
            return function(expr) {
                try {
                    return(re.test(expr))
                        ? new Function("obj", "return obj." + expr)
                        : function(obj){
                            return obj[expr];
                        };
                } catch(e){}
                return Ext.emptyFn;
            };
        }(),
        checkAccessor:function()
        {
            if(this.getTotal)return;
            var m = this.meta

            if(m.totalProperty) 
	            this.getTotal = lib.Json.getAccessor(m.totalProperty);
	            
	        if(m.successProperty) 
	            this.getSuccess = lib.Json.getAccessor(m.successProperty)
        },
        readRecords : function(json){
        
            this.jsonData = json;
            if(json.metaData){
                delete this.ef;
                this.meta = json.metaData;
                this.recordType = Ext.data.Record.create(json.metaData.fields,this.meta.id);
                this.onMetaChange(this.meta, this.recordType, json);
            }
            this.checkAccessor()
            var m = this.meta, Record = this.recordType,
                fs = Record.prototype.fields, fl = f.length;

    	    var root = this.getRoot(o),t = root.length, success = true;
    	    if(m.totalProperty){
                var v = parseInt(this.getTotal(o), 10);
                !isNaN(v)&&(t = v);
            }

            if(m.successProperty){
                var v = this.getSuccess(o);
                success=v !== false && v !== 'false'
            }
            
            var records = [];
	        for(var i = 0; i < c; i++)
	            records[i] = new Record(root[i]);

	        return {
	            success : success,
	            records : records,
	            totalRecords : totalRecords
	        };
        }
    });
 
    $d.DataProxy=new $.Class(
    {
        load:function(params, reader, callback, scope, arg){}
    })

    $d.MemoryProxy=new $.Class(
    {
        load:function(params, reader, callback, scope, option){
            try{
                var d=reader.read(this.data)
                callback.call(scope,d,option,true)
            }
            catch(e)
            {
                this.fire("loadException",e)
                callback.call(scope,null,option,false)
            }
        }
    })

    $d.HttpProxy=new $.Class(
    {
        load:function(params, reader, callback, scope, arg)
        {
            
        }
    });
    
    $d.Store=new $.Class({
        base:lib.Component,
        onInit:function(config)
        {            
            this.baseParams={};
            this.paramNames = {
                start : "start",
                limit : "limit",
                sort : "sort",
                dir : "dir"
            };
        },
        baseParams:null,
        paramNames:null,
        setOptions : function(o){
            o = $.quickExtend({}, o);
            delete o.callback;
            delete o.scope;
            this.options = o;
        },
        load : function(options){
            options || (options = {});
            if(this.fire("beforeload", this, options) !== false){
                this.setOptions(options);
                var p = $.extend(options.params || {}, this.baseParams);
                if(this.sortInfo && this.remoteSort){
                    p[this.paramNames.sort] = this.sortInfo.field;
                    p[this.paramNames.dir] = this.sortInfo.direction;
                }
                this.proxy.load(p, this.reader, this.loadRecords, this, options);
                return true;
            } else {
              return false;
            }
        },
        loadRecords:function(o, options, success)
        {
            if(!o || success === false){
                if(success !== false)
                    this.fireEvent("load", this, [], options);
                if(options.callback)
                    options.callback.call(options.scope || this, [], options, false);
                return;
            }
            var r = o.records, t = o.totalRecords || r.length;
            if(!options || options.add !== true){
                if(this.pruneModifiedRecords){
                    this.modified = [];
                }
                this.totalLength = t;
                this.data.clear();
                this._add(r)
                this.applySort();
                this.fire("datachanged", this);
//                if(this.snapshot){
//                    this.data = this.snapshot;
//                    delete this.snapshot;
//                }
//                this.data.clear();
//                this.data.addAll(r);
            }else{
                this.totalLength = Math.max(t, this.data.length+r.length);
                this.add(r);
            }
            this.fire("load", this, r, options);
            if(options.callback)
                options.callback.call(options.scope || this, r, options, true);
        },
        _add : function(records){
            
            var rs=$.likeArray(records)?records:arguments
            if(!rs.length)
                return -1;

            var index = this.data.length;
            for(var i = 0; i < rs.length; i++){
                var r=this.reader.recordType.parse(rs[i]);
                r.join(this);
                this.data.push(r)
            }
//            if(this.snapshot){
//                this.snapshot.addAll(records);
//            }
            return index;
        },
        add:function(records)
        {
            var i=this._add(records)
            if(i>-1)
                this.fire("add", this, records, i);
            return i
        }
    });







    ui.Element =new $.Class(
	{
        constructor:function(dom,context)
        {
            while(!$.isDom(dom))
            {
                if($.isFun(dom))
                    dom=dom(context)
                else if($.likeArray(dom))
                    dom=dom[0]
                else if($.isStr(dom))
                    $.isHtml(dom)?dom=dh.create(dom):
                                    dom=(context?$(context).find(dom):$(dom))[0]
                else 
                    break;
            }   
            this.dom=this[0]=dom;
            this.id=$.id(this.dom)
        }
	})

    $.collection.IList.applyTo(ui.Element,
    {
        length:1,
        dom:null,
        id:null,
        item: function (index) {
            return this.dom;
        },
        getItems: function()
        {
            return new Array(this.dom)
        },
        updateLength: fly.emptyFun
    });

    ui.Control=new $.Class(
	{
        base:lib.Component,
        constructor:function(config)
        {
            if(!this.config)
                this.config=this.defaultConfig()
            if(config)
		        $.quickExtend(this.config, config)
            arguments[0]=null;
            arguments.callee.base.apply(this,arguments)
        },
        defaultConfig:function()
        {
            return new this.constructor.Config(this)
        },
		isControl : true,
		rendered : false,
        getInner:function()
        {
            return this.inner||this.body
        },
        html:function(html)
        {
            var d=this.getInner()
            return d.html.apply(d,arguments)
        },
        text:function(text)
        {
            var d=this.getInner()
            return d.text.apply(d,arguments)
        },
		render : function(renderTo)
		{
		    if(!this.rendered )
		    {
			    if( this.fire('preRender')===false)
			        return this
                this.initClass()
			    if(!this.dom)
			        this.buildUI()
                this.container=new ui.Element(renderTo || this.config.renderTo || document.body);
                this.container.append(this.outer);
			    this.fire('render')
			}
            this.rendered = true
			return this
		},
        initClass:function()
        {
        },
		buildUI : function()
		{
			return this.createFrame()
		},
        createElement:function(type,fire)
        {
            if(fire)
                this.fire('preCreate'+type)
            var temp=this['format'+type]
            var el
            if(temp)
            {
                el=this[type.charAt(0)+type.substr(1)]=new ui.Element(temp.$format(this.config)) 
				if(fire)this.fire('create'+type)
			}
			return el
        },
        formatEl:'<div id="{id}" class="f-wrap f-{xtype}-wrap {css}" style="{style}" ></div>',
        createEl:function()
        {
            return this.createElement('El',true)
        },

		formatWrap : '',
		createWrap : function()
		{
            return this.createElement('Wrap',true)
		},
		formatBody:'',
		createBody: function()
		{
			return this.createElement('Body',true)
		},
        domFrame:["El","Wrap","Body"],
		createFrame: function()
		{
            this.fire('preCreateFrame')
            var last
            for(var i=0;i<this.domFrame.length;i++)
            {
                var el=this["create"+this.domFrame[i]]()
                if(el)
                {
                    if(!last)
                    {
                        this.outer=el
                        this.id = el.id        
                    }
                    else
                    {
                        last.append(el)
                    }
                    last=el
                }
            }
            this.inner=last
			this.fire('createFrame')
            if(this.config.text)
                this.text(this.config.text)
            else if(this.config.html)
                this.text(this.config.html)
			return this
		}
	})
    cMgr.regType('control', ui.Control)
    $.createConfig(ui.Control)
	
    ui.Panel=new $.Class(
    {
        base:ui.Control,
        inherit:new Array(ui.IContainer),
        constructor:function(config)
        {
		    arguments.callee.base.apply(this,arguments)
		    this.items =this.items ? $.toArray(this.items):new Array()
            this.delayRenders=new Array()
        },
        
	    onRender:function () 
	    {
	    	//return this.doLayout()
	    },
		append : function(controls)
		{
            var me=this
		    function f(control)
			{
                me.items.push(control)
				if(this.body)
				{
					if(control.isControl)
					{
						if( ! control.wrap)
							return control.render(this)
						control = control.wrap.el
					}
					this.body.append(control)
				}
				else
				    me.delayRenders.push(control)
			}
            var arr=arguments.length>1?arguments:($.likeArray(controls)?controls:null)
			arr?$.each.call(arguments, f):f(controls)
			return this
		},
		doLayout:function()
		{
			if(this.layout instanceof layout.Layout)
				this.layout.doLayout()
			else
				this.layout = layout.Layout.New(this, this.layout).render();
			return this
        }
    });
    cMgr.regType('panel', ui.Panel)
    $.createConfig(ui.Panel)
}