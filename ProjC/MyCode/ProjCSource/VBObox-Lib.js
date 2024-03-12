//3456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_
// (JT: why the numbers? counts columns, helps me keep 80-char-wide listings)

// Tabs set to 2

/*=====================
  VBObox-Lib.js library: 
  ===================== 
Note that you don't really need 'VBObox' objects for any simple, 
    beginner-level WebGL/OpenGL programs: if all vertices contain exactly 
		the same attributes (e.g. position, color, surface normal), and use 
		the same shader program (e.g. same Vertex Shader and Fragment Shader), 
		then our textbook's simple 'example code' will suffice.
		  
***BUT*** that's rare -- most genuinely useful WebGL/OpenGL programs need 
		different sets of vertices with  different sets of attributes rendered 
		by different shader programs.  THUS a customized VBObox object for each 
		VBO/shader-program pair will help you remember and correctly implement ALL 
		the WebGL/GLSL steps required for a working multi-shader, multi-VBO program.
		
One 'VBObox' object contains all we need for WebGL/OpenGL to render on-screen a 
		set of shapes made from vertices stored in one Vertex Buffer Object (VBO), 
		as drawn by calls to one 'shader program' that runs on your computer's 
		Graphical Processing Unit(GPU), along with changes to values of that shader 
		program's one set of 'uniform' varibles.  
The 'shader program' consists of a Vertex Shader and a Fragment Shader written 
		in GLSL, compiled and linked and ready to execute as a Single-Instruction, 
		Multiple-Data (SIMD) parallel program executed simultaneously by multiple 
		'shader units' on the GPU.  The GPU runs one 'instance' of the Vertex 
		Shader for each vertex in every shape, and one 'instance' of the Fragment 
		Shader for every on-screen pixel covered by any part of any drawing 
		primitive defined by those vertices.
The 'VBO' consists of a 'buffer object' (a memory block reserved in the GPU),
		accessed by the shader program through its 'attribute' variables. Shader's
		'uniform' variable values also get retrieved from GPU memory, but their 
		values can't be changed while the shader program runs.  
		Each VBObox object stores its own 'uniform' values as vars in JavaScript; 
		its 'adjust()'	function computes newly-updated values for these uniform 
		vars and then transfers them to the GPU memory for use by shader program.
EVENTUALLY you should replace 'cuon-matrix-quat03.js' with the free, open-source
   'glmatrix.js' library for vectors, matrices & quaternions: Google it!
		This vector/matrix library is more complete, more widely-used, and runs
		faster than our textbook's 'cuon-matrix-quat03.js' library.  
		--------------------------------------------------------------
		I recommend you use glMatrix.js instead of cuon-matrix-quat03.js
		--------------------------------------------------------------
		for all future WebGL programs. 
You can CONVERT existing cuon-matrix-based programs to glmatrix.js in a very 
    gradual, sensible, testable way:
		--add the glmatrix.js library to an existing cuon-matrix-based program;
			(but don't call any of its functions yet).
		--comment out the glmatrix.js parts (if any) that cause conflicts or in	
			any way disrupt the operation of your program.
		--make just one small local change in your program; find a small, simple,
			easy-to-test portion of your program where you can replace a 
			cuon-matrix object or function call with a glmatrix function call.
			Test; make sure it works. Don't make too large a change: it's hard to fix!
		--Save a copy of this new program as your latest numbered version. Repeat
			the previous step: go on to the next small local change in your program
			and make another replacement of cuon-matrix use with glmatrix use. 
			Test it; make sure it works; save this as your next numbered version.
		--Continue this process until your program no longer uses any cuon-matrix
			library features at all, and no part of glmatrix is commented out.
			Remove cuon-matrix from your library, and now use only glmatrix.

	------------------------------------------------------------------
	VBObox -- A MESSY SET OF CUSTOMIZED OBJECTS--NOT REALLY A 'CLASS'
	------------------------------------------------------------------
As each 'VBObox' object can contain:
  -- a DIFFERENT GLSL shader program, 
  -- a DIFFERENT set of attributes that define a vertex for that shader program, 
  -- a DIFFERENT number of vertices to used to fill the VBOs in GPU memory, and 
  -- a DIFFERENT set of uniforms transferred to GPU memory for shader use.  
*/
// Written for EECS 351-2,	Intermediate Computer Graphics,
//							Northwestern Univ. EECS Dept., Jack Tumblin

//=============================================================================
//==========================VBO Boxes and Methods==============================
//=============================================================================
function VBObox0() {
// CONSTRUCTOR for one re-usable 'VBObox0' object that holds all data and fcns
// needed to render vertices from one Vertex Buffer Object (VBO) using one 
// separate shader program (a vertex-shader & fragment-shader pair) and one
// set of 'uniform' variables.

// Constructor goal: 
// Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
// written into code) in all other VBObox functions. Keeping all these (initial)
// values here, in this one coonstrutor function, ensures we can change them 
// easily WITHOUT disrupting any other code, ever!
  
	this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
 `precision highp float;				// req'd in OpenGL ES if we use 'float'
  //
  uniform mat4 u_ModelMat0;
  attribute vec4 a_Pos0;
  attribute vec3 a_Colr0;
  varying vec3 v_Colr0;
  //
  void main() {
    gl_Position = u_ModelMat0 * a_Pos0;
  	 v_Colr0 = a_Colr0;
   }`;

	this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
 `precision mediump float;
  varying vec3 v_Colr0;
  void main() {
    gl_FragColor = vec4(v_Colr0, 1.0);
  }`;

  //call grid and axis creators here
  //remember to use glLineWidth for the axes to be larger
  makeGroundGrid(); // generates gndVerts array -- x, y, z, w; r, g, b
  makeAxes(); // generates myAxes array -- x, y, z, w; r, g, b

  var numFloats = gndVerts.length + myAxes.length;
  var numVerts = numFloats / 7;
  var allVerts = new Float32Array(numFloats);

  //TODO: Merge gndVerts and myAxes into a larger allVerts array
  // starting point of ground plane = 0
  for(i=0, j=0; j< gndVerts.length; i++, j++) {
    allVerts[i] = gndVerts[j];
  }
  // starting point of axes = i
  axesStart = i;		
  for(j=0; j< myAxes.length; i++, j++) {
    allVerts[i] = myAxes[j];
  }

	this.vboContents = allVerts;
	this.vboVerts = numVerts;						// # of vertices held in 'vboContents' array
	this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;
	                              // bytes req'd by 1 vboContents array element;
																// (why? used to compute stride and offset 
																// in bytes for vertexAttribPointer() calls)
  this.vboBytes = this.vboContents.length * this.FSIZE;               
                                // total number of bytes stored in vboContents
                                // (#  of floats in vboContents array) * 
                                // (# of bytes/float).
	this.vboStride = this.vboBytes / this.vboVerts; 
	                              // (== # of bytes to store one complete vertex).
	                              // From any attrib in a given vertex in the VBO, 
	                              // move forward by 'vboStride' bytes to arrive 
	                              // at the same attrib for the next vertex. 

  //----------------------Attribute sizes----------------------------------
  this.vboFcount_a_Pos0 =  4;    // # of floats in the VBO needed to store the
                                // attribute named a_Pos0. (4: x,y,z,w values)
  this.vboFcount_a_Colr0 = 3;   // # of floats for this attrib (r,g,b values) 
  console.assert((this.vboFcount_a_Pos0 +     // check the size of each and
                  this.vboFcount_a_Colr0) *   // every attribute in our VBO
                  this.FSIZE == this.vboStride, // for agreeement with'stride'
                  "Uh oh! VBObox0.vboStride disagrees with attribute-size values!");

  //----------------------Attribute offsets-------------------------------
	this.vboOffset_a_Pos0 = 0;    // # of bytes from START of vbo to the START
	                              // of 1st a_Pos0 attrib value in vboContents[]
  this.vboOffset_a_Colr0 = this.vboFcount_a_Pos0 * this.FSIZE;    
                                // (4 floats * bytes/float) 
                                // # of bytes from START of vbo to the START
                                // of 1st a_Colr0 attrib value in vboContents[]

  //-----------------------GPU memory locations----------------------------
	this.vboLoc;									// GPU Location for Vertex Buffer Object, 
	                              // returned by gl.createBuffer() function call
	this.shaderLoc;								// GPU Location for compiled Shader-program  
	                            	// set by compile/link of VERT_SRC and FRAG_SRC.
								          //------Attribute locations in our shaders:
	this.a_PosLoc;								// GPU location for 'a_Pos0' attribute
	this.a_ColrLoc;								// GPU location for 'a_Colr0' attribute

  //-------------- Uniform locations &values in our shaders----------------
	this.ModelMat = new Matrix4();	// Transforms CVV axes to model axes.
	this.u_ModelMatLoc;							// GPU location for u_ModelMat uniform
}

