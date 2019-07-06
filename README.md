bunder
======

Bunder is a package manager for Linux

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/bunder.svg)](https://npmjs.org/package/bunder)
[![Downloads/week](https://img.shields.io/npm/dw/bunder.svg)](https://npmjs.org/package/bunder)
[![License](https://img.shields.io/npm/l/bunder.svg)](https://github.com/joehop67/bunder/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g bunder
$ bunder COMMAND
running command...
$ bunder (-v|--version|version)
bunder/0.1.0 linux-x64 node-v10.16.0
$ bunder --help [COMMAND]
USAGE
  $ bunder COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`bunder hello`](#bunder-hello)
* [`bunder help [COMMAND]`](#bunder-help-command)
* [`bunder in BUNFILE`](#bunder-in-bunfile)
* [`bunder bunder mkpkg tar_file [bunder options] [make options]`](#bunder-bunder-mkpkg-tar_file-bunder-options-make-options)
* [`bunder un`](#bunder-un)
* [`bunder bunder unpack [PACKAGE]`](#bunder-bunder-unpack-package)

## `bunder hello`

Describe the command here

```
USAGE
  $ bunder hello

OPTIONS
  -n, --name=name  name to print

DESCRIPTION
  ...
  Extra documentation goes here
```

_See code: [src/commands/hello.js](https://github.com/joehop67/bunder/blob/v0.1.0/src/commands/hello.js)_

## `bunder help [COMMAND]`

display help for bunder

```
USAGE
  $ bunder help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.0/src/commands/help.ts)_

## `bunder in BUNFILE`

USAGE bunder in [pkgname]

```
USAGE
  $ bunder in BUNFILE

ARGUMENTS
  BUNFILE  Bunder package to install [PACKAGE_NAME.bun.tgz]

DESCRIPTION
  '''
  Installs a package
```

_See code: [src/commands/in.js](https://github.com/joehop67/bunder/blob/v0.1.0/src/commands/in.js)_

## `bunder bunder mkpkg tar_file [bunder options] [make options]`

Create Bunder Package

```
USAGE
  $ bunder bunder mkpkg tar_file [bunder options] [make options]

ARGUMENTS
  FILE  Source Tarball to create package from

OPTIONS
  -c, --configOptions=configOptions    Options for ./configure when building package
  -d, --dir=dir                        [default: bundir] Optional build directory
  -i, --installOptions=installOptions  Options for make install when building package
  -m, --makeOptions=makeOptions        Options for make when building package
  -n, --name=name                      Optional name of package bun file
  -o, --output=output                  Optional output directory for bun file
```

_See code: [src/commands/mkpkg.js](https://github.com/joehop67/bunder/blob/v0.1.0/src/commands/mkpkg.js)_

## `bunder un`

Uninstall package

```
USAGE
  $ bunder un
```

_See code: [src/commands/un.js](https://github.com/joehop67/bunder/blob/v0.1.0/src/commands/un.js)_

## `bunder bunder unpack [PACKAGE]`

Unpack package

```
USAGE
  $ bunder bunder unpack [PACKAGE]

ARGUMENTS
  FILE    File to unpack
  OUTDIR  Optional Output Location
```

_See code: [src/commands/unpack.js](https://github.com/joehop67/bunder/blob/v0.1.0/src/commands/unpack.js)_
<!-- commandsstop -->
