var KeyboardShortcuts = {
	InvisibleCharCodes: {
		 8: "BACKSPACE",
		13: "RETURN",
		27: "ESC",
		37: "LEFT",
		38: "UP",
		39: "RIGHT",
		40: "DOWN",
		46: "DELETE",
		36: "HOME",
		35: "END",
		33: "PAGEUP",
		34: "PAGEDOWN"
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
	dispatch: function(event) {
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
	
		if (event.metaKey) code = "meta-" + code;
		if (event.shiftKey) code = "shift-" + code;
		if (event.altKey) code = "alt-" + code;
		if (event.ctrlKey) code = "control-" + code;
		
		var action = null;
		//find it in the imposed shortcuts
		for (var i = 0; i < KeyboardShortcuts.imposedShortcuts.length && !action; ++i) {
			var imposedShortcuts = KeyboardShortcuts.imposedShortcuts[i];
			if (typeof(imposedShortcuts) == "function") imposedShortcuts = imposedShortcuts();
			action = imposedShortcuts[code];
		}
		//find it in the globals
		action = action || KeyboardShortcuts.shortcuts[code];
		KeyboardShortcuts.log('Keyboard shortcut: ' + code + (action ? ('\n' + action) : ''));
		return (action) ? action(event) : true;
	}
};

$(window).keydown(KeyboardShortcuts.dispatch);
KeyboardShortcuts.enableLogging();