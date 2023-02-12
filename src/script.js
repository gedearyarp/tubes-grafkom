/*
AUTHOR:
Christine Hutabarat		  13520005
William Manuel K		    13520020
I Gede Arya Raditya P.	13520036
*/

// global variables
let canvas = document.getElementById("my_Canvas");
let gl = canvas.getContext("webgl");
let program;
let id = 1;

let shapeData = [];

let vertexNum;
let vertexId;
let isDragging = false;

// document elements
const shape = document.getElementById("shape");
const buttonShape = document.getElementById("create-shape");
const shapePick = document.getElementById("shape-pick");
const colorPick = document.getElementById("color-pick");
const createShapeButton = document.getElementById("create-shape");
const numSideInput = document.getElementById("input-sides");
const polygonSides = document.getElementById("num-sides");
const buttonClearCanvas = document.getElementById("clear-canvas");
const colorInput = document.getElementById("color-input");
const saveData = document.getElementById("save-data");
const loadData = document.getElementById("load-data");

// constants
const POLYGON = "polygon";
const SQUARE = "square";
const RECTANGLE = "rectangle";
const LINE = "line";

const MAX_DIST = 999;

// event listeners
saveData.addEventListener("click", function () {
  let data = JSON.stringify(shapeData);
  let blob = new Blob([data], { type: "text/plain" });
  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.download = "data.json";
  a.href = url;
  a.click();
});

loadData.addEventListener("change", function () {
  let file = loadData.files[0];
  let reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function () {
    let data = JSON.parse(reader.result);
    shapeData = data;

    id = shapeData.length + 1;
    drawAllShapes();
  }
});

shape.addEventListener("change", function () {
  if (shape.value == POLYGON) {
    numSideInput.style.display = "block";
  } else {
    numSideInput.style.display = "none";
  }
});

buttonShape.addEventListener("click", createShape);

buttonClearCanvas.addEventListener("click", clearCanvas);

canvas.addEventListener("mousedown", function (event) {
  getPoints(event);
  if (
    action.value == "add-vertex" &&
    shapeData[vertexId] &&
    shapeData[vertexId].type == POLYGON
  ) {
    getNearestVertices(event);
  }
});

canvas.addEventListener("mousemove", function (event) {
  if (action.value == "move") {
    moveShape(event);
  } else if (action.value == "select") {
    movePoint(event);
  } else if (
    action.value == "add-vertex" &&
    shapeData[vertexId] &&
    shapeData[vertexId].type == POLYGON
  ) {
    addVertex(event);
  }
});

canvas.addEventListener("mouseup", function () {
  isDragging = false;
  if (action.value == "add-vertex" && shapeData[vertexId].type == POLYGON) {
    let i = 0;
    let shape = shapeData[vertexId];
    while (i < shape.vertices.length) {
      if (shape.vertices[i] == -2) {
        shape.vertices.splice(i, 2);
        shape.colors.splice((i / 2) * 3, 3);
      } else i += 2;
    }
  }
});

action.addEventListener("change", function () {
  numSideInput.style.display = "none";

  if (action.value == "shape-creation") {
    shapePick.style.display = "block";
    colorPick.style.display = "none";
    createShapeButton.style.display = "block";
    if (shape.value == POLYGON) numSideInput.style.display = "block";
  } else if (action.value == "select") {
    shapePick.style.display = "none";
    colorPick.style.display = "none";
    createShapeButton.style.display = "none";
  } else if (action.value == "move") {
    shapePick.style.display = "none";
    colorPick.style.display = "none";
    createShapeButton.style.display = "none";
  } else if (action.value == "color-vertex" || action.value == "color-shape") {
    shapePick.style.display = "none";
    colorPick.style.display = "block";
    createShapeButton.style.display = "none";
  } else if (action.value == "delete-vertex") {
    shapePick.style.display = "none";
    colorPick.style.display = "none";
    createShapeButton.style.display = "none";
  } else if (action.value == "add-vertex") {
    shapePick.style.display = "none";
    colorPick.style.display = "none";
    createShapeButton.style.display = "none";
  }
});

// functions

