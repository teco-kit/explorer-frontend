import ProjectSettings from '../../../routes/projectSettings';
import { mount, shallow } from 'enzyme';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {
  updateProject,
  deleteProject
} from '../../../services/ApiServices/ProjectService';

const adminProject = require('../../fakeData/fakeProjects').adminProject;
const userProject = require('../../fakeData/fakeProjects').userProject;
const projectWithUser = require('../../fakeData/fakeProjects').projectWithUser;

jest.mock('../../../services/ApiServices/ProjectService');

const flushPromises = () => new Promise(setImmediate);

configure({ adapter: new Adapter() });

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Render page', () => {
  it('Render with no project present', () => {
    const wrapper = shallow(
      <ProjectSettings project={undefined}></ProjectSettings>
    );
    expect(wrapper.find('NoProjectPage').exists()).toBe(true);
    expect(wrapper.find('NoProjectPage').props().text).toBe(undefined);
  });

  it('Render without admin rights on the project', () => {
    const wrapper = shallow(
      <ProjectSettings project={userProject}></ProjectSettings>
    );
    expect(wrapper.find('NoProjectPage').exists()).toBe(true);
    expect(wrapper.find('NoProjectPage').props().text).toBe(
      'You need admin rights to edit the project'
    );
  });

  it('Change project', () => {
    const wrapper = shallow(
      <ProjectSettings project={adminProject}></ProjectSettings>
    );
    expect(wrapper.find('#projectName').props().value).toBe(adminProject.name);
    wrapper.setProps({ project: projectWithUser });
    expect(wrapper.find('#projectName').props().value).toBe(
      projectWithUser.name
    );
  });
});

describe('Editing users', () => {
  it('Add user to project', () => {
    updateProject.mockReturnValue(Promise.resolve());
    const fakeOnProjectChange = jest.fn();
    const wrapper = shallow(
      <ProjectSettings
        project={adminProject}
        onProjectsChanged={fakeOnProjectChange}
      ></ProjectSettings>
    );
    wrapper.find('#buttonAddUser').simulate('click');
    wrapper
      .find('#inputUserMail0')
      .simulate('change', { target: { value: 'testMail@teco.edu' } });
    wrapper.find('#buttonSaveProject').simulate('click');
    const users = [
      ...adminProject.users,
      { _id: undefined, email: 'testMail@teco.edu' }
    ];
    expect(updateProject).toBeCalledWith({ ...adminProject, users: users });
  });

  it('Delete user from project', () => {
    updateProject.mockReturnValue(Promise.resolve());
    const fakeOnProjectChange = jest.fn();
    const wrapper = shallow(
      <ProjectSettings
        project={projectWithUser}
        onProjectsChanged={fakeOnProjectChange}
      ></ProjectSettings>
    );
    wrapper.find('#checkboxDeleteUser0').simulate('change');
    wrapper.find('#buttonSaveProject').simulate('click');
    expect(updateProject).toBeCalledWith({ ...projectWithUser, users: [] });
  });

  it('Select and deselect user for deletion', () => {
    updateProject.mockReturnValue(Promise.resolve());
    const fakeOnProjectChange = jest.fn();
    const wrapper = shallow(
      <ProjectSettings
        project={projectWithUser}
        onProjectsChanged={fakeOnProjectChange}
      ></ProjectSettings>
    );
    wrapper.find('#checkboxDeleteUser0').simulate('change');
    wrapper.find('#checkboxDeleteUser0').simulate('change');
    wrapper.find('#buttonSaveProject').simulate('click');
    expect(updateProject).toBeCalledWith(projectWithUser);
  });

  it('Add user the removing it again from list', () => {
    updateProject.mockReturnValue(Promise.resolve());
    const fakeOnProjectChange = jest.fn();
    const wrapper = shallow(
      <ProjectSettings
        project={adminProject}
        onProjectsChanged={fakeOnProjectChange}
      ></ProjectSettings>
    );
    wrapper.find('#buttonAddUser').simulate('click');
    wrapper
      .find('#inputUserMail0')
      .simulate('change', { target: { value: 'testMail@teco.edu' } });
    wrapper.find('#buttonUserMail0').simulate('click');
    wrapper.find('#buttonSaveProject').simulate('click');
    expect(updateProject).toBeCalledWith(adminProject);
  });
});

it('Change name of project', () => {
  updateProject.mockReturnValue(Promise.resolve());
  const fakeOnProjectChange = jest.fn();
  const wrapper = shallow(
    <ProjectSettings
      project={adminProject}
      onProjectsChanged={fakeOnProjectChange}
    ></ProjectSettings>
  );
  wrapper
    .find('#projectName')
    .simulate('change', { target: { value: 'newProjectName' } });
  wrapper.find('#buttonSaveProject').simulate('click');
  expect(updateProject).toBeCalledWith({
    ...adminProject,
    name: 'newProjectName'
  });
});

describe('Delete project', () => {
  it('Delete project and user confirms', () => {
    global.confirm = () => true;
    deleteProject.mockReturnValue(Promise.resolve());
    const fakeOnProjectChange = jest.fn();
    const wrapper = shallow(
      <ProjectSettings
        project={adminProject}
        onProjectsChanged={fakeOnProjectChange}
      ></ProjectSettings>
    );

    wrapper.find('#buttonDeleteProject').simulate('click');
    expect(deleteProject).toBeCalledWith(adminProject);
  });

  it('Delete project and user declines deletion', () => {
    global.confirm = () => false;
    deleteProject.mockReturnValue(Promise.resolve());
    const fakeOnProjectChange = jest.fn();
    const wrapper = shallow(
      <ProjectSettings
        project={adminProject}
        onProjectsChanged={fakeOnProjectChange}
      ></ProjectSettings>
    );

    wrapper.find('#buttonDeleteProject').simulate('click');
    expect(deleteProject).not.toBeCalled();
  });
});
