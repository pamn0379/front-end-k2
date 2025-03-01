var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var pos = { x: 0, y: 0 };
var clearBtn = document.querySelector('#clearAll');
var lineWidthSelect = document.getElementById('line-width');
var strokeColour = document.getElementById('stroke-colour');
var colorTable = document.querySelectorAll('.colour-table div');
var eraserBtn = document.getElementById('eraser');
var undoBtn = document.getElementById('undo');
var redoBtn = document.getElementById('redo');

var isErasing = false;

var undoStack = [];
var redoStack = [];

function resize() {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight - document.querySelector('.toolBox').offsetHeight;
}

function setPosition(event) {
    var rect = canvas.getBoundingClientRect();
    pos.x = event.clientX - rect.left;
    pos.y = event.clientY - rect.top;
}

resize();
window.addEventListener('resize', resize);

function saveState() {
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (undoStack.length > 20) {
        undoStack.shift();
    }
    redoStack = [];
}

document.addEventListener('mousedown', (event) => {
    if (event.target === canvas) {
        setPosition(event);
        saveState();
    }
});

document.addEventListener('mousemove', (event) => {
    if (event.buttons !== 1) return;

    ctx.beginPath();
    ctx.lineWidth = parseInt(lineWidthSelect.value);
    ctx.lineCap = 'round';

    if (isErasing) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = parseInt(lineWidthSelect.value) * 10;
        ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = strokeColour.value;
    }
    
    ctx.moveTo(pos.x, pos.y);
    setPosition(event);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
});

clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    undoStack = [];
    redoStack = [];
});

colorTable.forEach((colourDiv) => {
    colourDiv.addEventListener('click', () => {
        strokeColour.value = colourDiv.getAttribute('data-colour');
        ctx.strokeStyle = strokeColour.value;
    });
});

strokeColour.addEventListener('input', () => {
    ctx.strokeStyle = strokeColour.value;
});

eraserBtn.addEventListener('click', () => {
    isErasing = !isErasing;
    eraserBtn.textContent = isErasing ? 'Drawing' : 'Eraser';
    canvas.style.cursor = isErasing ? 'url(eraser-icon.png),auto' : 'crosshair';
});

undoBtn.addEventListener('click', () => {
    if (undoStack.length > 0) {
        redoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        var previousState = undoStack.pop();
        ctx.putImageData(previousState, 0, 0);
    }
});

redoBtn.addEventListener('click', () => {
    if (redoStack.length > 0) {
        undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        var nextState = redoStack.pop();
        ctx.putImageData(nextState, 0, 0);
    }
});
