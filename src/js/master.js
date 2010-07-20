jQuery.extendIf = function(into, from) {
	if (!into) into = {}
	if (!from) from = {}
	
	for (option in from) {
		if (typeof(into[option]) == "undefined") into[option] = from[option]
	}
	return into
}

jQuery.fn.uniqueId = function(prefix, clobber) { 
	if (prefix == null) prefix = "id-";
	
	return this.each(function(){
		if ( !this.id || clobber )
			this.id = prefix + (++jQuery.fn.uniqueId.index);
	}); 
}; 
jQuery.fn.uniqueId.index = 0;

jQuery.fn.touchDraggable = function(opts) {
	this.bind('touchstart', function(event) {
		this.onmousedown = null;
		this.ontouchmove = moveDrag;
		this.ontouchend = function () {
			this.ontouchmove = null;
			this.ontouchend = null;
		}
		
		var pos = [this.offsetLeft,this.offsetTop];
		var origin = getCoors(event);
		
		return false; // cancels scrolling
		
		function moveDrag (e) {
			var currentPos = getCoors(e);
			var deltaX = currentPos[0] - origin[0];
			var deltaY = currentPos[1] - origin[1];
			this.style.left = (pos[0] + deltaX) + 'px';
			this.style.top  = (pos[1] + deltaY) + 'px';
		}
		
		function getCoors(e) {
			e = e.originalEvent ? e.originalEvent : e;
			var coors = [];
			if (e.touches && e.touches.length) { // iPhone
				var t = e.touches.item(0);
				coors[0] = t.clientX;
				coors[1] = t.clientY;
			} else { // all others
				coors[0] = e.clientX;
				coors[1] = e.clientY;
			}
			return coors;
		}
	});
};	
	
function isTouchDevice() {
	var el = document.createElement('div');
	el.setAttribute('ongesturestart', 'return;');
	return (typeof el.ongesturestart == "function");
}
function isTranstionSupported() {
	return (typeof(WebKitTransitionEvent) == 'function');
}
function isAnimationSupported() {
	return (typeof(WebKitAnimationEvent) == "function");
}
jQuery.fn.transitionEnd = function(callback) {
	if (isAnimationSupported()) {
		this.bind('webkitTransitionEnd', callback);
	} else callback();
}
jQuery.fn.animationEnd = function(callback) {
	if (isAnimationSupported()) {
		this.bind('webkitAnimationEnd', callback);
	} else callback();
}

function lgb(msg) {
	$('#gameboard').append("<p>" + msg + "</p>");
}

$(document).ready(function() {
	window.addItemMenuButton = new PopupMenuButton('+', [{
		name: 'Add a Die',
		submenu: [
			{name: 'd20', handler: function() {return new Die('20')}},
			{name: 'd10', handler: function() {return new Die('10')}},
			{name: 'd8', handler: function() {return new Die('8')}},
			{name: 'd6', handler: function() {return new Die('6')}},
			{name: 'd4', handler: function() {return new Die('4')}}
		]
	}, {
		name: 'Add a Note',
		handler: function() {return new Note()}
	}, {
		name: 'Add a Background',
		submenu: [{
			name: 'Grid',
			handler: function() {return new GridBackground()}
		}, {
			name: 'The Crossing',
			handler: function() {return new Background({
				bgUrl: 'images/backgrounds/the_crossing.png',
				css: {'background-repeat': 'no-repeat'}
			})}
		}]
	}, {
		name: 'Add a Minifig',
		submenu: [{
			name: 'Leeloo',
			handler: function() {return new Icon({bgUrl: 'images/icons/leeloo.png'})}
		}, {
			name: 'Orc',
			handler: function() {return new Icon({bgUrl: 'images/icons/orc.png'})}
		}]
	}]);
});

