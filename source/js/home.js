$(document).ready(function() {

    var NavItem = Backbone.Model.extend({
        url: '../data/nav.json',
        className: 'nav-item'
    });

    var NavItemCollection = Backbone.Collection.extend({
        model: NavItem
    });

    var NavListView = Backbone.View.extend({
        el: '#main-nav',

        initialize: function() {
            this.render();
        },

        render: function() {
            this.$el.html('yo');
            return this;
        }
    });

    // var navCollection = new NavItemCollection;
    var navContainerView = new NavListView();

});
