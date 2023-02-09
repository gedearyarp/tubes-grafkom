/*
AUTHOR:
Christine Hutabarat		  13520005
William Manuel K		    13520020
I Gede Arya Raditya P.	13520036
*/

// global variables
var canvas = document.getElementById("my_Canvas");
var gl = canvas.getContext("webgl");
var currentAction = "shape-creation";
var program;
var id = 1;

var shapeData = [];
var allVertices = [];
var allColors = [];

var vertexNum;
var vertexId;
var isDragging = false;

// document elements
const shape = document.getElementById("shape");
const buttonShape = document.getElementById("create-shape");
const shapePick = document.getElementById("shape-pick");
const colorPick = document.getElementById("color-pick");
const createShapeButton = document.getElementById("create-shape");
const numSideInput = document.getElementById("input-sides");
const polygonSides = document.getElementById("num-sides");
const buttonClearCanvas = document.getElementById("clear-canvas");

// event listeners
shape.addEventListener("change", function () {
  if (shape.value == "polygon") {
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
    shapeData[vertexId].type == "polygon"
  ) {
    getNearestVertices(event);
  }
});

canvas.addEventListener("mousemove", function (event) {
  if (currentAction == "move") {
    moveShape(event);
  } else if (currentAction == "select") {
    movePoint(event);
  } else if (
    currentAction == "add-vertex" &&
    shapeData[vertexId] &&
    shapeData[vertexId].type == "polygon"
  ) {
    addVertex(event);
  }
});

canvas.addEventListener("mouseup", function () {
  isDragging = false;
  if (currentAction == "add-vertex" && shapeData[vertexId].type == "polygon") {
    var i = 0;
    var shape = shapeData[vertexId];
    while (i < shape.vertices.length) {
      if (shape.vertices[i] == -2) {
        shape.vertices.splice(i, 2);
      } else {
        i += 2;
      }
    }
  }
});

action.addEventListener("change", function () {
  numSideInput.style.display = "none";

  if (action.value == "shape-creation") {
    shapePick.style.display = "block";
    colorPick.style.display = "none";
    createShapeButton.style.display = "block";
    if (shape.value == "polygon") {
      numSideInput.style.display = "block";
    }
    currentAction = "shape-creation";
  } else if (action.value == "select") {
    shapePick.style.display = "none";
    colorPick.style.display = "none";
    createShapeButton.style.display = "none";
    currentAction = "select";
  } else if (action.value == "move") {
    shapePick.style.display = "none";
    colorPick.style.display = "none";
    createShapeButton.style.display = "none";
    currentAction = "move";
  } else if (action.value == "color-vertex") {
    shapePick.style.display = "none";
    colorPick.style.display = "block";
    createShapeButton.style.display = "none";
    currentAction = "color-vertex";
  } else if (action.value == "delete-vertex") {
    shapePick.style.display = "none";
    colorPick.style.display = "none";
    createShapeButton.style.display = "none";
    currentAction = "delete-vertex";
  } else if (action.value == "add-vertex") {
    shapePick.style.display = "none";
    colorPick.style.display = "none";
    createShapeButton.style.display = "none";
    currentAction = "add-vertex";
  }
});

// functions
function createShape() {
  console.log(shape.value);
  if (shape.value == "square") {
    createSquare();
  } else if (shape.value == "rectangle") {
    createRectangle();
  } else if (shape.value == "line") {
    createLine();
  } else if (shape.value == "polygon") {
    createPolygon();
  }
}

function createSquare() {
  console.log("hello");

  var vertices = [-0.5, 0.5, 0.0, 0.5, -0.5, 0.0, 0.0, 0.0];
  var colors = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  for (var i = 0; i < vertices.length; i++) {
    allVertices.push(vertices[i]);
  }

  for (var i = 0; i < 4; i++) {
    allColors.push(0);
    allColors.push(0);
    allColors.push(0);
  }

  var shapeDatum = new Shape(vertices, "square", id, colors);
  shapeData.push(shapeDatum);
  console.log(shapeData);

  id++;

  /*

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    */

  drawAllShapes();
}

function createRectangle() {
  console.log("hello");

  var vertices = [-0.5, 0.5, 0.3, 0.5, -0.5, 0.0, 0.3, 0.0];
  var colors = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  for (var i = 0; i < vertices.length; i++) {
    allVertices.push(vertices[i]);
  }

  for (var i = 0; i < 4; i++) {
    allColors.push(0.0);
    allColors.push(0.0);
    allColors.push(0.0);
  }

  var shapeDatum = new Shape(vertices, "square", id, colors);
  shapeData.push(shapeDatum);
  console.log(shapeData);

  id++;

  /*

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    */

  drawAllShapes();
}

