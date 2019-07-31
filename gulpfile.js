// gulpfile by Joel
const gulp = require('gulp');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const im = require('gulp-imagemin');

const nm = require('gulp-nodemon');
const bs = require('browser-sync').create();
const bsReload = bs.reload;

function sass2css(done) {
    let x = gulp.src(['./public/scss/bootstrap/bootstrap.scss', './public/scss/mdb/mdb.scss'])
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(rename({extname: ".min.css"}))
        .pipe(gulp.dest('./public/css/vendor'));

    output(x, '\x1b[32mSASS to CSS\x1b[0m');
    done();
}

function imgCompress(done) {
    let x = gulp.src(['./public/img/**/*.png', './public/img/**/*.jpg', './public/img/**/*.jpeg', './public/img/**/*.gif', './public/img/**/*.svg'])
        .pipe(im())
        .pipe(gulp.dest('./public/img/'));

    output(x, '\x1b[32mImage Compress');
    done();
}

function startNodemon(done) {
    let flag = false;

    const x = nm({
        script: 'app.js',
        stdout: false,
        ext: 'handlebars js css',
        ignore: [
            'gulpfile.js',
            'node_modules/',
            '.gitignore',
            'README.md',
            'public/uploads'
        ]
    });

    const onReady = () => {
        flag = false;
        done();
    };

    x.on('start', () => {
        flag = true;
        setTimeout(onReady, 1000);
    });

    x.on('stdout', (stdout) => {
        process.stdout.write(stdout);

        if (flag) {
            onReady();
        }
    });
}

function startBrowserSync(done) {
    bs.init({
        proxy: 'localhost:5000',
        port: 5050,
        browser: 'chrome',
        notify: true
    });

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
exports.imgmin = imgCompress;
exports.nodemon = startNodemon;
exports.browsersync = startBrowserSync;

exports.compile = () => {
    gulp.watch('./public/scss/**/*', sass2css);
    // gulp.watch('./public/img/**/*', imgCompress);
};

exports.default = gulp.series(this.nodemon, this.browsersync, () => {
    process.stdout.write('\n');
    gulp.watch('./public/scss/**/*', sass2css);
    gulp.watch('./public/img/**/*', imgCompress);

    process.stdout.write('\n');
    gulp.watch([
        './public/css/**/*',
        './public/fonts/**/*',
        './public/img/**/*',
        './public/js/**/*',
        './public/vid/**/*',
        './config/**/*',
        './controllers/**/*',
        './helpers/**/*',
        './middlewares/**/*',
        './models/**/*',
        './routes/**/*',
        './views/**/*',
        './app.js',
        './package.json'
    ], bsReload);
});