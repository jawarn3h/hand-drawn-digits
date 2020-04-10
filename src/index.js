// Create table.

function createGrid(w, h) {
	let grid = document.createElement('table');
	let gridBody = document.createElement('tbody');	

	for(let i = 0; i < h; i++) {
		let row = document.createElement('tr');
		for(let j = 0; j < w; j++) {
			let cell = document.createElement('td');
			row.appendChild(cell);
		}
		gridBody.appendChild(row);
	}
	grid.appendChild(gridBody);
	document.body.appendChild(grid);
}
