const graphviz = require('graphviz');
const fs = require('fs')
const path = require('path')


const outdir = path.join(__dirname, 'generated')
if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir)
}


function buildEdges(g, shapeById, d, blockClassifier, shapeClassifier) {

  function resolve(v, f) {
    while (true) {
      const next = f(v) || v
      if (next === v) {
        return v
      }
      v = next
    }
  }

  const vertices = new Set()
  d.forEach(curr => {
    curr.forEach(v => {
      v = resolve(v, blockClassifier)
      if (vertices.has(v)) {
        return
      }

      vertices.add(v)
      const shape = shapeById[resolve(v, shapeClassifier)]
      if (!shape) {
        throw new Error(`No shape found for "${v}"`)
      }
      g.addNode(v, {shape})
    })
  })

  const edges = new Set()
  d.forEach(curr => {
    curr.slice(1).forEach(n => {
      const from = resolve(curr[0], blockClassifier)  
      const to = resolve(n, blockClassifier)
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


function draw(filename, meta, outgoing, blockClassifier, shapeClassifier) {
  if (!blockClassifier) {
    throw new Error(`classify cannot be falsy`)
  }
  if (!shapeClassifier) {
    throw new Error(`classify2 cannot be falsy`)
  }
  var g = graphviz.digraph("G");
  buildEdges(g, meta, outgoing, blockClassifier, shapeClassifier)
  g.output('svg', `${outdir}/${filename}.svg`);  
}

const shapeById = {
  User: 'plain',
  Github: 'circle',
  "CloudProvider(s)": 'circle',
  DxPlatform: 'box',
  BuildPlatform: 'egg',
  "BuildEngine(s)": 'circle',
  Production: 'parallelogram',
  Outlets: 'house',
  ArtifactRegistry: 'cylinder'
}

const classOf = {
  AWS: 'CloudProvider(s)',
  AppDefinitonService: 'DxPlatform',
  ArtifactRegistry: null,
  BazelBuild: 'BuildPlatform',
  BuildDefinitionService: 'DxPlatform',
  BuildOutputService: 'BuildPlatform',
  BuildRunService: 'BuildPlatform',
  FalconBuild: 'BuildPlatform',
  GAE: 'CloudProvider(s)',
  GCB: 'BuildEngine(s)',
  GcbAgent: 'BuildPlatform',
  TimelineService: 'DxPlatform',
  Github: null,
  Lifecycle: 'Outlets',
  RolloutService: 'Production',
  System: 'CloudProvider(s)',
  TC: 'BuildEngine(s)',
  TcAgent: 'BuildPlatform',
  TriggeringService: 'BuildPlatform',
  BuildController: 'BuildPlatform',
  User: null
}


const all = [
  ["User", "Lifecycle", "Github", "ArtifactRegistry"],
  ["Lifecycle", "AppDefinitonService", "BuildRunService", "Production", "TimelineService"],
  ["Production", "System", "AWS", "GAE", "BuildOutputService", "TimelineService"],
  ["BuildOutputService", "ArtifactRegistry"],
  ["Github", "TriggeringService"],
  ["TriggeringService", "BuildController"],
  ["BuildController", "BuildDefinitionService", "BuildRunService", "FalconBuild", "BazelBuild"],
  ["BuildRunService", "TimelineService"],
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


const set = new Set()
all.forEach(curr => curr.forEach(v => set.add(v)))

console.log([...set].sort().join('\n'))

draw("highlevel", shapeById, all, x => classOf[x], x => classOf[x])
draw("fine", shapeById, all, x => x, x => classOf[x]);


