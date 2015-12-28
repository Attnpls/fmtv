'use strict';

/*  Rules Engine Service */
Application.Services.factory('rulesEngine', function ($timeout, $parse) {
  var rules = [];				                   // holds sorted rules from init
  var current_rule_list = [];
  var current_consequence_list = []; 
  var completion_call_back;		             // execute
  var session = [];	
  var last_session = [];
  var current_rule_index = 0;	             // doit
  var outcome = true;			                 // true if all tests pass
  
  var init = function (ruleSet) {
    rules = ruleSet;
	 
    // Sort rules by priority
    rules = rules.sort(function (a, b) {
      return a.priority - b.priority;
    });	
  };

  
  var execute = function (fact, callBack) {

    //these new attributes have to be in both last session and current session for compare.
    fact['stopRules'] = false;	
    fact['gototab'] = '';				       // used in callback
	
    completion_call_back = callBack;
    session = _.clone(fact);
    last_session = _.clone(fact);
	
    doit(0);
  };

  var doit = function(x) {

    current_rule_index = x;
    
    if (x < rules.length && session.stopRules === false) {

      // skip a rule if off.
  		if( !rules[x].on ){ return doit(x+1); }
  		
   	  outcome = true;
      current_rule_list = _.flatten([rules[x].condition]);
      looprules(0);
    
    } else { 

      // Done. Do callback with session fact
      $timeout(function () {
	  	  delete session.stopRules;
        completion_call_back(session);
      }, 0);
    
    }
  };
	
  var looprules = function(y) {
    if (y < current_rule_list.length) {
      if (typeof current_rule_list[y] === 'string') {
        current_rule_list[y] = $parse(current_rule_list[y]);
      }
      current_rule_list[y].call({}, session, function (out) {
        outcome = outcome && out;					
        $timeout(function () {
          return looprules(y + 1);
        }, 0);
      });
    }
    else {
      if (outcome) {
        current_consequence_list = _.flatten([rules[current_rule_index].consequence]);
        loopconsequence(0);
      }
      else {
        $timeout(function () {
          return doit(current_rule_index + 1);
        }, 0);
      }
    }
  };

  var loopconsequence = function(z) {
    if (z < current_consequence_list.length) {

      if (typeof current_consequence_list[z] === 'string'){
        current_consequence_list[z] = $parse(current_consequence_list[z]);
      }																	
      current_consequence_list[z].apply(session, [function (restart_on_change) {
        restart_on_change = typeof restart_on_change !== 'undefined' ? restart_on_change : true;
		
        if (!_.isEqual(last_session, session) && restart_on_change) {
          last_session = _.clone(session);		
          $timeout(function () {
            return doit(0);
          }, 0);
        }
        else {
          $timeout(function () {
            return loopconsequence(z + 1);
          }, 0);
        }
      }]);
    }
    else {
      $timeout(function () {
        return doit(current_rule_index + 1);
      }, 0);
    }
  };

  var rulesEngine = {
    init: init,
    execute: execute
  };

  return rulesEngine;
});

