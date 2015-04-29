browserify ioc.coffee --standalone IOC -t coffeeify  > dist/ioc.js
git add ./dist/ioc.js
git commit -m "update dist"
mversion patch -m
ggpush
npm publish