VBObox0.prototype.init = function() {
//=============================================================================
// Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
// kept in this VBObox. (This function usually called only once, within main()).
// Specifically:
// a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
//  executable 'program' stored and ready to use inside the GPU.  
// b) create a new VBO object in GPU memory and fill it by transferring in all
//  the vertex data held in our Float32array member 'VBOcontents'. 
// c) Find & save the GPU location of all our shaders' attribute-variables and 
//  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
// -------------------
// CAREFUL!  before you can draw pictures using this VBObox contents, 
//  you must call this VBObox object's switchToMe() function too!
//--------------------
// a) Compile,link,upload shaders-----------------------------------------------
	this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
	if (!this.shaderLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create executable Shaders on the GPU. Bye!');
    return;
  }
// CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
//  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}

	gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())

// b) Create VBO on GPU, fill it------------------------------------------------
	this.vboLoc = gl.createBuffer();	
  if (!this.vboLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create VBO in GPU. Bye!'); 
    return;
  }
  // Specify the purpose of our newly-created VBO on the GPU.  Your choices are:
  //	== "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
  // (positions, colors, normals, etc), or 
  //	== "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
  // that each select one vertex from a vertex array stored in another VBO.
  gl.bindBuffer(gl.ARRAY_BUFFER,	      // GLenum 'target' for this GPU buffer 
  								this.vboLoc);				  // the ID# the GPU uses for this buffer.

  // Fill the GPU's newly-created VBO object with the vertex data we stored in
  //  our 'vboContents' member (JavaScript Float32Array object).
  //  (Recall gl.bufferData() will evoke GPU's memory allocation & management: 
  //    use gl.bufferSubData() to modify VBO contents without changing VBO size)
  gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
 					 				this.vboContents, 		// JavaScript Float32Array
  							 	gl.STATIC_DRAW);			// Usage hint.
  //	The 'hint' helps GPU allocate its shared memory for best speed & efficiency
  //	(see OpenGL ES specification for more info).  Your choices are:
  //		--STATIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents rarely or never change.
  //		--DYNAMIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents may change often as our program runs.
  //		--STREAM_DRAW is for vertex buffers that are rendered a small number of 
  // 			times and then discarded; for rapidly supplied & consumed VBOs.

  // c1) Find All Attributes:---------------------------------------------------
  //  Find & save the GPU location of all our shaders' attribute-variables and 
  //  uniform-variables (for switchToMe(), adjust(), draw(), reload(),etc.)
  this.a_PosLoc = gl.getAttribLocation(this.shaderLoc, 'a_Pos0');
  if(this.a_PosLoc < 0) {
    console.log(this.constructor.name + 
    						'.init() Failed to get GPU location of attribute a_Pos0');
    return -1;	// error exit.
  }
 	this.a_ColrLoc = gl.getAttribLocation(this.shaderLoc, 'a_Colr0');
  if(this.a_ColrLoc < 0) {
    console.log(this.constructor.name + 
    						'.init() failed to get the GPU location of attribute a_Colr0');
    return -1;	// error exit.
  }
  // c2) Find All Uniforms:-----------------------------------------------------
  //Get GPU storage location for each uniform var used in our shader programs: 
	this.u_ModelMatLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMat0');
  if (!this.u_ModelMatLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_ModelMat1 uniform');
    return;
  }  
}

VBObox0.prototype.switchToMe = function() {
//==============================================================================
// Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)
//
// We only do this AFTER we called the init() function, which does the one-time-
// only setup tasks to put our VBObox contents into GPU memory.  !SURPRISE!
// even then, you are STILL not ready to draw our VBObox's contents onscreen!
// We must also first complete these steps:
//  a) tell the GPU to use our VBObox's shader program (already in GPU memory),
//  b) tell the GPU to use our VBObox's VBO  (already in GPU memory),
//  c) tell the GPU to connect the shader program's attributes to that VBO.

// a) select our shader program:
  gl.useProgram(this.shaderLoc);	
//		Each call to useProgram() selects a shader program from the GPU memory,
// but that's all -- it does nothing else!  Any previously used shader program's 
// connections to attributes and uniforms are now invalid, and thus we must now
// establish new connections between our shader program's attributes and the VBO
// we wish to use.  
  
// b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
//  instead connect to our own already-created-&-filled VBO.  This new VBO can 
//    supply values to use as attributes in our newly-selected shader program:
	gl.bindBuffer(gl.ARRAY_BUFFER,	        // GLenum 'target' for this GPU buffer 
										this.vboLoc);			    // the ID# the GPU uses for our VBO.

// c) connect our newly-bound VBO to supply attribute variable values for each
// vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
// this sets up data paths from VBO to our shader units:
  // 	Here's how to use the almost-identical OpenGL version of this function:
	//		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )
  gl.vertexAttribPointer(
		this.a_PosLoc,//index == ID# for the attribute var in your GLSL shader pgm;
		this.vboFcount_a_Pos0,// # of floats used by this attribute: 1,2,3 or 4?
		gl.FLOAT,			// type == what data type did we use for those numbers?
		false,				// isNormalized == are these fixed-point values that we need
									//									normalize before use? true or false
		this.vboStride,// Stride == #bytes we must skip in the VBO to move from the
		              // stored attrib for this vertex to the same stored attrib
		              //  for the next vertex in our VBO.  This is usually the 
									// number of bytes used to store one complete vertex.  If set 
									// to zero, the GPU gets attribute values sequentially from 
									// VBO, starting at 'Offset'.	
									// (Our vertex size in bytes: 4 floats for pos + 3 for color)
		this.vboOffset_a_Pos0);						
		              // Offset == how many bytes from START of buffer to the first
  								// value we will actually use?  (We start with position).
  gl.vertexAttribPointer(this.a_ColrLoc, this.vboFcount_a_Colr0, 
                        gl.FLOAT, false, 
                        this.vboStride, this.vboOffset_a_Colr0);
  							
// --Enable this assignment of each of these attributes to its' VBO source:
  gl.enableVertexAttribArray(this.a_PosLoc);
  gl.enableVertexAttribArray(this.a_ColrLoc);
}

VBObox0.prototype.isReady = function() {
//==============================================================================
// Returns 'true' if our WebGL rendering context ('gl') is ready to render using
// this objects VBO and shader program; else return false.
// see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter

var isOK = true;

  if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
    console.log(this.constructor.name + 
    						'.isReady() false: shader program at this.shaderLoc not in use!');
    isOK = false;
  }
  if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
      console.log(this.constructor.name + 
  						'.isReady() false: vbo at this.vboLoc not in use!');
    isOK = false;
  }
  return isOK;
}

