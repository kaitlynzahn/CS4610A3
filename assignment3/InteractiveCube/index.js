"use strict";

var positions = [];
var colors = [];

var keys = {};

function KeyIsPressed(code) {
    var pressed = keys[code];
    if (typeof pressed !== "undefined" && pressed) {
        return true;
    }
    return false;
}

function cube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function quad(a, b, c, d) {
    var vertices = [
        vec4(-0.5, -0.5, 0.5, 1.0),
        vec4(-0.5, 0.5, 0.5, 1.0),
        vec4(0.5, 0.5, 0.5, 1.0),
        vec4(0.5, -0.5, 0.5, 1.0),
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4(-0.5, 0.5, -0.5, 1.0),
        vec4(0.5, 0.5, -0.5, 1.0),
        vec4(0.5, -0.5, -0.5, 1.0)
    ];

    var vertexColors = [
        vec4(0.0, 0.0, 0.0, 1.0),  // black
        vec4(1.0, 0.0, 0.0, 1.0),  // red
        vec4(1.0, 1.0, 0.0, 1.0),  // yellow
        vec4(0.0, 1.0, 0.0, 1.0),  // green
        vec4(0.0, 0.0, 1.0, 1.0),  // blue
        vec4(1.0, 0.0, 1.0, 1.0),  // magenta
        vec4(0.0, 1.0, 1.0, 1.0),  // cyan
        vec4(1.0, 1.0, 1.0, 1.0)   // white
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    var indices = [a, b, c, a, c, d];

    for (var i = 0; i < indices.length; ++i) {
        positions.push(vertices[indices[i]]);
        colors.push(vertexColors[a]);
    }
}

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");

    var gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    //add vertices to positions to create a cube
    cube();

    //setup the canvas
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);;

    //setup the shader program
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    //vertex array attribute buffer
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    //setup colors
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);
    
    // rotation matrix
    var translation = mat4();
    var rotation = mat4();
    
    var modelLoc = gl.getUniformLocation(program, "uModel");
    gl.uniformMatrix4fv(modelLoc, false, flatten(mat4()));

    function render() {
        // move up using W
        if(KeyIsPressed("KeyW")) {
            console.log("W");
            cameraPosition = mult(translate(0, 0.01, 0), translation);
            //translate(0, 2, 0);
        }
        // move left using A
        if(KeyIsPressed("KeyA")) {
            console.log("A");
            translation = mult(translate(-0.01, 0, 0), translation);
        }
        // move down using S
        if(KeyIsPressed("KeyS")) {
            console.log("S");
            translation = mult(translate(0, -0.01, 0), translation);
        }
        // move right using D
        if(KeyIsPressed("KeyD")) {
            console.log("D");
            translation = mult(translate(0.01, 0, 0), translation);
        }
        
        var model = mult(translation, rotation);
        gl.uniformMatrix4fv(modelLoc, false, flatten(model));

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, positions.length);

        requestAnimationFrame(render);
    }
    render();

    // if the key is pressed, set true
    window.addEventListener("keydown", function (event) {
        keys[event.code] = true;
    });
    // if the key is not pressed, set false
    window.addEventListener("keyup", function (event) {
        keys[event.code] = false;
    });
    
    // mousemove event listener
    canvas.addEventListener("mousemove", function(event) {
        if(event.buttons == 1) {
            console.log(event.movementX + " " + event.movementY);
            rotation = mult(rotateY(-event.movementX), rotation); 
            rotation = mult(rotateX(-event.movementY), rotation);
        }
    })

    
}