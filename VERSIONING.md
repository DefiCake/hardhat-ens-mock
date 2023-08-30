# RELEASE VERSIONING

- Increase the version at `package.json` following semver
- Log the changes in [CHANGELOG.md](./CHANGELOG.md)
- Commit the change
- Tag with `git tag -a <version>`
- Push the changes with `git push origin master` and `git push origin --tags`
- Run `npm publish`

# BETA VERSIONING

- Use `npm version <version>-beta.n`, e.g. `npm version 3.1.0-beta.0`
- Use `npm publish --tag beta` to upload to NPM
