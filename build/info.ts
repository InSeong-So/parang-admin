import type { Plugin } from 'vite';
import dayjs, { Dayjs } from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { green, blue, bold } from 'picocolors';
import { getPackageSize } from '@pureadmin/utils';
dayjs.extend(duration);

export function viteBuildInfo(): Plugin {
  let config: { command: string };
  let startTime: Dayjs;
  let endTime: Dayjs;
  let outDir: string;
  return {
    name: 'vite:buildInfo',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
      outDir = resolvedConfig.build?.outDir ?? 'dist';
    },
    buildStart() {
      console.log(bold(green(`π μ΄μμ€μΈμ! ${blue("[Parang's Admin]")}`)));
      if (config.command === 'build') {
        startTime = dayjs(new Date());
      }
    },
    closeBundle() {
      if (config.command === 'build') {
        endTime = dayjs(new Date());
        getPackageSize({
          folder: outDir,
          callback: (size: string) => {
            console.log(
              bold(
                green(
                  `πλ²λ€λ§ μλ£(μ΄ μκ°μ ${dayjs
                    .duration(endTime.diff(startTime))
                    .format('mmλΆssμ΄')}, λ²λ€λ§ ν μ¬μ΄μ¦λ${size}οΌ`,
                ),
              ),
            );
          },
        });
      }
    },
  };
}
