"use strict"

const {src, dest} = require("gulp")
const gulp = require("gulp")
const autoprefixer = require("gulp-autoprefixer")
const cssbeautify = require("gulp-cssbeautify");
const removeComments = require('gulp-strip-css-comments');
const rename = require("gulp-rename");
const rigger = require("gulp-rigger")
const sass = require("gulp-sass")(require('sass'));
const cssnano = require("gulp-cssnano");
const uglify = require("gulp-uglify");
const plumber = require("gulp-plumber");
const panini = require("panini");
const imagemin = require("gulp-imagemin");
const del = require("del");
const notify = require("gulp-notify")
const imagewebp = require("gulp-webp")
const browserSync = require("browser-sync").create();


const srcPath = "src/"
const distPath = "dist/"


const path = {
  build: {
    html: distPath,
    css: distPath + "css/",
    js: distPath + "js/",
    images: distPath + "img/"
  },
  src: {
    html: srcPath + "*.html",
    css: srcPath + "css/main.scss",
    js: srcPath + "js/*.js",
    images: srcPath + "img/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}"
  },
  watch: {
    html: srcPath + "**/*.html",
    js: srcPath + "js/**/*.js",
    css: srcPath + "css/**/*.scss",
    images: srcPath + "img/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}"
  },
  clean: "./" + distPath
}


function serve() {
  browserSync.init({
    server: {
      baseDir: "./" + distPath
    }
  });
}


function html() {
  panini.refresh()
  return src(path.src.html, {base: srcPath})
    .pipe(plumber())
    .pipe(panini({
      root: srcPath,
      layouts: srcPath + "tpl/layouts/",
      partials: srcPath + "tpl/partials/"
    }))
    .pipe(dest(path.build.html))
    .pipe(browserSync.reload({stream: true}));
}

function css() {
  return src(path.src.css, {base: srcPath + "css/"})
    .pipe(plumber({
      errorHandler: function (err) {
        notify.onError({
          title: "SCSS Error",
          message: "Error: <%= error.message %>"
        })(err);
        this.emit('end');
      }
    }))
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(cssbeautify())
    .pipe(dest(path.build.css))
    .pipe(cssnano({
      zindex: false,
      discardComments: {
        removeAll: true
      }
    }))
    .pipe(removeComments())
    .pipe(rename({
      suffix: ".min",
      extname: ".css"
    }))
    .pipe(dest(path.build.css))
    .pipe(browserSync.reload({stream: true}));
}

function js() {
  return src(path.src.js, {base: srcPath + "js/"})
    .pipe(plumber({
      errorHandler: function (err) {
        notify.onError({
          title: "JS Error",
          message: "Error: <%= error.message %>"
        })(err);
        this.emit('end');
      }
    }))
    .pipe(rigger())
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(rename({
      suffix: ".min",
      extname: ".js"
    }))
    .pipe(dest(path.build.js))
    .pipe(browserSync.reload({stream: true}));
}

function images() {
  return src(path.src.images, {base: srcPath + "img/"})
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.mozjpeg({quality: 80, progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
        plugins: [
          {removeViewBox: true},
          {cleanupIDs: false}
        ]
      })
    ]))
    .pipe(dest(path.build.images))
    .pipe(browserSync.reload({stream: true}));
}

function webpImages() {
  return src(path.src.images, {base: srcPath + "img/"})
    .pipe(imagewebp())
    .pipe(dest(path.build.images))
}

function clean() {
  return del(path.clean)
}

function copyFiles() {
  return src([`${srcPath}browserconfig.xml`, `${srcPath}.htaccess`, `${srcPath}favicon.ico`, `${srcPath}humans.txt`, `${srcPath}robots.txt`, `${srcPath}LICENSE`, `${srcPath}site.webmanifest`,])
    .pipe(dest(path.build.html))
}

function watchFiles() {
  gulp.watch([path.watch.html], html)
  gulp.watch([path.watch.css], css)
  gulp.watch([path.watch.js], js)
  gulp.watch([path.watch.images], images)
}

// const build = gulp.series(clean, gulp.parallel(html, css, js, images, webpImages, copyFiles))
const build = gulp.series(clean, gulp.parallel(html, css, js, images, copyFiles))
const watch = gulp.parallel(build, watchFiles, serve)


exports.html = html
exports.css = css
exports.js = js
exports.images = images
exports.webpImages = webpImages
exports.copyFiles = copyFiles
exports.clean = clean
exports.build = build
exports.watch = watch
exports.default = watch