function createLine() {
  console.log("hello2");

  var vertices2 = [-0.9, 0.9, 0.0, 0.9];
  var colors2 = [0, 0, 0, 0, 0, 0];

  for (var i = 0; i < vertices2.length; i++) {
    allVertices.push(vertices2[i]);
  }

  for (var i = 0; i < 2; i++) {
    allColors.push(0.0);
    allColors.push(0.0);
    allColors.push(0.0);
  }

  var shapeDatum = new Shape(vertices2, "line", id, colors2);
  shapeData.push(shapeDatum);
  console.log(shapeData);

  id++;

  drawAllShapes();
}

function createPolygon() {
  const sides = polygonSides.value;
  console.log("sides: " + sides);
  var vertices = [];
  var colors = [];
  var angle = (2 * Math.PI) / sides;
  for (var i = 0; i < sides; i++) {
    vertices.push(Math.cos(angle * i) / 2);
    vertices.push(Math.sin(angle * i) / 2);
  }

  for (var i = 0; i < sides; i++){
    colors.push(0.0);
    colors.push(0.0);
    colors.push(0.0);
  }

  for (var i = 0; i < vertices.length; i++) {
    allVertices.push(vertices[i]);
  }

  for (var i = 0; i < sides; i++) {
    allColors.push(0.0);
    allColors.push(0.0);
    allColors.push(0.0);
  }

  var shapeDatum = new Shape(vertices, "polygon", id, colors);
  shapeData.push(shapeDatum);
  console.log(shapeData);

  id++;

  drawAllShapes();
}

function getPoints(event) {
  console.log("MASOK");
  let canvasOffset = canvas.getBoundingClientRect();

  var x =
    (event.clientX - canvasOffset.left - canvas.width / 2) / (canvas.width / 2);
  var y =
    (1 - (event.clientY - canvasOffset.top - canvas.height / 2)) /
    (canvas.height / 2);

  var dist = 999;
  for (var i = 0; i < shapeData.length; i++) {
    for (var j = 0; j < shapeData[i].vertices.length; j += 2) {
      var xOffset = Math.abs(x - shapeData[i].vertices[j]);
      var yOffset = Math.abs(y - shapeData[i].vertices[j + 1]);
      var offset = xOffset + yOffset;
      if (offset < dist) {
        dist = offset;
        vertexId = i;
        vertexNum = j;
      }
    }
  }

  console.log(x, y);
  console.log(
    shapeData[vertexId].vertices[vertexNum],
    shapeData[vertexId].vertices[vertexNum + 1]
  );

  if (
    action.value == "delete-vertex" &&
    shapeData[vertexId].type == "polygon" &&
    shapeData[vertexId].vertices.length > 6
  ) {
    shapeData[vertexId].vertices.splice(vertexNum, 2);
    setAllVertices();
    drawAllShapes();
    isDragging = false;
  } else {
    isDragging = true;
  }
}

function movePoint(event) {
  if (isDragging) {
    if (shapeData[vertexId].type === "line") {
      moveLinePoint(event);
    } else if (shapeData[vertexId].type === "square") {
      moveRectanglePoint(event);
    } else if (shapeData[vertexId].type === "rectangle") {
      moveRectanglePoint(event);
    } else if (shapeData[vertexId].type === "polygon") {
      moveLinePoint(event);
    }
  }
}

function moveShape(event) {
  if (!isDragging) {
    return;
  }

  let canvasOffset = canvas.getBoundingClientRect();

  var x =
    (event.clientX - canvasOffset.left - canvas.width / 2) / (canvas.width / 2);

  var y =
    (1 - (event.clientY - canvasOffset.top - canvas.height / 2)) /
    (canvas.height / 2);

  var xOffset = x - shapeData[vertexId].vertices[vertexNum];
  var yOffset = y - shapeData[vertexId].vertices[vertexNum + 1];

  for (var i = 0; i < shapeData[vertexId].vertices.length; i += 2) {
    shapeData[vertexId].vertices[i] += xOffset;
    shapeData[vertexId].vertices[i + 1] += yOffset;
  }

  setAllVertices();
  drawAllShapes();
}

function moveLinePoint(event) {
  if (isDragging && action.value != "delete-vertex") {
    let canvasOffset = canvas.getBoundingClientRect();

    var x =
      (event.clientX - canvasOffset.left - canvas.width / 2) /
      (canvas.width / 2);
    var y =
      (1 - (event.clientY - canvasOffset.top - canvas.height / 2)) /
      (canvas.height / 2);

    shapeData[vertexId].vertices[vertexNum] = x;
    shapeData[vertexId].vertices[vertexNum + 1] = y;

    setAllVertices();
    drawAllShapes();
  }
}

function moveRectanglePoint(event) {
  let canvasOffset = canvas.getBoundingClientRect();

  var x =
    (event.clientX - canvasOffset.left - canvas.width / 2) / (canvas.width / 2);
  var y =
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

  setAllVertices();
  drawAllShapes();
}

