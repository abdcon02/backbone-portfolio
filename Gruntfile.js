module.exports = function(grunt) {

    grunt.initConfig({
        svgstore: {
            dist: {
                files: {
                    'lib/svg-defs.svg': ['lib/svg/*.svg']
                },
            },
            options: {
                prefix : 'icon-', // This will prefix each ID
                cleanup: false,
                svg: { // will add and overide the the default xmlns="http://www.w3.org/2000/svg" attribute to the resulting SVG
                    viewBox : '0 0 100 100',
                    xmlns: 'http://www.w3.org/2000/svg'
                }
            },
        },
    });

    grunt.loadNpmTasks('grunt-svgstore');
    grunt.registerTask('default', ['svgstore'])

}
