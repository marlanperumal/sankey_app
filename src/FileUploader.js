import React, { Component } from 'react'
import Papa from 'papaparse'

class FileUploader extends Component {
  constructor(props) {
    super(props)
    this.state = {
      file: null
    }
  }
  onChangeHandler(e) {
    const file = e.target.files[0]
    if (file) {
      const { onLoad } = this.props
      Papa.parse(file, {
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => onLoad(results.data)
      })
      this.setState({ file })
    }
  }
  onRefreshHandler(e) {
    e.preventDefault()
    const files = document.getElementById("input_file").files
    if (files.length > 0) {
      const file = files[0]
      const { onLoad } = this.props
      Papa.parse(file, {
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => onLoad(results.data)
      })
    }
  }
  render() {
    return (
      <form>
        <input
          id="input_file"
          type="file"
          name="sankeyFile"
          onChange={(e) => this.onChangeHandler(e)}
          style={{width: 500}}
        />
        <button onClick={(e) => this.onRefreshHandler(e)}>Refresh</button>
      </form>
    )
  }
}

export default FileUploader
