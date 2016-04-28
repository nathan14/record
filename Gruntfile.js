// Gruntfile.js

// our wrapper function (required by grunt and its plugins)
// all configuration goes inside this function
module.exports = function(grunt) {

  // ===========================================================================
  // CONFIGURE GRUNT ===========================================================
  // ===========================================================================
  grunt.initConfig({
    watch: {
        css: {
            files: ['src/**/style.sass'],
            tasks: ['sass']
        },
        files: ['src/**/*.css'],
        tasks: ['cssmin'],
        scripts: { 
            files: 'src/**/*.js', tasks: ['jshint', 'uglify'] 
        }
    },

    babel: {
        options: {
            sourceMap: true,
            presets: ['es2015']
        },
        dist: {
            files: {
                'dist/js/app.js': 'src/js/app.js'
            }
        }
    },

    jshint: {
        options: {
            reporter: require('jshint-stylish')
        },
        build: ['Gruntfile.js', 'src/js/script.js']
    },

    cssmin: {
        build: {
            files: {
              'dist/css/style.min.css': ['src/**/*.css']
            }
        }
    },

    sass: {
        build: {
            files: {
                'src/css/style.css': 'src/**/style.sass'
            }
        }
    },

    uglify: {
        build: {
            files: {
              'dist/js/script.min.js': ['src/js/script.js']
            }
        }
    }
  });

  grunt.registerTask('default', ['jshint', 'uglify', 'cssmin', 'sass']);

  // ===========================================================================
  // LOAD GRUNT PLUGINS ========================================================
  // ===========================================================================
  // we can only load these if they are in our package.json
  // make sure you have run npm install so our app can find these
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
};
