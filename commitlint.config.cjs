module.exports = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'type-enum': [2, 'always', ["feat", "fix", "docs", "build", "chore", "ci", "refactor", "art"]]
	}
}