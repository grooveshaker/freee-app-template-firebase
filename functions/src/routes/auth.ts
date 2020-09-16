import Axios from 'axios'
import { stringify } from 'querystring'
import * as express from 'express'

const authApp = express()
const bodyParser = require('body-parser')
authApp.use(bodyParser.urlencoded({ extended: true }))
authApp.use(bodyParser.json())
authApp.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})

const authRouter = express.Router()

// Authorize
authRouter.get('/redirect', (req, res) => {
  console.log('Redirect is called')

  const baseUrl =
    process.env.NODE_ENV === 'production'
      ? 'http://ec2-18-190-26-69.us-east-2.compute.amazonaws.com/oauth'
      : 'http://localhost:3000/oauth'
  const clientId =
    '?client_id=9d39bddc5ac29096b3308a25a0760ae65c28ca63ef05c0f36058939e581707aa'
  const redirectUri =
    process.env.NODE_ENV === 'production'
      ? '&redirect_uri=https%3A%2F%2Fasia-northeast1-freee-app-strategit-auth.cloudfunctions.net%2Fapi%2Fauth%2Fcallback'
      : '&redirect_uri=http%3A//localhost%3A5001/freee-app-strategit-auth/us-central1/api/auth/callback'
  const responseType = '&response_type=code'
  const grantType = '&grant_type=authorization_code'
  const state = '&state=myState'

  res.redirect(
    baseUrl + clientId + redirectUri + responseType + grantType + state
  )
})

// Get token, login firebase and save token to firebase
authRouter.get('/callback', (req, res) => {
  console.log('Callback is called')

  const { code } = req.query

  Axios.post(
    process.env.NODE_ENV === 'production'
      ? 'http://ec2-18-190-26-69.us-east-2.compute.amazonaws.com/api/v1/oauth/token'
      : 'http://localhost:3000/api/v1/oauth/token',

    stringify({
      code: code,
      client_id:
        '9d39bddc5ac29096b3308a25a0760ae65c28ca63ef05c0f36058939e581707aa',
      client_secret:
        '561d5d04eb51f0a473b01d4198190ba7a42b35ac08cbb135027c368353b79020',
      grant_type: 'authorization_code',
      redirect_uri:
        process.env.NODE_ENV === 'production'
          ? 'https://asia-northeast1-freee-app-strategit-auth.cloudfunctions.net/api/auth/callback'
          : 'http://localhost:5001/freee-app-strategit-auth/us-central1/api/auth/callback'
    }),

    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  )
    .then(({ data }) => res.send(data))
    .catch(err => {
      console.error(err.response.data)
      res.send('some error occured.')
    })
})

authApp.use('/auth', authRouter)

export { authApp }
