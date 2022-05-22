const express = require("express")
const router = express.Router()
const Errors = require("../lib/errors.js")
const auth = require("../lib/authorize.js")
const { User, Theme, Feedback } = require("../models")
const { Op } = require("sequelize")
const dayjs = require("dayjs")
const fs = require("fs")
const os = require("os")

router.all("*", auth, async (req, res, next) => {
  try {
    if (!req.user.admin) {
      throw Errors.unauthorized
    } else {
      next()
    }
  } catch (err) {
    next(err)
  }
})

router.get("/", auth, async (req, res, next) => {
  try {
    res.json({
      users: await User.count(),
      themes: await Theme.count(),
      feedback: await Feedback.count(),
      usersToday: await User.count({
        where: {
          lastSeenAt: {
            [Op.gte]: dayjs().startOf("day").toDate()
          }
        }
      }),
      usersThisWeek: await User.count({
        where: {
          lastSeenAt: {
            [Op.gte]: dayjs().startOf("week").toDate()
          }
        }
      })
    })
  } catch (err) {
    return next(err)
  }
})

router.get("/metrics", auth, async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 7))
    const createdAt = {
      [Op.gte]: sevenDaysAgo
    }

    const registrationStats = await User.findAll({
      where: {
        createdAt: createdAt
      },
      attributes: {
        exclude: ["totp", "compassSession", "password"]
      }
    })

    const registrationGraphInterim = registrationStats.reduce(function (
      result,
      user
    ) {
      let day = dayjs(user.createdAt).format("YYYY-MM-DD")
      if (!result[day]) {
        result[day] = 0
      }
      result[day]++
      return result
    },
    {})

    const activeUsersGraphInterim = registrationStats.reduce(function (
      result,
      user
    ) {
      let day = dayjs(user.lastSeenAt).format("YYYY-MM-DD")
      if (!result[day]) {
        result[day] = 0
      }
      result[day]++
      return result
    },
    {})

    const usersGraph = {
      labels: Object.keys(registrationGraphInterim),
      datasets: [
        {
          data: Object.values(registrationGraphInterim),
          label: "Users",
          borderColor: "#3e95cd",
          pointBackgroundColor: "#FFFFFF",
          backgroundColor: "transparent"
        }
      ]
    }

    const activeUsersGraph = {
      labels: Object.keys(activeUsersGraphInterim),
      datasets: [
        {
          data: Object.values(activeUsersGraphInterim),
          label: "Active Users",
          borderColor: "#3e95cd",
          pointBackgroundColor: "#FFFFFF",
          backgroundColor: "transparent"
        }
      ]
    }

    res.json({
      users: usersGraph,
      activeUsers: activeUsersGraph
    })
  } catch (err) {
    return next(err)
  }
})

router.get("/users", auth, async (req, res, next) => {
  try {
    const users = await User.findAndCountAll({
      include: [
        {
          model: Theme,
          as: "themeObject"
        }
      ],
      attributes: {
        exclude: ["totp", "compassSession", "password"]
      }
    })
    res.json(users)
  } catch (err) {
    return next(err)
  }
})

router.get("/themes", auth, async (req, res, next) => {
  try {
    const themes = await Theme.findAndCountAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: {
            exclude: ["totp", "compassSession", "password"]
          }
        },
        {
          model: User,
          as: "users"
        }
      ]
    })
    res.json(themes)
  } catch (err) {
    return next(err)
  }
})

router.put("/themes/apply", auth, async (req, res, next) => {
  try {
    await User.update(
      {
        themeId: req.body.themeId
      },
      {
        where: {
          id: req.user.id
        }
      }
    )
    res.sendStatus(204)
  } catch (err) {
    return next(err)
  }
})

router.get("/feedback", auth, async (req, res, next) => {
  try {
    const feedback = await Feedback.findAndCountAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "user"
        }
      ]
    })
    res.json(feedback)
  } catch (err) {
    return next(err)
  }
})

router.put("/state", auth, async (req, res, next) => {
  function setEnvValue(key, value) {
    // read file from hdd & split if from a linebreak to a array
    const ENV_VARS = fs.readFileSync(".env", "utf8").split(os.EOL)

    // find the env we want based on the key
    const target = ENV_VARS.indexOf(
      ENV_VARS.find((line) => {
        // (?<!#\s*)   Negative lookbehind to avoid matching comments (lines that starts with #).
        //             There is a double slash in the RegExp constructor to escape it.
        // (?==)       Positive lookahead to check if there is an equal sign right after the key.
        //             This is to prevent matching keys prefixed with the key of the env var to update.
        const keyValRegex = new RegExp(`(?<!#\\s*)${key}(?==)`)

        return line.match(keyValRegex)
      })
    )

    // if key-value pair exists in the .env file,
    if (target !== -1) {
      // replace the key/value with the new value
      ENV_VARS.splice(target, 1, `${key}=${value}`)
    } else {
      // if it doesn't exist, add it instead
      ENV_VARS.push(`${key}=${value}`)
    }

    // write everything back to the file system
    fs.writeFileSync(".env", ENV_VARS.join(os.EOL))
  }
  try {
    const io = req.app.get("io")
    if (req.body.broadcastType === "permanent") {
      setEnvValue("NOTIFICATION", req.body.notification)
      setEnvValue("NOTIFICATION_TYPE", req.body.notificationType)
      process.env.NOTIFICATION = req.body.notification
      process.env.NOTIFICATION_TYPE = req.body.notificationType
    }
    io.emit("siteState", {
      notification: req.body.notification,
      notificationType: req.body.notificationType,
      latestVersion: require("../../package.json").version
    })
    res.sendStatus(204)
  } catch (err) {
    return next(err)
  }
})

module.exports = router