var PopupMenuButton = Base.extend({
	constructor: function(name, items) {
		var pmb = this;
		this.items = items;
		
		this.el = $('<aside class="menu-button"></aside>').appendTo($('body')[0]);
		this.el.text(name);
		this.el.click(function() {pmb.pop() });
	},
	pop: function() {
		new PopupMenu(this.items).pop();
	},
	focus: function() {
		var popup = new PopupMenu(this.items);
		popup.pop();
		popup.focus();
	}
});

var PopupMenu = Base.extend({
	constructor: function(items, opts) {
		var popupMenu = this;
		this.items = items;
		this.opts = opts || {};
	},
	addMenuItem: function(item) {
		var popupMenu = this;
		var itemEl = $('<li></li>').appendTo(this.el);
		item.handleAndClose = item.handler
		 	? function() {
				popupMenu.unpop();
				return item.handler();
			}
			: function() {
				var subMenu = new PopupMenu(item.submenu, item.submenuOptions);
				subMenu.pop();
				return subMenu;
			};
		itemEl[0].item = item;
		
		itemEl.text(item.name);
		itemEl.click(item.handleAndClose);
		
		return itemEl;
	},
	makeEl: function() {
		if (this.el) return;
		
		this.el = $('<ul class="menu global"></ul>').uniqueId();
		this.el.prependTo($('body')[0]);
		this.el[0].controller = this;

		for (var i = 0; i < this.items.length; ++i) {
			this.addMenuItem(this.items[i]);
		}
		this.addMenuItem({
			name:'Cancel', 
			handler: jQuery.noop
		}).css("fontSize", "70%").css("textAlign", "right");
	},
	pop: function() {
		this.makeEl();
		
		PopupMenu.hideAllExcept(this.el[0]);
		this.el.addClass('popped');
		KeyboardShortcuts.impose(this.shortcuts);
	},
	unpop: function() {
		if (!this.el) return;
		var popupMenu = this;
		var popupMenuEl = this.el;
		
		console.log('Unpop!');
		KeyboardShortcuts.unimpose(this.shortcuts);
		this.el.transitionEnd(function() {
			popupMenuEl.remove();
		});
		this.el.removeClass('popped');
		this.el.controller = null;
		this.el = null;
	},
	focus: function() {
		$('.menu.popped li:nth-child(1)').addClass('selected');
	},
	shortcuts: {
		'40': function(event) {
			event.preventDefault();
			event.stopPropagation();
		
			var selected = $('.menu.popped li.selected');
			var next = selected.length
				? selected.next()
				: $('.menu.popped li:nth-child(1)');
			selected.removeClass('selected');
			next.addClass('selected');
			return false;
		},
		'38': function(event) {
			event.preventDefault();
			event.stopPropagation();
		
			var selected = $('.menu.popped li.selected');
			var next = selected.length
				? selected.prev()
				: $('.menu.popped li:nth-last-child(1)');
			selected.removeClass('selected');
			next.addClass('selected');
			return false;
		},
		'13': function(event) {
			event.preventDefault();
			event.stopPropagation();
			
			var selected = $('.menu.popped li.selected');
			if (selected) {
				var focusable = selected[0].item.handleAndClose();
				if (focusable && focusable.focus) focusable.focus();
			}
			return false;
		},
		'27': function() {
			event.preventDefault();
			event.stopPropagation();
		
			var selected = $('.menu.popped');
			var controller = selected[0].controller;
			if (controller) controller.unpop();
			return false;
		}
	}
});
PopupMenu.hideAllExcept = function(leave) {
	$('.menu.popped').each(function() {
		if (this != leave) this.controller.unpop();
	});
};
PopupMenu.hideAll = function() {PopupMenu.hideAllExcept(null)};

