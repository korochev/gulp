const gulp = require('gulp');
const ghPages = require('gulp-gh-pages');
const { exec } = require("child_process");

const gh = () => {
    exec('git add -A && git commit -m "upd" && git push origin main')
    return gulp.src('./dist/build/**/*')
        .pipe(ghPages());
};

exports.gh = gh