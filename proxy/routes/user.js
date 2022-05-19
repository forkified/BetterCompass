const express = require("express")
const router = express.Router()
const Errors = require("../lib/errors.js")
const auth = require("../lib/authorize.js")
const axios = require("axios")
const { User, Session, Theme } = require("../models")
const cryptoRandomString = require("crypto-random-string")
const { Op } = require("sequelize")
const speakeasy = require("speakeasy")
const argon2 = require("argon2")
const UAParser = require("ua-parser-js")
const fs = require("fs")
const path = require("path")
const semver = require("semver")

router.post("/login", async (req, res, next) => {
  async function checkPassword(password, hash) {
    try {
      return await argon2.verify(hash, password)
    } catch {
      console.log("Error")
      return false
    }
  }
  async function generateSession(user) {
    try {
      const ua = UAParser(req.headers["user-agent"])
      let ip = {}
      await axios
        .get("http://ip-api.com/json/ " + req.header("x-real-ip") || req.ip)
        .then((res) => {
          ip = res.data
        })
        .catch(() => {})
      const session = await Session.create({
        userId: user.id,
        instance: req.body.instance || "",
        session: "BETTERCOMPASS-" + cryptoRandomString({ length: 128 }),
        compassUserId: user.compassUserId,
        sussiId: user.sussiId,
        expiredAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30),
        compassSession: user.compassSession,
        other: {
          ip: req.header("x-real-ip") || req.ip,
          location: ip.country
            ? `${ip.city} - ${ip.regionName} - ${ip.country}`
            : null,
          isp: ip.isp,
          asn: ip.as,
          browserString: ua.browser.name + " v" + ua.browser.major,
          osString: ua.os.name + " " + ua.os.version,
          browser: ua.browser.name,
          browserVersion: ua.browser.version,
          browserVersionMajor: ua.browser.major,
          os: ua.os.name,
          osVersion: ua.os.version
        }
      })
      res.cookie("bcSession", session.session, {
        httpOnly: true,
        secure: true,
        domain: process.env.HOSTNAME,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365
      })
      res.json({
        bcToken: session.session,
        bcSessions: true,
        success: true,
        userId: user.compassUserId,
        bcUserId: user.id
      })
    } catch (e) {
      console.log(e)
      return false
    }
  }
  try {
    const user = await User.findOne({
      where: {
        sussiId: req.body.username || "",
        instance: req.body.instance || ""
      }
    })
    if (user?.bcSessions) {
      if (await checkPassword(req.body.password, user.password)) {
        if (user.totpEnabled) {
          const verified = speakeasy.totp.verify({
            secret: user.totp,
            encoding: "base32",
            token: req.body.totp || ""
          })
          if (verified) {
            await generateSession(user)
          } else {
            throw Errors.invalidTotp
          }
        } else {
          await generateSession(user)
        }
      } else {
        throw Errors.invalidCredentials
      }
    } else {
      axios
        .post(
          "http://localhost:23994/services/admin.svc/AuthenticateUserCredentials",
          {
            schoolId: req.body.schoolId,
            username: req.body.username,
            password: req.body.password
          },
          {
            headers: {
              compassInstance:
                req.header("compassInstance") ||
                req.query.compassInstance ||
                "devices"
            },
            withCredentials: true
          }
        )
        .then((response) => {
          axios
            .post(
              "http://localhost:23994/services/admin.svc/GetApiKey",
              {
                password: req.body.password,
                schoolId: req.body.schoolId,
                sussiId: req.body.username
              },
              {
                headers: {
                  compassInstance:
                    req.header("compassInstance") ||
                    req.query.compassInstance ||
                    "devices"
                }
              }
            )
            .then((response2) => {
              if (!response.data.d.success) {
                res.status(401)
                res.json({
                  errors: [
                    {
                      name: "invalidUserOrPassword",
                      message: "Invalid Invalid username or password.",
                      status: 401
                    }
                  ]
                })
              } else {
                if (req.body.rememberMe) {
                  res.cookie(
                    "ASP.NET_SessionId",
                    response.headers["set-cookie"][0]
                      .split(";")[0]
                      .split("=")[1],
                    {
                      maxAge: 1000 * 60 * 60 * 24 * 365,
                      httpOnly: true,
                      secure: true,
                      domain: process.env.HOSTNAME,
                      sameSite: "strict"
                    }
                  )
                } else {
                  res.cookie(
                    "ASP.NET_SessionId",
                    response.headers["set-cookie"][0]
                      .split(";")[0]
                      .split("=")[1],
                    {
                      httpOnly: true,
                      secure: true,
                      domain: process.env.HOSTNAME,
                      sameSite: "strict"
                    }
                  )
                }
                res.json({
                  success: true,
                  cookieToken: response.headers["set-cookie"][0]
                    .split(";")[0]
                    .split("=")[1],
                  token: response2.data.d,
                  userId: response.data.d?.roles[0].userId
                })
              }
            })
            .catch((e) => {
              console.log(e)
            })
        })
    }
  } catch (err) {
    next(err)
  }
})

