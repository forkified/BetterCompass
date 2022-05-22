let Errors = {
  unknown: ["Something went wrong.", 500],
  unauthorized: ["You don't have permission to do that.", 401],
  notAuthenticated: ["You have to login to do that", 401],
  userNotOptedIn: [
    "You have to opt in to BetterCompass Accounts to do that.",
    401
  ],
  invalidUserOrPassword: ["Invalid username or password.", 401],
  parentLinkIneligible: ["Your school does not support ParentLink.", 401],
  invalidTotp: ["Invalid 2FA code.", 401],
  invalidCredentials: ["Invalid username or password.", 401],
  bcSessionsForced: [
    "You are attempting to login as a user that enforces BetterCompass Sessions.\nBetterCompass extended functionality is disabled for this session instance.",
    401
  ],
  rateLimit: [
    "You are being rate-limited. Please try again in a few minutes.",
    429
  ],
  communicationsUserNotFound: ["This user does not exist.", 400],
  communicationsUserNotOptedIn: [
    "This user has not opted in to BetterCompass Communications.",
    400
  ],
  friendAlreadyFriends: ["You are already friends with this user.", 400],
  friendNotFound: ["The friend instance couldn't be found.", 400],
  chatNotFoundOrNotAdmin: [
    "The chat instance couldn't be found, or you are not an administrator of it.",
    400
  ],
  experimentsOptIn: ["You are not opted into this experiment.", 401],
  attachmentNotFound: [
    "The user content you are trying to access does not exist, or has been deleted.",
    400
  ],
  invalidFileType: [
    "The file you are trying to upload is not a valid file type.",
    400
  ],
  fileTooLarge: ["The file you are trying to upload is too large.", 400]
}

function processErrors(errorName) {
  let arr = Errors[errorName]

  temp = {}
  temp.name = errorName
  temp.message = arr[0]
  temp.status = arr[1]

  return {
    name: errorName,
    message: arr[0],
    status: arr[1]
  }
}

let ProcessedErrors = {}

for (let errorName in Errors) {
  ProcessedErrors[errorName] = processErrors(errorName)
}

ProcessedErrors.VALIDATION_ERROR = "VALIDATION_ERROR"

ProcessedErrors.invalidParameter = function (param, message) {
  let punctuatedMessage = ""
  if (message) {
    punctuatedMessage = ": " + message
  }

  return {
    name: "invalidParameter",
    message: `${param} is invalid${punctuatedMessage}`,
    status: 400,
    parameter: param
  }
}

ProcessedErrors.sequelizeValidation = (sequelize, obj) => {
  return new sequelize.ValidationError(obj.error, [
    new sequelize.ValidationErrorItem(
      obj.error,
      "Validation error",
      obj.path,
      obj.value
    )
  ])
}

module.exports = ProcessedErrors
