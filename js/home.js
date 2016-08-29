$(document).ready(function() {

    // Namespace the objects
    var app = {};
    app.imagePath = 'http://localhost:8000/images/';
    app.buildImage = function(object) {
        if (object.image !== undefined && object.image.indexOf('http') == -1) {
            object.image = app.imagePath + object.image;
        }
    }

    app.NavItem = Backbone.Model;

    app.NavListCollection = Backbone.Collection.extend({
        model: app.NavItem,
        url: '../data/nav.json'
    });


    app.NavListView = Backbone.View.extend({
        el: ".top-header",

        initialize: function() {
            var scope = this;
            this.collection.fetch({
                success: function() {
                    scope.render()
                }
            })
        },

        render: function() {
            var scope = this;
            this.collection.each(function(model) {
                scope.output(model)
            });
            return this;
        },

        output: function(model) {
            var html = "<div>" + model.get("name") + "</div>";
            this.$el.append(html);
        }
    });

    new app.NavListView({collection: new app.NavListCollection()});

    app.ProjectItem = Backbone.Model;

    app.ProjectCollection = Backbone.Collection.extend({
        model: app.NavItem,
        url: '../data/projects.json'
    });

    app.ProjectView = Backbone.View.extend({
        el: ".project-collection",
        template: _.template( $('.project-collection-template').html() ),

        initialize: function() {
            var scope = this;
            this.collection.fetch({
                success: function() {
                    scope.render()
                }
            })
        },

        render: function() {
            var scope = this;
            this.collection.each(function(model) {
                var json = model.toJSON();
                app.buildImage(json);
                if (json.featured) {
                    json.description = json.long_description;
                    json.featuredClass = 'featured';
                } else {
                    json.description = json.short_description;
                    json.featuredClass = '';
                }


                var html = scope.template(json);
                scope.$el.append(html);
            });
            return this;
        },

        output: function(model) {
            var url = model.get("url")
            var name = model.get("name");
            var image = model.get("image");
        }
    })

    new app.ProjectView({collection: new app.ProjectCollection()});


    // var hello = Backbone.View.extend({
    //
    //     el: '#container',
    //
    //     template: _.template("<h1> Hello <%= anything %> </h1>"),
    //
    //     initialize: function(){
    //         this.render();
    //     },
    //
    //     render: function(){
    //         this.$el.html(this.template({anything: 'tester'}));
    //     }
    // });
    //
    // var helloView = new hello();

});
