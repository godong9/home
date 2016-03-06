//firstScript.js
define(['./bower_components/jquery/dist/jquery', './secondScript'],function($, secondScript){
  console.log('Color from secondScript', secondScript.color);
  return {
    hello: function () {
      console.log($);
      console.log("TEST@@@44222");
      console.log('Hello from firstScript');
    }
  }
});