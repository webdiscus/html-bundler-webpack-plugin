## Problem `FIXED` in v3.6.2

Compiling all entrypoint files after changes of a non-entry file.

**Project files**

```
pages/home/index.pug <= entrypoint
pages/home/includes/header.pug <= non entry partial

pages/about/index.pug <= entrypoint
pages/about/includes/header.pug <= non entry partial
```

### Reproduce

- change `pages/home/index.pug` => will be rendered only this file. OK
- change `pages/home/includes/header.pug` => will be recompiled pages:
  - pages/home/index.pug (with all dependencies), OK
  - pages/about/index.pug (with all dependencies), NOT OK, should not be recompiled (`FIXED`)
