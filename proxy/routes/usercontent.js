const express = require("express")
const router = express.Router()
const Errors = require("../lib/errors.js")
const { Attachment } = require("../models")
const path = require("path")
router.get("/:attachment", async (req, res, next) => {
  try {
    const attachment = await Attachment.findOne({
      where: {
        attachment: req.params.attachment
      }
    })
    if (!attachment) {
      throw Errors.attachmentNotFound
    } else {
      res.sendFile(path.resolve("usercontent/" + attachment.attachment))
    }
  } catch (e) {
    next(e)
  }
})

module.exports = router