VBObox0.prototype.adjust = function() {
//==============================================================================
// Update the GPU to newer, current values we now store for 'uniform' vars on 
// the GPU; and (if needed) update each attribute's stride and offset in VBO.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.adjust() call you needed to call this.switchToMe()!!');
  }  
	// // Adjust values for our uniforms,
  // this.ModelMat.setRotate(g_angleNow0, 0, 0, 1);	  // rotate drawing axes,
  // this.ModelMat.translate(0.35, 0, 0);							// then translate them.
  // this.ModelMat.setIdentity();
  // this.ModelMat.set(g_projAll).multiply(g_viewAll);

  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatLoc,	// GPU location of the uniform
  										false, 				// use matrix transpose instead?
  										this.ModelMat.elements);	// send data from Javascript.
  // Adjust the attributes' stride and offset (if necessary)
  // (use gl.vertexAttribPointer() calls and gl.enableVertexAttribArray() calls)
}

VBObox0.prototype.draw = function() {
//=============================================================================
// Render current VBObox contents.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.draw() call you needed to call this.switchToMe()!!');
  }  
  // ----------------------------Draw the contents of the currently-bound VBO:
  // gl.drawArrays(gl.TRIANGLES, 	    // select the drawing primitive to draw,
  //                 // choices: gl.POINTS, gl.LINES, gl.LINE_STRIP, gl.LINE_LOOP, 
  //                 //          gl.TRIANGLES, gl.TRIANGLE_STRIP, ...
  // 								0, 								// location of 1st vertex to draw;
  // 								this.vboVerts);		// number of vertices to draw on-screen.
  this.ModelMat.set(g_projAll).multiply(g_viewAll);
  drawGrid();
  drawAxes();
}

VBObox0.prototype.reload = function() {
//=============================================================================
// Over-write current values in the GPU inside our already-created VBO: use 
// gl.bufferSubData() call to re-transfer some or all of our Float32Array 
// contents to our VBO without changing any GPU memory allocations.

 gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
                  0,                  // byte offset to where data replacement
                                      // begins in the VBO.
 					 				this.vboContents);   // the JS source-data array used to fill VBO

}
/*
VBObox0.prototype.empty = function() {
//=============================================================================
// Remove/release all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  However, make sure this step is reversible by a call to 
// 'restoreMe()': be sure to retain all our Float32Array data, all values for 
// uniforms, all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}

VBObox0.prototype.restore = function() {
//=============================================================================
// Replace/restore all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
// all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}
*/

//=============================================================================
//=============================================================================
function VBObox1() {
//=============================================================================
//=============================================================================
// CONSTRUCTOR for one re-usable 'VBObox1' object that holds all data and fcns
// needed to render vertices from one Vertex Buffer Object (VBO) using one 
// separate shader program (a vertex-shader & fragment-shader pair) and one
// set of 'uniform' variables.

// Constructor goal: 
// Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
// written into code) in all other VBObox functions. Keeping all these (initial)
// values here, in this one coonstrutor function, ensures we can change them 
// easily WITHOUT disrupting any other code, ever!
  
	this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
 `precision highp float;				// req'd in OpenGL ES if we use 'float'
  //Uniform matrices:
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_MvpMatrix;
  uniform mat4 u_NormalMatrix;

  //Ambient, Diffuse, Specular illumination colors: 
  uniform vec3 u_Ia;
  uniform vec3 u_Id;
  uniform vec3 u_Is;

  //Ambient, Diffuse, Specular Reflection coefficients: 
  uniform float u_Ka;
  uniform float u_Kd;
  uniform float u_Ks;
  uniform float u_Se; // Shinyness exponent

  //Phong vs Blinn-Phong boolean
  uniform float u_isBlinn; //0=false, 1=true

  //Camera and Eye position
  uniform vec3 u_V; // camera "eye" position
  uniform vec3 u_Light; // light position

  attribute vec4 a_Pos1;
  attribute vec3 a_Norm;
  varying vec4 v_Color;

  //
  void main() {
    //Getting normal vec in world coordinates.
    vec4 transVec = u_ModelMatrix * vec4(a_Norm, 0.0); //CHANGED from normal to model
    vec3 normVec = normalize(transVec.xyz);
    gl_Position = u_MvpMatrix * a_Pos1;

    vec4 worldEye = vec4(u_V, 0.0);
    vec4 worldPos = u_ModelMatrix * a_Pos1;
    vec4 worldLight = vec4(u_Light, 0.0); // CHANGED

    vec3 V = normalize(worldEye.xyz - worldPos.xyz);
    vec4 temp = u_NormalMatrix * vec4(0.0, 0.0, 0.0, 0.0);

    // vec3 normEye = normalize(u_V - worldPos.xyz);
    vec3 normEye = V;
    vec3 normPosn = normalize(worldPos.xyz);
    vec3 normLight = normalize(worldLight.xyz);

    vec3 L = normalize(worldLight.xyz - worldPos.xyz);
    // vec3 L = normalize(normLight - normPosn);

    float nDotL = max(dot(normVec, L), 0.0);
    float dist = distance(worldLight, worldPos);
    float attDenom = 0.5 + 0.1*dist + 0.1*pow(dist, 2.0);
    float att = 1.0 / attDenom;

    vec3 ambient = u_Ia*u_Ka + (temp.xyz * 0.0);
    vec3 diffuse = u_Id*u_Kd*att*nDotL;

    if (u_isBlinn == 0.0) {
      //Phong lighting case
      vec3 R = reflect(-L, normVec); 
      float rDotV = max(dot(R, V), 0.0);
      vec3 specular = u_Is * u_Ks * att * pow(rDotV, u_Se);
      v_Color = vec4(diffuse + ambient + specular, 1.0);
    }
    else {
      vec3 HNum = L + V;
      vec3 H = normalize(HNum);
      float hDotN = max(dot(H, normVec), 0.0);
      vec3 specular = u_Is * u_Ks * att * pow(hDotN, u_Se);
      v_Color = vec4(diffuse + ambient + specular, 1.0);
    }
   }`;

//========Fragment shader program=======
	this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
 `precision mediump float;
  varying vec4 v_Color;
  void main() {
    gl_FragColor = v_Color;
    // gl_FragColor = vec4(v_Color.z, v_Color.z, v_Color.z, 1.0);
  }`;


	this.vboContents = makeSphere();
  
	this.vboVerts = 960;							// # of vertices held in 'vboContents' array;
	this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;  
	                              // bytes req'd by 1 vboContents array element;
																// (why? used to compute stride and offset 
																// in bytes for vertexAttribPointer() calls)
  this.vboBytes = this.vboContents.length * this.FSIZE;               
                                // (#  of floats in vboContents array) * 
                                // (# of bytes/float).
	this.vboStride = this.vboBytes / this.vboVerts;     
	                              // (== # of bytes to store one complete vertex).
	                              // From any attrib in a given vertex in the VBO, 
	                              // move forward by 'vboStride' bytes to arrive 
	                              // at the same attrib for the next vertex.
	                               
	            //----------------------Attribute sizes
  this.vboFcount_a_Pos1 =  4;    // # of floats in the VBO needed to store the
                                // attribute named a_Pos1. (4: x,y,z,w values)
  this.vboFcount_a_Norm = 3;   // # of floats for this attrib (r,g,b values)

  console.assert((this.vboFcount_a_Pos1 +     // check the size of each and
                  this.vboFcount_a_Norm) *   // every attribute in our VBO
                  this.FSIZE == this.vboStride, // for agreeement with'stride'
                  "Uh oh! VBObox1.vboStride disagrees with attribute-size values!");
                  
              //----------------------Attribute offsets
	this.vboOffset_a_Pos1 = 0;    //# of bytes from START of vbo to the START
	                              // of 1st a_Pos1 attrib value in vboContents[]
  this.vboOffset_a_Norm = (this.vboFcount_a_Pos1) * this.FSIZE;  
                                // == 4 floats * bytes/float
                                //# of bytes from START of vbo to the START
                                // of 1st a_Norm attrib value in vboContents[]

	            //-----------------------GPU memory locations:                                
	this.vboLoc;									// GPU Location for Vertex Buffer Object, 
	                              // returned by gl.createBuffer() function call
	this.shaderLoc;								// GPU Location for compiled Shader-program  
	                            	// set by compile/link of VERT_SRC and FRAG_SRC.
								          //------Attribute locations in our shaders:
	this.a_Pos1Loc;							  // GPU location: shader 'a_Pos1' attribute
	this.a_NormLoc;							// GPU location: shader 'a_Norm' attribute
	
	            //---------------------- Uniform locations &values in our shaders
	this.ModelMatrix = new Matrix4();	// Transforms CVV axes to model axes.
  this.MvpMatrix = new Matrix4();
  this.NormalMatrix = new Matrix4();
  this.u_Ia = new Vector3([1.0, 0.0, 0.0]); //RED
  this.u_Id = new Vector3([0.0, 1.0, 0.0]); //GREEN
  this.u_Is = new Vector3([0.0, 0.0, 1.0]); //BLUE
  this.u_Ka = 1.0;
  this.u_Kd = 1.0;
  this.u_Ks = 1.0;
  this.u_Se = shinyness;

  this.u_isBlinn = isBlinn;

  this.u_V = new Vector3();
  this.u_Light = new Vector3([0.0, 0.0, 5.0]);

	this.u_ModelMatrixLoc;						// GPU location for u_ModelMat uniform
  this.u_IaLoc;                     // GPU location for Ia uniform
  this.u_IdLoc;                     // GPU location for Id uniform
  this.u_IsLoc;
  this.u_KaLoc;
  this.u_KdLoc;
  this.u_KsLoc;
  this.u_SeLoc;
  this.u_isBlinnLoc;

  this.u_VLoc;
  this.u_LightLoc;
};


