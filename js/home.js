$(document).ready(function() {
    // Namespace the objects
    var app = {};
    app.baseUrl = location.hostname === "localhost" ? "http://localhost:8000/" : "https://www.connorabdelnoor.com/";
    app.imagePath = app.baseUrl + "images/";
    app.dataPath = app.baseUrl + "data/";
    app.projectPath = app.baseUrl + "app/projects/";
    app.svg = app.baseUrl + "lib/svg/";
    app.buildImageHelper = function(object) {
        // Check that the path is set and is relative, else use default.
        if (object.image && object.image.indexOf("http") == -1) {
            object.image = app.imagePath + object.image;
        } else {
            object.image = app.imagePath + "default.png";
        }
    };
    ////////////////////////////////////////////////
    //    Navigation
    ////////////////////////////////////////////////
    app.NavItem = Backbone.Model;
    app.NavCollection = Backbone.Collection.extend({
        model: app.NavItem,
        url: app.dataPath + "nav.json"
    });
    app.NavView = Backbone.View.extend({
        el: ".navigation",
        template: _.template($(".item-navigation-template").html()),
        events: {
            "click .nav-item:not(.nav-name)": "onClick"
        },
        onClick: function(e) {
            var path = $(e.target).data("path");
            // FIXME not proud of this
            $("#content div:first").trigger("terminate");
            if (path == "resume") {
                new app.ResumeView();
            } else {
                new app.WorkView({
                    collection: new app.WorkCollection()
                });
            }
        },
        initialize: function() {
            var scope = this;
            this.collection.fetch().then(function() {
                scope.render();
            });
        },
        render: function() {
            var scope = this;
            this.collection.each(function(model) {
                var json = model.toJSON();
                var html = scope.template(json);
                scope.$el.append(html);
            });
            return this;
        }
    });
    new app.NavView({
        collection: new app.NavCollection()
    });
    ////////////////////////////////////////////////
    //    Project List
    ////////////////////////////////////////////////
    app.WorkItem = Backbone.Model.extend({
        defaults: {
            is_post: "true",
            name: "Default",
            tagline: "default",
            short_description: "default",
            long_description: "default",
            image: "default.png",
            featured: false,
            is_game: false,
            github_url: "default",
            project_url: "default"
        }
    });
    app.WorkCollection = Backbone.Collection.extend({
        model: app.WorkItem,
        url: app.dataPath + "work.json"
    });
    app.WorkView = Backbone.View.extend({
        tagName: "div",
        className: "work-collection",
        template: _.template($(".work-collection-template").html()),
        events: {
            "click .work-item": "onClick",
            terminate: "removeView"
        },
        removeView: function() {
            this.remove();
        },
        // When we click a box, remove the current view and load the full box view
        onClick: function(e) {
            var id = $(e.target).closest(".work-item").data("id");
            var clickedModel = this.collection.get(id);
            this.remove();
            clickedModel.get("is_post") ? new app.PostLandingView({
                model: clickedModel
            }) : new app.ItemLandingView({
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
                app.buildImageHelper(json);
                // create featured class
                json.featured ? json.featuredClass = "featured" : json.featuredClass = "";
                var html = scope.template(json);
                scope.$el.append(html);
            });
            return this;
        }
    });
    // TODO check if it is actually better to instantiate the collection object here and pass it to the view
    // versus declaring a new collection property in the view object
    new app.WorkView({
        collection: new app.WorkCollection()
    });
    ////////////////////////////////////////////////
    //    Post Landing View
    ////////////////////////////////////////////////
    app.PostLandingView = Backbone.View.extend({
        tagName: "div",
        className: "post-landing",
        template: _.template($(".post-landing-template").html()),
        events: {
            "click .back-to-collection": "clickBackButton",
            terminate: "removeView"
        },
        removeView: function() {
            this.remove();
        },
        clickBackButton: function(e) {
            this.remove();
            new app.WorkView({
                collection: new app.WorkCollection()
            });
        },
        initialize: function() {
            this.$el.appendTo("#content");
            this.render();
        },
        render: function() {
            var json = this.model.toJSON();
            var html = this.template(json);
            this.$el.append(html);
        }
    });
    ////////////////////////////////////////////////
    //    Item Landing View
    ////////////////////////////////////////////////
    app.ItemLandingView = Backbone.View.extend({
        tagName: "div",
        className: "item-landing",
        template: _.template($(".item-landing-template").html()),
        events: {
            "click .back-to-collection": "clickBackButton",
            "click .load-project": "loadProject",
            terminate: "removeView"
        },
        removeView: function() {
            this.remove();
        },
        loadProject: function(e) {
            e.preventDefault();
            var projectUrl = this.model.get("project_url");
            var fullProjectUrl = app.projectPath + projectUrl;
            window.location.href = fullProjectUrl;
        },
        clickBackButton: function(e) {
            this.remove();
            new app.WorkView({
                collection: new app.WorkCollection()
            });
        },
        initialize: function() {
            this.$el.appendTo("#content");
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
        url: app.dataPath + "resume.json"
    });
    app.ResumeView = Backbone.View.extend({
        tagName: "div",
        className: "resume-container",
        //OPTIMIZE construct with a model so the view can be reused
        model: new app.ResumeModel(),
        template: _.template($(".resume-template").html()),
        events: {
            terminate: "removeView"
        },
        removeView: function() {
            this.remove();
        },
        initialize: function() {
            var scope = this;
            this.$el.appendTo("#content");
            this.model.fetch().then(function() {
                scope.render();
            });
        },
        render: function() {
            var resume = this.model.toJSON().resume;
            var html = this.template(resume);
            this.$el.append(html);
        }
    });
    ////////////////////////////////////////////////
    //    SVGs
    ////////////////////////////////////////////////
    app.svgItem = Backbone.Model.extend({});
    // Convert svg names to file paths
    app.svgHelper = function(svgArray) {
        var svgs = svgArray.map(function(item) {
            return app.svg + item + ".svg";
        });
    };
    app.svgCollection = Backbone.Collection.extend({
        model: app.svgItem,
        svgItems: [ "http://localhost:8000/lib/svg/alert.svg", "http://localhost:8000/lib/svg/arrow-down.svg" ],
        test: function() {
            var self = this;
            this.svgItems.forEach(function(path) {
                var item = new self.model();
                item.url = path;
                item.fetch();
                debugger;
            });
        }
    });
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhvbWUuanMiXSwibmFtZXMiOlsiJCIsImRvY3VtZW50IiwicmVhZHkiLCJhcHAiLCJiYXNlVXJsIiwibG9jYXRpb24iLCJob3N0bmFtZSIsImltYWdlUGF0aCIsImRhdGFQYXRoIiwicHJvamVjdFBhdGgiLCJzdmciLCJidWlsZEltYWdlSGVscGVyIiwib2JqZWN0IiwiaW1hZ2UiLCJpbmRleE9mIiwiTmF2SXRlbSIsIkJhY2tib25lIiwiTW9kZWwiLCJOYXZDb2xsZWN0aW9uIiwiQ29sbGVjdGlvbiIsImV4dGVuZCIsIm1vZGVsIiwidXJsIiwiTmF2VmlldyIsIlZpZXciLCJlbCIsInRlbXBsYXRlIiwiXyIsImh0bWwiLCJldmVudHMiLCJjbGljayAubmF2LWl0ZW06bm90KC5uYXYtbmFtZSkiLCJvbkNsaWNrIiwiZSIsInBhdGgiLCJ0YXJnZXQiLCJkYXRhIiwidHJpZ2dlciIsIlJlc3VtZVZpZXciLCJXb3JrVmlldyIsImNvbGxlY3Rpb24iLCJXb3JrQ29sbGVjdGlvbiIsImluaXRpYWxpemUiLCJzY29wZSIsInRoaXMiLCJmZXRjaCIsInRoZW4iLCJyZW5kZXIiLCJlYWNoIiwianNvbiIsInRvSlNPTiIsIiRlbCIsImFwcGVuZCIsIldvcmtJdGVtIiwiZGVmYXVsdHMiLCJpc19wb3N0IiwibmFtZSIsInRhZ2xpbmUiLCJzaG9ydF9kZXNjcmlwdGlvbiIsImxvbmdfZGVzY3JpcHRpb24iLCJmZWF0dXJlZCIsImlzX2dhbWUiLCJnaXRodWJfdXJsIiwicHJvamVjdF91cmwiLCJ0YWdOYW1lIiwiY2xhc3NOYW1lIiwiY2xpY2sgLndvcmstaXRlbSIsInRlcm1pbmF0ZSIsInJlbW92ZVZpZXciLCJyZW1vdmUiLCJpZCIsImNsb3Nlc3QiLCJjbGlja2VkTW9kZWwiLCJnZXQiLCJQb3N0TGFuZGluZ1ZpZXciLCJJdGVtTGFuZGluZ1ZpZXciLCJhcHBlbmRUbyIsImZlYXR1cmVkQ2xhc3MiLCJjbGljayAuYmFjay10by1jb2xsZWN0aW9uIiwiY2xpY2tCYWNrQnV0dG9uIiwiY2xpY2sgLmxvYWQtcHJvamVjdCIsImxvYWRQcm9qZWN0IiwicHJldmVudERlZmF1bHQiLCJwcm9qZWN0VXJsIiwiZnVsbFByb2plY3RVcmwiLCJ3aW5kb3ciLCJocmVmIiwidmlzaXRfdGV4dCIsIlJlc3VtZU1vZGVsIiwicmVzdW1lIiwic3ZnSXRlbSIsInN2Z0hlbHBlciIsInN2Z0FycmF5Iiwic3ZncyIsIm1hcCIsIml0ZW0iLCJzdmdDb2xsZWN0aW9uIiwic3ZnSXRlbXMiLCJ0ZXN0Iiwic2VsZiIsImZvckVhY2giXSwibWFwcGluZ3MiOiJBQUFBQSxFQUFFQyxVQUFVQyxNQUFNOztJQUVkLElBQUlDO0lBQ0pBLElBQUlDLFVBQWNDLFNBQVNDLGFBQWEsY0FBYywyQkFBMkI7SUFDakZILElBQUlJLFlBQWNKLElBQUlDLFVBQVU7SUFDaENELElBQUlLLFdBQWNMLElBQUlDLFVBQVU7SUFDaENELElBQUlNLGNBQWNOLElBQUlDLFVBQVU7SUFDaENELElBQUlPLE1BQWNQLElBQUlDLFVBQVU7SUFHaENELElBQUlRLG1CQUFtQixTQUFTQzs7UUFFNUIsSUFBSUEsT0FBT0MsU0FBU0QsT0FBT0MsTUFBTUMsUUFBUSxZQUFZLEdBQUc7WUFDcERGLE9BQU9DLFFBQVFWLElBQUlJLFlBQVlLLE9BQU9DO2VBQ25DO1lBQ0hELE9BQU9DLFFBQVFWLElBQUlJLFlBQVk7Ozs7OztJQVF2Q0osSUFBSVksVUFBVUMsU0FBU0M7SUFFdkJkLElBQUllLGdCQUFnQkYsU0FBU0csV0FBV0M7UUFDcENDLE9BQU9sQixJQUFJWTtRQUNYTyxLQUFLbkIsSUFBSUssV0FBVzs7SUFHeEJMLElBQUlvQixVQUFVUCxTQUFTUSxLQUFLSjtRQUN4QkssSUFBSTtRQUNKQyxVQUFVQyxFQUFFRCxTQUFVMUIsRUFBRSw2QkFBNkI0QjtRQUNyREM7WUFDRUMsa0NBQWtDOztRQUdwQ0MsU0FBUyxTQUFTQztZQUNkLElBQUlDLE9BQU9qQyxFQUFFZ0MsRUFBRUUsUUFBUUMsS0FBSzs7WUFHNUJuQyxFQUFFLHNCQUFzQm9D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QUt0QixNQUFNdUIsUUFBUUMsS0FBSztnQkFDdEJILE1BQU1JOzs7UUFJVkEsUUFBUTtZQUNOLElBQUkwQyxTQUFTN0MsS0FBS3RCLE1BQU00QixTQUFTdUM7WUFDakMsSUFBSTVELE9BQU9lLEtBQUtqQixTQUFTOEQ7WUFDekI3QyxLQUFLTyxJQUFJQyxPQUFPdkI7Ozs7OztJQVNoQnpCLElBQUlzRixVQUFVekUsU0FBU0MsTUFBTUc7O0lBYzdCakIsSUFBSXVGLFlBQVksU0FBU0M7UUFDckIsSUFBSUMsT0FBT0QsU0FBU0UsSUFBSSxTQUFTQztZQUM3QixPQUFPM0YsSUFBSU8sTUFBTW9GLE9BQU87OztJQUloQzNGLElBQUk0RixnQkFBZ0IvRSxTQUFTRyxXQUFXQztRQUNwQ0MsT0FBT2xCLElBQUlzRjtRQUNYTyxZQUFXLDJDQUNQO1FBRUpDLE1BQU07WUFDRixJQUFJQyxPQUFPdkQ7WUFDWEEsS0FBS3FELFNBQVNHLFFBQVEsU0FBU2xFO2dCQUMzQixJQUFJNkQsT0FBTyxJQUFJSSxLQUFLN0U7Z0JBQ3BCeUUsS0FBS3hFLE1BQU1XO2dCQUNYNkQsS0FBS2xEO2dCQUNMIiwiZmlsZSI6ImhvbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAvLyBOYW1lc3BhY2UgdGhlIG9iamVjdHNcbiAgICB2YXIgYXBwICAgICAgICAgPSB7fTtcbiAgICBhcHAuYmFzZVVybCAgICAgPSBsb2NhdGlvbi5ob3N0bmFtZSA9PT0gJ2xvY2FsaG9zdCcgPyAnaHR0cDovL2xvY2FsaG9zdDo4MDAwLycgOiAnaHR0cHM6Ly93d3cuY29ubm9yYWJkZWxub29yLmNvbS8nO1xuICAgIGFwcC5pbWFnZVBhdGggICA9IGFwcC5iYXNlVXJsICsgJ2ltYWdlcy8nO1xuICAgIGFwcC5kYXRhUGF0aCAgICA9IGFwcC5iYXNlVXJsICsgJ2RhdGEvJztcbiAgICBhcHAucHJvamVjdFBhdGggPSBhcHAuYmFzZVVybCArICdhcHAvcHJvamVjdHMvJztcbiAgICBhcHAuc3ZnICAgICAgICAgPSBhcHAuYmFzZVVybCArICdsaWIvc3ZnLyc7XG5cblxuICAgIGFwcC5idWlsZEltYWdlSGVscGVyID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgICAgIC8vIENoZWNrIHRoYXQgdGhlIHBhdGggaXMgc2V0IGFuZCBpcyByZWxhdGl2ZSwgZWxzZSB1c2UgZGVmYXVsdC5cbiAgICAgICAgaWYgKG9iamVjdC5pbWFnZSAmJiBvYmplY3QuaW1hZ2UuaW5kZXhPZignaHR0cCcpID09IC0xKSB7XG4gICAgICAgICAgICBvYmplY3QuaW1hZ2UgPSBhcHAuaW1hZ2VQYXRoICsgb2JqZWN0LmltYWdlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb2JqZWN0LmltYWdlID0gYXBwLmltYWdlUGF0aCArICdkZWZhdWx0LnBuZyc7XG4gICAgICAgIH1cbiAgICB9XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gICAgTmF2aWdhdGlvblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICBhcHAuTmF2SXRlbSA9IEJhY2tib25lLk1vZGVsO1xuXG4gICAgYXBwLk5hdkNvbGxlY3Rpb24gPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG4gICAgICAgIG1vZGVsOiBhcHAuTmF2SXRlbSxcbiAgICAgICAgdXJsOiBhcHAuZGF0YVBhdGggKyAnbmF2Lmpzb24nXG4gICAgfSk7XG5cbiAgICBhcHAuTmF2VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcbiAgICAgICAgZWw6ICcubmF2aWdhdGlvbicsXG4gICAgICAgIHRlbXBsYXRlOiBfLnRlbXBsYXRlKCAkKCcuaXRlbS1uYXZpZ2F0aW9uLXRlbXBsYXRlJykuaHRtbCgpICksXG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICdjbGljayAubmF2LWl0ZW06bm90KC5uYXYtbmFtZSknOiAnb25DbGljaydcbiAgICAgICAgfSxcblxuICAgICAgICBvbkNsaWNrOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgcGF0aCA9ICQoZS50YXJnZXQpLmRhdGEoJ3BhdGgnKTtcblxuICAgICAgICAgICAgLy8gRklYTUUgbm90IHByb3VkIG9mIHRoaXNcbiAgICAgICAgICAgICQoJyNjb250ZW50IGRpdjpmaXJzdCcpLnRyaWdnZXIoJ3Rlcm1pbmF0ZScpO1xuXG4gICAgICAgICAgICBpZiAocGF0aCA9PSBcInJlc3VtZVwiKSB7XG4gICAgICAgICAgICAgIG5ldyBhcHAuUmVzdW1lVmlldztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG5ldyBhcHAuV29ya1ZpZXcoe2NvbGxlY3Rpb246IG5ldyBhcHAuV29ya0NvbGxlY3Rpb259KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBzY29wZSA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZmV0Y2goKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNjb3BlLnJlbmRlcigpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNjb3BlID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGpzb24gPSBtb2RlbC50b0pTT04oKTtcbiAgICAgICAgICAgICAgICB2YXIgaHRtbCA9IHNjb3BlLnRlbXBsYXRlKGpzb24pO1xuICAgICAgICAgICAgICAgIHNjb3BlLiRlbC5hcHBlbmQoaHRtbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgbmV3IGFwcC5OYXZWaWV3KHtjb2xsZWN0aW9uOiBuZXcgYXBwLk5hdkNvbGxlY3Rpb24oKX0pO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vICAgIFByb2plY3QgTGlzdFxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICBhcHAuV29ya0l0ZW0gPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuICAgICAgICBkZWZhdWx0czoge1xuICAgICAgICAgIGlzX3Bvc3Q6XCJ0cnVlXCIsXG4gICAgICAgICAgbmFtZTpcIkRlZmF1bHRcIixcbiAgICAgICAgICB0YWdsaW5lOiBcImRlZmF1bHRcIixcbiAgICAgICAgICBzaG9ydF9kZXNjcmlwdGlvbjogXCJkZWZhdWx0XCIsXG4gICAgICAgICAgbG9uZ19kZXNjcmlwdGlvbjogXCJkZWZhdWx0XCIsXG4gICAgICAgICAgaW1hZ2U6IFwiZGVmYXVsdC5wbmdcIixcbiAgICAgICAgICBmZWF0dXJlZDogZmFsc2UsXG4gICAgICAgICAgaXNfZ2FtZTogZmFsc2UsXG4gICAgICAgICAgZ2l0aHViX3VybDogXCJkZWZhdWx0XCIsXG4gICAgICAgICAgcHJvamVjdF91cmw6IFwiZGVmYXVsdFwiXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGFwcC5Xb3JrQ29sbGVjdGlvbiA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcbiAgICAgICAgbW9kZWw6IGFwcC5Xb3JrSXRlbSxcbiAgICAgICAgdXJsOiBhcHAuZGF0YVBhdGggKyAnd29yay5qc29uJ1xuICAgIH0pO1xuXG4gICAgYXBwLldvcmtWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuICAgICAgICB0YWdOYW1lOiAnZGl2JyxcbiAgICAgICAgY2xhc3NOYW1lOiAnd29yay1jb2xsZWN0aW9uJyxcbiAgICAgICAgdGVtcGxhdGU6IF8udGVtcGxhdGUoICQoJy53b3JrLWNvbGxlY3Rpb24tdGVtcGxhdGUnKS5odG1sKCkgKSxcbiAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICAnY2xpY2sgLndvcmstaXRlbSc6ICdvbkNsaWNrJyxcbiAgICAgICAgICAgICd0ZXJtaW5hdGUnOiAncmVtb3ZlVmlldydcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVWaWV3OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIFdoZW4gd2UgY2xpY2sgYSBib3gsIHJlbW92ZSB0aGUgY3VycmVudCB2aWV3IGFuZCBsb2FkIHRoZSBmdWxsIGJveCB2aWV3XG4gICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciBpZCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy53b3JrLWl0ZW0nKS5kYXRhKCdpZCcpO1xuICAgICAgICAgICAgdmFyIGNsaWNrZWRNb2RlbCA9IHRoaXMuY29sbGVjdGlvbi5nZXQoaWQpXG4gICAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgICAgICAgY2xpY2tlZE1vZGVsLmdldCgnaXNfcG9zdCcpID8gbmV3IGFwcC5Qb3N0TGFuZGluZ1ZpZXcoe21vZGVsOiBjbGlja2VkTW9kZWx9KSA6IG5ldyBhcHAuSXRlbUxhbmRpbmdWaWV3KHttb2RlbDogY2xpY2tlZE1vZGVsfSkgO1xuICAgICAgICB9LFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNjb3BlID0gdGhpcztcbiAgICAgICAgICAgIHNjb3BlLiRlbC5hcHBlbmRUbygnI2NvbnRlbnQnKTtcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5mZXRjaCgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUucmVuZGVyKCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2NvcGUgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24obW9kZWwpIHtcbiAgICAgICAgICAgICAgICB2YXIganNvbiA9IG1vZGVsLnRvSlNPTigpO1xuICAgICAgICAgICAgICAgIGFwcC5idWlsZEltYWdlSGVscGVyKGpzb24pO1xuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBmZWF0dXJlZCBjbGFzc1xuICAgICAgICAgICAgICAgIGpzb24uZmVhdHVyZWQgPyBqc29uLmZlYXR1cmVkQ2xhc3MgPSAnZmVhdHVyZWQnIDoganNvbi5mZWF0dXJlZENsYXNzID0gJyc7XG4gICAgICAgICAgICAgICAgdmFyIGh0bWwgPSBzY29wZS50ZW1wbGF0ZShqc29uKTtcbiAgICAgICAgICAgICAgICBzY29wZS4kZWwuYXBwZW5kKGh0bWwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyBUT0RPIGNoZWNrIGlmIGl0IGlzIGFjdHVhbGx5IGJldHRlciB0byBpbnN0YW50aWF0ZSB0aGUgY29sbGVjdGlvbiBvYmplY3QgaGVyZSBhbmQgcGFzcyBpdCB0byB0aGUgdmlld1xuICAgIC8vIHZlcnN1cyBkZWNsYXJpbmcgYSBuZXcgY29sbGVjdGlvbiBwcm9wZXJ0eSBpbiB0aGUgdmlldyBvYmplY3RcbiAgICBuZXcgYXBwLldvcmtWaWV3KHtjb2xsZWN0aW9uOiBuZXcgYXBwLldvcmtDb2xsZWN0aW9ufSk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyAgICBQb3N0IExhbmRpbmcgVmlld1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICBhcHAuUG9zdExhbmRpbmdWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuICAgICAgICB0YWdOYW1lOiAnZGl2JyxcbiAgICAgICAgY2xhc3NOYW1lOiAncG9zdC1sYW5kaW5nJyxcbiAgICAgICAgdGVtcGxhdGU6IF8udGVtcGxhdGUoICQoJy5wb3N0LWxhbmRpbmctdGVtcGxhdGUnKS5odG1sKCkgKSxcblxuICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICAgICdjbGljayAuYmFjay10by1jb2xsZWN0aW9uJzogJ2NsaWNrQmFja0J1dHRvbicsXG4gICAgICAgICAgICAndGVybWluYXRlJzogJ3JlbW92ZVZpZXcnXG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlVmlldzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjbGlja0JhY2tCdXR0b246IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgICAgICBuZXcgYXBwLldvcmtWaWV3KHtjb2xsZWN0aW9uOiBuZXcgYXBwLldvcmtDb2xsZWN0aW9ufSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5hcHBlbmRUbygnI2NvbnRlbnQnKTtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBqc29uID0gdGhpcy5tb2RlbC50b0pTT04oKTtcbiAgICAgICAgICAgIHZhciBodG1sID0gdGhpcy50ZW1wbGF0ZShqc29uKTtcbiAgICAgICAgICAgIHRoaXMuJGVsLmFwcGVuZChodG1sKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vICAgIEl0ZW0gTGFuZGluZyBWaWV3XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgIGFwcC5JdGVtTGFuZGluZ1ZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG4gICAgICAgIHRhZ05hbWU6ICdkaXYnLFxuICAgICAgICBjbGFzc05hbWU6ICdpdGVtLWxhbmRpbmcnLFxuICAgICAgICB0ZW1wbGF0ZTogXy50ZW1wbGF0ZSggJCgnLml0ZW0tbGFuZGluZy10ZW1wbGF0ZScpLmh0bWwoKSApLFxuXG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgJ2NsaWNrIC5iYWNrLXRvLWNvbGxlY3Rpb24nOiAnY2xpY2tCYWNrQnV0dG9uJyxcbiAgICAgICAgICAgICdjbGljayAubG9hZC1wcm9qZWN0JzogJ2xvYWRQcm9qZWN0JyxcbiAgICAgICAgICAgICd0ZXJtaW5hdGUnOiAncmVtb3ZlVmlldydcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVWaWV3OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGxvYWRQcm9qZWN0OiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgdmFyIHByb2plY3RVcmwgPSB0aGlzLm1vZGVsLmdldChcInByb2plY3RfdXJsXCIpO1xuICAgICAgICAgIHZhciBmdWxsUHJvamVjdFVybCA9IGFwcC5wcm9qZWN0UGF0aCArIHByb2plY3RVcmw7XG4gICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBmdWxsUHJvamVjdFVybDtcbiAgICAgICAgfSxcblxuICAgICAgICBjbGlja0JhY2tCdXR0b246IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgICAgICBuZXcgYXBwLldvcmtWaWV3KHtjb2xsZWN0aW9uOiBuZXcgYXBwLldvcmtDb2xsZWN0aW9ufSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5hcHBlbmRUbygnI2NvbnRlbnQnKTtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBqc29uID0gdGhpcy5tb2RlbC50b0pTT04oKTtcbiAgICAgICAgICAgIGFwcC5idWlsZEltYWdlSGVscGVyKGpzb24pO1xuICAgICAgICAgICAganNvbi52aXNpdF90ZXh0ID0ganNvbi5pc19nYW1lID8gXCJQbGF5IEdhbWVcIiA6IFwiVmlldyBBcHBcIjtcbiAgICAgICAgICAgIHZhciBodG1sID0gdGhpcy50ZW1wbGF0ZShqc29uKTtcbiAgICAgICAgICAgIHRoaXMuJGVsLmFwcGVuZChodG1sKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vICAgIFJlc3VtZVxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICBhcHAuUmVzdW1lTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuICAgICAgdXJsOiBhcHAuZGF0YVBhdGggKyAncmVzdW1lLmpzb24nXG4gICAgfSk7XG5cbiAgICBhcHAuUmVzdW1lVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcbiAgICAgIHRhZ05hbWU6ICdkaXYnLFxuICAgICAgY2xhc3NOYW1lOiAncmVzdW1lLWNvbnRhaW5lcicsXG4gICAgICAvL09QVElNSVpFIGNvbnN0cnVjdCB3aXRoIGEgbW9kZWwgc28gdGhlIHZpZXcgY2FuIGJlIHJldXNlZFxuICAgICAgbW9kZWw6IG5ldyBhcHAuUmVzdW1lTW9kZWwoKSxcbiAgICAgIHRlbXBsYXRlOiBfLnRlbXBsYXRlKCAkKCcucmVzdW1lLXRlbXBsYXRlJykuaHRtbCgpICksXG5cbiAgICAgIGV2ZW50czoge1xuICAgICAgICAndGVybWluYXRlJzogJ3JlbW92ZVZpZXcnXG4gICAgICB9LFxuXG4gICAgICByZW1vdmVWaWV3OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgIH0sXG5cbiAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2NvcGUgPSB0aGlzO1xuICAgICAgICB0aGlzLiRlbC5hcHBlbmRUbygnI2NvbnRlbnQnKTtcbiAgICAgICAgdGhpcy5tb2RlbC5mZXRjaCgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc2NvcGUucmVuZGVyKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcblxuICAgICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlc3VtZSA9IHRoaXMubW9kZWwudG9KU09OKCkucmVzdW1lO1xuICAgICAgICB2YXIgaHRtbCA9IHRoaXMudGVtcGxhdGUocmVzdW1lKTtcbiAgICAgICAgdGhpcy4kZWwuYXBwZW5kKGh0bWwpO1xuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLyAgICBTVkdzXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxuICAgICAgICBhcHAuc3ZnSXRlbSA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG5cbiAgICAgICAgICAgIC8vIGZldGNoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyAgICAgLy8gT1BUSU1JWkUgdGhpcy5wYXRoIGNvdWxkIGxlYWQgdG8gcHJvYmxlbXNcbiAgICAgICAgICAgIC8vICAgICAkLmdldCh0aGlzLmdldCgncGF0aCcpLCAndGV4dCcpLmRvbmUoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgLy8gICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgICAgIC8vICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgICAgICAvLyAgICAgfSlcbiAgICAgICAgICAgIC8vIH0sXG4gICAgICAgICAgICAvL1xuXG4gICAgICAgIH0pXG5cbiAgICAgICAgLy8gQ29udmVydCBzdmcgbmFtZXMgdG8gZmlsZSBwYXRoc1xuICAgICAgICBhcHAuc3ZnSGVscGVyID0gZnVuY3Rpb24oc3ZnQXJyYXkpIHtcbiAgICAgICAgICAgIHZhciBzdmdzID0gc3ZnQXJyYXkubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXBwLnN2ZyArIGl0ZW0gKyAnLnN2Zyc7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICAgICAgYXBwLnN2Z0NvbGxlY3Rpb24gPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG4gICAgICAgICAgICBtb2RlbDogYXBwLnN2Z0l0ZW0sXG4gICAgICAgICAgICBzdmdJdGVtczogWydodHRwOi8vbG9jYWxob3N0OjgwMDAvbGliL3N2Zy9hbGVydC5zdmcnLFxuICAgICAgICAgICAgICAgICdodHRwOi8vbG9jYWxob3N0OjgwMDAvbGliL3N2Zy9hcnJvdy1kb3duLnN2ZyddLFxuXG4gICAgICAgICAgICB0ZXN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdGhpcy5zdmdJdGVtcy5mb3JFYWNoKGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSBuZXcgc2VsZi5tb2RlbDtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS51cmwgPSBwYXRoO1xuICAgICAgICAgICAgICAgICAgICBpdGVtLmZldGNoKCk7XG4gICAgICAgICAgICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAvLyBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcbiAgICAvLyAgICAgJCgnW2RhdGEtaWQ9MV0nKS5jbGljaygpXG4gICAgLy8gfSwgMTApXG5cbn0pO1xuIl19
