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
  ArtifactRegistries: 'cylinder'
}


const currentClassOf = {
  Buildoscope: 'BuildPlatform',
  Lifecycle: 'Outlets',
  Detonomy: 'Production',
  Statiscope: 'Production',
  Periscope: 'Production',
  System: 'CloudProvider(s)',
  RepoHippo: 'BuildPlatform',
  VMR: 'BuildPlatform',
  BazelBuild: 'BuildPlatform',
  TC: 'BuildEngine(s)',
  GCB: 'BuildEngine(s)',
  FalconAgent: 'BuildPlatform',
  GcbAgent: 'BuildPlatform',
  ResultStore: 'BuildEngine(s)',
  AsyncPublisher: 'BuildPlatform',
  GcBob: 'BuildPlatform'
}

const classOf = {
  AWS: 'CloudProvider(s)',
  AppDefinitonService: 'DxPlatform',
  ArtifactRegistries: null,
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
  FalconAgent: 'BuildPlatform',
  TriggeringService: 'BuildPlatform',
  BuildController: 'BuildPlatform',
  User: null
}


const current = [
  ["User", "Lifecycle", "Github", "ArtifactRegistries"],
  ["Lifecycle", "Buildoscope", "Detonomy", "System", "Periscope", "Statiscope"],
  ["Statiscope", "System"],
  ["Periscope", "System"],
  ["Detonomy", "System"],
  ["Buildoscope", "TC", "GcBob", "ArtifactRegistries"],
  ["Github", "RepoHippo", "TC"],
  ["RepoHippo", "VMR"],
  ["VMR", "BazelBuild"],
  ["BazelBuild", "GCB", "GcBob"],
  ["TC", "FalconAgent"],
  ["GCB", "GcbAgent"],
  ["FalconAgent", "ArtifactRegistries", "Buildoscope"],
  ["GcbAgent", "ResultStore"],
  ["AsyncPublisher", "ResultStore", "ArtifactRegistries"],
  ["System", "ArtifactRegistries"],
]


const all = [
  ["User", "Lifecycle", "Github", "ArtifactRegistries"],
  ["Lifecycle", "AppDefinitonService", "BuildRunService", "Production", "TimelineService"],
  ["Production", "System", "AWS", "GAE", "BuildOutputService", "TimelineService"],
  ["BuildOutputService", "ArtifactRegistries"],
  ["Github", "TriggeringService"],
  ["TriggeringService", "BuildController"],
  ["BuildController", "BuildDefinitionService", "BuildRunService", "FalconBuild", "BazelBuild"],
  ["BuildRunService", "TimelineService"],
  ["BazelBuild", "GCB"],
  ["FalconBuild", "TC"],
  ["TC", "FalconAgent"],
  ["GCB", "GcbAgent"],
  ["FalconAgent", "BuildOutputService"],
  ["GcbAgent", "BuildOutputService"],
  ["AWS", "ArtifactRegistries"],
  ["System", "ArtifactRegistries"],
  ["GAE", "ArtifactRegistries"]
]


draw("06_20", shapeById, current, x => x, x => currentClassOf[x])
draw("highlevel", shapeById, all, x => classOf[x], x => classOf[x])
draw("fine", shapeById, all, x => x, x => classOf[x]);


