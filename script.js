(function(angular) {
  'use strict';
var app = angular.module('app', ['ngResource']);

app.controller('Ctrl', ['$scope','$resource','$http', function($scope,$resource,$http) {
  function getJsonFromUrl(query) {
    var result = {};
    query.split("&").forEach(function(part) {
      var item = part.split("=");
      result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
  }
  $http.jsonp('http://www.reddit.com/r/music.json?limit=100&jsonp=JSON_CALLBACK&subreddit=jokes')
    .success(function(res) {
      $scope.permalinks = []
      $scope.vids = res.data.children.reduce(function(prev,cur) {
        if (/^https?:\/\/(www\.)?youtube/.test(cur.data.url)) {
          var id = getJsonFromUrl(cur.data.url.substr(30)).v
          $scope.permalinks.push({title:cur.data.title,uri:cur.data.permalink})
          prev.push(id)
          return prev
        } else {
          return prev
        }
      },[])
      $scope.play(0)
    })
  $scope.play = function() {
    var player;
    player = new YT.Player('player', {
      height: '390',
      width: '640',
      playerVars: { 'autoplay': 0},
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    })

    // 4. The API will call this function when the video player is ready.
    function onPlayerReady(event) {
      player.cuePlaylist($scope.vids)
      event.target.playVideo();
    }
    $scope.waiting = false
    function onPlayerStateChange(event) {
      if (player.getPlayerState()===0) {
        addVidIdToStorage(getJsonFromUrl(player.getVideoUrl().substr(30)).v)
        setTimeout(function(){player.playVideo()},3000)
      }
    }
    function addVidIdToStorage (id) {
      var ids;
      if (localStorage['ids'] === null || localStorage['ids'] ===undefined || localStorage === '') {
        ids = [];
      } else {
        ids = JSON.parse(localStorage["ids"]);
      }
      ids.push(id)
      localStorage["ids"] = JSON.stringify(ids);
    }
  }
}]);
})(window.angular);
