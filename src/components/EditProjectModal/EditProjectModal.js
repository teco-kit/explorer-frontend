import React, { Component } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  Table,
  FormGroup
} from 'reactstrap';

import { updateProject } from './../../services/ApiServices/ProjectService';

class EditProjectModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      originalProject: undefined,
      project: undefined,
      originalUsers: []
    };
    this.onNameChanged = this.onNameChanged.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onAddUser = this.onAddUser.bind(this);
    this.onDeleteUser = this.onDeleteUser.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }

  onDeleteUser(user) {
    var idx = this.state.originalUsers.findIndex(elm => elm === user);
    var tmpOriginalUsers = [...this.state.originalUsers];
    if (idx !== -1) {
      tmpOriginalUsers.splice(idx, 1);
    }
    var tmpProject = { ...this.state.project };
    var idxPrj = tmpProject.users.findIndex(elm => elm === user);
    tmpProject.users.splice(idxPrj, 1);
    this.setState({
      originalUsers: tmpOriginalUsers,
      project: tmpProject
    });
  }

  onSave() {
    updateProject(this.state.project)
      .then(data => {
        this.props.projectChanged(data);
      })
      .catch(err => {});
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.project) return;
    if (!nextProps.isNewProject) {
      var objectCopy = JSON.parse(JSON.stringify(nextProps.project));
      this.setState({
        project: objectCopy,
        originalProject: objectCopy,
        originalUsers: objectCopy.users
      });
    } else {
      const newProject = { name: '', users: [] };
      this.setState({
        project: newProject,
        originalUsers: nextProps.project.users
      });
    }
  }

  onNameChanged(newName) {
    var tmpProject = { ...this.state.project };
    tmpProject.name = newName;
    this.setState({
      project: tmpProject
    });
  }

  onAddUser() {
    var tmpProject = { ...this.state.project };
    tmpProject.users.push('');
    this.setState({
      project: tmpProject
    });
  }

  onCancel() {
    this.setState(
      {
        originalProject: undefined,
        project: undefined,
        originalUsers: []
      },
      () => {
        this.props.onClose();
      }
    );
  }

  render() {
    if (!this.state.project) return null;
    return (
      <Modal isOpen={this.props.isOpen}>
        <ModalHeader>
          {this.props.isNewProject
            ? 'Create new Project'
            : 'Edit Project: ' + this.state.originalProject.name}
        </ModalHeader>
        <ModalBody>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>{'Name'}</InputGroupText>
            </InputGroupAddon>
            <Input
              placeholder={'Name'}
              value={this.state.project.name}
              onChange={e => this.onNameChanged(e.target.value)}
            />
          </InputGroup>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>{'Admin'}</InputGroupText>
            </InputGroupAddon>
            <Input value={this.state.project.admin} readOnly />
          </InputGroup>
          <h5 style={{ paddingTop: '16px' }}>Users</h5>
          <Table striped>
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {this.state.project.users.map((user, index) => {
                return (
                  <tr key={user + index}>
                    <th scope="row">{index}</th>
                    <td>
                      {this.state.originalUsers.includes(user) &&
                      user !== '' ? (
                        user
                      ) : (
                        <Input
                          type="text"
                          name="User ID"
                          placeholder="Enter user_id"
                        />
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        className="btn-sm"
                        color="danger"
                        onClick={() => this.onDeleteUser(user)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <Button color="primary" className="btn-sm" onClick={this.onAddUser}>
            Add +
          </Button>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" className="m-1 mr-auto" onClick={this.onSave}>
            Save
          </Button>{' '}
          <Button color="secondary" className="m-1" onClick={this.onCancel}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}
export default EditProjectModal;
