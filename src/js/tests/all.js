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