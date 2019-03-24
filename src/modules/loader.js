import React, { Component } from 'react';
import { BeatLoader as LoaderAnimation } from 'react-spinners';

class Loader extends Component {
  render() {
    if (this.props.loading === true) {
      return (
        <LoaderAnimation
          className="loader"
          sizeUnit={'px'}
          color={'rgba(100, 100, 100, 0.5)'}
          loading={true}
        />
      );
    } else {
      return this.props.children;
    }
  }
}

export default Loader;
