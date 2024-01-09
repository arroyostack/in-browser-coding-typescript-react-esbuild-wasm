import axios from 'axios';
import * as esbuild from 'esbuild-wasm';
// Localforage allow to work easily with indexDB
import localforage from 'localforage';

const fileCache = localforage.createInstance( {
  name: 'filecache'
} );

export const unpkgPathPlugin = ( inputCode: string ) => {
  return {
    name: 'unpkg-path-plugin',
    setup( build: esbuild.PluginBuild ) {
      build.onResolve( { filter: /.*/ }, async ( args: any ) => {
        // console.log( 'onResolve', args );
        if ( args.path === 'index.js' ) {
          return { path: args.path, namespace: 'a' };
        }
        // Nested paths.
        if ( args.path.includes( './' ) || args.path.includes( '../' ) ) {
          return {
            namespace: 'a',
            path: new URL(
              args.path,
              'https://unpkg.com' + args.resolveDir + '/'
            ).href
          };
        }
        return {
          namespace: 'a',
          path: `https://unpkg.com/${args.path}`
        };

      } );

      build.onLoad( { filter: /.*/ }, async ( args: any ) => {
        console.log( 'onLoad', args );

        if ( args.path === 'index.js' ) {
          return {
            loader: 'jsx',
            contents: inputCode
          };
        }
        // Check to see if we have already fetched this file.
        // and if it is in the cache.
        const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>( args.path );
        if ( cachedResult ) {
          // If it is return it inmediately.
          return cachedResult;
        }
        // Otherwise let request to happen
        const { data, request } = await axios.get( args.path );
        // console.log( new URL( "./", request.responseURL ).pathname );
        const result: esbuild.OnLoadResult = {
          loader: 'jsx',
          contents: data,
          resolveDir: new URL( './', request.responseURL ).pathname
        };
        // Store response on chache.
        await fileCache.setItem( args.path, result );

        return result;
      } );
    },
  };
};
