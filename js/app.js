var Application = Application || {};

Application.Constants = angular.module('application.constants', []);
Application.Services = angular.module('application.services', []);
Application.Controllers = angular.module('application.controllers', []);
Application.Filters = angular.module('application.filters', []);
Application.Directives = angular.module('application.directives', []);

var app = angular.module('FMTVApp', [
  'application.constants', 
  'application.services', 
  'application.controllers', 
  'application.filters', 
  'application.directives', 
  'ngResource',           // REST suppport
  'ngSanitize',           // sanitize data input
  'satellizer',
 // 'ngCookies',            // cookies for authentication
  'ui.grid',              // data grid - http://ui-grid.info/docs/#/tutorial/101_intro
  'ui.bootstrap',         // bootstrap
  'ngMaterial',           // material design
  'vAccordion',           // main desgner accordion 
  'underscore',           // used in Rules Engine
  'xeditable',            // edit in place
  'FBAngular',            // fullscreen
  'me-lazyload',          // image lazy loading for art
  'infinite-scroll'       // infinite scroll for art
  //,'request.loading'    // loading overlay
  ])

.constant("appConfig", {
  //endpoint: '/fmtv/server/api/v1/index.cfm'
  endpoint: 'https://framemytv.com/api/v1/index.cfm'
})

.config(['$mdThemingProvider', '$mdIconProvider', '$locationProvider', '$authProvider','appConfig', function($mdThemingProvider, $mdIconProvider, $locationProvider, $authProvider, appConfig) {

  $locationProvider.html5Mode(true);

  $mdIconProvider
    .icon('alert',        'assets/svg/alert.svg',                 24)
    .icon('arrowr',       'assets/svg/arrow-right.svg',           24)
    .icon('arrowl',       'assets/svg/arrow-left.svg',            24)
    .icon('cart',         'assets/svg/cart.svg',                  24)
    .icon('cheveronL',    'assets/svg/chevron-left.svg',          24)
    .icon('copy',         'assets/svg/content-copy.svg',          24)
    .icon('check',        'assets/svg/check.svg',                 24)
    .icon('edit',         'assets/svg/pencil.svg',                24)
    .icon('facebook',     'assets/svg/facebook-box.svg',          24)
    .icon('favorite',     'assets/svg/favorite.svg',              24)
    .icon('fullscreen',   'assets/svg/fullscreen.svg',            24)
    .icon('fullscreenexit','assets/svg/fullscreen-exit.svg',      24)        
    .icon('google_plus',  'assets/svg/google-plus-box.svg',       24)
    .icon('info',         'assets/svg/information-outline.svg',   24)
    .icon('larrow',       'assets/svg/arrow-left-bold-circle.svg',24)
    .icon('logout',       'assets/svg/logout.svg',                24)
    .icon('magnify',      'assets/svg/magnify.svg',               24)    
    .icon('mail',         'assets/svg/email.svg',                 24)
    .icon('menu',         'assets/svg/menu.svg',                  24)
    .icon('more',         'assets/svg/dots-vertical.svg',         24)
    .icon('message',      'assets/svg/message-text-outline.svg',  24)
    .icon('pinterest',    'assets/svg/pinterest-box.svg',         24)    
    .icon('phone',        'assets/svg/phone.svg',                 24)
    .icon('print',        'assets/svg/printer.svg',               24)
    .icon('save',         'assets/svg/content-save.svg',          24)
    .icon('share',        'assets/svg/share-variant.svg',         24)
    .icon('twitter',      'assets/svg/twitter-box.svg',           24)
    .icon('upload',       'assets/svg/upload.svg',                24)
    .icon('close',        'assets/svg/window-close.svg',          24)    
    .iconSet('avatars',   'assets/svg/avatars.svg',               128);
      
  // Available color themes    
  $mdThemingProvider.theme('default');
  $mdThemingProvider.theme('red').primaryPalette('red');
  $mdThemingProvider.theme('blue').primaryPalette('blue');
  $mdThemingProvider.theme('brown').primaryPalette('brown');
  $mdThemingProvider.theme('blue-grey').primaryPalette('blue-grey');
  //$mdThemingProvider.theme('green').primaryPalette('green')  
  //$mdThemingProvider.theme('lime').primaryPalette('lime')
  //$mdThemingProvider.theme('deep-orange').primaryPalette('deep-orange')  
  $mdThemingProvider.alwaysWatchTheme(true);

  // Authorization Providers - https://github.com/sahat/satellizer
  // No additional setup required for Twitter
  $authProvider.baseUrl = appConfig.endpoint;
  $authProvider.facebook({clientId: '459514587450400'});
  $authProvider.google({clientId: '1064852700485.apps.googleusercontent.com'});
  $authProvider.linkedin({clientId: '817g0dieoqqy'});
  //$authProvider.instagram({clientId: 'Instagram Client ID'});
  //$authProvider.yahoo({clientId: 'Yahoo Client ID / Consumer Key'});
  //$authProvider.live({clientId: 'Microsoft Client ID'});
  //$authProvider.twitch({clientId: 'Twitch Client ID'});

}])

// Share scopes between controllers -- site
.factory('sharedScope', function () {
    return {
      site: {}
    };
})

.filter('capitalize', function() {
    return function(input, all) {
      return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    }
});

