module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      "feat", "fix", "docs", "style", "refactor", "chore", "revert", "build", 'perf', 'test', 'daily',  "init"
    ]],
    'subject-full-stop': [0, 'never'],
    'subject-case': [0, 'never']
  }
}
