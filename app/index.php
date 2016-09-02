<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/html">
    <head>
        <meta charset="utf-8">
        <title>Connor Abdelnoor</title>
        <link rel="stylesheet" href="../css/styles.css" type="text/css"/>
        <script src="lib/jquery-1.12.4.min.js"></script>
        <script src="lib/underscore-1.8.3.min.js"></script>
        <script src="lib/backbone-1.3.3-min.js"></script>
    </head>
    <body>
        <div class="page-container">
            <div class="top-header"></div>
            <div class="body">
                <div class="project-collection-container">
                    <div class="project-collection">
                        <script type="text/template" class="project-collection-template">
                                <div class="project-item <%= featuredClass %>">
                                    <a href="<%= url %>">
                                        <div class="project-item-image">
                                            <img src="<%= image %>" alt="project image" />
                                        </div>
                                        <div class='project-item-content'>
                                            <h1><%= name %></h1>
                                            <p><%= description %></p>
                                        </div>
                                    </a>
                                </div>
                            </script>
        
                        </div>
                    </div>
                </div>
            <div class="footer">footer</div>
        </div>
    </body>
    <footer>
        <script src="js/home.js"></script>
    </footer>
</html>
