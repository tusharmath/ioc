browserify ./lib/ioc.js --standalone IOC -t es6ify > dist/ioc.js
git add ./dist/ioc.js
git commit -m "update dist"
mversion patch -m
git push --all
npm publish
