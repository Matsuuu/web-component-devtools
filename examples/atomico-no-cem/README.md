![Atomico](https://raw.githubusercontent.com/atomicojs/docs/master/.gitbook/assets/h4.svg)
![Atomico](https://raw.githubusercontent.com/atomicojs/docs/master/.gitbook/assets/h3.svg)

### Hi, I'm [@uppercod](https://twitter.com/uppercod), creator of Atomico and I want to thank you for starting with Atomico.

If you need help you can find it at:

[![twitter](https://raw.githubusercontent.com/atomicojs/docs/master/.gitbook/assets/twitter.svg)](https://twitter.com/atomicojs)
[![discord](https://raw.githubusercontent.com/atomicojs/docs/master/.gitbook/assets/discord.svg)](https://discord.gg/7z3rNhmkNE)
[![documentation](https://raw.githubusercontent.com/atomicojs/docs/master/.gitbook/assets/doc-1.svg)](https://atomico.gitbook.io/doc/)
[![discord](https://raw.githubusercontent.com/atomicojs/docs/master/.gitbook/assets/doc.svg)](https://webcomponents.dev/edit/collection/F7dm6YnMEDRtAl57RTXU/d6E4w07fsQbb0CelYQac)

Now what you have installed is a quick start kit based on Vite, which you can scale for your project, now to continue you must execute the following commands:

1. `npm install`
2. `npm start` : Initialize the development server
3. `npm build` : Optional, Generate a build of your project from the html file [index.html](index.html).

## Workspace

### Recommended structure

```bash
site
src
  |- my-component
  |  |- my-component.{js,jsx,ts,tsx}
  |  |- my-component.test.js
  |  |- my-component.css
  |  |- README.md
  |- components.js # import all components
```

### Add testing

The test environment is preconfigured for [@web/test-runner](https://modern-web.dev/docs/test-runner/overview/), you must complete the installation of the following devDependencies, installed the devDependencies you can execute the command `npm run test`:

```bash
npm install -D @web/test-runner @esm-bundle/chai vite-web-test-runner-plugin
```

#### Test example

```js
import { expect } from "@esm-bundle/chai";

describe("my test", () => {
  it("foo is bar", () => {
    expect("foo").to.equal("bar");
  });
});
```

> `@web/test-runner` supports asynchrony, coverage, [viewport and more](https://modern-web.dev/docs/test-runner/commands/).

### NPM export

Atomico owns the [@atomico/exports](https://atomico.gitbook.io/doc/atomico/atomico-exports) tool that simplifies the generation of builds, types and exports by distributing webcomponents in NPM, you must complete the installation of the following devDependencies, installed the devDependencies you can execute the command `npm run exports`:

```bash
npm install -D @atomico/exports
```
