module.exports = function( grunt ) {
  'use strict';

  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

  //
  // Grunt configuration:
  //
  // https://github.com/cowboy/grunt/blob/master/docs/getting_started.md
  //
  grunt.initConfig({

    // Project configuration
    // ---------------------
    concat: {
      dev: {
        src: ['app/scripts/config.js', 'app/scripts/services/*.js', 'app/scripts/controllers/*.js', 'app/scripts/directives/*.js', 'app/scripts/module.js'],
        dest: 'app/scripts/vendor/infowrap-angular-isotope.js'
      },
      dist: {
        src: ['app/scripts/config.js', 'app/scripts/services/*.js', 'app/scripts/controllers/*.js', 'app/scripts/directives/*.js', 'app/scripts/module.js'],
        dest: 'dist/infowrap-angular-isotope.js'
      }
    },

    // specify an alternate install location for Bower
    bower: {
      dir: 'app/components'
    },

    clean: [
      "dist"
    ],

    // Coffee to JS compilation
    coffee: {
      dev: {
        options: {
          bare: true
        },
        expand: true,
        cwd: "app/coffee",
        src: ["**/*.coffee"],
        dest: "app/scripts",
        ext: ".js"
      }
    },

    // compile .scss/.sass to .css using Compass
    compass: {
      dist: {
        // http://compass-style.org/help/tutorials/configuration-reference/#configuration-properties
        options: {
          css_dir: 'temp/styles',
          sass_dir: 'app/styles',
          images_dir: 'app/images',
          javascripts_dir: 'temp/scripts',
          force: true
        }
      }
    },

    sass: {                                 // Task
      dist: {                             // Target
        files: {                        // Dictionary of files
          'main.css': 'main.scss'     // 'destination': 'source'
        }
      },
      dev: {                              // Another target
        options: {                      // Dictionary of render options
          includePaths: [
            'path/to/imports/'
          ]
        },
        files: {
          'main.css': 'main.scss'
        }
      }
    },

    // generate application cache manifest
    manifest:{
      dest: ''
    },

    // default watch configuration
    watch: {
      index: {
        files: ["app/index.html"],
        tasks: ["timestamp"]
      },

      concat: {
        files: 'app/scripts/**/*.js',
        tasks: 'concat reload'
      },
      coffee: {
        files: 'app/scripts/**/*.coffee',
        tasks: 'coffee reload'
      },
      compass: {
        files: [
          'app/styles/**/*.{scss,sass}'
        ],
        tasks: 'compass reload'
      },
      reload: {
        files: [
          'app/*.html',
          'app/styles/**/*.css',
          'app/scripts/**/*.js',
          'app/views/**/*.html',
          'app/images/**/*'
        ],
        tasks: 'reload'
      }
    },

    changelog: {
      options: {
        dest: "CHANGELOG.md",
        templateFile: "lib/changelog.tpl.md",
        github:"https://github.com/infowrap/angular-isotope.git"
      }
    },

    // default lint configuration, change this to match your setup:
    // https://github.com/cowboy/grunt/blob/master/docs/task_lint.md#lint-built-in-task
    lint: {
      files: [
        'Gruntfile.js',
        'app/scripts/**/*.js',
        'spec/**/*.js'
      ]
    },

    // specifying JSHint options and globals
    // https://github.com/cowboy/grunt/blob/master/docs/task_lint.md#specifying-jshint-options-and-globals
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      globals: {
        angular: true
      }
    },

    // Build configuration
    // -------------------

    // the staging directory used during the process
    staging: 'temp',
    // final build output
    output: 'dist',

    mkdirs: {
      staging: 'app/'
    },

    // Below, all paths are relative to the staging directory, which is a copy
    // of the app/ directory. Any .gitignore, .ignore and .buildignore file
    // that might appear in the app/ tree are used to ignore these values
    // during the copy process.

    // concat css/**/*.css files, inline @import, output a single minified css
    css: {
      'styles/main.css': ['styles/**/*.css']
    },

    // renames JS/CSS to prepend a hash of their contents for easier
    // versioning
    rev: {
      js: 'scripts/**/*.js',
      css: 'styles/**/*.css',
      img: 'images/**'
    },

    // usemin handler should point to the file containing
    // the usemin blocks to be parsed
    'usemin-handler': {
      html: 'index.html'
    },

    // update references in HTML/CSS to revved files
    usemin: {
      html: ['**/*.html'],
      css: ['**/*.css']
    },

    // HTML minification
    html: {
      files: ['**/*.html']
    },

    // Optimizes JPGs and PNGs (with jpegtran & optipng)
    img: {
      dist: '<config:rev.img>'
    },

    // rjs configuration. You don't necessarily need to specify the typical
    // `path` configuration, the rjs task will parse these values from your
    // main module, using http://requirejs.org/docs/optimization.html#mainConfigFile
    //
    // name / out / mainConfig file should be used. You can let it blank if
    // you're using usemin-handler to parse rjs config from markup (default
    // setup)
    rjs: {
      // no minification, is done by the min task
      optimize: 'none',
      baseUrl: './scripts',
      wrap: true
    }
  });

  grunt.registerTask("preview", "Development build", function() {
    grunt.log.writeln("Development build");
    grunt.task.run("dev");
  });

  grunt.registerTask("dev", ["clean", "coffee:dev", "concat:dev", "server", "watch:index"]);

  grunt.registerTask("release", ["clean", "coffee:dev", "concat:dist"]);

  grunt.registerTask("server", "custom preview server using express", function() {
    grunt.log.writeln("Express server listening on port 8000");
    require("./app-server.js").listen(8000);
    require("child_process").exec("open \"http://localhost:8000\"");
  });

  // Print a timestamp (useful for when watching)
  grunt.registerTask("timestamp", function() {
    grunt.log.subhead(Date());
  });

  // Alias the `test` task to run `testacular` instead
  grunt.registerTask('test', 'run the karma test driver', function () {
    var done = this.async();
    require('child_process').exec('karma start --single-run', function (err, stdout) {
      grunt.log.write(stdout);
      done(err);
    });
  });
};