function setAllVertices() {
  allVertices = [];
  for (var i = 0; i < shapeData.length; i++) {
    for (var j = 0; j < shapeData[i].vertices.length; j++) {
      allVertices.push(shapeData[i].vertices[j]);
    }
  }

  allColors = [];
  for (var i = 0; i < shapeData.length; i++) {
    for (var j = 0; j < shapeData[i].vertices.length; j++) {
      allColors.push(shapeData[i].colors[j]);
    }
  }
}

function drawAllShapes() {
  var i = 0;
  var j = 0;
  while (i < shapeData.length) {
    var detailVertices = new Float32Array([]);

    const totalVertices = shapeData[i].vertices.length / 2;
    console.log(totalVertices)
    console.log(shapeData[i].colors)
    for (var k = 0; k < totalVertices; k++) {
      detailVertices = new Float32Array([...detailVertices, shapeData[i].vertices[k * 2]]);
      detailVertices = new Float32Array([...detailVertices, shapeData[i].vertices[k * 2 + 1]]);
      detailVertices = new Float32Array([...detailVertices, shapeData[i].colors[k * 3]]);
      detailVertices = new Float32Array([...detailVertices, shapeData[i].colors[k * 3 + 1]]);
      detailVertices = new Float32Array([...detailVertices, shapeData[i].colors[k * 3 + 2]]);
    }

    console.log(detailVertices)

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(detailVertices), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 5*Float32Array.BYTES_PER_ELEMENT, 0);
    gl.enableVertexAttribArray(vPosition);

    var vColor = gl.getAttribLocation(program, "color");
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 5*Float32Array.BYTES_PER_ELEMENT, 2*Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(vColor);

    if (shapeData[i].type === "square" || shapeData[i].type === "rectangle") {
      gl.drawArrays(gl.POINTS, 0, totalVertices);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, totalVertices);
      j += 4;
    } else if (shapeData[i].type === "line") {
      gl.drawArrays(gl.POINTS, 0, totalVertices);
      gl.drawArrays(gl.LINE_STRIP, 0, totalVertices);
      j += 2;
    } else if (shapeData[i].type === "polygon") {
      gl.drawArrays(gl.POINTS, 0, totalVertices);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, totalVertices);
      j += totalVertices;
    }

    i++;
  }
}

function clearCanvas() {
  allVertices = [];
  allColors = [];
  shapeData = [];
  id = 0;
  drawAllShapes();
}

function addVertex(event) {
  if (isDragging) {
    let canvasOffset = canvas.getBoundingClientRect();
    var x =
      (event.clientX - canvasOffset.left - canvas.width / 2) /
      (canvas.width / 2);
    var y =
      (1 - (event.clientY - canvasOffset.top - canvas.height / 2)) /
      (canvas.height / 2);

    var shape = shapeData[vertexId];
    shape.vertices[vertexNum] = x;
    shape.vertices[vertexNum + 1] = y;

    setAllVertices();
    drawAllShapes();
  }
}

function getNearestVertices(event) {
  let canvasOffset = canvas.getBoundingClientRect();
  var x =
    (event.clientX - canvasOffset.left - canvas.width / 2) / (canvas.width / 2);
  var y =
    (1 - (event.clientY - canvasOffset.top - canvas.height / 2)) /
    (canvas.height / 2);
  var shape = shapeData[vertexId];

  // get two vertices that create the nearest line to the mouse
  var nearest1 = 0;
  var nearest2 = 0;
  var minDistance = 1000;
  for (var i = 0; i < shape.vertices.length; i += 2) {
    var distance = Math.sqrt(
      Math.pow(x - shape.vertices[i], 2) +
        Math.pow(y - shape.vertices[i + 1], 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearest1 = i;
    }
  }
  minDistance = 1000;
  for (var i = 0; i < shape.vertices.length; i += 2) {
    if (i != nearest1) {
      var distance = Math.sqrt(
        Math.pow(x - shape.vertices[i], 2) +
          Math.pow(y - shape.vertices[i + 1], 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest2 = i;
      }
    }
  }

  if (
    (nearest1 == 0 && nearest2 == shape.vertices.length - 2) ||
    (nearest1 == shape.vertices.length - 2 && nearest2 == 0)
  ) {
    shape.vertices.splice(shape.vertices.length, 0, -2, -2);
    vertexNum = shape.vertices.length - 2;
  } else {
    shape.vertices.splice(Math.min(nearest1, nearest2) + 2, 0, -2, -2);
    vertexNum = Math.min(nearest1, nearest2) + 2;
  }

  console.log(shape.vertices);
}

function main() {
  if (!gl) {
    alert("WebGL isn't available");
  }

  var vertCode =`
    attribute vec4 vPosition;
    attribute vec3 color;
    varying vec3 vColor;
    void main() {
      gl_Position = vPosition;
      gl_PointSize = 10.0;
      vColor = color;
    }
  `

  var vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, vertCode);
  gl.compileShader(vertShader);

  var fragCode =`
    precision mediump float;
    varying vec3 vColor;
    void main() {
      gl_FragColor = vec4(vColor, 1.0);
    }
  `

  var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
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
