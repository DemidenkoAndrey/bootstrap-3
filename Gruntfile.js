module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*!\n' +
        ' * Tempus Dominus Bootstrap3 v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
        ' * Copyright 2016-<%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
        ' * Licensed under MIT (https://github.com/tempusdominus/bootstrap-3/blob/master/LICENSE)\n' +
        ' */\n',
        jqueryCheck: 'if (typeof jQuery === \'undefined\') {\n' +
        '  throw new Error(\'Tempus Dominus Bootstrap3\\\'s requires jQuery. jQuery must be included before Tempus Dominus Bootstrap3\\\'s JavaScript.\')\n' +
        '}\n',
        jqueryVersionCheck: '+function ($) {\n' +
        '  var version = $.fn.jquery.split(\' \')[0].split(\'.\')\n' +
        '  if ((version[0] < 2 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1) || (version[0] >= 4)) {\n' +
        '    throw new Error(\'Tempus Dominus Bootstrap3\\\'s requires at least jQuery v1.9.1 but less than v4.0.0\')\n' +
        '  }\n' +
        '}(jQuery);\n\n',
        momentCheck: 'if (typeof moment === \'undefined\') {\n' +
        '  throw new Error(\'Tempus Dominus Bootstrap3\\\'s requires moment.js. Moment.js must be included before Tempus Dominus Bootstrap3\\\'s JavaScript.\')\n' +
        '}\n',
        momentVersionCheck: 'var version = moment.version.split(\'.\')\n' +
        'if ((version[0] <= 2 && version[1] < 17) || (version[0] >= 3)) {\n' +
        '  throw new Error(\'Tempus Dominus Bootstrap3\\\'s requires at least moment.js v2.17.0 but less than v3.0.0\')\n' +
        '}\n',
        uglify: {
            target: {
                files: {
                    'build/js/<%= pkg.name %>.min.js': 'build/js/<%= pkg.name %>.js'
                }
            },
            options: {
                mangle: true,
                compress: {
                    dead_code: false // eslint-disable-line
                },
                output: {
                    ascii_only: true // eslint-disable-line
                },
                report: 'min',
                preserveComments: 'some'
            }
        },
        eslint: {
            options: {
                configFile: 'eslintrc.json'
            },
            target: ['Gruntfile.js', 'src/js/*.js', 'test/*.js']
        },
        env: {
            paris: {
                TZ: 'Europe/Paris' // sets env for phantomJS https://github.com/ariya/phantomjs/issues/10379#issuecomment-36058589
            }
        },
        connect: {
            server: {
                options: {
                    port: 8099
                }
            }
        },
        jasmine: {
            customTemplate: {
                src: 'src/js/*.js',
                options: {
                    specs: 'test/*Spec.js',
                    helpers: 'test/*Helper.js',
                    host: 'http://127.0.0.1:8099',
                    vendor: [
                        'node_modules/jquery/dist/jquery.min.js',
                        'node_modules/moment/min/moment-with-locales.min.js',
                        'node_modules/moment-timezone/moment-timezone.js'
                    ],
                    display: 'none',
                    summary: 'true'
                }
            }
        },
        nugetpack: {
            core: {
                src: 'src/nuget/Tempus.Dominus.Core.nuspec',
                dest: 'build/nuget',
                options: {
                    version: '<%= pkg.version %>'
                }
            }
        },
        babel: {
            dev: {
                options: {
                    sourceMap: true,
                    compact: false
                },
                files: {
                    'build/js/<%= pkg.name %>.js': 'src/js/<%= pkg.name %>.js'
                }
            },
            dist: {
                options: {
                    compact: false,
                    'presets': [
                        [
                            'es2015',
                            {
                                'modules': false,
                                'loose': true
                            }
                        ]
                    ],
                    'plugins': [
                        'transform-es2015-modules-strip'
                    ]
                },
                files: {
                    'build/js/<%= pkg.name %>.js': 'build/js/<%= pkg.name %>.js'
                }
            }
        },
        concat: {
            options: {
                // Custom function to remove all export and import statements
                process: function (src) {
                    return src.replace(/^(export|import).*/gm, '');
                }
            },
            bootstrap: {
                src: [
                    'node_modules/tempusdominus-core/src/js/tempusdominus-core.js',
                    'src/js/<%= pkg.name %>.js'
                ],
                dest: 'build/js/<%= pkg.name %>.js'
            }
        },
        less: {
            production: {
                options: {
                    cleancss: true,
                    compress: true,
                    paths: 'node_modules'
                },
                files: {
                    'build/css/<%= pkg.name %>.min.css': 'src/less/<%= pkg.name %>-build.less'
                }
            },
            development: {
                options: {
                    paths: 'node_modules'
                },
                files: {
                    'build/css/<%= pkg.name %>.css': 'src/less/<%= pkg.name %>-build.less'
                }
            }
        },
        stamp: {
            options: {
                banner: '<%= banner %>\n<%= jqueryCheck %>\n<%= jqueryVersionCheck %>\n<%= momentCheck %>\n<%= momentVersionCheck %>\n+function () {\n',
                footer: '\n}();'
            },
            bootstrap: {
                files: {
                    src: '<%= concat.bootstrap.dest %>'
                }
            }
        },
        watch: {
            src: {
                files: '<%= concat.bootstrap.src %>',
                tasks: ['default']
            }
        }
    });

    //grunt.loadTasks('tasks');

    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-nuget');

    require('load-grunt-tasks')(grunt);
    grunt.registerTask('default', 'build');// ['concat', 'eslint', 'babel:dist']);// 'env:paris', 'connect', 'jasmine']);
    grunt.registerTask('build:travis', [
        // code style
        'eslint', 'jscs',
        // build
        'babel:dist', 'uglify', 'less'//,
        // tests
        //'env:paris', 'connect', 'jasmine'
    ]);

    // Task to be run when building
    grunt.registerTask('build', ['babel:dev', 'concat', 'eslint', 'babel:dist', 'stamp', 'uglify']);

    grunt.registerTask('test', ['build', 'env:paris', 'connect', 'jasmine']);

    grunt.registerTask('docs', 'Generate docs', function () {
        grunt.file.copy('build/js/tempusdominus-bootstrap-3.js', 'src/docs/theme/js/tempusdominus-bootstrap-3.js');
        grunt.file.copy('build/css/tempusdominus-bootstrap-3.css', 'src/docs/theme/css/tempusdominus-bootstrap-3.css');

        grunt.util.spawn({
            cmd: 'mkdocs',
            args: ['build', '--clean']
        });
    });

    grunt.registerTask('release', function (version) {
        if (!version || version.split('.').length !== 3) {
            grunt.fail.fatal('malformed version. Use grunt release:1.2.3');
        }

        grunt.task.run([
            'bump_version:' + version,
            'build:travis',
            'docs',
            'nugetpack'
        ]);
    });
};
