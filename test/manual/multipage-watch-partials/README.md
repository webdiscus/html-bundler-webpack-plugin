# Watching partial files used in a multi-page configuration.

Test for watching a changes in partials included in a template:

- ./src/views/partials/footer.html
- ./src/views/partials/license.html

After a changing in partials, the following pages should be correct rebuilt:

- ./src/views/home.html
- ./src/views/about.html
- ./src/views/contact.html
