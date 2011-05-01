
; (function($) {
	if (!$) 
		return arguments.callee
	; ($.plugins || ($.plugins = {})).flyTree = function(config, h)
	{
	    var me=this
	    this.nodes=[]
		this.nodeHash = {}
		this.nodeMap={};
		config = $.extend(
		{
			root : {},
			folderEvent : 'click',
			expandSpeed : 500,
			collapseSpeed : 500,
			expandEasing : null,
			collapseEasing : null,
			multiFolder : true,
			loadMessage : 'Loading...',
			container : "#tree",
			isJson : true,
			showCheckBox:false,
			showLine:false,
			buildNode : function(node,nodes,parent)
			{
                if(config.handleNode)config.handleNode.call(node,node,nodes,parent)
			    me.nodeHash[node.id]=node;
			    node.parent=parent
			    var id='n'+Math.random();
			    me.nodeMap[id]=node;
                if(parent.nodes.indexOf(node)<0)
			        parent.nodes.push(node);
			    if(!node.nodes)
			        node.nodes=[];
			    var lineCss=""
				if(config.showLine && parent.showLine!=false)
					lineCss=" show-line "+(node.leaf ?"f-line-file":"f-line-dir")+(node == nodes[nodes.length - 1]?"-end":"");
					
			    var hasChk=config.showCheckBox&&node.showCheckBox!=false;
				return '<li id={7} class="{0} {1} {2} {3}">{4}<a id={8} href={9} rel="{7}" leaf={5} >{6}</a>{10}</li>'.$format(
				    node.leaf ? "file" : "directory", 
				    node.expanded != true ? "collapsed" : "", 
				    (hasChk?"hasCheckBox ":" ")+(node.css||""),
				    lineCss,
				    hasChk?"<input id='check-"+node.id+"' "+(node.checked?"checked ":"")+" type=checkbox />":"",
				    node.leaf?1:0,
				    node.text,
				    node.id,
				    id,
                    node.href,
                    node.nodes.length? config.buildNodes(node.nodes,node):""
				    )
			},
			buildNodes : function(nodes,parent)
			{
                if(config.handleNodes)config.handleNodes.call(nodes,nodes,parent)
				var html = '';
				for(var i = 0; i < nodes.length; i ++ )
				    html += config.buildNode(nodes[i],nodes,parent);
				return '<ul class="flyTree " style="display: none;">'+html + "</ul>";
			},
			getParams:function(node)
			{
			    return {id:node.id}
			},
			decode : function(data)
			{
			    if(fly.isString(data))
				    return eval('(' + data + ')');
			    else return data
			}
		}, config);
		
		
		var container = $(config.container);
		container.each(function()
		{
			function showTree(parent,c,_data)
			{
			    function apply(data)
				{
					$(c).find('.start').html('');
                    var html=data,nodes
                    if(config.isJson)
                    {
                        nodes=config.decode(data);
                        html=config.buildNodes(nodes,parent);
                    }
					$(c).removeClass('wait').append(html);
					if(parent == me)
					    c.find('UL:hidden').show();
					else
					{
					    $(c).find('UL:hidden').sildeDown(
					        {
						        duration : config.expandSpeed,
						        easing : config.expandEasing
					        });
				    }
					
					bindTree(c);
//                    if(nodes)
//                        nodes.each(function(n)
//                        {
//                            if(n.leaf!=true && n.nodes && n.nodes.length)
//                                showTree(n,$("#"+n.id),n.nodes)
//                        })
				}
				
				$(c).addClass('wait');
				$(".flyTree.start").remove();
				parent.loaded=true
				if(_data)
				    apply(_data)
				else if(config.url!=null)
				    $.post(config.url, config.getParams(parent),apply );
				
			}
			
			
			function bindTree(t)
			{
				$(t).find('LI A').bind(config.folderEvent, function()
				{
					var _this = $(this);
					var node=me.nodeMap[this.id]
					var isEnd=node==node.parent.nodes[node.parent.nodes.length-1]
					if(_this.parent().hasClass('directory'))
					{
						if(_this.parent().hasClass('collapsed'))
						{
							// Expand
							if( ! config.multiFolder)
							{
								_this.parent().parent().find('UL').slideUp(
								{
									duration : config.collapseSpeed,
									easing : config.collapseEasing
								});
								_this.parent().parent().find('LI.directory').removeClass("f-end-expanded expanded").addClass('collapsed');
							}
							if(node.loaded || config.url==null)
							    _this.parent().find('UL').sildeDown()
							else
							{
							    _this.parent().find('UL').remove();
							    // cleanup
							    showTree(me.nodeMap[this.id], _this.parent());
							}
							
							_this.parent().removeClass('f-end-collapsed collapsed').addClass(isEnd?"f-end-expanded expanded": 'expanded');
						}
						else
						{
							// Collapse
							_this.parent().find('UL').slideUp(
							{
								duration : config.collapseSpeed,
								easing : config.collapseEasing
							});
							_this.parent().removeClass('f-end-expanded expanded').addClass(isEnd?"f-end-collapsed collapsed":'collapsed');
						}
                        return false
					}
					else
					{
						h(_this.attr('rel'));
					}
				});
				// Prevent A from triggering the # on non-click events
				if(config.folderEvent.toLowerCase() != 'click')
				    $(t).find('LI A').bind('click', function()
				    {
    //				    if(this.getAttribute("leaf")=="1" && this.previousSibling && this.previousSibling.nodeName=="INPUT" && this.previousSibling.type=="checkbox")
    //				        this.previousSibling.checked=!this.previousSibling.checked
    debugger
					    var node=me.nodeMap[this.id]
					    if(!node.leaf)					    
					        return false;
				    });
			}
			// Loading message
			container.html('<ul class="flyTree start"><li class="wait">' + config.loadMessage + '<li></ul>');
			// Get the initial file list
			showTree(me,container,config.data);
		});
	}
	
	
	$.fn.extend( 
	{
		flyTree : function(config, h)
		{
			config.container = this;
			this.tree = new $.plugins.flyTree(config, h);
			return this;
		}
	});
	
	return arguments.callee
}(window.jQuery))(window.fly);