VBObox1.prototype.init = function() {
//==============================================================================
// Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
// kept in this VBObox. (This function usually called only once, within main()).
// Specifically:
// a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
//  executable 'program' stored and ready to use inside the GPU.  
// b) create a new VBO object in GPU memory and fill it by transferring in all
//  the vertex data held in our Float32array member 'VBOcontents'. 
// c) Find & save the GPU location of all our shaders' attribute-variables and 
//  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
// -------------------
// CAREFUL!  before you can draw pictures using this VBObox contents, 
//  you must call this VBObox object's switchToMe() function too!
//--------------------
// a) Compile,link,upload shaders-----------------------------------------------
	this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
	if (!this.shaderLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create executable Shaders on the GPU. Bye!');
    return;
  }
// CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
//  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}

	gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())

// b) Create VBO on GPU, fill it------------------------------------------------
	this.vboLoc = gl.createBuffer();	
  if (!this.vboLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create VBO in GPU. Bye!'); 
    return;
  }
  
  // Specify the purpose of our newly-created VBO on the GPU.  Your choices are:
  //	== "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
  // (positions, colors, normals, etc), or 
  //	== "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
  // that each select one vertex from a vertex array stored in another VBO.
  gl.bindBuffer(gl.ARRAY_BUFFER,	      // GLenum 'target' for this GPU buffer 
  								this.vboLoc);				  // the ID# the GPU uses for this buffer.
  											
  // Fill the GPU's newly-created VBO object with the vertex data we stored in
  //  our 'vboContents' member (JavaScript Float32Array object).
  //  (Recall gl.bufferData() will evoke GPU's memory allocation & management: 
  //	 use gl.bufferSubData() to modify VBO contents without changing VBO size)
  gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
 					 				this.vboContents, 		// JavaScript Float32Array
  							 	gl.STATIC_DRAW);			// Usage hint.  
  //		--STATIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents rarely or never change.
  //		--DYNAMIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents may change often as our program runs.
  //		--STREAM_DRAW is for vertex buffers that are rendered a small number of 
  // 			times and then discarded; for rapidly supplied & consumed VBOs.

// c1) Find All Attributes:-----------------------------------------------------
//  Find & save the GPU location of all our shaders' attribute-variables and 
//  uniform-variables (for switchToMe(), adjust(), draw(), reload(), etc.)
  this.a_Pos1Loc = gl.getAttribLocation(this.shaderLoc, 'a_Pos1');
  if(this.a_Pos1Loc < 0) {
    console.log(this.constructor.name + 
    						'.init() Failed to get GPU location of attribute a_Pos1');
    return -1;	// error exit.
  }
  // this.a_ColorLoc = gl.getAttribLocation(this.shaderLoc, 'a_Color');
  // if(this.a_ColorLoc < 0) {
  //   console.log(this.constructor.name + 
  //   						'.init() failed to get the GPU location of attribute a_Color');
  //   return -1;	// error exit.
  // }
 	this.a_NormLoc = gl.getAttribLocation(this.shaderLoc, 'a_Norm');
  if(this.a_NormLoc < 0) {
    console.log(this.constructor.name + 
    						'.init() failed to get the GPU location of attribute a_Norm');
    return -1;	// error exit.
  }
  // c2) Find All Uniforms:-----------------------------------------------------
  //Get GPU storage location for each uniform var used in our shader programs: 
 this.u_ModelMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMatrix');
  if (!this.u_ModelMatrixLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_ModelMatrix uniform');
    return;
  }
  this.u_MvpMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_MvpMatrix');
  if (!this.u_MvpMatrixLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_MvpMatrix uniform');
    return;
  }
  this.u_NormalMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_NormalMatrix');
  if (!this.u_NormalMatrixLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_NormalMatrix uniform');
    return;
  }
  this.u_IaLoc = gl.getUniformLocation(this.shaderLoc, 'u_Ia');
  if (!this.u_IaLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_Ia uniform');
    return;
  }
  this.u_IdLoc = gl.getUniformLocation(this.shaderLoc, 'u_Id');
  if (!this.u_IdLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_Id uniform');
    return;
  }
  this.u_IsLoc = gl.getUniformLocation(this.shaderLoc, 'u_Is');
  if (!this.u_IsLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_Is uniform');
    return;
  }
  this.u_KaLoc = gl.getUniformLocation(this.shaderLoc, 'u_Ka');
  if (!this.u_KaLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_Ka uniform');
    return;
  }
  this.u_KdLoc = gl.getUniformLocation(this.shaderLoc, 'u_Kd');
  if (!this.u_KdLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_Kd uniform');
    return;
  }
  this.u_KsLoc = gl.getUniformLocation(this.shaderLoc, 'u_Ks');
  if (!this.u_KsLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_Ks uniform');
    return;
  }
  this.u_SeLoc = gl.getUniformLocation(this.shaderLoc, 'u_Se');
  if (!this.u_SeLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_Se uniform');
    return;
  }
  this.u_isBlinnLoc = gl.getUniformLocation(this.shaderLoc, 'u_isBlinn');
  if (!this.u_isBlinnLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_isBlinn uniform');
    return;
  }

  this.u_VLoc = gl.getUniformLocation(this.shaderLoc, 'u_V');
  if (!this.u_VLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_V uniform');
    return;
  }
  this.u_LightLoc = gl.getUniformLocation(this.shaderLoc, 'u_Light');
  if (!this.u_LightLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_Light uniform');
    return;
  }

  this.u_Light.elements[0] = 0.0;
  this.u_Light.elements[1] = 0.0;
  this.u_Light.elements[2] = 5.0;
}

