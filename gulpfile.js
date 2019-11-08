const { src, dest, parallel } = require('gulp');
const concat = require('gulp-concat');

function html(done) {
  return src('src/**/*.html')
    .pipe(dest('build/html'))
    done();
}

function css(done) {
//   return src('client/templates/*.less')
//     .pipe(less())
//     .pipe(minifyCSS())
//     .pipe(dest('build/css'))
    done()
}

function js(done) {
  return src(['src/**/*.js', '!src/dataToDB.js'], { sourcemaps: true })
    .pipe(concat('app.min.js'))
    .pipe(dest('build/js', { sourcemaps: true }))
    done()
}

function images(done) {
  return src('src/image/*.*')
    .pipe(dest('build/images'))
  done();
}

exports.js = js;
exports.css = css;
exports.html = html;
exports.images = images;
exports.default = parallel(html, css, js, images);