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
	module("Backgrounds.Grids", {
		teardown: testHelpers.removeAllGameObjects.ofClass('grid')
	});
	
	test("72px Grid", function() {
		var bg = new GridBackground();
		equals($('.grid').length, 1, "Should find the grid");
		var bg = $('.grid').css('background-image');
		ok(bg, "Should have the a URL for the background: " + bg);
	});
}

$(document).ready(function(){
	for (var suite in tests) tests[suite]();
	
	test("Clean Slate", function() {
		var left = $('.game-object');
		equals(left.length, 0, "Someone left some game objects.");
	})
});