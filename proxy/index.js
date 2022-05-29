console.log("Initializing")
require("dotenv").config()
let express = require("express")
let app = express()
//Middle-ware
let bodyParser = require("body-parser")
let os = require("os")
let axios = require("axios")
const { createProxyMiddleware } = require("http-proxy-middleware")
const cookieParser = require("cookie-parser")
app.use(cookieParser())
app.set("trust proxy", true)
const { Feedback, Session } = require("./models")
const auth = require("./lib/authorize.js")
const semver = require("semver")
const path = require("path")
const socket = require("./lib/socket")
const server = require("http").createServer(app)
const Errors = require("./lib/errors")

const compassRouter = function (req) {
  const instance =
    req.header("compassInstance") ||
    req.query.compassInstance ||
    req.query.forceInstance ||
    "devices"
  // this is to avoid the ability to proxy non Compass sites through the proxy.
  if (instance.match(/^[a-zA-Z0-9-]+$/)) {
    return "https://" + instance + ".compass.education"
  } else {
    console.log("Test failed: " + "https://" + instance + ".compass.education")
    return "https://devices.compass.education"
  }
}
app.use(function (req, res, next) {
  if (req.header("Authorization") || req.cookies.bcSession) {
    Session.findOne({
      where: {
        session: req.header("Authorization") || req.cookies.bcSession || ""
      }
    })
      .then((session) => {
        if (session) {
          req.headers.cookie = `ASP.NET_SessionId=${session.compassSession}`
        }
        next()
      })
      .catch(() => {
        next()
      })
  } else {
    res.clearCookie("cpssid_" + req.header("compassSchoolId"))
    res.header("Access-Control-Allow-Origin", process.env.HOSTNAME)
    res.header("Access-Control-Allow-Methods", "*")
    res.header(
      "Access-Control-Allow-Headers",
      req.header("access-control-request-headers")
    )
    next()
  }
})

// these are overrides to avoid Set-Cookie headers being sent to the client which can break logging out of BetterCompass in case of session expiration, or manual logout.
app.post(
  "/services/admin.svc/GetSchoolName",
  bodyParser.json({ limit: "15mb" }),
  bodyParser.urlencoded({ extended: true }),
  async (req, res, next) => {
    try {
      axios
        .post(
          "https://devices.compass.education/services/admin.svc/GetSchoolName",
          {
            keyword: req.body.keyword
          }
        )
        .then((resp) => {
          res.json(resp.data)
        })
        .catch((e) => {
          res.status(500).json(e?.response?.data || Errors.unknown)
        })
    } catch (e) {
      next(e)
    }
  }
)

app.post(
  "/services/admin.svc/GetSchoolDetailBasic",
  bodyParser.json({ limit: "15mb" }),
  bodyParser.urlencoded({ extended: true }),
  async (req, res, next) => {
    try {
      axios
        .post(
          "https://devices.compass.education/services/admin.svc/GetSchoolDetailBasic",
          {
            schoolName: req.body.schoolName
          }
        )
        .then((resp) => {
          res.json(resp.data)
        })
        .catch((e) => {
          res.status(500).json(e?.response?.data || Errors.unknown)
        })
    } catch (e) {
      next(e)
    }
  }
)

app.post(
  "/services/mobile.svc/TestAuth",
  bodyParser.json({ limit: "15mb" }),
  bodyParser.urlencoded({ extended: true }),
  async (req, res, next) => {
    try {
      axios
        .post(`${compassRouter(req)}/services/mobile.svc/TestAuth`, "", {
          headers: {
            Cookie: req.header("Cookie") || "",
            compassInstance: req.header("compassInstance") || "devices"
          }
        })
        .then((resp) => {
          res.json(resp.data)
        })
        .catch((e) => {
          res.status(500).json(e?.response?.data || Errors.unknown)
        })
    } catch (e) {
      next(e)
    }
  }
)
app.use(
  "/Assets/Scripts/Lib/ckeditor/plugins/smiley/images",
  express.static(path.join(__dirname, "./assets/smiley"))
)

