const { src, dest, series, watch } = require('gulp')
const { exec } = require("child_process");
const concat = require('gulp-concat')
const htmlMin = require('gulp-htmlmin')
const autoprefixer = require('gulp-autoprefixer')
const cleanCSS = require('gulp-clean-css')
const svgSprite = require('gulp-svg-sprite')
const convertToWebp = require('gulp-webp')
const imagemin = require('gulp-imagemin')
const babel = require('gulp-babel')
const notify = require('gulp-notify')
const del = require('del')
const gulpif = require('gulp-if')
const argv = require('yargs').argv
const sourcemaps = require('gulp-sourcemaps')
const browserSync = require('browser-sync').create()
const uglify = require('gulp-uglify-es').default

const clean = () => {
    if (argv.prod) {
        return del('dist/build') 
    }
    else {
        return del('dist/dev')
    }
}

const resources = () => {
    return src('src/resources/**')
        .pipe(gulpif(argv.prod, dest('dist/build'), dest('dist/dev')))
}

const styles = () => {
    return src('src/styles/**/*.css')
        .pipe(gulpif(!argv.prod, sourcemaps.init()))
        .pipe(concat('main.css'))
        .pipe(autoprefixer({
            cascade:false
        }))
        .pipe(cleanCSS({
            level:2
        }))
        .pipe(gulpif(!argv.prod, sourcemaps.write()))
        .pipe(gulpif(argv.prod, dest('dist/build'), dest('dist/dev')))
        .pipe(browserSync.stream())
}

const scripts = () => {
    return src([
            'src/js/components/**/*.js',
            'src/js/main.js',
        ])
        .pipe(gulpif(!argv.prod, sourcemaps.init()))
        .pipe(gulpif(argv.prod, babel({presets: ['@babel/env']})))
        .pipe(concat('app.js'))
        .pipe(gulpif(argv.prod, uglify({toplevel: true}).on('error', notify.onError())))
        .pipe(gulpif(!argv.prod, sourcemaps.write()))
        .pipe(gulpif(argv.prod, dest('dist/build'), dest('dist/dev')))
        .pipe(browserSync.stream())
}

const htmlMinify = () => {
    return src('src/**/*.html')
        .pipe(htmlMin({
            collapseWhitespace:true,
        }))
        .pipe(gulpif(argv.prod, dest('dist/build'), dest('dist/dev')))
        .pipe(browserSync.stream())
}

const svgSprites = () => {
    return src('src/images/svg/**/*.svg')
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: '../sprite.svg'
                }
            }
        }))
        .pipe(gulpif(argv.prod, dest('dist/build/images'), dest('dist/dev/images')))
}

const images = () => {
    return src([
        'src/images/**/*.jpg',
        'src/images/**/*.png',
        'src/images/*.svg',
        'src/images/**/*.jpeg',
    ])
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(convertToWebp())
        .pipe(gulpif(argv.prod, dest('dist/build/images'), dest('dist/dev/images')))
}

    const watchFiles = () => {
            browserSync.init({
                server: {
                    baseDir: 'dist/dev'
                }
            })
        
    }

    const cmd = (done) => {
        exec('git add -A && git commit -m "upd" && git push origin main', (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            return src('gulpfile.js').pipe(dest('dist/build'))
        });
    }
    
    if(!argv.prod) {
        watch('src/**/*.html', htmlMinify)
        watch('src/styles/**/*.css', styles)
        watch('src/images/svg/**/*.svg', svgSprites)
        watch('src/js/**/*.js', scripts)
        watch('src/resources/**', resources)
    }

const tasks = [resources, htmlMinify, scripts, styles, images, svgSprites]
if(!argv.prod)tasks.push(watchFiles);else tasks.push(()=>{return src('gulpfile.js').pipe(dest('dist/build'))})
exports.styles = styles
exports.clean = clean
exports.scripts = scripts
exports.cmd = cmd
exports.htmlMinify = htmlMinify


exports.default = series(tasks)
 //какой то нелепый коментарий 4
