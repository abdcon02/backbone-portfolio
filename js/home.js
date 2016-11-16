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
        if (object.image && -1 == object.image.indexOf("http")) {
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
            // OPTIMIZE not proud of this navigation or filtering
            $("#content div:first").trigger("terminate");
            if ("resume" == path) {
                return new app.ResumeView();
            }
            var allWork = new app.WorkCollection();
            if ("posts" === path) {
                allWork.filterPosts = true;
            } else {
                if ("projects" === path) {
                    allWork.filterProjects = true;
                }
            }
            return new app.WorkView({
                collection: allWork
            });
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
            tagline: "default tagline",
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
        url: app.dataPath + "work.json",
        // defaults to filter projects projects
        filterWork: function(posts) {
            return _(this.filter(function(data) {
                return posts ? data.get("is_post") === "true" : data.get("is_post") !== "true";
            }));
        }
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
            var collection = this.getCollectionWithFilters();
            var scope = this;
            collection.each(function(model) {
                var json = model.toJSON();
                app.buildImageHelper(json);
                // create post class
                json.workClass = "true" === json.is_post ? "post" : "project";
                var html = scope.template(json);
                scope.$el.append(html);
            });
            return this;
        },
        // this method adds a filter if it is added as an object property
        getCollectionWithFilters: function() {
            if (typeof this.collection.filterProjects !== "undefined") {
                return this.collection.filterWork();
            } else {
                if (typeof this.collection.filterPosts !== "undefined") {
                    return this.collection.filterWork(true);
                } else {
                    return this.collection;
                }
            }
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhvbWUuanMiXSwibmFtZXMiOlsiJCIsImRvY3VtZW50IiwicmVhZHkiLCJhcHAiLCJiYXNlVXJsIiwibG9jYXRpb24iLCJob3N0bmFtZSIsImltYWdlUGF0aCIsImRhdGFQYXRoIiwicHJvamVjdFBhdGgiLCJzdmciLCJidWlsZEltYWdlSGVscGVyIiwib2JqZWN0IiwiaW1hZ2UiLCJpbmRleE9mIiwiTmF2SXRlbSIsIkJhY2tib25lIiwiTW9kZWwiLCJOYXZDb2xsZWN0aW9uIiwiQ29sbGVjdGlvbiIsImV4dGVuZCIsIm1vZGVsIiwidXJsIiwiTmF2VmlldyIsIlZpZXciLCJlbCIsInRlbXBsYXRlIiwiXyIsImh0bWwiLCJldmVudHMiLCJjbGljayAubmF2LWl0ZW06bm90KC5uYXYtbmFtZSkiLCJvbkNsaWNrIiwiZSIsInBhdGgiLCJ0YXJnZXQiLCJkYXRhIiwidHJpZ2dlciIsIlJlc3VtZVZpZXciLCJhbGxXb3JrIiwiV29ya0NvbGxlY3Rpb24iLCJmaWx0ZXJQb3N0cyIsImZpbHRlclByb2plY3RzIiwiV29ya1ZpZXciLCJjb2xsZWN0aW9uIiwiaW5pdGlhbGl6ZSIsInNjb3BlIiwidGhpcyIsImZldGNoIiwidGhlbiIsInJlbmRlciIsImVhY2giLCJqc29uIiwidG9KU09OIiwiJGVsIiwiYXBwZW5kIiwiV29ya0l0ZW0iLCJkZWZhdWx0cyIsImlzX3Bvc3QiLCJuYW1lIiwiZGF0ZSIsInRhZ2xpbmUiLCJzaG9ydF9kZXNjcmlwdGlvbiIsImxvbmdfZGVzY3JpcHRpb24iLCJpc19nYW1lIiwiZ2l0aHViX3VybCIsInByb2plY3RfdXJsIiwiZmlsdGVyV29yayIsInBvc3RzIiwiZmlsdGVyIiwiZ2V0IiwidGFnTmFtZSIsImNsYXNzTmFtZSIsImNsaWNrIC53b3JrLWl0ZW0iLCJ0ZXJtaW5hdGUiLCJyZW1vdmVWaWV3IiwicmVtb3ZlIiwiaWQiLCJjbG9zZXN0IiwiY2xpY2tlZE1vZGVsIiwiUG9zdExhbmRpbmdWaWV3IiwiSXRlbUxhbmRpbmdWaWV3IiwiYXBwZW5kVG8iLCJnZXRDb2xsZWN0aW9uV2l0aEZpbHRlcnMiLCJ3b3JrQ2xhc3MiLCJjbGljayAuYmFjay10by1jb2xsZWN0aW9uIiwiY2xpY2tCYWNrQnV0dG9uIiwiY2xpY2sgLmxvYWQtcHJvamVjdCIsImxvYWRQcm9qZWN0IiwicHJldmVudERlZmF1bHQiLCJwcm9qZWN0VXJsIiwiZnVsbFByb2plY3RVcmwiLCJ3aW5kb3ciLCJocmVmIiwidmlzaXRfdGV4dCIsIlJlc3VtZU1vZGVsIiwicmVzdW1lIiwic3ZnSXRlbSIsInN2Z0hlbHBlciIsInN2Z0FycmF5Iiwic3ZncyIsIm1hcCIsIml0ZW0iLCJzdmdDb2xsZWN0aW9uIiwic3ZnSXRlbXMiLCJ0ZXN0Iiwic2VsZiIsImZvckVhY2giXSwibWFwcGluZ3MiOiJBQUFBQSxFQUFFQyxVQUFVQyxNQUFNOztJQUVoQixJQUFJQztJQUNKQSxJQUFJQyxVQUFjQyxTQUFTQyxhQUFhLGNBQWMsMkJBQTJCO0lBQ2pGSCxJQUFJSSxZQUFjSixJQUFJQyxVQUFVO0lBQ2hDRCxJQUFJSyxXQUFjTCxJQUFJQyxVQUFVO0lBQ2hDRCxJQUFJTSxjQUFjTixJQUFJQyxVQUFVO0lBQ2hDRCxJQUFJTyxNQUFjUCxJQUFJQyxVQUFVO0lBR2hDRCxJQUFJUSxtQkFBbUIsU0FBU0M7O1FBRTlCLElBQUlBLE9BQU9DLFVBQVUsS0FBS0QsT0FBT0MsTUFBTUMsUUFBUSxTQUFTO1lBQ3RERixPQUFPQyxRQUFRVixJQUFJSSxZQUFZSyxPQUFPQztlQUNqQztZQUNMRCxPQUFPQyxRQUFRVixJQUFJSSxZQUFZOzs7Ozs7SUFRbkNKLElBQUlZLFVBQVVDLFNBQVNDO0lBRXZCZCxJQUFJZSxnQkFBZ0JGLFNBQVNHLFdBQVdDO1FBQ3RDQyxPQUFPbEIsSUFBSVk7UUFDWE8sS0FBS25CLElBQUlLLFdBQVc7O0lBR3RCTCxJQUFJb0IsVUFBVVAsU0FBU1EsS0FBS0o7UUFDMUJLLElBQUk7UUFDSkMsVUFBVUMsRUFBRUQsU0FBVTFCLEVBQUUsNkJBQTZCNEI7UUFDckRDO1lBQ0VD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SUMsT0FBTzNEO1lBQ1hBLEtBQUt5RCxTQUFTRyxRQUFRLFNBQVN6RTtnQkFDN0IsSUFBSW9FLE9BQU8sSUFBSUksS0FBS3BGO2dCQUNwQmdGLEtBQUsvRSxNQUFNVztnQkFDWG9FLEtBQUt0RDtnQkFDTCIsImZpbGUiOiJob21lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gIC8vIE5hbWVzcGFjZSB0aGUgb2JqZWN0c1xuICB2YXIgYXBwICAgICAgICAgPSB7fTtcbiAgYXBwLmJhc2VVcmwgICAgID0gbG9jYXRpb24uaG9zdG5hbWUgPT09ICdsb2NhbGhvc3QnID8gJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAwMC8nIDogJ2h0dHBzOi8vd3d3LmNvbm5vcmFiZGVsbm9vci5jb20vJztcbiAgYXBwLmltYWdlUGF0aCAgID0gYXBwLmJhc2VVcmwgKyAnaW1hZ2VzLyc7XG4gIGFwcC5kYXRhUGF0aCAgICA9IGFwcC5iYXNlVXJsICsgJ2RhdGEvJztcbiAgYXBwLnByb2plY3RQYXRoID0gYXBwLmJhc2VVcmwgKyAnYXBwL3Byb2plY3RzLyc7XG4gIGFwcC5zdmcgICAgICAgICA9IGFwcC5iYXNlVXJsICsgJ2xpYi9zdmcvJztcblxuXG4gIGFwcC5idWlsZEltYWdlSGVscGVyID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgLy8gQ2hlY2sgdGhhdCB0aGUgcGF0aCBpcyBzZXQgYW5kIGlzIHJlbGF0aXZlLCBlbHNlIHVzZSBkZWZhdWx0LlxuICAgIGlmIChvYmplY3QuaW1hZ2UgJiYgLTEgPT0gb2JqZWN0LmltYWdlLmluZGV4T2YoJ2h0dHAnKSkge1xuICAgICAgb2JqZWN0LmltYWdlID0gYXBwLmltYWdlUGF0aCArIG9iamVjdC5pbWFnZTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2JqZWN0LmltYWdlID0gYXBwLmltYWdlUGF0aCArICdkZWZhdWx0LnBuZyc7XG4gICAgfVxuICB9XG5cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIC8vICAgIE5hdmlnYXRpb25cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgYXBwLk5hdkl0ZW0gPSBCYWNrYm9uZS5Nb2RlbDtcblxuICBhcHAuTmF2Q29sbGVjdGlvbiA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcbiAgICBtb2RlbDogYXBwLk5hdkl0ZW0sXG4gICAgdXJsOiBhcHAuZGF0YVBhdGggKyAnbmF2Lmpzb24nXG4gIH0pO1xuXG4gIGFwcC5OYXZWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuICAgIGVsOiAnLm5hdmlnYXRpb24nLFxuICAgIHRlbXBsYXRlOiBfLnRlbXBsYXRlKCAkKCcuaXRlbS1uYXZpZ2F0aW9uLXRlbXBsYXRlJykuaHRtbCgpICksXG4gICAgZXZlbnRzOiB7XG4gICAgICAnY2xpY2sgLm5hdi1pdGVtOm5vdCgubmF2LW5hbWUpJzogJ29uQ2xpY2snXG4gICAgfSxcblxuICAgIG9uQ2xpY2s6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBwYXRoID0gJChlLnRhcmdldCkuZGF0YSgncGF0aCcpO1xuXG4gICAgICAvLyBPUFRJTUlaRSBub3QgcHJvdWQgb2YgdGhpcyBuYXZpZ2F0aW9uIG9yIGZpbHRlcmluZ1xuICAgICAgJCgnI2NvbnRlbnQgZGl2OmZpcnN0JykudHJpZ2dlcigndGVybWluYXRlJyk7XG5cbiAgICAgIGlmIChcInJlc3VtZVwiID09IHBhdGgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBhcHAuUmVzdW1lVmlldztcbiAgICAgIH1cblxuICAgICAgdmFyIGFsbFdvcmsgPSBuZXcgYXBwLldvcmtDb2xsZWN0aW9uO1xuXG4gICAgICBpZiAoXCJwb3N0c1wiID09PSBwYXRoKSB7XG4gICAgICAgIGFsbFdvcmsuZmlsdGVyUG9zdHMgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChcInByb2plY3RzXCIgPT09IHBhdGgpIHtcbiAgICAgICAgYWxsV29yay5maWx0ZXJQcm9qZWN0cyA9IHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IGFwcC5Xb3JrVmlldyh7Y29sbGVjdGlvbjogYWxsV29ya30pO1xuICAgIH0sXG5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzY29wZSA9IHRoaXM7XG4gICAgICB0aGlzLmNvbGxlY3Rpb24uZmV0Y2goKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBzY29wZS5yZW5kZXIoKTtcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2NvcGUgPSB0aGlzO1xuICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24obW9kZWwpIHtcbiAgICAgICAgdmFyIGpzb24gPSBtb2RlbC50b0pTT04oKTtcbiAgICAgICAgdmFyIGh0bWwgPSBzY29wZS50ZW1wbGF0ZShqc29uKTtcbiAgICAgICAgc2NvcGUuJGVsLmFwcGVuZChodG1sKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgfSk7XG5cbiAgbmV3IGFwcC5OYXZWaWV3KHtjb2xsZWN0aW9uOiBuZXcgYXBwLk5hdkNvbGxlY3Rpb24oKX0pO1xuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAvLyAgICBQcm9qZWN0IExpc3RcbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgYXBwLldvcmtJdGVtID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcbiAgICBkZWZhdWx0czoge1xuICAgICAgaXNfcG9zdDpcInRydWVcIixcbiAgICAgIG5hbWU6XCJEZWZhdWx0XCIsXG4gICAgICBkYXRlOlwiQmVnaW5pbmcgb2YgVGltZVwiLFxuICAgICAgdGFnbGluZTogXCJkZWZhdWx0IHRhZ2xpbmVcIixcbiAgICAgIHNob3J0X2Rlc2NyaXB0aW9uOiBcImRlZmF1bHRcIixcbiAgICAgIGxvbmdfZGVzY3JpcHRpb246IFwiZGVmYXVsdFwiLFxuICAgICAgaW1hZ2U6IFwiZGVmYXVsdC5wbmdcIixcbiAgICAgIGlzX2dhbWU6IGZhbHNlLFxuICAgICAgZ2l0aHViX3VybDogXCJkZWZhdWx0XCIsXG4gICAgICBwcm9qZWN0X3VybDogXCJkZWZhdWx0XCJcbiAgICB9XG4gIH0pO1xuXG4gIGFwcC5Xb3JrQ29sbGVjdGlvbiA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcbiAgICBtb2RlbDogYXBwLldvcmtJdGVtLFxuICAgIHVybDogYXBwLmRhdGFQYXRoICsgJ3dvcmsuanNvbicsXG5cbiAgICAvLyBkZWZhdWx0cyB0byBmaWx0ZXIgcHJvamVjdHMgcHJvamVjdHNcbiAgICBmaWx0ZXJXb3JrOiBmdW5jdGlvbihwb3N0cykge1xuICAgICAgcmV0dXJuIF8odGhpcy5maWx0ZXIoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICByZXR1cm4gcG9zdHMgPyBkYXRhLmdldChcImlzX3Bvc3RcIikgPT09IFwidHJ1ZVwiIDogZGF0YS5nZXQoXCJpc19wb3N0XCIpICE9PSBcInRydWVcIjtcbiAgICAgIH0pKTtcbiAgICB9XG5cbiAgfSk7XG5cbiAgYXBwLldvcmtWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuICAgIHRhZ05hbWU6ICdkaXYnLFxuICAgIGNsYXNzTmFtZTogJ3dvcmstY29sbGVjdGlvbicsXG4gICAgdGVtcGxhdGU6IF8udGVtcGxhdGUoICQoJy53b3JrLWNvbGxlY3Rpb24tdGVtcGxhdGUnKS5odG1sKCkgKSxcbiAgICBldmVudHM6IHtcbiAgICAgICdjbGljayAud29yay1pdGVtJzogJ29uQ2xpY2snLFxuICAgICAgJ3Rlcm1pbmF0ZSc6ICdyZW1vdmVWaWV3J1xuICAgIH0sXG5cbiAgICByZW1vdmVWaWV3OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgfSxcblxuICAgIC8vIFdoZW4gd2UgY2xpY2sgYSBib3gsIHJlbW92ZSB0aGUgY3VycmVudCB2aWV3IGFuZCBsb2FkIHRoZSBmdWxsIGJveCB2aWV3XG4gICAgb25DbGljazogZnVuY3Rpb24oZSkge1xuICAgICAgdmFyIGlkID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLndvcmstaXRlbScpLmRhdGEoJ2lkJyk7XG4gICAgICB2YXIgY2xpY2tlZE1vZGVsID0gdGhpcy5jb2xsZWN0aW9uLmdldChpZClcbiAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICBcInRydWVcIiA9PT0gY2xpY2tlZE1vZGVsLmdldCgnaXNfcG9zdCcpID8gbmV3IGFwcC5Qb3N0TGFuZGluZ1ZpZXcoe21vZGVsOiBjbGlja2VkTW9kZWx9KSA6IG5ldyBhcHAuSXRlbUxhbmRpbmdWaWV3KHttb2RlbDogY2xpY2tlZE1vZGVsfSkgO1xuICAgIH0sXG5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzY29wZSA9IHRoaXM7XG4gICAgICBzY29wZS4kZWwuYXBwZW5kVG8oJyNjb250ZW50Jyk7XG4gICAgICB0aGlzLmNvbGxlY3Rpb24uZmV0Y2goKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBzY29wZS5yZW5kZXIoKTtcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY29sbGVjdGlvbiA9IHRoaXMuZ2V0Q29sbGVjdGlvbldpdGhGaWx0ZXJzKCk7XG4gICAgICB2YXIgc2NvcGUgPSB0aGlzO1xuICAgICAgY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKG1vZGVsKSB7XG4gICAgICAgIHZhciBqc29uID0gbW9kZWwudG9KU09OKCk7XG4gICAgICAgIGFwcC5idWlsZEltYWdlSGVscGVyKGpzb24pO1xuICAgICAgICAvLyBjcmVhdGUgcG9zdCBjbGFzc1xuICAgICAgICBqc29uLndvcmtDbGFzcyA9IChcInRydWVcIiA9PT0ganNvbi5pc19wb3N0KSA/ICdwb3N0JyA6ICdwcm9qZWN0JztcbiAgICAgICAgdmFyIGh0bWwgPSBzY29wZS50ZW1wbGF0ZShqc29uKTtcbiAgICAgICAgc2NvcGUuJGVsLmFwcGVuZChodG1sKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8vIHRoaXMgbWV0aG9kIGFkZHMgYSBmaWx0ZXIgaWYgaXQgaXMgYWRkZWQgYXMgYW4gb2JqZWN0IHByb3BlcnR5XG4gICAgZ2V0Q29sbGVjdGlvbldpdGhGaWx0ZXJzOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5jb2xsZWN0aW9uLmZpbHRlclByb2plY3RzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLmZpbHRlcldvcmsoKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMuY29sbGVjdGlvbi5maWx0ZXJQb3N0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbi5maWx0ZXJXb3JrKHRydWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbjtcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgLy8gVE9ETyBjaGVjayBpZiBpdCBpcyBhY3R1YWxseSBiZXR0ZXIgdG8gaW5zdGFudGlhdGUgdGhlIGNvbGxlY3Rpb24gb2JqZWN0IGhlcmUgYW5kIHBhc3MgaXQgdG8gdGhlIHZpZXdcbiAgLy8gdmVyc3VzIGRlY2xhcmluZyBhIG5ldyBjb2xsZWN0aW9uIHByb3BlcnR5IGluIHRoZSB2aWV3IG9iamVjdFxuICBuZXcgYXBwLldvcmtWaWV3KHtjb2xsZWN0aW9uOiBuZXcgYXBwLldvcmtDb2xsZWN0aW9ufSk7XG5cblxuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgLy8gICAgUG9zdCBMYW5kaW5nIFZpZXdcbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgYXBwLlBvc3RMYW5kaW5nVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcbiAgICB0YWdOYW1lOiAnZGl2JyxcbiAgICBjbGFzc05hbWU6ICdwb3N0LWxhbmRpbmcnLFxuICAgIHRlbXBsYXRlOiBfLnRlbXBsYXRlKCAkKCcucG9zdC1sYW5kaW5nLXRlbXBsYXRlJykuaHRtbCgpICksXG5cbiAgICBldmVudHM6IHtcbiAgICAgICdjbGljayAuYmFjay10by1jb2xsZWN0aW9uJzogJ2NsaWNrQmFja0J1dHRvbicsXG4gICAgICAndGVybWluYXRlJzogJ3JlbW92ZVZpZXcnXG4gICAgfSxcblxuICAgIHJlbW92ZVZpZXc6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICB9LFxuXG4gICAgY2xpY2tCYWNrQnV0dG9uOiBmdW5jdGlvbihlKSB7XG4gICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgbmV3IGFwcC5Xb3JrVmlldyh7Y29sbGVjdGlvbjogbmV3IGFwcC5Xb3JrQ29sbGVjdGlvbn0pO1xuICAgIH0sXG5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuJGVsLmFwcGVuZFRvKCcjY29udGVudCcpO1xuICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBqc29uID0gdGhpcy5tb2RlbC50b0pTT04oKTtcbiAgICAgIHZhciBodG1sID0gdGhpcy50ZW1wbGF0ZShqc29uKTtcbiAgICAgIHRoaXMuJGVsLmFwcGVuZChodG1sKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAvLyAgICBJdGVtIExhbmRpbmcgVmlld1xuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICBhcHAuSXRlbUxhbmRpbmdWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuICAgIHRhZ05hbWU6ICdkaXYnLFxuICAgIGNsYXNzTmFtZTogJ2l0ZW0tbGFuZGluZycsXG4gICAgdGVtcGxhdGU6IF8udGVtcGxhdGUoICQoJy5pdGVtLWxhbmRpbmctdGVtcGxhdGUnKS5odG1sKCkgKSxcblxuICAgIGV2ZW50czoge1xuICAgICAgJ2NsaWNrIC5iYWNrLXRvLWNvbGxlY3Rpb24nOiAnY2xpY2tCYWNrQnV0dG9uJyxcbiAgICAgICdjbGljayAubG9hZC1wcm9qZWN0JzogJ2xvYWRQcm9qZWN0JyxcbiAgICAgICd0ZXJtaW5hdGUnOiAncmVtb3ZlVmlldydcbiAgICB9LFxuXG4gICAgcmVtb3ZlVmlldzogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnJlbW92ZSgpO1xuICAgIH0sXG5cbiAgICBsb2FkUHJvamVjdDogZnVuY3Rpb24oZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICB2YXIgcHJvamVjdFVybCA9IHRoaXMubW9kZWwuZ2V0KFwicHJvamVjdF91cmxcIik7XG4gICAgICB2YXIgZnVsbFByb2plY3RVcmwgPSBhcHAucHJvamVjdFBhdGggKyBwcm9qZWN0VXJsO1xuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBmdWxsUHJvamVjdFVybDtcbiAgICB9LFxuXG4gICAgY2xpY2tCYWNrQnV0dG9uOiBmdW5jdGlvbihlKSB7XG4gICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgbmV3IGFwcC5Xb3JrVmlldyh7Y29sbGVjdGlvbjogbmV3IGFwcC5Xb3JrQ29sbGVjdGlvbn0pO1xuICAgIH0sXG5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuJGVsLmFwcGVuZFRvKCcjY29udGVudCcpO1xuICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBqc29uID0gdGhpcy5tb2RlbC50b0pTT04oKTtcbiAgICAgIGFwcC5idWlsZEltYWdlSGVscGVyKGpzb24pO1xuICAgICAganNvbi52aXNpdF90ZXh0ID0ganNvbi5pc19nYW1lID8gXCJQbGF5IEdhbWVcIiA6IFwiVmlldyBBcHBcIjtcbiAgICAgIHZhciBodG1sID0gdGhpcy50ZW1wbGF0ZShqc29uKTtcbiAgICAgIHRoaXMuJGVsLmFwcGVuZChodG1sKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAvLyAgICBSZXN1bWVcbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgYXBwLlJlc3VtZU1vZGVsID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcbiAgICB1cmw6IGFwcC5kYXRhUGF0aCArICdyZXN1bWUuanNvbidcbiAgfSk7XG5cbiAgYXBwLlJlc3VtZVZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG4gICAgdGFnTmFtZTogJ2RpdicsXG4gICAgY2xhc3NOYW1lOiAncmVzdW1lLWNvbnRhaW5lcicsXG4gICAgLy9PUFRJTUlaRSBjb25zdHJ1Y3Qgd2l0aCBhIG1vZGVsIHNvIHRoZSB2aWV3IGNhbiBiZSByZXVzZWRcbiAgICBtb2RlbDogbmV3IGFwcC5SZXN1bWVNb2RlbCgpLFxuICAgIHRlbXBsYXRlOiBfLnRlbXBsYXRlKCAkKCcucmVzdW1lLXRlbXBsYXRlJykuaHRtbCgpICksXG5cbiAgICBldmVudHM6IHtcbiAgICAgICd0ZXJtaW5hdGUnOiAncmVtb3ZlVmlldydcbiAgICB9LFxuXG4gICAgcmVtb3ZlVmlldzogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnJlbW92ZSgpO1xuICAgIH0sXG5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzY29wZSA9IHRoaXM7XG4gICAgICB0aGlzLiRlbC5hcHBlbmRUbygnI2NvbnRlbnQnKTtcbiAgICAgIHRoaXMubW9kZWwuZmV0Y2goKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBzY29wZS5yZW5kZXIoKTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJlc3VtZSA9IHRoaXMubW9kZWwudG9KU09OKCkucmVzdW1lO1xuICAgICAgdmFyIGh0bWwgPSB0aGlzLnRlbXBsYXRlKHJlc3VtZSk7XG4gICAgICB0aGlzLiRlbC5hcHBlbmQoaHRtbCk7XG4gICAgfVxuICB9KVxuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAvLyAgICBTVkdzXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cbiAgYXBwLnN2Z0l0ZW0gPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuXG4gICAgLy8gZmV0Y2g6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyAgICAgLy8gT1BUSU1JWkUgdGhpcy5wYXRoIGNvdWxkIGxlYWQgdG8gcHJvYmxlbXNcbiAgICAvLyAgICAgJC5nZXQodGhpcy5nZXQoJ3BhdGgnKSwgJ3RleHQnKS5kb25lKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAvLyAgICAgICAgIGRlYnVnZ2VyO1xuICAgIC8vICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgLy8gICAgIH0pXG4gICAgLy8gfSxcbiAgICAvL1xuXG4gIH0pXG5cbiAgLy8gQ29udmVydCBzdmcgbmFtZXMgdG8gZmlsZSBwYXRoc1xuICBhcHAuc3ZnSGVscGVyID0gZnVuY3Rpb24oc3ZnQXJyYXkpIHtcbiAgICB2YXIgc3ZncyA9IHN2Z0FycmF5Lm1hcChmdW5jdGlvbihpdGVtKSB7XG4gICAgICByZXR1cm4gYXBwLnN2ZyArIGl0ZW0gKyAnLnN2Zyc7XG4gICAgfSlcbiAgfVxuXG4gIGFwcC5zdmdDb2xsZWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuICAgIG1vZGVsOiBhcHAuc3ZnSXRlbSxcbiAgICBzdmdJdGVtczogWydodHRwOi8vbG9jYWxob3N0OjgwMDAvbGliL3N2Zy9hbGVydC5zdmcnLFxuICAgICdodHRwOi8vbG9jYWxob3N0OjgwMDAvbGliL3N2Zy9hcnJvdy1kb3duLnN2ZyddLFxuXG4gICAgdGVzdDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB0aGlzLnN2Z0l0ZW1zLmZvckVhY2goZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICB2YXIgaXRlbSA9IG5ldyBzZWxmLm1vZGVsO1xuICAgICAgICBpdGVtLnVybCA9IHBhdGg7XG4gICAgICAgIGl0ZW0uZmV0Y2goKTtcbiAgICAgICAgZGVidWdnZXI7XG4gICAgICB9KVxuICAgIH1cbiAgfSlcblxuICAvLyBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcbiAgLy8gICAgICQoJ1tkYXRhLWlkPTFdJykuY2xpY2soKVxuICAvLyB9LCAxMClcblxufSk7XG4iXX0=
