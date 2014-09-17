module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      browser_js: {
        files: ['**/*.js', '!node_modules/**/*'],
        tasks: ['browserify:debug'],
      }
    },
    browserify: {
      standalone: {
        src: [ 'main.js' ],
        dest: './dist/dragon-example.min.js',
        options: {
          browserifyOptions: {
            standalone: 'main',
            transform: ['reactify', 'uglifyify']
          }
        }
      },
      debug: {
        src: [ 'main.js' ],
        dest: './dist/dragon-example.js',
        options: {
          browserifyOptions: {
            standalone: 'main',
            transform: ['reactify']
          }
        }
      }
    },
    jshint: {
      files: [
        '**/*.js',
        '!node_modules/**/*',
      ],
      options: {
      }
    },
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['browserify']);
};
