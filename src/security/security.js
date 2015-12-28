'use strict'

/* Authentication */

angular.module('security',[]) //, [ 'ui.router', 'ui.mask']

/*	Routes not currently implemented. Using modal windows for now.
.config(function config( $stateProvider ) {

	$stateProvider.state( 'signup', {
    	url: '/signup',
    	views: {
      		"main": {								
        		controller: 'signupCtrl',			
        		templateUrl: 'app/security/signup.html'
      		}
    	},
    	page:{ 
			title: 'Create an Account',
			description: 'Sign Up'
		 }
  	})
	
	.state( 'login', {
    	url: '/login',
    	views: {
      		"main": {									
        		templateUrl: 'app/security/login.html'
      		}
    	},
    	page:{ 
			title: 'Please Sign In',
			description: 'Sign In.'
		 }
  	})
	
	.state( 'logout', {
    	url: '/logout',
    	views: {
      		"main": {					
				controller: 'logoutCtrl'
      		}
    	},
    	page:{ 
			title: 'Please Sign In',
			description: 'Sign In.'
		 }
  	})	
	
	.state( 'iforgot', {
    	url: '/iforgot',
    	views: {
      		"main": {								
        		controller: 'iforgotCtrl',			
        		templateUrl: 'app/security/iforgot.html'
      		}
    	},
    	page:{ 
			title: 'Forgot Your Password?',
			description: 'Password Help'
		 }
  	})
	.state( 'accountEdit', {
    	url: '/myaccount/update',
    	views: {
      		"main": {								
        		controller: 'accountCtrl',			
        		templateUrl: 'app/security/account.html'
      		}
    	},
    	page:{ 
			title: 'Update Account',
			description: 'Update Account Information'
		 }
  	})
	.state( 'passwordEdit', {
    	url: '/myaccount/password',
    	views: {
      		"main": {								
        		controller: 'passwordCtrl',			
        		templateUrl: 'app/security/password.html'
      		}
    	},
    	page:{ 
			title: 'Update Password',
			description: 'Update Password'
		 }
  	});			

})
*/	

.factory('SessionService', ['$cookieStore', '$http', function ( $cookieStore, $http) {

    // initialize to whatever is in the cookie, if anything
    $http.defaults.headers.common['Authorization'] = $cookieStore.get('Authorization');
 
    return {
        setCredentials: function (result) {
            $http.defaults.headers.common.Authorization = result.Authorization;
			$cookieStore.put('Authorization', result.Authorization);
            $cookieStore.put('AuthKeys', result.AuthKeys);
			$cookieStore.put('Username', result.Username);
        },
        clearCredentials: function () {
            document.execCommand("ClearAuthenticationCache");
			$http.defaults.headers.common.Authorization = 'Basic ';
			$cookieStore.remove('Authorization');
            $cookieStore.remove('AuthKeys');
			$cookieStore.remove('Username');
        },
	    get: function(key) {
    	  return $cookieStore.get(key);
    	},
	    set: function(key,val) {
    	  return $cookieStore.put(key,val);
    	}		
    };
	
}])



.factory("AuthenticationService", function($http, $sanitize, SessionService, appConfig) { // $location,

  var sanitizeCredentials = function(credentials) {
    return {
      username: $sanitize(credentials.username),
      password: $sanitize(credentials.password)
    };
  };
  
  return {
    login: function(credentials) {
		var login = $http.post(appConfig.endpoint + "/login", sanitizeCredentials(credentials));
     	login.success(  function(result) {
			SessionService.setCredentials(result);
			// notifications.removeAll();
  		});
		return login;
    },
    logout: function() {
		var logout = $http.get(appConfig.endpoint + "/logout");
		logout.success( function() {
			SessionService.clearCredentials();
			// notifications.removeAll();
		});
      return logout;
    },
    isLoggedIn: function() {
      return SessionService.get('Username');
    },
    userAuthKeys: function() {
		if(SessionService.get('AuthKeys') === undefined) { return "";}
		return SessionService.get('AuthKeys');
	}	

  };
})

/*
.directive('autofillable', ['$timeout', function ($timeout) {
	// fixes Firefox and Chrome browser auto-fill. Add autofillable to input
    return {
        require: 'ngModel',
        scope: {},
        link: function (scope, elem, attrs, ctrl) {
            scope.check = function(){
                var val = elem[0].value;
                if(ctrl.$viewValue !== val){
                    var isPristine = false;
                    if(ctrl.$pristine) isPristine = true;
                    ctrl.$setViewValue(val);
                    //if the form control was originally pristine, set it back to pristine
                   	ctrl.$pristine = isPristine;
                }
                $timeout(scope.check, 300);
            };
            scope.check();
        }
    }
}])
*/