VBObox1.prototype.switchToMe = function () {
//==============================================================================
// Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)
//
// We only do this AFTER we called the init() function, which does the one-time-
// only setup tasks to put our VBObox contents into GPU memory.  !SURPRISE!
// even then, you are STILL not ready to draw our VBObox's contents onscreen!
// We must also first complete these steps:
//  a) tell the GPU to use our VBObox's shader program (already in GPU memory),
//  b) tell the GPU to use our VBObox's VBO  (already in GPU memory),
//  c) tell the GPU to connect the shader program's attributes to that VBO.

// a) select our shader program:
  gl.useProgram(this.shaderLoc);	
//		Each call to useProgram() selects a shader program from the GPU memory,
// but that's all -- it does nothing else!  Any previously used shader program's 
// connections to attributes and uniforms are now invalid, and thus we must now
// establish new connections between our shader program's attributes and the VBO
// we wish to use.  
  
// b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
//  instead connect to our own already-created-&-filled VBO.  This new VBO can 
//    supply values to use as attributes in our newly-selected shader program:
	gl.bindBuffer(gl.ARRAY_BUFFER,	    // GLenum 'target' for this GPU buffer 
										this.vboLoc);			// the ID# the GPU uses for our VBO.

// c) connect our newly-bound VBO to supply attribute variable values for each
// vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
// this sets up data paths from VBO to our shader units:
  // 	Here's how to use the almost-identical OpenGL version of this function:
	//		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )
  gl.vertexAttribPointer(
		this.a_Pos1Loc,//index == ID# for the attribute var in GLSL shader pgm;
		this.vboFcount_a_Pos1, // # of floats used by this attribute: 1,2,3 or 4?
		gl.FLOAT,		  // type == what data type did we use for those numbers?
		false,				// isNormalized == are these fixed-point values that we need
									//									normalize before use? true or false
		this.vboStride,// Stride == #bytes we must skip in the VBO to move from the
		              // stored attrib for this vertex to the same stored attrib
		              //  for the next vertex in our VBO.  This is usually the 
									// number of bytes used to store one complete vertex.  If set 
									// to zero, the GPU gets attribute values sequentially from 
									// VBO, starting at 'Offset'.	
									// (Our vertex size in bytes: 4 floats for pos + 3 for color)
		this.vboOffset_a_Pos1);						
		              // Offset == how many bytes from START of buffer to the first
  								// value we will actually use?  (we start with position).
  gl.vertexAttribPointer(this.a_NormLoc, this.vboFcount_a_Norm,
                         gl.FLOAT, false, 
  						           this.vboStride,  this.vboOffset_a_Norm);
  //-- Enable this assignment of the attribute to its' VBO source:
  gl.enableVertexAttribArray(this.a_Pos1Loc);
  // gl.enableVertexAttribArray(this.a_ColorLoc);
  gl.enableVertexAttribArray(this.a_NormLoc);
}

VBObox1.prototype.isReady = function() {
//==============================================================================
// Returns 'true' if our WebGL rendering context ('gl') is ready to render using
// this objects VBO and shader program; else return false.
// see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter

var isOK = true;

  if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
    console.log(this.constructor.name + 
    						'.isReady() false: shader program at this.shaderLoc not in use!');
    isOK = false;
  }
  if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
      console.log(this.constructor.name + 
  						'.isReady() false: vbo at this.vboLoc not in use!');
    isOK = false;
  }
  return isOK;
}

VBObox1.prototype.adjust = function() {
//==============================================================================
// Update the GPU to newer, current values we now store for 'uniform' vars on 
// the GPU; and (if needed) update each attribute's stride and offset in VBO.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.adjust() call you needed to call this.switchToMe()!!');
  }

  this.updateNormal();
  this.updateMvp();

  //Update color values
  this.u_Ia.elements[0] = ambientR;
  this.u_Ia.elements[1] = ambientG;
  this.u_Ia.elements[2] = ambientB;
  this.u_Id.elements[0] = diffuseR;
  this.u_Id.elements[1] = diffuseG;
  this.u_Id.elements[2] = diffuseB;
  this.u_Is.elements[0] = specularR;
  this.u_Is.elements[1] = specularG;
  this.u_Is.elements[2] = specularB;

  this.u_Ka = ambientRef;
  this.u_Kd = diffuseRef;
  this.u_Ks = specularRef;
  this.u_Se = shinyness;

  this.u_isBlinn = isBlinn;

  this.u_V.elements[0] = eye_x;
  this.u_V.elements[1] = eye_y;
  this.u_V.elements[2] = eye_z;

  this.u_Light.elements[0] = lightX;
  this.u_Light.elements[1] = lightY;
  this.u_Light.elements[2] = lightZ;

  // this.ModelMatrix.setRotate(g_angleNow1, 0, 0, 1);	// -spin drawing axes,

  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	
  										false, 										
  										this.ModelMatrix.elements);	
  gl.uniformMatrix4fv(this.u_MvpMatrixLoc,	
                      false, 										
                      this.MvpMatrix.elements);	
  gl.uniformMatrix4fv(this.u_NormalMatrixLoc,	
                      false, 										
                      this.NormalMatrix.elements);	

  // PASS IN ILLUMINATION COLOR VALUES
  gl.uniform3f(this.u_IdLoc, this.u_Id.elements[0], this.u_Id.elements[1], this.u_Id.elements[2]);
  gl.uniform3f(this.u_IaLoc, this.u_Ia.elements[0], this.u_Ia.elements[1], this.u_Ia.elements[2]);
  gl.uniform3f(this.u_IsLoc, this.u_Is.elements[0], this.u_Is.elements[1], this.u_Is.elements[2]);
  gl.uniform1f(this.u_KaLoc, this.u_Ka);
  gl.uniform1f(this.u_KdLoc, this.u_Kd);
  gl.uniform1f(this.u_KsLoc, this.u_Ks);
  gl.uniform1f(this.u_SeLoc, this.u_Se);
  gl.uniform1f(this.u_isBlinnLoc, this.u_isBlinn);

  gl.uniform3f(this.u_VLoc, this.u_V.elements[0], this.u_V.elements[1], this.u_V.elements[2]);
  gl.uniform3f(this.u_LightLoc, this.u_Light.elements[0], this.u_Light.elements[1], this.u_Light.elements[2]);
}

VBObox1.prototype.draw = function() {
//=============================================================================
// Send commands to GPU to select and render current VBObox contents.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.draw() call you needed to call this.switchToMe()!!');
  }
  // // Adjust values for our uniforms,
  this.ModelMatrix.setIdentity();
  this.NormalMatrix.setIdentity();
  this.MvpMatrix.setIdentity();
  this.updateNormal();

  // //Model Matrix manipulation

  this.ModelMatrix.rotate(g_angleNow1, 0, 0, 1);


  gl.drawArrays(gl.TRIANGLES, 0, this.vboVerts);
  this.updateNormal();
  this.updateMvp();

  //Editor's note -- adding the push() and pop() calls halts the sphere rotation. Need to debug.

}

VBObox1.prototype.updateMvp = function() {
  // this.ModelMatrix.setIdentity();
  this.MvpMatrix.set(g_projAll);
  this.MvpMatrix.concat(g_viewAll);
  this.MvpMatrix.concat(this.ModelMatrix);
}

VBObox1.prototype.updateNormal = function() {
  this.NormalMatrix.setInverseOf(this.ModelMatrix);
  this.NormalMatrix.transpose();
}


VBObox1.prototype.reload = function() {
//=============================================================================
// Over-write current values in the GPU for our already-created VBO: use 
// gl.bufferSubData() call to re-transfer some or all of our Float32Array 
// contents to our VBO without changing any GPU memory allocations.

 gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
                  0,                  // byte offset to where data replacement
                                      // begins in the VBO.
 					 				this.vboContents);   // the JS source-data array used to fill VBO
}

/*
VBObox1.prototype.empty = function() {
//=============================================================================
// Remove/release all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  However, make sure this step is reversible by a call to 
// 'restoreMe()': be sure to retain all our Float32Array data, all values for 
// uniforms, all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}

VBObox1.prototype.restore = function() {
//=============================================================================
// Replace/restore all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
// all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}
*/

