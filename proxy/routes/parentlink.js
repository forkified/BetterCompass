const express = require("express")
const router = express.Router()
const Errors = require("../lib/errors.js")
const auth = require("../lib/authorize.js")
const axios = require("axios")

router.get("/newsFeed", auth, async (req, res, next) => {
  try {
    const parentLink = JSON.parse(process.env.PARENT_LINK)
    const parentLinkInstance = parentLink.find(
      (instance) =>
        (instance.instance === req.user.instance &&
          instance.intendedFor === req.user.id) ||
        (instance.instance === req.user.instance &&
          instance.intendedFor === null)
    )
    if (!parentLinkInstance) {
      throw Errors.parentLinkIneligible
    } else {
      axios
        .post(
          "http://localhost:23994/Services/NewsFeed.svc/GetMyNewsFeedPaged",
          {
            limit: 10,
            start: 0
          },
          {
            withCredentials: true,
            headers: {
              Cookie: "ASP.NET_SessionId=" + parentLinkInstance.token + ";",
              compassInstance: parentLinkInstance.instance
            }
          }
        )
        .then((resp) => {
          res.json(resp.data)
        })
        .catch((e) => {
          next(e)
        })
    }
  } catch (err) {
    next(Errors.parentLinkIneligible)
  }
})
module.exports = router
