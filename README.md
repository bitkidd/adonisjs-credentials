<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of contents

- [Adonis Credentials](#adonis-credentials)
  - [Installation](#installation)
  - [Usage](#usage)
      - [Creating credentials](#creating-credentials)
      - [Editing credentials](#editing-credentials)
      - [Using in production](#using-in-production)
  - [How it works](#how-it-works)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Adonis Credentials
> adonis, credentials

[![npm-image]][npm-url] [![license-image]][license-url] [![typescript-image]][typescript-url]

Adonis Credentials is created to help manage multiple environment secrets, share them securely and even keep them inside your repo. 
It is heavily insiped by [Rails Credentials](https://edgeguides.rubyonrails.org/security.html#environmental-security).

## Installation

To install the provider run:
```bash
npm install @bitkidd/adonis-credentials
# or
yarn add @bitkidd/adonis-credentials
```

And then:
```
node ace configure @bitkidd/adonis-credentials
```

This will add two new commands to your app and will allow to create and edit credentials.

Then you need to open `server.ts` file and add there a new line, just before the `Ignitor`:

```ts
import { Credentials } from '@bitkidd/adonis-credentials/build/src/Credentials'

// ...

new Credentials().initialize() // <--- Here
new Ignitor(__dirname).httpServer().start().catch(console.error)
```

It has to be done to populate values before Adonis starts and Env provider validates values.

## Usage

#### Creating credentials

As you configured the provider, you may now create your first credentials file by running the command:

```bash
# node ace credentials:create
# ---
# Flags
#   --env string      Specify an environment for credentials file (default: development)
#   --content string  Specify initial content for credentials file (default: { "hello": "world" })

node ace credentials:create
```

This will create a new directory in your `resources` folder, called `credentials` and will add there two new files, `development.key` and `development.credentials`. Obviously the `.key` file keeps your password to the credentials file, **do not commit any .key files to your git repo**, please check your `.gitignore` for `*.key` exclusion rule.

The `.key` should be kept somewhere in a secret place, the best spot I know is a sticky note on your laptop. Just NO, don't do this :see_no_evil:.
Keep your secrets secure and use password managers!

The `.credentials` file can be committed and shared as it is impossimple to decrypt it without the password.

There two files should be always kept in one folder while in development.

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

#### Using in production

You can have multiple credential files, the best way to work is to create one for each environment, development, production, staging, test and etc.

As for development you can keep `.key` files inside `/credentials` folder, in production environment this is not a great option.

You should use and set additional environment variable `ADONIS_CREDENTIALS_KEY`, that will be used to decrypt data and populate it to your app.

## How it works

The provider uses node.js' native crypto library and encrypts everything using *AES* cipher with a random vector, which makes your secrets very secure, with a single key that can decrypt data.

Credentials while decrypted present themselves as simple JSON objects, this allows to keep variables in a very predictable and simple manner:

```json
{
  "google": {
    "key": "your_google_key",
    "secret": "your_google_secret"
  }
}
```

Which then is being transformed to something like this:

```
GOOGLE_KEY=your_google_key
GOOGLE_SECRET=your_google_secret
```

And then populated to `process.env`, as this is done before Adonis.js `Env` provider, you may even validate data to be sure that everything is present and has an exact format.

[npm-image]: https://img.shields.io/npm/v/@bitkidd/adonis-credentials.svg?style=for-the-badge&logo=npm
[npm-url]: https://npmjs.org/package/@bitkidd/adonis-credentials "npm"

[license-image]: https://img.shields.io/npm/l/@bitkidd/adonis-credentials?color=blueviolet&style=for-the-badge
[license-url]: LICENSE.md "license"

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[typescript-url]:  "typescript"
