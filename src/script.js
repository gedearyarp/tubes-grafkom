/*
AUTHOR:
Christine Hutabarat		13520005
William Manuel K		13520020
I Gede Arya Raditya P.	13520036
*/

//catatan:
//belum ada buffer buat warna
//program masih berantakan
var canvas = document.getElementById("my_Canvas");
var gl = canvas.getContext("webgl");
var program;
var id = 1;

var shapeData = [];
var allVertices = [];

var vertexNum;
var vertexId;
var isDragging = false;

const shape = document.getElementById("shape");
const button = document.getElementById("new-square");
const button2 = document.getElementById("new-line");
const buttonPolygon = document.getElementById("new-polygon");
const polygonSides = document.getElementById("num-sides");

shape.addEventListener("change", function () {
  if (shape.value == "polygon") {
    polygonSides.style.display = "block";
  }
});
button.addEventListener("click", createSquare);
button2.addEventListener("click", createLine);
buttonPolygon.addEventListener("click", createPolygon);
canvas.addEventListener("mousedown", getPoints);
canvas.addEventListener("mousemove", moveLinePoint);
canvas.addEventListener("mouseup", function () {
  isDragging = false;
});

function createSquare() {
  console.log("hello");

  var vertices = [-0.5, 0.5, 0.0, 0.5, -0.5, 0.0, 0.0, 0.0];

  for (var i = 0; i < vertices.length; i++) {
    allVertices.push(vertices[i]);
  }

  var shapeDatum = new Shape(vertices, "square", id);
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

  for (var i = 0; i < vertices2.length; i++) {
    allVertices.push(vertices2[i]);
  }

  var shapeDatum = new Shape(vertices2, "line", id);
  shapeData.push(shapeDatum);
  console.log(shapeData);

  id++;

  drawAllShapes();
}

function createPolygon() {
  const sides = polygonSides.value;
  console.log("sides: " + sides);
  var vertices = [];
  var angle = (2 * Math.PI) / sides;
  for (var i = 0; i < sides; i++) {
    vertices.push(Math.cos(angle * i) / 2);
    vertices.push(Math.sin(angle * i) / 2);
  }

  for (var i = 0; i < vertices.length; i++) {
    allVertices.push(vertices[i]);
  }

  var shapeDatum = new Shape(vertices, "polygon", id);
  shapeData.push(shapeDatum);
  console.log(shapeData);

  id++;

  drawAllShapes();
}

function getPoints(event) {
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

  isDragging = true;
}

function moveLinePoint(event) {
  if (isDragging) {
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

function setAllVertices() {
  allVertices = [];
  for (var i = 0; i < shapeData.length; i++) {
    for (var j = 0; j < shapeData[i].vertices.length; j++) {
      allVertices.push(shapeData[i].vertices[j]);
    }
  }
}

function drawAllShapes() {
  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allVertices), gl.STATIC_DRAW);
  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  gl.clear(gl.COLOR_BUFFER_BIT);
  var i = 0;
  var j = 0;
  while (i < shapeData.length) {
    if (shapeData[i].type === "square") {
      gl.drawArrays(gl.POINTS, j, 4);
      gl.drawArrays(gl.TRIANGLE_STRIP, j, 4);
      j += 4;
    } else if (shapeData[i].type === "line") {
      gl.drawArrays(gl.POINTS, j, 2);
      gl.drawArrays(gl.LINE_STRIP, j, 2);
      j += 2;
    } else if (shapeData[i].type === "polygon") {
      gl.drawArrays(gl.POINTS, j, shapeData[i].vertices.length / 2);
      gl.drawArrays(gl.TRIANGLE_FAN, j, shapeData[i].vertices.length / 2);
      j += shapeData[i].vertices.length / 2;
    }

    i++;
  }
}

function main() {
  if (!gl) {
    alert("WebGL isn't available");
  }

  //vertCode kayanya belum benar nanti diganti
  var vertCode =
    "attribute vec4 vPosition;" +
    "void main(){" +
    "   gl_Position = vPosition;" +
    "   gl_PointSize = 10.0;" +
    "}";

  var vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, vertCode);
  gl.compileShader(vertShader);

  //ini juga harus diganti kayanya
  var fragCode =
    "precision mediump float;" +
    "void main(){" +
    "    gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );" +
    "}";

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
