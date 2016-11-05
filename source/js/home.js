// OPTIMIZE - document ready was so 2010. Figure out something better.

$(document).ready(function() {
    // Namespace the objects
    var app         = {};
    app.baseUrl     = 'http://localhost:8000/'
    app.imagePath   = app.baseUrl + 'images/';
    app.dataPath    = app.baseUrl + 'data/';
    app.projectPath = app.baseUrl + 'app/projects/';
    app.svg         = app.baseUrl + 'lib/svg/';


    app.buildImageHelper = function(object) {
        // Check that the path is set and is relative
        if (object.image && object.image.indexOf('http') == -1) {
            object.image = app.imagePath + object.image;
        }
    }

////////////////////////////////////////////////
//    Navigation
////////////////////////////////////////////////

    app.NavItem = Backbone.Model.extend({
        defaults: {
            icons: []
        }
    });

    app.NavCollection = Backbone.Collection.extend({
        model: app.NavItem,
        url: app.dataPath + 'nav.json'
    });

    app.NavView = Backbone.View.extend({
        el: '.navigation',
        template: _.template( $('.item-navigation-template').html() ),
        events: {
          'click': 'onClick'
        },

        onClick: function(e) {
            var path = $(e.target).data('path');

            // FIXME not proud of this
            $('#content div:first').trigger('terminate');

            if (path == "resume") {
              new app.ResumeView;
            } else {
              new app.ProjectView({collection: new app.ProjectCollection});
            }
        },

        initialize: function() {
            var scope = this;
            this.collection.fetch().then(function() {
                scope.render();
            })
        },

        render: function() {
            var scope = this;
            this.collection.each(function(model) {
                var json = model.toJSON();
                var html = scope.template(json);
                scope.$el.append(html);
            });
            return this;
        },
    });

    new app.NavView({collection: new app.NavCollection()});

////////////////////////////////////////////////
//    Project List
////////////////////////////////////////////////

    app.ProjectItem = Backbone.Model.extend({
        defaults: {
            tagline: ""
        }
    });

    app.ProjectCollection = Backbone.Collection.extend({
        model: app.ProjectItem,
        url: app.dataPath + 'projects.json'
    });

    app.ProjectView = Backbone.View.extend({
        tagName: 'div',
        className: 'project-collection',
        template: _.template( $('.project-collection-template').html() ),
        events: {
            'click': 'onClick',
            'terminate': 'removeView'
        },

        removeView: function() {
          this.remove();
        },

        // When we click a box, remove the current view and load the full box view
        onClick: function(e) {
            var id = $(e.target).closest('.project-item').data('id');
            var clickedModel = this.collection.get(id)
            this.remove();
            new app.ItemLandingView({model: clickedModel})
        },

        initialize: function() {
            var scope = this;
            scope.$el.appendTo('#content');
            this.collection.fetch().then(function() {
                scope.render();
            })
        },

        render: function() {
            var scope = this;
            this.collection.each(function(model) {
                var json = model.toJSON();
                app.buildImageHelper(json);
                // create featured class
                json.featured ? json.featuredClass = 'featured' : json.featuredClass = '';
                var html = scope.template(json);
                scope.$el.append(html);
            });
            return this;
        }
    })

    // TODO check if it is actually better to instantiate the collection object here and pass it to the view
    // versus declaring a new collection property in the view object
    new app.ProjectView({collection: new app.ProjectCollection});

////////////////////////////////////////////////
//    Item Landing
////////////////////////////////////////////////

    app.ItemLandingView = Backbone.View.extend({
        tagName: 'div',
        className: 'item-landing',
        template: _.template( $('.item-landing-template').html() ),

        events: {
            'click .back-to-project-collection': 'clickBackButton',
            'click .load-project': 'loadProject',
            'terminate': 'removeView'
        },

        removeView: function() {
          this.remove();
        },

        loadProject: function(e) {
          e.preventDefault()
          var projectUrl = this.model.get("project_url");
          var fullProjectUrl = app.projectPath + projectUrl;
          window.location.href = fullProjectUrl;
        },

        clickBackButton: function(e) {
            this.remove();
            new app.ProjectView({collection: new app.ProjectCollection});
        },

        initialize: function() {
            this.$el.appendTo('#content');
            this.render();
        },

        render: function() {
            var json = this.model.toJSON();
            app.buildImageHelper(json);
            json.visit_text = json.is_game ? "Play Game" : "View App";
            var html = this.template(json);
            this.$el.append(html);
        }
    });

    ////////////////////////////////////////////////
    //    Resume
    ////////////////////////////////////////////////

    app.ResumeModel = Backbone.Model.extend({
      url: app.dataPath + 'resume.json'
    });

    app.ResumeView = Backbone.View.extend({
      tagName: 'div',
      className: 'resume-container',
      //OPTIMIZE construct with a model so the view can be reused
      model: new app.ResumeModel(),
      template: _.template( $('.resume-template').html() ),

      events: {
        'terminate': 'removeView'
      },

      removeView: function() {
        this.remove();
      },

      initialize: function() {
        var scope = this;
        this.$el.appendTo('#content');
        this.model.fetch().then(function() {
          scope.render();
        });
      },

      render: function() {
        var resume = this.model.toJSON().resume;
        var html = this.template(resume);
        this.$el.append(html);
      }
    })

    ////////////////////////////////////////////////
    //    SVGs
    ////////////////////////////////////////////////


        app.svgItem = Backbone.Model.extend({

            // fetch: function () {
            //     // OPTIMIZE this.path could lead to problems
            //     $.get(this.get('path'), 'text').done(function(data) {
            //         debugger;
            //         return data;
            //     })
            // },
            //

        })

        // Convert svg names to file paths
        app.svgHelper = function(svgArray) {
            var svgs = svgArray.map(function(item) {
                return app.svg + item + '.svg';
            })
        }

        app.svgCollection = Backbone.Collection.extend({
            model: app.svgItem,
            svgItems: ['http://localhost:8000/lib/svg/alert.svg',
                'http://localhost:8000/lib/svg/arrow-down.svg'],

            test: function() {
                var self = this;
                this.svgItems.forEach(function(path) {
                    var item = new self.model;
                    item.url = path;
                    item.fetch();
                    debugger;
                })
            }
        })

    setTimeout( function() {
        $('[data-id=1]').click()
    }, 10)

});
