angular.module('ionic.weather.directives', [])

.constant('WEATHER_ICONS', {

  'sunny.png':            'wi wi-day-sunny',
  'sunny_night.png':      'wi wi-night-clear',

  'cloudy1.png':          'wi wi-day-cloudy',
  'cloudy2.png':          'wi wi-day-cloudy',
  'cloudy3.png':          'wi wi-day-cloudy-high',
  'cloudy4.png':          'wi wi-cloudy',
  'cloudy5.png':          'wi wi-cloud',

  'cloudy1_night.png':    "wi wi-night-alt-partly-cloudy",
  'cloudy2_night.png':    "wi wi-night-alt-partly-cloudy",
  'cloudy3_night.png':    "wi wi-night-alt-cloudy",
  'cloudy4_night.png':    "wi wi-night-alt-cloudy",
  'cloudy5_night.png':    "wi wi-night-alt-cloudy",

  'shower1.png':          "wi wi-day-showers",
  'shower2.png':          "wi wi-hail",
  'shower3.png':          "wi wi-storm-showers",

  'shower1_night.png':    "wi wi-night-alt-showers",
  'shower2_night.png':    "wi wi-night-alt-rain",
  'shower3_night.png':    "wi wi-night-alt-thunderstorm",

  'N/A':                  "wi wi-na"
})


.directive('weatherIcon', function(WEATHER_ICONS) {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      icon: '='
    },
    template: '<i class="icon" ng-class="weatherIcon"></i>',
    link: function($scope) {

      $scope.$watch('icon', function(v) {
        if(!v) { return; }

        var icon = v;

        if(icon in WEATHER_ICONS) {
          $scope.weatherIcon = WEATHER_ICONS[icon];
        } else {
          $scope.weatherIcon = icon;
          // $scope.weatherIcon = WEATHER_ICONS['cloudy'];
        }
      });
    }
  }
})

.directive('currentTime', function($timeout, $filter) {
  return {
    restrict: 'E',
    replace: true,
    template: '<span class="current-time">{{currentTime}}</span>',
    scope: {
      localtz: '=',
    },
    link: function($scope, $element, $attr) {
      $timeout(function checkTime() {
        if($scope.localtz) {
          $scope.currentTime = $filter('date')(+(new Date), 'h:mm') + $scope.localtz;
        }
        $timeout(checkTime, 500);
      });
    }
  }
 })

.directive('currentWeather', function($timeout, $rootScope, Settings) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'templates/current-weather.html',
    scope: true,
    compile: function(element, attr) {
      return function($scope, $element, $attr) {

        $rootScope.$on('settings.changed', function(settings) {
          var units = Settings.getTempUnits();
          console.log("CIAOOO");

          if($scope.forecast) {

            var forecast = $scope.forecast;
            var current = $scope.current;

            if(units == 'c') {
              $scope.highTemp = forecast.forecastday[0].high.fahrenheit;
              $scope.lowTemp = forecast.forecastday[0].low.fahrenheit;
              $scope.currentTemp = Math.floor(current.temp_f);
            } else {
              $scope.highTemp = forecast.forecastday[0].high.celsius;
              $scope.lowTemp = forecast.forecastday[0].low.celsius;
              $scope.currentTemp = Math.floor(current.temp_c);
            }
          }
        });

        $scope.$watch('current', function(current) {
          var units = Settings.get('tempUnits');

          if(current) {
            if(units == 'f') {
              $scope.currentTemp = Math.floor(current.currently.temperature);
            } else {
              $scope.currentTemp = Math.floor(current.currently.temperature);
            }
            if(units == 'f') {
              $scope.highTemp = Math.floor(current.daily.data[0].temperatureMax);
              $scope.lowTemp = Math.floor(current.daily.data[0].temperatureMin);
            } else {
              $scope.highTemp = Math.floor(current.daily.data[0].temperatureMax);
              $scope.lowTemp = Math.floor(current.daily.data[0].temperatureMin);
            }
          }
        });

      // Delay so we are in the DOM and can calculate sizes
      $timeout(function() {
        var windowHeight = window.innerHeight;
        var thisHeight = $element[0].offsetHeight;
        var headerHeight = document.querySelector('#header').offsetHeight;
        $element[0].style.paddingTop = (windowHeight - (thisHeight) - 20) + 'px'; //TODO: workaround with 15px (offset bar menu)
        angular.element(document.querySelector('.content')).css('-webkit-overflow-scrolling', 'auto');
        $timeout(function() {
          angular.element(document.querySelector('.content')).css('-webkit-overflow-scrolling', 'touch');
        }, 50);
      });
      }
    }
  }
})

.directive('forecast', function($timeout) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'templates/forecast.html',
    link: function($scope, $element, $attr) {
    }
  }
})

  .directive('menuBar', function($timeout) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'templates/menu.html',
      link: function($scope, $element, $attr) {
      }
    }
  })



.directive('weatherBox', function($timeout) {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    scope: {
      title: '@'
    },
    template: '<div class="weather-box"><h4 class="title">{{title}}</h4><div ng-transclude></div></div>',
    link: function($scope, $element, $attr) {
    }
  }
})

.directive('scrollEffects', function() {
  return {
    restrict: 'A',
    link: function($scope, $element, $attr) {
      var amt, st, header;
      var bg = document.querySelector('.bg-image');
      $element.bind('scroll', function(e) {
        if(!header) {
          header = document.getElementById('header');
        }
        st = e.detail.scrollTop;
        if(st >= 0) {
          header.style.webkitTransform = 'translate3d(0, 0, 0)';
        } else if(st < 0) {
          header.style.webkitTransform = 'translate3d(0, ' + -st + 'px, 0)';
        }
        amt = Math.min(0.6, st / 1000);

        ionic.requestAnimationFrame(function() {
          header.style.opacty = 1 - amt;
          if(bg) {
            bg.style.opacity = 1 - amt;
          }
        });
      });
    }
  }
})

.directive('backgroundCycler', function($compile, $animate) {
  var animate = function($scope, $element, newImageUrl) {
    var child = $element.children()[0];

    var scope = $scope.$new();
    scope.url = newImageUrl;
    var img = $compile('<background-image></background-image>')(scope);

    $animate.enter(img, $element, null, function() {
      console.log('Inserted');
    });
    if(child) {
      $animate.leave(angular.element(child), function() {
        console.log('Removed');
      });
    }
  };

  return {
    restrict: 'E',
    link: function($scope, $element, $attr) {
      $scope.$watch('activeBgImage', function(v) {
        if(!v) { return; }
        console.log('Active bg image changed', v);
        var item = v;
        var url = "http://farm"+ item.farm +".static.flickr.com/"+ item.server +"/"+ item.id +"_"+ item.secret + "_z.jpg";
        animate($scope, $element, url);
      });
    }
  }
})

.directive('backgroundImage', function($compile, $animate) {
  return {
    restrict: 'E',
    template: '<div class="bg-image"></div>',
    replace: true,
    scope: true,
    link: function($scope, $element, $attr) {
      if($scope.url) {
        $element[0].style.backgroundImage = 'url(' + $scope.url + ')';
      }
    }
  }
});