function createShape() {
  if (shape.value == SQUARE) {
    createSquare();
  } else if (shape.value == RECTANGLE) {
    createRectangle();
  } else if (shape.value == LINE) {
    createLine();
  } else if (shape.value == POLYGON) {
    createPolygon();
  }
}

function createSquare() {
  const vertices = [-0.5, 0.5, 0.0, 0.5, -0.5, 0.0, 0.0, 0.0];
  const colors = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  const shapeDatum = new Shape(vertices, SQUARE, id, colors);
  shapeData.push(shapeDatum);

  id++;

  drawAllShapes();
}

function createRectangle() {
  const vertices = [-0.5, 0.5, 0.3, 0.5, -0.5, 0.0, 0.3, 0.0];
  const colors = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  const shapeDatum = new Shape(vertices, RECTANGLE, id, colors);
  shapeData.push(shapeDatum);

  id++;

  drawAllShapes();
}

function createLine() {
  const vertices = [-0.9, 0.9, 0.0, 0.9];
  const colors = [0, 0, 0, 0, 0, 0];

  const shapeDatum = new Shape(vertices, LINE, id, colors);
  shapeData.push(shapeDatum);

  id++;

  drawAllShapes();
}

function createPolygon() {
  const sides = polygonSides.value;
  let vertices = [];
  let colors = [];
  let angle = (2 * Math.PI) / sides;
  for (let i = 0; i < sides; i++) {
    vertices.push(Math.cos(angle * i) / 2);
    vertices.push(Math.sin(angle * i) / 2);
  }

  for (let i = 0; i < sides; i++) {
    colors.push(0);
    colors.push(0);
    colors.push(0);
  }

  let shapeDatum = new Shape(vertices, POLYGON, id, colors);
  shapeData.push(shapeDatum);

  id++;

  drawAllShapes();
}

function getPoints(event) {
  let canvasOffset = canvas.getBoundingClientRect();

  let x =
    (event.clientX - canvasOffset.left - canvas.width / 2) / (canvas.width / 2);
  let y =
    (1 - (event.clientY - canvasOffset.top - canvas.height / 2)) /
    (canvas.height / 2);

  let dist = MAX_DIST;
  for (let i = 0; i < shapeData.length; i++) {
    for (let j = 0; j < shapeData[i].vertices.length; j += 2) {
      let xOffset = Math.abs(x - shapeData[i].vertices[j]);
      let yOffset = Math.abs(y - shapeData[i].vertices[j + 1]);
      let offset = xOffset + yOffset;
      if (offset < dist) {
        dist = offset;
        vertexId = i;
        vertexNum = j;
      }
    }
  }

  if (
    action.value == "delete-vertex" &&
    shapeData[vertexId].type == POLYGON &&
    shapeData[vertexId].vertices.length > 6
  ) {
    shapeData[vertexId].vertices.splice(vertexNum, 2);
    shapeData[vertexId].colors.splice((vertexNum / 2) * 3, 3);
    drawAllShapes();
    isDragging = false;
  } else if (action.value == "color-vertex") {
    const vertexOrd = vertexNum / 2;

    const r = colorInput.value.slice(1, 3);
    const g = colorInput.value.slice(3, 5);
    const b = colorInput.value.slice(5, 7);

    shapeData[vertexId].colors[vertexOrd * 3] = parseInt(r, 16) / 255;
    shapeData[vertexId].colors[vertexOrd * 3 + 1] = parseInt(g, 16) / 255;
    shapeData[vertexId].colors[vertexOrd * 3 + 2] = parseInt(b, 16) / 255;

    drawAllShapes();
    isDragging = false;
  } else if (action.value == "color-shape") {
    const r = colorInput.value.slice(1, 3);
    const g = colorInput.value.slice(3, 5);
    const b = colorInput.value.slice(5, 7);

    for (let i = 0; i < shapeData[vertexId].colors.length; i += 3) {
      shapeData[vertexId].colors[i] = parseInt(r, 16) / 255;
      shapeData[vertexId].colors[i + 1] = parseInt(g, 16) / 255;
      shapeData[vertexId].colors[i + 2] = parseInt(b, 16) / 255;
    }

    drawAllShapes();
    isDragging = false;
  } else {
    isDragging = true;
  }
}

