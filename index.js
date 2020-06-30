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
  AppDefinitonService: 'box',
  BuildDefinitionService: 'box',
  // ---
  BuildPlatform: 'egg',
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

function buildEdges(g, shapeById, d) {
  const set = new Set()
  d.forEach(curr => {
    curr.forEach(v => {
      if (set.has(v)) {
        return
      }

      set.add(v)
      const shape = shapeById[v]
      if (!shape) {
        throw new Error(`No shape found for "${v}"`)
      }
      g.addNode(v, {shape})
    })
  })
  d.forEach(curr => {
    curr.slice(1).forEach(n => {      
      const e = g.addEdge(curr[0], n)
      e.set('color', 'red')
    })
  })  
}


function draw(filename, meta, outgoing) {
  var g = graphviz.digraph("G");
  buildEdges(g, meta, outgoing, true)
  g.output('svg', `${outdir}/${filename}.svg`);  
}


draw("highlevel", shapeById, [
  ["Outlets", "Production", "BuildPlatform"],
  ["Production", "ArtifactRegistry"],
  // ["Production", "System", "AWS", "GoogleAppEngine"],
  // ["BuildPlatform", "BazelBuild", "FalconBuild"],
  // ["BazelBuild", "GCB"],
  // ["FalconBuild", "TC"],
  // ["DxPlatform", "ArtifactRegistry"],
  ["BuildPlatform", "ArtifactRegistry"],
  ["User", "Github", "ArtifactRegistry", "Outlets"],
  // ["TC", "TcAgent"],
  // ["GCB", "GcbAgent"],
  ["Github", "BuildPlatform"],
  ["BuildPlatform", "DxPlatform"],
  ["Production", "DxPlatform"],
  ["Outlets", "DxPlatform"], // "FalconBuild", "BazelBuild",  "GcbAgent", "TcAgent"
]);


draw("fine", shapeById, [
  ["Lifecycle", "AppDefinitonService", "BuildRunService", "RolloutService"],
  ["RolloutService", "System", "AWS", "GoogleAppEngine", "BuildOutputService"],
  ["BuildOutputService", "ArtifactRegistry"],
  ["User", "Lifecycle", "Github"],
  ["Github", "TriggeringService"],
  ["TriggeringService", "FalconBuild", "BazelBuild"],
  ["BazelBuild", "BuildDefinitionService", "GCB", "BuildRunService"],
  ["FalconBuild", "BuildDefinitionService", "TC", "BuildRunService"],
  ["TC", "TcAgent"],
  ["GCB", "GcbAgent"],
  ["TcAgent", "BuildOutputService"],
  ["GcbAgent", "BuildOutputService"],
  ["AWS", "ArtifactRegistry"],
  ["System", "ArtifactRegistry"],
  ["GoogleAppEngine", "ArtifactRegistry"]
]);

