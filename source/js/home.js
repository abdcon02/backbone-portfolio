$(document).ready(function() {

    // Namespace the objects
    var app = {};

    app.NavItem = Backbone.Model.extend({
        defaults: {
            name: "Golf",
            url: null
        }
    });

    app.NavListCollection = Backbone.Collection.extend({
        model: app.NavItem,
        url: '../data/nav.json'
    });


    app.NavListView = Backbone.View.extend({
        el: "#main-nav",


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
            this.collection.forEach(function(model) {
                scope.output(model)
            });
            return this;
        },

        output: function(model) {
            var html = "<div>" + model.get("name") + "</div>";
            this.$el.append(html);
        }
    });

    var testView = new app.NavListView({collection: new app.NavListCollection()});


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
