// TODO - document ready was so 2010. Just load the JS in the footer for a faster response time.
$(document).ready(function() {
    // Namespace the objects
    var app = {};
    app.baseUrl = "http://localhost:8000/";
    app.imagePath = app.baseUrl + "images/";
    app.dataPath = app.baseUrl + "data/";
    app.projectPath = app.baseUrl + "app/projects/";
    app.buildImage = function(object) {
        if (object.image !== undefined && object.image.indexOf("http") == -1) {
            object.image = app.imagePath + object.image;
        }
    };
    ////////////////////////////////////////////////
    //    Navigation
    ////////////////////////////////////////////////
    app.NavItem = Backbone.Model;
    app.NavListCollection = Backbone.Collection.extend({
        model: app.NavItem,
        url: app.dataPath + "nav.json"
    });
    app.NavListView = Backbone.View.extend({
        el: ".top-header",
        initialize: function() {
            var scope = this;
            this.collection.fetch({
                success: function() {
                    scope.render();
                }
            });
        },
        render: function() {
            var scope = this;
            this.collection.each(function(model) {
                scope.output(model);
            });
            return this;
        },
        output: function(model) {
            var html = "<div>" + model.get("name") + "</div>";
            this.$el.append(html);
        }
    });
    new app.NavListView({
        collection: new app.NavListCollection()
    });
    ////////////////////////////////////////////////
    //    Project List
    ////////////////////////////////////////////////
    app.ProjectItem = Backbone.Model;
    app.ProjectCollection = Backbone.Collection.extend({
        model: app.ProjectItem,
        url: app.dataPath + "projects.json"
    });
    app.ProjectView = Backbone.View.extend({
        tagName: "div",
        className: "project-collection",
        template: _.template($(".project-collection-template").html()),
        events: {
            click: "onClick"
        },
        // When we click a box, remove the current view and load the full box view
        onClick: function(e) {
            var id = $(e.target).closest(".project-item").data("id");
            var clickedModel = this.collection.get(id);
            this.remove();
            new app.ItemLandingView({
                model: clickedModel
            });
        },
        initialize: function() {
            var scope = this;
            scope.$el.appendTo("#content");
            this.collection.fetch().then(function() {
                scope.render();
            });
        },
        render: function() {
            var scope = this;
            this.collection.each(function(model) {
                var json = model.toJSON();
                app.buildImage(json);
                if (json.featured) {
                    json.description = json.long_description;
                    json.featuredClass = "featured";
                } else {
                    json.description = json.short_description;
                    json.featuredClass = "";
                }
                var html = scope.template(json);
                scope.$el.append(html);
            });
        }
    });
    // TODO check if it is actually better to instantiate the collection object here and pass it to the view
    // versus declaring a new collection property in the view object
    app.ProjectItemCollection = new app.ProjectCollection();
    new app.ProjectView({
        collection: app.ProjectItemCollection
    });
    ////////////////////////////////////////////////
    //    Item Landing
    ////////////////////////////////////////////////
    app.ItemLandingView = Backbone.View.extend({
        tagName: "div",
        className: "item-landing",
        template: _.template($(".item-landing-template").html()),
        events: {
            "click .back-to-project-collection": "clickBackButton",
            "click .load-project": "loadProject"
        },
        loadProject: function(e) {
            var projectUrl = this.model.get("project_url");
            var fullProjectUrl = app.projectPath + projectUrl;
            window.location.href = fullProjectUrl;
        },
        clickBackButton: function(e) {
            this.remove();
            new app.ProjectView({
                collection: app.ProjectItemCollection
            });
        },
        initialize: function() {
            this.$el.appendTo("#content");
            this.render();
        },
        render: function() {
            var json = this.model.toJSON();
            app.buildImage(json);
            var html = this.template(json);
            this.$el.append(html);
        }
    });
    setTimeout(function() {
        $("[data-id=1]").click();
    }, 10);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhvbWUuanMiXSwibmFtZXMiOlsiJCIsImRvY3VtZW50IiwicmVhZHkiLCJhcHAiLCJiYXNlVXJsIiwiaW1hZ2VQYXRoIiwiZGF0YVBhdGgiLCJwcm9qZWN0UGF0aCIsImJ1aWxkSW1hZ2UiLCJvYmplY3QiLCJpbWFnZSIsInVuZGVmaW5lZCIsImluZGV4T2YiLCJOYXZJdGVtIiwiQmFja2JvbmUiLCJNb2RlbCIsIk5hdkxpc3RDb2xsZWN0aW9uIiwiQ29sbGVjdGlvbiIsImV4dGVuZCIsIm1vZGVsIiwidXJsIiwiTmF2TGlzdFZpZXciLCJWaWV3IiwiZWwiLCJpbml0aWFsaXplIiwic2NvcGUiLCJ0aGlzIiwiY29sbGVjdGlvbiIsImZldGNoIiwic3VjY2VzcyIsInJlbmRlciIsImVhY2giLCJvdXRwdXQiLCJodG1sIiwiZ2V0IiwiJGVsIiwiYXBwZW5kIiwiUHJvamVjdEl0ZW0iLCJQcm9qZWN0Q29sbGVjdGlvbiIsIlByb2plY3RWaWV3IiwidGFnTmFtZSIsImNsYXNzTmFtZSIsInRlbXBsYXRlIiwiXyIsImV2ZW50cyIsImNsaWNrIiwib25DbGljayIsImUiLCJpZCIsInRhcmdldCIsImNsb3Nlc3QiLCJkYXRhIiwiY2xpY2tlZE1vZGVsIiwicmVtb3ZlIiwiSXRlbUxhbmRpbmdWaWV3IiwiYXBwZW5kVG8iLCJ0aGVuIiwianNvbiIsInRvSlNPTiIsImZlYXR1cmVkIiwiZGVzY3JpcHRpb24iLCJsb25nX2Rlc2NyaXB0aW9uIiwiZmVhdHVyZWRDbGFzcyIsInNob3J0X2Rlc2NyaXB0aW9uIiwiUHJvamVjdEl0ZW1Db2xsZWN0aW9uIiwiY2xpY2sgLmJhY2stdG8tcHJvamVjdC1jb2xsZWN0aW9uIiwiY2xpY2sgLmxvYWQtcHJvamVjdCIsImxvYWRQcm9qZWN0IiwicHJvamVjdFVybCIsImZ1bGxQcm9qZWN0VXJsIiwid2luZG93IiwibG9jYXRpb24iLCJocmVmIiwiY2xpY2tCYWNrQnV0dG9uIiwic2V0VGltZW91dCJdLCJtYXBwaW5ncyI6IjtBQUVB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T0FBT0MsU0FBU0MsT0FBT0g7O1FBRzNCSSxpQkFBaUIsU0FBUzFCO1lBQ3RCckIsS0FBSzJCO1lBQ0wsSUFBSWxELElBQUlvQztnQkFBYVosWUFBWXhCLElBQUk2RDs7O1FBR3pDeEMsWUFBWTtZQUNSRSxLQUFLUyxJQUFJb0IsU0FBUztZQUNsQjdCLEtBQUtJOztRQUdUQSxRQUFRO1lBQ0osSUFBSTJCLE9BQU8vQixLQUFLUCxNQUFNdUM7WUFDdEJ2RCxJQUFJSyxXQUFXaUQ7WUFDZixJQUFJeEIsT0FBT1AsS0FBS2dCLFNBQVNlO1lBQ3pCL0IsS0FBS1MsSUFBSUMsT0FBT0g7OztJQUl4QnlDLFdBQVk7UUFDUjFFLEVBQUUsZUFBZTZDO09BQ2xCIiwiZmlsZSI6ImhvbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUT0RPIC0gZG9jdW1lbnQgcmVhZHkgd2FzIHNvIDIwMTAuIEp1c3QgbG9hZCB0aGUgSlMgaW4gdGhlIGZvb3RlciBmb3IgYSBmYXN0ZXIgcmVzcG9uc2UgdGltZS5cblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgLy8gTmFtZXNwYWNlIHRoZSBvYmplY3RzXG4gICAgdmFyIGFwcCA9IHt9O1xuICAgIGFwcC5iYXNlVXJsID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAwMC8nXG4gICAgYXBwLmltYWdlUGF0aCA9IGFwcC5iYXNlVXJsICsgJ2ltYWdlcy8nO1xuICAgIGFwcC5kYXRhUGF0aCA9IGFwcC5iYXNlVXJsICsgJ2RhdGEvJztcbiAgICBhcHAucHJvamVjdFBhdGggPSBhcHAuYmFzZVVybCArICdhcHAvcHJvamVjdHMvJ1xuXG4gICAgXG4gICAgYXBwLmJ1aWxkSW1hZ2UgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICAgICAgaWYgKG9iamVjdC5pbWFnZSAhPT0gdW5kZWZpbmVkICYmIG9iamVjdC5pbWFnZS5pbmRleE9mKCdodHRwJykgPT0gLTEpIHtcbiAgICAgICAgICAgIG9iamVjdC5pbWFnZSA9IGFwcC5pbWFnZVBhdGggKyBvYmplY3QuaW1hZ2U7XG4gICAgICAgIH1cbiAgICB9XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gICAgTmF2aWdhdGlvblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICBhcHAuTmF2SXRlbSA9IEJhY2tib25lLk1vZGVsO1xuXG4gICAgYXBwLk5hdkxpc3RDb2xsZWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuICAgICAgICBtb2RlbDogYXBwLk5hdkl0ZW0sXG4gICAgICAgIHVybDogYXBwLmRhdGFQYXRoICsgJ25hdi5qc29uJ1xuICAgIH0pO1xuXG4gICAgYXBwLk5hdkxpc3RWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuICAgICAgICBlbDogXCIudG9wLWhlYWRlclwiLFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNjb3BlID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5mZXRjaCh7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnJlbmRlcigpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNjb3BlID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUub3V0cHV0KG1vZGVsKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcblxuICAgICAgICBvdXRwdXQ6IGZ1bmN0aW9uKG1vZGVsKSB7XG4gICAgICAgICAgICB2YXIgaHRtbCA9IFwiPGRpdj5cIiArIG1vZGVsLmdldChcIm5hbWVcIikgKyBcIjwvZGl2PlwiO1xuICAgICAgICAgICAgdGhpcy4kZWwuYXBwZW5kKGh0bWwpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBuZXcgYXBwLk5hdkxpc3RWaWV3KHtjb2xsZWN0aW9uOiBuZXcgYXBwLk5hdkxpc3RDb2xsZWN0aW9uKCl9KTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyAgICBQcm9qZWN0IExpc3Rcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgYXBwLlByb2plY3RJdGVtID0gQmFja2JvbmUuTW9kZWw7XG5cbiAgICBhcHAuUHJvamVjdENvbGxlY3Rpb24gPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG4gICAgICAgIG1vZGVsOiBhcHAuUHJvamVjdEl0ZW0sXG4gICAgICAgIHVybDogYXBwLmRhdGFQYXRoICsgJ3Byb2plY3RzLmpzb24nXG4gICAgfSk7XG5cbiAgICBhcHAuUHJvamVjdFZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG4gICAgICAgIHRhZ05hbWU6ICdkaXYnLFxuICAgICAgICBjbGFzc05hbWU6ICdwcm9qZWN0LWNvbGxlY3Rpb24nLFxuICAgICAgICB0ZW1wbGF0ZTogXy50ZW1wbGF0ZSggJCgnLnByb2plY3QtY29sbGVjdGlvbi10ZW1wbGF0ZScpLmh0bWwoKSApLFxuICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICAnY2xpY2snOiAnb25DbGljaydcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIC8vIFdoZW4gd2UgY2xpY2sgYSBib3gsIHJlbW92ZSB0aGUgY3VycmVudCB2aWV3IGFuZCBsb2FkIHRoZSBmdWxsIGJveCB2aWV3XG4gICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciBpZCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5wcm9qZWN0LWl0ZW0nKS5kYXRhKCdpZCcpO1xuICAgICAgICAgICAgdmFyIGNsaWNrZWRNb2RlbCA9IHRoaXMuY29sbGVjdGlvbi5nZXQoaWQpXG4gICAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgICAgICAgbmV3IGFwcC5JdGVtTGFuZGluZ1ZpZXcoe21vZGVsOiBjbGlja2VkTW9kZWx9KVxuICAgICAgICB9LFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNjb3BlID0gdGhpcztcbiAgICAgICAgICAgIHNjb3BlLiRlbC5hcHBlbmRUbygnI2NvbnRlbnQnKTtcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5mZXRjaCgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUucmVuZGVyKCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2NvcGUgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24obW9kZWwpIHtcbiAgICAgICAgICAgICAgICB2YXIganNvbiA9IG1vZGVsLnRvSlNPTigpO1xuICAgICAgICAgICAgICAgIGFwcC5idWlsZEltYWdlKGpzb24pO1xuICAgICAgICAgICAgICAgIGlmIChqc29uLmZlYXR1cmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGpzb24uZGVzY3JpcHRpb24gPSBqc29uLmxvbmdfZGVzY3JpcHRpb247XG4gICAgICAgICAgICAgICAgICAgIGpzb24uZmVhdHVyZWRDbGFzcyA9ICdmZWF0dXJlZCc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAganNvbi5kZXNjcmlwdGlvbiA9IGpzb24uc2hvcnRfZGVzY3JpcHRpb247XG4gICAgICAgICAgICAgICAgICAgIGpzb24uZmVhdHVyZWRDbGFzcyA9ICcnO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBodG1sID0gc2NvcGUudGVtcGxhdGUoanNvbik7XG4gICAgICAgICAgICAgICAgc2NvcGUuJGVsLmFwcGVuZChodG1sKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9KVxuXG4gICAgLy8gVE9ETyBjaGVjayBpZiBpdCBpcyBhY3R1YWxseSBiZXR0ZXIgdG8gaW5zdGFudGlhdGUgdGhlIGNvbGxlY3Rpb24gb2JqZWN0IGhlcmUgYW5kIHBhc3MgaXQgdG8gdGhlIHZpZXdcbiAgICAvLyB2ZXJzdXMgZGVjbGFyaW5nIGEgbmV3IGNvbGxlY3Rpb24gcHJvcGVydHkgaW4gdGhlIHZpZXcgb2JqZWN0XG4gICAgYXBwLlByb2plY3RJdGVtQ29sbGVjdGlvbiA9IG5ldyBhcHAuUHJvamVjdENvbGxlY3Rpb247XG4gICAgbmV3IGFwcC5Qcm9qZWN0Vmlldyh7Y29sbGVjdGlvbjogYXBwLlByb2plY3RJdGVtQ29sbGVjdGlvbn0pO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vICAgIEl0ZW0gTGFuZGluZ1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICBhcHAuSXRlbUxhbmRpbmdWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuICAgICAgICB0YWdOYW1lOiAnZGl2JyxcbiAgICAgICAgY2xhc3NOYW1lOiAnaXRlbS1sYW5kaW5nJyxcbiAgICAgICAgdGVtcGxhdGU6IF8udGVtcGxhdGUoICQoJy5pdGVtLWxhbmRpbmctdGVtcGxhdGUnKS5odG1sKCkgKSxcblxuICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICAgICdjbGljayAuYmFjay10by1wcm9qZWN0LWNvbGxlY3Rpb24nOiAnY2xpY2tCYWNrQnV0dG9uJyxcbiAgICAgICAgICAgICdjbGljayAubG9hZC1wcm9qZWN0JzogJ2xvYWRQcm9qZWN0J1xuICAgICAgICB9LFxuXG4gICAgICAgIGxvYWRQcm9qZWN0OiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgcHJvamVjdFVybCA9IHRoaXMubW9kZWwuZ2V0KFwicHJvamVjdF91cmxcIik7XG4gICAgICAgICAgICB2YXIgZnVsbFByb2plY3RVcmwgPSBhcHAucHJvamVjdFBhdGggKyBwcm9qZWN0VXJsO1xuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBmdWxsUHJvamVjdFVybDtcbiAgICAgICAgfSxcblxuICAgICAgICBjbGlja0JhY2tCdXR0b246IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgICAgICBuZXcgYXBwLlByb2plY3RWaWV3KHtjb2xsZWN0aW9uOiBhcHAuUHJvamVjdEl0ZW1Db2xsZWN0aW9ufSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5hcHBlbmRUbygnI2NvbnRlbnQnKTtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBqc29uID0gdGhpcy5tb2RlbC50b0pTT04oKTtcbiAgICAgICAgICAgIGFwcC5idWlsZEltYWdlKGpzb24pO1xuICAgICAgICAgICAgdmFyIGh0bWwgPSB0aGlzLnRlbXBsYXRlKGpzb24pO1xuICAgICAgICAgICAgdGhpcy4kZWwuYXBwZW5kKGh0bWwpO1xuICAgICAgICB9XG4gICAgfSlcblxuICAgIHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCdbZGF0YS1pZD0xXScpLmNsaWNrKClcbiAgICB9LCAxMClcblxuXG4gICAgLy8gdmFyIGhlbGxvID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuICAgIC8vXG4gICAgLy8gICAgIGVsOiAnI2NvbnRhaW5lcicsXG4gICAgLy9cbiAgICAvLyAgICAgdGVtcGxhdGU6IF8udGVtcGxhdGUoXCI8aDE+IEhlbGxvIDwlPSBhbnl0aGluZyAlPiA8L2gxPlwiKSxcbiAgICAvL1xuICAgIC8vICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpe1xuICAgIC8vICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAvLyAgICAgfSxcbiAgICAvL1xuICAgIC8vICAgICByZW5kZXI6IGZ1bmN0aW9uKCl7XG4gICAgLy8gICAgICAgICB0aGlzLiRlbC5odG1sKHRoaXMudGVtcGxhdGUoe2FueXRoaW5nOiAndGVzdGVyJ30pKTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH0pO1xuICAgIC8vXG4gICAgLy8gdmFyIGhlbGxvVmlldyA9IG5ldyBoZWxsbygpO1xuXG59KTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