router.post("/loginWithToken", (req, res, next) => {
  try {
    if (req.body.rememberMe) {
      res.cookie("ASP.NET_SessionId", req.body.token, {
        maxAge: 1000 * 60 * 60 * 24 * 365,
        httpOnly: true,
        secure: true,
        domain: process.env.HOSTNAME,
        sameSite: "strict"
      })
      res.json({
        success: true
      })
    } else {
      res.cookie("ASP.NET_SessionId", req.body.token, {
        httpOnly: true,
        secure: true,
        domain: process.env.HOSTNAME,
        sameSite: "strict"
      })
      res.json({
        success: true
      })
    }
  } catch (err) {
    next(err)
  }
})
router.get("/", auth, (req, res, next) => {
  try {
    axios
      .post(
        "http://localhost:23994/graphql",
        {
          query: `query UserData{currentUser{id username firstName lastName idPhotoGuidVersioned reportName personalEmail dateOfBirth groupA groupB groupC groupD groupE middleName communicationsEmail baseRole children{id username firstName lastName idPhotoGuidVersioned reportName personalEmail dateOfBirth groupA groupB groupC groupD groupE middleName communicationsEmail baseRole}}}`
        },
        {
          headers: {
            CompassAPIKey: req.header("CompassAPIKey") || "",
            compassInstance:
              req.header("compassInstance") ||
              req.query.compassInstance ||
              "devices",
            Cookie: req.header("Cookie") || ""
          },
          timeout: 2000
        }
      )
      .then((response) => {
        // legacy fields
        response.data.data.currentUser.userId = JSON.parse(
          response.data.data.currentUser.id
        )
        response.data.data.currentUser.sussiId =
          response.data.data.currentUser.username
        response.data.data.currentUser.id = JSON.parse(
          response.data.data.currentUser.id
        )
        if (response.data.data.currentUser.children?.length) {
          response.data.data.currentUser.children.forEach((child) => {
            child.id = JSON.parse(child.id)
            child.userId = JSON.parse(child.id)
          })
        }

        res.json({
          bcUser: req.user,
          ...response.data.data.currentUser
        })
      })
      .catch((e) => {
        console.log(e.request)
      })
  } catch (e) {
    console.log(1)
  }
})

router.get("/sessions", auth, async (req, res, next) => {
  try {
    const sessions = await Session.findAll({
      where: {
        userId: req.user.id
      },
      attributes: {
        exclude: ["session", "compassSession"]
      }
    })
    res.json(sessions)
  } catch (e) {
    next(e)
  }
})

router.get("/versions", async (req, res, next) => {
  try {
    const files = fs.readdirSync(path.join(__dirname, "../../dist"))
    const versions = files
      .filter((file) => file.startsWith("precache-manifest."))
      .map((file) => {
        const version = file.split(".")[1]
        const comment = fs
          .readFileSync(path.join(__dirname, "../../dist", file))
          .toString()
          .split("\n")
          .find((line) => line.startsWith("//"))
        const versionNumber = comment
          .split("Version information: ")[1]
          .split(",")[0]
        if (semver.gte(versionNumber, "1.0.130")) {
          return {
            version,
            versionNumber,
            available: true,
            versionBuildDate: comment.split("Build Date: ")[1].split("  ")[0],
            url: `/precache-manifest.${version}.js`
          }
        } else {
          return {
            version,
            versionNumber,
            available: false,
            versionBuildDate: comment.split("Build Date: ")[1].split("  ")[0],
            url: `/precache-manifest.${version}.js`
          }
        }
      })
    res.json(versions)
  } catch (e) {
    next(e)
  }
})

