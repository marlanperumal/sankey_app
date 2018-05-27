import React, { Component } from 'react'

import Sankey from './Sankey'
import FileUploader from './FileUploader'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      periods: [],
      movements: []
    }
  }
  readData(data) {
    const periods = data[0].slice(0, -1)
    const movements = data.slice(1)
    this.setState({
      periods,
      movements
    })
  }
  render() {
    return (
      <div>
        <Sankey
          periods={this.state.periods}
          movements={this.state.movements}
          width={1000}
          height={600}
        />
        <FileUploader
          onLoad={(data) => this.readData(data)}
        />
      </div>
    )
  }
}

export default App;
