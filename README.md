<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of contents

- [Adonis Credentials](#adonis-credentials)
  - [Installation](#installation)
  - [Configuration](#configuration)
      - [Run `ace configure`](#run-ace-configure)
      - [Modify `server.ts` file](#modify-serverts-file)
      - [Modify `.adonisrs.json`](#modify-adonisrsjson)
      - [Modify `ace` file (optional)](#modify-ace-file-optional)
      - [Pipe credentials to command (optional)](#pipe-credentials-to-command-optional)
  - [Usage](#usage)
      - [Creating credentials](#creating-credentials)
      - [Editing credentials](#editing-credentials)
      - [Piping credentials](#piping-credentials)
      - [Using in production](#using-in-production)
  - [How it works](#how-it-works)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Adonis Credentials
> adonis, credentials

[![workflow-image]][workflow-url] [![npm-image]][npm-url] [![license-image]][license-url] [![typescript-image]][typescript-url]

Adonis Credentials is created to help manage multiple environment secrets, share them securely and even keep them inside your repo.

## Installation

To install the provider run:
```bash
npm install @bitkidd/adonis-credentials
# or
yarn add @bitkidd/adonis-credentials
```

## Configuration

To configure credentials provider, we should proceed with 4 steps:

#### Run `ace configure`

```
node ace configure @bitkidd/adonis-credentials
```

This will add two new commands to your app and will allow to create and edit credentials.
At the same time it will add a new rule to your `.gitignore` file that will exclude all `*.key` files from repository and will not allow to commit them.

#### Modify `server.ts` file

As a next step you need to modify the `server.ts` file and add a new line inside it, just before the `Ignitor`:

```ts
// This goes on top, where import declarations are
import { Credentials } from '@bitkidd/adonis-credentials/build/src/Credentials'

// ...

new Credentials().initialize() // <--- Insert credentials initialization here, before the Ignitor
new Ignitor(__dirname).httpServer().start().catch(console.error)
```

This allows the credentials to be parsed and populated inside current `process.env` before the app even starts, so an `Env` provider will be able to validate values.

#### Modify `.adonisrs.json`

As a final step, open `.adonisrc.json` file and add `resources/credentials` to `metaFiles` section, so credentials will copied as you build your Adonis app.

#### Modify `ace` file (optional)

In this step you do basically the same thing as done in a step above, but for `ace` commands that need the app to be loaded, just add two new lines to the file.

```js
// ...
// This goes on top, where require declarations are
const { Credentials } = require('@bitkidd/adonis-credentials/build/src/Credentials')

// ...

new Credentials().initialize() // <--- Insert credentials initialization here, before the Ignitor
new Ignitor(__dirname)
  .ace()
  .handle(process.argv.slice(2))
  .catch(console.error)
```

This will populates credentials into the ace process so they will be available in it.

#### Pipe credentials to command (optional)

Another way to make credentials visible to command, is to run that command inside a child process with secret credentials populated, for example:

`node ace credentials:pipe 'ace migrations:run'`

This reads credentials, decrypts them, creates a child process and populates environment with some new values from your vault and then runs the command that you specified.

## Usage

#### Creating credentials

As you configured the provider, you may now create your first credentials by running the command:

```bash
# node ace credentials:create
# ---
# Flags
#   --env string      Specify an environment for credentials file (default: development)
#   --format string   Specify format for the credentials file (default: yaml, available: json,yaml)

node ace credentials:create
```

This will create a new directory in your `resources` folder, called `credentials` and will add there two new files, `development.key` and `development.credentials`. 

Obviously, the `.key` file keeps your password to the credentials file, **do not commit any .key files to your git repo**, please check your `.gitignore` for `*.key` exclusion rule.

The `.key` should be kept somewhere in a secret place, the best spot I know is a sticky note on your laptop. Just NO, don't do this :see_no_evil:
Keep your secrets in a secure place and use password managers!

The `.credentials` file can be committed and shared as it is impossimple to decrypt it without the password.

These two files should always be kept in one folder while in development.

#### Editing credentials

To edit a newly created file, you should run a command:

```bash
# node ace credentials:edit
# ---
# Flags
#   --env string     Specify an environment for credentials file (default: development)
#   --editor string  Specify an editor to use for edit

node ace credentials:edit --editor="code ---wait" --env=development
# or
node ace credentials:edit --editor=nano --env=development
```

This will decrypt the credentials file, create a temporary one and open it in the editor you specified. As you finish editing, close the file (or tab inside your editor), this will encrypt it back again and remove the temporary file, to keep you safe and sound.

#### Piping credentials

To pipe credentials to a command that needs them run:

```bash
# node ace credentials:pipe <command>
# ---
# Args
#   command          Specify an ace command to pipe credentials to     
# Flags
#   --env string     Specify an environment for credentials file (default: development)

node ace credentials:pipe 'ace migrations:run'
# or
node ace credentials:pipe 'ace migrations:run' --env=development
```

#### Using in production

You can have multiple credential files, the best way to work is to create one for each environment, for example: development, production, staging, test and etc.

As for development you can keep `.key` files inside `/credentials` folder, in a production environment this is not a great option.

For production you should set additional environment variable `APP_CREDENTIALS_KEY`, that will be used to decrypt data and populate it to your app.

## How it works

The provider uses node.js' native crypto library and encrypts everything using *AES* cipher with a random vector, which makes your secrets very secure, with a single key that can decrypt data.

Credentials while decrypted present themselves as simple files in JSON or YAML formats, this allows to keep variables in a very predictable and simple manner:

**JSON**
```json
{
  "google": {
    "key": "your_google_key",
    "secret": "your_google_secret"
  }
}
```

**YAML**
```yaml
google:
  key: "your_google_key"
  secret: "your_google_secret"
```

Which then is being transformed to something like this:

```
GOOGLE_KEY=your_google_key
GOOGLE_SECRET=your_google_secret
```

And then populated to `process.env`, as this is done before Adonis.js `Env` provider, you may even validate data to be sure that everything is present and has an exact format.

[workflow-image]: https://img.shields.io/github/workflow/status/bitkidd/adonis-credentials/test?style=for-the-badge&logo=github
[workflow-url]: https://github.com/bitkidd/adonis-credentials/actions/workflows/test.yml

[npm-image]: https://img.shields.io/npm/v/@bitkidd/adonis-credentials.svg?style=for-the-badge&logo=npm
[npm-url]: https://npmjs.org/package/@bitkidd/adonis-credentials "npm"

[license-image]: https://img.shields.io/npm/l/@bitkidd/adonis-credentials?color=blueviolet&style=for-the-badge
[license-url]: LICENSE.md "license"

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[typescript-url]:  "typescript"
