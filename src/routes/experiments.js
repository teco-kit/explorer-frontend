import React, { Component } from 'react';
import { Container, Col, Row, Button, Table, Badge } from 'reactstrap';

import Loader from '../modules/loader';
import LabelingSelectionPanel from '../components/LabelingSelectionPanel/LabelingSelectionPanel';
import EditInstructionModal from '../components/EditInstructionModal/EditInstructionModal';

import { subscribeLabelingsAndLabels } from '../services/ApiServices/LabelingServices';
import {
  deleteExperiment,
  addExperiment,
  updateExperiment,
  subscribeExperiments
} from '../services/ApiServices/ExperimentService';

class ExperimentsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      experiments: [],
      selectedExperimentId: undefined,
      labelings: [],
      labelTypes: [],
      isReady: false,
      modal: {
        experiment: undefined,
        isOpen: false,
        isNewExperiment: false
      }
    };
    this.initComponent = this.initComponent.bind(this);
  }

  componentDidMount() {
    this.initComponent();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.initComponent();
    }
  }

  initComponent() {
    subscribeLabelingsAndLabels()
      .then(result =>
        this.onLabelingsAndLabelsChanged(result.labelings, result.labels)
      )
      .catch(err => {
        console.log(err);
      });
  }

  onLabelingsAndLabelsChanged = (labelings, labels) => {
    this.setState(
      {
        labelings: labelings || [],
        labelTypes: labels || []
      },
      () => {
        subscribeExperiments().then(this.onExperimentsChanged);
      }
    );
  };

  onExperimentsChanged = experiments => {
    if (experiments === undefined) experiments = this.state.experiments;
    this.setState({
      experiments: experiments,
      selectedExperimentId: experiments[0] ? experiments[0]['_id'] : undefined,
      isReady: true
    });
    if (!this.props.location.pathname.includes('/experiments/new')) {
      const searchParams = new URLSearchParams(this.props.location.search);
      const id = searchParams.get('id');

      if (id) {
        let experiment = this.state.experiments.filter(
          experiment => experiment['_id'] === id
        )[0];

        this.toggleModal(experiment, false);
      }
    }
  };

  toggleModal = (experiment, isNewExperiment) => {
    if (isNewExperiment) {
      if (!this.props.history.location.pathname.includes('experiments/new')) {
        this.props.history.replace({
          pathname: this.props.history.location.pathname + '/new',
          search: null
        });
      }
    } else {
      const pName = this.props.history.location.pathname
        .split('/')
        .splice(-1, 1)
        .join('/');
      this.props.history.replace({
        pathname: pName,
        search: '?id=' + experiment['_id']
      });
    }

    this.setState({
      modal: {
        experiment: experiment,
        isOpen: true,
        isNewExperiment: isNewExperiment
      }
    });
  };

  onModalAddExperiment = () => {
    this.toggleModal(
      {
        name: '',
        instructions: []
      },
      true
    );
  };

  onCloseModal = () => {
    this.resetURL();

    this.setState({
      modal: {
        experiment: undefined,
        isOpen: false,
        isNewExperiment: false
      }
    });
  };

  onDeleteExperiment = experimentId => {
    this.onCloseModal();

    deleteExperiment(experimentId).then(this.onExperimentsChanged);
  };

  onSave = experiment => {
    if (!experiment) return;
    if (!experiment.name || experiment.name === '') {
      window.alert('Please enter a valid name.');
      return;
    }
    if (
      !experiment.instructions ||
      experiment.instructions.length === 0 ||
      experiment.instructions.some(instruction => !instruction.labelType) ||
      experiment.instructions.some(instruction => !instruction.duration) ||
      experiment.instructions.some(instruction => instruction.duration <= 0)
    ) {
      window.alert('Please enter valid instructions.');
      return;
    }

    if (this.state.modal.isNewExperiment) {
      addExperiment(experiment).then(this.onExperimentsChanged);
    } else {
      updateExperiment(experiment).then(this.onExperimentsChanged);
    }

    this.onCloseModal();
  };

  resetURL = () => {
    const newPath = this.props.history.location.pathname.split('/');
    console.log(newPath);
    if (newPath[newPath.length - 1] !== 'experiments') {
      newPath.pop();
    }
    this.props.history.replace({
      pathname: newPath.join('/'),
      search: null
    });
  };

  onSelectedExperimentIdChanged = selectedExperimentId => {
    this.setState({ selectedExperimentId });
  };

  // in case a label definition no longer exists
  filterInvalidInstructions = instructions => {
    let labelings = this.state.labelings.map(labeling => {
      let labels = this.state.labelTypes.filter(label =>
        labeling.labels.includes(label['_id'])
      );
      return Object.assign({}, labeling, { labels });
    });

    return instructions.filter(instruction => {
      if (!instruction.labelingId && !instruction.labelType) return true;

      if (instruction.labelingId && !instruction.labelType) {
        return labelings.some(
          labeling => labeling['_id'] === instruction.labelingId
        );
      } else {
        return labelings.some(
          labeling =>
            labeling['_id'] === instruction.labelingId &&
            labeling.labels.some(
              label => label['_id'] === instruction.labelType
            )
        );
      }
    });
  };

  render() {
    let experiment = this.state.experiments.filter(
      experiment => experiment['_id'] === this.state.selectedExperimentId
    )[0];

    let modalExperiment = this.state.modal.experiment;
    if (modalExperiment) {
      modalExperiment.instructions = this.filterInvalidInstructions(
        modalExperiment.instructions
      );
    }
    return (
      <Loader loading={!this.state.isReady}>
        <Container id="experimentPageContent">
          <Row className="mt-3 text-left">
            <Col>
              <LabelingSelectionPanel
                objectType={'experiments'}
                history={this.props.history}
                labelings={this.state.experiments}
                selectedLabelingId={this.state.selectedExperimentId}
                onSelectedLabelingIdChanged={this.onSelectedExperimentIdChanged}
                onAddLabeling={this.onModalAddExperiment}
              />
            </Col>
          </Row>

          <Table responsive className="mt-4">
            <thead>
              <tr className={'bg-light'}>
                <th>Label Type</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody id="labelTable">
              {experiment &&
                experiment.instructions.map((instruction, index) => {
                  let types = this.state.labelTypes.filter(
                    type => type['_id'] === instruction.labelType
                  );
                  if (!types || !types.length > 0) return null;

                  let label = types[0];
                  return (
                    <tr key={'tr' + index + label['_id']}>
                      <td>
                        <Badge
                          key={'badge' + index + label['_id']}
                          className="m-1"
                          style={{ backgroundColor: label.color }}
                        >
                          {label.name}
                        </Badge>
                      </td>
                      <td>
                        {instruction.duration} {'ms'}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>

          <Button
            block
            className="mb-5"
            color="secondary"
            outline
            disabled={!experiment}
            onClick={e => this.toggleModal(experiment, false)}
          >
            Edit Experiment
          </Button>
        </Container>
        <EditInstructionModal
          experiment={modalExperiment}
          labelTypes={this.state.labelTypes}
          labelings={this.state.labelings}
          isOpen={this.state.modal.isOpen}
          onCloseModal={this.onCloseModal}
          onDeleteExperiment={this.onDeleteExperiment}
          onSave={this.onSave}
          isNewExperiment={this.state.modal.isNewExperiment}
        />
      </Loader>
    );
  }
}

export default ExperimentsPage;