/*
.directive('uniqueUsername', ['$http', 'appConfig', function($http, appConfig) {
	// Checks user PK to make sure it is not in use
	// Use: <input ng-model="username" name="username" unique-username>
	var toID;
	return { 
		require: 'ngModel',
		link: function(scope, element, attr, ctrl) {
			
			// empty element caught by required
			//if (!value) return;

			// could use blur instead of timeout:
			// element.bind('blur', function (value) {
			// when the scope changes, check the name.
            scope.$watch(attr.ngModel, function(value) {
				
                // if there was a previous attempt, stop it.
                if(toID) clearTimeout(toID);
	
 				// start a new attempt with a delay to keep it from getting too "chatty".
                toID = setTimeout(function(){
                    // call to API that returns { isValid: true } or { isValid: false }
					$http.get(appConfig.endpoint + "/signup/"  + value)  
					.success(function(data) {
						//console.log(data);
						ctrl.$setValidity('uniqueUsername', (data == 1 ? false : true)  );
                    }).error(function(data, status, headers, config) {
                        console.log("something wrong with unique username check.")
                    });
                }, 800);
			});
		}
	}
}])
*/

.directive('passwordMatch', [function () {
	
	// Use: <input type="password" ng-model="password2" password-match="password1" />	
    return {
        restrict: 'A',
        scope:true,
        require: 'ngModel',
        link: function (scope, elem , attrs,control) {
            var checker = function () {
 
                //get the value of the first password
                var e1 = scope.$eval(attrs.ngModel);
 
                //get the value of the other password 
                var e2 = scope.$eval(attrs.passwordMatch);
                return e1 == e2;
            };
            scope.$watch(checker, function (n) {
 
                //set the form control to valid if both
                //passwords are the same, else invalid
                control.$setValidity("unique", n);
            });
        }
    };
}])


.controller( 'signupCtrl', function signupCtrl( $scope, $http,  $window, appConfig, AuthenticationService ) {
//$location, notifications
   			
	$scope.account = {};
	
	$scope.doSignup = function(account) {
		$http.put(appConfig.endpoint + "/signup", account)     	
		.success(function(result) {
			// console.log(result);
			AuthenticationService.login(result.credentials).then(function(messages) {
    			//$location.path('/register/contact');	
				// do a hard page refresh to ensure cookies are seen
				// $window.location.href = 'index.html#/register/contact';

				alert('Logged in');
  			});

		})
		.error(function(result){
			console.log("Signup error - unable to create new account: ");
			console.log(result);
			// notifications.pushSticky(result.notification);
		});
  	};

})

.controller( 'loginCtrl', function loginCtrl( $scope, AuthenticationService ) {
//  $location, $window, notifications

	$scope.credentials = {"username": "", "password": ""}

	$scope.doLogin = function() {
		AuthenticationService.login($scope.credentials)
		.success(function(result) {
			if( AuthenticationService.isLoggedIn() ){	
			
				alert('logged in!');

				// if user needs to update their password, take them there...	
				/* NOT IMPLEMENTED
				if(result.RequirePasswordChange === 1){
					notifications.pushSticky({message:"Please update your password now.",type:"info"});
					$location.path('/myaccount/password');		
				} else {
					if( result.AuthKeys.length ){					
						$window.location.href = 'admin.html';
					}			
					$location.path('/myaccount');						
				}
				*/
			} 		
		})
		.error(function(result){
			$scope.credentials.password="";

			alert('login failed ');

		});
  	};
	
})

.controller( 'logoutCtrl', function logoutCtrl( $scope, AuthenticationService ) {
// , notifications, $location
	AuthenticationService.logout().success(function(response) {
		// notifications.pushSticky({message: 'Logged out.', type: 'info'});
  		// $location.path('/home');

  		alert('logged out');
	});


/* THESE FUNCTIOINS NOT CURRENTLY IMPLEMENTED

})

.controller( 'iforgotCtrl', function iforgotCtrl( $scope ) {

	$http.get(appConfig.endpoint + '/myaccount/update')
		.success(function(data, status, headers, config) {
			$scope.user = data;
  		});	
	
})

.controller( 'accountCtrl', function account( $scope, $http, appConfig, $location, notifications ) {

	$http.get(appConfig.endpoint + '/myaccount/update')
		.success(function(data, status, headers, config) {
			$scope.user = data;
  		});
 
	$scope.doUpdateAccount = function(user) {
		$http.post(appConfig.endpoint + "/myaccount/update", user)     	
		.success(function(result) {
			//console.log(result);
			notifications.pushSticky(result.notification);
			$location.path('/myaccount');	
		})
		.error(function(result){
			console.log("Error - unable to update account. ");
			console.log(result);
			notifications.pushSticky(result.notification);
		});
  	};

})

.controller( 'passwordCtrl', function password( $scope, $http, appConfig, $location, AuthenticationService, notifications ) {
	
	// Get User- Must be logged in OR logout and redirect to home.
	$http.get(appConfig.endpoint + '/myaccount/password')
		.success(function(data, status, headers, config) {
			$scope.user = data;
			$scope.user.password="";
  		});
 	
	$scope.doUpdatePassword = function(user) {
		$http.post(appConfig.endpoint + "/myaccount/password", user)     	
		.success(function(result) {
			// console.log(result);
			AuthenticationService.logout();
			AuthenticationService.login(result.credentials);
			// console.log(result);
			notifications.pushSticky(result.notification);
			$location.path('/myaccount');	
		})
		.error(function(result){
			//console.log("Error - unable to change password: ");
			//console.log(result);
		});
  	};
*/

});