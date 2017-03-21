angular.module('ionic.weather.controllers',[])


  .controller('WeatherCtrl', function($scope, $timeout, $rootScope, Weather, Geo, Flickr, $ionicModal, $ionicLoading, $ionicPlatform, $ionicPopup, $http) {
    var _this = this;

    // $ionicPlatform.ready(function() {
    //   // Hide the status bar
    //   if(window.StatusBar) {
    //     StatusBar.hide();
    //   }
    // });

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

    this.getInfoPlace = function(lat,lng){

      //retrieve the closest places based on the lat and lng coords
      var q_url = 'http://192.167.9.103:5050/places/search/bycoords/'+lat+'/'+lng+'?filter=com';
      console.log(lat);
      console.log(lng);
      console.log(q_url);

      $http({
        method :'GET',
        url: q_url,
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .success(function (data, status) {

          $scope.place_id = data.places[0].id;
          $scope.place_name = data.places[0].long_name.it;
          console.log($scope.place_id);
          console.log($scope.place_name);
          // console.log(data.places[0].long_name.it);

          $scope.currentLocationString = data.places[0].long_name.it;

          //retrieve bgd_image based on the current position
          _this.getBackgroundImage(lat, lng, $scope.currentLocationString);
          //_this.getCurrent(lat, lng); temperatura da forecast.io

          console.log($scope.place_id);

          //wrf3, ww33, etc
          _this.getDataModel("wrf3",$scope.place_id);

        })
        .error(function (data, status) {
          alert('Connection error: ' + status);
        });

    };

    this.getDataModel = function(model,place){

      //retrieve forecast data from ww
      var f_url = 'http://192.167.9.103:5050/products/'+model+'/timeseries/'+place;
      console.log(f_url);

      $http({
        method :'GET',
        url: f_url,
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .success(function (data, status) {

          console.log(data.timeseries.runs.time[0].t2c);
          $scope.currentTemp = data.timeseries.runs.time[0].t2c;
          $scope.hourly_forecast = data.timeseries.runs;

          var day = new Date();
          var hour = day.getHours();

          var init = 24 - hour;

          $scope.daily_forecast = [];


          var info_day = {};

          for (var i=init; i < (144 - hour); i=i+24) {

            var info_day = {};

            info_day.icon = data.timeseries.runs.time[i+12].icon;

            //FIXME: convert to date with format YYYY-MM-DD, then convert to string again
            info_day.date = (data.timeseries.runs.time[i+1].date).slice(0,8);


            console.log(info_day.date);

            var min = 99999999;
            var max = -9999999;

            for (var j = 0; j < 24; j++) {
              var val_temp =  parseFloat(data.timeseries.runs.time[i+j].t2c);


              if(val_temp < min)
                min = val_temp;

              if (val_temp > max)
                max = val_temp;
            }

            info_day.min = min;
            info_day.max = max;
            // info_day.icon =
            // console.log("min:"+min);
            // console.log("max:"+max);

            $scope.daily_forecast.push(info_day);
            // $scope.daily_forecast.min_arr.push(min);
            // $scope.daily_forecast.max_arr.push(max);

          }

          console.log($scope.daily_forecast);



        })
        .error(function (data, status) {
          alert('Connection error: ' + status);
        });

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

    // this.getCurrent = function(lat, lng, locString) {
    //   Weather.getAtLocation(lat, lng).then(function(resp) {
    //     /*
    //      if(resp.response && resp.response.error) {
    //      alert('This Wunderground API Key has exceeded the free limit. Please use your own Wunderground key');
    //      return;
    //      }
    //      */
    //     $scope.current = resp.data;
    //     console.log('GOT CURRENT', $scope.current);
    //     $rootScope.$broadcast('scroll.refreshComplete');
    //   }, function(error) {
    //     alert('Unable to get current conditions');
    //     console.error(error);
    //   });
    // };


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

        _this.getInfoPlace(lat,lng);

        $rootScope.$broadcast('scroll.refreshComplete');


        // Geo.reverseGeocode(lat, lng).then(function(locString) {
        //   $scope.currentLocationString = locString;
        //   _this.getBackgroundImage(lat, lng, locString.replace(', ', ','));
        // });
        // _this.getCurrent(lat, lng);
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


  // .controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  //
  //   // With the new view caching in Ionic, Controllers are only called
  //   // when they are recreated or on app start, instead of every page change.
  //   // To listen for when this page is active (for example, to refresh data),
  //   // listen for the $ionicView.enter event:
  //   //$scope.$on('$ionicView.enter', function(e) {
  //   //});
  //
  //   // Form data for the login modal
  //   $scope.loginData = {};
  //
  //   // Create the login modal that we will use later
  //   $ionicModal.fromTemplateUrl('templates/login.html', {
  //     scope: $scope
  //   }).then(function(modal) {
  //     $scope.modal = modal;
  //   });
  //
  //   // Triggered in the login modal to close it
  //   $scope.closeLogin = function() {
  //     $scope.modal.hide();
  //   };
  //
  //   // Open the login modal
  //   $scope.login = function() {
  //     $scope.modal.show();
  //   };
  //
  //   // Perform the login action when the user submits the login form
  //   $scope.doLogin = function() {
  //     console.log('Doing login', $scope.loginData);
  //
  //     // Simulate a login delay. Remove this and replace with your login
  //     // code if using a login system
  //     $timeout(function() {
  //       $scope.closeLogin();
  //     }, 1000);
  //   };
  // })

  // .controller('PlaylistsCtrl', function($scope) {
  //
  //   $scope.theme = 'ionic-sidemenu-blue';
  //   $scope.playlists = [{
  //     title: 'Reggae',
  //     id: 1
  //   }, {
  //     title: 'Chill',
  //     id: 2
  //   }, {
  //     title: 'Dubstep',
  //     id: 3
  //   }, {
  //     title: 'Indie',
  //     id: 4
  //   }, {
  //     title: 'Rap',
  //     id: 5
  //   }, {
  //     title: 'Cowbell',
  //     id: 6
  //   }];
  // })

  // .controller('PlaylistCtrl', function($scope, $stateParams) {})
  //
  // .controller('SearchCtrl', function($scope) {
  //
  //   $scope.playlists = [{
  //     title: 'Reggae',
  //     id: 1
  //   }, {
  //     title: 'Chill',
  //     id: 2
  //   }, {
  //     title: 'Dubstep',
  //     id: 3
  //   }, {
  //     title: 'Indie',
  //     id: 4
  //   }, {
  //     title: 'Rap',
  //     id: 5
  //   }, {
  //     title: 'Cowbell',
  //     id: 6
  //   }];
  //
  // })

  // .controller('BrowseCtrl', function($scope) {
  //   $scope.playlists = [{
  //     title: 'Reggae',
  //     id: 1
  //   }, {
  //     title: 'Chill',
  //     id: 2
  //   }, {
  //     title: 'Dubstep',
  //     id: 3
  //   }, {
  //     title: 'Indie',
  //     id: 4
  //   }, {
  //     title: 'Rap',
  //     id: 5
  //   }, {
  //     title: 'Cowbell',
  //     id: 6
  //   }];
  // })

  .controller('sideMenuCtrl', function($scope) {

    $scope.theme = 'ionic-sidemenu-stable';

    $scope.tree =
      [
        {
          id: 1,
          level: 0,
          name: 'Home',
          icon: "ion-map",
          state: 'app.home'
        }
      ];
  })




;
