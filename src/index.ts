import runQuery from "./lib/interpreter";

declare namespace panel {
  function plugin(name: string, options: any): void;
}

panel.plugin('rasteiner/whenquery', {
  use: [
    function(Vue) {
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
                  const value = this.$store.getters['content/values']()[name];
                  return value
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
