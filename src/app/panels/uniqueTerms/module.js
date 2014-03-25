/**
 *  Copyright 2014 TangoMe Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
/** @scratch /panels/uniqueTerms/0
 * == uniqueTerms
 * Status: *Beta*
 *
 * Unique terms count based of an Elasticsearch terms facet.
 *
 */
define([
  'angular',
  'app',
  'lodash',
  'jquery',
  'kbn'
],
function (angular, app, _, $, kbn) {
  'use strict';

  var module = angular.module('kibana.panels.uniqueTerms', []);
  app.useModule(module);

  module.controller('uniqueTerms', function($scope, querySrv, dashboard, filterSrv, fields) {
    $scope.panelMeta = {
      modals : [
        {
          description: "Inspect",
          icon: "icon-info-sign",
          partial: "app/partials/inspector.html",
          show: $scope.panel.spyable
        }
      ],
      editorTabs : [
        {title:'Queries', src:'app/partials/querySelect.html'}
      ],
      status  : "Beta",
      description : "Displays the unique terms count"
    };

    // Set and populate defaults
    var _d = {
      /** @scratch /panels/terms/5
       * === Parameters
       *
       * field:: The field on which to computer the facet
       */
      field   : '_type',
      /** @scratch /panels/terms/5
       * exclude:: terms to exclude from the results
       */
      exclude : [],
      /** @scratch /panels/terms/5
       * size:: Show this many terms
       */
      size    : 10,
      /** @scratch /panels/terms/5
       * order:: In terms mode: count, term, reverse_count or reverse_term,
       * in terms_stats mode: term, reverse_term, count, reverse_count,
       * total, reverse_total, min, reverse_min, max, reverse_max, mean or reverse_mean
       */
      order   : 'count',
      style   : { "font-size": '10pt'},
      /** @scratch /panels/terms/5
       * spyable:: Set spyable to false to disable the inspect button
       */
      spyable     : true,
      /** @scratch /panels/terms/5
       * ==== Queries
       * queries object:: This object describes the queries to use on this panel.
       * queries.mode::: Of the queries available, which to use. Options: +all, pinned, unpinned, selected+
       * queries.ids::: In +selected+ mode, which query ids are selected.
       */
      queries     : {
        mode        : 'all',
        ids         : []
      }
    };

    _.defaults($scope.panel,_d);

    $scope.init = function () {
      $scope.hits = 0;

      $scope.$on('refresh',function(){
        $scope.get_data();
      });
      $scope.get_data();

    };

    $scope.get_data = function() {
      // Make sure we have everything for the request to complete
      if(dashboard.indices.length === 0) {
        return;
      }

      $scope.panelMeta.loading = true;
      var request,
        results,
        boolQuery,
        queries;

      $scope.field = _.contains(fields.list,$scope.panel.field+'.raw') ?
        $scope.panel.field+'.raw' : $scope.panel.field;

      request = $scope.ejs.Request().indices(dashboard.indices);

      $scope.panel.queries.ids = querySrv.idsByMode($scope.panel.queries);
      queries = querySrv.getQueryObjs($scope.panel.queries.ids);

      // This could probably be changed to a BoolFilter
      boolQuery = $scope.ejs.BoolQuery();
      _.each(queries,function(q) {
        boolQuery = boolQuery.should(querySrv.toEjsObj(q));
      });

      // Terms mode
      request = request
        .facet($scope.ejs.TermsFacet('terms')
        .field($scope.field)
        .size($scope.panel.size)
        .order($scope.panel.order)
        .exclude($scope.panel.exclude)
        .facetFilter($scope.ejs.QueryFilter(
          $scope.ejs.FilteredQuery(
            boolQuery,
            filterSrv.getBoolFilter(filterSrv.ids)
          )))).size(0);

      request = request.timeout("10m");

      // Populate the inspector panel
      $scope.inspector = angular.toJson(JSON.parse(request.toString()),true);

      results = request.doUnique();

      // Populate scope when we have results
      results.then(function(results) {
        $scope.panelMeta.loading = false;
        $scope.hits = results.facets.terms.total;

        $scope.results = results;

        $scope.$emit('render');
      });
    };

    $scope.set_refresh = function (state) {
      $scope.refresh = state;
    };

    $scope.close_edit = function() {
      if($scope.refresh) {
        $scope.get_data();
      }
      $scope.refresh =  false;
      $scope.$emit('render');
    };

  });

  module.directive('uniqueTermsChart', function() {
    return {
      restrict: 'A',
      link: function(scope, elem) {

        // Receive render events
        scope.$on('render',function(){
          render_panel();
        });

        // Re-render if the window is resized
        angular.element(window).bind('resize', function(){
          render_panel();
        });

        function build_results() {
          scope.data = [];
          scope.data.push({label:'Unique values',
                data:[[0,scope.results.facets.terms.unique]]});
          scope.data.push({label:'Missing field',
            data:[[1,scope.results.facets.terms.missing]],meta:"missing",color:'#aaa',opacity:0});
          scope.data.push({label:'Other values',
            data:[[2,scope.results.facets.terms.other]],meta:"other",color:'#444'});
          scope.data.push({label:'Total',
            data:[[3,scope.hits]]});
        }

        // Function for rendering panel
        function render_panel() {

          build_results();

          // IE doesn't work without this
          elem.css({height:scope.row.height});
        }

        var $tooltip = $('<div>');
        elem.bind("plothover", function (event, pos, item) {
          if (item) {
            var value = item.datapoint[1][0][1];
            $tooltip
              .html(
                kbn.query_color_dot(item.series.color, 20) + ' ' +
                item.series.label + " (" + value.toFixed(0)+")"
              )
              .place_tt(pos.pageX, pos.pageY);
          } else {
            $tooltip.remove();
          }
        });

      }
    };
  });

});
