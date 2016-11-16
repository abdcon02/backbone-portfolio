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
            if ("resume" == path) {
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
            date: "Begining of Time",
            tagline: "default",
            short_description: "default",
            long_description: "default",
            image: "default.png",
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
            "true" === clickedModel.get("is_post") ? new app.PostLandingView({
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
                // create post class
                json.workClass = "true" === json.is_post ? "post" : "project";
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhvbWUuanMiXSwibmFtZXMiOlsiJCIsImRvY3VtZW50IiwicmVhZHkiLCJhcHAiLCJiYXNlVXJsIiwibG9jYXRpb24iLCJob3N0bmFtZSIsImltYWdlUGF0aCIsImRhdGFQYXRoIiwicHJvamVjdFBhdGgiLCJzdmciLCJidWlsZEltYWdlSGVscGVyIiwib2JqZWN0IiwiaW1hZ2UiLCJpbmRleE9mIiwiTmF2SXRlbSIsIkJhY2tib25lIiwiTW9kZWwiLCJOYXZDb2xsZWN0aW9uIiwiQ29sbGVjdGlvbiIsImV4dGVuZCIsIm1vZGVsIiwidXJsIiwiTmF2VmlldyIsIlZpZXciLCJlbCIsInRlbXBsYXRlIiwiXyIsImh0bWwiLCJldmVudHMiLCJjbGljayAubmF2LWl0ZW06bm90KC5uYXYtbmFtZSkiLCJvbkNsaWNrIiwiZSIsInBhdGgiLCJ0YXJnZXQiLCJkYXRhIiwidHJpZ2dlciIsIlJlc3VtZVZpZXciLCJXb3JrVmlldyIsImNvbGxlY3Rpb24iLCJXb3JrQ29sbGVjdGlvbiIsImluaXRpYWxpemUiLCJzY29wZSIsInRoaXMiLCJmZXRjaCIsInRoZW4iLCJyZW5kZXIiLCJlYWNoIiwianNvbiIsInRvSlNPTiIsIiRlbCIsImFwcGVuZCIsIldvcmtJdGVtIiwiZGVmYXVsdHMiLCJpc19wb3N0IiwibmFtZSIsImRhdGUiLCJ0YWdsaW5lIiwic2hvcnRfZGVzY3JpcHRpb24iLCJsb25nX2Rlc2NyaXB0aW9uIiwiaXNfZ2FtZSIsImdpdGh1Yl91cmwiLCJwcm9qZWN0X3VybCIsInRhZ05hbWUiLCJjbGFzc05hbWUiLCJjbGljayAud29yay1pdGVtIiwidGVybWluYXRlIiwicmVtb3ZlVmlldyIsInJlbW92ZSIsImlkIiwiY2xvc2VzdCIsImNsaWNrZWRNb2RlbCIsImdldCIsIlBvc3RMYW5kaW5nVmlldyIsIkl0ZW1MYW5kaW5nVmlldyIsImFwcGVuZFRvIiwid29ya0NsYXNzIiwiY2xpY2sgLmJhY2stdG8tY29sbGVjdGlvbiIsImNsaWNrQmFja0J1dHRvbiIsImNsaWNrIC5sb2FkLXByb2plY3QiLCJsb2FkUHJvamVjdCIsInByZXZlbnREZWZhdWx0IiwicHJvamVjdFVybCIsImZ1bGxQcm9qZWN0VXJsIiwid2luZG93IiwiaHJlZiIsInZpc2l0X3RleHQiLCJSZXN1bWVNb2RlbCIsInJlc3VtZSIsInN2Z0l0ZW0iLCJzdmdIZWxwZXIiLCJzdmdBcnJheSIsInN2Z3MiLCJtYXAiLCJpdGVtIiwic3ZnQ29sbGVjdGlvbiIsInN2Z0l0ZW1zIiwidGVzdCIsInNlbGYiLCJmb3JFYWNoIl0sIm1hcHBpbmdzIjoiQUFBQUEsRUFBRUMsVUFBVUMsTUFBTTs7SUFFZCxJQUFJQztJQUNKQSxJQUFJQyxVQUFjQyxTQUFTQyxhQUFhLGNBQWMsMkJBQTJCO0lBQ2pGSCxJQUFJSSxZQUFjSixJQUFJQyxVQUFVO0lBQ2hDRCxJQUFJSyxXQUFjTCxJQUFJQyxVQUFVO0lBQ2hDRCxJQUFJTSxjQUFjTixJQUFJQyxVQUFVO0lBQ2hDRCxJQUFJTyxNQUFjUCxJQUFJQyxVQUFVO0lBR2hDRCxJQUFJUSxtQkFBbUIsU0FBU0M7O1FBRTVCLElBQUlBLE9BQU9DLFNBQVNELE9BQU9DLE1BQU1DLFFBQVEsWUFBWSxHQUFHO1lBQ3BERixPQUFPQyxRQUFRVixJQUFJSSxZQUFZSyxPQUFPQztlQUNuQztZQUNIRCxPQUFPQyxRQUFRVixJQUFJSSxZQUFZOzs7Ozs7SUFRdkNKLElBQUlZLFVBQVVDLFNBQVNDO0lBRXZCZCxJQUFJZSxnQkFBZ0JGLFNBQVNHLFdBQVdDO1FBQ3BDQyxPQUFPbEIsSUFBSVk7UUFDWE8sS0FBS25CLElBQUlLLFdBQVc7O0lBR3hCTCxJQUFJb0IsVUFBVVAsU0FBU1EsS0FBS0o7UUFDeEJLLElBQUk7UUFDSkMsVUFBVUMsRUFBRUQsU0FBVTFCLEVBQUUsNkJBQTZCNEI7UUFDckRDO1lBQ0VDLGtDQUFrQzs7UUFHcENDLFNBQVMsU0FBU0M7WUFDZCxJQUFJQyxPQUFPakMsRUFBRWdDLEVBQUVFLFFBQVFDLEtBQUs7O1lBRzVCbkMsRUFBRSxzQkFBc0JvQyxRQUFRO1lB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UUMsS0FBSztnQkFDdEJILE1BQU1JOzs7UUFJVkEsUUFBUTtZQUNOLElBQUkwQyxTQUFTN0MsS0FBS3RCLE1BQU00QixTQUFTdUM7WUFDakMsSUFBSTVELE9BQU9lLEtBQUtqQixTQUFTOEQ7WUFDekI3QyxLQUFLTyxJQUFJQyxPQUFPdkI7Ozs7OztJQVNoQnpCLElBQUlzRixVQUFVekUsU0FBU0MsTUFBTUc7O0lBYzdCakIsSUFBSXVGLFlBQVksU0FBU0M7UUFDckIsSUFBSUMsT0FBT0QsU0FBU0UsSUFBSSxTQUFTQztZQUM3QixPQUFPM0YsSUFBSU8sTUFBTW9GLE9BQU87OztJQUloQzNGLElBQUk0RixnQkFBZ0IvRSxTQUFTRyxXQUFXQztRQUNwQ0MsT0FBT2xCLElBQUlzRjtRQUNYTyxZQUFXLDJDQUNQO1FBRUpDLE1BQU07WUFDRixJQUFJQyxPQUFPdkQ7WUFDWEEsS0FBS3FELFNBQVNHLFFBQVEsU0FBU2xFO2dCQUMzQixJQUFJNkQsT0FBTyxJQUFJSSxLQUFLN0U7Z0JBQ3BCeUUsS0FBS3hFLE1BQU1XO2dCQUNYNkQsS0FBS2xEO2dCQUNMIiwiZmlsZSI6ImhvbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAvLyBOYW1lc3BhY2UgdGhlIG9iamVjdHNcbiAgICB2YXIgYXBwICAgICAgICAgPSB7fTtcbiAgICBhcHAuYmFzZVVybCAgICAgPSBsb2NhdGlvbi5ob3N0bmFtZSA9PT0gJ2xvY2FsaG9zdCcgPyAnaHR0cDovL2xvY2FsaG9zdDo4MDAwLycgOiAnaHR0cHM6Ly93d3cuY29ubm9yYWJkZWxub29yLmNvbS8nO1xuICAgIGFwcC5pbWFnZVBhdGggICA9IGFwcC5iYXNlVXJsICsgJ2ltYWdlcy8nO1xuICAgIGFwcC5kYXRhUGF0aCAgICA9IGFwcC5iYXNlVXJsICsgJ2RhdGEvJztcbiAgICBhcHAucHJvamVjdFBhdGggPSBhcHAuYmFzZVVybCArICdhcHAvcHJvamVjdHMvJztcbiAgICBhcHAuc3ZnICAgICAgICAgPSBhcHAuYmFzZVVybCArICdsaWIvc3ZnLyc7XG5cblxuICAgIGFwcC5idWlsZEltYWdlSGVscGVyID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgICAgIC8vIENoZWNrIHRoYXQgdGhlIHBhdGggaXMgc2V0IGFuZCBpcyByZWxhdGl2ZSwgZWxzZSB1c2UgZGVmYXVsdC5cbiAgICAgICAgaWYgKG9iamVjdC5pbWFnZSAmJiBvYmplY3QuaW1hZ2UuaW5kZXhPZignaHR0cCcpID09IC0xKSB7XG4gICAgICAgICAgICBvYmplY3QuaW1hZ2UgPSBhcHAuaW1hZ2VQYXRoICsgb2JqZWN0LmltYWdlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb2JqZWN0LmltYWdlID0gYXBwLmltYWdlUGF0aCArICdkZWZhdWx0LnBuZyc7XG4gICAgICAgIH1cbiAgICB9XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gICAgTmF2aWdhdGlvblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICBhcHAuTmF2SXRlbSA9IEJhY2tib25lLk1vZGVsO1xuXG4gICAgYXBwLk5hdkNvbGxlY3Rpb24gPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG4gICAgICAgIG1vZGVsOiBhcHAuTmF2SXRlbSxcbiAgICAgICAgdXJsOiBhcHAuZGF0YVBhdGggKyAnbmF2Lmpzb24nXG4gICAgfSk7XG5cbiAgICBhcHAuTmF2VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcbiAgICAgICAgZWw6ICcubmF2aWdhdGlvbicsXG4gICAgICAgIHRlbXBsYXRlOiBfLnRlbXBsYXRlKCAkKCcuaXRlbS1uYXZpZ2F0aW9uLXRlbXBsYXRlJykuaHRtbCgpICksXG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICdjbGljayAubmF2LWl0ZW06bm90KC5uYXYtbmFtZSknOiAnb25DbGljaydcbiAgICAgICAgfSxcblxuICAgICAgICBvbkNsaWNrOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgcGF0aCA9ICQoZS50YXJnZXQpLmRhdGEoJ3BhdGgnKTtcblxuICAgICAgICAgICAgLy8gRklYTUUgbm90IHByb3VkIG9mIHRoaXNcbiAgICAgICAgICAgICQoJyNjb250ZW50IGRpdjpmaXJzdCcpLnRyaWdnZXIoJ3Rlcm1pbmF0ZScpO1xuXG4gICAgICAgICAgICBpZiAoXCJyZXN1bWVcIiA9PSBwYXRoKSB7XG4gICAgICAgICAgICAgIG5ldyBhcHAuUmVzdW1lVmlldztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG5ldyBhcHAuV29ya1ZpZXcoe2NvbGxlY3Rpb246IG5ldyBhcHAuV29ya0NvbGxlY3Rpb259KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBzY29wZSA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZmV0Y2goKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNjb3BlLnJlbmRlcigpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNjb3BlID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGpzb24gPSBtb2RlbC50b0pTT04oKTtcbiAgICAgICAgICAgICAgICB2YXIgaHRtbCA9IHNjb3BlLnRlbXBsYXRlKGpzb24pO1xuICAgICAgICAgICAgICAgIHNjb3BlLiRlbC5hcHBlbmQoaHRtbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgbmV3IGFwcC5OYXZWaWV3KHtjb2xsZWN0aW9uOiBuZXcgYXBwLk5hdkNvbGxlY3Rpb24oKX0pO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vICAgIFByb2plY3QgTGlzdFxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICBhcHAuV29ya0l0ZW0gPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuICAgICAgICBkZWZhdWx0czoge1xuICAgICAgICAgIGlzX3Bvc3Q6XCJ0cnVlXCIsXG4gICAgICAgICAgbmFtZTpcIkRlZmF1bHRcIixcbiAgICAgICAgICBkYXRlOlwiQmVnaW5pbmcgb2YgVGltZVwiLFxuICAgICAgICAgIHRhZ2xpbmU6IFwiZGVmYXVsdFwiLFxuICAgICAgICAgIHNob3J0X2Rlc2NyaXB0aW9uOiBcImRlZmF1bHRcIixcbiAgICAgICAgICBsb25nX2Rlc2NyaXB0aW9uOiBcImRlZmF1bHRcIixcbiAgICAgICAgICBpbWFnZTogXCJkZWZhdWx0LnBuZ1wiLFxuICAgICAgICAgIGlzX2dhbWU6IGZhbHNlLFxuICAgICAgICAgIGdpdGh1Yl91cmw6IFwiZGVmYXVsdFwiLFxuICAgICAgICAgIHByb2plY3RfdXJsOiBcImRlZmF1bHRcIlxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBhcHAuV29ya0NvbGxlY3Rpb24gPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG4gICAgICAgIG1vZGVsOiBhcHAuV29ya0l0ZW0sXG4gICAgICAgIHVybDogYXBwLmRhdGFQYXRoICsgJ3dvcmsuanNvbidcbiAgICB9KTtcblxuICAgIGFwcC5Xb3JrVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcbiAgICAgICAgdGFnTmFtZTogJ2RpdicsXG4gICAgICAgIGNsYXNzTmFtZTogJ3dvcmstY29sbGVjdGlvbicsXG4gICAgICAgIHRlbXBsYXRlOiBfLnRlbXBsYXRlKCAkKCcud29yay1jb2xsZWN0aW9uLXRlbXBsYXRlJykuaHRtbCgpICksXG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgJ2NsaWNrIC53b3JrLWl0ZW0nOiAnb25DbGljaycsXG4gICAgICAgICAgICAndGVybWluYXRlJzogJ3JlbW92ZVZpZXcnXG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlVmlldzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBXaGVuIHdlIGNsaWNrIGEgYm94LCByZW1vdmUgdGhlIGN1cnJlbnQgdmlldyBhbmQgbG9hZCB0aGUgZnVsbCBib3ggdmlld1xuICAgICAgICBvbkNsaWNrOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgaWQgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcud29yay1pdGVtJykuZGF0YSgnaWQnKTtcbiAgICAgICAgICAgIHZhciBjbGlja2VkTW9kZWwgPSB0aGlzLmNvbGxlY3Rpb24uZ2V0KGlkKVxuICAgICAgICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgICAgICAgIFwidHJ1ZVwiID09PSBjbGlja2VkTW9kZWwuZ2V0KCdpc19wb3N0JykgPyBuZXcgYXBwLlBvc3RMYW5kaW5nVmlldyh7bW9kZWw6IGNsaWNrZWRNb2RlbH0pIDogbmV3IGFwcC5JdGVtTGFuZGluZ1ZpZXcoe21vZGVsOiBjbGlja2VkTW9kZWx9KSA7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2NvcGUgPSB0aGlzO1xuICAgICAgICAgICAgc2NvcGUuJGVsLmFwcGVuZFRvKCcjY29udGVudCcpO1xuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmZldGNoKCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzY29wZS5yZW5kZXIoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBzY29wZSA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbihtb2RlbCkge1xuICAgICAgICAgICAgICAgIHZhciBqc29uID0gbW9kZWwudG9KU09OKCk7XG4gICAgICAgICAgICAgICAgYXBwLmJ1aWxkSW1hZ2VIZWxwZXIoanNvbik7XG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIHBvc3QgY2xhc3NcbiAgICAgICAgICAgICAgICBqc29uLndvcmtDbGFzcyA9IChcInRydWVcIiA9PT0ganNvbi5pc19wb3N0KSA/ICdwb3N0JyA6ICdwcm9qZWN0JztcbiAgICAgICAgICAgICAgICB2YXIgaHRtbCA9IHNjb3BlLnRlbXBsYXRlKGpzb24pO1xuICAgICAgICAgICAgICAgIHNjb3BlLiRlbC5hcHBlbmQoaHRtbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfSlcblxuICAgIC8vIFRPRE8gY2hlY2sgaWYgaXQgaXMgYWN0dWFsbHkgYmV0dGVyIHRvIGluc3RhbnRpYXRlIHRoZSBjb2xsZWN0aW9uIG9iamVjdCBoZXJlIGFuZCBwYXNzIGl0IHRvIHRoZSB2aWV3XG4gICAgLy8gdmVyc3VzIGRlY2xhcmluZyBhIG5ldyBjb2xsZWN0aW9uIHByb3BlcnR5IGluIHRoZSB2aWV3IG9iamVjdFxuICAgIG5ldyBhcHAuV29ya1ZpZXcoe2NvbGxlY3Rpb246IG5ldyBhcHAuV29ya0NvbGxlY3Rpb259KTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vICAgIFBvc3QgTGFuZGluZyBWaWV3XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgIGFwcC5Qb3N0TGFuZGluZ1ZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG4gICAgICAgIHRhZ05hbWU6ICdkaXYnLFxuICAgICAgICBjbGFzc05hbWU6ICdwb3N0LWxhbmRpbmcnLFxuICAgICAgICB0ZW1wbGF0ZTogXy50ZW1wbGF0ZSggJCgnLnBvc3QtbGFuZGluZy10ZW1wbGF0ZScpLmh0bWwoKSApLFxuXG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgJ2NsaWNrIC5iYWNrLXRvLWNvbGxlY3Rpb24nOiAnY2xpY2tCYWNrQnV0dG9uJyxcbiAgICAgICAgICAgICd0ZXJtaW5hdGUnOiAncmVtb3ZlVmlldydcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVWaWV3OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNsaWNrQmFja0J1dHRvbjogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgICAgICAgIG5ldyBhcHAuV29ya1ZpZXcoe2NvbGxlY3Rpb246IG5ldyBhcHAuV29ya0NvbGxlY3Rpb259KTtcbiAgICAgICAgfSxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmFwcGVuZFRvKCcjY29udGVudCcpO1xuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGpzb24gPSB0aGlzLm1vZGVsLnRvSlNPTigpO1xuICAgICAgICAgICAgdmFyIGh0bWwgPSB0aGlzLnRlbXBsYXRlKGpzb24pO1xuICAgICAgICAgICAgdGhpcy4kZWwuYXBwZW5kKGh0bWwpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gICAgSXRlbSBMYW5kaW5nIFZpZXdcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgYXBwLkl0ZW1MYW5kaW5nVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcbiAgICAgICAgdGFnTmFtZTogJ2RpdicsXG4gICAgICAgIGNsYXNzTmFtZTogJ2l0ZW0tbGFuZGluZycsXG4gICAgICAgIHRlbXBsYXRlOiBfLnRlbXBsYXRlKCAkKCcuaXRlbS1sYW5kaW5nLXRlbXBsYXRlJykuaHRtbCgpICksXG5cbiAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICAnY2xpY2sgLmJhY2stdG8tY29sbGVjdGlvbic6ICdjbGlja0JhY2tCdXR0b24nLFxuICAgICAgICAgICAgJ2NsaWNrIC5sb2FkLXByb2plY3QnOiAnbG9hZFByb2plY3QnLFxuICAgICAgICAgICAgJ3Rlcm1pbmF0ZSc6ICdyZW1vdmVWaWV3J1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZVZpZXc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbG9hZFByb2plY3Q6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICB2YXIgcHJvamVjdFVybCA9IHRoaXMubW9kZWwuZ2V0KFwicHJvamVjdF91cmxcIik7XG4gICAgICAgICAgdmFyIGZ1bGxQcm9qZWN0VXJsID0gYXBwLnByb2plY3RQYXRoICsgcHJvamVjdFVybDtcbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGZ1bGxQcm9qZWN0VXJsO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNsaWNrQmFja0J1dHRvbjogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgICAgICAgIG5ldyBhcHAuV29ya1ZpZXcoe2NvbGxlY3Rpb246IG5ldyBhcHAuV29ya0NvbGxlY3Rpb259KTtcbiAgICAgICAgfSxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmFwcGVuZFRvKCcjY29udGVudCcpO1xuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGpzb24gPSB0aGlzLm1vZGVsLnRvSlNPTigpO1xuICAgICAgICAgICAgYXBwLmJ1aWxkSW1hZ2VIZWxwZXIoanNvbik7XG4gICAgICAgICAgICBqc29uLnZpc2l0X3RleHQgPSBqc29uLmlzX2dhbWUgPyBcIlBsYXkgR2FtZVwiIDogXCJWaWV3IEFwcFwiO1xuICAgICAgICAgICAgdmFyIGh0bWwgPSB0aGlzLnRlbXBsYXRlKGpzb24pO1xuICAgICAgICAgICAgdGhpcy4kZWwuYXBwZW5kKGh0bWwpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gICAgUmVzdW1lXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgIGFwcC5SZXN1bWVNb2RlbCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG4gICAgICB1cmw6IGFwcC5kYXRhUGF0aCArICdyZXN1bWUuanNvbidcbiAgICB9KTtcblxuICAgIGFwcC5SZXN1bWVWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuICAgICAgdGFnTmFtZTogJ2RpdicsXG4gICAgICBjbGFzc05hbWU6ICdyZXN1bWUtY29udGFpbmVyJyxcbiAgICAgIC8vT1BUSU1JWkUgY29uc3RydWN0IHdpdGggYSBtb2RlbCBzbyB0aGUgdmlldyBjYW4gYmUgcmV1c2VkXG4gICAgICBtb2RlbDogbmV3IGFwcC5SZXN1bWVNb2RlbCgpLFxuICAgICAgdGVtcGxhdGU6IF8udGVtcGxhdGUoICQoJy5yZXN1bWUtdGVtcGxhdGUnKS5odG1sKCkgKSxcblxuICAgICAgZXZlbnRzOiB7XG4gICAgICAgICd0ZXJtaW5hdGUnOiAncmVtb3ZlVmlldydcbiAgICAgIH0sXG5cbiAgICAgIHJlbW92ZVZpZXc6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgfSxcblxuICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzY29wZSA9IHRoaXM7XG4gICAgICAgIHRoaXMuJGVsLmFwcGVuZFRvKCcjY29udGVudCcpO1xuICAgICAgICB0aGlzLm1vZGVsLmZldGNoKCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICBzY29wZS5yZW5kZXIoKTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuXG4gICAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVzdW1lID0gdGhpcy5tb2RlbC50b0pTT04oKS5yZXN1bWU7XG4gICAgICAgIHZhciBodG1sID0gdGhpcy50ZW1wbGF0ZShyZXN1bWUpO1xuICAgICAgICB0aGlzLiRlbC5hcHBlbmQoaHRtbCk7XG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vICAgIFNWR3NcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuXG4gICAgICAgIGFwcC5zdmdJdGVtID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcblxuICAgICAgICAgICAgLy8gZmV0Y2g6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vICAgICAvLyBPUFRJTUlaRSB0aGlzLnBhdGggY291bGQgbGVhZCB0byBwcm9ibGVtc1xuICAgICAgICAgICAgLy8gICAgICQuZ2V0KHRoaXMuZ2V0KCdwYXRoJyksICd0ZXh0JykuZG9uZShmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgICAgLy8gICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgICAgIC8vICAgICB9KVxuICAgICAgICAgICAgLy8gfSxcbiAgICAgICAgICAgIC8vXG5cbiAgICAgICAgfSlcblxuICAgICAgICAvLyBDb252ZXJ0IHN2ZyBuYW1lcyB0byBmaWxlIHBhdGhzXG4gICAgICAgIGFwcC5zdmdIZWxwZXIgPSBmdW5jdGlvbihzdmdBcnJheSkge1xuICAgICAgICAgICAgdmFyIHN2Z3MgPSBzdmdBcnJheS5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBhcHAuc3ZnICsgaXRlbSArICcuc3ZnJztcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgICAgICBhcHAuc3ZnQ29sbGVjdGlvbiA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcbiAgICAgICAgICAgIG1vZGVsOiBhcHAuc3ZnSXRlbSxcbiAgICAgICAgICAgIHN2Z0l0ZW1zOiBbJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9saWIvc3ZnL2FsZXJ0LnN2ZycsXG4gICAgICAgICAgICAgICAgJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9saWIvc3ZnL2Fycm93LWRvd24uc3ZnJ10sXG5cbiAgICAgICAgICAgIHRlc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgICAgICB0aGlzLnN2Z0l0ZW1zLmZvckVhY2goZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IG5ldyBzZWxmLm1vZGVsO1xuICAgICAgICAgICAgICAgICAgICBpdGVtLnVybCA9IHBhdGg7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZmV0Y2goKTtcbiAgICAgICAgICAgICAgICAgICAgZGVidWdnZXI7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgIC8vIHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuICAgIC8vICAgICAkKCdbZGF0YS1pZD0xXScpLmNsaWNrKClcbiAgICAvLyB9LCAxMClcblxufSk7XG4iXX0=
