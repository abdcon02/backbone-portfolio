<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/html">
    <head>
        <meta charset="utf-8">
        <title>Connor Abdelnoor</title>
        <link rel="stylesheet" href="../css/styles.css" type="text/css"/>
        <script src="lib/jquery-1.12.4.min.js"></script>
        <script src="lib/underscore-1.8.3.min.js"></script>
        <script src="lib/backbone-1.3.3-min.js"></script>
        <link href="https://fonts.googleapis.com/css?family=Roboto+Condensed:400,700|Roboto:400,700" rel="stylesheet">
    </head>
    <body>
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
                    <a href="#" class="icon icon-github">Github</a>
                </div>
            </div>
        </div>
    </body>
    <footer>
        <script type="text/template" class="item-navigation-template">
            <div class="nav-item">
                <span><%= name %></span>
            </div>
        </script>
        <script type="text/template" class="project-collection-template">
            <div data-id="<%= id %>" class="project-item <%= featuredClass %>">
                <div class="project-item-image">
                    <img src="<%= image %>" alt="project image" />
                </div>
                <div class='project-item-content'>
                    <h1><%= name %></h1>
                    <h4 class="tagline"><%= tagline %></h4>
                    <p><%= short_description %></p>
                </div>
            </div>
        </script>
        <script type="text/template" class="item-landing-template">
            <div class="landing-item">
                <div class="landing-image">
                    <img src="<%= image %>" alt="project image" />
                </div>
                <div class="landing-actions">
                    <h1><%= name %></h1>
                    <h4><%= tagline %></h4>
                    <div class="actions-container">
                        <div class="button load-project"><p>Play Game</p></div>
                        <div class="button load-github"><a href="<%= github_url %>" target="_blank">View Github Project</a></div>
                    </div>
                </div>
                <div class='landing-content'>
                    <div class="button back-to-project-collection"><p>Back</p></div>
                    <p><%= long_description %></p>
                </div>
            </div>
        </script>
        <script src="js/home.js"></script>
    </footer>
</html>
