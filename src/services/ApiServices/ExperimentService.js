var apiConsts = require('./ApiConstants');
const axios = require('axios');
const { access } = require('fs');

module.exports.subscribeExperiments = (accessToken, callback) => {
  axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.GET,
      apiConsts.API_URI,
      apiConsts.API_ENDPOINTS.EXPERIMENTS,
      accessToken
    )
  )
    .then(experiments => callback(experiments.data))
    .catch(err => console.log(err));
};

module.exports.addExperiment = (accessToken, newExperiment, callback) => {
  axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.POST,
      apiConsts.API_URI,
      apiConsts.API_ENDPOINTS.EXPERIMENTS,
      accessToken,
      newExperiment
    )
  )
    .then(() =>
      axios(
        apiConsts.generateApiRequest(
          apiConsts.HTTP_METHODS.GET,
          apiConsts.API_URI,
          apiConsts.API_ENDPOINTS.EXPERIMENTS,
          accessToken
        )
      )
        .then(experiments => callback(experiments.data))
        .catch(err => console.log(err))
    )
    .catch(err => console.log(err));
};

module.exports.updateExperiment = (accessToken, experiment, callback) => {
  axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.PUT,
      apiConsts.API_URI,
      apiConsts.API_ENDPOINTS.EXPERIMENTS + `/${experiment['_id']}`,
      accessToken,
      experiment
    )
  )
    .then(() =>
      axios(
        apiConsts.generateApiRequest(
          apiConsts.HTTP_METHODS.GET,
          apiConsts.API_URI,
          apiConsts.API_ENDPOINTS.EXPERIMENTS
        )
      )
    )
    .then(experiments => callback(experiments.data))
    .catch(err => console.log(err));
};

module.exports.deleteExperiment = (accessToken, experimentId, callback) => {
  axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.DELETE,
      apiConsts.API_URI,
      apiConsts.API_ENDPOINTS.EXPERIMENTS + `/${experimentId}`,
      accessToken
    )
  )
    .then(() =>
      axios(
        apiConsts.generateApiRequest(
          apiConsts.HTTP_METHODS.GET,
          apiConsts.API_URI,
          apiConsts.API_ENDPOINTS.EXPERIMENTS,
          accessToken
        )
      )
        .then(experiments => callback(experiments))
        .catch(err => console.log(err))
    )
    .catch(err => console.log(err));
};