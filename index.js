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
  CloudProviders: 'circle',
  System: 'circle',
  AWS: 'circle',
  GAE: 'circle',
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
  "BuildEngine(s)": 'circle',
  TC: 'circle',
  GCB: 'circle',
  TcAgent: 'egg',
  GcbAgent: 'egg',

  // --
  RolloutService: 'parallelogram',
  Production: 'parallelogram',

  // ---

  Lifecycle: 'house',
  Outlets: 'house',


  //

  ArtifactRegistry: 'cylinder'




}

function buildEdges(g, shapeById, d, classify = x => x) {

  function resolve(v) {
    while (true) {
      const next = classify(v)
      if (next === v) {
        return v
      }
      v = next
    }
  }

  const set = new Set()

  if (!d) {
    throw new Error(`d=${JSON.stringify(d)}, shapebyid=${JSON.stringify(shapeById)}`)
  }
  d.forEach(curr => {
    curr.forEach(v => {
      v = resolve(v)
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
      const e = g.addEdge(resolve(curr[0]), resolve(n))
      e.set('color', 'red')
    })
  })  
}


function draw(filename, meta, outgoing, classify) {
  var g = graphviz.digraph("G");
  buildEdges(g, meta, outgoing, classify)
  g.output('svg', `${outdir}/${filename}.svg`);  
}


draw("highlevel", shapeById, [
  ["User", "Outlets", "Github", "ArtifactRegistry"],
  ["Outlets", "Production", "BuildPlatform", "DxPlatform"],
  ["BuildPlatform", "DxPlatform", "BuildEngine(s)", "ArtifactRegistry"],
  ["Production", "DxPlatform", "CloudProviders", "BuildPlatform"],
  ["CloudProviders", "ArtifactRegistry"],
  ["BuildEngine(s)", "BuildPlatform"],
  ["Github", "BuildPlatform"],
]);


draw("fine", shapeById, [
  ["Lifecycle", "AppDefinitonService", "BuildRunService", "RolloutService"],
  ["RolloutService", "System", "AWS", "GAE", "BuildOutputService"],
  ["BuildOutputService", "ArtifactRegistry"],
  ["User", "Lifecycle", "Github", "ArtifactRegistry"],
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
  ["GAE", "ArtifactRegistry"]
]);

