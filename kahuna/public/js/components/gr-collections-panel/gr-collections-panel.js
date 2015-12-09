import angular from 'angular';

import '../../services/panel';
import '../../services/api/collections-api';
import '../../directives/gr-auto-focus';

import './gr-collections-panel.css!';
import nodeTemplate from './gr-collections-panel-node.html!text';

export var grCollectionsPanel = angular.module('grCollectionsPanel', [
    'kahuna.services.panel']);

grCollectionsPanel.controller('GrCollectionsPanelCtrl', [
    'panelService',
    '$rootScope',
    'collections',
    function (panelService, $rootScope, collections) {

    const ctrl = this;
    const panelName = 'gr-collections-panel';

    ctrl.isVisible = false;
    ctrl.error = false;

    panelService.addPanel(panelName, false);
    panelService.available(panelName, true);

    $rootScope.$on(
        `ui:panels:${panelName}:updated`,
        () => {
            ctrl.isVisible = panelService.isVisible(panelName);
        }
    );

    collections.getCollections().then(collections => {
        ctrl.collections = collections.data.children;
    }, () => {
        // TODO: More informative error handling
        // TODO: Stop error propagating to global error handler
        ctrl.error = true;
    }).catch(() => ctrl.error = true);

}]);

grCollectionsPanel.controller('GrNodeCtrl', ['collections', function(collections) {

    const ctrl = this;
    ctrl.deletable = false;
    ctrl.addChild = childName => collections.addChildTo(ctrl.node, childName);
    collections.isDeletable(ctrl.node).then(d => ctrl.deletable = d);

    ctrl.remove = () => collections.removeFromList(ctrl.node, ctrl.nodeList);

}]);


grCollectionsPanel.directive('grAddToCollection', [function() {
    const dragClassName = 'node__info--drag-over';
    return {
        link: function(scope, element) {
            element.on('drop', ev => {
                // TODO add the image(s) to collection
                ev.currentTarget.classList.remove(dragClassName);
            });

            element.on('dragover', ev => {
                ev.currentTarget.classList.add(dragClassName);
            });

            element.on('dragleave', ev => {
                ev.currentTarget.classList.remove(dragClassName);
            });
        }
    };
}]);

grCollectionsPanel.directive('grNode', ['$parse', '$compile', function($parse, $compile) {
    return {
        restrict: 'E',
        scope: {
            node: '=grNode',
            nodeList: '=grNodeList'
        },
        template: nodeTemplate,
        controller: 'GrNodeCtrl',
        controllerAs: 'ctrl',
        bindToController: true,
        link: function(scope, element, attrs, ctrl) {
            if (ctrl.node.data.children.length > 0) {
                // We compile the template on the fly here as angular doesn't deal
                // well with recursive templates.
                $compile(`<gr-nodes class="tree"
                    ng:show="showChildren"
                    gr:nodes="ctrl.node.data.children"></gr-nodes>
                `)(scope, cloned => {
                    element.find('.node__children').append(cloned);
                });
            }

            scope.clearForm = () => {
                scope.active = false;
                scope.childName = '';
            };
        }
    };

}]);

grCollectionsPanel.directive('grNodes', function() {
    return {
        restrict: 'E',
        scope: {
            nodes: '=grNodes'
        },
        template: `<ul>
            <li ng:repeat="node in nodes">
                <gr-node class="node" gr:node="node" gr:node-list="nodes"></gr-node>
            </li>
        </ul>`
    };
});