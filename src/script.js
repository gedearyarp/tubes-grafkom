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
const convexHullText = document.getElementById("convex-hull");

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
  } else if (action.value == "convex-hull-shape") {
    convexHull();
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
    convexHullText.style.display = "none";
    shapePick.style.display = "block";
    colorPick.style.display = "none";
    createShapeButton.style.display = "block";
    if (shape.value == POLYGON) numSideInput.style.display = "block";
  } else if (action.value == "select") {
    convexHullText.style.display = "none";
    shapePick.style.display = "none";
    colorPick.style.display = "none";
    createShapeButton.style.display = "none";
  } else if (action.value == "move") {
    convexHullText.style.display = "none";
    shapePick.style.display = "none";
    colorPick.style.display = "none";
    createShapeButton.style.display = "none";
  } else if (action.value == "color-vertex" || action.value == "color-shape") {
    convexHullText.style.display = "none";
    shapePick.style.display = "none";
    colorPick.style.display = "block";
    createShapeButton.style.display = "none";
  } else if (action.value == "delete-vertex") {
    convexHullText.style.display = "none";
    shapePick.style.display = "none";
    colorPick.style.display = "none";
    createShapeButton.style.display = "none";
  } else if (action.value == "add-vertex") {
    convexHullText.style.display = "none";
    shapePick.style.display = "none";
    colorPick.style.display = "none";
    createShapeButton.style.display = "none";
  } else if (action.value == "convex-hull-shape") {
    convexHullText.style.display = "block";
    shapePick.style.display = "none";
    colorPick.style.display = "none";
    createShapeButton.style.display = "none";
  }
});

// functions
function convexHull() {
  let shape = shapeData[vertexId];
  let vertices = shape.vertices;
  let colors = shape.colors;

  class Point {
    constructor(x, y, r, g, b) {
      this.x = x;
      this.y = y;
      this.r = r;
      this.g = g;
      this.b = b;
    }
  }

  let points = [];
  for (let i = 0; i < vertices.length/2; i++) {
    let point = new Point(
      vertices[i*2],
      vertices[i*2 + 1],
      colors[i * 3],
      colors[i * 3 + 1],
      colors[i * 3 + 2]
    );
    points.push(point);
  }

  let convexHullRes = [];
  let leftMost = 0;
  let rightMost = 0;
  for (let i = 1; i < points.length; i++) {
    if (points[i].x < points[leftMost].x) leftMost = i;
    if (points[i].x > points[rightMost].x) rightMost = i;
  }

  // function divide and conquer
  function divideAndConquer(left, right, dir) {
    let pointLine1 = points[left];
    let pointLine2 = points[right];

    let idx = -1;

    let maxDist = 0;

    for (let i = 0; i < points.length; i++) {
      let curDist = (points[i].y - pointLine1.y) * (pointLine2.x - pointLine1.x) - 
                    (points[i].x - pointLine1.x) * (pointLine2.y - pointLine1.y);

      if (dir * curDist >= 0 && Math.abs(curDist) > maxDist) {
        maxDist = Math.abs(curDist);
        idx = i;
      }
    }

    if (idx == -1) {
      // check if left and right in convesHullRes
      let leftIn = false;
      let rightIn = false;
      for (let i = 0; i < convexHullRes.length; i++) {
        if (convexHullRes[i] == left) leftIn = true;
        if (convexHullRes[i] == right) rightIn = true;
      }

      if (!leftIn) convexHullRes.push(left);
      if (!rightIn) convexHullRes.push(right);
      
      return;
    }

    divideAndConquer(left, idx, dir);
    divideAndConquer(idx, right, dir);
  }

  divideAndConquer(leftMost, rightMost, 1);
  divideAndConquer(leftMost, rightMost, -1);

  // order the points in convexHullRes with clockwise
  let center = new Point(0, 0, 0, 0, 0);
  for (let i = 0; i < convexHullRes.length; i++) {
    center.x += points[convexHullRes[i]].x;
    center.y += points[convexHullRes[i]].y;
  }
  center.x /= convexHullRes.length;
  center.y /= convexHullRes.length;

  let angle = [];
  for (let i = 0; i < convexHullRes.length; i++) {
    let curPoint = points[convexHullRes[i]];
    angle.push(Math.atan2(curPoint.y - center.y, curPoint.x - center.x));
  }

  for (let i = 0; i < convexHullRes.length; i++) {
    for (let j = i + 1; j < convexHullRes.length; j++) {
      if (angle[i] > angle[j]) {
        let temp = convexHullRes[i];
        convexHullRes[i] = convexHullRes[j];
        convexHullRes[j] = temp;

        temp = angle[i];
        angle[i] = angle[j];
        angle[j] = temp;
      }
    }
  }

  let newVertices = [];
  let newColors = [];
  for (let i = 0; i < convexHullRes.length; i++) {
    newVertices.push(points[convexHullRes[i]].x);
    newVertices.push(points[convexHullRes[i]].y);
    newColors.push(points[convexHullRes[i]].r);
    newColors.push(points[convexHullRes[i]].g);
    newColors.push(points[convexHullRes[i]].b);
  }

  shape.vertices = newVertices;
  shape.colors = newColors;

  shapeData[vertexId] = shape;

  drawAllShapes();
}

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
    
    if (Math.abs(squareWidth-squareHeight) < 0.0000000001){
      shapeData[vertexId].vertices[vertexNum] = x;
      shapeData[vertexId].vertices[vertexNum + 1] = y;
      shapeData[vertexId].vertices[4] = x;
      shapeData[vertexId].vertices[3] = y;
    }

  } else if (vertexNum == 2 && x>shapeData[vertexId].vertices[0] && y>shapeData[vertexId].vertices[5]) {
    squareWidth = x-shapeData[vertexId].vertices[0]
    squareHeight = y-shapeData[vertexId].vertices[5]
    
    if (Math.abs(squareWidth-squareHeight) < 0.0000000001){
      shapeData[vertexId].vertices[vertexNum] = x;
      shapeData[vertexId].vertices[vertexNum + 1] = y;
      shapeData[vertexId].vertices[6] = x;
      shapeData[vertexId].vertices[1] = y;
    }

  } else if (vertexNum == 4 && x<shapeData[vertexId].vertices[2] && y<shapeData[vertexId].vertices[1]) {
    squareWidth = shapeData[vertexId].vertices[2]-x
    squareHeight = shapeData[vertexId].vertices[1]-y
    
    if (Math.abs(squareWidth-squareHeight) < 0.0000000001){
      shapeData[vertexId].vertices[vertexNum] = x;
      shapeData[vertexId].vertices[vertexNum + 1] = y;
      shapeData[vertexId].vertices[0] = x;
      shapeData[vertexId].vertices[7] = y;
    }

  } else if (vertexNum == 6 && x>shapeData[vertexId].vertices[0] && y<shapeData[vertexId].vertices[1]) {
    squareWidth = x-shapeData[vertexId].vertices[0]
    squareHeight = shapeData[vertexId].vertices[1]-y
    
    if (Math.abs(squareWidth-squareHeight) < 0.0000000001){
      shapeData[vertexId].vertices[vertexNum] = x;
      shapeData[vertexId].vertices[vertexNum + 1] = y;
      shapeData[vertexId].vertices[2] = x;
      shapeData[vertexId].vertices[5] = y;
    }
    
  }

  drawAllShapes();
}

function drawAllShapes() {
  console.log(shapeData)
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