function movePoint(event) {
  if (isDragging) {
    if (shapeData[vertexId].type === LINE) {
      moveLinePoint(event);
    } else if (shapeData[vertexId].type === SQUARE) {
      moveSquarePoint(event);
    } else if (shapeData[vertexId].type === RECTANGLE) {
      moveRectanglePoint(event);
    } else if (shapeData[vertexId].type === POLYGON) {
      moveLinePoint(event);
    }
  }
}

function moveShape(event) {
  if (!isDragging) {
    return;
  }

  let canvasOffset = canvas.getBoundingClientRect();

  let x =
    (event.clientX - canvasOffset.left - canvas.width / 2) / (canvas.width / 2);

  let y =
    (1 - (event.clientY - canvasOffset.top - canvas.height / 2)) /
    (canvas.height / 2);

  let xOffset = x - shapeData[vertexId].vertices[vertexNum];
  let yOffset = y - shapeData[vertexId].vertices[vertexNum + 1];

  for (let i = 0; i < shapeData[vertexId].vertices.length; i += 2) {
    shapeData[vertexId].vertices[i] += xOffset;
    shapeData[vertexId].vertices[i + 1] += yOffset;
  }

  drawAllShapes();
}

function moveLinePoint(event) {
  if (isDragging && action.value != "delete-vertex") {
    let canvasOffset = canvas.getBoundingClientRect();

    let x =
      (event.clientX - canvasOffset.left - canvas.width / 2) /
      (canvas.width / 2);
    let y =
      (1 - (event.clientY - canvasOffset.top - canvas.height / 2)) /
      (canvas.height / 2);

    shapeData[vertexId].vertices[vertexNum] = x;
    shapeData[vertexId].vertices[vertexNum + 1] = y;

    drawAllShapes();
  }
}

function moveRectanglePoint(event) {
  let canvasOffset = canvas.getBoundingClientRect();

  let x =
    (event.clientX - canvasOffset.left - canvas.width / 2) / (canvas.width / 2);
  let y =
    (1 - (event.clientY - canvasOffset.top - canvas.height / 2)) /
    (canvas.height / 2);

  shapeData[vertexId].vertices[vertexNum] = x;
  shapeData[vertexId].vertices[vertexNum + 1] = y;

  if (vertexNum == 0) {
    shapeData[vertexId].vertices[4] = x;
    shapeData[vertexId].vertices[3] = y;
  } else if (vertexNum == 2) {
    shapeData[vertexId].vertices[6] = x;
    shapeData[vertexId].vertices[1] = y;
  } else if (vertexNum == 4) {
    shapeData[vertexId].vertices[0] = x;
    shapeData[vertexId].vertices[7] = y;
  } else if (vertexNum == 6) {
    shapeData[vertexId].vertices[2] = x;
    shapeData[vertexId].vertices[5] = y;
  }

  drawAllShapes();
}

