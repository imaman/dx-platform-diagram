const graphviz = require('graphviz');

var g = graphviz.digraph("G");

// Add node (ID: Hello)
// var n1 = g.addNode( "Hello", {"fillcolor" : "red"} );
// n1.set( "style", "filled" );


var n1 = g.addNode("Outlets")

// Add node (ID: World)
var n2 = g.addNode("DxInfrasturcture");

// Add edge between the two nodes
var e = g.addEdge(n1, n2);
e.set( "color", "red" );






// console.log( g.to_dot() );


// Generate a PNG output
g.output( "png", "test01.png" );
