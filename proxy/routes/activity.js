const express = require("express")
const router = express.Router()
const Errors = require("../lib/errors.js")
const { User, Friend } = require("../models")
const path = require("path")
const axios = require("axios")
const auth = require("../lib/authorize.js")

router.get("/enrollments/:activityId", auth, async (req, res, next) => {
  try {
    let enrollments = await axios.post(
      "http://localhost:23994/Services/Activity.svc/GetEnrolmentsByActivityId",
      {
        activityId: req.params.activityId,
        limit: 200,
        page: 1,
        start: 0
      },
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: req.headers.cookie,
          compassInstance: req.header("compassInstance")
        }
      }
    )
    let uniqueUsers = []
    enrollments.data.d.forEach((user) => {
      if (uniqueUsers.findIndex((u) => u.uid === user.uid) === -1) {
        uniqueUsers.push(user.uid)
      }
    }, [])
    const users = await User.findAll({
      where: {
        compassUserId: uniqueUsers,
        instance: req.user.instance
      },
      raw: true
    })
    for (const enrollment of enrollments.data.d) {
      const user = users.find((u) => u.compassUserId === enrollment.uid)
      enrollment.user = {}
      if (user) {
        enrollment.user.id = user.id
        enrollment.user.usesBetterCompass = true
        enrollment.user.communicationsEnabled =
          user.privacy.communications.enabled
      } else {
        enrollment.user.usesBetterCompass = false
        enrollment.user.communicationsEnabled = false
      }
    }
    res.json(enrollments.data.d)
  } catch (e) {
    next(e)
  }
})

module.exports = router
