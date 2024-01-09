import * as esbuild from 'esbuild-wasm';
import axios from 'axios';
import localforage from 'localforage';

const fileCache = localforage.createInstance( {
    name: 'filecache'
} );

export const fetchPlugin = ( inputCode: string ) => {
    return {
        name: 'fetch-plugin',
        setup( build: esbuild.PluginBuild ) {
            build.onLoad( { filter: /.*/ }, async ( args: any ) => {
                console.log( 'onLoad', args );

                if ( args.path === 'index.js' ) {
                    return {
                        loader: 'jsx',
                        contents: inputCode
                    };
                }
                // & Check to see if we have already fetched this file.
                // & and if it is in the cache.
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
        }
    };
};