//=============================================================================
//=============================================================================
function VBObox2() {
//=============================================================================
//=============================================================================
// CONSTRUCTOR for one re-usable 'VBObox2' object that holds all data and fcns
// needed to render vertices from one Vertex Buffer Object (VBO) using one 
// separate shader program (a vertex-shader & fragment-shader pair) and one
// set of 'uniform' variables.

// Constructor goal: 
// Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
// written into code) in all other VBObox functions. Keeping all these (initial)
// values here, in this one coonstrutor function, ensures we can change them 
// easily WITHOUT disrupting any other code, ever!
  
	this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
 `precision highp float;				// req'd in OpenGL ES if we use 'float'
  //
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_MvpMatrix;
  uniform mat4 u_NormalMatrix;

  uniform vec3 u_Kd;
  uniform vec3 u_Ka;
  uniform vec3 u_Ks;

  attribute vec4 a_Normal;
  attribute vec4 a_Position;
  attribute vec3 a_Color;
  attribute float a_PtSize; 

  varying vec3 v_Normal;
  varying vec4 v_Position;
  varying vec3 v_Kd;
  varying vec3 v_Ka;
  varying vec3 v_Ks;

  //
  void main() {
    vec4 worldPosn = u_ModelMatrix * a_Position;

    gl_Position = u_MvpMatrix * a_Position;

    vec4 temp = u_ModelMatrix * vec4(0.0, 0.0, 0.0, 0.0);

    v_Kd = u_Kd;
    v_Ka = u_Ka;
    v_Ks = u_Ks;

    // v_Normal = u_NormalMatrix * a_Normal + (0.0*temp);
    v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));
    v_Position = worldPosn;
   }`;

	this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
 `precision mediump float;

  uniform vec3 u_eyePosWorld;
  uniform vec3 u_lightPosWorld;
  uniform float u_isBlinn;
  uniform float u_Se;
  uniform float u_DRef;
  uniform float u_ARef;
  uniform float u_SRef;

  varying vec3 v_Kd;
  varying vec3 v_Ka;
  varying vec3 v_Ks;

  varying vec3 v_Normal;
  varying vec4 v_Position;

  void main() {
    vec3 normal = normalize(v_Normal);
    vec3 lightDirection = normalize(u_lightPosWorld - v_Position.xyz);
    vec3 eyeDirection = normalize(u_eyePosWorld - v_Position.xyz); 

    float nDotL = max(dot(lightDirection, normal), 0.0); 
    vec3 H = normalize(lightDirection + eyeDirection); 
    float nDotH = max(dot(H, normal), 0.0); 

    float dist = distance(eyeDirection, v_Position.xyz);
    // float attDenom = 0.5 + 0.1*dist + 0.1*pow(dist, 2.0);
    // float att = 1.0 / attDenom;
    float att = 1.0;

    vec3 diffuse = v_Kd * u_DRef * nDotL * att;
    vec3 ambient = v_Ka * u_ARef;

    if (u_isBlinn == 0.0) {
      vec3 R = reflect(-lightDirection, normal);
      float rDotV = dot(R, eyeDirection);
      vec3 specular = v_Ks*u_SRef*att*pow(rDotV, u_Se)*sqrt(nDotL);
      gl_FragColor = vec4(diffuse + ambient + specular, 1.0);
    } else {
      vec3 specular = v_Ks*u_SRef*att*pow(nDotH, u_Se);
      gl_FragColor = vec4(diffuse + ambient + specular, 1.0);
    }
  }`;

	this.vboContents = makeSphere();

	this.vboVerts = 960;							// # of vertices held in 'vboContents' array;
	this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;
	                              // bytes req'd by 1 vboContents array element;
																// (why? used to compute stride and offset 
																// in bytes for vertexAttribPointer() calls)
  this.vboBytes = this.vboContents.length * this.FSIZE;               
                                // (#  of floats in vboContents array) * 
                                // (# of bytes/float).
	this.vboStride = this.vboBytes / this.vboVerts;     
	                              // From any attrib in a given vertex, 
	                              // move forward by 'vboStride' bytes to arrive 
	                              // at the same attrib for the next vertex. 
	                              // (== # of bytes used to store one vertex) 
	                              
	            //----------------------Attribute sizes
  this.vboFcount_a_Position = 4;  // # of floats in the VBO needed to store the
                                // attribute named a_Position (4: x,y,z,w values)
  this.vboFcount_a_Normal = 3;   // # of floats for this attrib 
               //----------------------Attribute offsets
	this.vboOffset_a_Position = 0;   
  this.vboOffset_a_Normal = (this.vboFcount_a_Position) * this.FSIZE; 
                                
	            //-----------------------GPU memory locations:
	this.vboLoc;									// GPU Location for Vertex Buffer Object, 
	                              // returned by gl.createBuffer() function call
	this.shaderLoc;								// GPU Location for compiled Shader-program  
	                            	// set by compile/link of VERT_SRC and FRAG_SRC.
								          //------Attribute locations in our shaders:
	this.a_PositionLoc;							// GPU location: shader 'a_Position' attribute
	
	            //---------------------- Uniform locations &values in our shaders
	this.ModelMatrix = new Matrix4();	// Transforms CVV axes to model axes.
  this.MvpMatrix = new Matrix4();
  this.NormalMatrix = new Matrix4();
	this.u_ModelMatrixLoc;						// GPU location for u_ModelMat uniform
  this.u_MvpMatrixLoc;
  this.u_NormalMatrixLoc;

  this.eyePosWorld = new Vector3();
  this.lightPosWorld = new Vector3();
  this.u_eyePosWorldLoc;
  this.u_lightPosWorldLoc;

  this.u_isBlinn = isBlinn;
  this.u_Se = shinyness;
  this.u_isBlinnLoc;
  this.u_SeLoc;

  this.Kd = new Vector3();
  this.Ka = new Vector3();
  this.Ks = new Vector3();
  this.u_KdLoc;
  this.u_KaLoc;
  this.u_KsLoc;
  this.u_DRefLoc;
  this.u_ARefLoc;
  this.u_SRefLoc;
};


