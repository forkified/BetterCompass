const { User, Theme, Session } = require("../models")
const axios = require("axios")
const Errors = require("./errors")
module.exports = function (req, res, next) {
  try {
    if (req.header("Authorization")) {
      const token = req.header("Authorization")
      const session = Session.findOne({ where: { session: token } })
      if (session) {
        const user = User.findOne({ where: { id: session.userId } })
        if (user) {
          req.user = user
          req.compassUser = {
            id: user.compassUserId,
            username: user.sussiId
          }
          next()
        }
      }
    } else {
      axios
        .post(
          "http://localhost:23994/graphql",
          {
            query: `
      query UserData {
  currentUser {
    id
    username
  }
}`
          },
          {
            headers: {
              compassInstance:
                req.header("compassInstance") ||
                req.query.compassInstance ||
                "devices",
              Cookie: req.header("Cookie") || ""
            },
            timeout: 2000
          }
        )
        .then(async (response) => {
          if (response.data.data) {
            response.data.data.currentUser.id = JSON.parse(
              response.data.data.currentUser.id
            )
            req.compassUser = response.data.data.currentUser
            const user = await User.findOne({
              where: {
                compassUserId: req.compassUser.id,
                instance:
                  req.header("compassInstance") ||
                  req.query.compassInstance ||
                  "devices"
              },
              attributes: {
                exclude: ["totp", "compassSession", "password"]
              },
              include: [
                {
                  model: Theme,
                  as: "themeObject"
                }
              ]
            })
            if (user) {
              if (user.bcSessions) {
                throw Errors.bcSessionsForced
              }
              await user.update({
                lastSeenAt: new Date().toISOString()
              })
              req.user = user
              next()
            } else {
              req.compassUser = response.data.data.currentUser
              console.log(
                "Creating account for user: " + req.compassUser.userId,
                req.compassUser.sussiId
              )
              req.user = await User.create({
                sussiId: response.data.data.currentUser.username,
                compassUserId: response.data.data.currentUser.id,
                displayCode: response.data.data.currentUser.username,
                instance:
                  req.header("compassInstance") ||
                  req.query.compassInstance ||
                  "unknown",
                settings: {},
                compassUserHash: response.data.data.currentUser.userHash,
                theme: "dark",
                settingsSync: true
              })
              next()
            }
          } else {
            res.status(401).json({
              errors: [
                {
                  message: "You need to be logged in."
                }
              ]
            })
          }
        })
        .catch(() => {
          res.status(500).json({
            errors: [
              {
                message: "Something went wrong."
              }
            ]
          })
        })
    }
  } catch (e) {
    console.log(e)
  }
}