var ContextualMenu = PopupMenu.extend({
	constructor: function(contextEl, items, opts) {
		this.contextEl = contextEl;
		this.base(items, opts);
		jQuery.extendIf(this.opts, {
			paddingFromContextEl: 10,
			disappearTimeout: 3
		})
		
		var cMenu = this;
		var closeTimer = null;
		this.contextEl.mouseover(function() {
			if (closeTimer) {
				clearTimeout(closeTimer);
				closeTimer = null;
			}
			
			cMenu.pop();
		});
		this.contextEl.mouseout(function() {
			if (closeTimer) return;
			
			closeTimer = setTimeout(function() {
				cMenu.unpop(); closeTimer = null
			}, 1000 * cMenu.opts.disappearTimeout);
		});
	},
	makeEl: function() {
		this.base();
		this.el.removeClass('global');
		this.el.addClass('contextual');
		
		var contextOffset = this.contextEl.offset()
		this.el.css('top', contextOffset.top);
		this.el.css('left', contextOffset.left + 
			this.contextEl.outerWidth() + 
			this.opts.paddingFromContextEl)
	},
});

var Random = {
	intBetween: function(min, max) {
		var range = max - min;
		var diffFromMin = Math.floor(Math.random() * range);
		return min + diffFromMin;
	},
	intBelow: function(max) {
		return this.intBetween(0, max);
	}
}

var GameBoard = Base.extend({
	constructor: function(el) {
		this.el = el;
	},
	height: function(){
		if (this.el.id != 'gameboard') return this.el.clientHeight;
		
		//gameboard fills the screen
		var D = document;
		return Math.max(
			Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
			Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
			Math.max(D.body.clientHeight, D.documentElement.clientHeight)
		);
	},
	size: function() {
		return {w: this.el.clientWidth, h: this.height()};
	},
	resize: function() {
		$(this.el).css('height', this.height() + 'px');
	}
});
$(document).ready(function() {
	GameBoard.global = new GameBoard(document.getElementById('gameboard'));
	GameBoard.global.resize();
});

var GameObject = Base.extend({
	constructor: function(opts) {
		var gameObject = this;
		
		this.opts = opts || {}
		jQuery.extendIf(this.opts, {
			board: GameBoard.global,
			css: {}
		});
		if (this.opts.bgUrl) {
			this.opts.css['background-image'] = "url('" + this.opts.bgUrl + "')";
		}
		
		this.el = $('<@TAG class="game-object"></@TAG>'.replace(/@TAG/g, this.tagName));
		this.el.addClass(this.cssClass);
		jQuery.each(this.opts.css, function(cssKey, cssValue) {
			gameObject.el.css(cssKey, cssValue);
		});
		this.willAppend();
		this.el.appendTo(this.opts.board.el);
		if (!this.opts.undraggable) {
			if (isTouchDevice()) {
				this.el.touchDraggable();
			} else {	
				this.el.draggable();
			}
		}
		this.didAppend();
		this.redraw();
	},
	tagName: 'div',
	willAppend: function(el) {},
	didAppend: function(el) {},
	redraw: function() {},
	remove: function() {
		var gameObject = this;
		gameObject.el.fadeOut(300, function() {
			gameObject.el.remove();
			gameObject.el = null;
			gameObject.didRemove();
		})
	},
	didRemove: function() {}
})

var Die = GameObject.extend({
	constructor: function(sides, opts) {
		this.sides = Number(sides);
		this.base(opts);
	},
	cssClass: 'die',
	willAppend: function() {
		this.el.css('width', 30);
		this.el.css('height', 30);
		this.el.addClass('d' + this.sides);
	},
	didAppend: function() {
		var die = this;
		
		die.el.animationEnd(function() {
			die.el.removeClass('falling');
		});	
		
		var boardSize = die.opts.board.size();
		die.el.css('left', Random.intBetween(20, boardSize.w));
		die.el.css('top', Random.intBetween(20, boardSize.h));
		
		die.el.attr('title', 'd' + this.sides);
		
		die.nextResult();
		die.place();
		
		// set up the actions
		die.el.click(function() {die.roll()});
		
		new ContextualMenu(die.el, [{
			name: 'Roll',
			handler: function() {die.roll();}
		}, {
			name: 'Trash',
			handler: function() {die.remove()}
		}], {contextEl: die.el});
	},
	redraw: function() {
		this.el.text(this.lastRoll);
	},
	nextResult: function() {
		this.lastRoll = Random.intBelow(this.sides) + 1;
	},
	place: function() {
		this.el.css('webkitTransform', "rotate(" + Random.intBetween(-60, 60) + "deg)");
		this.el.addClass('falling');
	},
	roll: function() {
		this.nextResult();
		this.place();
		this.redraw();
	}
});

