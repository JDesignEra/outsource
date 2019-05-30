const gulp = require('gulp');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const imageMin = require('gulp-imagemin');

function sass2css(done) {
    let x = gulp.src(['./public/scss/bootstrap/bootstrap.scss', './public/scss/mdb/mdb.scss'])
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(rename({extname: ".min.css"}))
        .pipe(gulp.dest('./public/css/vendor'));

    output(x, 'sass2html');
    done();
}

function imgMin(done) {
    let x = gulp.src(['./public/img/**/*.png', './public/img/**/*.jpg', './public/img/**/*.jpeg', './public/img/**/*.gif', './public/img/**/*.svg'])
        .pipe(imageMin())
        .pipe(gulp.dest('./public/img/'));

    output(x, 'imageMin');
    done();
}

// For cmd/terminal output
function output(gulpSrc, funcName) {
    gulpSrc.on('data', function(chunk) {
        let contents = chunk.contents.toString().trim();
        let buffLength = process.stdout.columns;
        let hr = '\n\n' + Array(buffLength).join("_") + '\n\n';

        if (contents.length > 1) {
            process.stdout.write(funcName + ': ' + chunk.path + '\n');
        }
    });

    process.stdout.write('\n');
}

exports.scss2css = sass2css;
exports.imgmin = imgMin;
exports.default = function() {
    gulp.watch(['./public/scss/bootstrap/bootstrap.scss', './public/scss/mdb/mdb.scss'], sass2css);
    gulp.watch('./public/img/**/*', imgMin);
};