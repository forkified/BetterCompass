const express = require("express")
const router = express.Router()
const Errors = require("../lib/errors.js")
const axios = require("axios")
const os = require("os")
const rateLimit = require("express-rate-limit")

const limiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 10,
  message: Errors.rateLimit,
  standardHeaders: true,
  legacyHeaders: false
})

router.get("/", limiter, async (req, res, next) => {
  try {
    let status = []
    axios.defaults.timeout = 1000
    status.push({
      name: `BetterCompass (${os.hostname()})`,
      status: true
    })
    status.push({
      name: "Compass Status & Incidents",
      status: await axios
        .get("https://status.compass.education")
        .then(() => true)
        .catch(() => false)
    })
    status.push({
      name: "PD01",
      status: await axios
        .get(
          "https://env-me1pd01.compass.education/Services/Heartbeat.svc/ReadyForConnections"
        )
        .then(() => true)
        .catch(() => false)
    })
    status.push({
      name: "PD02",
      status: await axios
        .get(
          "https://env-me1pd02.compass.education/Services/Heartbeat.svc/ReadyForConnections"
        )
        .then(() => true)
        .catch(() => false)
    })
    status.push({
      name: "PD03",
      status: await axios
        .get(
          "https://env-me1pd03.compass.education/Services/Heartbeat.svc/ReadyForConnections"
        )
        .then(() => true)
        .catch(() => false)
    })
    status.push({
      name: "PD04",
      status: await axios
        .get(
          "https://env-me1pd04.compass.education/Services/Heartbeat.svc/ReadyForConnections"
        )
        .then(() => true)
        .catch(() => false)
    })
    status.push({
      name: "PD05",
      status: await axios
        .get(
          "https://env-me1pd05.compass.education/Services/Heartbeat.svc/ReadyForConnections"
        )
        .then(() => true)
        .catch(() => false)
    })
    status.push({
      name: "PD06",
      status: await axios
        .get(
          "https://env-me1pd06.compass.education/Services/Heartbeat.svc/ReadyForConnections"
        )
        .then(() => true)
        .catch(() => false)
    })
    status.push({
      name: "CL1",
      status: await axios
        .get(
          "https://me1-ha-pool2.compass.education/Services/Heartbeat.svc/ReadyForConnections"
        )
        .then(() => true)
        .catch(() => false)
    })
    status.push({
      name: "CL2",
      status: await axios
        .get(
          "https://me1-ha-pool3.compass.education/Services/Heartbeat.svc/ReadyForConnections"
        )
        .then(() => true)
        .catch(() => false)
    })
    status.push({
      name: "BN1",
      status: await axios
        .get(
          "https://env-bn1.compass.education/Services/Heartbeat.svc/ReadyForConnections"
        )
        .then(() => true)
        .catch(() => false)
    })
    res.json(status)
  } catch (err) {
    next(err)
  }
})

router.get("/incidents", async (req, res, next) => {
  try {
    axios
      .get("https://status.compass.education/api/v1/incidents")
      .then((response) => {
        res.json(response.data)
      })
  } catch (err) {
    next(err)
  }
})
module.exports = router
