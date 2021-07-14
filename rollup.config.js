import fs from 'fs';
import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import css from 'rollup-plugin-css-only';
import scss from 'rollup-plugin-scss';
import copy from 'rollup-plugin-copy';
import externals from 'rollup-plugin-node-externals';
import pkg from './package.json';

const production = !process.env.ROLLUP_WATCH;

function depPkg(options) {
  return {
    writeBundle() {
      let deps = pkg.dependencies;

      if (options && options.exclude) {
        const depKeys = Object.keys(deps);
        for (const exDep of options.exclude) {
          if (depKeys.includes(exDep)) {
            delete deps[exDep];
          }
        }
      }

      fs.writeFileSync(
        'dist/package.json',
        JSON.stringify({
          main: 'server.js',
          dependencies: deps,
        })
      );
    },
  };
}

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true,
      });

      process.on('SIGTERM', toExit);
      process.on('exit', toExit);
    },
  };
}

export default [
  {
    input: 'src/backend/server.ts',
    output: {
      sourcemap: !production,
      dir: 'dist',
      format: 'cjs',
    },
    plugins: [
      typescript({
        sourceMap: !production,
        tsconfig: 'tsconfig.server.json',
      }),
      copy({
        targets: [{ src: '.env', dest: 'dist' }],
      }),
      depPkg({
        exclude: ['svelte-navigator'],
      }),
      externals({ deps: true }),
    ],
  },
  {
    input: 'src/frontend/main.ts',
    output: {
      sourcemap: !production,
      format: 'iife',
      name: 'app',
      file: 'dist/public/build/bundle.js',
    },
    plugins: [
      svelte({
        preprocess: sveltePreprocess({
          sourceMap: !production,
          scss: {
            prependData: `@import 'src/frontend/styles/variables.scss';`,
          },
        }),
        compilerOptions: {
          // enable run-time checks when not in production
          dev: !production,
          cssHash: ({ hash, css }) => `svelte-${hash(css)}`,
        },
      }),
      // we'll extract any component CSS out into
      // a separate file - better for performance
      css({ output: 'bundle.css' }),
      scss({ output: 'dist/public/build/global.css' }),

      // If you have external dependencies installed from
      // npm, you'll most likely need these plugins. In
      // some cases you'll need additional configuration -
      // consult the documentation for details:
      // https://github.com/rollup/plugins/tree/master/packages/commonjs
      resolve({
        browser: true,
        dedupe: ['svelte'],
      }),
      commonjs(),
      typescript({
        sourceMap: !production,
        inlineSources: !production,
      }),

      copy({
        targets: [{ src: 'static/**/*', dest: 'dist/public' }],
        copyOnce: true,
      }),

      // In dev mode, call `npm run start` once
      // the bundle has been generated
      !production && serve(),

      // Watch the `public` directory and refresh the
      // browser on changes when not in production
      !production && livereload('dist/public'),

      // If we're building for production (npm run build
      // instead of npm run dev), minify
      production && terser(),
    ],
    watch: {
      clearScreen: false,
    },
  },
];
