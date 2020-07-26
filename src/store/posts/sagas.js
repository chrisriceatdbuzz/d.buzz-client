import { select, call, put, takeEvery } from "redux-saga/effects"
import {
  GET_REPLIES_REQUEST,
  getRepliesSuccess,
  getRepliesFailure,

  GET_CONTENT_REQUEST,
  getContentSuccess,
  getContentFailure,

  GET_TRENDING_POSTS_REQUEST,
  getTrendingPostsSuccess,
  getTrendingPostsFailure,
  setTrendingLastPost,

  GET_HOME_POSTS_REQUEST,
  getHomePostsSuccess,
  getHomePostsFailure,
  setHomeLastPost,

  GET_LATEST_POSTS_REQUEST,
  getLatestPostsSuccess,
  getLatestPostsFailure,
  setLatestLastPost,

  GET_TRENDING_TAGS_REQUEST,
  getTrendingTagsSuccess,
  getTrendingTagsFailure,

  UPVOTE_REQUEST,
  upvoteFailure,
} from './actions'

import {
  callBridge,
  fetchReplies,
  fetchContent,
  mapFetchProfile,
  fetchTrendingTags,
  fetchProfile,
  fetchFeedHistory,
  fetchRewardFund,
} from 'services/api'


function* getRepliesRequest(payload, meta) {
  const { author, permlink } = payload
  try {
    const data = yield call(fetchReplies, author, permlink)
    yield put(getRepliesSuccess(data, meta))
  } catch(error) {
    yield put(getRepliesFailure(error, meta))
  }
}

function* getContentRequest(payload, meta) {
  const { author, permlink } = payload
  try {
    const data = yield call(fetchContent, author, permlink)
    const profile = yield call(fetchProfile, author)
    data.profile = profile[0]
    yield put(getContentSuccess(data, meta))
  } catch(error) {
    yield put(getContentFailure(error, meta))
  }
}

function* getTrendingTagsRequests(meta) {
  try {
    let data = yield call(fetchTrendingTags)

    data = data.filter((tag) => !tag.name.includes('hive') && !tag.name.split('')[1].match(new RegExp('^\\d+$')))

    yield put(getTrendingTagsSuccess(data, meta))
  } catch (error) {
    yield put(getTrendingTagsFailure(error, meta))
  }
}

function* getTrendingPostsRequest(payload, meta) {
  const { start_permlink, start_author } = payload

  const params = { sort: 'trending', start_permlink, start_author }
  const method = 'get_ranked_posts'

  try {
    let old = yield select(state => state.posts.get('trending'))
    let data = yield call(callBridge, method, params)
    data = data.filter((post) => post.body.length <= 280)

    const getProfileData = mapFetchProfile(data)

    yield call([Promise, Promise.all], [getProfileData])

    data = [...old, ...data]

    yield put(setTrendingLastPost(data[data.length-1]))
    yield put(getTrendingPostsSuccess(data, meta))
  } catch(error) {
    yield put(getTrendingPostsFailure(error, meta))
  }
}

function* getHomePostsRequest(payload, meta) {
  const { start_permlink, start_author } = payload

  const params = { sort: 'trending', start_permlink, start_author }
  const method = 'get_ranked_posts'

  try {
    let old = yield select(state => state.posts.get('home'))
    let data = yield call(callBridge, method, params)
    data = data.filter((post) => post.body.length <= 280)

    const getProfileData = mapFetchProfile(data)

    yield call([Promise, Promise.all], [getProfileData])

    data = [...old, ...data]

    yield put(setHomeLastPost(data[data.length-1]))
    yield put(getHomePostsSuccess(data, meta))
  } catch(error) {
    yield put(getHomePostsFailure(error, meta))
  }
}

