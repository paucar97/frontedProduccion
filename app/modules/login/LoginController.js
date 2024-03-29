﻿app.controller('LoginController', function ($rootScope, $scope, $location, $cookies, $window, serviceCRUD) {
  $rootScope.showLayout = false;
  $scope.showAlert1 = false;
  $scope.showAlert2 = false;

  $scope.btnLogin = function () {
    if (!$scope.email || !$scope.pass) {
      $scope.showAlert1 = true;
      return;
    }
    $scope.showAlert1 = false;
    $scope.showAlert2 = false;

    var params = {
      email: $scope.email,
      clave: $scope.pass
    }

    serviceCRUD.TypePost('login', params).then(function (res) {
      if (res.data.message == 'error datos') {
        $scope.showAlert2 = true;
        return;
      }
      var usuario = res.data;
      usuario.alumno = 0;
      usuario.profesor = 0;
      usuario.jp = 0;
      $rootScope.user = usuario;
      $cookies.putObject('usuario', usuario);
      $scope.showAlert2 = false;
      location.href = indexURL + 'main';
    })
  }

  $scope.btnForgotPassword = function () {
  }
})