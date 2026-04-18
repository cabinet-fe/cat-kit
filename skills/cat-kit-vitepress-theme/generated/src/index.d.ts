import './styles/theme.css';
declare const _default: {
    extends: {
        Layout: import("vue").DefineComponent;
        enhanceApp: (ctx: import("vitepress").EnhanceAppContext) => void;
    };
    Layout: import("vue").DefineComponent<{}, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    enhanceApp({ app }: {
        app: any;
    }): void;
};
export default _default;
export { default as CatKitLayout } from './components/CatKitLayout.vue';
export * from './composables/index.js';
