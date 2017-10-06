'use strict';
module.exports = function (grunt) {
    // time how long task take. can help when optimizing build times.
    require('time-grunt')(grunt);
    // automatically load required grunt task
    require('jit-grunt')(grunt, {
        useminPrepare: 'grunt-usemin'
    });
    // define the config for all tasks
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        //    make sure code styles are up to par and there are no obvious mistakes.
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: {
                src: [
                    'Gruntfile.js',
                    'app/scripts/{,*/}*.js'
                ]
            }
        },
        useminPrepare: {
            html: 'app/index.html',
            options: {
                dest: 'dist'
            }
        },
        concat: {
            // options: {
            //     separator: ';'
            // },
            //dist config is provided by useminPrepare
            dist: {}
        },
        uglify:{
            //dist config is provided by useminPrepare
            dist:{}
        },
        cssmin:{
            //dist config is provided by useminPrepare
            dist:{}
        },
        filerev:{
            options:{
                encoding:'utf-8',
                algorithm:'md5',
                length:20
            },
            release:{
                files:[
                    {
                        src:[
                            'dist/scripts/*.js',
                            'dist/assets/css/*.css'
                        ]
                    }
                ]
            }
        },
        usemin:{
            html:['dist/*.html'],
            css:['dist/assets/css/*.css']
            // options:{
            //     assetsDirs:['dist','dist/assets']
            // }
        },
        copy: {
            dist: {
                cwd: 'app',
                src: ['**', '!assets/css/**/*', '!scripts/**/*', 'scripts/app.js','scripts/ftp/ExpImportController.js'],
                dest: 'dist',
                expand: true
            }
        },
        clean: {
            build: {
                src: ['dist/']
            }
        }
    });
    grunt.registerTask('build', [
        'clean',
        //'jshint',
        'useminPrepare',
        'concat',
        'cssmin',
        'uglify',
        'copy',
        'filerev',
        'usemin'
    ]);
    grunt.registerTask('default', ['build']);
};
