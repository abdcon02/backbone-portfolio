// TODO - document ready was so 2010. Just load the JS in the footer for a faster response time.
$(document).ready(function() {
    // Namespace the objects
    var app = {};
    app.baseUrl = "http://localhost:8000/";
    app.imagePath = app.baseUrl + "images/";
    app.dataPath = app.baseUrl + "data/";
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
    app.ProjectItem = Backbone.Model.extend({});
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
            "click .back-to-project-collection": "clickBackButton"
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhvbWUuanMiXSwibmFtZXMiOlsiJCIsImRvY3VtZW50IiwicmVhZHkiLCJhcHAiLCJiYXNlVXJsIiwiaW1hZ2VQYXRoIiwiZGF0YVBhdGgiLCJidWlsZEltYWdlIiwib2JqZWN0IiwiaW1hZ2UiLCJ1bmRlZmluZWQiLCJpbmRleE9mIiwiTmF2SXRlbSIsIkJhY2tib25lIiwiTW9kZWwiLCJOYXZMaXN0Q29sbGVjdGlvbiIsIkNvbGxlY3Rpb24iLCJleHRlbmQiLCJtb2RlbCIsInVybCIsIk5hdkxpc3RWaWV3IiwiVmlldyIsImVsIiwiaW5pdGlhbGl6ZSIsInNjb3BlIiwidGhpcyIsImNvbGxlY3Rpb24iLCJmZXRjaCIsInN1Y2Nlc3MiLCJyZW5kZXIiLCJlYWNoIiwib3V0cHV0IiwiaHRtbCIsImdldCIsIiRlbCIsImFwcGVuZCIsIlByb2plY3RJdGVtIiwiUHJvamVjdENvbGxlY3Rpb24iLCJQcm9qZWN0VmlldyIsInRhZ05hbWUiLCJjbGFzc05hbWUiLCJ0ZW1wbGF0ZSIsIl8iLCJldmVudHMiLCJjbGljayIsIm9uQ2xpY2siLCJlIiwiaWQiLCJ0YXJnZXQiLCJjbG9zZXN0IiwiZGF0YSIsImNsaWNrZWRNb2RlbCIsInJlbW92ZSIsIkl0ZW1MYW5kaW5nVmlldyIsImFwcGVuZFRvIiwidGhlbiIsImpzb24iLCJ0b0pTT04iLCJmZWF0dXJlZCIsImRlc2NyaXB0aW9uIiwibG9uZ19kZXNjcmlwdGlvbiIsImZlYXR1cmVkQ2xhc3MiLCJzaG9ydF9kZXNjcmlwdGlvbiIsIlByb2plY3RJdGVtQ29sbGVjdGlvbiIsImNsaWNrIC5iYWNrLXRvLXByb2plY3QtY29sbGVjdGlvbiIsImNsaWNrQmFja0J1dHRvbiIsInNldFRpbWVvdXQiXSwibWFwcGluZ3MiOiI7QUFFQUEsRUFBRUMsVUFBVUMsTUFBTTs7SUFFZCxJQUFJQztJQUNKQSxJQUFJQyxVQUFVO0lBQ2RELElBQUlFLFlBQVlGLElBQUlDLFVBQVU7SUFDOUJELElBQUlHLFdBQVdILElBQUlDLFVBQVU7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T0FBT0g7OztJQUl4QmtDLFdBQVk7UUFDUmxFLEVBQUUsZUFBZTRDO09BQ2xCIiwiZmlsZSI6ImhvbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUT0RPIC0gZG9jdW1lbnQgcmVhZHkgd2FzIHNvIDIwMTAuIEp1c3QgbG9hZCB0aGUgSlMgaW4gdGhlIGZvb3RlciBmb3IgYSBmYXN0ZXIgcmVzcG9uc2UgdGltZS5cblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgLy8gTmFtZXNwYWNlIHRoZSBvYmplY3RzXG4gICAgdmFyIGFwcCA9IHt9O1xuICAgIGFwcC5iYXNlVXJsID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAwMC8nXG4gICAgYXBwLmltYWdlUGF0aCA9IGFwcC5iYXNlVXJsICsgJ2ltYWdlcy8nO1xuICAgIGFwcC5kYXRhUGF0aCA9IGFwcC5iYXNlVXJsICsgJ2RhdGEvJztcblxuICAgIFxuICAgIGFwcC5idWlsZEltYWdlID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgICAgIGlmIChvYmplY3QuaW1hZ2UgIT09IHVuZGVmaW5lZCAmJiBvYmplY3QuaW1hZ2UuaW5kZXhPZignaHR0cCcpID09IC0xKSB7XG4gICAgICAgICAgICBvYmplY3QuaW1hZ2UgPSBhcHAuaW1hZ2VQYXRoICsgb2JqZWN0LmltYWdlO1xuICAgICAgICB9XG4gICAgfVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vICAgIE5hdmlnYXRpb25cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgYXBwLk5hdkl0ZW0gPSBCYWNrYm9uZS5Nb2RlbDtcblxuICAgIGFwcC5OYXZMaXN0Q29sbGVjdGlvbiA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcbiAgICAgICAgbW9kZWw6IGFwcC5OYXZJdGVtLFxuICAgICAgICB1cmw6IGFwcC5kYXRhUGF0aCArICduYXYuanNvbidcbiAgICB9KTtcblxuICAgIGFwcC5OYXZMaXN0VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcbiAgICAgICAgZWw6IFwiLnRvcC1oZWFkZXJcIixcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBzY29wZSA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZmV0Y2goe1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5yZW5kZXIoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBzY29wZSA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZWFjaChmdW5jdGlvbihtb2RlbCkge1xuICAgICAgICAgICAgICAgIHNjb3BlLm91dHB1dChtb2RlbClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb3V0cHV0OiBmdW5jdGlvbihtb2RlbCkge1xuICAgICAgICAgICAgdmFyIGh0bWwgPSBcIjxkaXY+XCIgKyBtb2RlbC5nZXQoXCJuYW1lXCIpICsgXCI8L2Rpdj5cIjtcbiAgICAgICAgICAgIHRoaXMuJGVsLmFwcGVuZChodG1sKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgbmV3IGFwcC5OYXZMaXN0Vmlldyh7Y29sbGVjdGlvbjogbmV3IGFwcC5OYXZMaXN0Q29sbGVjdGlvbigpfSk7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gICAgUHJvamVjdCBMaXN0XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgIGFwcC5Qcm9qZWN0SXRlbSA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG5cbiAgICB9KTtcblxuICAgIGFwcC5Qcm9qZWN0Q29sbGVjdGlvbiA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcbiAgICAgICAgbW9kZWw6IGFwcC5Qcm9qZWN0SXRlbSxcbiAgICAgICAgdXJsOiBhcHAuZGF0YVBhdGggKyAncHJvamVjdHMuanNvbidcbiAgICB9KTtcblxuICAgIGFwcC5Qcm9qZWN0VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcbiAgICAgICAgdGFnTmFtZTogJ2RpdicsXG4gICAgICAgIGNsYXNzTmFtZTogJ3Byb2plY3QtY29sbGVjdGlvbicsXG4gICAgICAgIHRlbXBsYXRlOiBfLnRlbXBsYXRlKCAkKCcucHJvamVjdC1jb2xsZWN0aW9uLXRlbXBsYXRlJykuaHRtbCgpICksXG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICdjbGljayc6ICdvbkNsaWNrJ1xuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgLy8gV2hlbiB3ZSBjbGljayBhIGJveCwgcmVtb3ZlIHRoZSBjdXJyZW50IHZpZXcgYW5kIGxvYWQgdGhlIGZ1bGwgYm94IHZpZXdcbiAgICAgICAgb25DbGljazogZnVuY3Rpb24oZSkge1xuXG4gICAgICAgICAgICB2YXIgaWQgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcucHJvamVjdC1pdGVtJykuZGF0YSgnaWQnKTtcbiAgICAgICAgICAgIHZhciBjbGlja2VkTW9kZWwgPSB0aGlzLmNvbGxlY3Rpb24uZ2V0KGlkKVxuICAgICAgICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgICAgICAgIG5ldyBhcHAuSXRlbUxhbmRpbmdWaWV3KHttb2RlbDogY2xpY2tlZE1vZGVsfSlcbiAgICAgICAgfSxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBzY29wZSA9IHRoaXM7XG4gICAgICAgICAgICBzY29wZS4kZWwuYXBwZW5kVG8oJyNjb250ZW50Jyk7XG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZmV0Y2goKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNjb3BlLnJlbmRlcigpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNjb3BlID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGpzb24gPSBtb2RlbC50b0pTT04oKTtcbiAgICAgICAgICAgICAgICBhcHAuYnVpbGRJbWFnZShqc29uKTtcbiAgICAgICAgICAgICAgICBpZiAoanNvbi5mZWF0dXJlZCkge1xuICAgICAgICAgICAgICAgICAgICBqc29uLmRlc2NyaXB0aW9uID0ganNvbi5sb25nX2Rlc2NyaXB0aW9uO1xuICAgICAgICAgICAgICAgICAgICBqc29uLmZlYXR1cmVkQ2xhc3MgPSAnZmVhdHVyZWQnO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGpzb24uZGVzY3JpcHRpb24gPSBqc29uLnNob3J0X2Rlc2NyaXB0aW9uO1xuICAgICAgICAgICAgICAgICAgICBqc29uLmZlYXR1cmVkQ2xhc3MgPSAnJztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgaHRtbCA9IHNjb3BlLnRlbXBsYXRlKGpzb24pO1xuICAgICAgICAgICAgICAgIHNjb3BlLiRlbC5hcHBlbmQoaHRtbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfSlcblxuICAgIC8vIFRPRE8gY2hlY2sgaWYgaXQgaXMgYWN0dWFsbHkgYmV0dGVyIHRvIGluc3RhbnRpYXRlIHRoZSBjb2xsZWN0aW9uIG9iamVjdCBoZXJlIGFuZCBwYXNzIGl0IHRvIHRoZSB2aWV3XG4gICAgLy8gdmVyc3VzIGRlY2xhcmluZyBhIG5ldyBjb2xsZWN0aW9uIHByb3BlcnR5IGluIHRoZSB2aWV3IG9iamVjdFxuICAgIGFwcC5Qcm9qZWN0SXRlbUNvbGxlY3Rpb24gPSBuZXcgYXBwLlByb2plY3RDb2xsZWN0aW9uO1xuICAgIG5ldyBhcHAuUHJvamVjdFZpZXcoe2NvbGxlY3Rpb246IGFwcC5Qcm9qZWN0SXRlbUNvbGxlY3Rpb259KTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyAgICBJdGVtIExhbmRpbmdcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgYXBwLkl0ZW1MYW5kaW5nVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcbiAgICAgICAgdGFnTmFtZTogJ2RpdicsXG4gICAgICAgIGNsYXNzTmFtZTogJ2l0ZW0tbGFuZGluZycsXG4gICAgICAgIHRlbXBsYXRlOiBfLnRlbXBsYXRlKCAkKCcuaXRlbS1sYW5kaW5nLXRlbXBsYXRlJykuaHRtbCgpICksXG5cbiAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICAnY2xpY2sgLmJhY2stdG8tcHJvamVjdC1jb2xsZWN0aW9uJzogJ2NsaWNrQmFja0J1dHRvbidcbiAgICAgICAgfSxcblxuICAgICAgICBjbGlja0JhY2tCdXR0b246IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgICAgICBuZXcgYXBwLlByb2plY3RWaWV3KHtjb2xsZWN0aW9uOiBhcHAuUHJvamVjdEl0ZW1Db2xsZWN0aW9ufSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5hcHBlbmRUbygnI2NvbnRlbnQnKTtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBqc29uID0gdGhpcy5tb2RlbC50b0pTT04oKTtcbiAgICAgICAgICAgIGFwcC5idWlsZEltYWdlKGpzb24pO1xuICAgICAgICAgICAgdmFyIGh0bWwgPSB0aGlzLnRlbXBsYXRlKGpzb24pO1xuICAgICAgICAgICAgdGhpcy4kZWwuYXBwZW5kKGh0bWwpO1xuICAgICAgICB9XG4gICAgfSlcblxuICAgIHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCdbZGF0YS1pZD0xXScpLmNsaWNrKClcbiAgICB9LCAxMClcblxuXG4gICAgLy8gdmFyIGhlbGxvID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuICAgIC8vXG4gICAgLy8gICAgIGVsOiAnI2NvbnRhaW5lcicsXG4gICAgLy9cbiAgICAvLyAgICAgdGVtcGxhdGU6IF8udGVtcGxhdGUoXCI8aDE+IEhlbGxvIDwlPSBhbnl0aGluZyAlPiA8L2gxPlwiKSxcbiAgICAvL1xuICAgIC8vICAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpe1xuICAgIC8vICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAvLyAgICAgfSxcbiAgICAvL1xuICAgIC8vICAgICByZW5kZXI6IGZ1bmN0aW9uKCl7XG4gICAgLy8gICAgICAgICB0aGlzLiRlbC5odG1sKHRoaXMudGVtcGxhdGUoe2FueXRoaW5nOiAndGVzdGVyJ30pKTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH0pO1xuICAgIC8vXG4gICAgLy8gdmFyIGhlbGxvVmlldyA9IG5ldyBoZWxsbygpO1xuXG59KTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
