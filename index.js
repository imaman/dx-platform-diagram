const graphviz = require('graphviz');
const fs = require('fs')
const path = require('path')


const outdir = path.join(__dirname, 'generated')
if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir)
}

function toEdgeSpec(n) {
  return Array.isArray(n) ? {target: n[0], text: n[1]} : {target: n, text: ''}
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
      const resolved = resolve(toEdgeSpec(v).target, blockClassifier)
      if (typeof resolved !== 'string') {
        throw new Error(`bad resolution of ${v}. It was resolved to ${JSON.stringify(resolved)}`)
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

  const edges = []
  const set = new Set()
  d.forEach(curr => {
    curr.slice(1).forEach(n => {
      const from = resolve(curr[0], blockClassifier)  
      const edgeSpec = toEdgeSpec(n)
      const to = resolve(edgeSpec.target, blockClassifier)
      if (from === to) {
        return
      }
      const combined = JSON.stringify([from, to])
      if (set.has(combined)) {
        return
      }
      set.add(combined)
      edges.push({from, to, text: edgeSpec.text})
    })
  })  


  edges.forEach(curr => {
    console.log('edge: ' + JSON.stringify(curr))
    const e = g.addEdge(curr.from, curr.to)
    e.set('color', 'red')
    if (curr.text) {
      e.set('label', '?')
      e.set('labeltooltip', curr.text)
    }
  })
}


function draw(filename, meta, data, blockClassifier = (_, x) => x) {
  const outgoing = data.edges
  const shapeClassifier = x => data.classOf[x]

  if (!blockClassifier) {
    throw new Error(`classify cannot be falsy`)
  }

  console.log('generating edges for ' + filename)
  var g = graphviz.digraph("");
  buildEdges(g, meta, outgoing, x => blockClassifier(data.classOf, x), shapeClassifier)
  g.output('svg', `${outdir}/${filename}.svg`);  
  g.output('png', `${outdir}/${filename}.png`);  
}


const shapeById = {
  User: 'plain',
  Github: 'circle',
  GithubStatus: 'circle',
  Slack: 'circle',
  "CloudProvider(s)": 'circle',
  CoreServices: 'box',
  BuildPlatform: 'egg',
  "BuildEngine(s)": 'circle',
  Production: 'parallelogram',
  Outlets: 'house',
  ArtifactRegistries: 'cylinder'
}


const vnow = {
  edges: [
    ["User", "Lifecycle", ["Github", "git push, merge, etc..."], ["ArtifactRegistries", "npm install"]],
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
    ["Lifecycle", "AppDefinitonService", "BuildTimelineService", "RolloutService", "TimelineService"],
    ["RolloutService", "System", "BuildOutputService", "TimelineService", "Notifier"],
    ["BuildOutputService", "ArtifactRegistries"],
    ["Github", "TriggeringService"],
    ["TriggeringService", "BuildController"],
    ["BuildController", "BuildDefinitionService", "BuildTimelineService", "FalconBuild", "BazelBuild", "Notifier"],
    ["BuildTimelineService", "TimelineService"],
    ["BazelBuild", "GCB"],
    ["FalconBuild", "TC"],
    ["TC", "FalconScripts"],
    ["GCB", "GcbScripts"],
    ["Notifier", "GithubStatus", "Slack"],
    ["FalconScripts", "BuildOutputService"],
    ["GcbScripts", "BuildOutputService"],
    ["System", "ArtifactRegistries"],
  ],
  classOf: {
    AWS: 'CloudProvider(s)',
    AppDefinitonService: 'CoreServices',
    ArtifactRegistries: null,
    BazelBuild: 'BuildPlatform',
    BuildDefinitionService: 'CoreServices',
    BuildOutputService: 'BuildPlatform',
    BuildTimelineService: 'BuildPlatform',
    FalconBuild: 'BuildPlatform',
    GAE: 'CloudProvider(s)',
    GCB: 'BuildEngine(s)',
    GcbScripts: 'BuildPlatform',
    TimelineService: 'CoreServices',
    GithubStatus: null,
    Github: null,
    Lifecycle: 'Outlets',
    RolloutService: 'Production',
    System: 'CloudProvider(s)',
    TC: 'BuildEngine(s)',
    FalconScripts: 'BuildPlatform',
    TriggeringService: 'BuildPlatform',
    BuildController: 'BuildPlatform',
    Notifier: 'CoreServices',
    User: null
  }
}

const eoy2021 ={
  edges: [
    ["User", "Lifecycle", "Github", "ArtifactRegistries"],
    ["Lifecycle", "AppDefinitonService", "BuildTimelineService", "RolloutService", "TimelineService"],
    ["RolloutService", "System", "AWS", "GAE", "WixServerless", "BuildOutputService", "TimelineService"],
    ["BuildOutputService", "ArtifactRegistries"],
    ["Github", "TriggeringService"],
    ["TriggeringService", "BuildController"],
    ["BuildController", "BuildDefinitionService", "BuildTimelineService", "FalconBuild", "BazelBuild"],
    ["BuildTimelineService", "TimelineService"],
    ["BazelBuild", "Buildkite (?)"],
    ["FalconBuild", "Buildkite (?)"],
    ["Buildkite (?)", "FalconScripts"],
    ["Buildkite (?)", "BazelScripts"],
    ["FalconScripts", "BuildOutputService"],
    ["BazelScripts", "BuildOutputService"],
    ["AWS", "ArtifactRegistries"],
    ["System", ["ArtifactRegistries", "docker pull"]],
    ["GAE", "ArtifactRegistries"],
    ["WixServerless", "ArtifactRegistries"]
  ],
  classOf: {
    AWS: 'CloudProvider(s)',
    AppDefinitonService: 'CoreServices',
    ArtifactRegistries: null,
    BazelBuild: 'BuildPlatform',
    BuildDefinitionService: 'CoreServices',
    BuildOutputService: 'BuildPlatform',
    BuildTimelineService: 'BuildPlatform',
    FalconBuild: 'BuildPlatform',
    GAE: 'CloudProvider(s)',
    BazelScripts: 'BuildPlatform',
    TimelineService: 'CoreServices',
    Github: null,
    Lifecycle: 'Outlets',
    RolloutService: 'Production',
    System: 'CloudProvider(s)',
    FalconScripts: 'BuildPlatform',
    TriggeringService: 'BuildPlatform',
    BuildController: 'BuildPlatform',
    WixServerless: 'CloudProvider(s)',
    'Buildkite (?)': 'BuildEngine(s)',
    User: null
  }
}

function zoomOut(classOf, x) {
  return classOf[x]
}

draw("vnow", shapeById, vnow)
draw("highlevel_longterm", shapeById, eoy2020, zoomOut)
draw("eoy_2020", shapeById, eoy2020)
draw("eoy_2021", shapeById, eoy2021)


function inlineSvg(pathToFile) {
  let content = fs.readFileSync(pathToFile, 'utf-8')
  content = content.replace('<title>%3</title>', '<title></title>')
  const svg = content.indexOf('<svg')
  content = content.substr(svg)
  return content
}

const html = `
<html>
  <head>
    <style>
      body {
        background-color: grey;
      }
      h1 {
        color:blanchedalmond;
      }
      img {
        border-width: 4px;
        border-color: beige;
        border-style: none;
        display: block;
        margin-left: auto;
        margin-right: auto;
        margin-top: 20px;
        padding: 10px;
      }
    </style>
  </head>
  <body>
    <h1>Vnow (2020-06)</h1>
    ${inlineSvg("generated/vnow.svg")}
    <h1>Ideal structure (zoom-out)</h1>
    ${inlineSvg("generated/highlevel_longterm.svg")}
    <h1>EOY 2020</h1>
    ${inlineSvg("generated/eoy_2020.svg")}
    <h1>EOY 2021</h1>
    ${inlineSvg("generated/eoy_2021.svg")}
  </body>
</html>
`

fs.writeFileSync('index.html', html)
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
