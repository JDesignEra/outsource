const gulp = require('gulp');
const sass = require('gulp-sass');
const rename = require('gulp-rename');

function sass2css(done) {
    let x = gulp.src(['./public/scss/bootstrap/bootstrap.scss', './public/scss/mdb/mdb.scss'])
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(rename({extname: ".min.css"}))
        .pipe(gulp.dest('./public/css/vendor'));

    x.on('data', function(chunk) {
        let contents = chunk.contents.toString().trim();
        let buffLength = process.stdout.columns;
        let hr = '\n\n' + Array(buffLength).join("_") + '\n\n';

        if (contents.length > 1) {
            process.stdout.write('sass2html: ' + chunk.path + '\n');
        }
    });

    process.stdout.write('\n');
    done();
}

function watch() {
    gulp.watch(['./public/scss/bootstrap/bootstrap.scss', './public/scss/mdb/mdb.scss'], sass2css);
}

exports.default = sass2css;
exports.watch = watch;