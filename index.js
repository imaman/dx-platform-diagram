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
      const resolved = resolve(v, blockClassifier)
      if (typeof resolved !== 'string') {
        throw new Error(`bad resoluting of ${v}. It was resolved to ${JSON.stringify(resolved)}`)
      }
      v = resolved
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
      // e.set('label', from.substr(0, 3) + "_" + to.substr(0, 3))
      // e.set('labeltooltip', 'XXXXX_title: ' + from.substr(0, 3) + "_" + to.substr(0, 3))
      // e.set('id', "e_id_" + from + "_" + to)
    })
  })  
}


function draw(filename, meta, data, blockClassifier = (_, x) => x) {
  const outgoing = data.edges
  const shapeClassifier = x => data.classOf[x]

  if (!blockClassifier) {
    throw new Error(`classify cannot be falsy`)
  }
  var g = graphviz.digraph("G");
  buildEdges(g, meta, outgoing, x => blockClassifier(data.classOf, x), shapeClassifier)
  g.output('svg', `${outdir}/${filename}.svg`);  
}


const shapeById = {
  User: 'plain',
  Github: 'circle',
  Slack: 'circle',
  "CloudProvider(s)": 'circle',
  DxPlatform: 'box',
  BuildPlatform: 'egg',
  "BuildEngine(s)": 'circle',
  Production: 'parallelogram',
  Outlets: 'house',
  ArtifactRegistries: 'cylinder'
}


const vnow = {
  edges: [
    ["User", "Lifecycle", "Github", "ArtifactRegistries"],
    ["Lifecycle", "Buildoscope", "Detonomy", "System", "Periscope", "Statiscope", "GcbPushtak"],
    ["Statiscope", "System"],
    ["Periscope", "System"],
    ["Detonomy", "System"],
    ["Buildoscope", "TC", "Bob", "ArtifactRegistries", "BuildDescriptorServer"],
    ["Github", "RepoHippo", "TC"],
    ["RepoHippo", "VMR"],
    ["VMR", "GcbTrigger"],
    ["GcbTrigger", "GCB", "Github", "BuildDescriptorServer"],
    ["BuildDescriptorServer", "Github"],
    ["GCB", "WixGcbScripts", "GcbPubSubAdapter", "RBE"],
    ["GcbPubSubAdapter", "GcbGithubSync", "GcbMetrics", "GcbStatusSyncNotifier"],
    ["GcbStatusSyncNotifier", "Slack", "Github"],
    ["WixGcbScripts", "AsyncPublisher"],
    ["TC", "FalconAgent"],
    ["GcbGithubSync", "Github", "GcbStatusSyncNotifier", "FlakyTestsServer", "GcbPushtak"],
    ["FalconAgent", "ArtifactRegistries", "Buildoscope"],
    ["RBE", "ResultStore"],
    ["AsyncPublisher", "ResultStore", "ArtifactRegistries", "Bob", "RcSnitch"],
    ["System", "ArtifactRegistries"],
    ["RepoHippo","VMR","GcbTrigger","GcbPushtak"],
    ["VMR","GcbTrigger","VmrStarlarker"],
    ["GcbTrigger", "GcbGithubSync"],
    ["GcbPushtak", "RBE"]
  ],

  classOf: {
    Buildoscope: 'BuildPlatform',
    Lifecycle: 'Outlets',
    Detonomy: 'Production',
    Statiscope: 'Production',
    Periscope: 'Production',
    System: 'CloudProvider(s)',
    RepoHippo: 'BuildPlatform',
    VMR: 'BuildPlatform',
    GcbTrigger: 'BuildPlatform',
    WixGcbScripts: 'BuildPlatform',
    GcbPubSubAdapter: 'BuildPlatform',
    TC: 'BuildEngine(s)',
    GCB: 'BuildEngine(s)',
    RBE: 'BuildEngine(s)',
    GcbGithubSync: 'BuildPlatform',
    GcbMetrics: 'BuildPlatform',
    GcbStatusSyncNotifier: 'BuildPlatform',
    RcSnitch: 'BuildPlatform',
    FalconAgent: 'BuildPlatform',
    GcbAgent: 'BuildPlatform',
    ResultStore: 'BuildEngine(s)',
    AsyncPublisher: 'BuildPlatform',
    Bob: 'BuildPlatform',
    GcbPushtak: 'BuildPlatform',
    VmrStarlarker: 'BuildPlatform',
    FlakyTestsServer: 'BuildPlatform',
    BuildDescriptorServer: 'BuildPlatform'
  }
}
  
const eoy2020 ={
  edges: [
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
  ],
  classOf: {
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
}

function zoomOut(classOf, x) {
  return classOf[x]
}

draw("vnow", shapeById, vnow)
draw("eoy_2020_zoomout", shapeById, eoy2020, zoomOut)
draw("eoy_2020", shapeById, eoy2020)
// draw("fine", shapeById, eoy2020, x => x, x => classOf[x]);




// notes from ShayS:
// vmr -> GcbTrigger
// GcbTrigger -> Gcb
// gcb -> (pubsub) -> GcbPubSubAdapter
// GcbPubSubAdapter -> GcbGithubSync (updates github with the result)
// GcbPubSubAdapter -> GcbMetrics (metrics in grafana/newrelic)
// GcbPubSubAdapter -> GcbStatusSyncNotifier (updates in slack)
// step in the build template triggers AsyncPublisher

// GCB - orchestration the real step happens in RBE, the other (pull a docker and run) happens on GCB
// we have some glue code running in the GCB steps
// RBE - where the real work happens (the actual bazel build)
// results from RBE uploaded to resultstore


// AsyncPublisher -> Bob
// AsyncPublisher -> RcSnitch
// is bob used by other services?
// which other services send data to RcSnitch?




// LabelDex? - ask shahar
// FlakyTestServer?


// notes from AvgarM
//
// RepoHippo -> Pusthak,Builddescriptiorserver,gcbwebapp,pushtak,vmr-starlarker
// RepoHippo -> GcbTrigger
// https://docs.google.com/spreadsheets/d/1xs8U6tDvmkTjOvvYJz3dNssOsrQY3SMzqFrQFAYLRWQ/edit#gid=0



// share workplan, design doc, talk with vova how the build works.
