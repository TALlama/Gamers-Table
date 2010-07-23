GamersTable.registerScenario('Castle Assault', function() {
	//set the scene
	new Background({
			bgUrl: 'castle.gametable/images/background.png',
			css: {'background-repeat': 'no-repeat'}
	}),
	new Grid();
	
	//add some guys
	new Person({
		bgUrl: 'images/icons/orc.png',
		css: {
			left: (Grid.size * 2) + 'px',
			top: (Grid.size * 3) + 'px'
		}
	});
	new Person({
		bgUrl: 'images/icons/orc.png',
		css: {
			left: (Grid.size * 7) + 'px',
			top: (Grid.size * 3) + 'px'
		}
	});
})