module.exports = {
  root: true,
  env: {
    es2020: true
  },
  extends: ["plugin:vue/essential", "eslint:recommended"],
  parserOptions: {},
  rules: {
//    "no-console": import.meta.env.NODE_ENV === "production" ? "warn" : "off",
//    "no-debugger": import.meta.env.NODE_ENV === "production" ? "warn" : "off",
    "vue/no-parsing-error": [
      "error",
      { "invalid-first-character-of-tag-name": false }
    ],
    "vue/multi-word-component-names": false
  }
}