VBObox2.prototype.init = function() {
//=============================================================================
// Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
// kept in this VBObox. (This function usually called only once, within main()).
// Specifically:
// a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
//  executable 'program' stored and ready to use inside the GPU.  
// b) create a new VBO object in GPU memory and fill it by transferring in all
//  the vertex data held in our Float32array member 'VBOcontents'. 
// c) Find & save the GPU location of all our shaders' attribute-variables and 
//  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
// 
// CAREFUL!  before you can draw pictures using this VBObox contents, 
//  you must call this VBObox object's switchToMe() function too!

  // a) Compile,link,upload shaders---------------------------------------------
	this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
	if (!this.shaderLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create executable Shaders on the GPU. Bye!');
    return;
  }
  // CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
  //  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}

	gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())

  // b) Create VBO on GPU, fill it----------------------------------------------
	this.vboLoc = gl.createBuffer();	
  if (!this.vboLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create VBO in GPU. Bye!'); 
    return;
  }
  // Specify the purpose of our newly-created VBO.  Your choices are:
  //	== "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
  // (positions, colors, normals, etc), or 
  //	== "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
  // that each select one vertex from a vertex array stored in another VBO.
  gl.bindBuffer(gl.ARRAY_BUFFER,	    // GLenum 'target' for this GPU buffer 
  								this.vboLoc);				// the ID# the GPU uses for this buffer.

  // Fill the GPU's newly-created VBO object with the vertex data we stored in
  //  our 'vboContents' member (JavaScript Float32Array object).
  //  (Recall gl.bufferData() will evoke GPU's memory allocation & managemt: use 
  //		gl.bufferSubData() to modify VBO contents without changing VBO size)
  gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
 					 				this.vboContents, 		// JavaScript Float32Array
  							 	gl.STATIC_DRAW);			// Usage hint.
  //	The 'hint' helps GPU allocate its shared memory for best speed & efficiency
  //	(see OpenGL ES specification for more info).  Your choices are:
  //		--STATIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents rarely or never change.
  //		--DYNAMIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents may change often as our program runs.
  //		--STREAM_DRAW is for vertex buffers that are rendered a small number of 
  // 			times and then discarded; for rapidly supplied & consumed VBOs.

  // c1) Find All Attributes:---------------------------------------------------
  //  Find & save the GPU location of all our shaders' attribute-variables and 
  //  uniform-variables (for switchToMe(), adjust(), draw(), reload(),etc.)
  this.a_PositionLoc = gl.getAttribLocation(this.shaderLoc, 'a_Position');
  if(this.a_PositionLoc < 0) {
    console.log(this.constructor.name + 
    						'.init() Failed to get GPU location of attribute a_Position');
    return -1;	// error exit.
  }
  this.a_NormalLoc = gl.getAttribLocation(this.shaderLoc, 'a_Normal');
  if(this.a_NormalLoc < 0) {
    console.log(this.constructor.name + 
    						'.init() Failed to get GPU location of attribute a_Normal');
    return -1;	// error exit.
  }
  // c2) Find All Uniforms:-----------------------------------------------------
  //Get GPU storage location for each uniform var used in our shader programs: 
 this.u_ModelMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMatrix');
  if (!this.u_ModelMatrixLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_ModelMatrix uniform');
    return;
  }
  this.u_MvpMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_MvpMatrix');
  if (!this.u_MvpMatrixLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_MvpMatrix uniform');
    return;
  }
  this.u_NormalMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_NormalMatrix');
  if (!this.u_NormalMatrixLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_NormalMatrix uniform');
    return;
  }
  this.u_eyePosWorldLoc = gl.getUniformLocation(this.shaderLoc, 'u_eyePosWorld');
  if (!this.u_eyePosWorldLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_eyePosWorld uniform');
    return;
  }
  this.u_lightPosWorldLoc = gl.getUniformLocation(this.shaderLoc, 'u_lightPosWorld');
  if (!this.u_lightPosWorldLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_lightPosWorld uniform');
    return;
  }
  this.u_isBlinnLoc = gl.getUniformLocation(this.shaderLoc, 'u_isBlinn');
  if (!this.u_isBlinnLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_isBlinn uniform');
    return;
  }
  this.u_SeLoc = gl.getUniformLocation(this.shaderLoc, 'u_Se');
  if (!this.u_SeLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_Se uniform');
    return;
  }

  this.u_KdLoc = gl.getUniformLocation(this.shaderLoc, 'u_Kd');
  if (!this.u_KdLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_Kd uniform');
    return;
  }
  this.u_KaLoc = gl.getUniformLocation(this.shaderLoc, 'u_Ka');
  if (!this.u_KaLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_Ka uniform');
    return;
  }
  this.u_KsLoc = gl.getUniformLocation(this.shaderLoc, 'u_Ks');
  if (!this.u_KsLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_Ks uniform');
    return;
  }
  this.u_DRefLoc = gl.getUniformLocation(this.shaderLoc, 'u_DRef');
  if (!this.u_DRefLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_DRef uniform');
    return;
  }
  this.u_ARefLoc = gl.getUniformLocation(this.shaderLoc, 'u_ARef');
  if (!this.u_ARefLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_ARef uniform');
    return;
  }
  this.u_SRefLoc = gl.getUniformLocation(this.shaderLoc, 'u_SRef');
  if (!this.u_SRefLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_SRef uniform');
    return;
  }
}

VBObox2.prototype.switchToMe = function() {
//==============================================================================
// Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)
//
// We only do this AFTER we called the init() function, which does the one-time-
// only setup tasks to put our VBObox contents into GPU memory.  !SURPRISE!
// even then, you are STILL not ready to draw our VBObox's contents onscreen!
// We must also first complete these steps:
//  a) tell the GPU to use our VBObox's shader program (already in GPU memory),
//  b) tell the GPU to use our VBObox's VBO  (already in GPU memory),
//  c) tell the GPU to connect the shader program's attributes to that VBO.

// a) select our shader program:
  gl.useProgram(this.shaderLoc);
//		Each call to useProgram() selects a shader program from the GPU memory,
// but that's all -- it does nothing else!  Any previously used shader program's 
// connections to attributes and uniforms are now invalid, and thus we must now
// establish new connections between our shader program's attributes and the VBO
// we wish to use.  
  
// b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
//  instead connect to our own already-created-&-filled VBO.  This new VBO can 
//    supply values to use as attributes in our newly-selected shader program:
	gl.bindBuffer(gl.ARRAY_BUFFER,	    // GLenum 'target' for this GPU buffer 
										this.vboLoc);			// the ID# the GPU uses for our VBO.

// c) connect our newly-bound VBO to supply attribute variable values for each
// vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
// this sets up data paths from VBO to our shader units:
  // 	Here's how to use the almost-identical OpenGL version of this function:
	//		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )
  gl.vertexAttribPointer(
		this.a_PositionLoc,//index == ID# for the attribute var in GLSL shader pgm;
		this.vboFcount_a_Position, // # of floats used by this attribute: 1,2,3 or 4?
		gl.FLOAT,		  // type == what data type did we use for those numbers?
		false,				// isNormalized == are these fixed-point values that we need
									//									normalize before use? true or false
		this.vboStride,// Stride == #bytes we must skip in the VBO to move from the
		              // stored attrib for this vertex to the same stored attrib
		              //  for the next vertex in our VBO.  This is usually the 
									// number of bytes used to store one complete vertex.  If set 
									// to zero, the GPU gets attribute values sequentially from 
									// VBO, starting at 'Offset'.	 (Our vertex size in bytes: 
									// 4 floats for Position + 3 for Color + 1 for PtSize = 8).
		this.vboOffset_a_Position);	
		              // Offset == how many bytes from START of buffer to the first
  								// value we will actually use?  (We start with a_Position).

  gl.vertexAttribPointer(this.a_NormalLoc, this.vboFcount_a_Normal,
              gl.FLOAT, false, 
              this.vboStride,  this.vboOffset_a_Normal);
// --Enable this assignment of each of these attributes to its' VBO source:
  gl.enableVertexAttribArray(this.a_PositionLoc);
  gl.enableVertexAttribArray(this.a_NormalLoc);
}

VBObox2.prototype.isReady = function() {
//==============================================================================
// Returns 'true' if our WebGL rendering context ('gl') is ready to render using
// this objects VBO and shader program; else return false.
// see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter

var isOK = true;
  if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
    console.log(this.constructor.name + 
    						'.isReady() false: shader program at this.shaderLoc not in use!');
    isOK = false;
  }
  if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
      console.log(this.constructor.name + 
  						'.isReady() false: vbo at this.vboLoc not in use!');
    isOK = false;
  }
  return isOK;
}

VBObox2.prototype.adjust = function() {
//=============================================================================
// Update the GPU to newer, current values we now store for 'uniform' vars on 
// the GPU; and (if needed) update the VBO's contents, and (if needed) each 
// attribute's stride and offset in VBO.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.adjust() call you needed to call this.switchToMe()!!');
  }
  this.updateMvp();
  this.updateNormal();

  this.Kd.elements[0] = diffuseR;
  this.Kd.elements[1] = diffuseG;
  this.Kd.elements[2] = diffuseB;
  this.Ka.elements[0] = ambientR;
  this.Ka.elements[1] = ambientG;
  this.Ka.elements[2] = ambientB;
  this.Ks.elements[0] = specularR;
  this.Ks.elements[1] = specularG;
  this.Ks.elements[2] = specularB;

  this.eyePosWorld.elements[0] = eye_x;
  this.eyePosWorld.elements[1] = eye_y;
  this.eyePosWorld.elements[2] = eye_z;

  this.lightPosWorld.elements[0] = lightX;
  this.lightPosWorld.elements[1] = lightY;
  this.lightPosWorld.elements[2] = lightZ;

  this.u_Se = shinyness;
  this.u_isBlinn = isBlinn;
	// Adjust values for our uniforms;-------------------------------------------
  // this.ModelMatrix.translate(-0.3, 0.0, 0.0); //Shift origin leftwards,
  // this.ModelMatrix.rotate(g_angleNow1, 0, 0, 1);	// -spin drawing axes,
  // this.ModelMatrix.scale(1.5, 1.5, 1.5);

  //  Transfer new uniforms' values to the GPU:--------------------------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	  // GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_MvpMatrixLoc,	  // GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.MvpMatrix.elements);	// send data from Javascript.
  gl.uniformMatrix4fv(this.u_NormalMatrixLoc,	  // GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.NormalMatrix.elements);	// send data from Javascript.

  gl.uniform3f(this.u_KdLoc, this.Kd.elements[0], this.Kd.elements[1], this.Kd.elements[2]);
  gl.uniform3f(this.u_KaLoc, this.Ka.elements[0], this.Ka.elements[1], this.Ka.elements[2]);
  gl.uniform3f(this.u_KsLoc, this.Ks.elements[0], this.Ks.elements[1], this.Ks.elements[2]);

  gl.uniform3f(this.u_lightPosWorldLoc, this.lightPosWorld.elements[0], this.lightPosWorld.elements[1], this.lightPosWorld.elements[2]);
  gl.uniform3f(this.u_eyePosWorldLoc, this.eyePosWorld.elements[0], this.eyePosWorld.elements[1], this.eyePosWorld.elements[2]);
  
  gl.uniform1f(this.u_isBlinnLoc, this.u_isBlinn);
  gl.uniform1f(this.u_SeLoc, this.u_Se);
  gl.uniform1f(this.u_DRefLoc, diffuseRef);
  gl.uniform1f(this.u_ARefLoc, ambientRef);
  gl.uniform1f(this.u_SRefLoc, specularRef);

}

