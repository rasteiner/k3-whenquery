import runQuery from "./lib/interpreter";

declare namespace panel {
  function plugin(name: string, options: any): void;
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

      function extend(type) {
        const original = Vue.component(type);
        Vue.component(type, {
          extends: original,
          methods: {
            meetsCondition(element) {
              if(!original.options.methods.meetsCondition.call(this, element)) {
                return false;
              }

              if(element.whenQuery) {
                const context = (name) => {
                  //variable names starting with _ refer to the model and not its content
                  if(name[0] === '_') {
                    return modelContainer?.model?.[name.substr(1)];
                  }

                  if(this.value?.[name.toLowerCase()] !== undefined) {
                    //first look if the name exists in a local "value" property
                    return this.value[name.toLowerCase()];
                  } else {
                    //otherwhise look in the global context
                    return this.$store.getters['content/values']()[name.toLowerCase()];
                  }
                };
                return runQuery(context, element.whenQuery);
              }

              return true;
            }
          }
        });
      }

      extend('k-sections');
      extend('k-fieldset');
    }
  ]
});
