$(document).ready(function() {
  // Namespace the objects
  var app         = {};
  app.baseUrl     = location.hostname === 'localhost' ? 'http://localhost:8000/' : 'https://www.connorabdelnoor.com/';
  app.imagePath   = app.baseUrl + 'images/';
  app.dataPath    = app.baseUrl + 'data/';
  app.projectPath = app.baseUrl + 'app/projects/';
  app.svg         = app.baseUrl + 'lib/svg/';


  app.buildImageHelper = function(object) {
    // Check that the path is set and is relative, else use default.
    if (object.image && -1 == object.image.indexOf('http')) {
      object.image = app.imagePath + object.image;
    } else {
      object.image = app.imagePath + 'default.png';
    }
  }

  ////////////////////////////////////////////////
  //    Navigation
  ////////////////////////////////////////////////

  app.NavItem = Backbone.Model;

  app.NavCollection = Backbone.Collection.extend({
    model: app.NavItem,
    url: app.dataPath + 'nav.json'
  });

  app.NavView = Backbone.View.extend({
    el: '.navigation',
    template: _.template( $('.item-navigation-template').html() ),
    events: {
      'click .nav-item:not(.nav-name)': 'onClick'
    },

    onClick: function(e) {
      var path = $(e.target).data('path');

      // OPTIMIZE not proud of this
      $('#content div:first').trigger('terminate');

      if ("resume" == path) {
        new app.ResumeView;
      } else if ("posts" === path) {
        var allPosts = new app.WorkCollection;
        allPosts.filterPosts = true;
        new app.WorkView({collection: allPosts});
      } else if ("projects" === path) {
        var allProjects = new app.WorkCollection;
        allProjects.filterProjects = true;
        new app.WorkView({collection: allProjects});
      }
    },

    initialize: function() {
      var scope = this;
      this.collection.fetch().then(function() {
        scope.render();
      })
    },

    render: function() {
      var scope = this;
      this.collection.each(function(model) {
        var json = model.toJSON();
        var html = scope.template(json);
        scope.$el.append(html);
      });
      return this;
    },
  });

  new app.NavView({collection: new app.NavCollection()});

  ////////////////////////////////////////////////
  //    Project List
  ////////////////////////////////////////////////

  app.WorkItem = Backbone.Model.extend({
    defaults: {
      is_post:"true",
      name:"Default",
      date:"Begining of Time",
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
    url: app.dataPath + 'work.json',

    // defaults to filter projects projects
    filterWork: function(posts) {
      return _(this.filter(function(data) {
        return posts ? data.get("is_post") === "true" : data.get("is_post") !== "true";
      }));
    }

  });

  app.WorkView = Backbone.View.extend({
    tagName: 'div',
    className: 'work-collection',
    template: _.template( $('.work-collection-template').html() ),
    events: {
      'click .work-item': 'onClick',
      'terminate': 'removeView'
    },

    removeView: function() {
      this.remove();
    },

    // When we click a box, remove the current view and load the full box view
    onClick: function(e) {
      var id = $(e.target).closest('.work-item').data('id');
      var clickedModel = this.collection.get(id)
      this.remove();
      "true" === clickedModel.get('is_post') ? new app.PostLandingView({model: clickedModel}) : new app.ItemLandingView({model: clickedModel}) ;
    },

    initialize: function() {
      var scope = this;
      scope.$el.appendTo('#content');
      this.collection.fetch().then(function() {
        scope.render();
      })
    },

    render: function() {
      var collection = this.getCollectionWithFilters();
      var scope = this;
      collection.each(function(model) {
        var json = model.toJSON();
        app.buildImageHelper(json);
        // create post class
        json.workClass = ("true" === json.is_post) ? 'post' : 'project';
        var html = scope.template(json);
        scope.$el.append(html);
      });
      return this;
    },

    // this method adds a filter if it is added as an object property
    getCollectionWithFilters: function() {
      if (typeof this.collection.filterProjects !== 'undefined') {
        return this.collection.filterWork();
      } else if (typeof this.collection.filterPosts !== 'undefined') {
        return this.collection.filterWork(true);
      } else {
        return this.collection;
      }
    }
  })

  // TODO check if it is actually better to instantiate the collection object here and pass it to the view
  // versus declaring a new collection property in the view object
  new app.WorkView({collection: new app.WorkCollection});


  ////////////////////////////////////////////////
  //    Post Landing View
  ////////////////////////////////////////////////

  app.PostLandingView = Backbone.View.extend({
    tagName: 'div',
    className: 'post-landing',
    template: _.template( $('.post-landing-template').html() ),

    events: {
      'click .back-to-collection': 'clickBackButton',
      'terminate': 'removeView'
    },

    removeView: function() {
      this.remove();
    },

    clickBackButton: function(e) {
      this.remove();
      new app.WorkView({collection: new app.WorkCollection});
    },

    initialize: function() {
      this.$el.appendTo('#content');
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
    tagName: 'div',
    className: 'item-landing',
    template: _.template( $('.item-landing-template').html() ),

    events: {
      'click .back-to-collection': 'clickBackButton',
      'click .load-project': 'loadProject',
      'terminate': 'removeView'
    },

    removeView: function() {
      this.remove();
    },

    loadProject: function(e) {
      e.preventDefault()
      var projectUrl = this.model.get("project_url");
      var fullProjectUrl = app.projectPath + projectUrl;
      window.location.href = fullProjectUrl;
    },

    clickBackButton: function(e) {
      this.remove();
      new app.WorkView({collection: new app.WorkCollection});
    },

    initialize: function() {
      this.$el.appendTo('#content');
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
    url: app.dataPath + 'resume.json'
  });

  app.ResumeView = Backbone.View.extend({
    tagName: 'div',
    className: 'resume-container',
    //OPTIMIZE construct with a model so the view can be reused
    model: new app.ResumeModel(),
    template: _.template( $('.resume-template').html() ),

    events: {
      'terminate': 'removeView'
    },

    removeView: function() {
      this.remove();
    },

    initialize: function() {
      var scope = this;
      this.$el.appendTo('#content');
      this.model.fetch().then(function() {
        scope.render();
      });
    },

    render: function() {
      var resume = this.model.toJSON().resume;
      var html = this.template(resume);
      this.$el.append(html);
    }
  })

  ////////////////////////////////////////////////
  //    SVGs
  ////////////////////////////////////////////////


  app.svgItem = Backbone.Model.extend({

    // fetch: function () {
    //     // OPTIMIZE this.path could lead to problems
    //     $.get(this.get('path'), 'text').done(function(data) {
    //         debugger;
    //         return data;
    //     })
    // },
    //

  })

  // Convert svg names to file paths
  app.svgHelper = function(svgArray) {
    var svgs = svgArray.map(function(item) {
      return app.svg + item + '.svg';
    })
  }

  app.svgCollection = Backbone.Collection.extend({
    model: app.svgItem,
    svgItems: ['http://localhost:8000/lib/svg/alert.svg',
    'http://localhost:8000/lib/svg/arrow-down.svg'],

    test: function() {
      var self = this;
      this.svgItems.forEach(function(path) {
        var item = new self.model;
        item.url = path;
        item.fetch();
        debugger;
      })
    }
  })

  // setTimeout( function() {
  //     $('[data-id=1]').click()
  // }, 10)

});