app.controller('AppCtrl', ['$mdComponentRegistry', '$scope', 'sharedScope', '$sce', '$location', '$mdSidenav', '$mdBottomSheet', '$mdDialog', '$mdToast', '$timeout', '$http', 'rulesEngine', 'filterFilter', '$filter', 'Fullscreen', 'appConfig', '$auth',
  function($mdComponentRegistry, $scope, sharedScope, $sce, $location, $mdSidenav, $mdBottomSheet, $mdDialog, $mdToast, $timeout, $http, rulesEngine, filterFilter, $filter, Fullscreen, appConfig, $auth ){

  /* UI FUNCTIONS ====================================================- */ 

  // Show Full Screen button
  $scope.isFullScreen = false;
  $scope.toggleFullScreen = function() {
    if (Fullscreen.isEnabled()){
      Fullscreen.cancel();
      $scope.isFullScreen = false;
    } else {
      Fullscreen.all();
      $scope.isFullScreen = true;
    }
  }

  // Toast Message
  $scope.message = function(message) {
    $mdToast.show( 
        $mdToast.simple()
          .content(message)
          .position('bottom left')
          .hideDelay(2000) 
    );
  };

  // Alert Dialog
  $scope.alert = function(title,content) {
    $mdDialog.show(
      $mdDialog.alert()
        .parent(angular.element(document.querySelector('#preview')))
        .clickOutsideToClose(true)
        .title(title)
        .content(content)
        .ariaLabel(title)
        .ok('close')
    );
  };

  // Help Dialog
  $scope.help = function(title,pageStub) {
    var parentEl = angular.element(document.body);
    $mdDialog.show({
      controller: 'DialogCtrl',
      templateUrl: 'partials/dialog.help.html',
      locals: {
        title: title,
        content: $scope.configuratorPages[pageStub] 
      },    
      parent: parentEl,
      clickOutsideToClose:true
    });
  };

  // Side Panel
  $scope.sidenavPage = function(title,content) {
    $scope.panelTitle = title;
    $scope.panelContent = $sce.trustAsHtml(content);   
    $mdSidenav('pageDetailPanel').open();
  };
  $scope.toggleSidenav = function(menuId) {
    $mdSidenav(menuId).toggle();
  }; 

  // Bottom Panel
  $scope.showBottomSheet = function($event) {
    $mdBottomSheet.show({
      templateUrl: 'partials/bottom_sheet.html',
      controller: 'BottomSheetCtrl',
      targetEvent: $event
    }).then(function(clickedItem) {
      $scope.alert('In Development', clickedItem.name + ' button was clicked.');
    });
  };

  // Configuration Tab + Accordion Navigation
  $scope.goTo = function(tabIndex,paneIndex) {
    if( $mdComponentRegistry.get( 'artDetailPanel' ) && $mdSidenav('artDetailPanel').isOpen() ){
      $mdSidenav('artDetailPanel').close()
    }    
    if( $mdComponentRegistry.get( 'frameDetailPanel' ) && $mdSidenav('frameDetailPanel').isOpen() ){
      $mdSidenav('frameDetailPanel').close()
    }        
  
    if(tabIndex == 'design') $scope.selectedTabIndex = 0;
    if(tabIndex == 'options') $scope.selectedTabIndex = 1;
    if(tabIndex == 'summary') $scope.selectedTabIndex = 2;
    if(tabIndex == 'order') $scope.selectedTabIndex = 3;      
 
    if( paneIndex != undefined && paneIndex !='' ){

      if(angular.element(document.querySelector('#edit_'+paneIndex)).attr('aria-selected') == 'false'){
        $timeout(function() {
          angular.element(document.querySelector('#edit_'+paneIndex)).triggerHandler('click');
        }, 100);   
      }        
    }

  };


  /** RULES ENGINE *********************************************************************
  * 
  *  Rules to process and validate changes to the configuration. Rule format:
  *  name                                
  *  priority                            sort order
  *  on                                  skip rule if off.
  *  condition
  *    cb(true|false);                   if true, run consequence.
  *  consequence 
  *    this.goto="configurator";         where to go to after rules are run
  *    this.stopRules=true|false;        stop processing rules & go directly to callback
  *    cb(restart_on_change=true|false); defaults to true;   
  *
  **************************************************************************************/  
  
  // RULES
  var rules = [

    { "name": "Reset canorder every loop.",
        "priority": 0,
        "on": 1,
        "condition": function (fact, cb) {
          cb(true); 
        },
        "consequence": function (cb) {
          this.canorder=1;
          cb(false);
        }  

    },{ "name": "Remove Frame if not Frame",
        "priority": 0,
        "on": 1,
        "condition": function (fact, cb) {
          cb( fact.type == 'frameless mirror' && fact.frame.style.styleid); 
        },
        "consequence": function (cb) {
          this.frame = {
            style: {},
            finish: {},
            price_frame: 0
          };    
          this.liner = {
            linerid:      "",
            price_liner:  0,
          };
          this.previewimage.preview_front_frame = "";
          cb(false);
         }  

    },{ "name": "Remove Art if not Art",
        "priority": 0,
        "on": 1,
        "condition": function (fact, cb) {
          cb( fact.type.indexOf('art') < 0 && fact.art.artid != ""); 
        },
        "consequence": function (cb) {
          this.art = {  
            artid:          "",
            name:           "",
            credit:         "",
            price_art:        0,
            price_subframe:   0     
          };
          this.artcontrol = {
            artcontrolid:    "",
            artcontroltext:   "", 
            base:             0,
            factor:           0,      
            price_artcontrol: 0
          };
          cb(false);
        }  

    },{ "name": "Remove Speaker Bar if not Artwork",
        "priority": 0,
        "on": 1,
        "condition": function (fact, cb) {
          cb( fact.type.indexOf('art') < 0 && fact.speakerbar.hasspeakerbar != 0); 
        },
        "consequence": function (cb) {
          this.speakerbar = {  
            hasspeakerbar:  "0",
            makemodel:    "",
            mounted:    "",
            gap:      0,
            instuctions:  "",
            price_speakerbar: 0 
          };
          cb(false);
        }

    },{ "name": "Remove Mirror if not Mirror",
        "priority": 0,
        "on": 1,
        "condition": function (fact, cb) {
          cb( fact.type.indexOf('mirror') < 0 && fact.mirror.mirrorid != ""); 
        },
        "consequence": function (cb) {
          this.mirror = {  
            mirrorid:     "",
            name:         "",
            base:         0,
            factor:       0,
            price_mirror: 0   
          };
          this.previewimage.preview_front_mirror = '';
          cb(false);
        }  

    },{ "name": "Art side depth is 3 - reset default",
        "priority": 1,
        "on": 1,
        "condition": function (fact, cb) {
          //cb(fact.type.indexOf('art') < 0 && fact.sidedepth.sidedepth == 1.5); 
          cb(fact.type.indexOf('art') < 0); 
        },
        "consequence": function (cb) {
          /*
          this.sidedepth = {
            sidedepth:         0.0,
            sidedepthid:       1133,
            sidedepthtext:     "Recessed",  
            price_sidedepth:    0.0,
          }*/
          this.sidedepth = {
            "sidedepth": 3,
            "sidedepthid": 3,
            "sidedepthtext": "3-inch Universal",
            "price_sidedepth": 0
          };        
          this.stopRules = false;
          cb(false);
        }

    },{ "name": "If screen size not set, stop.",
        "priority": 1,
        "on": 1,
        "condition": function (fact, cb) {
          cb(fact.tv.diagscreensize <= 0); 
        },
        "consequence": function (cb) {
          this.tv.speakerlayout = "M"; 
          this.canorder=0;
          this.gototab="design";
          this.gotopane="tv";
          this.stopRules = true;
          cb(false);
        }

    },{ "name": "Set Default Install Method by Diag Size",
        "priority": 2,
        "on": 1,
        "condition": function (fact, cb) {
          cb(fact.tv.diagscreensize > 0 && fact.installmethod.installmethodid <= 0 ); 
        },
        "consequence": function (cb) {
          if ( this.type == 'frame only' ||  this.tv.diagscreensize < 50 ) {
            this.installmethod = {
              "installmethodid": 1,
              "installmethodtext": "Straps",
              "base": 0,
              "factor": 0,
              "price_installmethod": 0                
            }; 
          } else {
            this.installmethod = {
              "installmethodid": 2,
              "installmethodtext": "L-Bracket",
              "base": 0,
              "factor": 0,
              "price_installmethod": 0
            }; 
          }
          cb(false);
        }
    
    },{ "name": "Set Default TV Control",
        "priority": 3,
        "on": 1,
        "condition": function (fact, cb) {
          cb( !fact.tvcontrol.tvcontrolid ); 
        },
        "consequence": function (cb) {
          this.tvcontrol = { 
            "tvcontrolid": 1,
            "tvcontroltext": "IR-2",
            "base": 99,
            "factor": 0,
          };
          cb(false);
         }  

    },{ "name": "Set Default Art Control",
        "priority": 4,
        "on": 1,
        "condition": function (fact, cb) {
          cb( fact.type.indexOf('art') >= 0 && !fact.artcontrol.artcontrolid ); 
        },
        "consequence": function (cb) {
          this.artcontrol = { 
            "artcontrolid": "R",
            "artcontroltext": "Motorized - Remote Control",
            "base": 0,
            "factor": 0
          };
          cb(false);
        }   

    },{ "name": "Set Install Method Price",
        "priority": 5,
        "on": 1,
        "condition": function (fact, cb) {
          cb( fact.installmethod.installmethodid > 0 ); 
        },
        "consequence": function (cb) {
          if( this.tv.diagscreensize > 0 ) {  
            this.installmethod.price_installmethod = $scope.calculateInstallMethodPrice(this.installmethod);
          } else {
            this.installmethod.price_installmethod = 0;
          }
          cb(false);
        }   

    // PRICES

    },{ "name": "Set Art Price",
        "priority": 6,
        "on": 1,
        "condition": function (fact, cb) {
          cb( fact.type.indexOf('art') > 0 ); 
        },
        "consequence": function (cb) {
          if( this.tv.diagscreensize > 0 && this.art.artid > 0 ) {  
            this.art.price_art = $scope.calculateArtPrice(this.art.credit);
            this.art.price_subframe = $scope.calculateArtSubframePrice(this.art.credit);
          } else {
            this.art.price_art = 0;
            this.art.price_subframe = 0;
          }
          cb(false);
        }  

    },{ "name": "Set TV Control Price",
        "priority": 7,
        "on": 1,
        "condition": function (fact, cb) {
          cb( fact.tvcontrol.tvcontrolid >= 0 ); 
        },
        "consequence": function (cb) {
          this.tvcontrol.price_tvcontrol = $scope.calculateTvControlPrice(this.tvcontrol);
          cb(false);
        }  

    },{ "name": "Set Art Control Price",
        "priority": 8,
        "on": 1,
        "condition": function (fact, cb) {
          cb( fact.type.indexOf('art') >= 0 ); 
        },
        "consequence": function (cb) {
          if( this.tv.diagscreensize > 0 ) {  
            this.artcontrol.price_artcontrol = Math.ceil( this.artcontrol.base + (this.artcontrol.factor * this.tv.diagscreensize) );
          } else {
            this.artcontrol.price_artcontrol = 0;
          }
          cb(false);
        }   

    },{ "name": "Set Side Depth Price",
        "priority": 8,
        "on": 1,
        "condition": function (fact, cb) {
          cb( fact.sidedepth.sidedepth ); 
        },
        "consequence": function (cb) {
          if( this.tv.diagscreensize > 0 ) {  
            this.sidedepth.price_sidedepth = $scope.calculateSideDepthPrice(this.sidedepth.sidedepth);
          } else {
            this.artcontrol.price_sidedepth = 0;
          }
          cb(false);
        }   

    // FRAME 

    },{ "name": "Frame Finish Not Set for Premium Hardwood",
        "priority": 9,
        "on": 1,
        "condition": function (fact, cb) {
          cb(fact.type.indexOf('frameless') < 0 && fact.frame.style.category == "H" && fact.frame.finish.finishid == null); 
        },
        "consequence": function (cb) {
          this.canorder=0;
          this.gototab="design";
          this.gotopane="frame";
          this.stopRules = true;
          cb(false);
        }                                    
      
    },{ "name": "Frame Not Set - Metro",
        "priority": 10,
        "on": 1,
        "condition": function (fact, cb) {
          cb(fact.frame.style.id == null && fact.type.indexOf('metro') >= 0); 
        },
        "consequence": function (cb) {
          this.canorder=0;
          this.gototab="design";
          this.gotopane="frame";
          this.stopRules = true;
          cb(false);
        }

    },{ "name": "Frame Not Set - Standard",
        "priority": 11,
        "on": 1,
        "condition": function (fact, cb) {
          cb(fact.type.indexOf('frameless') < 0 && fact.frame.style.id == null); 
        },
        "consequence": function (cb) {
          this.canorder=0;
          this.gototab="design";
          this.gotopane="frame";
          this.stopRules = true;
          cb(false);
        } 

    },{ "name": "Frame Preview Image and Price",
        "priority": 12,
        "on": 1,
        "condition": function (fact, cb) {
          cb(fact.frame.style.styleid != null); 
        },
        "consequence": function (cb) {
          this.frame.price_frame = $scope.calculateStylePrice(this.frame.style.stylefactor,this.frame.style.stylebase);

          if(this.frame.finish.finishid != null){
              this.previewimage.preview_front_frame = "FRM42" + this.tv.speakerlayout + "-" + this.frame.style.stylename + "11-" + this.frame.finish.finishid + "-F.png";
              this.frame.price_frame += $scope.calculateFinishPrice(this.frame.finish.colorfactor,this.frame.finish.colorbase);
                
          } else {
            this.previewimage.preview_front_frame = "FRM42" + this.tv.speakerlayout + "-" + this.frame.style.styleid + "-10-F.png";            
          }

          if(this.tv.diagscreensize == 0) this.frame.price_frame = 0;

          //console.log('frame image set to ' + this.previewimage.preview_front_frame);
          cb(false);
        }

    // LINER 

    },{ "name": "Liner category must match frame category",
        "priority": 13,
        "on": 1,
        "condition": function (fact, cb) {
          cb(fact.liner.linerid > 0  && fact.frame.style.category && fact.liner.category.indexOf(fact.frame.style.category) == -1 ); 
        },
        "consequence": function (cb) {
          this.liner={linerid: "", price_liner: 0};
          this.canorder=0;
          this.stopRules = false;
          cb(false);
        }

    },{ "name": "No Liner (5) only available for Hardwood no art",
        "priority": 14,
        "on": 1,
        "condition": function (fact, cb) {
          cb(fact.liner.linerid == 5 && ( fact.frame.style.category !='H' || fact.type.indexOf('art') > 0 ) ); 
        },
        "consequence": function (cb) {
          this.liner={linerid: "", price_liner: 0};
          $scope.alert('Liner Required','A liner is required for you frame. Please select a liner color.');  
          this.canorder=0;
          this.gototab="design";
          this.gotopane="liner";
          this.stopRules = true;
          cb(false);
        }

    },{ "name": "Set Default Liner if FrameID and not linerID",
        "priority": 15,
        "on": 1,
        "condition": function (fact, cb) {
          cb(fact.frame.style.styleid && !fact.liner.linerid );  
        },
        "consequence": function (cb) {

          //No liner for frameless mirror and Metro mirror 
          if(this.type == 'frameless mirror' || this.type == 'metro mirror' ) {
            this.liner={linerid: 0, price_liner: 0};
          
          } else {

            if( this.frame.style.category =="M") {
              this.liner = {
                "linerid": 8,
                "price_liner": 191,
                "linertext": "Metro Black",
                "previewimage": "FMT-LIN-W2319.png",
                "category": "M",
                "base": 95,
                "factor": 3
              };  
            
            } else {
             this.liner = {
                "linerid": 3,
                "linertext": "Black",
                "previewimage": "FMT-LIN-M2319.png",
                "category": "S,A,H",
                "base": 55,
                "factor": 2,
                "price_liner": 119
              };  
            }
            this.gototab="design";
            this.gotopane="liner";
            this.stopRules = true; 
          }

          cb(false);
        }

    },{ "name": "Set Liner Price",
        "priority": 16,
        "on": 1,
        "condition": function (fact, cb) {
          cb( fact.liner.linerid > 0 ); 
        },
        "consequence": function (cb) {
          if( this.tv.diagscreensize > 0 ) {  
            this.liner.price_liner =  $scope.calculateLinerPrice(this.liner);
          } else {
            this.liner.price_liner = 0;
          }
          cb(false);
        }      

    // ART & MIRROR

    },{ "name": "Art Not Set",
        "priority": 17,
        "on": 1,
        "condition": function (fact, cb) {
          cb( fact.type.indexOf('art') > 0 && fact.art.artid <= 0); 
        },
        "consequence": function (cb) {
          this.canorder=0;
          this.gototab="design";
          this.gotopane="art";
          this.stopRules = true;
          cb(false);
        }

    },{ "name": "Mirror Not Set",
        "priority": 18,
        "on": 1,
        "condition": function (fact, cb) {
          cb( fact.type.indexOf('mirror') > 0 && fact.mirror.mirrorid <= 0); 
        },
        "consequence": function (cb) {
          this.canorder=0;
          this.gototab="design";
          this.gotopane="mirror";
          this.stopRules = true;
          cb(false);
        }

    },{ "name": "Set Mirror Price",
        "priority": 19,
        "on": 1,
        "condition": function (fact, cb) {
          cb( fact.type.indexOf('mirror') > 0 ); 
        },
        "consequence": function (cb) {
          if( this.tv.diagscreensize > 0 && this.mirror.mirrorid > 0 ) {  
            this.mirror.price_mirror =  $scope.calculateMirrorPrice(this.mirror);
          } else {
            this.mirror.price_mirror = 0;
          }
          cb(false);
        }

    },{ "name": "Mirror Preview Image",
        "priority": 20,
        "on": 1,
        "condition": function (fact, cb) {
          cb( fact.type.indexOf('mirror') >= 0 && fact.mirror.mirrorid > 0); 
        },
        "consequence": function (cb) {
          this.previewimage.preview_front_mirror = "Mirror" + this.tv.speakerlayout + "0" + this.previewimage.wallid + "00.png";
          //console.log('mirror preview image set to ' + this.previewimage.preview_front_mirror);
          cb(false);
        }

    // INSTALL

    },{ "name": "Goto Mounted",
      "priority": 21,
      "on": 1,
      "condition": function (fact, cb) {
        cb( fact.mounted.type == ''); 
      },
      "consequence": function (cb) {
        this.canorder=0;
        this.gototab="options";
        this.gotopane="installation";
        this.stopRules = true;
        cb(false);
      }

    },{ "name": "Goto Installation",
      "priority": 22,
      "on": 1,
      "condition": function (fact, cb) {
        cb(fact.installmethod.installmethodid == 0); 
      },
      "consequence": function (cb) {
        this.canorder=0;
        this.gototab="options";
        this.gotopane="installation";
        this.stopRules = true;
        cb(false);
      }

    },{ "name": "If has speaker bar but not mounted or gap is not set, go to",
      "priority": 23,
      "on": 1,
      "condition": function (fact, cb) {
        // || fact.speakerbar.makemodel == ''
        cb(fact.speakerbar.hasspeakerbar == true && (fact.speakerbar.mounted == '' ) ); 
      },
      "consequence": function (cb) {
        this.canorder=0;
        this.gototab="options";
        this.gotopane="speakers";
        this.stopRules = true;
        cb(false);
      }

    },{ "name": "If options reviewed, goto Summary",
      "priority": 99,
      "on": 1,
      "condition": function (fact, cb) {
        //cb(fact.optionsreviewed == 1)
        cb(true);
      },
      "consequence": function (cb) {
        this.gototab="summary";
        cb(false);
      } 

    }
  ];

  // Load the rules into the rules engine.
  rulesEngine.init(rules);

  // Function to run the rules
  var doRules = function(){

    rulesEngine.execute( $scope.configuration, function(configuration) {

      $scope.configuration = angular.copy(configuration); 

      $scope.configuration.pricetotal = 
        $scope.configuration.frame.price_frame +
        $scope.configuration.mirror.price_mirror +
        $scope.configuration.art.price_art +
        $scope.configuration.art.price_subframe +
        $scope.configuration.liner.price_liner +
        $scope.configuration.artcontrol.price_artcontrol +
        $scope.configuration.tvcontrol.price_tvcontrol +
        $scope.configuration.sidedepth.price_sidedepth +
        $scope.configuration.installmethod.price_installmethod +
        $scope.configuration.speakerbar.price_speakerbar +
        $scope.configuration.speakerconcealment.price_acoustimat;

      if( $scope.configuration.custom.length ){
        for( charge in $scope.configuration.custom) {
          $scope.configuration.pricetotal += charge.price;
        }
      }

      delete $scope.configuration.stopRules;
      delete $scope.configuration.gototab;
      delete $scope.configuration.gotopane;

      // Navigate to the next configuration tab/accordion panel
      if( configuration.gototab.length){
        $scope.goTo(configuration.gototab,configuration.gotopane);
      }

    });   

    // If type is not set, open the type dialog panel.
    if( $scope.configuration.type == '' ){
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        controller: 'TypeCtrl as ctrl',
        templateUrl: 'partials/dialog.type.html',
        parent: parentEl,
        clickOutsideToClose:false
      }).then(function(type) {
        $scope.configuration.type = type;
        doRules();
      })     
    }

  };  


  /** INITIALIZE ***********************************************************
  * You can call this page with the following URL parameters:
  *  id = configuration id to load. Will also set the store
  *  store = account_id of reseller to load custom theme
  *  frame
  *  finish
  *  mirror
  *  art
  *  liner
  **************************************************************************/

  // Get URL Parameters and remove prams from the browser's url.
  var URLparams = angular.copy($location.search()); 
  $location.search({});

  // Authentication
  /* $auth.getPayload = { 
          NAME: "Test User", 
          BASKET: "150823182707_73_129_72_88", 
          ROLE: "Administrator",                // user group
          EXP: 1452366864262, 
          EMAIL: "mj@attentionplease.com", 
          ASSOCIATEID: "",                      // user is associated with this account id
          USERID: 8 
    } 
  */     
  $scope.currentuser = function() {
    return $auth.getPayload();
  };
  $scope.isAuthenticated = function() {
    return $auth.isAuthenticated();
  };
  $scope.isAdmin = function() {
    return ($scope.currentuser.ROLE ="Administrator") ? true : false;
  };
  $scope.isAccountAdmin = function() {
    return ($scope.currentuser.USERID = $scope.site.admin_id) ? true : false;
  };
  $scope.isAccountAssociate = function() {
    return ($scope.currentuser.ASSOCIATEID = $scope.configuration.meta.account_id) ? true : false;
  };

  $scope.currentusername = function() {
    if( !$auth.isAuthenticated() ) return '';
    var user = $auth.getPayload();
    if( user.NAME.length ) { 
      return user.NAME;
    } else {
      return user.EMAIL;
    }
  };

  // Load configuration
  var loadConfiguration = function(args) {

    // args will hold an object of args or a single configuration ID
    var loadParams = {};

    if (typeof args === 'object') {
      loadParams = args;
    } else {
      loadParams.id = args;
    }

    var configuration_id = loadParams.id != undefined ? loadParams.id : '';  
    var account_id = loadParams.store != undefined ? loadParams.store : 0;  
    var frame = loadParams.frame != undefined ? loadParams.frame : ''; 
    var finish = loadParams.finish != undefined ? loadParams.finish : '';  
    var mirror = loadParams.mirror != undefined ? loadParams.mirror : '';  
    var art = loadParams.art != undefined ? loadParams.art : '';  
    var liner = loadParams.liner != undefined ? loadParams.liner : '';  

    $scope.configuration = {};

    console.log("Start configuration load.")

    // Look up existing configuration
    if( configuration_id.length ){

      console.log("Configuration id provided.");

      $http({
        method: 'GET', 
        url: appConfig.endpoint + '/configuration/' + configuration_id
      }).success(function(response, status, headers, config) {

        console.log("configuration retrieved.");

        if( response.result == true) {
          $scope.configuration = response.data.DesignData;
          console.log("configuration restored.");
        } else {
          console.log(response);
        }

      });

    }

    // Load new configurator
    if( !Object.keys($scope.configuration).length ){

      $scope.configuration = {
        // Meta are the other 'configurations' database table fields
        meta: { 
          configuration_id:   "", 
          name:               "",
          user_id:            0,           
          account_id:         account_id,       
          basketnum:          "",      
          job_name:           "My Design",
          ispublic:           1,
          buyer_comments:     "", 
          adminnotes:         "",
          orders_id:          "",
          status:             "",           
          dateadded:          "",      
          dateupdated:        ""
        },
        
        // Order submit variables to be stored in AdditionalInfo
        orderform: {        
          points:             0,
          shipping_surcharge: 0,
          shipping_extradays: 0,
          rush:               0,
          rush_charge:        0
        },

        // frame-only, frame-with-mirror, frame-with-art, frameless-mirror, metro-mirror, metro-art
        type:                 "",  
        pricetotal:           0,
        canorder:             1,
        previewimage: {
          wallid:             6,    
          xscreen:            1     
        },

        tv: {
          id:                 "",
          makemodel:          "", 
          diagscreensize:     "",
          height:             "",     
          width:              "",
          speakerlayout:      "", 
          previewimage:       ""  
        },
        frame: {
          style:              {},
          finish:             {},
          price_frame:        0
        },    
        mirror: {
          mirrorid:           "",
          name:               "",
          base:               0,
          factor:             0,
          price_mirror:       0   
        },        
        art: {
          artid:              "",
          name:               "",
          credit:             "",
          price_art:          0,
          price_subframe:     0     
        },
        liner: {
          linerid:            "",
          price_liner:        0,
        },      
        artcontrol: { 
          artcontrolid:       "",
          artcontroltext:     "", 
          base:               0,
          factor:             0,      
          price_artcontrol:   0
        },
        tvcontrol: {
          tvcontrolid:        "", 
          tvcontroltext:      "", 
          base:               0,
          factor:             0,      
          price_tvcontrol:    0  
        },      
        sidedepth: {
          sidedepth:          0.0,
          sidedepthid:        1133,
          sidedepthtext:      "Recessed",  
          price_sidedepth:    0.0,
        },
        mounted:    {
          type:               "",    
          height:             0,
          width:              0,
          recess:             "",
          recessheight:       "",
          recesswidth:        "",
        },     
        installmethod: {
          installmethodid:    "",
          installmethodtext:  "", 
          base:               0,
          factor:             0,        
          price_installmethod:  0
        },        
        speakerbar:   {
          hasspeakerbar:      "0",
          makemodel:          "",
          mounted:            "",
          gap:                0,
          instuctions:        "",
          price_speakerbar:   0
        },
        speakerconcealment: {
          acoustimat:         0,
          acoustimatid:       "",
          acoustimattext:     "",
          price_acoustimat:   0
        },
        //backbox: {
        //  backboxid:        "",
        //  backboxtext:      "",
        //  price_backbox:      0
        //},
        //bracketjacket: {
        //  bracketjacketid:    "",
        //  price_bracketjacket:  0   
        //},
        custom: [
          //{ description: "", price: 0 }
          ]
      }; 
    }

    // Load frame 
    if( frame.length ){  
      $http({
        method: 'GET', 
        url: appConfig.endpoint + '/framestyle/' + frame
      }).success(function(response, status, headers, config) {
        if( response.result == 'true') {
          $scope.configuration.frame.style = response.data[0];
        } else {
          $scope.alert('Error 988',response.error);
        } 
      });
    }

    // Load frame finish
    if( finish.length ){ 
      $http({
        method: 'GET', 
        url: appConfig.endpoint + '/finish/' + finish
      }).success(function(response, status, headers, config) {
        if( response.result == 'true') {
          $scope.configuration.frame.finish = response.data[0];
        } else {
          $scope.alert('Error 1002',response.error);
        } 
      });
    }

    // Load mirror
    if( mirror.length ){
      $http({
        method: 'GET', 
        url: appConfig.endpoint + '/mirror/' + mirror
      }).success(function(response, status, headers, config) {
        if( response.result == 'true') {
          var mirror = response.data[0];
          $scope.configuration.mirror.mirrorid = mirror.mirrorid;
          $scope.configuration.mirror.name = mirror.name;
          $scope.configuration.mirror.base = parseInt(mirror.base);
          $scope.configuration.mirror.factor = parseInt(mirror.factor);
        } else {
          $scope.alert('Error 1020',response.error);
        } 
      });

      if( URLparams.frame == null ){
        $scope.configuration.type = "frameless mirror"; 
      } else {
        $scope.configuration.type = "frame with mirror";
      }
    }   

    // Load art
    if( art.length ){
      $http({
        method: 'GET', 
        url: appConfig.endpoint + '/art/' + art
      }).success(function(response, status, headers, config) {
        if( response.result == 'true') {
          var art = response.data[0];
          $scope.configuration.art.artid = art.headline;
          $scope.configuration.art.name = art.name + " by " + art.byline;
          $scope.configuration.art.credit = art.credit;
          $scope.configuration.type = "frame with art"; 
        } else {
          $scope.alert('Error 1044',response.error);
        } 
      });
    }     

    // Load liner
    if( liner.length ){
      
      $http({
        method: 'GET', 
        url: appConfig.endpoint + '/liner/' + liner
      }).success(function(response, status, headers, config) {
        if( response.result == 'true') {
          var liner = response.data[0];
          $scope.configuration.liner.linerid = liner.linerid;
          $scope.configuration.liner.linertext = liner.caption;
          $scope.configuration.liner.previewimage = liner.previewimage;
          $scope.configuration.liner.category = liner.category;
          $scope.configuration.liner.base = parseInt(liner.base);
          $scope.configuration.liner.factor = parseInt(liner.factor);
        } else {
          $scope.alert('Error 1065',response.error);
        } 
      });
    }     

    // Run the rules
    doRules();

    $scope.configurationClean = angular.copy($scope.configuration);
    delete $scope.configurationClean.stopRules;
    delete $scope.configurationClean.gototab;
    delete $scope.configurationClean.gotopane;
  }
  loadConfiguration(URLparams);

  // Save configuration only if dirty (not clean)
  $scope.isClean = function() {
    return  JSON.stringify($scope.configuration) == JSON.stringify($scope.configurationClean);
    //angular.equals($scope.configuration, $scope.configurationClean);
  }  

  // set theme ($scope.site) to configuration.account_ID
  var setTheme = function(){

    $scope.site = {
      accountid: $scope.configuration.meta.account_id,
      title: 'Design Center',
      logo: 'assets/img/fmtv_225.png',   // fmtv_225.png, NorthStar.jpg, lowellEdwards.png
      weburl: '',
      theme: 'default',       // default, red, blue, brown, blue-gray
      titlebarColor: '',
      adminid: '' 
    };

    if($scope.configuration.meta.account_id > 0){

      $http({
        method: 'GET', 
        url: appConfig.endpoint + '/account/' + $scope.configuration.meta.account_id
      }).success(function(response) {
        console.log(response);

        if( response.result ) {
          var accountData = response.data[0];

          console.log(accountData.Account_name);

          $scope.site = {
            siteid: $scope.configuration.meta.account_id,
            title: accountData.Account_name,
            weburl: accountData.web_url,
            logo: accountData.logo, 
            titlebarColor: accountData.AcctField10.length ? 'background-color:' + accountData.AcctField10 : '',
            theme: accountData.AcctField9.length ? accountData.AcctField9 : 'default',
            adminid: accountData.user_id 
          } 

          console.log($scope.site);
        } else {
          $scope.alert('Error 1104',response.error);
        }

      });
    }

    sharedScope.site = $scope.site;
  }
  setTheme();

  // Load the configurator pages
  $scope.configuratorPages = {};
  
  $http({
    method: 'GET', 
    url: appConfig.endpoint + '/page'
  }).success(function(response, status, headers, config) {
    if(response.result) $scope.configuratorPages = response.data;
    else $scope.alert('Error 1123',response.error);
  });


  /** CONFIGURATOR FUNCTIONS  *************************************************
  *
  *  
  ****************************************************************************/

  /* LOGIN / LOGOUT  ======================================================- */
  $scope.loginDialog = function() {
    
    $mdSidenav('left').close();

    var parentEl = angular.element(document.body);
    $mdDialog.show({
      controller: 'LoginCtrl as ctrl',
      templateUrl: 'partials/dialog.login.html',
      parent: parentEl,
      clickOutsideToClose:false
    }).then(function(message) {
      $scope.message(message);
    })     
  }

  $scope.loginout = function() {  
    $mdSidenav('left').close();
    $scope.message("Logged Out");   
  }

  /* RESET CONFIGURATION BUTTONS ===========================================- */

  $scope.newConfiguration = function() {
    loadConfiguration();
    $mdSidenav('left').close();
  }

  $scope.resetType = function() {  
    $scope.configuration.type = '';
    $mdSidenav('left').close();
    doRules();
  }

  $scope.openConfigurationsDialog = function() {
    $mdSidenav('left').close();

    // hide configuration.
    $scope.configuration.type = '';

    var parentEl = angular.element(document.body);
    $mdDialog.show({
      controller: 'ConfigurationsCtrl as ctrl',
      templateUrl: 'partials/dialog.configurations.html',
      parent: parentEl,
      clickOutsideToClose:false
    }).then(function(type) {
      // $scope.configuration.type = type;

      alert("close configurations dialog");
    })     
  }
  

  /* TV SIZE ================================================================- */
  var clearTVModel = function() {
    $scope.configuration.tv.id = "";
    $scope.configuration.tv.diagscreensize = "";
    $scope.configuration.tv.height = "";
    $scope.configuration.tv.width = "";
    $scope.configuration.tv.previewimage = "";
    $scope.configuration.tv.speakerlayout = "M";      
  }
  
  /* Model Lookup  - makeModelFound used for error message */
  $scope.makeModelFound = true;
  
  // typeahead data
  $scope.qryModels = function(val) {
    return $http({
      method: 'GET', 
      url: appConfig.endpoint + '/tv',
      params: {q:val}
    })
    .then(
      function(response) {
        if( response.data.result ) {
          $scope.makeModelFound = (response.data.data.length ? true : false); 
          return response.data.data;
        } else {
          return [];
        } 
      }
    );
  };

  
  // Callback - clearTVModel(); 
  $scope.onSelectTVModelName = function ($item, $model, $label) {
    $scope.configuration.tv = $item;
  };

  
  /* Standard Diag Screen Size buttons */
  $scope.lkupScreenSizes = [
    {value: 32, text: '32'},
    {value: 40, text: '40'},
    {value: 42, text: '42'},
    {value: 46, text: '46'},
    {value: 50, text: '50'},
    {value: 55, text: '55'},
    {value: 60, text: '60'},
    {value: 65, text: '65'},
    {value: 70, text: '70'},  
    {value: 75, text: '75'},  
    {value: 80, text: '80'},  
    {value: 90, text: '90'}
    ]; 
  
  // Show message when diagscreensize is set
  var timeoutPromise;
  $scope.$watch("configuration.tv.diagscreensize", function(newValue, oldValue) {
      $timeout.cancel(timeoutPromise);       //does nothing, if timeout already done
      timeoutPromise = $timeout(function(){   //Set timeout
      if( newValue != oldValue && newValue != undefined && newValue !=''){
        $scope.message("TV diagonal screen size set to " + newValue + " inches.");
        doRules();
      }    
    },500);
  });
      
  // Clicking a standard screen size button updates model & clears height & width
  $scope.standardSizeClick =function(size){
    clearTVModel();
    $scope.configuration.tv.diagscreensize = size;
  };
  
  // Display screen size.
  $scope.showTvDiagScreenSize = function(){ 
    var selected = $filter('filter')($scope.lkupScreenSizes, {value: $scope.configuration.tv.diagscreensize});
    return ($scope.configuration.tv.diagscreensize && selected.length) ? selected[0].text : 'Not set';  
  };
  
  // Entering a diagscreensize sets manual to true.
  $scope.diagscreensizeFocus = function(){
    clearTVModel();
  };  
  

  // Dimensions- Calculate diag screen size when a valid height and width are entered (called on field blur)
  $scope.calculatediagscreensize = function(){
    var heightVal = $scope.configuration.tv.height;
    var widthVal = $scope.configuration.tv.width;
    
    if( heightVal > 1 && widthVal > 1 ){
      clearTVModel();
      $scope.configuration.tv.diagscreensize = Math.ceil( Math.sqrt((heightVal*heightVal)+(widthVal*widthVal)) );
      $scope.configuration.tv.width = widthVal;
      $scope.configuration.tv.height = heightVal;
    }
  };

  
  /* FRAMES ======================================================- */  
  
  // Get Frame Styles
  $scope.frameStyles = [];
  $scope.frameFinishes = [];
  
  $http({
    method: 'GET', 
    url: appConfig.endpoint + '/framestyle'
  }).success(function(response, status, headers, config) {
    if(response.result) $scope.frameStyles = response.data;
    else $scope.alert('Error 1249',response.error);
  });


  // Style Price Calculation
  $scope.calculateStylePrice = function (stylefactor,stylebase) {
    if( $scope.configuration.tv.diagscreensize >= 52 ){ 
      stylefactor += 4; 
    }     
    return Math.ceil( parseInt(stylebase) + (parseInt(stylefactor) * $scope.configuration.tv.diagscreensize ) );
  }
  
  // Select Frame
  $scope.selectFrameStyle = function (style) {
    $scope.configuration.frame.style = style;
    $scope.message("Frame " + style.caption + " selected.");

    if(style.category == 'H'){
      $http({
        method: 'GET', 
        url: appConfig.endpoint + '/finishes',
        params: {stylename:style.stylename}
      }).success(function(response, status, headers, config) {
          if(response.result) $scope.frameFinishes = response.data;
          else $scope.alert('Error 1273',response.error);
      });
    } 

    if( $mdSidenav('frameListPanel').isOpen() ){
      $mdSidenav('frameListPanel').close()
    }
    if( $mdSidenav('frameDetailPanel').isOpen() ){
      $mdSidenav('frameDetailPanel').close()
    }
    doRules();
  }
  
  // Finish Price Calculation
  $scope.calculateFinishPrice = function (colorfactor,colorbase) { 
    return  Math.ceil( parseInt(colorbase) + (parseInt(colorfactor) * $scope.configuration.tv.diagscreensize ) );
  }

  // Select Frame Finish
  $scope.selectFrameFinish = function (finish) {
    $scope.configuration.frame.finish = finish;
    $scope.message("Frame finish " + finish.finishname + " selected.");
    doRules();
  }

  $scope.openFramesList = function(title,filterBy) {
    $scope.panelTitle = title;
    $scope.listingType = 'frame';
    $scope.filterBy = filterBy;
    $mdSidenav('frameListPanel').open();
  };

   $scope.openFramesDetail = function(title,frame) {
    $scope.panelTitle = title;
    $scope.item = frame;
    $mdSidenav('frameDetailPanel').open();
  };


  /* MIRROR =======================================================- */ 

  $scope.mirrors = [];

  $http({
    method: 'GET', 
    url: appConfig.endpoint + '/mirror'
  }).success(function(response, status, headers, config) {
    if(response.result) $scope.mirrors = response.data;
    else $scope.alert('Error 1321',response.error);
  });
  
  // calculatemirrorPrice
  $scope.calculateMirrorPrice = function (mirror) { 
    var xfactor = parseInt(mirror.factor);
    if( $scope.configuration.tv.diagscreensize >= 52 ){
      xfactor = parseInt(mirror.factor) + 4;
    }
    return Math.ceil( parseInt(mirror.base) + (xfactor * $scope.configuration.tv.diagscreensize ) );
  }


  // Select Mirror
  $scope.selectMirror = function (mirror) {
    $scope.configuration.mirror.mirrorid = mirror.mirrorid;
    $scope.configuration.mirror.name = mirror.name;
    $scope.configuration.mirror.base = parseInt(mirror.base);
    $scope.configuration.mirror.factor = parseInt(mirror.factor);
    $scope.message("Mirror '" + mirror.name + "' selected."); 
    doRules();
  }
  
  /* ARTWORK ======================================================- */ 
  
  // Get Art with infinite scroll 
  var pageSize = 20;
  var currentIndex = {'S':0, 'E':0, 'F':0};

  // Filtered catgories Standard, Exclusive and Featured
  $scope.art = {
    all: [],
    S: [],
    E: [],
    F: []
  }

  $http({
    method: 'GET', 
    url: appConfig.endpoint + '/art?maxresults=1000'
  }).success(function(response, status, headers, config) {
 
      $scope.art.all = response.Items;
      $scope.loadMoreArt('S');
      $scope.loadMoreArt('E');
      $scope.loadMoreArt('F');

  });

  $scope.openArtList = function(title,filterBy) {
    $scope.listingType = 'art';
    $scope.panelTitle = title;
    $scope.filterBy = filterBy;
    $mdSidenav('artListPanel').open();
  };

   $scope.openArtDetail = function(title,item) {
    $scope.panelTitle = title;
    $scope.item = item;
    $mdSidenav('artDetailPanel').open();
  };    

  $scope.loadMoreArt = function (category) {
    var filteredData = filterFilter($scope.art.all, {'category':category});
    if( currentIndex[category] < filteredData.length ){
          for (var i = 0; i < pageSize; i++) {
        if(currentIndex[category] + i < filteredData.length) $scope.art[category].push(filteredData[currentIndex[category] + i]);
          }
      currentIndex[category] = currentIndex[category] + pageSize; 
    }
  }

  
  // Art Price Calculation
  $scope.calculateArtPrice = function (credit) {
    return calculatedprice = Math.ceil( 2 * (credit/10) );
  }
   
  $scope.calculateArtSubframePrice = function (credit) {
    var artBase = 1400;
    var artFactor = 30;  
    if( $scope.configuration.tv.diagscreensize >= 52 ) parseInt(artFactor) += 8; 
    return calculatedprice = Math.ceil( parseInt(artBase) + (parseInt(artFactor) * $scope.configuration.tv.diagscreensize ) );
  }

  // Select Artwork
  $scope.selectArtwork = function (art) {
    if( $mdSidenav('artDetailPanel').isOpen() ){
      $mdSidenav('artDetailPanel').close()
    }    
  
    if(art == 'Custom'){
      $scope.configuration.art = {
        "artid": "Custom",
        "name": "Custom Artwork",
        "credit": "",
        "price_art": 0,
        "price_subframe": 0
      };
    } else {
      $scope.configuration.art.artid = art.headline;
      $scope.configuration.art.name = art.name + " by " + art.byline;
      $scope.configuration.art.credit = art.credit;
    }

    $scope.message("Artwork '" + art.name + "' selected.");
    $scope.configuration.type = "frame with art";     
    doRules();
  }
  

  
  /* OPTIONS ======================================================- 
  $scope.optionsreviewedClick = function(reviewed){
    $scope.message("Options have been reviewed and approved.");
    $scope.configuration.optionsreviewed = reviewed;
    doRules();
    } 
  */
  
  /* Liner --------------------------------------------------------- */
  $scope.liners = [];

  $http({
    method: 'GET', 
    url: appConfig.endpoint + '/liner'
  }).success(function(response, status, headers, config) {
    if(response.result) $scope.liners = response.data;
    else $scope.alert('Error 1450',response.error);
  });
  
  // calculateLinerPrice
  $scope.calculateLinerPrice = function (liner) {   
    return Math.ceil( parseInt(liner.base) + ( parseInt(liner.factor) * $scope.configuration.tv.diagscreensize ) );
  }
  
  // select liner
  $scope.selectLiner = function (liner) {
    $scope.configuration.liner.linerid = liner.linerid;
    $scope.configuration.liner.linertext = liner.caption;
    $scope.configuration.liner.previewimage = liner.previewimage;
    $scope.configuration.liner.category = liner.category;
    $scope.configuration.liner.base = parseInt(liner.base);
    $scope.configuration.liner.factor = parseInt(liner.factor);
    $scope.message("Liner " + liner.caption + " selected.");
    doRules();
  }

  
  /* Art Control ---------------------------------------------------- */
  $scope.artcontrols = [];

  $http({
    method: 'GET', 
    url: appConfig.endpoint + '/artcontrol'
  }).success(function(response, status, headers, config) {
    if(response.result) $scope.artcontrols = response.data;
    else $scope.alert('Error 1479',response.error);
  });

  // calculateArtControlPrice
  $scope.calculateArtControlPrice = function (item) {    
    return Math.ceil( parseInt(item.base) + (parseInt(item.factor) * $scope.configuration.tv.diagscreensize ) );
  }
    
  // select Art Control
  $scope.selectArtControl = function (item) {
    $scope.configuration.artcontrol.artcontrolid = item.artcontrolid;
    $scope.configuration.artcontrol.artcontroltext = item.name;
    $scope.configuration.artcontrol.factor = parseInt(item.factor);
    $scope.configuration.artcontrol.base = parseInt(item.base);
    $scope.message("Art Control " + item.name + " selected.");
    doRules();
  } 
  

  /* TV Control ---------------------------------------------------- */
  $scope.tvControls = [];

  $http({
    method: 'GET', 
    url: appConfig.endpoint + '/tvcontrol'
  }).success(function(response, status, headers, config) {
    if(response.result) $scope.tvControls = response.data;
    else $scope.alert('Error 1506',response.error);
  }); 

  // calculatetvControlPrice
  $scope.calculateTvControlPrice = function (item) {
    return Math.ceil(parseInt(item.base) - 99);
  }
  
  $scope.selecttvControl = function (item) {
    $scope.configuration.tvcontrol.tvcontrolid = item.tvcontrolid;
    $scope.configuration.tvcontrol.tvcontroltext = item.name;
    $scope.configuration.tvcontrol.factor = parseInt(item.factor);
    $scope.configuration.tvcontrol.base = parseInt(item.base);  
    $scope.message("TV Control " + item.name + " selected.");
    doRules();
  }       
    
  
  /* Side Depth ---------------------------------------------------- */
  $scope.calculateSideDepthPrice = function (depth) {
    if( depth == 3 && $scope.configuration.type.indexOf('art') < 0 ){
      return Math.ceil( $scope.configuration.tv.diagscreensize * 2.5 );
    } else {
      return 0;
    }
  }  
  
  $scope.selectSidedepth = function (sidedepth) {
    if( sidedepth == 1.5) {
      $scope.configuration.sidedepth = {
        sidedepth:         1.5,
        sidedepthid:       0,
        sidedepthtext:     "1.5-inch Universal",  
        price_sidedepth:    0,
      }; 
    } else if( sidedepth == 3) {
      $scope.configuration.sidedepth = {
        sidedepth:         3.0,
        sidedepthid:       3,
        sidedepthtext:     "3-inch Universal",  
        price_sidedepth:    0,
      };      
    } else {
      $scope.configuration.sidedepth = {
        sidedepth:         0.0,
        sidedepthid:       1133,
        sidedepthtext:     "Recessed",  
        price_sidedepth:    0
      };  
    }

    $scope.message("Side depth set to " + sidedepth + "-inches.");
    doRules();    
  }
        
  /* Installation -------------------------------------------------- */
  
  // mounted: S | R
  $scope.setMounted = function (mountedValue) {
    $scope.configuration.mounted.type = mountedValue;
  }
  
  $scope.installMethods = [];

  $http({
    method: 'GET', 
    url: appConfig.endpoint + '/installmethod'
  }).success(function(response, status, headers, config) {
    if(response.result) $scope.installMethods = response.data;
    else $scope.alert('Error 1575',response.error);
  }); 
    
  // calculate Install method price
  $scope.calculateInstallMethodPrice = function (item) { 
    return Math.ceil( parseInt(item.base) + (parseInt(item.factor) * $scope.configuration.tv.diagscreensize ) );
  }
    
  $scope.selectInstallMethod = function (item) {
    $scope.configuration.installmethod.installmethodid = item.installmethodid;
    $scope.configuration.installmethod.installmethodtext = item.name;
    $scope.configuration.installmethod.base = parseInt(item.base);
    $scope.configuration.installmethod.factor = parseInt(item.factor);
    $scope.message("Install Method " + item.name + " selected.");
    doRules();
  }   


  /* Speakers ------------------------------------------------------ */ 
  $scope.selectSpeakerbar = function () {
    // this is called when checkbox is clicked - the value has not been set yet.
    if($scope.configuration.speakerbar.hasspeakerbar != 1){
      $scope.configuration.speakerbar.price_speakerbar = 450;
    } else {
      $scope.configuration.speakerbar.price_speakerbar = 0;
    }
    doRules();
  }   


  /* VALIDATE AND SAVE ---------------------------------------- */ 
  $scope.hasError = function(ngModelController) { 
    if(ngModelController === undefined){ return ""};
    if(ngModelController.$invalid && ngModelController.$dirty){ return "has-error"};
    if(ngModelController.$valid && ngModelController.$dirty){ return "has-success"};
    return "";
  };
  $scope.showError = function(ngModelController, error) {
    return ngModelController.$dirty && ngModelController.$error[error];
  };
  $scope.canSave = function(ngModelController) {
    return ngModelController.$valid && ngModelController.$dirty;    
  }; 

  $scope.save = function() {

    // Create new configurationID
    // Configuration ID is varchar 16. Make a new ID using epoch 11 + random 4 chars.
    var configuration_id = (new Date).getTime().toString(16) + Math.random().toString(16).slice(2, 6);
    $scope.configuration.meta.configuration_id = configuration_id;
    
    $http.post(appConfig.endpoint + '/configuration/', $scope.configuration)
      .success(function(data, status, headers, config) {

        if( data.result == true) {
          $scope.configurationClean = angular.copy($scope.configuration);
          $scope.message("Design Saved.");
        } else {
          $scope.message(data.error);
        }
        
      });
      
  }; 

}])



