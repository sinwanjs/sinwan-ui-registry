type EChartsModuleInstaller = Parameters<typeof import("echarts/core").use>[0];

declare module "echarts/lib/chart/*" {
  export const install: EChartsModuleInstaller;
}

declare module "echarts/lib/component/*" {
  export const install: EChartsModuleInstaller;
}

declare module "echarts-gl/lib/chart/*" {
  export const install: EChartsModuleInstaller;
}

declare module "echarts-gl/lib/component/*" {
  export const install: EChartsModuleInstaller;
}
