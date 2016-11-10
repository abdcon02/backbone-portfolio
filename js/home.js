// OPTIMIZE - document ready was so 2010. Figure out something better.
$(document).ready(function() {
    // Namespace the objects
    var app = {};
    app.baseUrl = location.hostname === "localhost" ? "http://localhost:8000/" : "http://www.connorabdelnoor.com";
    app.imagePath = app.baseUrl + "images/";
    app.dataPath = app.baseUrl + "data/";
    app.projectPath = app.baseUrl + "app/projects/";
    app.svg = app.baseUrl + "lib/svg/";
    app.buildImageHelper = function(object) {
        // Check that the path is set and is relative
        if (object.image && object.image.indexOf("http") == -1) {
            object.image = app.imagePath + object.image;
        }
    };
    ////////////////////////////////////////////////
    //    Navigation
    ////////////////////////////////////////////////
    app.NavItem = Backbone.Model.extend({
        defaults: {
            icons: []
        }
    });
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
                new app.ProjectView({
                    collection: new app.ProjectCollection()
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
    app.ProjectItem = Backbone.Model.extend({
        defaults: {
            tagline: ""
        }
    });
    app.ProjectCollection = Backbone.Collection.extend({
        model: app.ProjectItem,
        url: app.dataPath + "projects.json"
    });
    app.ProjectView = Backbone.View.extend({
        tagName: "div",
        className: "project-collection",
        template: _.template($(".project-collection-template").html()),
        events: {
            "click .project-item": "onClick",
            terminate: "removeView"
        },
        removeView: function() {
            this.remove();
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
    new app.ProjectView({
        collection: new app.ProjectCollection()
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
            new app.ProjectView({
                collection: new app.ProjectCollection()
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhvbWUuanMiXSwibmFtZXMiOlsiJCIsImRvY3VtZW50IiwicmVhZHkiLCJhcHAiLCJiYXNlVXJsIiwibG9jYXRpb24iLCJob3N0bmFtZSIsImltYWdlUGF0aCIsImRhdGFQYXRoIiwicHJvamVjdFBhdGgiLCJzdmciLCJidWlsZEltYWdlSGVscGVyIiwib2JqZWN0IiwiaW1hZ2UiLCJpbmRleE9mIiwiTmF2SXRlbSIsIkJhY2tib25lIiwiTW9kZWwiLCJleHRlbmQiLCJkZWZhdWx0cyIsImljb25zIiwiTmF2Q29sbGVjdGlvbiIsIkNvbGxlY3Rpb24iLCJtb2RlbCIsInVybCIsIk5hdlZpZXciLCJWaWV3IiwiZWwiLCJ0ZW1wbGF0ZSIsIl8iLCJodG1sIiwiZXZlbnRzIiwiY2xpY2sgLm5hdi1pdGVtOm5vdCgubmF2LW5hbWUpIiwib25DbGljayIsImUiLCJwYXRoIiwidGFyZ2V0IiwiZGF0YSIsInRyaWdnZXIiLCJSZXN1bWVWaWV3IiwiUHJvamVjdFZpZXciLCJjb2xsZWN0aW9uIiwiUHJvamVjdENvbGxlY3Rpb24iLCJpbml0aWFsaXplIiwic2NvcGUiLCJ0aGlzIiwiZmV0Y2giLCJ0aGVuIiwicmVuZGVyIiwiZWFjaCIsImpzb24iLCJ0b0pTT04iLCIkZWwiLCJhcHBlbmQiLCJQcm9qZWN0SXRlbSIsInRhZ2xpbmUiLCJ0YWdOYW1lIiwiY2xhc3NOYW1lIiwiY2xpY2sgLnByb2plY3QtaXRlbSIsInRlcm1pbmF0ZSIsInJlbW92ZVZpZXciLCJyZW1vdmUiLCJpZCIsImNsb3Nlc3QiLCJjbGlja2VkTW9kZWwiLCJnZXQiLCJJdGVtTGFuZGluZ1ZpZXciLCJhcHBlbmRUbyIsImZlYXR1cmVkIiwiZmVhdHVyZWRDbGFzcyIsImNsaWNrIC5iYWNrLXRvLXByb2plY3QtY29sbGVjdGlvbiIsImNsaWNrIC5sb2FkLXByb2plY3QiLCJsb2FkUHJvamVjdCIsInByZXZlbnREZWZhdWx0IiwicHJvamVjdFVybCIsImZ1bGxQcm9qZWN0VXJsIiwid2luZG93IiwiaHJlZiIsImNsaWNrQmFja0J1dHRvbiIsInZpc2l0X3RleHQiLCJpc19nYW1lIiwiUmVzdW1lTW9kZWwiLCJyZXN1bWUiLCJzdmdJdGVtIiwic3ZnSGVscGVyIiwic3ZnQXJyYXkiLCJzdmdzIiwibWFwIiwiaXRlbSIsInN2Z0NvbGxlY3Rpb24iLCJzdmdJdGVtcyIsInRlc3QiLCJzZWxmIiwiZm9yRWFjaCJdLCJtYXBwaW5ncyI6IjtBQUVBQSxFQUFFQyxVQUFVQyxNQUFNOztJQUVkLElBQUlDO0lBQ0pBLElBQUlDLFVBQWNDLFNBQVNDLGFBQWEsY0FBYywyQkFBMkI7SUFDakZILElBQUlJLFlBQWNKLElBQUlDLFVBQVU7SUFDaENELElBQUlLLFdBQWNMLElBQUlDLFVBQVU7SUFDaENELElBQUlNLGNBQWNOLElBQUlDLFVBQVU7SUFDaENELElBQUlPLE1BQWNQLElBQUlDLFVBQVU7SUFHaENELElBQUlRLG1CQUFtQixTQUFTQzs7UUFFNUIsSUFBSUEsT0FBT0MsU0FBU0QsT0FBT0MsTUFBTUMsUUFBUSxZQUFZLEdBQUc7WUFDcERGLE9BQU9DLFFBQVFWLElBQUlJLFlBQVlLLE9BQU9DOzs7Ozs7SUFROUNWLElBQUlZLFVBQVVDLFNBQVNDLE1BQU1DO1FBQ3pCQztZQUNJQzs7O0lBSVJqQixJQUFJa0IsZ0JBQWdCTCxTQUFTTSxXQUFXSjtRQUNwQ0ssT0FBT3BCLElBQUlZO1FBQ1hTLEtBQUtyQixJQUFJSyxXQUFXOztJQUd4QkwsSUFBSXNCLFVBQVVULFNBQVNVLEtBQUtSO1FBQ3hCUyxJQUFJO1FBQ0pDLFVBQVVDLEVBQUVELFNBQVU1QixFQUFFLDZCQUE2QjhCO1FBQ3JEQztZQUNFQyxrQ0FBa0M7O1FBR3BDQyxTQUFTLFNBQVNDO1lBQ2QsSUFBSUMsT0FBT25DLEVBQUVrQyxFQUFFRSxRQUFRQyxLQUFLOztZQUc1QnJDLEVBQUUsc0JBQXNCc0MsUUFBUTtZQUVoQyxJQUFJSCxRQUFRLFVBQVU7Z0JBQ3BCLElBQUloQyxJQUFJb0M7bUJBQ0g7Z0JBQ0wsSUFBSXBDLElBQUlxQztvQkFBYUMsWUFB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QUMvQk0sS0FBS3JCLElBQUlLLFdBQVc7O0lBR3RCTCxJQUFJb0MsYUFBYXZCLFNBQVNVLEtBQUtSO1FBQzdCc0MsU0FBUztRQUNUQyxXQUFXOztRQUVYbEMsT0FBTyxJQUFJcEIsSUFBSThFO1FBQ2ZyRCxVQUFVQyxFQUFFRCxTQUFVNUIsRUFBRSxvQkFBb0I4QjtRQUU1Q0M7WUFDRTRCLFdBQWE7O1FBR2ZDLFlBQVk7WUFDVmYsS0FBS2dCOztRQUdQbEIsWUFBWTtZQUNWLElBQUlDLFFBQVFDO1lBQ1pBLEtBQUtPLElBQUllLFNBQVM7WUFDbEJ0QixLQUFLdEIsTUFBTXVCLFFBQVFDLEtBQUs7Z0JBQ3RCSCxNQUFNSTs7O1FBSVZBLFFBQVE7WUFDTixJQUFJa0MsU0FBU3JDLEtBQUt0QixNQUFNNEIsU0FBUytCO1lBQ2pDLElBQUlwRCxPQUFPZSxLQUFLakIsU0FBU3NEO1lBQ3pCckMsS0FBS08sSUFBSUMsT0FBT3ZCOzs7Ozs7SUFTaEIzQixJQUFJZ0YsVUFBVW5FLFNBQVNDLE1BQU1DOztJQWM3QmYsSUFBSWlGLFlBQVksU0FBU0M7UUFDckIsSUFBSUMsT0FBT0QsU0FBU0UsSUFBSSxTQUFTQztZQUM3QixPQUFPckYsSUFBSU8sTUFBTThFLE9BQU87OztJQUloQ3JGLElBQUlzRixnQkFBZ0J6RSxTQUFTTSxXQUFXSjtRQUNwQ0ssT0FBT3BCLElBQUlnRjtRQUNYTyxZQUFXLDJDQUNQO1FBRUpDLE1BQU07WUFDRixJQUFJQyxPQUFPL0M7WUFDWEEsS0FBSzZDLFNBQVNHLFFBQVEsU0FBUzFEO2dCQUMzQixJQUFJcUQsT0FBTyxJQUFJSSxLQUFLckU7Z0JBQ3BCaUUsS0FBS2hFLE1BQU1XO2dCQUNYcUQsS0FBSzFDO2dCQUNMIiwiZmlsZSI6ImhvbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBPUFRJTUlaRSAtIGRvY3VtZW50IHJlYWR5IHdhcyBzbyAyMDEwLiBGaWd1cmUgb3V0IHNvbWV0aGluZyBiZXR0ZXIuXG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIC8vIE5hbWVzcGFjZSB0aGUgb2JqZWN0c1xuICAgIHZhciBhcHAgICAgICAgICA9IHt9O1xuICAgIGFwcC5iYXNlVXJsICAgICA9IGxvY2F0aW9uLmhvc3RuYW1lID09PSAnbG9jYWxob3N0JyA/ICdodHRwOi8vbG9jYWxob3N0OjgwMDAvJyA6ICdodHRwOi8vd3d3LmNvbm5vcmFiZGVsbm9vci5jb20nO1xuICAgIGFwcC5pbWFnZVBhdGggICA9IGFwcC5iYXNlVXJsICsgJ2ltYWdlcy8nO1xuICAgIGFwcC5kYXRhUGF0aCAgICA9IGFwcC5iYXNlVXJsICsgJ2RhdGEvJztcbiAgICBhcHAucHJvamVjdFBhdGggPSBhcHAuYmFzZVVybCArICdhcHAvcHJvamVjdHMvJztcbiAgICBhcHAuc3ZnICAgICAgICAgPSBhcHAuYmFzZVVybCArICdsaWIvc3ZnLyc7XG5cblxuICAgIGFwcC5idWlsZEltYWdlSGVscGVyID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgICAgIC8vIENoZWNrIHRoYXQgdGhlIHBhdGggaXMgc2V0IGFuZCBpcyByZWxhdGl2ZVxuICAgICAgICBpZiAob2JqZWN0LmltYWdlICYmIG9iamVjdC5pbWFnZS5pbmRleE9mKCdodHRwJykgPT0gLTEpIHtcbiAgICAgICAgICAgIG9iamVjdC5pbWFnZSA9IGFwcC5pbWFnZVBhdGggKyBvYmplY3QuaW1hZ2U7XG4gICAgICAgIH1cbiAgICB9XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gICAgTmF2aWdhdGlvblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICBhcHAuTmF2SXRlbSA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG4gICAgICAgIGRlZmF1bHRzOiB7XG4gICAgICAgICAgICBpY29uczogW11cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgYXBwLk5hdkNvbGxlY3Rpb24gPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG4gICAgICAgIG1vZGVsOiBhcHAuTmF2SXRlbSxcbiAgICAgICAgdXJsOiBhcHAuZGF0YVBhdGggKyAnbmF2Lmpzb24nXG4gICAgfSk7XG5cbiAgICBhcHAuTmF2VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcbiAgICAgICAgZWw6ICcubmF2aWdhdGlvbicsXG4gICAgICAgIHRlbXBsYXRlOiBfLnRlbXBsYXRlKCAkKCcuaXRlbS1uYXZpZ2F0aW9uLXRlbXBsYXRlJykuaHRtbCgpICksXG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICdjbGljayAubmF2LWl0ZW06bm90KC5uYXYtbmFtZSknOiAnb25DbGljaydcbiAgICAgICAgfSxcblxuICAgICAgICBvbkNsaWNrOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgcGF0aCA9ICQoZS50YXJnZXQpLmRhdGEoJ3BhdGgnKTtcblxuICAgICAgICAgICAgLy8gRklYTUUgbm90IHByb3VkIG9mIHRoaXNcbiAgICAgICAgICAgICQoJyNjb250ZW50IGRpdjpmaXJzdCcpLnRyaWdnZXIoJ3Rlcm1pbmF0ZScpO1xuXG4gICAgICAgICAgICBpZiAocGF0aCA9PSBcInJlc3VtZVwiKSB7XG4gICAgICAgICAgICAgIG5ldyBhcHAuUmVzdW1lVmlldztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG5ldyBhcHAuUHJvamVjdFZpZXcoe2NvbGxlY3Rpb246IG5ldyBhcHAuUHJvamVjdENvbGxlY3Rpb259KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBzY29wZSA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZmV0Y2goKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNjb3BlLnJlbmRlcigpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNjb3BlID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGpzb24gPSBtb2RlbC50b0pTT04oKTtcbiAgICAgICAgICAgICAgICB2YXIgaHRtbCA9IHNjb3BlLnRlbXBsYXRlKGpzb24pO1xuICAgICAgICAgICAgICAgIHNjb3BlLiRlbC5hcHBlbmQoaHRtbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgbmV3IGFwcC5OYXZWaWV3KHtjb2xsZWN0aW9uOiBuZXcgYXBwLk5hdkNvbGxlY3Rpb24oKX0pO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vICAgIFByb2plY3QgTGlzdFxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICBhcHAuUHJvamVjdEl0ZW0gPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuICAgICAgICBkZWZhdWx0czoge1xuICAgICAgICAgICAgdGFnbGluZTogXCJcIlxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBhcHAuUHJvamVjdENvbGxlY3Rpb24gPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG4gICAgICAgIG1vZGVsOiBhcHAuUHJvamVjdEl0ZW0sXG4gICAgICAgIHVybDogYXBwLmRhdGFQYXRoICsgJ3Byb2plY3RzLmpzb24nXG4gICAgfSk7XG5cbiAgICBhcHAuUHJvamVjdFZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG4gICAgICAgIHRhZ05hbWU6ICdkaXYnLFxuICAgICAgICBjbGFzc05hbWU6ICdwcm9qZWN0LWNvbGxlY3Rpb24nLFxuICAgICAgICB0ZW1wbGF0ZTogXy50ZW1wbGF0ZSggJCgnLnByb2plY3QtY29sbGVjdGlvbi10ZW1wbGF0ZScpLmh0bWwoKSApLFxuICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICAgICdjbGljayAucHJvamVjdC1pdGVtJzogJ29uQ2xpY2snLFxuICAgICAgICAgICAgJ3Rlcm1pbmF0ZSc6ICdyZW1vdmVWaWV3J1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZVZpZXc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gV2hlbiB3ZSBjbGljayBhIGJveCwgcmVtb3ZlIHRoZSBjdXJyZW50IHZpZXcgYW5kIGxvYWQgdGhlIGZ1bGwgYm94IHZpZXdcbiAgICAgICAgb25DbGljazogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdmFyIGlkID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLnByb2plY3QtaXRlbScpLmRhdGEoJ2lkJyk7XG4gICAgICAgICAgICB2YXIgY2xpY2tlZE1vZGVsID0gdGhpcy5jb2xsZWN0aW9uLmdldChpZClcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgICAgICBuZXcgYXBwLkl0ZW1MYW5kaW5nVmlldyh7bW9kZWw6IGNsaWNrZWRNb2RlbH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2NvcGUgPSB0aGlzO1xuICAgICAgICAgICAgc2NvcGUuJGVsLmFwcGVuZFRvKCcjY29udGVudCcpO1xuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmZldGNoKCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzY29wZS5yZW5kZXIoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBzY29wZSA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbihtb2RlbCkge1xuICAgICAgICAgICAgICAgIHZhciBqc29uID0gbW9kZWwudG9KU09OKCk7XG4gICAgICAgICAgICAgICAgYXBwLmJ1aWxkSW1hZ2VIZWxwZXIoanNvbik7XG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIGZlYXR1cmVkIGNsYXNzXG4gICAgICAgICAgICAgICAganNvbi5mZWF0dXJlZCA/IGpzb24uZmVhdHVyZWRDbGFzcyA9ICdmZWF0dXJlZCcgOiBqc29uLmZlYXR1cmVkQ2xhc3MgPSAnJztcbiAgICAgICAgICAgICAgICB2YXIgaHRtbCA9IHNjb3BlLnRlbXBsYXRlKGpzb24pO1xuICAgICAgICAgICAgICAgIHNjb3BlLiRlbC5hcHBlbmQoaHRtbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfSlcblxuICAgIC8vIFRPRE8gY2hlY2sgaWYgaXQgaXMgYWN0dWFsbHkgYmV0dGVyIHRvIGluc3RhbnRpYXRlIHRoZSBjb2xsZWN0aW9uIG9iamVjdCBoZXJlIGFuZCBwYXNzIGl0IHRvIHRoZSB2aWV3XG4gICAgLy8gdmVyc3VzIGRlY2xhcmluZyBhIG5ldyBjb2xsZWN0aW9uIHByb3BlcnR5IGluIHRoZSB2aWV3IG9iamVjdFxuICAgIG5ldyBhcHAuUHJvamVjdFZpZXcoe2NvbGxlY3Rpb246IG5ldyBhcHAuUHJvamVjdENvbGxlY3Rpb259KTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyAgICBJdGVtIExhbmRpbmdcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgYXBwLkl0ZW1MYW5kaW5nVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcbiAgICAgICAgdGFnTmFtZTogJ2RpdicsXG4gICAgICAgIGNsYXNzTmFtZTogJ2l0ZW0tbGFuZGluZycsXG4gICAgICAgIHRlbXBsYXRlOiBfLnRlbXBsYXRlKCAkKCcuaXRlbS1sYW5kaW5nLXRlbXBsYXRlJykuaHRtbCgpICksXG5cbiAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICAnY2xpY2sgLmJhY2stdG8tcHJvamVjdC1jb2xsZWN0aW9uJzogJ2NsaWNrQmFja0J1dHRvbicsXG4gICAgICAgICAgICAnY2xpY2sgLmxvYWQtcHJvamVjdCc6ICdsb2FkUHJvamVjdCcsXG4gICAgICAgICAgICAndGVybWluYXRlJzogJ3JlbW92ZVZpZXcnXG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlVmlldzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBsb2FkUHJvamVjdDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgIHZhciBwcm9qZWN0VXJsID0gdGhpcy5tb2RlbC5nZXQoXCJwcm9qZWN0X3VybFwiKTtcbiAgICAgICAgICB2YXIgZnVsbFByb2plY3RVcmwgPSBhcHAucHJvamVjdFBhdGggKyBwcm9qZWN0VXJsO1xuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gZnVsbFByb2plY3RVcmw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2xpY2tCYWNrQnV0dG9uOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgICAgICAgbmV3IGFwcC5Qcm9qZWN0Vmlldyh7Y29sbGVjdGlvbjogbmV3IGFwcC5Qcm9qZWN0Q29sbGVjdGlvbn0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwuYXBwZW5kVG8oJyNjb250ZW50Jyk7XG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIganNvbiA9IHRoaXMubW9kZWwudG9KU09OKCk7XG4gICAgICAgICAgICBhcHAuYnVpbGRJbWFnZUhlbHBlcihqc29uKTtcbiAgICAgICAgICAgIGpzb24udmlzaXRfdGV4dCA9IGpzb24uaXNfZ2FtZSA/IFwiUGxheSBHYW1lXCIgOiBcIlZpZXcgQXBwXCI7XG4gICAgICAgICAgICB2YXIgaHRtbCA9IHRoaXMudGVtcGxhdGUoanNvbik7XG4gICAgICAgICAgICB0aGlzLiRlbC5hcHBlbmQoaHRtbCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vICAgIFJlc3VtZVxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgYXBwLlJlc3VtZU1vZGVsID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcbiAgICAgIHVybDogYXBwLmRhdGFQYXRoICsgJ3Jlc3VtZS5qc29uJ1xuICAgIH0pO1xuXG4gICAgYXBwLlJlc3VtZVZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG4gICAgICB0YWdOYW1lOiAnZGl2JyxcbiAgICAgIGNsYXNzTmFtZTogJ3Jlc3VtZS1jb250YWluZXInLFxuICAgICAgLy9PUFRJTUlaRSBjb25zdHJ1Y3Qgd2l0aCBhIG1vZGVsIHNvIHRoZSB2aWV3IGNhbiBiZSByZXVzZWRcbiAgICAgIG1vZGVsOiBuZXcgYXBwLlJlc3VtZU1vZGVsKCksXG4gICAgICB0ZW1wbGF0ZTogXy50ZW1wbGF0ZSggJCgnLnJlc3VtZS10ZW1wbGF0ZScpLmh0bWwoKSApLFxuXG4gICAgICBldmVudHM6IHtcbiAgICAgICAgJ3Rlcm1pbmF0ZSc6ICdyZW1vdmVWaWV3J1xuICAgICAgfSxcblxuICAgICAgcmVtb3ZlVmlldzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICB9LFxuXG4gICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNjb3BlID0gdGhpcztcbiAgICAgICAgdGhpcy4kZWwuYXBwZW5kVG8oJyNjb250ZW50Jyk7XG4gICAgICAgIHRoaXMubW9kZWwuZmV0Y2goKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNjb3BlLnJlbmRlcigpO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG5cbiAgICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZXN1bWUgPSB0aGlzLm1vZGVsLnRvSlNPTigpLnJlc3VtZTtcbiAgICAgICAgdmFyIGh0bWwgPSB0aGlzLnRlbXBsYXRlKHJlc3VtZSk7XG4gICAgICAgIHRoaXMuJGVsLmFwcGVuZChodG1sKTtcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gICAgU1ZHc1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cbiAgICAgICAgYXBwLnN2Z0l0ZW0gPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuXG4gICAgICAgICAgICAvLyBmZXRjaDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gICAgIC8vIE9QVElNSVpFIHRoaXMucGF0aCBjb3VsZCBsZWFkIHRvIHByb2JsZW1zXG4gICAgICAgICAgICAvLyAgICAgJC5nZXQodGhpcy5nZXQoJ3BhdGgnKSwgJ3RleHQnKS5kb25lKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgZGVidWdnZXI7XG4gICAgICAgICAgICAvLyAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICAgICAgLy8gICAgIH0pXG4gICAgICAgICAgICAvLyB9LFxuICAgICAgICAgICAgLy9cblxuICAgICAgICB9KVxuXG4gICAgICAgIC8vIENvbnZlcnQgc3ZnIG5hbWVzIHRvIGZpbGUgcGF0aHNcbiAgICAgICAgYXBwLnN2Z0hlbHBlciA9IGZ1bmN0aW9uKHN2Z0FycmF5KSB7XG4gICAgICAgICAgICB2YXIgc3ZncyA9IHN2Z0FycmF5Lm1hcChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFwcC5zdmcgKyBpdGVtICsgJy5zdmcnO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIGFwcC5zdmdDb2xsZWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuICAgICAgICAgICAgbW9kZWw6IGFwcC5zdmdJdGVtLFxuICAgICAgICAgICAgc3ZnSXRlbXM6IFsnaHR0cDovL2xvY2FsaG9zdDo4MDAwL2xpYi9zdmcvYWxlcnQuc3ZnJyxcbiAgICAgICAgICAgICAgICAnaHR0cDovL2xvY2FsaG9zdDo4MDAwL2xpYi9zdmcvYXJyb3ctZG93bi5zdmcnXSxcblxuICAgICAgICAgICAgdGVzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHRoaXMuc3ZnSXRlbXMuZm9yRWFjaChmdW5jdGlvbihwYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpdGVtID0gbmV3IHNlbGYubW9kZWw7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0udXJsID0gcGF0aDtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5mZXRjaCgpO1xuICAgICAgICAgICAgICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgLy8gc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG4gICAgLy8gICAgICQoJ1tkYXRhLWlkPTFdJykuY2xpY2soKVxuICAgIC8vIH0sIDEwKVxuXG59KTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
