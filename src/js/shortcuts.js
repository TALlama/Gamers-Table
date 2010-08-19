var KeyboardShortcuts = {
	InvisibleCharCodes: {
		 8: "BACKSPACE",
		13: "RETURN",
		27: "ESC",
		33: "PAGEUP",
		34: "PAGEDOWN",
		35: "END",
		36: "HOME",
		37: "LEFT",
		38: "UP",
		39: "RIGHT",
		40: "DOWN",
		46: "DELETE"
	},
	friendlyNames: {
		 8: "backspace",
		13: "return",
		27: "escape",
		33: "pageup",
		34: "pagedown",
		35: "end",
		36: "home",
		37: "left",
		38: "up",
		39: "right",
		40: "down",
		46: "delete"
	},
	isVisible: function(charCode) {
		if (charCode in KeyboardShortcuts.InvisibleCharCodes) return false;
	
		return charCode > 31 //most characters
		|| charCode == 9 //tab
		|| charCode == 10 //newline
		|| charCode == 13; //carriage return
	},
	shortcuts: {},
	imposedShortcuts: [],
	register: function(shortcut, record) {
		this.shortcuts[shortcut] = record;
	},
	impose: function(shortcuts) {
		KeyboardShortcuts.imposedShortcuts.unshift(shortcuts);
	},
	unimpose: function(shortcuts) {
		KeyboardShortcuts.imposedShortcuts = KeyboardShortcuts.imposedShortcuts.filter(function(imposed) {
			return imposed != shortcuts;
		});
	},
	log: function() {},
	enableLogging: function() {
		KeyboardShortcuts.log = function() {console.log(arguments[0])};
	},
	codeFor: function(event) {
		var targetNodeName = event.target.nodeName;
		if (targetNodeName == 'INPUT') return;
		if (targetNodeName == 'SELECT') return;
		if (targetNodeName == 'OPTION') return;
		if (targetNodeName == 'TEXTAREA') return;
		if (targetNodeName == 'A') return;
	
		var code = event.charCode;
		if (!code) code = event.keyCode;
		code = KeyboardShortcuts.isVisible(code)
			? String.fromCharCode(code).toLowerCase()
			: code;
		
		if (KeyboardShortcuts.friendlyNames[code]) {
			code = KeyboardShortcuts.friendlyNames[code];
		}
	
		if (event.metaKey) code = "meta-" + code;
		if (event.shiftKey) code = "shift-" + code;
		if (event.altKey) code = "alt-" + code;
		if (event.ctrlKey) code = "control-" + code;
		
		return code;
	},
	handlersFor: function(code) {
		if (typeof(code) !== "string") code = KeyboardShortcuts.codeFor(code);
		
		var handlers = [];
		handlers.code = code;
		
		//find it in the imposed shortcuts
		for (var i = 0; i < KeyboardShortcuts.imposedShortcuts.length; ++i) {
			var imposedShortcuts = KeyboardShortcuts.imposedShortcuts[i];
			if (typeof(imposedShortcuts) == "function") imposedShortcuts = imposedShortcuts();
			var imposedHandler = imposedShortcuts[code];
			if (imposedHandler) handlers.push(imposedHandler);
		}
		//find it in the globals
		var globalHandler = KeyboardShortcuts.shortcuts[code];
		if (globalHandler) handlers.push(globalHandler);
		return handlers;
	},
	dispatch: function(event) {
		var handlers = KeyboardShortcuts.handlersFor(event);
		var retval = true;
		
		KeyboardShortcuts.log('Keyboard shortcut: ' + 
			handlers.code + '\nFound ' + handlers.length + ' keyboard shortcuts');
		for (var i = 0; i < handlers.length && retval; ++i) {
			var handler = handlers[i];
			KeyboardShortcuts.log('Shortcut #' + i + ':\n' + handler);
			var handlerRetval = handler(event);
			if (handlerRetval === false) retval = false;
		}
		
		return retval;
	}
};

$(window).keydown(KeyboardShortcuts.dispatch);
KeyboardShortcuts.enableLogging();