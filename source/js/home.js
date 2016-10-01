// TODO - document ready was so 2010. Just load the JS in the footer for a faster response time.

$(document).ready(function() {
    // Namespace the objects
    var app = {};
    app.baseUrl = 'http://localhost:8000/'
    app.imagePath = app.baseUrl + 'images/';
    app.dataPath = app.baseUrl + 'data/';
    app.projectPath = app.baseUrl + 'app/projects/'

    
    app.buildImage = function(object) {
        if (object.image !== undefined && object.image.indexOf('http') == -1) {
            object.image = app.imagePath + object.image;
        }
    }

////////////////////////////////////////////////
//    Navigation
////////////////////////////////////////////////

    app.NavItem = Backbone.Model;

    app.NavListCollection = Backbone.Collection.extend({
        model: app.NavItem,
        url: app.dataPath + 'nav.json'
    });

    app.NavListView = Backbone.View.extend({
        el: '.navigation',
        template: _.template( $('.item-navigation-template').html() ),

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

    new app.NavListView({collection: new app.NavListCollection()});

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
          'click': 'onClick'
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
                app.buildImage(json);
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
    app.ProjectItemCollection = new app.ProjectCollection;
    new app.ProjectView({collection: app.ProjectItemCollection});

////////////////////////////////////////////////
//    Item Landing
////////////////////////////////////////////////

    app.ItemLandingView = Backbone.View.extend({
        tagName: 'div',
        className: 'item-landing',
        template: _.template( $('.item-landing-template').html() ),

        events: {
            'click .back-to-project-collection': 'clickBackButton',
            'click .load-project': 'loadProject'
        },

        loadProject: function(e) {
            var projectUrl = this.model.get("project_url");
            var fullProjectUrl = app.projectPath + projectUrl;
            window.location.href = fullProjectUrl;
        },

        clickBackButton: function(e) {
            this.remove();
            new app.ProjectView({collection: app.ProjectItemCollection});
        },

        initialize: function() {
            this.$el.appendTo('#content');
            this.render();
        },

        render: function() {
            var json = this.model.toJSON();
            app.buildImage(json);
            var html = this.template(json);
            this.$el.append(html);
        }
    })

    setTimeout( function() {
        $('[data-id=1]').click()
    }, 10)

});