/* PANELS ======================================================- */
.controller('LoginCtrl', [ '$scope', 'sharedScope', '$auth', '$mdDialog', function($scope, sharedScope, $auth, $mdDialog){

  // oAuth login providers:
  $scope.doLogin = function() {

    var user = {
      email: $scope.email,
      password: $scope.password
    };

    $auth.login(user)
      .then(function(response) {
        console.log( 'login success:' );      
        console.log( $auth.getPayload() );  
        // Redirect user after a successful log in.
        $mdDialog.hide("Welcome " + $auth.getPayload().NAME );
      })
      .catch(function(response) {
        console.log( 'logged out' );   
        // Handle errors here, such as displaying a notification
        // for invalid email and/or password.
        alert('invalid login');
      });

  };

  // oAuth login providers:
  $scope.authenticate = function(provider) {
    $auth.authenticate(provider);
  };

  $scope.closeDialog = function() {
    $mdDialog.hide('Sign-in cancelled.');
  }

}])


.controller('TypeCtrl', [ '$mdDialog', function($mdDialog){

  this.lkupConfigurationTypes = [
    {id:'frame only', img:'assets/img/TVFrame200.jpg'},
    {id:'frame with mirror', img:'assets/img/TVMirror200.jpg'},
    {id:'frame with art', img:'assets/img/FrameWithArt200.jpg'},
    {id:'frameless mirror', img:'assets/img/Frameless200.jpg'},
    {id:'metro mirror', img:'assets/img/MetroMirror200.jpg'},
    {id:'metro art', img:'assets/img/MetroArt200.jpg'}
  ];

  this.configuratorTypeClick = function(typeId){
    $mdDialog.hide(typeId);
  }
}])


