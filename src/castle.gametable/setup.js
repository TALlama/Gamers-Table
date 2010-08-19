GamersTable.registerScenario('Castle Assault', function() {
	//set the scene
	new Background({
			bgUrl: 'castle.gametable/images/background.png',
			css: {'background-repeat': 'no-repeat'}
	}),
	new Grid();
	
	//add some guys
	new Person({
		name: 'Gruk (orc)',
		bgUrl: 'images/icons/orc.png',
		css: {
			left: (Grid.size * 2) + 'px',
			top: (Grid.size * 3) + 'px'
		}
	});
	new Person({
		name: 'Kurg (orc)',
		bgUrl: 'images/icons/orc.png',
		css: {
			left: (Grid.size * 7) + 'px',
			top: (Grid.size * 3) + 'px'
		}
	});
})