router.delete("/sessions/:id", auth, async (req, res, next) => {
  try {
    await Session.destroy({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    })
    res.sendStatus(204)
  } catch (e) {
    next(e)
  }
})

router.post("/logout", (req, res, next) => {
  try {
    res.clearCookie("ASP.NET_SessionId")
    res.clearCookie("ASP.NET_SessionId")

    res.clearCookie("cpssid_" + req.header("compassSchoolId"))
    res.clearCookie("cpsdid")
    res.clearCookie("bcSession")
    res.sendStatus(204)
  } catch (e) {
    next(e)
  }
})

router.put("/settings/:type", auth, async (req, res, next) => {
  async function checkPasswordArgon2(password, hash) {
    try {
      return await argon2.verify(hash, password)
    } catch {
      console.log("Error")
      return false
    }
  }
  async function checkPassword(password) {
    return new Promise((resolve, reject) => {
      axios
        .post(
          "http://localhost:23994/services/admin.svc/GetApiKey",
          {
            password: password,
            schoolId: req.body.schoolId,
            sussiId: req.user.sussiId
          },
          {
            headers: {
              compassInstance:
                req.header("compassInstance") ||
                req.query.compassInstance ||
                "devices"
            }
          }
        )
        .then((resp) => {
          if (resp.data.d) {
            resolve(true)
            return true
          } else {
            resolve(false)
            return false
          }
        })
        .catch((e) => {
          reject(e)
          return false
        })
    })
  }
  try {
    if (req.params.type === "full") {
      await User.update(
        {
          theme: req.body.theme,
          weather: req.body.weather,
          settingsSync: req.body.settingsSync,
          minimizeHeaderEvents: req.body.minimizeHeaderEvents,
          learningTaskNotification: req.body.learningTaskNotification,
          calendarAutoJump: req.body.calendarAutoJump,
          guidedWizard: req.body.guidedWizard,
          hideIrrelevantTasks: req.body.hideIrrelevantTasks,
          rowsPerPage: req.body.rowsPerPage,
          homeGrids: req.body.homeGrids,
          discussionsImage: req.body.discussionsImage,
          calendars: req.body.calendars,
          bookmarks: req.body.bookmarks,
          font: req.body.font,
          experiments: req.body.experiments
        },
        {
          where: {
            id: req.user.id
          }
        }
      )
      res.sendStatus(204)
    } else if (req.params.type === "theme") {
      const theme = await Theme.findOne({
        where: {
          id: req.body.id,
          [Op.or]: [
            {
              userId: req.user.id
            },
            {
              public: true
            }
          ]
        }
      })
      if (theme) {
        await User.update(
          {
            themeId: theme.id,
            accentColor: req.body.accent
          },
          {
            where: {
              id: req.user.id
            }
          }
        )
        res.sendStatus(204)
      } else {
        throw Errors.invalidParameter("Theme", "Invalid theme specified")
      }
    } else if (req.params.type === "totp") {
      if (req.user.totpEnabled && req.body.code) {
        res.json({ enabled: true })
      } else if (!req.user.totpEnabled && req.body.password) {
        const match = await checkPassword(req.body.password)
        if (match) {
          const token = speakeasy.generateSecret({
            name: "BetterCompass - " + req.user.displayCode,
            issuer: "BetterCompass"
          })
          await User.update(
            {
              totp: token.base32
            },
            {
              where: {
                id: req.user.id
              }
            }
          )
          res.json({ secret: token.base32, enabled: false })
        } else {
          throw Errors.invalidCredentials
        }
      } else {
        throw Errors.invalidParameter("Password or Code")
      }
    } else if (req.params.type === "totpConfirm") {
      const user = await User.findOne({
        where: {
          id: req.user.id
        }
      })
      if (user.totp) {
        const verified = speakeasy.totp.verify({
          secret: user.totp,
          encoding: "base32",
          token: req.body.code
        })
        if (verified) {
          await User.update(
            {
              totpEnabled: true
            },
            {
              where: {
                id: req.user.id
              }
            }
          )
          res.sendStatus(204)
        } else {
          throw Errors.invalidTotp
        }
      } else {
        throw Errors.unknown
      }
    } else if (req.params.type === "bcSessionsEnable") {
      const match = await checkPassword(req.body.password)
      if (match) {
        await User.update(
          {
            bcSessionsEnabled: true
          },
          {
            where: {
              id: req.user.id
            }
          }
        )
        const session = await Session.create({
          session:
            "BETTERCOMPASS-" +
            cryptoRandomString({
              length: 64
            }),
          compassUserId: req.user.compassUserId,
          sussiId: req.user.sussiId,
          instance: req.user.instance,
          other: {},
          userId: req.user.id
        })
      } else {
        throw Errors.invalidCredentials
      }
    } else if (req.params.type === "password") {
      const user = await User.findOne({
        where: {
          id: req.user.id
        }
      })
      let match
      if (user.password) {
        match = await checkPasswordArgon2(req.body.password)
      } else {
        match = true
      }
      if (match) {
        await user.update({
          password: await argon2.hash(req.body.new)
        })
        res.sendStatus(204)
      } else {
        throw Errors.invalidCredentials
      }
    } else if (req.params.type === "communications") {
      const user = await User.findOne({
        where: {
          id: req.user.id
        }
      })
      await user.update({
        privacy: {
          communications: {
            enabled: req.body.enabled,
            outsideTenant: req.body.outsideTenant,
            directMessages: req.body.directMessages,
            friendRequests: req.body.friendRequests
          }
        }
      })
      res.sendStatus(204)
    } else {
      throw Errors.invalidParameter("Settings type", "Invalid settings type")
    }
  } catch (e) {
    console.log(e)
    next(e)
  }
})

