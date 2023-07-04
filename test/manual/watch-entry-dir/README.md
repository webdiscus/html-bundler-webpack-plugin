# Manual tests in the `serve/watch` mode

## BUG

After changes in the generated deep pages are not replaced source files with output filenames.

The bug is fixed in `v2.1.0`.

### Reproduce / test

```
npm start
- all output filenames in all pages are generated correct
> change views/news/tech/index.html => output filenames OK
  bug -> views/news/sport/index.html => contains source files instead of output filenames
```

Open the `http://localhost:8080/webpack-dev-server` url to see the list of generated files in the `serve/watch` mode.

---
##  BUG

After the JS file manipulation is missing the JS content.

The bug is fixed in `v2.1.0`.

### Reproduce what is expected

1. the `views/news/tech/index.html` contains the `app-tech.js` file.
   Remove this file in another directory to simulate missing file.

2. `npm start`

3. Add the missing `app-tech.js` file into the `views/news/tech/` directory.

4. The result is as expected. OK.\
   The generated `views/news/tech/index.html` contains the missing file.\
   In the browser console is displayed some output from the js file.


### Reproduce the bug

1. the `views/news/tech/index.html` contains the `app-tech.js` file.
   The file exists in the directory.

2. `npm start`

3. Remove the `app-tech.js` file in another directory to simulate missing file.
3. Add the missing `app-tech.js` file into the `views/news/tech/` directory.

4. The BUG.\
   The generated `views/news/tech/index.html` contains the missing file - OK.\
   In the browser console is no output from the js file - BUG.\
   The `app-tech.js` file not exists in `compilation.modules`.

---
## Test the manipulation with the entry template

### Action modify

- modify exists +OK
- add > modify +OK
- modify exists +OK; rename +OK > modify +OK

### Action add

- add one => +OK

### Action rename

- rename exists +OK
- add > rename(x) +OK

### Action delete

- delete exists +OK (delete old output html)
- delete exists > add the same > +OK
- delete exists > add new file > +OK

### Remove / add

1. Remove `views/news/about/index.html` into `files` dir
2. Remove the same filename `files/index.html` back into the `views/news/about/` source dir
3. Should be OK, no error.
4. Add file2 > remove file1 (OK) >
   - remove file1 > add file2 > add file1 > remove file1 (OK) > remove file2(ERR, action: '')
   - remove file1 > add file2 > add file1 > remove file2 (OK) > remove file1(ERR, action: '')

   - remove file1 > add file2 > add file1 > remove file1(sometime ERR, action: '')

   - remove file1 > add file1 > add file2 > remove file1 (OK) > remove file2(OK)
   - remove file1 > add file1 > add file2 > remove file2 (OK) > remove file1(OK)
   - add file2 > add file1 > remove file1 (OK) > remove file2(ok)

---
## Test the manipulation with the JS file used in the entry template

### OLD js file is already loaded in html: <script src="app.js"></script>

- del file in dir > del file in html => +OK
- del file in dir > add the same file in dir => +OK
- del file in html > del file in dir => +OK

- rename file in dir > rename file in html => +OK
- rename file in html > rename file in dir => +OK

- modify file in dir => +OK

### NEW js file was yet not loaded in html

- add file in dir > add file in html => +OK
- add file in html > add missing file in dir => +OK
- add file in html > add another file in dir > add missing file in dir => +OK
