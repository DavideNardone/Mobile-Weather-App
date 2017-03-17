angular.module('ionic.weather', [
  'ionic',
  'ionic.weather.services',
  'ionic.weather.filters',
  'ionic.weather.directives',
  'ionic.weather.controllers',
  'ionic-sidemenu'
])

.constant('WUNDERGROUND_API_KEY', '1cc2d3de40fa5af0')

.constant('FORECASTIO_KEY', '4cd3c5673825a361eb5ce108103ee84a')

.constant('FLICKR_API_KEY', '504fd7414f6275eb5b657ddbfba80a2c')

  .config(function($stateProvider, $urlRouterProvider) {

    // $ionicConfigProvider.tabs.position('bottom');

    // $ionicConfigProvider.backButton.text('');

    // $ionicConfigProvider.views.swipeBackEnabled(false);

    $stateProvider

    //INTRO
    //   .state('tab', {
    //     url: "/tab",
    //     templateUrl: "templates/tabs.html",
    //     abstract: true
    //   })
    //
    //   .state('home', {
    //     url: '/home',
    //     templateUrl: "templates/home.html",
    //     controller: 'WeatherCtrl'
    //   })

      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
      })

      .state('app.search', {
        url: '/search',
        views: {
          'menuContent': {
            templateUrl: 'templates/search.html',
            controller: 'SearchCtrl'
          }
        }
      })

      .state('app.browse', {
        url: '/browse',
        views: {
          'menuContent': {
            templateUrl: 'templates/browse.html',
            controller: 'BrowseCtrl'
          }
        }
      })
      .state('app.playlists', {
        url: '/playlists',
        views: {
          'menuContent': {
            templateUrl: 'templates/home.html',
            controller: 'WeatherCtrl'
          }
        }
      })

      .state('app.single', {
        url: '/playlists/:playlistId',
        views: {
          'menuContent': {
            templateUrl: 'templates/playlist.html',
            controller: 'PlaylistCtrl'
          }
        }
      })


    ;

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/playlists');
  });
