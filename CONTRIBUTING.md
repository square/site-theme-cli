## Git workflow

This repo uses the [GitHub flow](https://guides.github.com/introduction/flow/).

`alpha` is currently the main branch and is [protected](https://docs.github.com/en/github/administering-a-repository/about-protected-branches). All changes must be PR'd, reviewed, and squashed when merging.

### Commit style

This repository uses [Conventional Commits](https://www.conventionalcommits.org) for simple yet meaningful commit messages. Not only are they user-friendly, they are also machine-readable for automated release notes and versioning.

It has the following formats:

#### Without scope

```
<type>: <subject>
```

#### With scope
```
<type>(<scope>): <subject>
```

#### Types

Version influencing types:
- `fix`: user-facing bug fix (patch version bump 🏥)
- `feat`: user-facing feature (minor version bump 🌟)

Other types:
- `revert`: reverts a previous commit
- `docs`: changes to the documentation
- `build`: changes that affect the build system or external dependencies
- `test`: adding missing tests, refactoring tests; no production code change
- `refactor`: refactoring production code, eg. renaming a variable
- `style`: formatting, missing semi colons, etc; no production code change
- `perf`: changes that improve performance
- `ci`: changes to CI configuration files and scripts (eg. GitHub Actions)
- `chore`: updating grunt tasks etc; no production code change

If deciding between `feat` or `fix` vs another type, choose `feat` or `fix` because they influence the version bump appropriately.

There is a GitHub action that ensures your PR title follows Conventional Commits.

**Note that because of the squash and merge, by default the commit message used for release will be the PR title. Ensure the title contains a relevant message and nothing generic, as it will be used as part of the release notes.**

- ✅ chore: split linting command
- ✅ fix: properly set status code on errors
- ❌ chore: update package.json
- ❌ fix: code review changes

# Contribution Guide
The CLI is based on the <a href="https://oclif.io/"> **OCLIF** </a>. UI components leverage <a href="https://github.com/vadimdemedes/ink"> Ink </a>. 

## Adding a new command.

Create a new command by creating a new command file inside the `src/commands/` directory. Commands can be grouped together in topics which are sub directories within the `src/commands/` directory. For example, to add a new command `square-online-cli theme duplicate` we would create a file `src/commands/theme/duplicate.ts`. 

After you create your new command. Please add a test for it and update the readme command documentation.

`npm run generate-readme`

## Adding a new component
If you need to create a new custom UI component. Please use the <a href="https://github.com/vadimdemedes/ink"> Ink </a> library and put your component and put it `src/components/ui/` directory and a wrapper to call it from the `src/components/`. This is just in case we need to pivot to a different component framework.

## Testing

We are using <a href="https://vitest.dev/">Vitest</a> as our framework because it has ESM support. When you add a command please add a test for it within the `/test/commands` directory. See existing tests as an example. Please mock any filesystem, api or stdin calls that may be run during the command.

### Releasing

Merging to `alpha` will trigger a release GitHub Actions workflow that will appropriately version-bump based on semantic commit messages, and make a GitHub release.