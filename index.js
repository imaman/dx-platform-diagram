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
  TimelineService: 'box',
  // ---
  BuildPlatform: 'egg',
  BuildOutputService: 'egg',
  BuildRunService: 'egg',
  TriggeringService: 'egg',
  FalconBuild: 'egg',
  BazelBuild: 'egg',
  BuildController: 'egg',
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
      const next = classify(v) || v
      if (next === v) {
        return v
      }
      v = next
    }
  }

  const vertices = new Set()

  if (!d) {
    throw new Error(`d=${JSON.stringify(d)}, shapebyid=${JSON.stringify(shapeById)}`)
  }
  d.forEach(curr => {
    curr.forEach(v => {
      v = resolve(v)
      if (vertices.has(v)) {
        return
      }

      vertices.add(v)
      const shape = shapeById[v]
      if (!shape) {
        throw new Error(`No shape found for "${v}"`)
      }
      g.addNode(v, {shape})
    })
  })

  const edges = new Set()
  d.forEach(curr => {
    curr.slice(1).forEach(n => {
      const from = resolve(curr[0])  
      const to = resolve(n)
      if (from === to) {
        return
      }
      const combined = JSON.stringify([from, to])
      if (edges.has(combined)) {
        return
      }
      edges.add(combined)
      const e = g.addEdge(from, to)
      e.set('color', 'red')
    })
  })  
}


function draw(filename, meta, outgoing, classify) {
  var g = graphviz.digraph("G");
  buildEdges(g, meta, outgoing, classify)
  g.output('svg', `${outdir}/${filename}.svg`);  
}


// draw("highlevel", shapeById, [
//   ["User", "Outlets", "Github", "ArtifactRegistry"],
//   ["Outlets", "Production", "BuildPlatform", "DxPlatform"],
//   ["BuildPlatform", "DxPlatform", "BuildEngine(s)", "ArtifactRegistry"],
//   ["Production", "DxPlatform", "CloudProviders", "BuildPlatform"],
//   ["CloudProviders", "ArtifactRegistry"],
//   ["BuildEngine(s)", "BuildPlatform"],
//   ["Github", "BuildPlatform"],
// ]);



const all = [
  ["User", "Lifecycle", "Github", "ArtifactRegistry"],
  ["Lifecycle", "AppDefinitonService", "BuildRunService", "RolloutService", "TimelineService"],
  ["RolloutService", "System", "AWS", "GAE", "BuildOutputService", "TimelineService"],
  ["BuildOutputService", "ArtifactRegistry"],
  ["Github", "TriggeringService"],
  ["TriggeringService", "BuildController"],
  ["BuildController", "BuildDefinitionService", "BuildRunService", "FalconBuild", "BazelBuild", "TimelineService"],
  ["BazelBuild", "GCB"],
  ["FalconBuild", "TC"],
  ["TC", "TcAgent"],
  ["GCB", "GcbAgent"],
  ["TcAgent", "BuildOutputService"],
  ["GcbAgent", "BuildOutputService"],
  ["AWS", "ArtifactRegistry"],
  ["System", "ArtifactRegistry"],
  ["GAE", "ArtifactRegistry"]
]


const classOf = {
  AWS: 'CloudProviders',
  AppDefinitonService: 'DxPlatform',
  ArtifactRegistry: null,
  BazelBuild: 'BuildPlatform',
  BuildDefinitionService: 'DxPlatform',
  BuildOutputService: 'BuildPlatform',
  BuildRunService: 'BuildPlatform',
  FalconBuild: 'BuildPlatform',
  GAE: 'CloudProviders',
  GCB: 'BuildEngine(s)',
  GcbAgent: 'BuildPlatform',
  TimelineService: 'DxPlatform',
  Github: null,
  Lifecycle: 'Outlets',
  RolloutService: 'Production',
  System: 'CloudProviders',
  TC: 'BuildEngine(s)',
  TcAgent: 'BuildPlatform',
  TriggeringService: 'BuildPlatform',
  BuildController: 'BuildPlatform',
  User: null
}


const set = new Set()
all.forEach(curr => curr.forEach(v => set.add(v)))

console.log([...set].sort().join('\n'))

draw("highlevel", shapeById, all, x => classOf[x])
draw("fine", shapeById, all);


