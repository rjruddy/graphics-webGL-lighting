// 2015.03.08   courtesy Alex Ayerdi
// 2016.02.22		J. Tumblin revised comments & return value names
// 2016.03.01		J. Tumblin added K_name member; added data members to hold
//							GPU's 'uniform' locations for its MatlT struct members;
//							added 'setMatl()' function to allow change of materials without
//							calling constructor (it discards GPU locations kept in uLoc_XX).
//------------------------------------------------------------------------------
// These emissive, ambient, diffuse, specular components were chosen for
// least-squares best-fit to measured BRDFs of actual material samples.
// (values copied from pg. 51, "Advanced Graphics Programming"
// Tom McReynolds, David Blythe Morgan-Kaufmann Publishers (c)2005).
//
// They demonstrate both the strengths and the weaknesses of Phong lighting: 
// if their appearance makes you ask "how could we do better than this?"
// then look into 'Cook-Torrance' shading methods, texture maps, bump maps, 
// and beyond.
//
// For each of our Phong Material Types, define names 
// that each get assigned a unique integer identifier:

var MATL_DEFAULT = 			"0";
var MATL_SILVER = 			"1";
var MATL_BLU_PLASTIC = 		"2";
var MATL_PINK_PLASTIC = 	"3";

/*
The code below defines a JavaScript material-describing object whose type we 
named 'Material'.  For example, to create a new 'Material' object named 
'myMatter', just call the constructor with the material you want:
 
  var myMatter = new Material(materialType);
	(where 'materialType' is one of the MATL_*** vars listed above)

Within the myMatter object, member variables hold all the material-describing 
values needed for Phong lighting:

For example: For ambient, diffuse, and specular reflectance:
	myMatter.K_ambi[0], myMatter.K_ambi[1], myMatter.K_ambi[2] == ambient R,G,B
	myMatter.K_diff[0], myMatter.K_diff[1], myMatter.K_diff[2] == diffuse R,G,B
	myMatter.K_spec[0], myMatter.K_spec[1], myMatter.K_spec[2] == specular R,G,B
For emissive terms (not a reflectance; added to light returned from surface):
	myMatter.K_emit[0], myMatter.K_emit[1], myMatter.K_emit[2] == emissive R,G,B
For shinyness exponent, which grows as specular highlights get smaller/sharper: :
	myMatter.K_shiny    (one single floating point value

Your JavaScript code can use Material objects to set 'uniform' values sent to 
GLSL shader programs.  For example, to set a 'uniform' for diffuse reflectance: 
'emissive' value of the material:

myMatter.setMatl(MATL_CHROME);			// set 'myMatter' for chrome-like material
gl.uniform3f(u_Kd, myMatter.K_diff[0], myMatter.K_diff[1], myMatter.K_diff[2]);

or more compactly:

							gl.uniform3fv(u_Kd, myMatter.K_diff.slice(0,4));

	// NOTE: the JavaScript array myMatter.K_diff has *4* elements, not 3, due to
	// 			the alpha value (opacity) that follows R,G,B.  Javascript array member
	//			function 'slice(0,4)' returns only elements 0,1,2 (the r,g,b values).

*/



function changeMatl(nuMatl) {
//==============================================================================
// Call this member function to change the Ke,Ka,Kd,Ks members of this object 
// to describe the material whose identifying number is 'nuMatl' (see list of
// these numbers and material names at the top of this file).
// This function DOES NOT CHANGE values of any of its uLoc_XX member variables.

	console.log('Called Material.setMatl( ', nuMatl,');'); 

	//  Set new values ONLY for material reflectances:
	switch(nuMatl)
	{
		case MATL_DEFAULT: // 0
			//change ambient, difuse, specular R, G, B, Ref
			//also change shinyness
			document.getElementById("ambientR").value = 0.1;
			document.getElementById("ambientG").value = 0.0;
			document.getElementById("ambientB").value = 0.0;
			document.getElementById("ambientRef").value = 1.0;

			document.getElementById("diffuseR").value = 1.0;
			document.getElementById("diffuseG").value = 0.0;
			document.getElementById("diffuseB").value = 0.0;
			document.getElementById("diffuseRef").value = 1.0;

			document.getElementById("specularR").value = 1.0;
			document.getElementById("specularG").value = 1.0;
			document.getElementById("specularB").value = 1.0;
			document.getElementById("specularRef").value = 1.0;
			document.getElementById("shinyness").value = 10.0;

			break;
		case MATL_SILVER: // 1
			document.getElementById("ambientR").value = 0.8;
			document.getElementById("ambientG").value = 0.8;
			document.getElementById("ambientB").value = 0.8;
			document.getElementById("ambientRef").value = 0.30;

			document.getElementById("diffuseR").value = 0.8;
			document.getElementById("diffuseG").value = 0.8;
			document.getElementById("diffuseB").value = 0.8;
			document.getElementById("diffuseRef").value = 0.1;

			document.getElementById("specularR").value = 0.8;
			document.getElementById("specularG").value = 0.8;
			document.getElementById("specularB").value = 0.8;
			document.getElementById("specularRef").value = 1.0;
			document.getElementById("shinyness").value = 1.0;

			break;
		case MATL_BLU_PLASTIC: // 2
			document.getElementById("ambientR").value = 0.0;
			document.getElementById("ambientG").value = 0.0;
			document.getElementById("ambientB").value = 0.3;
			document.getElementById("ambientRef").value = 1.0;

			document.getElementById("diffuseR").value = 0.0;
			document.getElementById("diffuseG").value = 0.0;
			document.getElementById("diffuseB").value = 1.0;
			document.getElementById("diffuseRef").value = 1.0;

			document.getElementById("specularR").value = 1.0;
			document.getElementById("specularG").value = 1.0;
			document.getElementById("specularB").value = 1.0;
			document.getElementById("specularRef").value = 1.0;
			document.getElementById("shinyness").value = 20.0;

			break;
		case MATL_PINK_PLASTIC: // 3
			document.getElementById("ambientR").value = 0.3;
			document.getElementById("ambientG").value = 0.0;
			document.getElementById("ambientB").value = 0.3;
			document.getElementById("ambientRef").value = 1.0;

			document.getElementById("diffuseR").value = 1.0;
			document.getElementById("diffuseG").value = 0.0;
			document.getElementById("diffuseB").value = 1.0;
			document.getElementById("diffuseRef").value = 1.0;

			document.getElementById("specularR").value = 1.0;
			document.getElementById("specularG").value = 1.0;
			document.getElementById("specularB").value = 1.0;
			document.getElementById("specularRef").value = 1.0;
			document.getElementById("shinyness").value = 20.0;

			break;
		default: //also 0
			document.getElementById("ambientR").value = 0.1;
			document.getElementById("ambientG").value = 0.0;
			document.getElementById("ambientB").value = 0.0;
			document.getElementById("ambientRef").value = 1.0;

			document.getElementById("diffuseR").value = 1.0;
			document.getElementById("diffuseG").value = 0.0;
			document.getElementById("diffuseB").value = 0.0;
			document.getElementById("diffuseRef").value = 1.0;

			document.getElementById("specularR").value = 1.0;
			document.getElementById("specularG").value = 1.0;
			document.getElementById("specularB").value = 1.0;
			document.getElementById("specularRef").value = 1.0;
			document.getElementById("shinyness").value = 10.0;
			break;
	}
	return this;
}
