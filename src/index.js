let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');
let isWriting = false;

let updateCanvas = () => {
	canvas.height = window.innerHeight;
	canvas.width = window.innerWidth;
}

// Window Handlers.
window.onload = updateCanvas();
window.addEventListener('resize', (e) => {
	updateCanvas();
	pixels = [];
	createGrid();
});

const gridHeight = 28;
const gridWidth = 28;

let mouseX = 0;
let mouseY = 0;

let h_scaler = size => Math.floor(canvas.height * size/2);
let w_scaler = size => Math.floor(canvas.width * size/2);
let fragment = size => Math.floor((canvas.width * size)/gridWidth)

let pixels = [];

class Pixel {
	constructor(x, y, dim) {
		this.x = x;
		this.y = y;
		this.isOn = false;
		this.dim = dim;
		this.bounding = [x, x + dim, y, y + dim];
	}

	draw() {
		if(!this.isOn) { 
			ctx.fillStyle = '#d3d3d3';
			ctx.strokeStyle = '#000000'
		} else {
			ctx.fillStyle = '#838383';
            ctx.strokeStyle = '#000000'
		}
		ctx.beginPath();
		ctx.fillRect(this.x, this.y, this.dim, this.dim);
		ctx.lineWidth = 1;
		ctx.strokeRect(this.x, this.y, this.dim, this.dim);
	}
}

const pixelDim = fragment(0.3);
const anchorX = w_scaler(0.2);
const anchorY = h_scaler(0.3);
const gridBounding = [anchorX, anchorX + (pixelDim*gridWidth), anchorY, anchorY + (pixelDim*gridHeight)];

let createGrid = () => {
	for(let i = 0; i < gridHeight; i++) {
		let x = anchorX + (pixelDim * i);
		for(let j = 0; j < gridWidth; j++) {
			let y = anchorY + (pixelDim * j);
			let p = new Pixel(x, y, pixelDim);
			p.draw();
			pixels.push(p);
		}
	}
}

let inBounds = (x, y, target) => {
	return (x > target[0] && x < target[1]) &&
		   (y > target[2] && y < target[3]);
}

createGrid();

window.addEventListener('mousedown', e => {
	mouseX = e.clientX;
	mouseY = e.clientY;

	if(inBounds(mouseX, mouseY, gridBounding)) {
		isWriting = true;
	}
});


// GRID EVENT HANDLERS

window.addEventListener('mousemove', e => {
	mouseX = e.clientX;
	mouseY = e.clientY;

	if(!inBounds(mouseX, mouseY, gridBounding)) {
		isWriting = false;
	}
	else if(isWriting) {
		pixels.forEach(p => {
			if(!p.isOn) {
				if(inBounds(mouseX, mouseY, p.bounding)) {
					p.isOn = true;
					p.draw();
				}
			}
		});	
	}
});

window.addEventListener('mouseup', e => {
	mouseX = e.clientX;
	mouseY = e.clientY;
	
	isWriting = false;
	raw_matrix = parseGrid();
	// Predict with model.
	console.log(predict(raw_matrix));
});

// TensorFlow.js stuff.

// Load MNIST_Model...

async function loadNeuralNet() {
	const model = tf.loadModel('../models/tfjs_files/model.json');
}
// Parses our grid into a matrix so we can then convert to a tensor.
let parseGrid = () => {
	matrix = [];
	for (let i = 0; i < gridHeight; i++) {
		matrix_col = [];
		for (let j = 0; j < gridWidth; j++) {
			if(pixels[j + (gridHeight * i)].isOn) {
				matrix_col.push(1.);
			} else {
				matrix_col.push(0);
			}
		}
		matrix.push(matrix_col);
	}
	// Transpose the matrix...
	return matrix[0].map((col, i) => matrix.map(row => row[i]));
}

let predict = (r) => {
	tensor = tf.tensor2d(r, 'float32');
	return model.predict(tensor);
}; 
loadNeuralNet();

