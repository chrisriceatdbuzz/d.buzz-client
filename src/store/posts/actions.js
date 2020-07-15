export const GET_RANKED_POST_REQUEST = 'GET_RANKED_POST_REQUEST'
export const GET_RANKED_POST_SUCCESS = 'GET_RANKED_POST_SUCCESS'
export const GET_RANKED_POST_FAILURE = 'GET_RANKED_POST_FAILURE'

export const getRankedPostRequest = (sort = 'created', start_permlink = '', start_author = '') => ({
  type: GET_RANKED_POST_REQUEST,
  payload: { sort, start_permlink, start_author },
  meta: {
    thunk: true,
  },
})

export const getRankedPostSuccess = (response, meta) => ({
  type: GET_RANKED_POST_SUCCESS,
  payload: response,
  meta,
})

export const getRankedPostFailure = (error, meta) => ({
  type: GET_RANKED_POST_FAILURE,
  payload: error,
  meta,
})

export const SET_LAST_POST = 'SET_LAST_POST'

export const setLastPost = (post) => ({
  type: SET_LAST_POST,
  payload: post,
})


