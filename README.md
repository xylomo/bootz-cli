# Bootz

CLI tool that I use for my React projects that helps me quickly bootstrap a React app with SSR.

## Why Not Next?

I like Next, but I wanted something different and I also wanted to make something that wasn't bloaty. Next is great, but when you start to do deployments you can quickly realize how much space is taken up by unnecessary dependencies that are included during production (webpack, etc). These are not required for production but are tied to `next` as a dependency, not a devDependency.

## Disclaimer

Experimental! Use at your own risk. As I find more time, work will be done on this project.

## Getting Started

```sh
# Have not published to NPM yet.
git clone --depth=1 git@github.com:xylomo/bootz-cli.git
cd bootz
npm i
npm link

# Change into a directory you would like to start a project
cd ~/Projects

bootz create my-app
cd my-app
npm run dev
```

## Building for Production

```sh
cd my-app
npm run build

# Output will be compiled to /dist
npm run start

```

## Ejecting

`I don't like your choices. How do I get out of your crappy choices?`

I thought you might say that. Run `npm run eject` on a project that has been bootstrapped by `Bootz`. It will then convert your project into a project that contains the same scripts that `Bootz` uses. You can then customize Webpack etc with whatever you want. You can also just use Next instead?

## License

MIT