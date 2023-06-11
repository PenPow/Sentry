module.exports = {
	extends: ['@commitlint/config-conventional'],

	rules: {
		type: ["feat", "fix", "docs", "chore", "ci", "refactor", "art"]
	}
}