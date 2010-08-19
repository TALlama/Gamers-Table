var testHelpers = {
	removeAllGameObjects: function() {
		testHelpers.removeAllGameObjects.ofClass('game-object')();
	}
}
testHelpers.removeAllGameObjects.ofClass = function(goClass) {
	return function() {
		$("#gameboard ." + goClass).each(function() {
			this.controller.remove({fadeTime: 0});
		});
	};
}

var tests = {};
tests.util = function() {
	module("Util");
	test("extendIf goes deep", 5, function() {
		var into = {a: 1, d: {x: 10}, e: {x: 10}};
		var from = {a: 2, b: 2, c: {x: 1, y: 2, z: 3}, e: {y: 20}};
		jQuery.extendIf(true, into, from);
		equals(into.a, 1, 'Should not override existing properties');
		equals(into.b, 2, 'Should set unset properties');
		same(into.c, {x: 1, y: 2, z: 3}, 'Should get whole object');
		same(into.d, {x: 10}, 'Should not override existing objects');
		same(into.e, {x: 10, y: 20}, 'Should update deep objects.');
	});
};
tests.gameObjects = function() {
	module("Game Objects", {
		teardown: testHelpers.removeAllGameObjects
	});
	
	test("Focus tracking", 4, function() {
		var obj = new GameObject();
		equals($('.game-object').length, 1, "Should have created an object");
		GameObject.focusOn(obj);
		equals($('.game-object.focused').length, 1, "Should be focused");
		GameObject.focusOn(null);
		equals($('.game-object.focused').length, 0, "Nothing should be focused");
		GameObject.focusChanged(function() {
			ok("Callback called.")
		});
		GameObject.focusOn(obj);
	})
}
tests.dice = function() {
	module("Dice", {
		teardown: testHelpers.removeAllGameObjects.ofClass('die')
	});
	
	function testDieCreation(sides) {
		test("Roll a d" + sides, 3, function() {
			var die = new Die(sides);
			var el = $('.d' + sides);
			var value = Number(el.text());
			
			equals(el.length, 1, "Found the die");
			ok(value > 0, "Value is too low");
			ok(value <= sides, "Value is too high");
		});
	}
	
	testDieCreation(4);
	testDieCreation(6);
	testDieCreation(8);
	testDieCreation(10);
	testDieCreation(12);
	testDieCreation(20);
	
	test("Rollbox with Dice", function() {
		var rollbox = Rollbox.show("1d4 2d6 3d8 4d10 5d12 6d20");
		equals($('.d4').length, 1, "Should find one d4");
		equals($('.d6').length, 2, "Should find two d6s");
		equals($('.d8').length, 3, "Should find three d8s");
		equals($('.d10').length, 4, "Should find four d10s");
		equals($('.d12').length, 5, "Should find five d12s");
		equals($('.d20').length, 6, "Should find six d20s");
		rollbox.remove({fadeTime: 0});
	});
	test("Rollbox with Negative Die", function() {
		var rollbox = Rollbox.show("-1d4");
		equals($('.d-4').length, 1, "Should find one d4");
		ok($('.d-4').hasClass('negative'), "Should be marked as negative");
		ok(Number($('.d-4').text()) > 0, "Token should display the absolute value");
		ok($('.d-4')[0].controller.number < 0, "Actual value should be negative");
		rollbox.remove({fadeTime: 0});
	});
	test("Rollbox with Tokens", function() {
		var rollbox = Rollbox.show("4");
		equals($('.number-token').length, 1, "Should find one token");
		equals($('.number-token').text(), 4, "Token should have the value given");
		rollbox.remove({fadeTime: 0});
	});
	test("Rollbox with Negative Tokens", function() {
		var rollbox = Rollbox.show("-4");
		equals($('.number-token').length, 1, "Should find one token");
		ok($('.number-token').hasClass('negative'), "Should be marked as negative");
		equals($('.number-token').text(), 4, "Token should display the absolute value");
		rollbox.remove({fadeTime: 0});
	});
	
	function testRollboxWithAddedToken(name, roll) {
		test(name, function() {
			var rollbox = Rollbox.show(roll);
			equals($('.d4').length, 1, "Should find one d4");
			equals($('.number-token:not(.die)').length, 1, "Should find one token");
			equals($('.number-token:not(.die)').text(), 4, "Token should display the absolute value");
			rollbox.remove({fadeTime: 0});
		});
	}
	function testRollboxWithSubtractedToken(name, roll) {
		test(name, function() {
			var rollbox = Rollbox.show(roll);
			equals($('.d4').length, 1, "Should find one d4");
			equals($('.number-token:not(.die)').length, 1, "Should find one token");
			equals($('.number-token:not(.die)').text(), 4, "Token should display the absolute value");
			equals($('.number-token:not(.die)')[0].controller.number, -4, 
				"Token should keep real value");
			rollbox.remove({fadeTime: 0});
		});
	}
	testRollboxWithAddedToken("Rollbox with Added Token (space before)", "1d4 +4");
	testRollboxWithAddedToken("Rollbox with Added Token (space after)", "1d4+ 4");
	testRollboxWithAddedToken("Rollbox with Added Token (space before and after)", "1d4 + 4");
	testRollboxWithSubtractedToken("Rollbox with Subtracted Token (space before)", "1d4 -4");
	testRollboxWithSubtractedToken("Rollbox with Subtracted Token (space after)", "1d4- 4");
	testRollboxWithSubtractedToken("Rollbox with Subtracted Token (space before and after)", "1d4 - 4");
	
	test("Rollbox bust", function() {
		var rollbox = Rollbox.show("3d4");
		equals($('.rollbox > .d4').length, 3, "Should find three d4s, all in the rollbox");
		equals($('.d4').length, 3, "Should find no d4s but those in the rollbox");
		rollbox.bust({fadeTime: 0});
		equals($('#gameboard > .d4').length, 3, "All the d4s should be in the gameboard proper now");
		rollbox.remove({fadeTime: 0});
	});
};
tests.notes = function() {
	module("Notes", {
		teardown: testHelpers.removeAllGameObjects.ofClass('note')
	});
	test("Empty note", function() {
		var note = new Note();
		equals($('.note').length, 1, "Should find the note");
		equals($('.note textarea').text(), '', "Should be empty");
	});
	test("Note with text", function() {
		var note = new Note({text: 'Note!'});
		equals($('.note').length, 1, "Should find the note");
		equals($('.note textarea').text(), 'Note!', "Should have the proper text");
	});
};
tests.backgrounds = function() {
	module("Backgrounds", {
		teardown: testHelpers.removeAllGameObjects.ofClass('background')
	});
	
	test("Crossing", function() {
		var bg = new Background({
			bgUrl: 'images/backgrounds/the_crossing.png',
			css: {'background-repeat': 'no-repeat'}
		});
		equals($('.background').length, 1, "Should find the background");
		var bg = $('.background').css('background-image');
		ok(bg.match(/url\(.*images\/backgrounds\/the_crossing.png\)/), 
			"Should have the proper URL for the image given: " + bg);
	})
}
tests.grids = function() {
	module("Grids", {
		teardown: testHelpers.removeAllGameObjects.ofClass('grid')
	});
	
	test("72px Grid", function() {
		var bg = new Grid();
		equals($('.grid').length, 1, "Should find the grid");
		var bg = $('.grid').css('background-image');
		ok(bg, "Should have the a URL for the background: " + bg);
	});
}
tests.globalKeyboardShortcuts = function() {
	var eventWith = function(eventType, opts) {
		return jQuery.extend(jQuery.Event(eventType), opts);
	};

	var fireKeyboardShortcut = function(code) {
		var handlers = KeyboardShortcuts.handlersFor(code);
		equals(handlers.length, 1, "Should find a handler for '" + code + "'");
		handlers[0](eventWith('keydown'));
	};
	
	module("Global Keyboard Shortcuts");
	test("+ shows the add menu", function() {
		fireKeyboardShortcut("shift-»");
		
		equals($('.menu.popped').length, 1, "Should have popped the menu");
		$('.menu.popped')[0].controller.unpop();
	});
	
	test("r rolls dice", function() {
		fireKeyboardShortcut("r");
		
		equals($('.prompt').length, 1, "Should have shown a prompt for dice array");
		
		//click the button to roll whatever the default is
		$('.prompt button.go').click();
		
		equals($('.rollbox').length, 1, "Should have shown a rollbox");
		$('.rollbox')[0].controller.remove({fadeTime:0});
	});
	test("r prompt is advancable by return", function() {
		fireKeyboardShortcut("r");

		$('.prompt input').trigger(eventWith('keydown', {which: 10}));
		equals($('.prompt').length, 0, "Should have dismissed prompt");
		
		equals($('.rollbox').length, 1, "Should have shown a rollbox");
		$('.rollbox')[0].controller.remove({fadeTime:0});
	});
	test("r prompt is dismissable by escape", function() {
		fireKeyboardShortcut("r");
		
		$('.prompt input').trigger(eventWith('keydown', {which: 27}));
		equals($('.prompt').length, 0, "Should have dismissed prompt");
	});
	test("space shows the search bar", function() {
		fireKeyboardShortcut(" ");
		
		var leeloo = new Person({name: 'Leeloo'});
		var orc = new Person({name: 'Orc'});
		
		equals($('.searchbox').length, 1, "Should have shown searchbox");
		equals($('.searchbox input').length, 1, "Should have an input in the searchbox");
		
		$('.searchbox input').attr('value', 'l').
			trigger(eventWith('keyup', {which: "l".charCodeAt(0)}));
		ok(leeloo.el.hasClass('matches-search'), "Leeloo matches 'l'");
		ok(orc.el.hasClass('does-not-match-search'), "Orc doesn't match 'l'");
		equals(leeloo, GameObject.focusedObject(), "Should have focused on Leeloo");
		
		//now dismiss
		$('.searchbox input').trigger(eventWith('keyup', {which: 10}));
		equals($('.searchbox').length, 0, "Should have dismissed search");
		equals(leeloo, GameObject.focusedObject(), "Focus should stay on Leeloo");
		
		leeloo.remove();
		orc.remove();
	});
	test("space can kill focus", function() {
		fireKeyboardShortcut(" ");
		
		var leeloo = new Person({name: 'Leeloo'});
		var orc = new Person({name: 'Orc'});
		
		equals($('.searchbox').length, 1, "Should have shown searchbox");
		equals($('.searchbox input').length, 1, "Should have an input in the searchbox");
		
		$('.searchbox input').attr('value', 'l').
			trigger(eventWith('keyup', {which: "l".charCodeAt(0)}));
		ok(leeloo.el.hasClass('matches-search'), "Leeloo matches 'l'");
		ok(orc.el.hasClass('does-not-match-search'), "Orc doesn't match 'l'");
		equals(leeloo, GameObject.focusedObject(), "Should have focused on Leeloo");
		
		$('.searchbox input').attr('value', 'lx').
			trigger(eventWith('keyup', {which: "x".charCodeAt(0)}));
		ok(leeloo.el.hasClass('does-not-match-search'), "Leeloo doesn't match 'lx'");
		ok(orc.el.hasClass('does-not-match-search'), "Orc doesn't match 'lx'");
		equals(GameObject.focusedObject(), null, "Should have removed focus");
		
		//now dismiss
		$('.searchbox input').trigger(eventWith('keyup', {which: 10}));
		equals($('.searchbox').length, 0, "Should have dismissed search");
		equals(GameObject.focusedObject(), null, "Should have kept lack of focus");
		
		leeloo.remove();
		orc.remove();
	});
};

$(document).ready(function(){
	for (var suite in tests) tests[suite]();
	
	module("Cleanup");
	test("Clean Slate", function() {
		var left = $('.game-object');
		equals(left.length, 0, "Someone left some game objects.");
	})
});