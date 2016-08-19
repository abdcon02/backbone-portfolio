$(document).ready(function() {

    // Namespace the objects
    var app = {};

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

    app.ProjectItem = Backbone.Model.extend({
        defaults: {
            name:'wrong',
            short_description: 'wrong',
            url: 'wrong',
            image: 'wrong'
        }
    })

    app.ProjectCollection = Backbone.Collection.extend({
        model: app.NavItem,
        url: '../data/projects.json'
    });

    app.ProjectView = Backbone.View.extend({
        el: ".project-collection",

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
            var url = model.get("url")
            var shortDescription = model.get("short_description");
            var name = model.get("name");
            var image = model.get("image");
            var html =
            "<div class='project-item'>" +
                "<a href='" + model.get(url) + "'>" +
                    "<img src='" +  image + "' alt='alt project image' />" +
                    "<div class='project-item-content'>" +
                        "<h1>" + name + "</h1>" +
                        "<p>" + shortDescription + "</p>" +
                    "</div>" +
                "</a>" +
            "</div>";
            this.$el.append(html);
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
