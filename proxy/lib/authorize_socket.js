const { User, Theme, Session } = require("../models")
const axios = require("axios")
const Errors = require("./errors")
const parseCookie = (str) =>
  str
    .split(";")
    .map((v) => v.split("="))
    .reduce((acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim())
      return acc
    }, {})
module.exports = async function (socket, next) {
  try {
    const cookies = parseCookie(socket.handshake.headers.cookie)
    if (cookies["bcSession"]) {
      const session = await Session.findOne({
        where: { session: cookies["bcSession"] }
      })
      if (session) {
        const user = await User.findOne({
          where: { id: session.userId },
          attributes: {
            exclude: ["totp", "compassSession", "password"]
          },
          include: [
            {
              model: Theme,
              as: "themeObject"
            }
          ],
          raw: true
        })
        if (user) {
          socket.user = user
          socket.compassUser = {
            id: user.compassUserId,
            username: user.sussiId
          }
          next()
        }
      } else {
        //
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
                socket.handshake.query.compassInstance || "devices",
              Cookie: socket.handshake.headers["cookie"] || ""
            },
            timeout: 2000
          }
        )
        .then(async (response) => {
          if (response.data.data) {
            response.data.data.currentUser.id = JSON.parse(
              response.data.data.currentUser.id
            )
            socket.compassUser = response.data.data.currentUser
            const user = await User.findOne({
              where: {
                compassUserId: socket.compassUser.id,
                instance: socket.handshake.query.compassInstance || "devices"
              },
              attributes: {
                exclude: ["totp", "compassSession", "password"]
              },
              include: [
                {
                  model: Theme,
                  as: "themeObject"
                }
              ],
              raw: true
            })
            if (user) {
              if (user.bcSessions) {
                // error
              } else {
                socket.user = user
                next()
              }
            }
          }
        })
        .catch(() => {
          console.log(
            "Something went wrong while communicating to Compass' GraphQL API"
          )
        })
    }
  } catch (error) {
    //
  }
}
