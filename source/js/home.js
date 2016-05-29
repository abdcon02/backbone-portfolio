$(document).ready(function() {
    var NavItemListView = Backbone.View.extend({
        tagName: 'div',
        className: 'nav-item'
    });

    var NavListView = Backbone.View.extend({
        el: '#main-nav'
    });

    var navContainer = new NavListView();
    var navItem = new NavItemListView();

    navContainer.$el.append(navItem);
});
