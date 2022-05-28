# Snake

Snake game for OSS class - CAU.

## 1. Installation

Install dependencies

```bash
yarn
```

## 2. Basic usage

Just run `start` script to launch the game.

```bash
yarn start
```

## 3. Packaging

This project is mean to be used with node 16. Any other version might generate issues.
To generate a standalone program, run:

```bash
yarn package
```

Then run the generated program.

```bash
./out/Snake\ -\ OSS\ project\ 1-linux-x64/electron-starter
```

## 4. Docker

If you want, you can package the project via Docker.

```bash
docker run --rm -v $PWD:/home/ -w /home -it node:16-alpine sh -c 'apk add git && yarn package'
```

Then run the generated program.

```bash
./out/Snake\ -\ OSS\ project\ 1-linux-x64/electron-starter
```