VBObox2.prototype.draw = function() {
//=============================================================================
// Render current VBObox contents.
  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.draw() call you needed to call this.switchToMe()!!');
  }

  this.ModelMatrix.setIdentity();
  this.NormalMatrix.setIdentity();
  this.MvpMatrix.setIdentity();
  this.updateNormal();

  // //Model Matrix manipulation
  this.ModelMatrix.rotate(g_angleNow1, 0, 0, 1);
  gl.drawArrays(gl.TRIANGLES, 0, this.vboVerts);

  // this.NormalMatrix = this.ModelMatrix.transpose();
  this.updateNormal();
  this.updateMvp();
}

VBObox2.prototype.updateMvp = function() {
  // this.ModelMatrix.setIdentity();
  this.MvpMatrix.set(g_projAll);
  this.MvpMatrix.concat(g_viewAll);
  this.MvpMatrix.concat(this.ModelMatrix);
}

VBObox2.prototype.updateNormal = function() {
  // this.NormalMatrix = this.ModelMatrix.transpose();
  this.NormalMatrix.setInverseOf(this.ModelMatrix);
  this.NormalMatrix.transpose();
}

VBObox2.prototype.reload = function() {
//=============================================================================
// Over-write current values in the GPU for our already-created VBO: use 
// gl.bufferSubData() call to re-transfer some or all of our Float32Array 
// 'vboContents' to our VBO, but without changing any GPU memory allocations.
  											
 gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
                  0,                  // byte offset to where data replacement
                                      // begins in the VBO.
 					 				this.vboContents);   // the JS source-data array used to fill VBO
}
/*
VBObox2.prototype.empty = function() {
//=============================================================================
// Remove/release all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  However, make sure this step is reversible by a call to 
// 'restoreMe()': be sure to retain all our Float32Array data, all values for 
// uniforms, all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}

VBObox2.prototype.restore = function() {
//=============================================================================
// Replace/restore all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
// all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}
*/

//=============================================================================
//=========================Shape Drawing Functions============================
//=============================================================================

//------------------------Functions for filling VBO---------------------------
// Function for generating a green grid across the XY plane. Written by Prof. Jack Tumblin.
function makeGroundGrid() {
	// Create a list of vertices that create a large grid of lines in the x,y plane
	// centered at x=y=z=0.  Draw this shape using the GL_LINES primitive.

		var xcount = 100;			// # of lines to draw in x,y to make the grid.
		var ycount = 100;
		var xymax	= 50.0;			// grid size; extends to cover +/-xymax in x and y.
		var xColr = new Float32Array([1.0, 1.0, 0.3]);	// bright yellow
		var yColr = new Float32Array([0.5, 1.0, 0.5]);	// bright green.
		var floatsPerVertex = 7; // number of floats in a given vertex; x, y, z, w, r, g, b

		// Create an (global) array to hold this ground-plane's vertices:
		gndVerts = new Float32Array(floatsPerVertex*2*(xcount+ycount));
							// draw a grid made of xcount+ycount lines; 2 vertices per line.

		var xgap = xymax/(xcount-1);		// HALF-spacing between lines in x,y;
		var ygap = xymax/(ycount-1);		// (why half? because v==(0line number/2))

		// First, step thru x values as we make vertical lines of constant-x:
		for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex) {
			if(v%2==0) {	// put even-numbered vertices at (xnow, -xymax, 0)
				gndVerts[j  ] = -xymax + (v  )*xgap;	// x
				gndVerts[j+1] = -xymax;								// y
				gndVerts[j+2] = 0.0;									// z
				gndVerts[j+3] = 1.0;									// w.
			}
			else {				// put odd-numbered vertices at (xnow, +xymax, 0).
				gndVerts[j  ] = -xymax + (v-1)*xgap;	// x
				gndVerts[j+1] = xymax;								// y
				gndVerts[j+2] = 0.0;									// z
				gndVerts[j+3] = 1.0;									// w.
			}
			gndVerts[j+4] = xColr[0];			// red
			gndVerts[j+5] = xColr[1];			// grn
			gndVerts[j+6] = xColr[2];			// blu
		}
		// Second, step thru y values as wqe make horizontal lines of constant-y:
		// (don't re-initialize j--we're adding more vertices to the array)
		for(v=0; v<2*ycount; v++, j+= floatsPerVertex) {
			if(v%2==0) {		// put even-numbered vertices at (-xymax, ynow, 0)
				gndVerts[j  ] = -xymax;								// x
				gndVerts[j+1] = -xymax + (v  )*ygap;	// y
				gndVerts[j+2] = 0.0;									// z
				gndVerts[j+3] = 1.0;									// w.
			}
			else {					// put odd-numbered vertices at (+xymax, ynow, 0).
				gndVerts[j  ] = xymax;								// x
				gndVerts[j+1] = -xymax + (v-1)*ygap;	// y
				gndVerts[j+2] = 0.0;									// z
				gndVerts[j+3] = 1.0;									// w.
			}
			gndVerts[j+4] = yColr[0];			// red
			gndVerts[j+5] = yColr[1];			// grn
			gndVerts[j+6] = yColr[2];			// blu
		}
}

// Function for drawing the X-Y-Z axes. Written by Prof. Jack Tumblin
function makeAxes() {
  myAxes = new Float32Array([
		// Drawing Axes: Draw them using gl.LINES drawing primitive;
     	// +x axis RED; +y axis GREEN; +z axis BLUE; origin: GRAY
		 0.0,  0.0,  0.0, 1.0,		0.3,  0.3,  0.3,	// X axis line (origin: gray)
		 1.3,  0.0,  0.0, 1.0,		1.0,  0.3,  0.3,	// 						 (endpoint: red)

		 0.0,  0.0,  0.0, 1.0,    0.3,  0.3,  0.3,	// Y axis line (origin: white)
		 0.0,  1.3,  0.0, 1.0,		0.3,  1.0,  0.3,	//						 (endpoint: green)

		 0.0,  0.0,  0.0, 1.0,		0.3,  0.3,  0.3,	// Z axis line (origin:white)
		 0.0,  0.0,  1.3, 1.0,		0.3,  0.3,  1.0,	//						 (endpoint: blue)
  ]);
  return myAxes;
}
// Other Shapes found in Shapes-Lib.js

//------------------Functions for actually drawing shapes-----------------------
// World Box:
function drawGrid() {
  // gl.uniformMatrix4fv(this.u_ModelMatLoc,	false, this.ModelMat.elements);
	gl.drawArrays(gl.LINES, 0, gndVerts.length / 7);
}

function drawAxes() {
  // gl.uniformMatrix4fv(this.u_ModelMatLoc,	false, this.ModelMat.elements);
	gl.drawArrays(gl.LINES, gndVerts.length / 7, myAxes.length / 7);
}
