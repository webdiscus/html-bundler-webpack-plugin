## Problem `FIXED` in v3.6.2

Compiling all entrypoint files after changes of a non-entry file.

**Project files**

```
pages/home/index.html <= entrypoint
pages/home/includes/header.html <= non entry partial

pages/about/index.html <= entrypoint
pages/about/includes/header.html <= non entry partial
```

### Reproduce

- change `pages/home/index.html` => will be rendered only this file. OK
- change `pages/home/includes/header.html` => will be recompiled pages:
  - pages/home/index.html (with all dependencies), OK
  - pages/about/index.html (with all dependencies), NOT OK, should not be recompiled (`FIXED`)
