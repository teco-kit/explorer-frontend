var apiConsts = require('./ApiConstants');
const ax = require('axios');
const { default: LocalStorageService } = require('../LocalStorageService');
const axios = ax.create();
const localStorageService = LocalStorageService.getService();

axios.interceptors.request.use(config => {
  const token = localStorageService.getAccessToken();
  if (token) {
    config.headers['Authorization'] = token;
  }
  return config;
});

module.exports.getDatasets = () => {
  return new Promise((resolve, reject) => {
    axios(
      apiConsts.generateApiRequest(
        apiConsts.HTTP_METHODS.GET,
        apiConsts.API_URI,
        apiConsts.API_ENDPOINTS.DATASETS
      )
    )
      .then(result => resolve(result.data))
      .catch(err => {
        window.alert(err);
      });
  });
};

module.exports.getDataset = (accessToken, id, callback) => {
  axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.GET,
      apiConsts.API_URI,
      apiConsts.API_ENDPOINTS.DATASETS + `/${id}`
    )
  )
    .then(dataset => callback(dataset.data))
    .catch(err => console.log(err));
};

module.exports.deleteDatasets = (accessToken, ids, callback) => {
  console.log(ids);
  let promises = [];
  for (let id of ids) {
    promises = [
      ...promises,
      axios(
        apiConsts.generateApiRequest(
          apiConsts.HTTP_METHODS.DELETE,
          apiConsts.API_URI,
          apiConsts.API_ENDPOINTS.DATASETS + `/${id}`
        )
      )
    ];
  }
  return Promise.all(promises)
    .then(callback(false))
    .catch(err => callback(err));
};

module.exports.deleteDataset = (accessToken, id, callback) => {
  axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.DELETE,
      apiConsts.API_URI,
      apiConsts.API_ENDPOINTS.DATASETS + `/${id}`
    )
  )
    .then(callback(false))
    .catch(callback(true));
};

module.exports.updateDataset = (accessToken, dataset, callback) => {
  axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.PUT,
      apiConsts.API_URI,
      apiConsts.API_ENDPOINTS.DATASETS + `/${dataset['_id']}`,
      dataset
    )
  )
    .then(
      axios(
        apiConsts.generateApiRequest(
          apiConsts.HTTP_METHODS.GET,
          apiConsts.API_URI,
          apiConsts.API_ENDPOINTS.DATASETS + `/${dataset['_id']}`
        )
      )
        .then(updatedDataset => {
          callback(updatedDataset.data);
        })
        .catch(err => console.log(err))
    )
    .catch(err => console.log(err));
};

module.exports.createDataset = (accessToken, dataset, callback) => {
  console.log(dataset);
  axios(
    apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.POST,
      apiConsts.API_URI,
      apiConsts.API_ENDPOINTS.DATASETS,
      dataset
    )
  )
    .then(this.getDatasets(accessToken, callback))
    .catch(err => window.alert(err));
};
