  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

// Replace tracking code with the appropriate one for your course.
  ga('create', 'UA-85477958-1', 'auto');
  ga('send', 'pageview');

(function () {
 // Improve performance by mapping IDs
  var subContentIdToLibraryMap = {};

  /**
   * Look through params to find library name.
   *
   * @private
   * @param {number} id
   * @param {object} params
   */
  function findSubContentLibrary(id, params) {
    for (var prop in params) {
      if (!params.hasOwnProperty(prop)) {
        continue;
      }

      if (prop === 'subContentId' && params[prop] === id) {
        return params.library; // Found it
      }
      else if (typeof params[prop] === 'object') {
        // Look in next level
        var result = findSubContentLibrary(id, params[prop]);
        if (result) {
          return result;
        }
      }
    }
  }

  if (window.H5P) {
    H5P.jQuery(window).on('ready', function () {
      H5P.externalDispatcher.on('xAPI', function (event) {
        try {
          if (!window.parent.ga) {
            return;
          if (!window.parent.ga) {
            return;
          }

          // First we need to find the category.
          var category;

          // Determine content IDs
          var contentId = event.data.statement.object.definition.extensions['http://h5p.org/x-api/h5p-local-content-id'];
          var subContentId = event.data.statement.object.definition.extensions['http://h5p.org/x-api/h5p-subContentId'];

          if (subContentId) {
            if (subContentIdToLibraryMap[subContentId]) {
              // Fetch from cache
              category = subContentIdToLibraryMap[subContentId];
            }
            else {
              // Find
              category = findSubContentLibrary(subContentId, JSON.parse(H5PIntegration.contents['cid-' + contentId].jsonContent));
              if (!category) {
                return; // No need to continue
                // TODO: Remember that it wasnt found?
              }

              // Remember for next time
              subContentIdToLibraryMap[subContentId] = category;
            }
          }
          else {
            // Use main content library
            category = H5PIntegration.contents['cid-' + contentId].library;
          }

          // Strip version number
          category = category.split(' ', 2)[0];

          // Next we need to determine the action.
          var action = event.getVerb();

          // Now we need to find an unique label
          var label = event.data.statement.object.definition.name['en-US']; // Title
          // Add contentID to make it eaiser to find
          label += ' (' + contentId;
          if (subContentId) {
            label += ' ' + subContentId;
          if (subContentId) {
            label += ' ' + subContentId;
          }
          label += ')';

          // Find value
          var value;

          // Use result if possible
          var result = event.data.statement.result;
          if (result) {
            // Calculate percentage
            value = result.score.raw / ((result.score.max - result.score.min) / 100);
          }

          // ... or slide number
          if (action === 'Progressed') {
            var progress = event.data.statement.object.definition.extensions['http://id.tincanapi.com/extension/ending-point'];
            if (progress) {
              value = progress;
            }
          }

          // Validate number
          value = Number(value);
          if (isNaN(value)) {
            value = undefined;
          }

          window.parent.ga('send', 'event', category, action, label, value);
        }
        catch (err) {
          // No error handling
        }
      });
    });
  }
})();
