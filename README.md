<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

## Table of contents

- [AdonisJS Credentials](#adonisjs-credentials)
  - [Installation](#installation)
  - [Configuration](#configuration)
    - [Run `ace configure`](#run-ace-configure)
    - [Modify `bin/server.ts` file](#modify-binserverts-file)
    - [Modify `bin/console.ts` file](#modify-binconsolets-file)
  - [Usage](#usage)
    - [Creating credentials](#creating-credentials)
    - [Editing credentials](#editing-credentials)
    - [Using in production](#using-in-production)
  - [How it works](#how-it-works)
  - [How to update from v1 to v2](#how-to-update-from-v1-to-v2)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# AdonisJS Credentials

> adonisjs, adonis, credentials

[![workflow-image]][workflow-url] [![npm-image]][npm-url] [![license-image]][license-url] [![typescript-image]][typescript-url]

AdonisJS Credentials is created to help you manage multiple environment secrets, share them securely and even keep them inside your repo.

Inspired by Rails Credentials.

## Installation

To install the provider run:

```bash
npm install @bitkidd/adonisjs-credentials
# or
yarn add @bitkidd/adonisjs-credentials
```

## Configuration

To configure credentials provider, we should proceed with 4 steps:

#### Run `ace configure`

```
node ace configure @bitkidd/adonisjs-credentials
```

This will:

- Add two new commands to your app and will allow to create and edit credentials
- Add a new rule to your `.gitignore` file that will exclude all `*.key` files from repository and will not allow to commit them
- Add a new `credentials.ts` file inside `/start` folder

#### Modify `bin/server.ts` file

As a next step you need to modify the `bin/server.ts` file and add a new line inside it:

```ts
...
app.booting(async () => {
  await import('#start/env')
  await import('#start/credentials') // <--- Import credentials here
})
...
```

#### Modify `bin/console.ts` file

Next you need to modify the `bin/console.ts` file and add a new line inside it:

```ts
...
app.booting(async () => {
  await import('#start/env')
  await import('#start/credentials') // <--- Import credentials here
})
...
```

This will allow commands and app that they will start get access to credentials.

## Usage

#### Creating credentials

As you configured the provider, you may now create your first credentials by running the command:

```bash
# node ace credentials:create
# ---
# Flags
#   --env string      Specify an environment for credentials file (default: development)

node ace credentials:create
```

This will create a new directory in your `resources` folder, called `credentials` and will add there two new files, `development.key` and `development.credentials`.

Obviously, the `.key` file keeps your password to the credentials file, **do not commit any .key files to your git repo**, please check your `.gitignore` for `*.key` exclusion rule.

`.key` should be kept somewhere in a secret place, the best spot I know is a sticky note on your laptop. Just NO, don't do this :see_no_evil:
Keep your secrets in a secure place and use password managers!

`.credentials` file can be committed and shared as it is impossible to decrypt without the key.

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

You can also add `EDITOR='code --wait'` to your `.env` file to omit `--editor` flag.

This will decrypt the credentials file, create a temporary one and open it in the editor you specified. As you finish editing, close the file (or tab inside your editor), this will encrypt it back again and remove the temporary file, to keep you safe and sound.

#### Using in production

You can have multiple credential files, the best way to work is to create one for each environment, for example: development, production, staging, test and etc.

As for development you can keep `.key` files inside `/credentials` folder, in a production environment this is not a great option.

For production you should set additional environment variable `APP_CREDENTIALS_KEY`, that will be used to decrypt data and populate it to your app.

## How it works

The provider uses node.js' native crypto library and encrypts everything using _AES_ cipher with a random vector, which makes your secrets very secure, with a single key that can decrypt data.

Credentials while decrypted present themselves as simple files in YAML format, this allows you to keep variables in a very predictable and simple form:

```yaml
google:
  key: 'your_google_key'
  secret: 'your_google_secret'
```

Which then is being transformed to something like this:

```
GOOGLE_KEY=your_google_key
GOOGLE_SECRET=your_google_secret
```

## How to update from v1 to v2

The new version introduced one main change you'll have to apply manually. You have to add `v2.` to both of your `.key` and `.credentials` files. This will allow in the future change encryption algo without breaking things.

Another thing that has changed is the default file format for `.credentials`, it will always be YAML from now. JSON files will still work, but YAML is just way easier to format and work with.

[workflow-image]: https://img.shields.io/github/actions/workflow/status/bitkidd/adonisjs-credentials/test.yml?style=for-the-badge&logo=github
[workflow-url]: https://github.com/bitkidd/adonisjs-credentials/actions/workflows/test.yml
[npm-image]: https://img.shields.io/npm/v/@bitkidd/adonisjs-credentials.svg?style=for-the-badge&logo=npm
[npm-url]: https://npmjs.org/package/@bitkidd/adonisjs-credentials 'npm'
[license-image]: https://img.shields.io/npm/l/@bitkidd/adonisjs-credentials?color=blueviolet&style=for-the-badge
[license-url]: LICENSE.md 'license'
[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[typescript-url]: "typescript"
