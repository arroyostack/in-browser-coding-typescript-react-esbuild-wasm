import * as esbuild from 'esbuild-wasm';
import { useEffect, useRef, useState } from "react";
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';
import { fetchPlugin } from './plugins/fetch-plugin';


function App() {
  const ref = useRef<any>();
  const [input, setInput] = useState( '' );
  const [code, setCode] = useState( '' );

  // With 'service.transform' we will transpile user input code and show the result
  const startService = async () => {
    ref.current = await esbuild.startService( {
      worker: true,
      wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm'
    } );
  };

  useEffect( () => {
    startService();
  }, [] );

  const handleClick = async () => {
    if ( !ref.current ) return;

    const result = await ref.current.build( {
      entryPoints: ['index.js'],
      bundle: true,
      write: false,
      plugins: [
        unpkgPathPlugin(),
        fetchPlugin( input )
      ],
      // Define eliminates warnings
      define: {
        'process.env.NODE_ENV': '"production"',
        global: 'window'
      }
    } );

    // console.log( result );

    setCode( result.outputFiles[0].text );
    console.log( eval( result.outputFiles[0].text ) );
  };

  return (
    <div>
      <textarea
        value={ input }
        onChange={ event => setInput( event.target.value ) }
      />

      <div>
        <button
          onClick={ handleClick }
        >Submit</button>
      </div>

      <pre>{ code }</pre>

    </div>
  );
}

export default App;