var Note = GameObject.extend({
	constructor: function(opts) {
		this.opts = opts || {};
		this.base(opts);
	},
	cssClass: 'note',
	willAppend: function() {
		this.textarea = $('<textarea/>').appendTo(this.el);
		this.textarea[0].rows = 4;
		this.textarea[0].columns = 40;
		
		var boardSize = this.opts.board.size();
		this.el.css('left', boardSize.w * 3 / 4);
		this.el.css('top', '1em');
	},
	focus: function() {
		console.log('Focusing');
		this.textarea[0].focus();
	}
});

var Background = GameObject.extend({
	constructor: function(opts) {
		this.opts = opts || {};
		this.opts.undraggable = true;
		this.base(opts);
	},
	cssClass: 'background',
	willAppend: function() {
		this.el.css('left', 0);
		this.el.css('top', 0);
		this.el.css('width', '100%');
		this.el.css('height', '100%');
		this.el.css('z-index', this.opts.css["z-index"] || -10000);
		
		if (this.opts.bgUrl) {
			this.el.css('background-image', "url('" + this.opts.bgUrl + "')");
		}
	},
});

var GridBackground = Background.extend({
	constructor: function(opts) {
		opts = opts || {};
		opts.bgUrl = 'images/backgrounds/grid.png';
		opts.css = opts.css || {};
		opts.css["z-index"] = -9999;
		
		this.base(opts);
	}
});
GridBackground.gridSize = 72;

var Icon = GameObject.extend({
	constructor: function(opts) {
		this.opts = opts || {};
		this.base(opts);
		
		var icon = this;
		new ContextualMenu(icon.el, [{
			name: 'Trash',
			handler: function() {icon.remove()}
		}]);
	},
	cssClass: 'icon',
	willAppend: function() {
		this.el.css('width', this.opts.width || GridBackground.gridSize);
		this.el.css('height', this.opts.height || GridBackground.gridSize);
	},
});

var GamersTable = {
	registerScenario: function(name, setupFunction) {
		$(document).ready(function() {
			var scenariosMenuItem = window.addItemMenuButton.items.filter(function(i) {
				return i.name == 'Scenarios';
			});
			if (scenariosMenuItem.length) {
				scenariosMenuItem = scenariosMenuItem[0];
			} else {
				scenariosMenuItem = {
					name: 'Scenarios',
					submenu: []
				};
				window.addItemMenuButton.items.push(scenariosMenuItem);
			}
			scenariosMenuItem.submenu.push({
				name: name,
				handler: setupFunction
			})
		});
	},
	addPlugin: function(url) {
		$(document).ready(function() {
			var scriptTag = document.createElement('script');
			scriptTag.src = url;
			var bodyTag = document.getElementsByTagName('body')[0];
			bodyTag.appendChild( scriptTag );
		});
	},
	addPluginsFromQuery: function(search) {
		search = search || location.search;
		var plugins = search.split(/\bplugin=([^&]*)/).filter(function(p) { 
			return p[0] != "?" && p[0] != "&";
		});
		jQuery.each(plugins, function() {
			GamersTable.addPlugin(this + "/setup.js");
		});
	}
}

$(document).ready(function() {
	GamersTable.addPluginsFromQuery();
})

KeyboardShortcuts.register('shift-»', function(event) {
	window.addItemMenuButton.pop();
	window.addItemMenuButton.focus();
});
