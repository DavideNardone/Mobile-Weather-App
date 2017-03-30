angular.module('ionic.weather.controllers',[])


  .controller('WeatherCtrl', function($scope, $state, $stateParams, $timeout, $rootScope, Weather, Geo, Flickr, $ionicModal, $ionicLoading, $ionicPlatform, $ionicPopup, $http, $filter) {
    var _this = this;

    $scope._init = true;

    // $ionicPlatform.ready(function() {
    //   // Hide the status bar
    //   if(window.StatusBar) {
    //     StatusBar.hide();
    //   }
    // });

    $scope.activeBgImageIndex = 0;

    // $scope.showSettings = function() {
    //   console.log('cerca cliccato');
    //   if(!$scope.settingsModal) {
    //     // Load the modal from the given template URL
    //     $ionicModal.fromTemplateUrl('modals/search.html', function(modal) {
    //       $scope.settingsModal = modal;
    //       $scope.settingsModal.show();
    //     }, {
    //       // The animation we want to use for the modal entrance
    //       animation: 'slide-in-up'
    //     });
    //   } else {
    //     $scope.settingsModal.show();
    //   }
    // };

    $scope.showDayForecast = function(index) {

      var selected_forecast = $scope.daily_forecast[index];
      $state.go('app.daily_forecast', {obj: selected_forecast} );

    };

    this.getInfoPlace = function(lat,lng){
      //retrieve the closest places based on the lat and lng coords
      if ($scope.firstTime == 0){
        $scope.firstTime = 1;
        var q_url = 'http://192.167.9.103:5050/places/search/bycoords/'+lat+'/'+lng+'?filter=com';
      }else{
        var q_url = 'http://192.167.9.103:5050/places/search/bycoords/'+lat+'/'+lng;
      }
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
          _this.getDataModel("wrf3",$scope.place_id);
          _this.getBackgroundImage(lat, lng, $scope.currentLocationString);
          //_this.getCurrent(lat, lng); temperatura da forecast.io

          console.log($scope.place_id);

        })
        .error(function (data, status) {
          alert('Connection error: ' + status);
        });
    };

    $rootScope.$on('CallInfoPlace', function(event, args){
      console.log('event raised: '+ args.lat +' '+ args.lng);
      _this.getInfoPlace(args.lat, args.lng);
    });

    this.getDataModel = function(model,place){

      //retrieve forecast data from wrf3
      var f_url = 'http://192.167.9.103:5050/products/'+model+'/timeseries/'+place;
      var s_url = 'http://192.167.9.103:5050/products/ww33/timeseries/'+place;
      console.log(f_url);

      $scope.show = function () {
        $ionicLoading.show({
          template: '<p>Caricamento...</p><ion-spinner icon="spiral"></ion-spinner>'
        });
      };

      $scope.hide = function () {
        $ionicLoading.hide();
      };

      console.log('before show');

      // if($scope._init==true)
      $scope.show($ionicLoading);

      console.log('after show');


      $http({
        method :'GET',
        url: f_url,
        timeout: 300000,
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .success(function (data, status) {

          $http({
            method :'GET',
            url: s_url,
            timeout: 300000,
            headers: {
              'Content-Type': 'application/json'
            }
          })
            .success(function (data_s, status) {
              console.log("success http API");

              var runs = data.timeseries.runs;
              var runs_s = data_s.timeseries.runs;
              //timezone (+2:00)
              var tz = 2;

              var _data = [];
              var _data_s = [];

              if (runs.length > 1){
                _data.concat(runs[i]);
                // push(runs[i]);
              }
              else
                _data = runs;
              if (runs_s.length > 1){
                _data_s.concat(runs_s[i]);
                // push(runs[i]);
              }
              else
                _data_s = runs_s;
              //FIXME: handle forecast data when then runs is greater than 1

          // get the current temperature and icon
          $scope.currentTemp = _data.time[0].t2c;
          $scope.currentCondition = _data.time[0].icon;
          //get all the runs
          $scope.hourly_forecast = _data;
          // console.log($scope.hourly_forecast);

          var day = new Date();
          var hour = day.getHours();

              // shift the forecast to the next day 23:00 UTC
              var init = 24 - hour;

              //TODO: CREATE TWO DIFFERENT OBJECTS: ONE FOR THE 'WEEKLY FORECAST' AND ANOTHER ONE FOR THE 'DAILY/SELECTED FORECAST'
              $scope.daily_forecast = [];
              $scope.weekly_forecast = [];

              $scope.highTemp = -9999;
              $scope.lowTemp = 9999;

              //get the min and max temperature for the current day
              for(var i=0; i<=init; i++){
                var val_temp =  parseInt(_data.time[i].t2c);

                if(val_temp < $scope.lowTemp)
                  $scope.lowTemp = val_temp;

                if (val_temp > $scope.highTemp)
                  $scope.highTemp = val_temp;

              }

          //get the min and max temperature and other info beginning from 'init' and then storing in the weekly structure
          var day_shift = Math.floor( (_data.time.length - tz-1 + hour)/24 ) * 24;
          for (var i = (init+1); i < (144 - hour); i=i+24) {

                  var dateString = (_data.time[i + 1].date).slice(0, 11);

                  var year = dateString.substring(0, 4);
                  var month = dateString.substring(4, 6);
                  var day = dateString.substring(6, 8);
                  var hh = dateString.substr(9, 11);

            console.log(hh);

            var curr_date = new Date(year, month-1, day);

                  var min = 99999999;
                  var max = -9999999;

                  var day_summary = {

                    'min': min,
                    'max': max,
                    'date': $filter('date')(curr_date, 'yyyy-MM-dd'),
                    'icon': _data.time[i + 12].icon
                  };

                  var day = [];


                  //getting TS info data and min and max temperature for each day
                  for (var j = 0; j < 24; j++) {

                    var dateString = (_data.time[i + j].date).slice(0, 11);

                    var y = dateString.substring(0, 4);
                    var m = dateString.substring(4, 6);
                    var d = dateString.substring(6, 8);
                    var t = dateString.substr(9, 11);

              var _date = new Date(y, m-1, d, t, 0);
              _date.setHours(_date.getHours()+tz);

              // console.log(_date.getHours());
              console.log(_data.time[i+j].winds===null);
              var t2c =  parseFloat(_data.time[i+j].t2c);
              var crh =  parseFloat(_data.time[i+j].crh);
              var wind = _data.time[i+j].winds === null ? '-' : _data.time[i+j].winds;
              var ws10 = _data.time[i+j].ws10;
              var wc_text = _data.time[i+j].text;
              // var rh2 =  parseFloat(_data.time[i+j].rh2);
              var icon = _data.time[i+j].icon;

                    //console.log('lunghezza sea: ' + runs_s.time.length + 'i=' + i);
                    if (i < runs_s.time.length - 2) {
                      var b_scale = _data_s.time[i + j].w10b;
                      var hs = _data_s.time[i + j].hs;
                      var peakd = _data_s.time[i + j].peakd;
                    }
                    else {
                      var b_scale = -9999;
                      var hs = -9999;
                      var peakd = -9999;
                    }

                    var info_day = {

                      't2c': t2c,
                      'crh': crh,
                      'wind': wind,
                      'ws10': ws10,
                      'icon': icon,
                      'time': _date,
                      'wc_text': wc_text,
                      'b_scale': b_scale,
                      'hs': hs,
                      'peakd': peakd,
                      'wind_dir': 'wi wi-wind wi-towards-' + wind.toLowerCase(),
                      'b_scale_icon': 'wi wi-wind-beaufort-' + parseInt(b_scale)
                    };

                    day.push(info_day);

                    if (t2c < min)
                      min = t2c;

                    if (t2c > max)
                      max = t2c;

                  }

                  day_summary['min'] = min;
                  day_summary['max'] = max;

                  console.log(day_summary);

                  $scope.weekly_forecast.push(day_summary);
                  $scope.daily_forecast.push(day);

                }

                console.log($scope.daily_forecast);
                console.log($scope.weekly_forecast);
                console.log("after ops");

            })
            .error(function (data, status) {
              alert('Connection error: ' + status);
            })
            .finally(function ($IonicLoading) {

              // if($scope._init==true) {
              $scope.hide($IonicLoading);
              $scope._init = false;
              // }

            })
        })


    };


    this.getBackgroundImage = function(lat, lng, locString) {

      $scope.DfBgImage = {};
      $scope.DfBgImage["sunny.png"] = "img/bg/sunny.jpg";
      $scope.DfBgImage["sunny_night.png"] = "img/bg/calm-night.jpg";
      $scope.DfBgImage["cloudy1.png"] = "img/bg/cloudy.jpg";
      $scope.DfBgImage["cloudy1_night.png"] = "img/bg/cloudy-night.jpg";
      $scope.DfBgImage["cloudy2.png"] = "img/bg/cloudy.jpg";
      $scope.DfBgImage["cloudy2_night.png"] = "img/bg/cloudy-night.jpg";
      $scope.DfBgImage["cloudy3.png"] = "img/bg/cloudy.jpg";
      $scope.DfBgImage["cloudy3_night.png"] = "img/bg/cloudy-night.jpg";
      $scope.DfBgImage["cloudy4.png"] = "img/bg/cloudy.jpg";
      $scope.DfBgImage["cloudy4_night.png"] = "img/bg/cloudy-night.jpg";
      $scope.DfBgImage["cloudy5.png"] = "img/bg/cloudy.jpg";
      $scope.DfBgImage["cloudy5_night.png"] = "img/bg/cloudy-night.jpg";
      $scope.DfBgImage["shower1.png"] = "img/bg/rain.jpg";
      $scope.DfBgImage["shower1_night.png"] = "img/bg/rain.jpg";
      $scope.DfBgImage["shower2.png"] = "img/bg/rain.jpg";
      $scope.DfBgImage["shower2_night.png"] = "img/bg/rain.jpg";
      $scope.DfBgImage["shower3.png"] = "img/bg/thunderstorm.jpg";
      $scope.DfBgImage["shower3_night.png"] = "img/bg/thunderstorm.jpg";

      if (locString.startsWith('Comune di'))
        locString = locString.slice(9 ,locString.length);
      Flickr.search(locString).then(function(resp) {
        var photos = resp.photos;
        if(photos.photo.length) {
          $scope.countIm = true;
          $scope.bgImages = photos.photo;
          _this.cycleBgImages();
        }else{
          $scope.countIm = false;
          console.log('setting defualt photo');
          var img = new Image();
          console.log($scope.currentCondition);
          $scope.pathIm  = $scope.DfBgImage[$scope.currentCondition];
          //console.log(img.src);
          //$scope.pathIm = img.src;
          console.log($scope.pathIm);
          //$scope.bgImages = img
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
      $scope.firstTime = 0;
      Geo.getLocation().then(function(position) {
        lat = position.coords.latitude;
        lng = position.coords.longitude;

        _this.getInfoPlace(lat,lng);

        $rootScope.$broadcast('scroll.refreshComplete');
        // $scope.hide($ionicLoading);

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


  .controller('DailyWeatherCtrl', function($scope, WC, WCI, $state, $stateParams, $cordovaInAppBrowser) {

    var options = {
      location: 'yes',
      clearcache: 'yes',
      toolbar: 'yes'
    };

    $scope.openInAppBrowser = function(link) {
      $cordovaInAppBrowser.open(link, '_blank', options)

        .then(function(event) {

        })

        .catch(function(event) {

        });
    };

    var _daily_forecast =  $stateParams.obj;
    $scope.sel_forecast = [];
    var step = 3;
    var _count = new Array(WC.length).fill(0);

    console.log(_daily_forecast);

    //skipping midnight
    for (var i = 1; i < _daily_forecast.length; i=i+step) {

      var _step_data = _daily_forecast[i];
      $scope.sel_forecast.push(_step_data);

      var wc = _step_data.wc_text;

      var i_wc = WC.indexOf(wc);

      _count[i_wc]++;

    }
    console.log(_count);

    var max = -9999;
    var k;

    // retrieving condition weather based on max value
    for(var i = 0; i < _count.length; i++){
      if(_count[i] > max){
        max = _count[i];
        k = i;
      }
    }

    console.log(k);
    console.log(_count[k]);

    $scope.bg_img = WCI[k].toString();
    console.log($scope.bg_img);

    console.log($scope.sel_forecast);

  })


  .controller('SearchCtrl', function($scope,$ionicLoading) {
    console.log("search1");

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

    // $scope.hide($ionicLoading);
    console.log("search2");

  })



  .controller('sideMenuCtrl', function($scope, $ionicModal, $http, $rootScope) {

    $scope.showSearch = function() {
      console.log('cerca aperto');
      if(!$scope.settingsModal) {
        // Load the modal from the given template URL
        $ionicModal.fromTemplateUrl('templates/modals/search.html', function(modal) {
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

    $scope.closeSearch = function() {
      console.log('cerca chiuso');
      $scope.modal.hide();
    };

    $scope.searchForecast = function(field) {
      $scope.query = field;
      console.log('cerco '+ $scope.query);
      $scope.modal.hide();
      $scope.query = $scope.query.substr(0,1).toUpperCase() + $scope.query.substr(1).toLowerCase();
      var s_url = 'http://192.167.9.103:5050/places/search/byname/'+$scope.query;

      $http({
        method :'GET',
        url: s_url,
        timeout: 300000,
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .success(function (data, status) {
          if (data.places.length > 0) {
            for (i=0; i<data.places.length; i++)
            {
              if (data.places[i].long_name.it == 'Comune di '+$scope.query) {
                console.log('trovato Comune di ' + $scope.query);
                var cLat = data.places[i].cLat;
                var cLon = data.places[i].cLon;
                break;
              }else if (data.places[i].long_name.it == $scope.query){
                console.log('trovato ' + $scope.query);
                var cLat = data.places[i].cLat;
                var cLon = data.places[i].cLon;
                break;
              }else{
                console.log('Non trovato, ritorno primo elemento');
                var cLat = data.places[0].cLat;
                var cLon = data.places[0].cLon;
              }
            }

            $rootScope.$emit('CallInfoPlace', {lat: cLat, lng: cLon});
            console.log(cLat);
            console.log(cLon);
          }else{
            alert('Luogo trovato');
          }
    })

    .error(function (data, status) {
      alert('Connection error: ' + status);
    });

    };

    $scope.theme = 'ionic-sidemenu-stable';

    $scope.tree =
      [
        {
          id: 1,
          level: 0,
          name: 'Home',
          icon: "ion-map",
          state: 'app.home'
        },
        {
          id: 2,
          level: 0,
          name: 'Test',
          icon: "ion-map",
          state: 'app.search'
        }
      ];
  })



;
