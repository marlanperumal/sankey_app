import React, { Component } from 'react'
import Papa from 'papaparse'

class FileUploader extends Component {
  onChangeHandler(e) {
    const file = e.target.files[0]
    if (file) {
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
          type="file"
          name="sankeyFile"
          onChange={(e) => this.onChangeHandler(e)}
        />
      </form>
    )
  }
}

export default FileUploader
