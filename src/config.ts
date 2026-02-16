import type {
    ExpressiveCodeConfig,
    LicenseConfig,
    NavBarConfig,
    ProfileConfig,
    SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
    title: "贺煦修的博客",
    subtitle: "", 
    lang: "zh_CN",

    themeColor: {
        hue: 210,
        fixed: false, // 如果以后不想给访客切颜色，改 true
    },

    banner: {
        enable: true,
        src: "/assets/images/bj.webp", // public 目录，部署最稳
        position: "center",
        credit: {
            enable: false,
            text: "",
            url: "",
        },
    },

    toc: {
        enable: true,
        depth: 2,
    },

    favicon: [
        {
            src: "/assets/images/avatar.svg",
            sizes: "128x128",
        },
    ],
};

export const navBarConfig: NavBarConfig = {
    links: [
        LinkPreset.Home,
        LinkPreset.Archive,
        LinkPreset.About,
        {
            name: "GitHub",
            url: "https://github.com/HEXUXIU", 
            external: true,
        },
    ],
};

export const profileConfig: ProfileConfig = {
    avatar: "/assets/images/avatar.svg",
    name: "贺煦修",
    bio: "Hi, 你好",

    links: [
        {
            name: "GitHub",
            icon: "fa6-brands:github",
            url: "https://github.com/HEXUXIU",
        },
        {
            name: "Email",
            icon: "fa6-solid:envelope",
            url: "mailto:hexuiu@gmail.com",
        },
    ],
};

export const licenseConfig: LicenseConfig = {
    enable: true,
    name: "CC BY-NC-SA 4.0",
    url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};
export const expressiveCodeConfig: ExpressiveCodeConfig = {
	theme: "github-dark",
};