const { src, dest, series, watch } = require("gulp"); 
const concat = require("gulp-concat");
const htmlMin = require("gulp-htmlmin");
const autoprefixer = require("gulp-autoprefixer");
const cleanCSS = require("gulp-clean-css");
const svgSprite = require("gulp-svg-sprite");
const imagemin = require("gulp-imagemin");
const uglify = require("gulp-uglify-es").default;
const babel = require("gulp-babel");
const notify = require("gulp-notify");
const sourcemaps = require("gulp-sourcemaps");
const { deleteAsync } = require("del");
const browserSync = require("browser-sync").create();

const clean = () => {
    return deleteAsync(["build"]);
}

const resources = () => {
    return src("src/resources/**")
        .pipe(dest("build"))
}

const htmlMinify = () => {
    return src("src/**/*.html")
        .pipe(htmlMin({
            collapseWhitespace: true,
        }))
        .pipe(dest("build"))
        .pipe(browserSync.stream())
}

const styles = () => {
    return src("src/styles/**/*.css")
        .pipe(sourcemaps.init())
        .pipe(concat("main.css"))
        .pipe(autoprefixer.default({
			cascade: false,
		}))
        .pipe(cleanCSS({
            level: 2,
        }))
        .pipe(sourcemaps.write())
        .pipe(dest("build"))
        .pipe(browserSync.stream())
}

const svgSprites = () => {
    return src("src/images/svg/**/*.svg")
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: '../sprite.svg',
                }
            }
        }))
        .pipe(dest("build/images"))
}

const imagesMin = () => {
    return src([
        "src/images/**/*.jpg",
        "src/images/**/*.jpeg",
        "src/images/**/*.png",
        "src/images/**/*.webp",
        "src/images/*.svg",
    ], { encoding: false })
    .pipe(imagemin())
    .pipe(dest("build/images"))
}

const scripts = () => {
    return src([
        "src/js/components/**/*.js",
        "src/js/main.js",
    ])
    .pipe(sourcemaps.init())
    .pipe(babel({
        presets: ["@babel/preset-env"]
    }))
    .pipe(concat("app.js"))
    .pipe(uglify().on("error", notify.onError()))
    .pipe(sourcemaps.write())
    .pipe(dest("build"))
    .pipe(browserSync.stream())
}

const watchFiles = () => {
    browserSync.init({
        server: {
            baseDir: "build",
        }
    });
}

watch("src/**/*.html", htmlMinify);
watch("src/styles/**/*.css", styles);
watch("src/images/svg/**/*.svg", svgSprites);
watch("src/js/**/*.js", scripts);
watch("src/resources/**", resources);

exports.clean = clean;
exports.htmlMinify = htmlMinify;
exports.styles = styles;
exports.scripts = scripts;
exports.default = series(clean, resources, htmlMinify, styles, scripts, imagesMin, svgSprites, watchFiles)