function moveSquarePoint(event){
  let canvasOffset = canvas.getBoundingClientRect();

  var x =
    (event.clientX - canvasOffset.left - canvas.width / 2) / (canvas.width / 2);
  var y =
    (1 - (event.clientY - canvasOffset.top - canvas.height / 2)) /
    (canvas.height / 2);

  var minX = 1
  var maxX = -1
  for (var i = 0; i<shapeData[vertexId].vertices.length; i+=2){
    if(shapeData[vertexId].vertices[i] > maxX){
      maxX = shapeData[vertexId].vertices[i]
    } 
    
    if (shapeData[vertexId].vertices[i] < minX){
      minX = shapeData[vertexId].vertices[i]
    }
  }

  var minY = 1
  var maxY = -1
  for (var j = 1; j<shapeData[vertexId].vertices.length; j+=2){
    if(shapeData[vertexId].vertices[j] > maxY){
      maxY = shapeData[vertexId].vertices[j]
    } 
    
    if (shapeData[vertexId].vertices[j] < minY){
      minY = shapeData[vertexId].vertices[j]
    }
  }

  //squareCenterX = (shapeData[vertexId].vertices[0] + shapeData[vertexId].vertices[2])/2
  //squareCenterY = (shapeData[vertexId].vertices[5] + shapeData[vertexId].vertices[1])/2

  squareCenterX = (minX + maxX)/2
  squareCenterY = (maxY + minY)/2

  xScale = Math.abs((x-squareCenterX)/(shapeData[vertexId].vertices[vertexNum]-squareCenterX))
  yScale = Math.abs((y-squareCenterY)/(shapeData[vertexId].vertices[vertexNum+1]-squareCenterY))
  if(xScale > yScale){
    y = xScale * (shapeData[vertexId].vertices[vertexNum+1]-squareCenterY) + squareCenterY
  } else if (yScale > xScale) {
    x = yScale * (shapeData[vertexId].vertices[vertexNum]-squareCenterX) + squareCenterX
  }

  var squareWidth;
  var squareHeight;
  
  if (vertexNum == 0 && x<shapeData[vertexId].vertices[2] && y>shapeData[vertexId].vertices[5]) {
    squareWidth = shapeData[vertexId].vertices[2]-x
    squareHeight = y-shapeData[vertexId].vertices[5]
    if(squareWidth == squareHeight){
      shapeData[vertexId].vertices[vertexNum] = x;
      shapeData[vertexId].vertices[vertexNum + 1] = y;
      shapeData[vertexId].vertices[4] = x;
      shapeData[vertexId].vertices[3] = y;
    }
  } else if (vertexNum == 2 && x>shapeData[vertexId].vertices[0] && y>shapeData[vertexId].vertices[5]) {
    squareWidth = x-shapeData[vertexId].vertices[0]
    squareHeight = y-shapeData[vertexId].vertices[5]
    if(squareWidth == squareHeight){
      shapeData[vertexId].vertices[vertexNum] = x;
      shapeData[vertexId].vertices[vertexNum + 1] = y;
      shapeData[vertexId].vertices[6] = x;
      shapeData[vertexId].vertices[1] = y;
    }
  } else if (vertexNum == 4 && x<shapeData[vertexId].vertices[2] && y<shapeData[vertexId].vertices[1]) {
    squareWidth = shapeData[vertexId].vertices[2]-x
    squareHeight = shapeData[vertexId].vertices[1]-y
    if(squareWidth == squareHeight){
      shapeData[vertexId].vertices[vertexNum] = x;
      shapeData[vertexId].vertices[vertexNum + 1] = y;
      shapeData[vertexId].vertices[0] = x;
      shapeData[vertexId].vertices[7] = y;
    }
  } else if (vertexNum == 6 && x>shapeData[vertexId].vertices[0] && y<shapeData[vertexId].vertices[1]) {
    squareWidth = x-shapeData[vertexId].vertices[0]
    squareHeight = shapeData[vertexId].vertices[1]-y
    if(squareWidth == squareHeight){
      shapeData[vertexId].vertices[vertexNum] = x;
      shapeData[vertexId].vertices[vertexNum + 1] = y;
      shapeData[vertexId].vertices[2] = x;
      shapeData[vertexId].vertices[5] = y;
    }
  }

  drawAllShapes();
}

function drawAllShapes() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  let i = 0;
  let j = 0;
  while (i < shapeData.length) {
    let detailVertices = new Float32Array([]);
    const totalVertices = shapeData[i].vertices.length / 2;

    for (let k = 0; k < totalVertices; k++) {
      detailVertices = new Float32Array([
        ...detailVertices,
        shapeData[i].vertices[k * 2],
      ]);
      detailVertices = new Float32Array([
        ...detailVertices,
        shapeData[i].vertices[k * 2 + 1],
      ]);
      detailVertices = new Float32Array([
        ...detailVertices,
        shapeData[i].colors[k * 3],
      ]);
      detailVertices = new Float32Array([
        ...detailVertices,
        shapeData[i].colors[k * 3 + 1],
      ]);
      detailVertices = new Float32Array([
        ...detailVertices,
        shapeData[i].colors[k * 3 + 2],
      ]);
    }

    let bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(detailVertices),
      gl.STATIC_DRAW
    );

    let vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(
      vPosition,
      2,
      gl.FLOAT,
      false,
      5 * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    gl.enableVertexAttribArray(vPosition);

    let vColor = gl.getAttribLocation(program, "color");
    gl.vertexAttribPointer(
      vColor,
      3,
      gl.FLOAT,
      false,
      5 * Float32Array.BYTES_PER_ELEMENT,
      2 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(vColor);

    if (shapeData[i].type === SQUARE || shapeData[i].type === RECTANGLE) {
      gl.drawArrays(gl.POINTS, 0, totalVertices);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, totalVertices);
      j += 4;
    } else if (shapeData[i].type === LINE) {
      gl.drawArrays(gl.POINTS, 0, totalVertices);
      gl.drawArrays(gl.LINE_STRIP, 0, totalVertices);
      j += 2;
    } else if (shapeData[i].type === POLYGON) {
      gl.drawArrays(gl.POINTS, 0, totalVertices);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, totalVertices);
      j += totalVertices;
    }

    i++;
  }
}