function* getLatestPostsRequest(payload, meta) {
  const { start_permlink, start_author } = payload

  const params = { sort: 'created', start_permlink, start_author }
  const method = 'get_ranked_posts'

  try {
    let old = yield select(state => state.posts.get('latest'))
    let data = yield call(callBridge, method, params)
    data = data.filter((post) => post.body.length <= 280)

    const getProfileData = mapFetchProfile(data)

    yield call([Promise, Promise.all], [getProfileData])

    data = [...old, ...data]

    yield put(setLatestLastPost(data[data.length-1]))
    yield put(getLatestPostsSuccess(data, meta))
  } catch(error) {
    yield put(getLatestPostsFailure(error, meta))
  }
}

function* upvoteRequest(payload, meta) {
  try {
    const { author, permlink, percentage } = payload
    const user = yield select(state => state.auth.get('user'))
    const { username, is_authenticated, useKeychain, profile } = user

    if(is_authenticated) {

      if(useKeychain) {

      } else {

        const rewardFund = yield call(fetchRewardFund, 'post')
        const feedHistory = yield call(fetchFeedHistory)
        let profile = yield call(fetchProfile, username)

        if(profile) {
          profile = profile[0]

          let {
            vesting_shares,
            received_vesting_shares,
            delegated_vesting_shares,
            voting_manabar,
          } = profile

          const { current_median_history } = feedHistory
          let { base } = current_median_history
          base = base.replace('HBD', '')

          const { current_mana: voting_power } = voting_manabar
          let { reward_balance, recent_claims } = rewardFund
          reward_balance = reward_balance.replace('HIVE','')

          vesting_shares = vesting_shares.replace('VESTS', '')
          received_vesting_shares = received_vesting_shares.replace('VESTS', '')
          delegated_vesting_shares = delegated_vesting_shares.replace('VESTS', '')
          const total_vests = parseFloat(vesting_shares) + parseFloat(received_vesting_shares) - parseFloat(delegated_vesting_shares)
          const final_vests = total_vests * 1e6
          const power = (voting_power * percentage / 10000) / 50
          const rshares = power * final_vests / 10000
          const estimate = rshares / parseFloat(recent_claims) * parseFloat(reward_balance) * parseFloat(base)


          console.log({ feedHistory })
          console.log({ total_vests })
          console.log({ final_vests })
          console.log({ power })
          console.log({ rshares })
          console.log({ estimate })
          console.log({ recent_claims: parseFloat(recent_claims) })
          console.log({ reward_balance: parseFloat(reward_balance) })

        }

      }

    } else {
      yield put(upvoteFailure('Unauthenticated', meta))
    }

  } catch(error) {
    yield put(upvoteFailure(error, meta))
  }
}

function* watchGetRepliesRequest({ payload, meta }) {
  yield call(getRepliesRequest, payload, meta)
}

function* watchGetContentRequest({ payload, meta }) {
  yield call(getContentRequest, payload, meta)
}

function* watchGetTrendingTagsRequest({ meta }) {
  yield call(getTrendingTagsRequests, meta)
}

function* watchGetTrendingPostsRequest({ payload, meta }) {
  yield call(getTrendingPostsRequest, payload, meta)
}

function* watchGetHomePostsRequest({ payload, meta }) {
  yield call(getHomePostsRequest, payload, meta)
}

function* watchGetLatestPostsRequest({payload, meta}) {
  yield call(getLatestPostsRequest, payload, meta)
}

function* watchUpvoteRequest({ payload, meta }) {
  yield call(upvoteRequest, payload, meta)
}

export default function* sagas() {
  yield takeEvery(GET_LATEST_POSTS_REQUEST, watchGetLatestPostsRequest)
  yield takeEvery(GET_HOME_POSTS_REQUEST, watchGetHomePostsRequest)
  yield takeEvery(GET_TRENDING_POSTS_REQUEST, watchGetTrendingPostsRequest)
  yield takeEvery(GET_REPLIES_REQUEST, watchGetRepliesRequest)
  yield takeEvery(GET_CONTENT_REQUEST, watchGetContentRequest)
  yield takeEvery(GET_TRENDING_TAGS_REQUEST, watchGetTrendingTagsRequest)
  yield takeEvery(UPVOTE_REQUEST, watchUpvoteRequest)
}

