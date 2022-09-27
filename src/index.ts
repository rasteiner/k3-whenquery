import runQuery from "./lib/interpreter";

declare namespace panel {
  function plugin(name: string, options: any): void;
  const app: any;
}

panel.plugin('rasteiner/whenquery', {
  use: [
    function(Vue) {
      const modelContainer = Vue.observable({});

      function addModelWatch(type) {
        const options = Vue.component(type).options;
        Vue.component(type, {
          extends: options,
          created() {
            modelContainer.model = this.model;
          },
          watch: {
            model: function(newValue) {
              modelContainer.model = newValue;
            }
          }
        });
      }

      addModelWatch("k-page-view");
      addModelWatch("k-site-view");
      addModelWatch("k-file-view");
      addModelWatch("k-user-view");
      addModelWatch("k-account-view");

      const orig = Vue.prototype.$helper.field.isVisible;

      Vue.prototype.$helper.field.isVisible = function(field, values) {
        if(!orig(field, values)) return false;

        if(field.whenQuery) {
          const context = (name) => {
            //variable names starting with _ refer to the model and not its content
            if(name[0] === '_') {
              return modelContainer?.model?.[name.substr(1)];
            }

            if(values?.[name.toLowerCase()] !== undefined) {
              //first look if the name exists in a local "value" property
              return values[name.toLowerCase()];
            } else {
              //otherwise look in the global context
              return panel?.app?.$store?.getters['content/values']()[name.toLowerCase()];
            }
          };

          return runQuery(context, field.whenQuery);
        }
        return true;
      };
    }
  ]
});