function clearCanvas() {
  shapeData = [];
  id = 1;

  drawAllShapes();
}

function addVertex(event) {
  if (isDragging) {
    let canvasOffset = canvas.getBoundingClientRect();
    let x =
      (event.clientX - canvasOffset.left - canvas.width / 2) /
      (canvas.width / 2);
    let y =
      (1 - (event.clientY - canvasOffset.top - canvas.height / 2)) /
      (canvas.height / 2);

    let shape = shapeData[vertexId];
    shape.vertices[vertexNum] = x;
    shape.vertices[vertexNum + 1] = y;

    drawAllShapes();
  }
}

function getNearestVertices(event) {
  let canvasOffset = canvas.getBoundingClientRect();
  let x =
    (event.clientX - canvasOffset.left - canvas.width / 2) / (canvas.width / 2);
  let y =
    (1 - (event.clientY - canvasOffset.top - canvas.height / 2)) /
    (canvas.height / 2);
  let shape = shapeData[vertexId];

  let nearest1 = 0;
  let nearest2 = 0;
  let minDistance = 1000;
  for (let i = 0; i < shape.vertices.length; i += 2) {
    let distance = Math.sqrt(
      Math.pow(x - shape.vertices[i], 2) +
        Math.pow(y - shape.vertices[i + 1], 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearest1 = i;
    }
  }
  minDistance = 1000;
  for (let i = 0; i < shape.vertices.length; i += 2) {
    if (i != nearest1) {
      let distance = Math.sqrt(
        Math.pow(x - shape.vertices[i], 2) +
          Math.pow(y - shape.vertices[i + 1], 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest2 = i;
      }
    }
  }

  let colorNearest1 = (nearest1 / 2) * 3;
  let colorNearest2 = (nearest2 / 2) * 3;

  if (
    (nearest1 == 0 && nearest2 == shape.vertices.length - 2) ||
    (nearest1 == shape.vertices.length - 2 && nearest2 == 0)
  ) {
    shape.vertices.splice(shape.vertices.length, 0, -2, -2);
    shape.colors.splice(shape.colors.length, 0, 0, 0, 0);
    vertexNum = shape.vertices.length - 2;
  } else {
    shape.vertices.splice(Math.min(nearest1, nearest2) + 2, 0, -2, -2);
    shape.colors.splice(Math.min(colorNearest1, colorNearest2) + 3, 0, 0, 0, 0);
    vertexNum = Math.min(nearest1, nearest2) + 2;
  }
}

function main() {
  if (!gl) alert("WebGL isn't available");

  let vertCode = `
    attribute vec4 vPosition;
    attribute vec3 color;
    varying vec3 vColor;
    void main() {
      gl_Position = vPosition;
      gl_PointSize = 10.0;
      vColor = color;
    }
  `;

  let vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, vertCode);
  gl.compileShader(vertShader);

  let fragCode = `
    precision mediump float;
    varying vec3 vColor;
    void main() {
      gl_FragColor = vec4(vColor, 1.0);
    }
  `;

  let fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, fragCode);
  gl.compileShader(fragShader);

  program = gl.createProgram();
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(1, 1, 1, 1);

  gl.clear(gl.COLOR_BUFFER_BIT);
}

main();