router.post("/create", async (req, res, next) => {
  try {
    axios
      .post(
        "http://localhost:23994/services/mobile.svc/GetPersonalDetails",
        {
          userId: req.header("compassUserId")
        },
        {
          withCredentials: true,
          headers: {
            Cookie: req.headers.cookie,
            compassInstance:
              req.header("compassInstance") ||
              req.query.compassInstance ||
              "devices",
            compassSchoolId: req.header("compassSchoolId")
          }
        }
      )
      .then(async (response) => {
        const user = await User.create({
          sussiId: response.data.d.data.sussiId,
          compassUserId: response.data.d.data.userId,
          displayCode: response.data.d.data.displayCode,
          instance:
            req.header("compassInstance") ||
            req.query.compassInstance ||
            "unknown",
          settings: {},
          compassUserHash: response.data.d.data.userHash,
          weather: req.body.settings.weather,
          theme: req.body.settings.theme,
          learningTaskNotification: req.body.settings.learningTaskNotification,
          minimizeHeaderEvents: req.body.settings.minimizeHeaderEvents,
          settingsSync: true,
          cache: req.body.settings.cache
        })
        res.json({
          user
        })
      })
  } catch (err) {
    next(err)
  }
})

router.post("/create/alternate", async (req, res, next) => {
  try {
    axios
      .post(
        "http://localhost:23994/services/mobile.svc/GetPersonalDetails",
        {
          userId: req.header("compassUserId")
        },
        {
          withCredentials: true,
          headers: {
            Cookie: req.headers.cookie,
            compassInstance:
              req.header("compassInstance") ||
              req.query.compassInstance ||
              "devices",
            compassSchoolId: req.header("compassSchoolId")
          }
        }
      )
      .then(async (response) => {
        const user = await User.create({
          sussiId: response.data.d.data.sussiId,
          compassUserId: response.data.d.data.userId,
          displayCode: response.data.d.data.displayCode,
          instance:
            req.header("compassInstance") ||
            req.query.compassInstance ||
            "unknown",
          settings: {},
          compassUserHash: response.data.d.data.userHash,
          weather: req.body.settings.weather,
          theme: req.body.settings.theme,
          learningTaskNotification: req.body.settings.learningTaskNotification,
          minimizeHeaderEvents: req.body.settings.minimizeHeaderEvents,
          settingsSync: true,
          cache: req.body.settings.cache
        })
        const session = await Session.create({
          session:
            "BETTERCOMPASS-" +
            cryptoRandomString({
              length: 48
            }),
          compassUserId: user.compassUserId,
          sussiId: user.sussiId,
          instance: user.instance,
          other: {}
        })
        res.json({
          session: session.session,
          user
        })
      })
  } catch (err) {
    next(err)
  }
})

module.exports = router