app.use(
  ["/Services", "/services", "/download", "/Assets*", "/graphql"],
  createProxyMiddleware({
    target: "devices.compass.education",
    router: compassRouter,
    changeOrigin: true,
    cookieDomainRewrite: process.env.HOSTNAME,
    onProxyReq: (proxyReq, req) => {
      proxyReq.removeHeader("compassUserId")
      proxyReq.removeHeader("compassSchoolId")
      proxyReq.removeHeader("compassInstance")
      proxyReq.removeHeader("Authorization")
      proxyReq.setHeader("origin", compassRouter(req))
      proxyReq.setHeader("referer", compassRouter(req))
    }
  })
)

app.use(bodyParser.json({ limit: "15mb" }))
app.use(bodyParser.urlencoded({ extended: true }))

app.use("/api/v1/user", require("./routes/user.js"))
app.use("/api/v1/themes", require("./routes/theme.js"))
app.use("/api/v1/communications", require("./routes/communications.js"))
app.use("/api/v1/admin", require("./routes/admin.js"))
app.use("/api/v1/parentLink", require("./routes/parentlink.js"))
app.use("/api/v1/status", require("./routes/status.js"))
app.use("/usercontent", require("./routes/usercontent.js"))
app.use("/api/v1/usercontent", require("./routes/usercontent.js"))
app.use("/api/v1/activity", require("./routes/activity.js"))
app.get("/api/v1/state", async (req, res) => {
  try {
    if (semver.lte(req.query.v, "1.0.88")) {
      res.json({
        release: process.env.RELEASE,
        loading: true,
        notification:
          "You are using a critically outdated version of BetterCompass, you must update to continue.",
        latestVersion: require("../package.json").version
      })
    } else {
      res.json({
        release: process.env.RELEASE,
        loading: true,
        notification: process.env.NOTIFICATION,
        notificationType: process.env.NOTIFICATION_TYPE,
        latestVersion: require("../package.json").version
      })
    }
  } catch {
    res.json({
      release: process.env.RELEASE,
      loading: true,
      notification: process.env.NOTIFICATION,
      latestVersion: require("../package.json").version
    })
  }
})

app.post("/api/v1/feedback", auth, async (req, res, next) => {
  try {
    await Feedback.create({
      feedbackText: req.body.text,
      starRating: req.body.starRating,
      debug: {
        client: req.body.debug
      },
      route: req.body.route,
      userId: req.user.id,
      tenant:
        req.header("compassInstance") ||
        req.query.compassInstance ||
        req.query.forceInstance ||
        "unknown"
    })
    res.sendStatus(204)
  } catch (e) {
    next(e)
  }
})

app.get("/api/v1/weather", (req, res) => {
  try {
    axios
      .get("http://ip-api.com/json/" + req.header("x-real-ip") || req.ip)
      .then((response1) => {
        console.log(response1.data)
        axios
          .get(
            "https://api.openweathermap.org/data/2.5/weather?lat=" +
              response1.data.lat +
              "&lon=" +
              response1.data.lon +
              "&appid=" +
              process.env.WEATHER_API_KEY +
              "&units=metric"
          )
          .then((response2) => {
            res.send(response2.data)
          })
          .catch((error) => {
            res.json({
              message: "Weather widget API failure.",
              error: error?.response?.data
            })
          })
      })
      .catch(() => {
        res.json({ success: false })
      })
  } catch {
    res.status(500).json({ success: false })
  }
})

app.all("/api/*", (req, res) => {
  res.status(404).json({
    message: "This is reserved, and cannot be proxied through Compass."
  })
})

console.log(os.hostname())

app.use(require("./lib/errorHandler"))

server.listen(23994, () => {
  console.log("Initialized")
  console.log("Listening on port 0.0.0.0:" + 23994)

  app.locals.appStarted = true
  app.emit("appStarted")
})

socket.init(app, server)

module.exports = app
