const graphviz = require('graphviz');
const fs = require('fs')
const path = require('path')


const outdir = path.join(__dirname, 'generated')
if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir)
}

// Add node (ID: Hello)
// var n1 = g.addNode( "Hello", {"fillcolor" : "red"} );
// n1.set( "style", "filled" );
const shapeById = {
  User: 'plain',
  Github: 'circle',
  // ---
  DxPlatform: 'box',
  // ---
  BuildPlatform: 'egg',
  BuildDefinitionService: 'egg',
  BuildOutputService: 'egg',
  BuildRunService: 'egg',
  TriggeringService: 'egg',
  FalconBuild: 'egg',
  BazelBuild: 'egg',
  TC: 'egg',
  GCB: 'egg',
  TcAgent: 'egg',
  GcbAgent: 'egg',

  // --
  RolloutService: 'parallelogram',
  System: 'parallelogram',
  AWS: 'parallelogram',
  GoogleAppEngine: 'parallelogram',
  Production: 'parallelogram',

  // ---

  Lifecycle: 'house',
  Outlets: 'house',


  //

  ArtifactRegistry: 'cylinder'




}

function buildEdges(g, d, firstIsSource) {
  const set = new Set()
  d.forEach(curr => {
    curr.forEach(v => {
      if (set.has(v)) {
        return
      }

      set.add(v)
      const shape = shapeById[v] || 'oval'
      g.addNode(v, {shape})
    })
  })
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
  g.output('svg', `${outdir}/${filename}.svg`);  
}

draw("highlevel", [
  ["Outlets", "Production", "BuildPlatform"],
  ["Production", "System", "AWS", "GoogleAppEngine"],
  // ["BuildPlatform", "BazelBuild", "FalconBuild"],
  // ["BazelBuild", "GCB"],
  // ["FalconBuild", "TC"],
  // ["DxPlatform", "ArtifactRegistry"],
  ["BuildPlatform", "ArtifactRegistry"],
  ["User", "Github", "ArtifactRegistry", "Outlets"],
  // ["TC", "TcAgent"],
  // ["GCB", "GcbAgent"],
  ["Github", "BuildPlatform"]
], [
  ["DxPlatform", "BuildPlatform", "Production", "Outlets"], // "FalconBuild", "BazelBuild",  "GcbAgent", "TcAgent"
  ["ArtifactRegistry", "AWS", "System", "GoogleAppEngine"]
]);


draw("fine", [
  ["Lifecycle", "AppDefinitonService", "BuildRunService", "RolloutService"],
  ["RolloutService", "System", "AWS", "GoogleAppEngine", "BuildOutputService"],
  ["BuildOutputService", "ArtifactRegistry"],
  ["User", "Lifecycle", "Github"],
  ["Github", "TriggeringService"],
  ["TriggeringService", "FalconBuild"],
  ["FalconBuild", "BuildDefinitionService", "TC", "BuildRunService"],
  ["TC", "TcAgent"],
  ["TcAgent", "BuildOutputService"]
], [
  ["ArtifactRegistry", "AWS", "System", "GoogleAppEngine"]
]);

