const graphviz = require('graphviz');


// Add node (ID: Hello)
// var n1 = g.addNode( "Hello", {"fillcolor" : "red"} );
// n1.set( "style", "filled" );


function buildEdges(g, d, firstIsSource) {
  d.forEach(curr => {
    curr.slice(1).forEach(n => {      
      const e = firstIsSource ? g.addEdge(curr[0], n) : g.addEdge(n, curr[0])
      e.set('color', 'red')
    })
  })  
}


function draw(filename, outgoing, incoming) {
  var g = graphviz.digraph("G");
  buildEdges(g, outgoing, true)
  buildEdges(g, incoming, false)
  g.output('svg', `generated/${filename}.svg`);  
}

draw("highlevel", [
  ["Outlets", "Production", "BuildSupport"],
  ["Production", "System", "AWS", "GoogleAppEngine"],
  ["BuildSupport", "BazelBuild", "FalconBuild"],
  ["BazelBuild", "GCB"],
  ["FalconBuild", "TC"],
  ["DxInfrastructure", "ArtifactRegistry"],
  ["User", "Github", "ArtifactRegistry", "Outlets"]
], [
  ["DxInfrastructure", "BuildSupport", "Production", "Outlets", "FalconBuild", "BazelBuild"]
]);


draw("fine", [
  ["Lifecycle", "RolloutService", "DefinitionService"],
  ["RolloutService", "System", "AWS", "GoogleAppEngine", "BuildOutputService"],
  ["BuildOutputService", "ArtifactRegistry"],
  ["User", "Github", "ArtifactRegistry", "Lifecycle"]
], [
]);

