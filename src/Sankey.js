import React, { Component } from 'react'
import Plot from 'react-plotly.js'
import { map, reduce, each, dropRight, isEqual, some } from 'lodash'

class Sankey extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [{
        type: "sankey",
        orientation: "h",
        node: {
          pad: 15,
          thickness: 30,
          line: {
            color: "black",
            width: 0.5
          },
          label: [],
          color: []
        },
        link: {
          source: [],
          target: [],
          value: [],
          color: []
        }
      }],
      layout: {
        title: "Interactive Sankey",
        font: {
          family: "Calibri",
          size: 10
        },
        width: props.width,
        height: props.height
      },
      frames: [],
      config: {},
      flows: [],
      nodes: {},
      links: {},
      paths: {}
    }
  }

  static createLinks(flows, nodes, paths) {
    const linkMap = {}
    const links = {}
    let linkId = 0

    const filterMatrix = map(flows, (flow) => (
        map(dropRight(flow, 1), (pathId) => paths[pathId].filter)
    ))

    const filterVector = reduce(filterMatrix, (result, filterRow) => (
        map(filterRow, (item, i) => (filterRow[i] || result[i]))
    ), map(filterMatrix[0], (item) => false))

    each(flows, (flow, flowId) => {
      const value = flow[flow.length-1]
      const filter = some(filterMatrix[flowId])
        && isEqual(filterMatrix[flowId], filterVector)

      each(flow.slice(0, -1), (pathId) => {
        const path = paths[pathId]
        if (path.id in linkMap && filter in linkMap[path.id]){
          const linkId = linkMap[path.id][filter]
          const link = links[linkId]
          link.value += value
        }
        else {
          if (!(path.id in linkMap)){
            linkMap[path.id] = {}
          }
          const link = {
            id: linkId++,
            pathId: path.id,
            filter,
            value
          }

          links[link.id] = link
          linkMap[path.id][filter] = link.id
        }
      })
    })

    each(links, (link) => {
      const path = paths[link.pathId]
      if (link.filter) {
        if (path.filter) {
          link.color = "rgba(255,0,0,0.8)"
        }
        else {
          link.color = "rgba(255,0,0,0.4)"
        }
      }
      else {
        if (path.filter) {
          link.color = "rgba(0,255,0,0.4)"
        }
        else {
          link.color = "rgba(50,50,50,0.2)"
        }
      }
    })

    return links
  }

  static getDerivedStateFromProps(props, state) {
    const { data } = state
    const nodes = {}
    const paths = {}
    const pathMap = {}
    const flows = []
    let nodeId = 0
    let pathId = 0
    const { movements, periods } = props

    const nodeMap = reduce(periods, (obj, key) => {
      obj[key] = {}
      return obj
    }, {})

    each(movements, movement => {
      const flow = []
      const [value] = movement.slice(-1)

      each(periods, (period, periodId) => {
        const segment = movement[periodId]
        if (!(segment in nodeMap[period])){
          const node = {
            id: nodeId++,
            periodId,
            period,
            segment,
            label: String(period) + " " + String(segment),
            color: "blue"
          }
          nodeMap[period][segment] = node.id
          pathMap[node.id] = {}
          nodes[node.id] = node
        }
      })

      each(periods.slice(0,-1), (period, periodId) => {
        const sourcePeriod = periods[periodId]
        const sourceSegment = movement[periodId]
        const sourceNodeId = nodeMap[sourcePeriod][sourceSegment]

        const targetPeriod = periods[periodId+1]
        const targetSegment = movement[periodId+1]
        const targetNodeId = nodeMap[targetPeriod][targetSegment]

        if (!(targetNodeId in pathMap[sourceNodeId])) {
          const path = {
            id: pathId++,
            sourceNodeId,
            targetNodeId,
            filter: false,
          }
          paths[path.id] = path
          pathMap[sourceNodeId][targetNodeId] = path.id
        }
        const path = pathMap[sourceNodeId][targetNodeId]
        flow.push(path)
      })
      flow.push(value)
      flows.push(flow)
    })

    const links = Sankey.createLinks(flows, nodes, paths)

    return {
      data: [{
        ...data[0],
        node: {
          ...data[0].node,
          label: map(nodes, node => node.label),
          color: map(nodes, node => node.color)
        },
        link: {
          source: map(links, link => paths[link.pathId].sourceNodeId),
          target: map(links, link => paths[link.pathId].targetNodeId),
          value: map(links, link => link.value),
          color: map(links, link => link.color)
        }
      }],
      flows,
      nodes,
      links,
      paths
    }
  }

  onClickHandler(e) {
    const { pointNumber } = e.points[0]
    const { data, flows, nodes, paths, links } = this.state
    const link = links[pointNumber]
    const path = paths[link.pathId]
    const newPaths = {
      ...paths,
      [path.id]: {
        ...path,
        filter: !path.filter
      }
    }
    const newLinks = Sankey.createLinks(flows, nodes, newPaths)
    this.setState({
      links: newLinks,
      paths: newPaths,
      data: [{
        ...data[0],
        link: {
          source: map(newLinks, link => paths[link.pathId].sourceNodeId),
          target: map(newLinks, link => paths[link.pathId].targetNodeId),
          value: map(newLinks, link => link.value),
          color: map(newLinks, link => link.color)
        }
      }]
    })
  }

  render() {
    return (
      <Plot
        data={this.state.data}
        layout={this.state.layout}
        frames={this.state.frames}
        config={this.state.config}
        onInitialized={(figure) => this.setState(figure)}
        onUpdate={(figure) => this.setState(figure)}
        onClick={(e) => this.onClickHandler(e)}
      />
    )
  }
}

export default Sankey
