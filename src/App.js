import React, { Component } from 'react';
import {
  Container,
  Navbar,
  NavbarBrand,
  Nav,
  NavItem,
  Button,
  Form,
  Collapse,
  NavbarToggler,
  DropdownItem,
  Dropdown,
  DropdownToggle,
  DropdownMenu
} from 'reactstrap';
import { Route, Link } from 'react-router-dom';
import CustomDropDownMenu from './components/CustomDropDownMenu/CustomDropDownMenu';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import './App.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUser } from '@fortawesome/free-solid-svg-icons';

import AuthWall from './routes/login';
import RegisterPage from './routes/register';
import ListPage from './routes/list';
import DatasetPage from './routes/dataset';
import LabelingsPage from './routes/labelings';
import ExperimentsPage from './routes/experiments';
import ErrorPage from './components/ErrorPage/ErrorPage';
import { getProjects } from './services/ApiServices/ProjectService';
import EditProjectModal from './components/EditProjectModal/EditProjectModal';
import {
  setProject,
  getProject,
  clearToken
} from './services/LocalStorageService';
import ProjectSettings from './routes/projectSettings';
import UserSettingsModal from './components/UserSettingsModal/UserSettingsModal';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {
        access_token: undefined
      },
      isLoggedIn: false,
      isTwoFactorAuthenticated: false,
      navbarState: {
        isOpen: false
      },
      videoEnaled: false,
      playButtonEnabled: false,
      currentUserMail: undefined,
      projects: undefined,
      currentProject: undefined,
      projectsOpen: false,
      projectEditModalOpen: false,
      projectEditModalNew: false,
      userSettingsModalOpen: false
    };
    this.logoutHandler = this.logoutHandler.bind(this);
    this.onLogout = this.onLogout.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.toggleNavbar = this.toggleNavbar.bind(this);
    this.toggleVideoOptions = this.toggleVideoOptions.bind(this);
    this.getVideoOptions = this.getVideoOptions.bind(this);
    this.setAccessToken = this.setAccessToken.bind(this);
    this.getCurrentUserMail = this.getCurrentUserMail.bind(this);
    this.setCurrentUserMail = this.setCurrentUserMail.bind(this);
    this.setUser = this.setUser.bind(this);
    this.toggleProjects = this.toggleProjects.bind(this);
    this.onProjectClick = this.onProjectClick.bind(this);
    this.onProjectEditModal = this.onProjectEditModal.bind(this);
    this.onProjectModalClose = this.onProjectModalClose.bind(this);
    this.onProjectChanged = this.onProjectChanged.bind(this);
    this.refreshProjects = this.refreshProjects.bind(this);
    this.toggleUserSettingsModal = this.toggleUserSettingsModal.bind(this);
  }

  toggleUserSettingsModal() {
    this.setState({
      userSettingsModalOpen: !this.state.userSettingsModalOpen
    });
  }

  onProjectChanged(projects) {
    if (projects.length !== 0) {
      setProject(projects[0]._id);
    }
    this.setState({
      projects: projects,
      currentProject: 0,
      projectEditModalOpen: false
    });
  }

  onProjectModalClose() {
    this.setState({
      projectEditModalOpen: false
    });
  }

  onProjectEditModal(isNew) {
    this.setState({
      projectEditModalOpen: true,
      projectEditModalNew: isNew
    });
  }

  onProjectClick(index) {
    //Check if a page needs to be redirected
    if (this.props.location.pathname.includes('datasets')) {
      this.props.history.push('/');
    }

    setProject(this.state.projects[index]._id);
    this.setState({
      currentProject: index
    });
  }

  toggleProjects() {
    this.setState({
      projectsOpen: !this.state.projectsOpen
    });
  }

  refreshProjects() {
    getProjects().then(projects => {
      if (projects.length === 0) {
        this.setState({
          projects: []
        });
        return;
      }
      var currentProject = projects.findIndex(elm => elm._id === getProject());
      if (currentProject === -1) {
        currentProject = 0;
        setProject(projects[0]._id);
      } else {
        setProject(projects[currentProject]._id);
      }
      this.setState({
        projects: projects,
        currentProject: currentProject
      });
    });
  }

  setUser(currentUser, callback) {
    this.refreshProjects();

    this.setState(
      {
        user: { ...this.state.user, ...currentUser },
        isLoggedIn: true
      },
      () => {
        if (callback) {
          callback();
        }
      }
    );
  }

  getCurrentUserMail() {
    return this.state.currentUserMail;
  }

  setCurrentUserMail(currentUserMail) {
    this.setState({
      currentUserMail: currentUserMail
    });
  }

  async setAccessToken(token) {
    let tmpUser = { ...this.state.user };
    tmpUser.access_token = token;
    this.setState({
      user: tmpUser
    });
  }

  onLogout(didSucceed) {
    if (didSucceed) {
      clearToken();
      this.props.history.push('/');
      this.setState({
        user: {
          access_token: undefined
        },
        isLoggedIn: false,
        isTwoFactorAuthenticated: false
      });
    }
  }

  onLogin(didSucceed) {
    if (didSucceed) {
      this.setState({
        isLoggedIn: didSucceed
      });
    }
  }

  logoutHandler() {
    this.onLogout(true);
  }

  toggleNavbar() {
    this.setState({
      navbarState: {
        isOpen: !this.state.navbarState.isOpen
      }
    });
  }

  toggleVideoOptions(videoStatus, playButtonStatus) {
    this.setState({
      videoEnaled: videoStatus,
      playButtonEnabled: playButtonStatus
    });
  }

  getVideoOptions() {
    return {
      videoEnabled: this.state.videoEnaled,
      playButtonEnabled: this.state.playButtonEnabled
    };
  }

  render() {
    const projectAvailable = this.state.projects
      ? this.state.projects[this.state.currentProject]
      : undefined;
    return (
      <div>
        <EditProjectModal
          project={
            this.state.projects
              ? this.state.projects[this.state.currentProject]
              : undefined
          }
          isOpen={this.state.projectEditModalOpen}
          isNewProject={this.state.projectEditModalNew}
          onClose={this.onProjectModalClose}
          projectChanged={this.onProjectChanged}
        ></EditProjectModal>
        <Route
          exact
          path="/register"
          render={props => <RegisterPage {...props} />}
        />
        {this.props.history.location.pathname !== '/register' ? (
          <AuthWall
            isLoggedIn={this.state.isLoggedIn}
            isTwoFactorAuthenticated={this.state.isTwoFactorAuthenticated}
            onLogin={this.onLogin}
            onCancelLogin={this.logoutHandler}
            setAccessToken={this.setAccessToken}
            setCurrentUserMail={this.setCurrentUserMail}
            setUser={this.setUser}
            twoFactorEnabled={this.state.user.twoFactorEnabled}
            on2FA={this.on2FA}
          >
            {/* Only load these components when the access token is available else they gonna preload and cannot access api */}
            {this.state.isLoggedIn && this.state.projects ? (
              <div>
                <Navbar color="light" light expand="md">
                  <NavbarBrand style={{ marginRight: '8px' }}>
                    Explorer
                  </NavbarBrand>
                  <NavbarToggler onClick={this.toggleNavbar} />
                  <Collapse isOpen={this.state.navbarState.isOpen} navbar>
                    <Nav navbar className="mr-auto">
                      <NavItem
                        style={{
                          borderRight: '1px solid',
                          borderColor: 'gray',
                          marginRight: '8px',
                          marginLeft: '8px'
                        }}
                      ></NavItem>
                      <NavItem>
                        <div style={{ display: 'flex', marginLeft: '8px' }}>
                          <div style={{ display: 'block', margin: 'auto' }}>
                            <FontAwesomeIcon
                              onClick={() => this.onProjectEditModal(true)}
                              style={{
                                color: '#8b8d8f',
                                float: 'left',
                                margin: 'auto',
                                cursor: 'pointer'
                              }}
                              icon={faPlus}
                              className="mr-2 fa-s"
                            />
                          </div>

                          <Dropdown
                            className="navbar-dropdown"
                            style={{ float: 'right' }}
                            nav
                            inNavbar
                            isOpen={this.state.projectsOpen}
                            toggle={this.toggleProjects}
                          >
                            <DropdownToggle
                              className={
                                this.state.projects.length === 0
                                  ? 'disabled'
                                  : ''
                              }
                              nav
                              caret
                              style={{ paddingLeft: '0px' }}
                            >
                              {projectAvailable
                                ? this.state.projects[this.state.currentProject]
                                    .name
                                : this.state.projects.length === 0
                                ? 'No projects'
                                : 'Loading'}
                            </DropdownToggle>
                            {this.state.projects.length === 0 ? null : (
                              <DropdownMenu>
                                {this.state.projects.map((project, index) => {
                                  return (
                                    <DropdownItem
                                      onClick={() => this.onProjectClick(index)}
                                      key={project._id}
                                    >
                                      {project.name}
                                    </DropdownItem>
                                  );
                                })}
                              </DropdownMenu>
                            )}
                          </Dropdown>
                        </div>
                      </NavItem>
                    </Nav>
                    <Nav
                      navbar
                      className="ml-auto"
                      style={{ alignItems: 'center' }}
                    >
                      <NavItem>
                        <Link className="nav-link" to="/list">
                          Datasets
                        </Link>
                      </NavItem>
                      <NavItem>
                        <Link className="nav-link" to="/labelings">
                          Labelings
                        </Link>
                      </NavItem>
                      <NavItem>
                        <Link className="nav-link" to="/experiments">
                          Experiments
                        </Link>
                      </NavItem>
                      <NavItem>
                        <Link className="nav-link" to="/settings">
                          Settings
                        </Link>
                      </NavItem>
                      <NavItem style={{ paddingLeft: '8px' }}>
                        <CustomDropDownMenu
                          content={
                            <FontAwesomeIcon
                              style={{
                                color: '#8b8d8f',
                                float: 'left',
                                margin: 'auto',
                                cursor: 'pointer'
                              }}
                              icon={faUser}
                              className="mr-2 fa-s"
                            />
                          }
                          items={[
                            <div>
                              Signed in as <b>{this.state.user.email}</b>
                            </div>,
                            <Button
                              className="m-0 my-2 my-sm-0"
                              outline
                              color="danger"
                              onClick={this.logoutHandler}
                            >
                              Logout
                            </Button>,
                            <hr style={{ margin: '8px' }}></hr>,
                            <Button
                              outline
                              onClick={this.toggleUserSettingsModal}
                            >
                              User settings
                            </Button>
                          ]}
                        ></CustomDropDownMenu>
                        <UserSettingsModal
                          isOpen={this.state.userSettingsModalOpen}
                          onClose={this.toggleUserSettingsModal}
                        ></UserSettingsModal>
                      </NavItem>
                    </Nav>
                  </Collapse>
                </Navbar>

                <Container>
                  <Route
                    exact
                    path="/list"
                    render={props => (
                      <ListPage
                        {...props}
                        project={this.state.projects[this.state.currentProject]}
                      />
                    )}
                  />
                  <Route
                    exact
                    path="/labelings"
                    render={props => (
                      <LabelingsPage
                        {...props}
                        project={this.state.projects[this.state.currentProject]}
                      />
                    )}
                  />
                  <Route
                    exact
                    path="/labelings/new"
                    render={props => (
                      <LabelingsPage
                        {...props}
                        project={this.state.projects[this.state.currentProject]}
                      />
                    )}
                  />
                  <Route
                    exact
                    path="/"
                    render={props => (
                      <ListPage
                        {...props}
                        project={this.state.projects[this.state.currentProject]}
                      />
                    )}
                  />
                  <Route
                    path="/datasets/:id"
                    render={props => (
                      <DatasetPage
                        {...props}
                        getVideoOptions={this.getVideoOptions}
                      />
                    )}
                  />
                  <Route
                    exact
                    path="/experiments"
                    render={props => (
                      <ExperimentsPage
                        {...props}
                        project={this.state.projects[this.state.currentProject]}
                      />
                    )}
                  />
                  <Route
                    exact
                    path="/experiments/new"
                    render={props => (
                      <ExperimentsPage
                        {...props}
                        project={this.state.projects[this.state.currentProject]}
                      />
                    )}
                  />
                  <Route
                    exact
                    path="/settings"
                    render={props => (
                      /*<SettingsPage
                        {...props}
                        getCurrentUserMail={this.getCurrentUserMail}
                        onLogout={this.logoutHandler}
                        onVideoOptionsChange={this.toggleVideoOptions}
                        getVideoOptions={this.getVideoOptions}
                        user={this.state.user}
                        setAccessToken={this.setAccessToken}
                        twoFactorEnabled={this.state.user.twoFactorEnabled}
                      />*/
                      <ProjectSettings
                        project={this.state.projects[this.state.currentProject]}
                        projectChanged={this.onProjectChanged}
                      ></ProjectSettings>
                    )}
                  />
                  <Route
                    exact
                    path="/errorpage/:error/:errorText/:statusText"
                    render={props => <ErrorPage {...props} />}
                  />
                </Container>
              </div>
            ) : null}
          </AuthWall>
        ) : null}
      </div>
    );
  }
}

export default App;
