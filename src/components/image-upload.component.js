import React, { Component } from "react";
import UploadService from "../services/file-upload.service";
import axios from "axios";

export default class UploadImages extends Component {
  constructor(props) {
    super(props);
    this.selectFile = this.selectFile.bind(this);
    this.upload = this.upload.bind(this);

    this.state = {
      currentFile: undefined,
      previewImage: undefined,
      progress: 0,
      message: "",
      imageInfos: [],
      coordinates: []
    };
  }

  _onMouseMove(e) {
    this.coordinates = this.setState({ x: e.screenX, y: e.screenY });
  }

  componentDidMount() {
    UploadService.getFiles().then((response) => {
      this.setState({
        imageInfos: response.data,
      });
    });
  }

  selectFile(event) {
    this.setState({
      currentFile: event.target.files[0],
      previewImage: URL.createObjectURL(event.target.files[0]),
      progress: 0,
      message: ""
    });
  }

  async upload() {
    //e.preventDefault()'
    console.log('here')
    const formData = new FormData();
    formData.append('files', this.state.currentFile);
    formData.append('x ', this.state.x)
    formData.append('y', this.state.y)
    await axios.post('http://127.0.0.1:8080/api/upload', formData);
    }


  render() {
    const {
      currentFile,
      previewImage,
      progress,
      message,
      imageInfos,
      x,
      y
    } = this.state;

    return (
      <div>
        <div className="row">
          <div className="col-8">
            <label className="btn btn-default p-0">
              <input type="file" accept="image/*" onChange={this.selectFile} />
            </label>
          </div>

          <form onSubmit={this.upload}>
          <div className="col-4">
            <button
              className="btn btn-success btn-sm"
              disabled={!currentFile}
              // onClick={this.upload}
            >
              Upload
            </button>
          </div>
          </form>
        </div>

        {currentFile && (
          <div className="progress my-3">
            <div
              className="progress-bar progress-bar-info progress-bar-striped"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin="0"
              aria-valuemax="100"
              style={{ width: progress + "%" }}
            >
              {progress}%
            </div>
          </div>
        )}

        {previewImage && (
          <div onClick={this._onMouseMove.bind(this)}>
            <h1>Mouse coordinates: { x } { y }</h1>
            <img className="preview" src={previewImage} alt="" />
          </div>
        )}

        {message && (
          <div className="alert alert-secondary mt-3" role="alert">
            {message}
          </div>
        )}

        <div className="card mt-3">
          <ul className="list-group list-group-flush">
            {imageInfos &&
              imageInfos.map((img, index) => (
                <li className="list-group-item" key={index}>
                  <a href={img.url}>{img.name}</a>
                </li>
              ))}
          </ul>
        </div>
      </div>
    );
  }
}
