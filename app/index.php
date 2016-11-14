<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/html">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>Connor Abdelnoor</title>
        <link rel="stylesheet" href="css/styles.css" type="text/css"/>
        <script src="lib/jquery-1.12.4.min.js"></script>
        <script src="lib/underscore-1.8.3.min.js"></script>
        <script src="lib/backbone-1.3.3-min.js"></script>
        <!-- OPTIMIZE host locally -->
        <link href="https://fonts.googleapis.com/css?family=Roboto+Condensed:400,700|Roboto:400,700" rel="stylesheet">
    </head>
    <body>
    <!-- OPTIMIZE there has to be a better way-->
    <?php //include_once __DIR__ . '/../lib/sprite.octicons.svg'; ?>
    <div class="page-container">
        <div class="header-container">
            <div class="navigation">
                <div class="nav-item nav-name">
                    <span>Connor Abdelnoor</span>
                </div>
            </div>
        </div>
        <div class="body">
            <div class="content-container">
                <div id="content" class="content-wrapper"></div>
            </div>
            <div class="footer">
                <div class="social-icons">
                    <a href="#" class="icon icon-linkedin">Linkedin</a>
                    <a href="#" class="octicon octicon-mark-github"></a>
                    <span class="mega-octicon octicon-mark-github"></span>
                </div>
            </div>
        </div>
    </body>

    <footer>
        <!--  Nav Template -->
        <script type="text/template" class="item-navigation-template">
            <div class="nav-item">
                <span data-path="<%= path %>"><%= name %></span>
            </div>
        </script>
        <!--  Worl Landing Template -->
        <script type="text/template" class="work-collection-template">
            <div data-id="<%= id %>" class="work-item <%= featuredClass %>">
                <div class="work-item-image">
                    <img src="<%= image %>" alt="work image" />
                </div>
                <div class='work-item-content'>
                    <h1><%= name %></h1>
                    <h4 class="tagline"><%= tagline %></h4>
                    <p><%= short_description %></p>
                </div>
            </div>
        </script>
        <!--  Post Landing Template -->
        <script type="text/template" class="post-landing-template">
            <div class="landing-post">
                <div class="post-content">
                    <%= title %>
                    <%= content %>
                </div>
                <div class="post-actions">
                    <div class="button back-to-collection">
                        <a href="#">Back</a>
                    </div>
                </div>
            </div>
        </script>
        <!--  Item Landing Template -->
        <script type="text/template" class="item-landing-template">
            <div class="landing-item">
                <div class="landing-top">
                    <h1><%= name %></h1>
                    <h4><%= tagline %></h4>
                </div>

                <div class="landing-image">
                    <img src="<%= image %>" alt="project image" />
                </div>
                <div class="landing-content">
                    <div class="landing-actions">
                        <div class="button load-project"><a href="#"><%= visit_text %></a></div>
                        <div class="button load-github"><a href="<%= github_url %>" target="_blank">View on Github</a></div>
                    </div>
                    <div class='landing-info'>
                        <p><%= long_description %></p>
                        <div class="button back-to-collection">
                            <a href="#">Back</a>
                        </div>
                    </div>
                </div>
            </div>
        </script>
        <!--  Resume Template -->
        <script type="text/template" class="resume-template">
            <div class="banner">
                <p>
                    <%= message %>
                </p>
            </div>
            <div class="left-container">
                <div class="resume-section">
                    <h4>Stack</h4>
                    <% _.each(stack, function(item) { %>
                        <span><%= item %></span>
                    <% }); %>
                </div>
                <div class="resume-section">
                    <h4>Aspirations</h4>
                    <% _.each(aspirations, function(item) { %>
                        <span><%= item %></span>
                    <% }); %>
                </div>
                <div class="resume-section">
                    <h4>Traits</h4>
                    <ul>
                        <% _.each(traits, function(item) { %>
                            <li><%= item %></li>
                        <% }); %>
                    </ul>
                </div>
                <div class="resume-section">
                    <h4>Education</h4>
                    <% _.each(education, function(item) { %>
                        <p><span><%= item.name %></span> &#124; <span><%= item.date %></span></p>
                        <p><%= item.focus %></p>
                    <% }); %>
                </div>
            </div>
            <div class="right-container">
                <div class="resume-section">
                    <h4>Work Experience</h4>
                    <% _.each(experience, function(item) { %>
                        <div>
                            <p><span><%= item.company %></span> &#124; <span><%= item.position %></span> &#124; <span><%= item.date %></span></p>
                            <p><%= item.description %></p>
                            <ul>
                                <% _.each(item.duties, function(duty) { %>
                                    <li><%= duty %></li>
                                <% }) %>
                            </ul>
                        </div>
                    <% }); %>
                </div>
                <div class="resume-section">
                    <% _.each(past_experience, function(item) { %>
                        <p><span><%= item.position %></span> &#124; <span><%= item.company %></span> &#124; <span><%= item.date %></span></p>
                    <% }) %>
                </div>
            </div>
        </script>
        <script src="js/home.js"></script>
    </footer>
</html>
