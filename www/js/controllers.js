angular.module('ionic.weather.controllers',[])


  .controller('WeatherCtrl', function($scope, $cordovaInAppBrowser, $state, $stateParams, $timeout, $rootScope, Weather, Geo, Flickr, $ionicModal, $ionicLoading, $ionicPlatform, $ionicPopup, $http, $filter, $ionicHistory) {

    $rootScope.flag = 1;
    $rootScope.flagFav = 0;
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


    $scope.exturl = function() {
      var options = {
        location: 'no',
        clearcache: 'yes',
        toolbar: 'yes'
      };
      console.log('click');
      cordova.InAppBrowser.open('http://meteo.uniparthenope.it', "_blank", "location=yes", "clearcache: yes", "toolbar: yes")

        .then(function(event) {
          console.log('opened');
        })

        .catch(function(event) {
          console.log('nope');
        });
    };

    $scope.showDayForecast = function(index) {

      var selected_forecast = $scope.daily_forecast[index];
      $state.go('app.daily_forecast', {obj: selected_forecast} );

    };


    this.getInfoPlace = function(lat,lng){
      //retrieve the closest places based on the lat and lng coords
      if ($scope.firstTime == 0 && $rootScope.flag == 1){
        $scope.firstTime = 1;
        var q_url = 'http://192.167.9.103:5050/places/search/bycoords/'+lat+'/'+lng+'?filter=com';
      }else{
        var q_url = 'http://192.167.9.103:5050/places/search/bycoords/'+lat+'/'+lng+'?filter=com';
      }
      //console.log(lat);
      //console.log(lng);
      //console.log(q_url);

      $http({
        method :'GET',
        url: q_url,
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .success(function (data, status) {

          if (data.places.length > 0) {
            for (i = 0; i < data.places.length; i++) {
              if (data.places[i].long_name.it.startsWith('Comune di ')) {
                //console.log('trovato Comune di ' + $scope.query);
                $scope.place_id = data.places[i].id;
                $scope.place_name = data.places[i].long_name.it;
                break;
              } else {
                //console.log('Non trovato, ritorno primo elemento');
                $scope.place_id = data.places[0].id;
                $scope.place_name = data.places[0].long_name.it;
              }
            }
          }

          //$scope.place_id = data.places[0].id;
          //$scope.place_name = data.places[0].long_name.it;
          $rootScope.rootPlace = $scope.place_name;
          //console.log($scope.place_id);
          //console.log($scope.place_name);
          // console.log(data.places[0].long_name.it);

          $scope.currentLocationString = $scope.place_name;;

          //retrieve bgd_image based on the current position
          _this.getDataModel("wrf3",$scope.place_id);
          _this.getBackgroundImage(lat, lng, $scope.currentLocationString);
          //_this.getCurrent(lat, lng); temperatura da forecast.io

          //console.log($scope.place_id);

        })
        .error(function (data, status) {
          alert('Connection error: ' + status);
        });
    };

    $rootScope.$on('CallInfoPlace', function(event, args){
      //console.log('event raised: '+ args.lat +' '+ args.lng);
      _this.getInfoPlace(args.lat, args.lng);
    });

    this.getDataModel = function(model,place){

      //retrieve forecast data from models
      var f_url = 'http://192.167.9.103:5050/products/'+model+'/timeseries/'+$scope.place_id;
      var s_url = 'http://192.167.9.103:5050/products/ww33/timeseries/'+$scope.place_id;
      var r_url = 'http://192.167.9.103:5050/products/rms3/timeseries/'+$scope.place_id;
      var c_url = 'http://192.167.9.103:5050/products/chm3/timeseries/'+$scope.place_id

      //console.log(f_url);

      $scope.show = function () {
        $ionicLoading.show({
          template: '<p>Caricamento...</p><ion-spinner icon="spiral"></ion-spinner>',
          duration: 5000
        });
      };

      $scope.hide = function () {
        $ionicLoading.hide();
      };

      //console.log('before show');

      // if($scope._init==true)
      $scope.show($ionicLoading);

      console.log('START');
      // var runs = [];
      var runs_r = [];
      var runs_c = [];
      var _data = [];
      var _data_s = [];
      var _data_c = [];
      var _data_r = [];

      $http({
        method :'GET',
        url: f_url,
        timeout: 300000,
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .success(function (data, status) {

          console.log('Success API f_url');

          $http({
            method: 'GET',
            url: s_url,
            timeout: 300000,
            headers: {
              'Content-Type': 'application/json'
            }
          })
            .success(function (data_s, status) {

              console.log('Success API s_url');

              $http({
                method: 'GET',
                url: c_url,
                timeout: 300000,
                headers: {
                  'Content-Type': 'application/json'
                }
              })

                .success(function (data_c, status) {

                  runs_c = data_c.timeseries.runs;

                  console.log('Success API c_url');
                  console.log(runs_c);

                  if (runs_c.length > 1) {
                    for (i = 0; i < runs_c.length - 1; i++) {

                      runs_c[0].time = runs_c[0].time.concat(runs_c[i + 1].time)

                    }
                    _data_c = {
                      "time": runs_c[0].time
                    };
                  }
                  else
                    _data_c = runs_c;


                  $http({
                    method: 'GET',
                    url: r_url,
                    timeout: 300000,
                    headers: {
                      'Content-Type': 'application/json'
                    }
                  })
                    .success(function (data_r, status) {


                      //console.log("RMS DEFINED FOR THIS LOCATION")
                      runs_r = data_r.timeseries.runs;

                      console.log('Success API r_url');
                      console.log(runs_r);
                      var rms_flag = false;
                      if (!angular.isUndefined(runs_r)) {
                        rms_flag = true;
                        if (runs_r.length > 1) {
                          for (i = 0; i < runs_r.length - 1; i++) {

                            runs_r[0].time = runs_r[0].time.concat(runs_r[i + 1].time)

                          }
                          _data_r = {
                            "time": runs_r[0].time
                          };
                        }
                        else
                          _data_r = runs_r;
                      }


                      //console.log("success http API");

                      //console.log(data);

                      var runs = data.timeseries.runs;
                      var runs_s = data_s.timeseries.runs;

                      //timezone (+2:00)
                      var tz = 2;

                      //console.log(runs.length);
                      var run_ith = [];
                      var run_c = [];
                      if (runs.length > 1) {
                        for (i = 0; i < runs.length - 1; i++) {
                          console.log('merging data run');
                          // console.log(runs[0]);
                          // console.log(runs[1]);
                          //merging the two runs

                          // runs[0].time.concat(runs[i+1].time);

                          runs[0].time = runs[0].time.concat(runs[i + 1].time)

                        }
                        _data = {
                          "time": runs[0].time
                        };
                      }
                      else
                        _data = runs;

                      if (runs_s.length > 1) {
                        for (i = 0; i < runs_s.length - 1; i++) {
                          console.log('merging data_s run');

                          runs[0].time = runs[0].time.concat(runs[i + 1].time)

                        }
                        _data_s = {
                          "time": runs[0].time
                        };
                      }
                      else
                        _data_s = runs_s;

                      console.log(_data);
                      console.log(_data_s);
                      console.log(_data_c);
                      console.log(_data_r);

                      //TODO: PRE-PROCESSING ON THE DATA OBTAINED
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

                      $scope.daily_forecast = [];
                      $scope.weekly_forecast = [];

//                      $scope.daily_rms = [];

                      $scope.highTemp = -9999;
                      $scope.lowTemp = 9999;

                      //get the min and max temperature for the current day
                      for (var i = 0; i <= init; i++) {
                        var val_temp = parseInt(_data.time[i].t2c);

                        if (val_temp < $scope.lowTemp)
                          $scope.lowTemp = val_temp;

                        if (val_temp > $scope.highTemp)
                          $scope.highTemp = val_temp;

                      }

                      //get the min and max temperature and other info beginning from 'init' and then storing in the weekly structure
                      var day_shift = Math.floor((_data.time.length - tz - 1) / 24) * 24;
                      //console.log(day_shift);
                      for (var i = (init + 1); i < day_shift; i = i + 24) {

                        var dateString = (_data.time[i + 1].date).slice(0, 11);

                        var year = dateString.substring(0, 4);
                        var month = dateString.substring(4, 6);
                        var day = dateString.substring(6, 8);
                        var hh = dateString.substr(9, 11);

                        //console.log(hh);

                        var curr_date = new Date(year, month - 1, day);

                        var min = 99999999;
                        var max = -9999999;

                        var day_summary = {

                          'min': min,
                          'max': max,
                          'date': $filter('date')(curr_date, 'yyyy-MM-dd'),
                          'icon': !_data.time[i + 12].icon ? 'N/A' : _data.time[i + 12].icon
                        };

                        var day = [];


                        //getting TS info data and min and max temperature for each day
                        for (var j = 0; j < 24; j++) {

                          var dateString = (_data.time[i + j].date).slice(0, 11);

                          var y = dateString.substring(0, 4);
                          var m = dateString.substring(4, 6);
                          var d = dateString.substring(6, 8);
                          var t = dateString.substr(9, 11);

                          var _date = new Date(y, m - 1, d, t, 0);
                          _date.setHours(_date.getHours() + tz);

                          // console.log(_date.getHours());
                          // console.log(_data.time[i+j].winds===null);
                          var t2c = parseFloat(_data.time[i + j].t2c);
                          var crh = parseFloat(_data.time[i + j].crh);
                          var clf = parseFloat(_data.time[i + j].clf);
                          // if(!_data.time[i+j].winds) // if 'value' is negative,undefined,null,empty value then...
                          var wind = !_data.time[i + j].winds ? 'N/A' : _data.time[i + j].winds;
                          //   console.log(wind);
                          var wind_dir = wind === 'N/A' ? 'wi wi-na' : 'wi wi-wind wi-from-' + wind.toLowerCase();
                          var ws10 = _data.time[i + j].ws10;
                          var slp = _data.time[i + j].slp;
                          var wc_text = _data.time[i + j].text;
                          var rh2 = parseFloat(_data.time[i + j].rh2);
                          var icon = !_data.time[i + j].icon ? 'N/A' : _data.time[i + j].icon;


                          //TODO: handle air quality data
                          if (!angular.isUndefined(_data_c.time[i + j])) { //get only defined date value (IMP)
                            // console.log(_data_c.time[i+j]);

                            var caqi = _data_c.time[i + j].caqi["#text"];
                            var caqi_text = [];
                            if (caqi >=0 && caqi <=50) {
                              caqi = 'green';
                              caqi_text = 'Good';
                            }
                            else if(caqi >=51 && caqi <=10) {
                              caqi = 'yellow';
                              caqi_text = 'Moderate';
                            }
                            else if(caqi >=101 && caqi <=150) {
                              caqi = 'orange';
                              caqi_text = 'Mediocre';
                            }
                            else if(caqi >=151 && caqi <=200) {
                              caqi = 'red';
                              caqi_text = 'Unhealthy';
                            }
                            else if(caqi >=201 && caqi <=300) {
                              caqi = 'purple';
                              caqi_text = 'Very Unhealthy';
                            }
                            else if(caqi > 300) {
                              caqi = 'maroon';
                              caqi_text = 'Hazardous';
                            }
                            else {
                              caqi = 'N/A';
                            }

                            var co = _data_c.time[i + j].co["#text"];
                            var no2 = _data_c.time[i + j].no2["#text"];
                            var o3 = _data_c.time[i + j].o3["#text"];
                            var pm10 = _data_c.time[i + j].pm10["#text"];
                            var pm25 = _data_c.time[i + j].pm25["#text"];
                            var so2 = _data_c.time[i + j].so2["#text"];

                          }
                          else {
                            var caqi = 'N/A';
                            var co = 'N/A';
                            var no2 = 'N/A';
                            var o3 = 'N/A';
                            var pm10 = 'N/A';
                            var pm25 = 'N/A';
                            var so2 = 'N/A';
                          }


                          //console.log('lunghezza sea: ' + runs_s.time.length + 'i=' + i);
                          if (i < runs_s.time.length - 1) {
                            var b_scale = [];
                            var hs = [];
                            var peakd = -9999;
                            if (!angular.isUndefined(_data_s.time[i + j])) {
                              b_scale = _data_s.time[i + j].w10b;
                              hs = _data_s.time[i + j].hs;
                              peakd = _data_s.time[i + j].peakd;

                              var d_scale;
                              if (hs == 0)
                                d_scale = 'Calm-Glassy';
                              else if (hs > 0 && hs <= 0.1)
                                d_scale = 'Calm-Rippled';
                              else if (hs >= 0.1 && hs < 0.5)
                                d_scale = 'Smooth';
                              else if (hs >= 0.5 && hs < 1.25)
                                d_scale = 'Slight';
                              else if (hs >= 1.25 && hs < 2.5)
                                d_scale = 'Moderate';
                              else if (hs >= 2.5 && hs < 4)
                                d_scale = 'Rough';
                              else if (hs >= 4 && hs < 6)
                                d_scale = 'Very Rough';
                              else if (hs >= 6 && hs < 9)
                                d_scale = 'High';
                              else if (hs >= 9 && hs < 14)
                                d_scale = 'Very High';
                              else if (hs >= 14)
                                d_scale = 'Phenomenal';
                            }
                            else {
                              hs = -999000000.000000;
                            }
                          }

                          var salt = 'N/A';
                          var sup_temp = 'N/A';
                          var fumo = 'N/A';
                          var ucomp = 'N/A';
                          var vcomp = 'N/A';
                          var wind_dir_card = 'N/A';

                          if (rms_flag == true) {
                            if (!angular.isUndefined(_data_r.time[i + j])) {
                              salt = _data_r.time[i + j].salt0m;
                              sup_temp = _data_r.time[i + j].temp0m;
                              fumo = _data_r.time[i + j].zeta;
                              ucomp = _data_r.time[i + j].u0m;
                              vcomp = _data_r.time[i + j].v0m;
                              var wind_abs = Math.sqrt(ucomp ^ 2 + vcomp ^ 2)
                              var wind_dir_trig_to = Math.atan2(ucomp / wind_abs, vcomp / wind_abs)
                              var angle = ((wind_dir_trig_to * 180 / Math.PI)+180)

                              var directions = 8;
                              var degree = 360 / directions;
                              angle = angle + degree/2;
                              if (angle >= 0 * degree && angle < 1 * degree)
                                wind_dir_card = "N";
                              if (angle >= 1 * degree && angle < 2 * degree)
                                wind_dir_card =  "NE";
                              if (angle >= 2 * degree && angle < 3 * degree)
                                wind_dir_card =  "E";
                              if (angle >= 3 * degree && angle < 4 * degree)
                                wind_dir_card =  "SE";
                              if (angle >= 4 * degree && angle < 5 * degree)
                                wind_dir_card =  "S";
                              if (angle >= 5 * degree && angle < 6 * degree)
                                wind_dir_card =  "SW";
                              if (angle >= 6 * degree && angle < 7 * degree)
                                wind_dir_card =  "W";
                              if (angle >= 7 * degree && angle < 8 * degree)
                                wind_dir_card =  "NW";

                            }
                          }


                          $scope.sea_length = runs_s.time.length;
                          var info_day = {

                            't2c': t2c,
                            'crh': crh,
                            'rh2': rh2,
                            'clf': clf,
                            'wind': wind,
                            'ws10': ws10,
                            'slp': slp,
                            'icon': icon,
                            'time': _date,
                            'wc_text': wc_text,
                            'b_scale': b_scale,
                            'hs': hs,
                            'peakd': peakd,
                            'wind_dir': wind_dir,
                            'b_scale_icon': 'wi wi-wind-beaufort-' + parseInt(b_scale),
                            'd_scale': d_scale,
                            'salt': parseFloat(salt).toFixed(2),
                            'sup_temp': parseFloat(sup_temp).toFixed(2),
                            'sup_lib': parseFloat(fumo).toFixed(2),
                            'sup_corr_dir': wind_dir_card,
                            'caqi': caqi,
                            'caqi_text': caqi_text,
                            'co': co,
                            'no2': no2,
                            'o3': o3,
                            'pm10': pm10,
                            'pm25': pm25,
                            'so2': so2
                          };


                          day.push(info_day);

                          if (t2c < min)
                            min = t2c;

                          if (t2c > max)
                            max = t2c;

                        }

                        day_summary['min'] = min;
                        day_summary['max'] = max;

                        //console.log(day_summary);

                        $scope.weekly_forecast.push(day_summary);
                        $scope.daily_forecast.push(day);

                      }

                      console.log($scope.daily_forecast);
                      //console.log($scope.weekly_forecast);
                      //console.log("after ops");
                    })


                    .error(function (data_r, status) {
                      alert('RMS3 API Connection error: ' + status);

                    });
                })
                .error(function (data_c, status) {
                  alert('CHM3 API Connection error: ' + status);
                });
            })
            .error(function (data_s, status) {
              alert('WW3 API Connection error: ' + status);
            });
        })
        //})
        .error(function (data, status) {
          alert('WRF3 Connection error: ' + status);
        })
        .finally(function ($IonicLoading) {

          // if($scope._init==true) {
          $scope.hide($IonicLoading);
          $scope._init = false;
          // }
        });
      //  })


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
          $rootScope.rootBg = $scope.activeBgImage;
        }else{
          $scope.countIm = false;
          //console.log('setting defualt photo');
          var img = new Image();
          //console.log($scope.currentCondition);
          $scope.pathIm = $scope.DfBgImage[$scope.currentCondition];
          $rootScope.rootBg = $scope.pathIm;
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
      $rootScope.flag = 1;
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

    if($rootScope.flag)
      $scope.refreshData();

  })


  .controller('DailyWeatherCtrl', function($scope, WC, WCI, $state, $stateParams, $cordovaInAppBrowser,$ionicModal) {

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


    $scope.showModal = function(animation,index) {
      //console.log(animation);
      //console.log(index);
      $scope.sel_hour_forecast = $scope.sel_forecast[index];
      console.log($scope.sel_hour_forecast);
      $ionicModal.fromTemplateUrl('templates/modals/hourly_forecast.html', {
        scope: $scope,
        animation: 'animated ' + animation,
        hideDelay: 120
      }).then(function(modal) {
        $scope.modal = modal;


        $scope.modal.show();
        $scope.hideModal = function(){
          $scope.modal.hide();
          // Note that $scope.$on('destroy') isn't called in new ionic builds where cache is used
          // It is important to remove the modal to avoid memory leaks
          $scope.modal.remove();
        }
      });
    };

    $scope.showModalrms = function(animation,index) {
      //console.log(animation);
      //console.log(index);
      $scope.sel_hour_forecast = $scope.sel_forecast[index];
      $ionicModal.fromTemplateUrl('templates/modals/hourly_rms.html', {
        scope: $scope,
        animation: 'animated ' + animation,
        hideDelay: 120
      }).then(function(modal) {
        $scope.modal = modal;
        $scope.modal.show();
        $scope.hideModalrms = function(){
          $scope.modal.hide();
          // Note that $scope.$on('destroy') isn't called in new ionic builds where cache is used
          // It is important to remove the modal to avoid memory leaks
          $scope.modal.remove();
        }
      });
    };

    $scope.exturl = function() {
      var options = {
        location: 'no',
        clearcache: 'yes',
        toolbar: 'yes'
      };
      console.log('click');
      cordova.InAppBrowser.open('http://meteo.uniparthenope.it', "_blank", "location=yes", "clearcache: yes", "toolbar: yes")

        .then(function(event) {
          console.log('opened');
        })

        .catch(function(event) {
          console.log('nope');
        });
    };


    var _daily_forecast =  $stateParams.obj;
    $scope.sel_forecast = [];
    var step = 3;
    var _count = new Array(WC.length).fill(0);

    //console.log(_daily_forecast);

    //skipping midnight
    for (var i = 1; i < _daily_forecast.length; i=i+step) {

      var _step_data = _daily_forecast[i];
      $scope.sel_forecast.push(_step_data);

      var wc = _step_data.wc_text;

      var i_wc = WC.indexOf(wc);

      _count[i_wc]++;

    }
    //console.log(_count);

    var max = -9999;
    var k;

    // retrieving condition weather based on max value
    for(var i = 0; i < _count.length; i++){
      if(_count[i] > max){
        max = _count[i];
        k = i;
      }
    }

    //console.log(k);
    //console.log(_count[k]);

    $scope.bg_img = WCI[k].toString();
    //console.log($scope.bg_img);

    //console.log($scope.sel_forecast);

  })


  .controller('SearchCtrl', function($http, $state, $rootScope, $scope,$ionicLoading,$ionicHistory) {

    $scope.searchForecast = function(field) {
      $scope.query = field;
      //console.log('cerco '+ $scope.query);
      // $scope.modal.hide();
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
                //console.log('trovato Comune di ' + $scope.query);
                var cLat = data.places[i].cLat;
                var cLon = data.places[i].cLon;
                break;
              }else if (data.places[i].long_name.it == $scope.query){
                //console.log('trovato ' + $scope.query);
                var cLat = data.places[i].cLat;
                var cLon = data.places[i].cLon;
              }else{
                //console.log('Non trovato, ritorno primo elemento');
                var cLat = data.places[0].cLat;
                var cLon = data.places[0].cLon;
              }
            }

            $rootScope.$emit('CallInfoPlace', {lat: cLat, lng: cLon});
            //console.log(cLat);
            //console.log(cLon);
            $rootScope.flag = 0;
            $ionicHistory.nextViewOptions({
              disableAnimate: true,
              disableBack: true
            });
            $state.go("app.home");
          }else{
            alert('Luogo trovato');
          }
        })

        .error(function (data, status) {
          alert('Connection error: ' + status);
        });

    };

  })



  .controller('sideMenuCtrl', function($scope, $ionicModal, $cordovaFile, $http, $rootScope) {

    // $scope.showSearch = function() {
    //   console.log('cerca aperto');
    //   if(!$scope.settingsModal) {
    //     // Load the modal from the given template URL
    //     $ionicModal.fromTemplateUrl('templates/modals/search.html', function(modal) {
    //       $scope.settingsModal = modal;
    //       $scope.settingsModal.show();
    //     }, {
    //       // The animation we want to use for the modal entrance
    //       animation: 'fadeIn'
    //     });
    //   } else {
    //     $scope.settingsModal.show();
    //   }
    // };

    // $scope.closeSearch = function() {
    //   console.log('cerca chiuso');
    //   $scope.modal.hide();
    // };

    $scope.setFav = function () {
      //console.log('fav: ' + $rootScope.rootPlace);
      $scope.fav = $rootScope.rootPlace;
      $rootScope.flagFav = 1;
      var json = {"fav": $scope.fav};
      $cordovaFile.writeFile("json", "fav.json", JSON.stringify(json), true)
        .then(function (success) {

          //console.log('fav: setted');
        }, function (error) {
          // error
          //console.log(error);
          //console.log('fav: failed'); //error mappings are listed in the documentation
        });
    };

    $scope.removeFav = function () {
      $scope.fav = null;
      $rootScope.flagFav = 0;
      var json = {"fav": $scope.fav};
      $cordovaFile.writeFile("json", "fav.json", JSON.stringify(json), true)
        .then(function (success) {

          //console.log('fav: removed');
        }, function (error) {
          // error
          //console.log('fav: failed'); //error mappings are listed in the documentation
        });
    };



    $scope.theme = 'ionic-sidemenu-stable';

    $scope.tree =
      [
        {

          id: 1,
          level: 0,
          name: 'Home',
          icon: "ion-home",
          state: 'app.home'
        },
        {
          id: 2,
          name: "Credits",
          icon: "ion-ionic",
          level: 0,
          state: 'app.credits'
        },
        {
          id: 3,
          level: 0,
          name: 'Search',
          icon: "ion-search",
          state: 'app.search'
        }
      ];
  })

  .controller('CreditsCtrl', function($filter,$scope,$cordovaInAppBrowser) {

    var options = {
      location: 'no',
      clearcache: 'yes',
      toolbar: 'yes'
    };

    $scope.openBrowser = function(link) {
      //console.log('click credits');
      cordova.InAppBrowser.open(link, "_blank", "location=yes", "clearcache: yes", "toolbar: yes")
      // $cordovaInAppBrowser.open(link, '_blank', options)
        .then(function(event) {

        })

        .catch(function(event) {

        });
    };

  })



;
