jQuery.extendIf = function(isDeep, into, from) {
	if (arguments.length == 2) {
		from = into;	
		into = isDeep;
		isDeep = false;
	}
	
	if (!into) into = {};
	if (!from) from = {};
	
	for (option in from) {
		if (isDeep && typeof(from[option]) == "object") {
			into[option] = jQuery.extendIf(true, into[option], from[option]);
		}
		
		if (typeof(into[option]) == "undefined") {
			into[option] = from[option];
		}
	}
	return into;
}

jQuery.fn.uniqueId = function(prefix, clobber) { 
	if (prefix == null) prefix = "id-";
	
	return this.each(function(){
		if (!this.id || clobber)
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

function debug(msg) {
	$('#gameboard').append("<p class='log'>" + msg + "</p>");
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
			handler: function() {
				var size = prompt("How big of a grid do you want?", 72);
				return new Grid({size: size});
			}
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
			handler: function() {return new Person({
				name: 'Leeloo', 
				bgUrl: 'images/icons/leeloo.png'})}
		}, {
			name: 'Orc',
			handler: function() {return new Person({
				name: 'this orc', 
				bgUrl: 'images/icons/orc.png'})}
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
		jQuery.extendIf(this.opts, {
			addEllipses: true
		});
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
				var subMenu = popupMenu.makeSubMenu(
					item.submenu, 
					jQuery.extendIf(item.submenuOptions, popupMenu.opts));
				subMenu.pop();
				return subMenu;
			};
		itemEl[0].item = item;
		
		itemEl.text(item.name);
		if (!item.handler && popupMenu.opts.addEllipses) itemEl.text(itemEl.text() + "…");
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
	makeSubMenu: function(items, opts) {
		return new PopupMenu(items, opts);
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
		'down': function(event) {
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
		'up': function(event) {
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
		'return': function(event) {
			event.preventDefault();
			event.stopPropagation();
			
			var selected = $('.menu.popped li.selected');
			if (selected) {
				var focusable = selected[0].item.handleAndClose();
				if (focusable && focusable.focus) focusable.focus();
			}
			return false;
		},
		'escape': function() {
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
			appearTimeout: 1.5,
			disappearTimeout: 3,
		})
		
		var cMenu = this;
		var openTimer = null;
		var closeTimer = null;
		var isOverMenu = false;
		if (this.opts.appearTimeout >= 0) this.contextEl.mouseover(function() {
			if (openTimer) {
				clearTimeout(openTimer);
			}
			if (closeTimer) {
				clearTimeout(closeTimer);
				closeTimer = null;
			}
			
			openTimer = setTimeout(function() {
				cMenu.pop(); openTimer = null;
				cMenu.el.mouseover(function() {isOverMenu = true});
				cMenu.el.mouseout(function() {isOverMenu = false});
			}, 1000 * cMenu.opts.appearTimeout);
		});
		this.contextEl.mouseout(function() {
			if (openTimer) {
				clearTimeout(openTimer);
				openTimer = null;
			}
			if (closeTimer) return;
			if (isOverMenu) return;
			
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
	makeSubMenu: function(items, opts) {
		var optsCopy = jQuery.extend(true, {}, opts || {});
		return new ContextualMenu(this.contextEl, items, 
			jQuery.extend(true, optsCopy, {
				appearTimeout: -1
			}));
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
	},
	fromArray: function(array) {
		return array[Random.intBelow(array.length)];
	}
}

var Dispatcher = Base.extend({
	bind: function(eventName, arg) {
		var bindArgs = arguments;
		
		this.listeners = this.listeners || {};
		this.listeners[eventName] = this.listeners[eventName] || [];
	
		if (typeof(arg) == "function") {
			//user registering for notification
			this.listeners[eventName].push(arg);
		} else {
			//something was added
			jQuery.each(this.listeners[eventName], function() {
				this.apply({}, Array.prototype.splice.call(bindArgs, 1))
			});
			return this;
		}
	}
});

var GameBoard = Dispatcher.extend({
	constructor: function(el) {
		var gameboard = this;
		this.el = $(el);
		
		if (this.el[0].id == 'gameboard') new Capturebox(gameboard);
	},
	height: function(){
		if (this.el[0].id != 'gameboard') return this.el.height();
		
		//gameboard fills the screen
		var D = document;
		return Math.max(
			Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
			Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
			Math.max(D.body.clientHeight, D.documentElement.clientHeight)
		);
	},
	size: function() {
		return {w: this.el.width(), h: this.height()};
	},
	offset: function() {
		return this.el.offset();
	},
	resize: function() {
		this.el.css('height', this.height() + 'px');
	},
	didAdd: function(arg) {
		this.bind('didAdd', arg);
	}
});
$(document).ready(function() {
	GameBoard.global = new GameBoard(document.getElementById('gameboard'));
	GameBoard.global.resize();
});

var Rollbox = GameBoard.extend({
	constructor: function(opts) {
		var rollbox = this;
		this.opts = opts = opts || {};
		jQuery.extendIf(this.opts, {
			title: '',
			dice: [],
			tokens: []
		})
		
		if (!opts.el) opts.el = $('<div/>').appendTo(document.body);
		this.base(opts.el);
		
		//add the rollbox accountrements
		rollbox.el.addClass('rollbox');
		rollbox.toolbar = $('<div class="toolbar" />').
			appendTo(this.el);
		rollbox.title = $('<div class="title"></div>').
			text(opts.title).
			appendTo(rollbox.toolbar);
		$('<button>X</button>').appendTo(rollbox.toolbar).click(function() {
			rollbox.remove();
		}).attr('title', 'Close the rollbox');	
		$('<button>↺</button>').appendTo(rollbox.toolbar).click(function() {
			rollbox.bust();
		}).attr('title', 'Bust these dice out of the box and onto the game board');
		rollbox.el.draggable({
			handle: rollbox.toolbar
		})
		rollbox.total = $('<div class="total">0</div>').appendTo(this.el);
		
		//now add the dice and the tokens
		jQuery.each(opts.dice, function() {
			new Die(this, {board: rollbox}).roll(function() {
				rollbox.updateTotal();
			});
		});
		jQuery.each(opts.tokens, function(i) {
			new NumberToken(this, {board: rollbox, css: {left: 32 * i}});
		});
		rollbox.updateTotal();
	},
	remove: function(opts) {
		var rollbox = this;
		opts = jQuery.extendIf(opts, {
			fadeTime: 300
		});
		
		function cleanup() {
			rollbox.el.remove();
		}
		
		if (opts.fadeTime > 0) this.el.fadeOut(opts.fadeTime, cleanup);
		else cleanup();
	},
	updateTotal: function() {
		var total = 0;
		$('.rollbox .number-token').each(function() {
			total += Number(this.controller.number);
		});
		this.total.text(total);
	},
	bust: function(opts) {
		var rollbox = this;
		rollbox.el.find('.game-object').each(function() {
			var obj = $(this);
			var offset = obj.offset();
			obj.appendTo('#gameboard').offset(offset);
			obj.draggable("option", "containment", 'document');
		});
		rollbox.remove(opts);
	}
});
Rollbox.show = function(roll) {
	roll = roll.replace(/\+\s/g, ' +');
	roll = roll.replace(/\-\s/g, ' -');
	
	var dice = [];
	var tokens = [];
	var pattern = /(-)?(\d+)?d(\d+)/;
	jQuery.each(roll.split(/\s+/), function() {
		var match = this.match(pattern);
		if (match) {
			var isNeg = !!match[1]
			var num = match[2] || 1;
			var sides = match[3];
			if (isNeg) sides = sides * -1;
			
			for (var i = 0; i < num; ++i) dice.push(sides);
		} else if (this.match(/-?\d+/)) {
			tokens.push(Number(this));
		} else if (this.match(/^\s*$/)) {
			//ignore empty space
		} else {
			alert('Unknown die: ' + this);
			return;
		}
	});
	return new Rollbox({title: roll, dice: dice, tokens: tokens});
}

var Capturebox = Dispatcher.extend({
	constructor: function(gameboard) {
		$(document).bind("mousedown", {gb: gameboard, cb: this}, this.startCapture);
	},
	startCapture: function(event) {
		var gameboard = event.data.gb;
		
		if (!event.shiftKey) return;
		event.preventDefault();
		
		var boundingBox = $('<div class="select-box"></div>').appendTo(gameboard.el);
		boundingBox.offset({top: event.pageY, left: event.pageX});
		boundingBox.width(0);
		boundingBox.height(0);
		
		var data = {
			gb: gameboard, cb: event.data.cb,
			bb: boundingBox, bbx: event.pageX, bby: event.pageY
		};
		$(document).bind("mouseup", data, event.data.cb.endCapture);
		$(document).bind("mousemove", data, event.data.cb.moveCapture);
	},
	endCapture: function(event) {
		var gameboard = event.data.gb;
		var boundingBox = event.data.bb;
		
		$(document).unbind("mouseup", event.data.cb.endCapture);
		$(document).unbind("mousemove", event.data.cb.moveCapture);
		
		$('.number-token.focused').removeClass("focused");
		
		var captured = [];
		var bbDim = boundingBox.offset();
		bbDim.width = boundingBox.width();
		bbDim.height = boundingBox.height();
		bbDim.right = bbDim.left + bbDim.width;
		bbDim.bottom = bbDim.top + bbDim.height;
		//debug("{(" + bbDim.left + ", " + bbDim.top + "), (" + bbDim.right + ", " + bbDim.bottom + ")}");
		gameboard.el.find(".number-token").each(function() {
			var nt = $(this);
			var ntOffset = nt.offset();
			
			if (ntOffset.top >= bbDim.top
			&& ntOffset.top <= bbDim.bottom
			&& ntOffset.left >= bbDim.left
			&& ntOffset.left <= bbDim.right) {
				//debug("{(" + ntOffset.left + ", " + ntOffset.top + "), (" + ntOffset.right + ", " + ntOffset.bottom + ")}");
				captured.push(nt);
				nt.addClass("focused");
			}
		});
		
		boundingBox.fadeOut(500);
		KeyboardShortcuts.impose(Capturebox.dieGroupKeyboardShortcuts);
		GameObject.focusChanged(function() {
			KeyboardShortcuts.unimpose(Capturebox.dieGroupKeyboardShortcuts);
		})
	},
	moveCapture: function(event) {
		var gameboard = event.data.gb;
		var boundingBox = event.data.bb;
	
		boundingBox.offset({
			top: Math.min(event.data.bby, event.pageY), 
			left: Math.min(event.data.bbx, event.pageX)
		});
		boundingBox.width(Math.abs(event.pageX - event.data.bbx));
		boundingBox.height(Math.abs(event.pageY - event.data.bby));
	}
});
Capturebox.dieGroupKeyboardShortcuts = function() {
	var focusedDice = $('.die.focused');
	return focusedDice ? {
		'return': function() {
			focusedDice.each(function() {this.controller.roll()})
		}
	} : {};
};

var GameObject = Dispatcher.extend({
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
		this.el[0].controller = this;
		this.willAppend();
		this.el.appendTo(this.opts.board.el);
		if (!this.opts.undraggable) {
			if (isTouchDevice()) {
				this.el.touchDraggable();
			} else {	
				this.el.draggable({
					handle: gameObject.dragHandle(),
					containment: this.opts.board.el[0]
				});
			}
		}
		this.didAppend();
		this.opts.board.didAdd(this);
		this.redraw();
	},
	tagName: 'div',
	name: function() {return this.opts.name || 'this'},
	dragHandle: function() {return null},
	willAppend: function(el) {},
	didAppend: function(el) {},
	redraw: function() {},
	remove: function(opts) {
		var gameObject = this;
		opts = opts || {};
		
		function cleanup() {
			if (gameObject.isRemoved) return;
			gameObject.isRemoved = true;
			
			gameObject.el.remove();
			gameObject.el = null;
			gameObject.didRemove();
		}
		
		if (opts.fadeTime > 0) {
			gameObject.el.fadeOut(opts.fadeTime || 300, cleanup)
		} else {
			cleanup();
		}
	},
	didRemove: function() {},
	trash: function() {
		if (confirm("Trash " + this.name() + "?")) {
			this.remove();
		}
	},
	moveBy: function(dx, dy) {
		var offset = this.el.offset();
		this.moveTo(offset.top + Number(dx), offset.left + Number(dy));
	},
	moveTo: function(x, y) {
		x = Number(x); y = Number(y);
		if (x < 0) x = 0;
		if (y < 0) y = 0;
		
		//debug("moveTo(" + x + "," + y + ")");
		this.el.css("top", x + "px");
		this.el.css("left", y + "px");
		$.scrollTo({top: x, left: y});
	},
	keyboardShortcuts: function() {return {}},
	showContextMenu: function() {
		if (this.contextMenu) {
			this.contextMenu.pop();
			return this.contextMenu;
		} else {
			return {pop: function() {}, focus: function() {}};
		}
	}
});
jQuery.extend(GameObject, {
	focusOn: function(obj) {
		GameObject.focused = (obj && obj.controller) ? obj.controller : obj;

		$('.game-object.focused').removeClass('focused');
		if (GameObject.focused && GameObject.focused.el) {
			GameObject.focused.el.addClass('focused');
			GameObject.focusChanged();
		}
	},
	focusedObject: function(obj) {
		return GameObject.focused;
	},
	focusChanged: function() {
		this.dispatcher = this.dispatcher || new Dispatcher();
		this.dispatcher.bind("focusChanged", arguments[0], arguments[1]);
	}
});

var NumberToken = GameObject.extend({
	constructor: function(number, opts) {
		this.number = Number(number);
		this.base(opts);
	},
	didAppend: function() {
		var token = this;
		if (this.number < 0) {
			token.el.text(-this.number);
			token.el.addClass('negative');
		} else {
			token.el.text(this.number);
		}
		token.el.addClass('number-token');
		this.base();
	},
	isNegative: function() {
		return this.number < 0;
	}
});

var Die = NumberToken.extend({
	constructor: function(sides, opts) {
		this.sides = Number(sides);
		this.base(0, opts);
	},
	cssClass: 'die',
	name: function() {return 'this die'},
	willAppend: function() {
		this.el.css('width', 30);
		this.el.css('height', 30);
		this.el.addClass('d' + this.sides);
	},
	didAppend: function() {
		var die = this;
		this.base();
		
		die.el.animationEnd(function() {
			die.el.removeClass('falling-a');
			die.el.removeClass('falling-b');
			die.el.removeClass('falling-c');
		});	
		
		var boardSize = die.opts.board.size();
		die.el.css('left', Random.intBetween(10, boardSize.w - 10));
		die.el.css('top', Random.intBetween(10, boardSize.h - 10));
		
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
			handler: function() {die.trash()}
		}], {contextEl: die.el});
	},
	redraw: function() {
		this.el.removeClass('negative');
		if (this.isNegative()) this.el.addClass('negative');
		
		this.el.text(Math.abs(this.number));
	},
	nextResult: function() {
		this.number = Random.intBelow(this.sides);
		this.number += this.sides > 0 ? 1 : 0;
	},
	place: function() {
		this.el.css('webkitTransform', "rotate(" + Random.intBetween(-60, 60) + "deg)");
		
		var animation = Random.fromArray(['a', 'b', 'c']);
		this.el.addClass('falling-' + animation);
	},
	roll: function() {
		if (arguments.length == 0) {
			this.nextResult();
			this.place();
			this.redraw();
			this.bind('roll');
		} else {
			this.bind('roll', arguments[0])
		}
	}
});

var Note = GameObject.extend({
	constructor: function(opts) {
		this.opts = opts || {};
		this.base(opts);
		jQuery.extendIf(this.opts, {
			text: ''
		});
	},
	cssClass: 'note',
	dragHandle: function() {return this.toolbar},
	name: function() {return 'this note'},
	willAppend: function() {
		var note = this;
		
		this.toolbar = $('<div class="toolbar"/>').appendTo(this.el);
		this.closer = $('<button class="close">X</button>').appendTo(this.toolbar);
		this.closer.click(function() {note.remove()});
		
		this.textarea = $('<textarea/>').appendTo(this.el);
		this.textarea[0].rows = 4;
		this.textarea[0].columns = 40;
		this.textarea.text(this.opts.text);
		
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
	name: function() {return 'this background'},
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

var Grid = GameObject.extend({
	constructor: function(opts) {
		this.opts = opts = opts || {};
		jQuery.extendIf(true, this.opts, {
			size: Grid.size,
			css: {
				'z-index': -9999,
				opacity: .5
			}
		});
		
		//REQ: IE8 and less don't support background-size
		this.hgrid = new Background(jQuery.extendIf(true, {
			bgUrl: 'images/backgrounds/hbar.png',
			css: {
				'background-size': '100% ' + this.opts.size + 'px'
			}
		}, this.opts));
		this.vgrid = new Background(jQuery.extendIf(true, {
			bgUrl: 'images/backgrounds/vbar.png',
			css: {
				'background-size': this.opts.size + 'px 100%'
			}
		}, this.opts));
		Grid.size = this.opts.size;
		
		this.base(opts);
	},
	willAppend: function() {
		this.el.addClass('grid');
		
		this.base();
	},
	didRemove: function() {
		this.hgrid.remove();
		this.vgrid.remove();
		this.base();
	}
});
Grid.size = 72;

var Icon = GameObject.extend({
	constructor: function(opts) {
		this.base(jQuery.extendIf(opts, {
			width: Grid.size,
			height: Grid.size
		}));
		
		var icon = this;
		this.contextMenu = new ContextualMenu(icon.el, [{
			name: 'Trash',
			handler: function() {icon.trash()}
		}]);
	},
	cssClass: 'icon',
	willAppend: function() {
		this.el.css('width', this.opts.width + "px");
		this.el.css('height', this.opts.height + "px");
		this.base();
	},
});

var Person = Icon.extend({
	constructor: function(opts) {
		this.base(opts);
		
		var icon = this;
		this.contextMenu.items.unshift({
			name: 'Roll',
			submenu: [{
				name: 'd20',
				handler: function() {new Rollbox({dice: [20]})}
			},{
				name: 'd6',
				handler: function() {new Rollbox({dice: [6]})}
			}]
		});
	},
	cssClass: 'person',
	willAppend: function() {
		var person = this;
		function focusOrPopMenu() {
			if (GameObject.focusedObject() == person)
				person.showContextMenu();
			else
				GameObject.focusOn(person);
		}
		this.el.click(focusOrPopMenu).bind('touchend', focusOrPopMenu);
		this.base();
	},
	didAppend: function() {
		GameObject.focusOn(this);
	},
	keyboardShortcuts: function() {
		var person = this;
		
		return {
			'down': function() {
				person.moveBy(Grid.size, 0);
				return false;
			},
			'up': function() {
				person.moveBy(-Grid.size, 0);
				return false;
			},
			'right': function() {
				person.moveBy(0, Grid.size);
				return false;
			},
			'left': function() {
				person.moveBy(0, -Grid.size);
				return false;
			},
			'delete': function() {person.trash(); return false},
			'backspace': function() {person.trash(); return false},
			'escape': function() {GameObject.focusOn(null); return false},
			'return': function() {person.showContextMenu(); return false}
		}
	}
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
	addStylesheet: function(url) {
		$(document).ready(function() {
			var linkTag = document.createElement('link');
			linkTag.rel = "stylesheet";
			linkTag.type = "text/css";
			linkTag.href = url;
			var bodyTag = document.getElementsByTagName('head')[0];
			bodyTag.appendChild(linkTag);
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
			var plugin = jQuery.trim(decodeURIComponent(this));
			if (plugin) GamersTable.addPlugin(plugin + "/setup.js");
		});
	}
}

if (jQuery.query.get('test') == "on"
|| decodeURIComponent(document.location.search).match(/module:/)) {
	document.write('<link rel="stylesheet" href="js/lib/jquery/qunit.css" type="text/css" media="screen" />');
	document.write('<script src="js/lib/jquery/qunit.js"> </s' + 'cript>');
	
	$(document).ready(function() {
		var testResults = $('<div id="unit-test-results"></div>').prependTo($('body'));
		testResults.append($('<h1 id="qunit-header">QUnit Tests</h1>'));  
		testResults.append($('<h2 id="qunit-banner"></h2>'));
		testResults.append($('<h2 id="qunit-userAgent"></h2>'));
		testResults.append($('<ol id="qunit-tests"></ol>'));
	});
	
	GamersTable.addPlugin('js/tests/all.js');
}

$(document).ready(function() {
	GamersTable.addPluginsFromQuery();
});

KeyboardShortcuts.register('shift-»', function(event) {
	window.addItemMenuButton.pop();
	window.addItemMenuButton.focus();
});
KeyboardShortcuts.register('r', function(event) {
	var roll = prompt('Roll what?', 'd20');
	Rollbox.show(roll);
});
KeyboardShortcuts.impose(function() {
	var fo = GameObject.focusedObject();
	return fo ? fo.keyboardShortcuts() : {};
});
