angular.module('SignupModule').controller('SignupController', ['$scope', '$http', 'toastr', function($scope, $http, toastr){

    // set-up loading state
    $scope.signupForm = {
        loading : false
    };

    $scope.submitSignupForm = function(){
        $scope.signupForm.loading = true;

        $http.post('/signup', {
            name     : $scope.signupForm.name,
            title    : $scope.signupForm.title,
            email    : $scope.signupForm.email,
            password : $scope.signupForm.password,
        })
        .then(function onSucces(data){
            console.log('data de prueba', data);
            window.location = '/user';
        })
        .catch(function onError(response){
            // Handle known error type(s)
            // If using sails-disk adapter -- Handle Duplicate Key
            var emailAlreadyInUse = response.status == 409;
            if(emailAlreadyInUse){
                console.log('response',response);
                toastr.error(response.data, 'Error');
                return;
            }
        })
        .finally(function eitherWay(){
            $scope.signupForm.loading = false;
        });
    };

}]);
