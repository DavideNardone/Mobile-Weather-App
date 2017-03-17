angular.module('ionic.weather.controllers',[])
  // .constant('WUNDERGROUND_API_KEY', '1cc2d3de40fa5af0')
  //
  // .constant('FORECASTIO_KEY', '4cd3c5673825a361eb5ce108103ee84a')
  //
  // .constant('FLICKR_API_KEY', '504fd7414f6275eb5b657ddbfba80a2c')
  //
  // .filter('int', function() {
  //   return function(v) {
  //     return parseInt(v) || '';
  //   };
  // })

  .controller('WeatherCtrl', function($scope, $timeout, $rootScope, Weather, Geo, Flickr, $ionicModal, $ionicPlatform) {
    var _this = this;

    $ionicPlatform.ready(function() {
      // Hide the status bar
      if(window.StatusBar) {
        StatusBar.hide();
      }
    });

    $scope.activeBgImageIndex = 0;

    $scope.showSettings = function() {
      if(!$scope.settingsModal) {
        // Load the modal from the given template URL
        $ionicModal.fromTemplateUrl('settings.html', function(modal) {
          $scope.settingsModal = modal;
          $scope.settingsModal.show();
        }, {
          // The animation we want to use for the modal entrance
          animation: 'slide-in-up'
        });
      } else {
        $scope.settingsModal.show();
      }
    };


    this.getBackgroundImage = function(lat, lng, locString) {
      Flickr.search(locString, lat, lng).then(function(resp) {
        var photos = resp.photos;
        if(photos.photo.length) {
          $scope.bgImages = photos.photo;
          _this.cycleBgImages();
        }
      }, function(error) {
        console.error('Unable to get Flickr images', error);
      });
    };

    this.getCurrent = function(lat, lng, locString) {
      Weather.getAtLocation(lat, lng).then(function(resp) {
        /*
         if(resp.response && resp.response.error) {
         alert('This Wunderground API Key has exceeded the free limit. Please use your own Wunderground key');
         return;
         }
         */
        $scope.current = resp.data;
        console.log('GOT CURRENT', $scope.current);
        $rootScope.$broadcast('scroll.refreshComplete');
      }, function(error) {
        alert('Unable to get current conditions');
        console.error(error);
      });
    };

    this.cycleBgImages = function() {
      $timeout(function cycle() {
        if($scope.bgImages) {
          $scope.activeBgImage = $scope.bgImages[$scope.activeBgImageIndex++ % $scope.bgImages.length];
        }
        //$timeout(cycle, 10000);
      });
    };

    $scope.refreshData = function() {
      Geo.getLocation().then(function(position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;

        Geo.reverseGeocode(lat, lng).then(function(locString) {
          $scope.currentLocationString = locString;
          _this.getBackgroundImage(lat, lng, locString.replace(', ', ','));
        });
        _this.getCurrent(lat, lng);
      }, function(error) {
        alert('Unable to get current location: ' + error);
      });
    };

    $scope.refreshData();
  })

  .controller('SettingsCtrl', function($scope, Settings) {
    $scope.settings = Settings.getSettings();

    // Watch deeply for settings changes, and save them
    // if necessary
    $scope.$watch('settings', function(v) {
      Settings.save();
    }, true);

    $scope.closeSettings = function() {
      $scope.modal.hide();
    };

  })





  .controller('AppCtrl', function($scope, $ionicModal, $timeout) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
      $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function() {
      $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function() {
      console.log('Doing login', $scope.loginData);

      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function() {
        $scope.closeLogin();
      }, 1000);
    };
  })

  .controller('PlaylistsCtrl', function($scope) {

    $scope.theme = 'ionic-sidemenu-blue';
    $scope.playlists = [{
      title: 'Reggae',
      id: 1
    }, {
      title: 'Chill',
      id: 2
    }, {
      title: 'Dubstep',
      id: 3
    }, {
      title: 'Indie',
      id: 4
    }, {
      title: 'Rap',
      id: 5
    }, {
      title: 'Cowbell',
      id: 6
    }];
  })

  .controller('PlaylistCtrl', function($scope, $stateParams) {})

  .controller('SearchCtrl', function($scope) {
    $scope.playlists = [{
      title: 'Reggae',
      id: 1
    }, {
      title: 'Chill',
      id: 2
    }, {
      title: 'Dubstep',
      id: 3
    }, {
      title: 'Indie',
      id: 4
    }, {
      title: 'Rap',
      id: 5
    }, {
      title: 'Cowbell',
      id: 6
    }];
  })
  .controller('BrowseCtrl', function($scope) {
    $scope.playlists = [{
      title: 'Reggae',
      id: 1
    }, {
      title: 'Chill',
      id: 2
    }, {
      title: 'Dubstep',
      id: 3
    }, {
      title: 'Indie',
      id: 4
    }, {
      title: 'Rap',
      id: 5
    }, {
      title: 'Cowbell',
      id: 6
    }];
  })

  .controller('SideMenuCtrl', function($scope) {

    $scope.theme = 'ionic-sidemenu-stable';

    $scope.tree =
      [{
        id: 1,
        level: 0,
        name: 'Maps',
        icon: "ion-map",
        items: [{
          id: 10,
          level: 1,
          name: 'Marker',
          icon: "ion-ios-location",
          items: [{
            id: 100,
            name: 'Images',
            level: 2,
            icon: "ion-image",
            state: 'app.search',
            items: null
          }, {
            id: 101,
            level: 2,
            name: 'User',
            icon: "ion-person",
            state: 'app.browse',
            items: null
          }]
        }]
      }, {
        id: 2,
        name: "Buy",
        icon: "ion-card",
        level: 0,
        state: 'app.playlists'
      }];
  })




;