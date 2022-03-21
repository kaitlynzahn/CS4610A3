"use strict";



// initialize positions array & number of times to subdivide triangles
var positions = []; 
var numTimesToSubdivide = 5;



// when the page loads
window.onload = function init() {
    // load the canvas
    var canvas = document.getElementById("gl-canvas");

    // if webGL can't load, show error
    var gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");
    
    // set triangle size
    var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];

    // vertex and fragment shader
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // set canvas dimensions and color
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1.0);

    //setup the positions buffer as empty
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 0, gl.STATIC_DRAW);

    //tell WebGL how to read from the positions buffer
    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    
    
    // render function
    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT); //clear the canvas using the color set with gl.clearColor
        gl.drawArrays(gl.TRIANGLES, 0, positions.length);
    }

    // render the page
    render();

    
    
    // if the user clicks on their mouse
    canvas.addEventListener("mousedown", function (event) {
        // calculate click position in canvas coordinates
        var clickPosX = (event.offsetX / canvas.width) * 2 - 1;
        var clickPosY = ((canvas.height - event.offsetY) / canvas.height) * 2 - 1;
        // set ordered pair of where click was
        var clickPos = vec2(clickPosX, clickPosY);

        var newTriangle = [];

        //generate a new triangle by taking the vertices in triangle and copying them into positions with an offset of where you clicked
        // for all three points in the triangle
        for (var i = 0; i < vertices.length; i++) {
            const scale = 0.25;
            // add the point of the triangle, scale the size, and move it to your click position. push it to the positions array
            var trianglePos = vertices[i];
            //trianglePos = mult(.1, trianglePos);
            //var position = add(clickPos, trianglePos);
            var position = vec2(vertices[i][0] * scale, vertices[i][1] * scale);
            position = add(clickPos, position);
            newTriangle.push(position);
        }

        // call divide triangle with the positions where you clicked
        divideTriangle(newTriangle[0], newTriangle[1], newTriangle[2], numTimesToSubdivide);
        
        //send the new data to the positions buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);
        
        //render again now that there is new data in the buffer
        render();
    });
}



// function triangle pushes values a, b, and c into the positions array
function triangle(a, b, c)
{
    positions.push(a, b, c);
}



// function to create the sierpinski triangle
function divideTriangle(a, b, c, count)
{
    // check for end of recursion, if it's over, call triangle & push values into positions array
    if ( count === 0 ) {
        triangle(a, b, c);
    }
    
    // if the recursion is not over
    else {
        //bisect the sides
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );
        
        // decrement count
        --count;
            
        // three new triangles
        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
    }
}
