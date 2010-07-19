GamersTable.registerScenario('Castle Assault', function() {
	//set the scene
	new Background({
			bgUrl: 'castle.gametable/images/background.png',
			css: {'background-repeat': 'no-repeat'}
	}),
	new GridBackground();
	
	//add some guys
	new Icon({
		bgUrl: 'images/icons/orc.png',
		css: {
			left: (GridBackground.gridSize * 2) + 'px',
			top: (GridBackground.gridSize * 3) + 'px'
		}
	});
	new Icon({
		bgUrl: 'images/icons/orc.png',
		css: {
			left: (GridBackground.gridSize * 7) + 'px',
			top: (GridBackground.gridSize * 3) + 'px'
		}
	});
})