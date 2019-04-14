/**
 * Builder.js
 * @type {{}}
 */
const Fs = require('fs');
const Path = require('path');
const uglify = require('uglify-js');
const babel = require('babel-core');
const stylus = require('stylus');

// 排除文件夹或文件
// excludes.copy 不复制文件夹或文件列表
// excludes.mini 不压缩文件列表。需要目录文件相对根目录的全路径，如：./script/xx/xx.js
let excludes = {
    'copy': [
        '.gitignore',
        '.DS_Store',
        'builder.js',
        'dist.zip',
        'package.json',
        'package-lock.json',
        'README.md',
        '.git',
        '.github',
        '.idea',
        'node_modules',
        'dist',
        'style',
        'icon'
    ],
    'mini': [
        './scripts/lib/highlight.min.js',
        './scripts/lib/jquery-1.11.0.min.js'
    ]
};

(function() {
    /**
     * 清空目录
     * @param targetDir
     */
    let delDir = function (targetDir) {
        let paths = Fs.readdirSync(targetDir);
        if (paths) {
            paths.forEach(function (path) {
                let targetPath = targetDir + '/' + path,
                    stat = Fs.lstatSync(targetPath);

                if (stat.isFile()) {
                    // 如果是文件，直接删除
                    console.log('删除文件: ' + targetPath);
                    Fs.unlinkSync(targetPath);
                } else if (stat.isDirectory()) {
                    delDir(targetPath);
                }
            });
            Fs.rmdirSync(targetDir);
        }
    };

    /**
     * 压缩JS
     * @params sourceList 来源JS文件
     * @params target 输出目标JS
     */
    let jsMini = function (sourceList, target) {

        try {
            let r = babel.transformFileSync(sourceList, {
                // https://github.com/babel/babel-preset-env
                presets: ['env']
            });
            let result = uglify.minify(r.code);
            console.log(result);
            Fs.writeFileSync(target, result['code'], 'utf8');
        } catch (e) {
            console.error(e);
        }
    };

    /**
     * 拷贝目录
     * @param sourceDir 源目录
     * @param targetDir 目标目录
     */
    let deploy = function (sourceDir, targetDir) {
        let paths = Fs.readdirSync(sourceDir);
        if (paths) {
            paths.forEach(function (path) {
                if (excludes.copy.indexOf(path) !== -1) {
                    return false;
                }
                let sourcePath = sourceDir + '/' + path,
                    targetPath = targetDir + '/' + path,
                    stat = Fs.lstatSync(sourcePath);

                if (stat.isFile()) {
                    let extName = Path.extname(sourcePath).slice(1);
                    let readable, writeable;
                    if (Fs.existsSync(targetDir)) {
                        console.log('Copy file: ' + sourcePath + ' => ' + targetPath);
                        if (extName === 'js' && excludes.mini.indexOf(sourcePath) === -1) {
                            jsMini(sourcePath, targetPath);
                        } else {
                            readable = Fs.createReadStream(sourcePath);
                            writeable = Fs.createWriteStream(targetPath);
                            readable.pipe(writeable);
                        }
                    } else {
                        console.log('Mkdir: ' + targetDir);
                        Fs.mkdirSync(targetDir);
                        readable = Fs.createReadStream(sourcePath);
                        writeable = Fs.createWriteStream(targetPath);
                        readable.pipe(writeable);
                    }
                } else if (stat.isDirectory()) {

                    if (!Fs.existsSync(targetPath)) {
                        console.log('Mkdir: ' + targetPath);
                        Fs.mkdirSync(targetPath);
                    }
                    deploy(sourcePath, targetPath);
                }
            });
        }
    };



    (function() {
        console.log('Builder run.');
        // check dir
        let distDir = 'dist';
        if (Fs.existsSync(distDir)) {
            //
            delDir(distDir);
        }

        Fs.mkdirSync(distDir);

        //
         deploy('.', './dist');
    })();


    // 编译CSS文件
    const stylusInput = Fs.readFileSync('style/reader/index.styl','utf8')
    stylus(stylusInput)
      .set('paths', ['style/reader'])
      .set('compress', true)
      .render((err, css)=>{
        if (err) throw err
        css = css.replace(/\n/g, '')
        Fs.mkdirSync('dist/style');
        Fs.writeFile('dist/style/content.css' , css, (err)=>{
            if (err) throw err
            console.log('CSS Built => ./dist/style/content.css')
        })
    })

})();

