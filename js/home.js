$(document).ready(function() {
   var NavItemListView = Backbone.View.extend({
       tagName: 'div',
       className: 'nav-item'
   });

    var NavListView = Backbone.View.extend({
        el: '#main-nav'
    });

    var navContainer = NavListView();

    navContainer.$el.append('hey');
});
