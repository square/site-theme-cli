  ### Code Coverage
| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-75.89%25-red.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-79.94%25-red.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-60%25-red.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-75.89%25-red.svg?style=flat) |

  # Usage

  <!-- usage -->
```sh-session
$ npm install -g square-online-cli
$ square-online-cli COMMAND
running command...
$ square-online-cli (--version)
square-online-cli/0.0.0 darwin-x64 node-v18.12.1
$ square-online-cli --help [COMMAND]
USAGE
  $ square-online-cli COMMAND
...
```
<!-- usagestop -->

  # Commands

  <!-- commands -->
* [`square-online-cli auth ACCESSTOKEN`](#square-online-cli-auth-accesstoken)
* [`square-online-cli help [COMMANDS]`](#square-online-cli-help-commands)
* [`square-online-cli theme install`](#square-online-cli-theme-install)
* [`square-online-cli theme preview`](#square-online-cli-theme-preview)
* [`square-online-cli theme pull`](#square-online-cli-theme-pull)
* [`square-online-cli theme push`](#square-online-cli-theme-push)
* [`square-online-cli theme watch`](#square-online-cli-theme-watch)

## `square-online-cli auth ACCESSTOKEN`

Authorizes Square Online CLI with Access Token. 

```
USAGE
  $ square-online-cli auth ACCESSTOKEN [--verbose] [-f] [--skipPermissionsCheck]

ARGUMENTS
  ACCESSTOKEN  Square Connect Access Token

FLAGS
  -f, --force             Overrite existing Access Token
  --skipPermissionsCheck  Skip the permissions check for Access Token. By default will check to see the token has all
                          the required permissions

GLOBAL FLAGS
  --verbose  Print all API logs in console.

DESCRIPTION
  Authorizes Square Online CLI with Access Token.
  Visit https://developer.squareup.com/ for more information.

EXAMPLES
  $ square-online-cli auth SQUARE_CONNECT_ACCESS_TOKEN
```

_See code: [src/commands/auth.ts](https://github.com/ecom-square-online-cli//blob/v0.0.0/src/commands/auth.ts)_

## `square-online-cli help [COMMANDS]`

Display help for square-online-cli.

```
USAGE
  $ square-online-cli help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for square-online-cli.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.10/src/commands/help.ts)_

## `square-online-cli theme install`

Installs theme on a Square Online site.

```
USAGE
  $ square-online-cli theme install [--verbose]

GLOBAL FLAGS
  --verbose  Print all API logs in console.

DESCRIPTION
  Installs theme on a Square Online site.

EXAMPLES
  $ square-online-cli theme install
```

## `square-online-cli theme preview`

Prints development preview links for Square Online custom theme sites.

```
USAGE
  $ square-online-cli theme preview [--verbose] [--siteId <value>]

FLAGS
  --siteId=<value>  ID of Square Online site to you would like to preview, use to skip site selector step.

GLOBAL FLAGS
  --verbose  Print all API logs in console.

DESCRIPTION
  Prints development preview links for Square Online custom theme sites.

EXAMPLES
  $ square-online-cli theme preview
```

## `square-online-cli theme pull`

Clone Square Online Theme Files Locally

```
USAGE
  $ square-online-cli theme pull [--verbose] [--siteId <value>] [--accessToken <value>] [--yes] [--themeDir
    <value>]

FLAGS
  --accessToken=<value>  Use this flag to pass in an access token. If not passed the CLI will look for an access token
                         saved during "auth" command.
  --siteId=<value>       The Square Online site id that you would like to pull files from.
  --themeDir=<value>     Path to theme directory. If the directory does not exist it will be created.
  --yes                  Use this flag to skip the confirmation prompts

GLOBAL FLAGS
  --verbose  Print all API logs in console.

DESCRIPTION
  Clone Square Online Theme Files Locally

EXAMPLES
  $ square-online-cli theme pull
```

## `square-online-cli theme push`

Push your local theme files to your Square Online site. Files with the following Patterns will be ignored by default: /_darcs/,/CVS/,/config.yml/,/node_modules/,/.git/,/.DS_Store/, as well as any patterns within the /theme/.soignore file

```
USAGE
  $ square-online-cli theme push [--verbose] [--themeDir <value>] [--siteId <value>] [--omitDelete]
    [--accessToken <value>] [--yes]

FLAGS
  --accessToken=<value>  Use this flag to pass in an access token. If not passed the CLI will look for an access token
                         saved during "auth" command.
  --omitDelete           If set the CLI will skip any delete operations during syncing
  --siteId=<value>       The Square Online site id that you would like to push files to.
  --themeDir=<value>     Path to theme directory.
  --yes                  Use this flag to skip the confirmation prompts

GLOBAL FLAGS
  --verbose  Print all API logs in console.

DESCRIPTION
  Push your local theme files to your Square Online site. Files with the following Patterns will be ignored by default:
  /_darcs/,/CVS/,/config.yml/,/node_modules/,/.git/,/.DS_Store/, as well as any patterns within the /theme/.soignore
  file

EXAMPLES
  $ square-online-cli theme push
```

## `square-online-cli theme watch`

Watch your theme directory and automatically upload file changes to Square Online. Files with the following Patterns will be ignored by default: /_darcs/,/CVS/,/config.yml/,/node_modules/,/.git/,/.DS_Store/ as well as any patterns within the /theme/.soignore file

```
USAGE
  $ square-online-cli theme watch [--verbose] [--themeDir <value>] [--siteId <value>] [--hotReload] [--omitDelete]

FLAGS
  --hotReload         Set this flag to print the preview links and enable hot reloading
  --omitDelete        If set the CLI will skip any delete operations during syncing
  --siteId=<value>    The id of the Square Online site you would like to sync to.
  --themeDir=<value>  Path to theme directory for watching.

GLOBAL FLAGS
  --verbose  Print all API logs in console.

DESCRIPTION
  Watch your theme directory and automatically upload file changes to Square Online. Files with the following Patterns
  will be ignored by default: /_darcs/,/CVS/,/config.yml/,/node_modules/,/.git/,/.DS_Store/ as well as any patterns
  within the /theme/.soignore file

EXAMPLES
  $ square-online-cli theme watch
```
<!-- commandsstop -->

# CI/CD Usage
The `theme pull` and `theme push` commands support automated workflows. Passing in an accessToken flag will skip using any on saved through the `auth` command. `themeDir` flags can be either relative or absolute. `yes` will skip any steps that usually require a user confirmation to continue.
```
square-online-cli theme pull --siteId=site_693636287506607541 --themeDir=./brisk-theme --accessToken=YOUR_ACCESS_TOKEN --yes
square-online-cli theme push --siteId=site_693636287506607541 --themeDir=./brisk-theme --accessToken=YOUR_ACCESS_TOKEN --yes
```

# Getting Started

1. Install Node.
2. Install NVM.
3. `nvm use`
4. `npm ci`

