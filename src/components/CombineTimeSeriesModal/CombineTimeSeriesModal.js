import React, { Component } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Label,
  Input
} from 'reactstrap';

import './CombineTimeSeriesModal.css';
import { isCallExpression } from 'typescript';

class CombineTimeSeriesModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timeSeries: props.timeSeries ? props.timeSeries : [],
      selectedTimeSeries: [],
      modalState: {
        isOpen: true
      },
      eventHandlers: {
        onFuse: this.props.onFuse
      }
    };

    this.onCloseModal = this.onCloseModal.bind(this);
    this.onFuse = this.onFuse.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState(state => ({
      timeSeries: props.timeSeries ? props.timeSeries : [],
      selectedTimeSeries: this.state.selectedTimeSeries
    }));
  }

  onCloseModal() {
    this.setState(state => ({
      modalState: {
        isOpen: false
      }
    }));
  }

  onTimeSeriesSelectedChanged(isChecked, id) {
    this.setState(state => ({
      timeSeries: this.state.timeSeries,
      selectedTimeSeries: isChecked
        ? [...this.state.selectedTimeSeries, id]
        : this.state.selectedTimeSeries.filter(seriesId => seriesId !== id)
    }));
  }

  onFuse() {
    this.state.eventHandlers.onFuse(this.state.selectedTimeSeries);
    this.setState(state => ({
      timeSeries: this.state.timeSeries,
      selectedTimeSeries: [],
      modalState: {
        isOpen: false
      }
    }));
  }

  render() {
    return (
      <Modal isOpen={this.state.modalState.isOpen}>
        <ModalHeader>Fuse Multiple Time Series</ModalHeader>
        <ModalBody>
          {this.state.timeSeries.map(series => (
            <FormGroup check style={{ margin: '10px 0px' }}>
              <Label check>
                <Input
                  type="checkbox"
                  checked={
                    this.state.selectedTimeSeries.filter(
                      filteredSeries => filteredSeries === series.id
                    ).length !== 0
                  }
                  onChange={e =>
                    this.onTimeSeriesSelectedChanged(
                      e.target.checked,
                      series.id
                    )
                  }
                />{' '}
                <span>{series.name}</span>
              </Label>
            </FormGroup>
          ))}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" className="m-1 mr-auto" onClick={this.onFuse}>
            Fuse
          </Button>{' '}
          <Button color="secondary" className="m-1" onClick={this.onCloseModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}
export default CombineTimeSeriesModal;
