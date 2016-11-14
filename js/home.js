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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhvbWUuanMiXSwibmFtZXMiOlsiJCIsImRvY3VtZW50IiwicmVhZHkiLCJhcHAiLCJiYXNlVXJsIiwibG9jYXRpb24iLCJob3N0bmFtZSIsImltYWdlUGF0aCIsImRhdGFQYXRoIiwicHJvamVjdFBhdGgiLCJzdmciLCJidWlsZEltYWdlSGVscGVyIiwib2JqZWN0IiwiaW1hZ2UiLCJpbmRleE9mIiwiTmF2SXRlbSIsIkJhY2tib25lIiwiTW9kZWwiLCJleHRlbmQiLCJkZWZhdWx0cyIsImljb25zIiwiTmF2Q29sbGVjdGlvbiIsIkNvbGxlY3Rpb24iLCJtb2RlbCIsInVybCIsIk5hdlZpZXciLCJWaWV3IiwiZWwiLCJ0ZW1wbGF0ZSIsIl8iLCJodG1sIiwiZXZlbnRzIiwiY2xpY2sgLm5hdi1pdGVtOm5vdCgubmF2LW5hbWUpIiwib25DbGljayIsImUiLCJwYXRoIiwidGFyZ2V0IiwiZGF0YSIsInRyaWdnZXIiLCJSZXN1bWVWaWV3IiwiUHJvamVjdFZpZXciLCJjb2xsZWN0aW9uIiwiUHJvamVjdENvbGxlY3Rpb24iLCJpbml0aWFsaXplIiwic2NvcGUiLCJ0aGlzIiwiZmV0Y2giLCJ0aGVuIiwicmVuZGVyIiwiZWFjaCIsImpzb24iLCJ0b0pTT04iLCIkZWwiLCJhcHBlbmQiLCJQcm9qZWN0SXRlbSIsInRhZ2xpbmUiLCJ0YWdOYW1lIiwiY2xhc3NOYW1lIiwiY2xpY2sgLnByb2plY3QtaXRlbSIsInRlcm1pbmF0ZSIsInJlbW92ZVZpZXciLCJyZW1vdmUiLCJpZCIsImNsb3Nlc3QiLCJjbGlja2VkTW9kZWwiLCJnZXQiLCJJdGVtTGFuZGluZ1ZpZXciLCJhcHBlbmRUbyIsImZlYXR1cmVkIiwiZmVhdHVyZWRDbGFzcyIsImNsaWNrIC5iYWNrLXRvLXByb2plY3QtY29sbGVjdGlvbiIsImNsaWNrIC5sb2FkLXByb2plY3QiLCJsb2FkUHJvamVjdCIsInByZXZlbnREZWZhdWx0IiwicHJvamVjdFVybCIsImZ1bGxQcm9qZWN0VXJsIiwid2luZG93IiwiaHJlZiIsImNsaWNrQmFja0J1dHRvbiIsInZpc2l0X3RleHQiLCJpc19nYW1lIiwiUmVzdW1lTW9kZWwiLCJyZXN1bWUiLCJzdmdJdGVtIiwic3ZnSGVscGVyIiwic3ZnQXJyYXkiLCJzdmdzIiwibWFwIiwiaXRlbSIsInN2Z0NvbGxlY3Rpb24iLCJzdmdJdGVtcyIsInRlc3QiLCJzZWxmIiwiZm9yRWFjaCJdLCJtYXBwaW5ncyI6IkFBQUFBLEVBQUVDLFVBQVVDLE1BQU07O0lBRWQsSUFBSUM7SUFDSkEsSUFBSUMsVUFBY0MsU0FBU0MsYUFBYSxjQUFjLDJCQUEyQjtJQUNqRkgsSUFBSUksWUFBY0osSUFBSUMsVUFBVTtJQUNoQ0QsSUFBSUssV0FBY0wsSUFBSUMsVUFBVTtJQUNoQ0QsSUFBSU0sY0FBY04sSUFBSUMsVUFBVTtJQUNoQ0QsSUFBSU8sTUFBY1AsSUFBSUMsVUFBVTtJQUdoQ0QsSUFBSVEsbUJBQW1CLFNBQVNDOztRQUU1QixJQUFJQSxPQUFPQyxTQUFTRCxPQUFPQyxNQUFNQyxRQUFRLFlBQVksR0FBRztZQUNwREYsT0FBT0MsUUFBUVYsSUFBSUksWUFBWUssT0FBT0M7ZUFDbkM7WUFDSEQsT0FBT0MsUUFBUVYsSUFBSUksWUFBWTs7Ozs7O0lBUXZDSixJQUFJWSxVQUFVQyxTQUFTQyxNQUFNQztRQUN6QkM7WUFDSUM7OztJQUlSakIsSUFBSWtCLGdCQUFnQkwsU0FBU00sV0FBV0o7UUFDcENLLE9BQU9wQixJQUFJWTtRQUNYUyxLQUFLckIsSUFBSUssV0FBVzs7SUFHeEJMLElBQUlzQixVQUFVVCxTQUFTVSxLQUFLUjtRQUN4QlMsSUFBSTtRQUNKQyxVQUFVQyxFQUFFRCxTQUFVNUIsRUFBRSw2QkFBNkI4QjtRQUNyREM7WUFDRUMsa0NBQWtDOztRQUdwQ0MsU0FBUyxTQUFTQztZQUNkLElBQUlDLE9BQU9uQyxFQUFFa0MsRUFBRUUsUUFBUUMsS0FBSzs7WUFHNUJyQyxFQUFFLHNCQUFzQnNDLFFBQVE7WUFFaEMsSUFBSUgsUUFBUSxVQUFVO2dCQUNwQixJQUFJaEMsSUFBSW9DO21CQUNIO2dCQUNMLElBQUlwQyxJQUFJcUM7b0JBQWFDLFlBQVksSUFBSXRDLElBQUl1Qzs7OztRQUkvQ0MsWUFBWTtZQUNSLElBQUlDLFFBQVFDO1lBQ1pBLEtBQUtKLFdBQVdLLFFBQVFDLEtBQUs7Z0JBQ3pCSCxNQUFNSTs7O1FBSWRBLFFBQVE7WUFDSixJQUFJSixRQUFRQztZQUNaQSxLQUFLSixXQUFXUSxLQUFLLFNBQVMxQjtnQkFDMUIsSUFBSTJCLE9BQU8zQixNQUFNNEI7Z0JBQ2pCLElBQUlyQixPQUFPYyxNQUFNaEIsU0FBU3NCO2dCQUMxQk4sTUFBTVEsSUFBSUMsT0FBT3ZCOztZQUVyQixPQUFPZTs7O0lBSWYsSUFBSTFDLElBQUlzQjtRQUFTZ0IsWUFBWSxJQUFJdEMsSUFBSWtCOzs7OztJQU1yQ2xCLElBQUltRCxjQUFjdEMsU0FBU0MsTUFBTUM7UUFDN0JDO1lBQ0lvQyxTQUFTOzs7SUFJakJwRCxJQUFJdUMsb0JBQW9CMUIsU0FBU00sV0FBV0o7UUFDeENLLE9BQU9wQixJQUFJbUQ7UUFDWDlCLEtBQUtyQixJQUFJSyxXQUFXOztJQUd4QkwsSUFBSXFDLGNBQWN4QixTQUFTVSxLQUFLUjtRQUM1QnNDLFNBQVM7UUFDVEMsV0FBVztRQUNYN0IsVUFBVUMsRUFBRUQsU0FBVTVCLEVBQUUsZ0NBQWdDOEI7UUFDeERDO1lBQ0kyQix1QkFBdUI7WUFDdkJDLFdBQWE7O1FBR2pCQyxZQUFZO1lBQ1ZmLEtBQUtnQjs7O1FBSVA1QixTQUFTLFNBQVNDO1lBQ2QsSUFBSTRCLEtBQUs5RCxFQUFFa0MsRUFBRUUsUUFBUTJCLFFBQVEsaUJBQWlCMUIsS0FBSztZQUNuRCxJQUFJMkIsZUFBZW5CLEtBQUtKLFdBQVd3QixJQUFJSDtZQUN2Q2pCLEtBQUtnQjtZQUNMLElBQUkxRCxJQUFJK0Q7Z0JBQWlCM0MsT0FBT3lDOzs7UUFHcENyQixZQUFZO1lBQ1IsSUFBSUMsUUFBUUM7WUFDWkQsTUFBTVEsSUFBSWUsU0FBUztZQUNuQnRCLEtBQUtKLFdBQVdLLFFBQVFDLEtBQUs7Z0JBQ3pCSCxNQUFNSTs7O1FBSWRBLFFBQVE7WUFDSixJQUFJSixRQUFRQztZQUNaQSxLQUFLSixXQUFXUSxLQUFLLFNBQVMxQjtnQkFDMUIsSUFBSTJCLE9BQU8zQixNQUFNNEI7Z0JBQ2pCaEQsSUFBSVEsaUJBQWlCdUM7O2dCQUVyQkEsS0FBS2tCLFdBQVdsQixLQUFLbUIsZ0JBQWdCLGFBQWFuQixLQUFLbUIsZ0JBQWdCO2dCQUN2RSxJQUFJdkMsT0FBT2MsTUFBTWhCLFNBQVNzQjtnQkFDMUJOLE1BQU1RLElBQUlDLE9BQU92Qjs7WUFFckIsT0FBT2U7Ozs7O0lBTWYsSUFBSTFDLElBQUlxQztRQUFhQyxZQUFZLElBQUl0QyxJQUFJdUM7Ozs7O0lBTXpDdkMsSUFBSStELGtCQUFrQmxELFNBQVNVLEtBQUtSO1FBQ2hDc0MsU0FBUztRQUNUQyxXQUFXO1FBQ1g3QixVQUFVQyxFQUFFRCxTQUFVNUIsRUFBRSwwQkFBMEI4QjtRQUVsREM7WUFDSXVDLHFDQUFxQztZQUNyQ0MsdUJBQXVCO1lBQ3ZCWixXQUFhOztRQUdqQkMsWUFBWTtZQUNWZixLQUFLZ0I7O1FBR1BXLGFBQWEsU0FBU3RDO1lBQ3BCQSxFQUFFdUM7WUFDRixJQUFJQyxhQUFhN0IsS0FBS3RCLE1BQU0wQyxJQUFJO1lBQ2hDLElBQUlVLGlCQUFpQnhFLElBQUlNLGNBQWNpRTtZQUN2Q0UsT0FBT3ZFLFNBQVN3RSxPQUFPRjs7UUFHekJHLGlCQUFpQixTQUFTNUM7WUFDdEJXLEtBQUtnQjtZQUNMLElBQUkxRCxJQUFJcUM7Z0JBQWFDLFlBQVksSUFBSXRDLElBQUl1Qzs7O1FBRzdDQyxZQUFZO1lBQ1JFLEtBQUtPLElBQUllLFNBQVM7WUFDbEJ0QixLQUFLRzs7UUFHVEEsUUFBUTtZQUNKLElBQUlFLE9BQU9MLEtBQUt0QixNQUFNNEI7WUFDdEJoRCxJQUFJUSxpQkFBaUJ1QztZQUNyQkEsS0FBSzZCLGFBQWE3QixLQUFLOEIsVUFBVSxjQUFjO1lBQy9DLElBQUlsRCxPQUFPZSxLQUFLakIsU0FBU3NCO1lBQ3pCTCxLQUFLTyxJQUFJQyxPQUFPdkI7Ozs7OztJQVF4QjNCLElBQUk4RSxjQUFjakUsU0FBU0MsTUFBTUM7UUFDL0JNLEtBQUtyQixJQUFJSyxXQUFXOztJQUd0QkwsSUFBSW9DLGFBQWF2QixTQUFTVSxLQUFLUjtRQUM3QnNDLFNBQVM7UUFDVEMsV0FBVzs7UUFFWGxDLE9BQU8sSUFBSXBCLElBQUk4RTtRQUNmckQsVUFBVUMsRUFBRUQsU0FBVTVCLEVBQUUsb0JBQW9COEI7UUFFNUNDO1lBQ0U0QixXQUFhOztRQUdmQyxZQUFZO1lBQ1ZmLEtBQUtnQjs7UUFHUGxCLFlBQVk7WUFDVixJQUFJQyxRQUFRQztZQUNaQSxLQUFLTyxJQUFJZSxTQUFTO1lBQ2xCdEIsS0FBS3RCLE1BQU11QixRQUFRQyxLQUFLO2dCQUN0QkgsTUFBTUk7OztRQUlWQSxRQUFRO1lBQ04sSUFBSWtDLFNBQVNyQyxLQUFLdEIsTUFBTTRCLFNBQVMrQjtZQUNqQyxJQUFJcEQsT0FBT2UsS0FBS2pCLFNBQVNzRDtZQUN6QnJDLEtBQUtPLElBQUlDLE9BQU92Qjs7Ozs7O0lBU2hCM0IsSUFBSWdGLFVBQVVuRSxTQUFTQyxNQUFNQzs7SUFjN0JmLElBQUlpRixZQUFZLFNBQVNDO1FBQ3JCLElBQUlDLE9BQU9ELFNBQVNFLElBQUksU0FBU0M7WUFDN0IsT0FBT3JGLElBQUlPLE1BQU04RSxPQUFPOzs7SUFJaENyRixJQUFJc0YsZ0JBQWdCekUsU0FBU00sV0FBV0o7UUFDcENLLE9BQU9wQixJQUFJZ0Y7UUFDWE8sWUFBVywyQ0FDUDtRQUVKQyxNQUFNO1lBQ0YsSUFBSUMsT0FBTy9DO1lBQ1hBLEtBQUs2QyxTQUFTRyxRQUFRLFNBQVMxRDtnQkFDM0IsSUFBSXFELE9BQU8sSUFBSUksS0FBS3JFO2dCQUNwQmlFLEtBQUtoRSxNQUFNVztnQkFDWHFELEtBQUsxQztnQkFDTCIsImZpbGUiOiJob21lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgLy8gTmFtZXNwYWNlIHRoZSBvYmplY3RzXG4gICAgdmFyIGFwcCAgICAgICAgID0ge307XG4gICAgYXBwLmJhc2VVcmwgICAgID0gbG9jYXRpb24uaG9zdG5hbWUgPT09ICdsb2NhbGhvc3QnID8gJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAwMC8nIDogJ2h0dHBzOi8vd3d3LmNvbm5vcmFiZGVsbm9vci5jb20vJztcbiAgICBhcHAuaW1hZ2VQYXRoICAgPSBhcHAuYmFzZVVybCArICdpbWFnZXMvJztcbiAgICBhcHAuZGF0YVBhdGggICAgPSBhcHAuYmFzZVVybCArICdkYXRhLyc7XG4gICAgYXBwLnByb2plY3RQYXRoID0gYXBwLmJhc2VVcmwgKyAnYXBwL3Byb2plY3RzLyc7XG4gICAgYXBwLnN2ZyAgICAgICAgID0gYXBwLmJhc2VVcmwgKyAnbGliL3N2Zy8nO1xuXG5cbiAgICBhcHAuYnVpbGRJbWFnZUhlbHBlciA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgICAgICAvLyBDaGVjayB0aGF0IHRoZSBwYXRoIGlzIHNldCBhbmQgaXMgcmVsYXRpdmUsIGVsc2UgdXNlIGRlZmF1bHQuXG4gICAgICAgIGlmIChvYmplY3QuaW1hZ2UgJiYgb2JqZWN0LmltYWdlLmluZGV4T2YoJ2h0dHAnKSA9PSAtMSkge1xuICAgICAgICAgICAgb2JqZWN0LmltYWdlID0gYXBwLmltYWdlUGF0aCArIG9iamVjdC5pbWFnZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9iamVjdC5pbWFnZSA9IGFwcC5pbWFnZVBhdGggKyAnZGVmYXVsdC5wbmcnO1xuICAgICAgICB9XG4gICAgfVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vICAgIE5hdmlnYXRpb25cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgYXBwLk5hdkl0ZW0gPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuICAgICAgICBkZWZhdWx0czoge1xuICAgICAgICAgICAgaWNvbnM6IFtdXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGFwcC5OYXZDb2xsZWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuICAgICAgICBtb2RlbDogYXBwLk5hdkl0ZW0sXG4gICAgICAgIHVybDogYXBwLmRhdGFQYXRoICsgJ25hdi5qc29uJ1xuICAgIH0pO1xuXG4gICAgYXBwLk5hdlZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG4gICAgICAgIGVsOiAnLm5hdmlnYXRpb24nLFxuICAgICAgICB0ZW1wbGF0ZTogXy50ZW1wbGF0ZSggJCgnLml0ZW0tbmF2aWdhdGlvbi10ZW1wbGF0ZScpLmh0bWwoKSApLFxuICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICAnY2xpY2sgLm5hdi1pdGVtOm5vdCgubmF2LW5hbWUpJzogJ29uQ2xpY2snXG4gICAgICAgIH0sXG5cbiAgICAgICAgb25DbGljazogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdmFyIHBhdGggPSAkKGUudGFyZ2V0KS5kYXRhKCdwYXRoJyk7XG5cbiAgICAgICAgICAgIC8vIEZJWE1FIG5vdCBwcm91ZCBvZiB0aGlzXG4gICAgICAgICAgICAkKCcjY29udGVudCBkaXY6Zmlyc3QnKS50cmlnZ2VyKCd0ZXJtaW5hdGUnKTtcblxuICAgICAgICAgICAgaWYgKHBhdGggPT0gXCJyZXN1bWVcIikge1xuICAgICAgICAgICAgICBuZXcgYXBwLlJlc3VtZVZpZXc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBuZXcgYXBwLlByb2plY3RWaWV3KHtjb2xsZWN0aW9uOiBuZXcgYXBwLlByb2plY3RDb2xsZWN0aW9ufSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2NvcGUgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmZldGNoKCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzY29wZS5yZW5kZXIoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBzY29wZSA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbihtb2RlbCkge1xuICAgICAgICAgICAgICAgIHZhciBqc29uID0gbW9kZWwudG9KU09OKCk7XG4gICAgICAgICAgICAgICAgdmFyIGh0bWwgPSBzY29wZS50ZW1wbGF0ZShqc29uKTtcbiAgICAgICAgICAgICAgICBzY29wZS4kZWwuYXBwZW5kKGh0bWwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcbiAgICB9KTtcblxuICAgIG5ldyBhcHAuTmF2Vmlldyh7Y29sbGVjdGlvbjogbmV3IGFwcC5OYXZDb2xsZWN0aW9uKCl9KTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyAgICBQcm9qZWN0IExpc3Rcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgYXBwLlByb2plY3RJdGVtID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcbiAgICAgICAgZGVmYXVsdHM6IHtcbiAgICAgICAgICAgIHRhZ2xpbmU6IFwiXCJcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgYXBwLlByb2plY3RDb2xsZWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuICAgICAgICBtb2RlbDogYXBwLlByb2plY3RJdGVtLFxuICAgICAgICB1cmw6IGFwcC5kYXRhUGF0aCArICdwcm9qZWN0cy5qc29uJ1xuICAgIH0pO1xuXG4gICAgYXBwLlByb2plY3RWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuICAgICAgICB0YWdOYW1lOiAnZGl2JyxcbiAgICAgICAgY2xhc3NOYW1lOiAncHJvamVjdC1jb2xsZWN0aW9uJyxcbiAgICAgICAgdGVtcGxhdGU6IF8udGVtcGxhdGUoICQoJy5wcm9qZWN0LWNvbGxlY3Rpb24tdGVtcGxhdGUnKS5odG1sKCkgKSxcbiAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICAnY2xpY2sgLnByb2plY3QtaXRlbSc6ICdvbkNsaWNrJyxcbiAgICAgICAgICAgICd0ZXJtaW5hdGUnOiAncmVtb3ZlVmlldydcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVWaWV3OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIFdoZW4gd2UgY2xpY2sgYSBib3gsIHJlbW92ZSB0aGUgY3VycmVudCB2aWV3IGFuZCBsb2FkIHRoZSBmdWxsIGJveCB2aWV3XG4gICAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciBpZCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5wcm9qZWN0LWl0ZW0nKS5kYXRhKCdpZCcpO1xuICAgICAgICAgICAgdmFyIGNsaWNrZWRNb2RlbCA9IHRoaXMuY29sbGVjdGlvbi5nZXQoaWQpXG4gICAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgICAgICAgbmV3IGFwcC5JdGVtTGFuZGluZ1ZpZXcoe21vZGVsOiBjbGlja2VkTW9kZWx9KVxuICAgICAgICB9LFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNjb3BlID0gdGhpcztcbiAgICAgICAgICAgIHNjb3BlLiRlbC5hcHBlbmRUbygnI2NvbnRlbnQnKTtcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5mZXRjaCgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUucmVuZGVyKCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2NvcGUgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmVhY2goZnVuY3Rpb24obW9kZWwpIHtcbiAgICAgICAgICAgICAgICB2YXIganNvbiA9IG1vZGVsLnRvSlNPTigpO1xuICAgICAgICAgICAgICAgIGFwcC5idWlsZEltYWdlSGVscGVyKGpzb24pO1xuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBmZWF0dXJlZCBjbGFzc1xuICAgICAgICAgICAgICAgIGpzb24uZmVhdHVyZWQgPyBqc29uLmZlYXR1cmVkQ2xhc3MgPSAnZmVhdHVyZWQnIDoganNvbi5mZWF0dXJlZENsYXNzID0gJyc7XG4gICAgICAgICAgICAgICAgdmFyIGh0bWwgPSBzY29wZS50ZW1wbGF0ZShqc29uKTtcbiAgICAgICAgICAgICAgICBzY29wZS4kZWwuYXBwZW5kKGh0bWwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyBUT0RPIGNoZWNrIGlmIGl0IGlzIGFjdHVhbGx5IGJldHRlciB0byBpbnN0YW50aWF0ZSB0aGUgY29sbGVjdGlvbiBvYmplY3QgaGVyZSBhbmQgcGFzcyBpdCB0byB0aGUgdmlld1xuICAgIC8vIHZlcnN1cyBkZWNsYXJpbmcgYSBuZXcgY29sbGVjdGlvbiBwcm9wZXJ0eSBpbiB0aGUgdmlldyBvYmplY3RcbiAgICBuZXcgYXBwLlByb2plY3RWaWV3KHtjb2xsZWN0aW9uOiBuZXcgYXBwLlByb2plY3RDb2xsZWN0aW9ufSk7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gICAgSXRlbSBMYW5kaW5nXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgIGFwcC5JdGVtTGFuZGluZ1ZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG4gICAgICAgIHRhZ05hbWU6ICdkaXYnLFxuICAgICAgICBjbGFzc05hbWU6ICdpdGVtLWxhbmRpbmcnLFxuICAgICAgICB0ZW1wbGF0ZTogXy50ZW1wbGF0ZSggJCgnLml0ZW0tbGFuZGluZy10ZW1wbGF0ZScpLmh0bWwoKSApLFxuXG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgJ2NsaWNrIC5iYWNrLXRvLXByb2plY3QtY29sbGVjdGlvbic6ICdjbGlja0JhY2tCdXR0b24nLFxuICAgICAgICAgICAgJ2NsaWNrIC5sb2FkLXByb2plY3QnOiAnbG9hZFByb2plY3QnLFxuICAgICAgICAgICAgJ3Rlcm1pbmF0ZSc6ICdyZW1vdmVWaWV3J1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZVZpZXc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbG9hZFByb2plY3Q6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICB2YXIgcHJvamVjdFVybCA9IHRoaXMubW9kZWwuZ2V0KFwicHJvamVjdF91cmxcIik7XG4gICAgICAgICAgdmFyIGZ1bGxQcm9qZWN0VXJsID0gYXBwLnByb2plY3RQYXRoICsgcHJvamVjdFVybDtcbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGZ1bGxQcm9qZWN0VXJsO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNsaWNrQmFja0J1dHRvbjogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgICAgICAgIG5ldyBhcHAuUHJvamVjdFZpZXcoe2NvbGxlY3Rpb246IG5ldyBhcHAuUHJvamVjdENvbGxlY3Rpb259KTtcbiAgICAgICAgfSxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmFwcGVuZFRvKCcjY29udGVudCcpO1xuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGpzb24gPSB0aGlzLm1vZGVsLnRvSlNPTigpO1xuICAgICAgICAgICAgYXBwLmJ1aWxkSW1hZ2VIZWxwZXIoanNvbik7XG4gICAgICAgICAgICBqc29uLnZpc2l0X3RleHQgPSBqc29uLmlzX2dhbWUgPyBcIlBsYXkgR2FtZVwiIDogXCJWaWV3IEFwcFwiO1xuICAgICAgICAgICAgdmFyIGh0bWwgPSB0aGlzLnRlbXBsYXRlKGpzb24pO1xuICAgICAgICAgICAgdGhpcy4kZWwuYXBwZW5kKGh0bWwpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLyAgICBSZXN1bWVcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgIGFwcC5SZXN1bWVNb2RlbCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG4gICAgICB1cmw6IGFwcC5kYXRhUGF0aCArICdyZXN1bWUuanNvbidcbiAgICB9KTtcblxuICAgIGFwcC5SZXN1bWVWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuICAgICAgdGFnTmFtZTogJ2RpdicsXG4gICAgICBjbGFzc05hbWU6ICdyZXN1bWUtY29udGFpbmVyJyxcbiAgICAgIC8vT1BUSU1JWkUgY29uc3RydWN0IHdpdGggYSBtb2RlbCBzbyB0aGUgdmlldyBjYW4gYmUgcmV1c2VkXG4gICAgICBtb2RlbDogbmV3IGFwcC5SZXN1bWVNb2RlbCgpLFxuICAgICAgdGVtcGxhdGU6IF8udGVtcGxhdGUoICQoJy5yZXN1bWUtdGVtcGxhdGUnKS5odG1sKCkgKSxcblxuICAgICAgZXZlbnRzOiB7XG4gICAgICAgICd0ZXJtaW5hdGUnOiAncmVtb3ZlVmlldydcbiAgICAgIH0sXG5cbiAgICAgIHJlbW92ZVZpZXc6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgfSxcblxuICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzY29wZSA9IHRoaXM7XG4gICAgICAgIHRoaXMuJGVsLmFwcGVuZFRvKCcjY29udGVudCcpO1xuICAgICAgICB0aGlzLm1vZGVsLmZldGNoKCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICBzY29wZS5yZW5kZXIoKTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuXG4gICAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVzdW1lID0gdGhpcy5tb2RlbC50b0pTT04oKS5yZXN1bWU7XG4gICAgICAgIHZhciBodG1sID0gdGhpcy50ZW1wbGF0ZShyZXN1bWUpO1xuICAgICAgICB0aGlzLiRlbC5hcHBlbmQoaHRtbCk7XG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vICAgIFNWR3NcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuXG4gICAgICAgIGFwcC5zdmdJdGVtID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcblxuICAgICAgICAgICAgLy8gZmV0Y2g6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vICAgICAvLyBPUFRJTUlaRSB0aGlzLnBhdGggY291bGQgbGVhZCB0byBwcm9ibGVtc1xuICAgICAgICAgICAgLy8gICAgICQuZ2V0KHRoaXMuZ2V0KCdwYXRoJyksICd0ZXh0JykuZG9uZShmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgICAgLy8gICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgICAgIC8vICAgICB9KVxuICAgICAgICAgICAgLy8gfSxcbiAgICAgICAgICAgIC8vXG5cbiAgICAgICAgfSlcblxuICAgICAgICAvLyBDb252ZXJ0IHN2ZyBuYW1lcyB0byBmaWxlIHBhdGhzXG4gICAgICAgIGFwcC5zdmdIZWxwZXIgPSBmdW5jdGlvbihzdmdBcnJheSkge1xuICAgICAgICAgICAgdmFyIHN2Z3MgPSBzdmdBcnJheS5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBhcHAuc3ZnICsgaXRlbSArICcuc3ZnJztcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgICAgICBhcHAuc3ZnQ29sbGVjdGlvbiA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcbiAgICAgICAgICAgIG1vZGVsOiBhcHAuc3ZnSXRlbSxcbiAgICAgICAgICAgIHN2Z0l0ZW1zOiBbJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9saWIvc3ZnL2FsZXJ0LnN2ZycsXG4gICAgICAgICAgICAgICAgJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9saWIvc3ZnL2Fycm93LWRvd24uc3ZnJ10sXG5cbiAgICAgICAgICAgIHRlc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgICAgICB0aGlzLnN2Z0l0ZW1zLmZvckVhY2goZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IG5ldyBzZWxmLm1vZGVsO1xuICAgICAgICAgICAgICAgICAgICBpdGVtLnVybCA9IHBhdGg7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZmV0Y2goKTtcbiAgICAgICAgICAgICAgICAgICAgZGVidWdnZXI7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgIC8vIHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuICAgIC8vICAgICAkKCdbZGF0YS1pZD0xXScpLmNsaWNrKClcbiAgICAvLyB9LCAxMClcblxufSk7XG4iXX0=
