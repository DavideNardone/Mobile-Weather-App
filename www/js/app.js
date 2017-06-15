angular.module('ionic.weather', [
  'ionic',
  'ionic.weather.services',
  'ionic.weather.filters',
  'ionic.weather.directives',
  'ngCordova',
  'ionic.weather.controllers',
  'ionic-sidemenu'
])

.constant('WUNDERGROUND_API_KEY', '1cc2d3de40fa5af0')

.constant('FORECASTIO_KEY', '4cd3c5673825a361eb5ce108103ee84a')

.constant('FLICKR_API_KEY', '504fd7414f6275eb5b657ddbfba80a2c')

  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {

      //Check the position with $cordovaGeolocation. This one is just a function
      cordova.navigator.geolocation.getCurrentPosition()


      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })


  .config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

    // $ionicConfigProvider.tabs.position('bottom');

    $ionicConfigProvider.backButton.text('');

    // $ionicConfigProvider.views.swipeBackEnabled(false);

    $stateProvider

      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'sideMenuCtrl'
      })

      .state('app.home', {
        url: '/home',
        views: {
          'menuContent': {
            templateUrl: 'templates/home.html',
            controller: 'WeatherCtrl'
          }
        }
      })

      .state('app.daily_forecast', {
        url: '/daily_forecast/{obj:json}',
        views: {
          'menuContent': {
            templateUrl: 'templates/daily_forecast.html',
            controller: 'DailyWeatherCtrl',
            params: {obj: null}
          }
        }
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


      .state('app.credits', {
        url: "/credits",
        views: {
          'menuContent': {
            templateUrl: "templates/credits.html",
            controller: 'CreditsCtrl'
          }
        }
      })


      // .state('app.browse', {
      //   url: '/browse',
      //   views: {
      //     'menuContent': {
      //       templateUrl: 'templates/browse.html',
      //       controller: 'BrowseCtrl'
      //     }
      //   }
      // })


      // .state('app.single', {
      //   url: '/playlists/:playlistId',
      //   views: {
      //     'menuContent': {
      //       templateUrl: 'templates/playlist.html',
      //       controller: 'PlaylistCtrl'
      //     }
      //   }
      // })


    ;

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/home');
  });