.controller('ConfigurationsCtrl', [ '$scope', 'sharedScope', '$sce', '$mdDialog', function($scope, sharedScope, $sce, $mdDialog){

  $scope.closeDialog = function() {
    $mdDialog.hide();
  }
}])

.controller('DialogCtrl', [ '$scope', '$sce', '$mdDialog', 'title', 'content', function($scope, $sce, $mdDialog, title, content){
  $scope.title = title;
  $scope.content = $sce.trustAsHtml(content);

  $scope.closeDialog = function() {
    $mdDialog.hide();
  }
}])


.controller('LeftCtrl', [ '$scope', 'sharedScope', '$auth', '$mdSidenav', function($scope, sharedScope, $auth, $mdSidenav){

  $scope.site = sharedScope.site;

  $scope.currentuser = function() {
    return $auth.getPayload();
  };

  $scope.isAuthenticated = function() {
    return $auth.isAuthenticated();
  };
  $scope.isAdmin = function() {
    return ($scope.currentuser.ROLE ="Administrator") ? true : false;
  };
  $scope.isAccountAdmin = function() {
    return ($scope.currentuser.USERID = $scope.site.adminid) ? true : false;
  };
  $scope.isAccountAssociate = function() {
    return ($scope.currentuser.ASSOCIATE = $scope.configuration.meta.account_id) ? true : false;
  };

  $scope.currentusername = function() {
    if( !$auth.isAuthenticated() ) return '';
    var user = $auth.getPayload();
    if( user.NAME.length ) { 
      return user.NAME;
    } else {
      return user.EMAIL;
    }
  };

  $scope.doLogout = function() {
    $auth.logout(); 
  };

  this.close = function () {
    $mdSidenav('left').close()
      .then(function () {
        //console.log('close left');
      });
  };

}])

.controller('BottomSheetCtrl', function ($scope, $mdBottomSheet) {

  $scope.items = [
    { name: 'Save', icon: 'save' },
    { name: 'Print', icon: 'print' },  
    { name: 'Mail', icon: 'mail' },
    { name: 'Pinterest', icon: 'pinterest' },
    { name: 'Facebook', icon: 'facebook' },
    { name: 'Twitter', icon: 'twitter' },
  ];
  $scope.listItemClick = function($index) {
    var clickedItem = $scope.items[$index];
    $mdBottomSheet.hide(clickedItem);
  };
});

