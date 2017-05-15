'use strict'

require(`dotenv`).config()

const { stripIndent } = require(`common-tags`)

const Koa = require(`koa`)
const createKoaRouter = require(`koa-router`)
const koaSend = require(`koa-send`)
const bodyParser = require(`koa-bodyparser`)

const { graphql, graphiql } = require(`./api`)
const requestGithubToken = require(`./lib/request-github-token`)

const app = new Koa()
const router = createKoaRouter()

router.get(/^\/assets(?:\/|$)/, async (ctx) => {
  const assetPath = ctx.path.replace(/assets\//, ``)
  await koaSend(ctx, assetPath, {
    root: `${__dirname}/../../build`,
  })
})

router.post(`/graphql`, graphql)
router.get(`/graphiql`, graphiql)

router.get(`/login`, async (ctx) => {
  if (!ctx.request.query.code) {
    return
  }
  const accessToken = await requestGithubToken(ctx.request.query.code)
  ctx.redirect(`/login-success?access_token=${accessToken}`)
})

const BUNDLE_URL = (process.env.NODE_ENV === `production`)
  ? `/assets/main.bundle.js`
  : `http://localhost:${process.env.WEBPACK_DEV_PORT}/build/main.bundle.js`

router.get(/(?:\/|$)/, async (ctx) => {
  // language=HTML
  ctx.body = stripIndent`
    <!doctype html>
    <html>
      <head>
        <title>Vue.js Component Database</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700,400italic">
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        ${process.env.NODE_ENV === `production` ? `<link href="/assets/main.bundle.css" rel="stylesheet">` : ``}
      </head>
      <body>
        <main id="main">
        </main>
        <script src="https://unpkg.com/babel-standalone@6.24.0/babel.min.js"></script>
        <script src="${BUNDLE_URL}"></script>
      </body>
    </html>
  `
})

app.use(bodyParser())
app.use(router.routes())
app.listen(process.env.APP_PORT, process.env.HOST_NAME)
